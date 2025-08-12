package io.morningowl.dicomcraft.service;

import io.morningowl.dicomcraft.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.data.Sequence;
import org.dcm4che3.data.Tag;
import org.dcm4che3.data.VR;
import org.dcm4che3.io.DicomOutputStream;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Slf4j
@Service
public class DicomGenerationService {

    public DicomGenerationResponse generateDicomFile(DicomGenerationRequest request) {
        try {
            // Attributes 객체 생성
            Attributes attributes = new Attributes();
            
            // 기본 DICOM 메타데이터 설정
            setDefaultDicomMetadata(attributes);
            
            // 요청된 태그들 추가
            if (request.getTags() != null) {
                for (DicomTagRequest tagRequest : request.getTags()) {
                    addTagToAttributes(attributes, tagRequest);
                }
            }
            
            // 픽셀 데이터 추가
            if (request.getPixelData() != null) {
                addPixelDataToAttributes(attributes, request.getPixelData());
            }
            
            // DICOM 파일 생성
            byte[] dicomBytes = createDicomFile(attributes);
            
            return DicomGenerationResponse.builder()
                    .fileName(generateFileName())
                    .generatedDicomBase64(Base64.getEncoder().encodeToString(dicomBytes))
                    .generationStatus("SUCCESS")
                    .fileSize(dicomBytes.length)
                    .build();
                    
        } catch (Exception e) {
            log.error("DICOM 파일 생성 중 오류 발생: {}", e.getMessage(), e);
            return DicomGenerationResponse.builder()
                    .fileName("generated.dcm")
                    .generationStatus("ERROR")
                    .errorMessage("DICOM 파일 생성 실패: " + e.getMessage())
                    .build();
        }
    }

    private String generateFileName() {
        return "dicom_" + System.currentTimeMillis() + ".dcm";
    }

    private void setDefaultDicomMetadata(Attributes attributes) {
        // 필수 DICOM 메타데이터 설정
        attributes.setString(Tag.FileMetaInformationGroupLength, VR.UL, "0");
        attributes.setBytes(Tag.FileMetaInformationVersion, VR.OB, new byte[]{0, 1});
        attributes.setString(Tag.MediaStorageSOPClassUID, VR.UI, "1.2.840.10008.5.1.4.1.1.2"); // CT Image Storage
        attributes.setString(Tag.MediaStorageSOPInstanceUID, VR.UI, generateUID());
        attributes.setString(Tag.TransferSyntaxUID, VR.UI, "1.2.840.10008.1.2"); // Implicit VR Little Endian
        attributes.setString(Tag.ImplementationClassUID, VR.UI, "1.2.826.0.1.3680043.8.498.1");
        attributes.setString(Tag.ImplementationVersionName, VR.SH, "DICOMCRAFT");
        attributes.setString(Tag.SourceApplicationEntityTitle, VR.AE, "DICOMCRAFT");
        
        // SOP Class 및 Instance UID 설정
        attributes.setString(Tag.SOPClassUID, VR.UI, "1.2.840.10008.5.1.4.1.1.2");
        attributes.setString(Tag.SOPInstanceUID, VR.UI, generateUID());
    }
    
    private void addTagToAttributes(Attributes attributes, DicomTagRequest tagRequest) {
        try {
            // 태그 번호 파싱
            int tag = parseTagNumber(tagRequest.getTagNumber());
            VR vr = VR.valueOf(tagRequest.getVr());
            
            // 값 설정
            setTagValue(attributes, tag, vr, tagRequest.getValue());
            
            // Sequence 태그인 경우 하위 아이템들 처리
            if (vr == VR.SQ && tagRequest.getChildren() != null && !tagRequest.getChildren().isEmpty()) {
                addSequenceItems(attributes, tag, tagRequest.getChildren());
            }
            
        } catch (Exception e) {
            log.warn("태그 {} 추가 중 오류: {}", tagRequest.getTagNumber(), e.getMessage());
        }
    }
    
    private void setTagValue(Attributes attributes, int tag, VR vr, Object value) {
        if (value == null) return;
        
        try {
            switch (vr) {
                case AE:
                case AS:
                case CS:
                case DA:
                case DS:
                case DT:
                case IS:
                case LO:
                case LT:
                case PN:
                case SH:
                case ST:
                case TM:
                case UI:
                case UT:
                    attributes.setString(tag, vr, value.toString());
                    break;
                case AT:
                    // AT 태그는 특별 처리 필요
                    break;
                case FL:
                    if (value instanceof Number) {
                        attributes.setFloat(tag, vr, ((Number) value).floatValue());
                    }
                    break;
                case FD:
                    if (value instanceof Number) {
                        attributes.setDouble(tag, vr, ((Number) value).doubleValue());
                    }
                    break;
                case SL:
                    if (value instanceof Number) {
                        attributes.setInt(tag, vr, ((Number) value).intValue());
                    }
                    break;
                case SS:
                    if (value instanceof Number) {
                        attributes.setInt(tag, vr, ((Number) value).intValue());
                    }
                    break;
                case UL:
                    if (value instanceof Number) {
                        attributes.setLong(tag, vr, ((Number) value).longValue());
                    }
                    break;
                case US:
                    if (value instanceof Number) {
                        attributes.setInt(tag, vr, ((Number) value).intValue());
                    }
                    break;
                case OB:
                case OD:
                case OF:
                case OL:
                case OV:
                case OW:
                case UN:
                    if (value instanceof String) {
                        // Base64 디코딩
                        byte[] bytes = Base64.getDecoder().decode(value.toString());
                        attributes.setBytes(tag, vr, bytes);
                    }
                    break;
                default:
                    attributes.setString(tag, vr, value.toString());
            }
        } catch (Exception e) {
            log.warn("태그 값 설정 중 오류: {}", e.getMessage());
        }
    }
    
    private void addSequenceItems(Attributes attributes, int tag, java.util.List<DicomSequenceItemRequest> items) {
        try {
            Sequence sequence = attributes.newSequence(tag, items.size());
            
            for (DicomSequenceItemRequest itemRequest : items) {
                Attributes itemAttributes = new Attributes();
                
                if (itemRequest.getTags() != null) {
                    for (DicomTagRequest tagRequest : itemRequest.getTags()) {
                        addTagToAttributes(itemAttributes, tagRequest);
                    }
                }
                
                sequence.add(itemAttributes);
            }
        } catch (Exception e) {
            log.warn("Sequence 아이템 추가 중 오류: {}", e.getMessage());
        }
    }
    
    private void addPixelDataToAttributes(Attributes attributes, DicomPixelDataRequest pixelDataRequest) {
        try {
            // 픽셀 관련 태그들 설정
            attributes.setInt(Tag.Rows, VR.US, pixelDataRequest.getHeight());
            attributes.setInt(Tag.Columns, VR.US, pixelDataRequest.getWidth());
            attributes.setInt(Tag.BitsAllocated, VR.US, pixelDataRequest.getBitsAllocated());
            attributes.setInt(Tag.BitsStored, VR.US, pixelDataRequest.getBitsStored());
            attributes.setInt(Tag.SamplesPerPixel, VR.US, pixelDataRequest.getSamplesPerPixel());
            attributes.setString(Tag.PhotometricInterpretation, VR.CS, pixelDataRequest.getPhotometricInterpretation());
            attributes.setString(Tag.PixelRepresentation, VR.US, pixelDataRequest.getPixelRepresentation());
            
            // 픽셀 데이터 설정
            if (pixelDataRequest.getPixelDataBase64() != null && !pixelDataRequest.getPixelDataBase64().isEmpty()) {
                byte[] pixelData = Base64.getDecoder().decode(pixelDataRequest.getPixelDataBase64());
                attributes.setBytes(Tag.PixelData, VR.OW, pixelData);
            }
            
        } catch (Exception e) {
            log.warn("픽셀 데이터 추가 중 오류: {}", e.getMessage());
        }
    }
    
    private byte[] createDicomFile(Attributes attributes) throws IOException {
        // 임시 파일을 생성하여 DICOM 파일 작성
        java.io.File tempFile = java.io.File.createTempFile("dicom", ".dcm");
        try (DicomOutputStream dos = new DicomOutputStream(tempFile)) {
            dos.writeDataset(attributes.createFileMetaInformation("1.2.840.10008.1.2"), attributes);
        }
        
        // 파일을 바이트 배열로 읽기
        byte[] fileBytes = java.nio.file.Files.readAllBytes(tempFile.toPath());
        
        // 임시 파일 삭제
        tempFile.delete();
        
        return fileBytes;
    }
    
    private int parseTagNumber(String tagNumber) {
        // "(0010,0010)" 형식을 정수로 변환
        String cleanTag = tagNumber.replaceAll("[()\\s]", "");
        String[] parts = cleanTag.split(",");
        if (parts.length == 2) {
            int group = Integer.parseInt(parts[0], 16);
            int element = Integer.parseInt(parts[1], 16);
            return (group << 16) | element;
        }
        throw new IllegalArgumentException("Invalid tag number format: " + tagNumber);
    }
    
    private String generateUID() {
        // 간단한 UID 생성 (실제로는 더 복잡한 로직 필요)
        return "1.2.826.0.1.3680043.8.498." + System.currentTimeMillis();
    }
}
