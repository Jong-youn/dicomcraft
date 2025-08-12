package io.morningowl.dicomcraft.service;

import io.morningowl.dicomcraft.dto.DicomAnalysisResponse;
import io.morningowl.dicomcraft.dto.DicomPixelData;
import io.morningowl.dicomcraft.dto.DicomSequenceItem;
import io.morningowl.dicomcraft.dto.DicomTag;
import lombok.extern.slf4j.Slf4j;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.data.ElementDictionary;
import org.dcm4che3.data.Sequence;
import org.dcm4che3.data.Tag;
import org.dcm4che3.data.VR;
import org.dcm4che3.io.DicomInputStream;
import org.dcm4che3.util.TagUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Slf4j
@Service
public class DicomAnalysisService {

    public DicomAnalysisResponse analyzeDicomFile(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            
            // DICOM 파일 파싱
            try (DicomInputStream dis = new DicomInputStream(new ByteArrayInputStream(fileBytes))) {
                Attributes attributes = dis.readDataset();
                
                // 태그 정보 추출
                List<DicomTag> tags = extractDicomTags(attributes);
                
                // 픽셀 데이터 추출
                DicomPixelData pixelData = extractPixelData(attributes);
                
                return DicomAnalysisResponse.builder()
                        .fileName(file.getOriginalFilename())
                        .tags(tags)
                        .pixelData(pixelData)
                        .analysisStatus("SUCCESS")
                        .build();
                        
            } catch (Exception e) {
                log.error("DICOM 파일 분석 중 오류 발생: {}", e.getMessage(), e);
                return DicomAnalysisResponse.builder()
                        .fileName(file.getOriginalFilename())
                        .analysisStatus("ERROR")
                        .errorMessage("DICOM 파일 분석 실패: " + e.getMessage())
                        .build();
            }
            
        } catch (IOException e) {
            log.error("파일 읽기 중 오류 발생: {}", e.getMessage(), e);
            return DicomAnalysisResponse.builder()
                    .fileName(file.getOriginalFilename())
                    .analysisStatus("ERROR")
                    .errorMessage("파일 읽기 실패: " + e.getMessage())
                    .build();
        }
    }
    
    private List<DicomTag> extractDicomTags(Attributes attributes) {
        List<DicomTag> tags = new ArrayList<>();
        
        // 모든 태그를 순회하면서 정보 추출
        for (int tag : attributes.tags()) {
            try {
                VR vr = attributes.getVR(tag);
                Object value = getTagValue(attributes, tag, vr);
                String tagName = getTagName(attributes, tag);
                String vrDescription = getVrDescription(vr); // 클라이언트 구현 후 삭제예정
                
                DicomTag.DicomTagBuilder builder = DicomTag.builder()
                        .id(String.format("(%04X,%04X)", (tag >>> 16) & 0xFFFF, tag & 0xFFFF))
                        .name(tagName)
                        .vr(vr.toString())
                        .vrDescription(vrDescription)
                        .value(value);
                
                // Sequence 태그인 경우 하위 아이템들 처리
                if (vr == VR.SQ) {
                    List<DicomSequenceItem> sequenceItems = extractSequenceItems(attributes, tag);
                    if (sequenceItems != null && !sequenceItems.isEmpty()) {
                        builder.children(sequenceItems);
                    }
                }

                DicomTag dicomTag = builder.build();

                tags.add(dicomTag);

            } catch (Exception e) {
                log.warn("태그 {} 처리 중 오류: {}", String.format("(%04X,%04X)", (tag >>> 16) & 0xFFFF, tag & 0xFFFF), e.getMessage());
            }
        }

        return tags;
    }
    
    private List<DicomSequenceItem> extractSequenceItems(Attributes attributes, int tag) {
        try {
            Sequence sequence = attributes.getSequence(tag);
            if (sequence == null || sequence.isEmpty()) {
                return null;
            }
            
            List<DicomSequenceItem> items = new ArrayList<>();
            
            for (int i = 0; i < sequence.size(); i++) {
                Attributes itemAttributes = sequence.get(i);
                List<DicomTag> itemTags = extractDicomTags(itemAttributes); // 재귀 호출

                DicomSequenceItem item = DicomSequenceItem.builder()
                        .itemNumber(i + 1)
                        .tags(itemTags)
                        .build();
                        
                items.add(item);
            }
            
            return items;
            
        } catch (Exception e) {
            log.error("Sequence 아이템 추출 중 오류: {}", e.getMessage(), e);
            return null;
        }
    }
    
    private Object getTagValue(Attributes attributes, int tag, VR vr) {
        try {
            // VR 타입에 따라 적절한 방법으로 값 추출
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
                    return attributes.getString(tag);
                case AT:
                    int[] atValues = attributes.getInts(tag);
                    if (atValues != null && atValues.length > 0) {
                        return String.format("(%04X,%04X)", (atValues[0] >>> 16) & 0xFFFF, atValues[0] & 0xFFFF);
                    }
                    return null;
                case FL:
                    float[] floats = attributes.getFloats(tag);
                    return floats != null && floats.length > 0 ? floats[0] : null;
                case FD:
                    double[] doubles = attributes.getDoubles(tag);
                    return doubles != null && doubles.length > 0 ? doubles[0] : null;
                case SL:
                    int[] ints = attributes.getInts(tag);
                    return ints != null && ints.length > 0 ? ints[0] : null;
                case SS:
                    int[] shorts = attributes.getInts(tag);
                    return shorts != null && shorts.length > 0 ? shorts[0] : null;
                case UL:
                    long[] longs = attributes.getLongs(tag);
                    return longs != null && longs.length > 0 ? longs[0] : null;
                case US:
                    int[] unsignedShorts = attributes.getInts(tag);
                    return unsignedShorts != null && unsignedShorts.length > 0 ? unsignedShorts[0] : null;
                case OB:
                case OD:
                case OF:
                case OL:
                case OV:
                case OW:
                case UN:
                    // Binary data - 크기만 반환
                    byte[] bytes = attributes.getBytes(tag);
                    return bytes != null ? "Binary data (" + bytes.length + " bytes)" : null;
                case SQ:
                    // Sequence - 시퀀스 아이템 수 반환
                    Sequence seq = attributes.getSequence(tag);
                    return seq != null ? "Sequence with " + seq.size() + " items" : "Empty sequence";
                default:
                    return attributes.getString(tag);
            }
        } catch (Exception e) {
            log.warn("태그 값 추출 중 오류: {}", e.getMessage());
            return "Error extracting value";
        }
    }
    
    private String getTagName(Attributes attributes, int tag) {
        try {
            // TagUtils를 사용해서 태그의 문자열 표현 가져오기
            String tagString = TagUtils.toString(tag);
            if (tagString != null && tagString.contains(")")) {
                // "Patient Name (0010,0010)" 형식에서 이름 부분만 추출
                int parenIndex = tagString.lastIndexOf(" (");
                if (parenIndex > 0) {
                    return tagString.substring(0, parenIndex);
                }
            }
            
            // dcm4che의 표준 DICOM 사전에서 키워드 가져오기
            String keyword = ElementDictionary.keywordOf(tag, null);
            if (keyword != null && !keyword.isEmpty()) {
                return keyword;
            }
            
            // Private tag인 경우 Private Creator 정보 가져오기
            if (TagUtils.isPrivateTag(tag)) {
                String privateCreator = attributes.getPrivateCreator(tag);
                if (privateCreator != null && !privateCreator.isEmpty()) {
                    return String.format("Private Tag [%s]", privateCreator);
                } else {
                    return String.format("Private Tag %04X%04X", (tag >>> 16) & 0xFFFF, tag & 0xFFFF);
                }
            }
            
            // 둘 다 없는 경우 기본 태그 번호 형식으로 반환
            return String.format("Tag%04X%04X", (tag >>> 16) & 0xFFFF, tag & 0xFFFF);
            
        } catch (Exception e) {
            log.warn("태그 이름 조회 중 오류: {}", e.getMessage());
            return String.format("Tag%04X%04X", (tag >>> 16) & 0xFFFF, tag & 0xFFFF);
        }
    }
    
    private String getVrDescription(VR vr) {
        switch (vr) {
            case AE: return "Application Entity - 애플리케이션 엔티티 이름 (최대 16자)";
            case AS: return "Age String - 나이 문자열 (형식: nnnD, nnnW, nnnM, nnnY)";
            case AT: return "Attribute Tag - 속성 태그 (4바이트)";
            case CS: return "Code String - 코드 문자열 (대문자, 공백, 밑줄만 허용)";
            case DA: return "Date - 날짜 (형식: YYYYMMDD)";
            case DS: return "Decimal String - 십진수 문자열 (부동소수점)";
            case DT: return "Date Time - 날짜시간 (형식: YYYYMMDDHHMMSS.FFFFFF)";
            case FL: return "Floating Point Single - 32비트 부동소수점";
            case FD: return "Floating Point Double - 64비트 부동소수점";
            case IS: return "Integer String - 정수 문자열";
            case LO: return "Long String - 긴 문자열 (최대 64자)";
            case LT: return "Long Text - 긴 텍스트 (최대 10240자)";
            case OB: return "Other Byte - 기타 바이트 (8비트)";
            case OD: return "Other Double - 기타 더블 (64비트)";
            case OF: return "Other Float - 기타 플로트 (32비트)";
            case OL: return "Other Long - 기타 롱 (32비트)";
            case OV: return "Other Very Long - 기타 매우 긴 (64비트)";
            case OW: return "Other Word - 기타 워드 (16비트)";
            case PN: return "Person Name - 사람 이름 (형식: Last^First^Middle^Prefix^Suffix)";
            case SH: return "Short String - 짧은 문자열 (최대 16자)";
            case SL: return "Signed Long - 부호 있는 32비트 정수";
            case SQ: return "Sequence - 시퀀스 (중첩된 데이터셋)";
            case SS: return "Signed Short - 부호 있는 16비트 정수";
            case ST: return "Short Text - 짧은 텍스트 (최대 1024자)";
            case TM: return "Time - 시간 (형식: HHMMSS.FFFFFF)";
            case UC: return "Unlimited Characters - 무제한 문자";
            case UI: return "Unique Identifier - 고유 식별자 (UID)";
            case UL: return "Unsigned Long - 부호 없는 32비트 정수";
            case UN: return "Unknown - 알 수 없음 (바이너리 데이터)";
            case UR: return "Universal Resource - 범용 리소스 (URL)";
            case US: return "Unsigned Short - 부호 없는 16비트 정수";
            case UT: return "Unlimited Text - 무제한 텍스트";
            case UV: return "Unsigned Very Long - 부호 없는 64비트 정수";
            default: return "Unknown VR - 알 수 없는 값 표현";
        }
    }
    
    private DicomPixelData extractPixelData(Attributes attributes) {
        try {
            DicomPixelData.DicomPixelDataBuilder builder = DicomPixelData.builder();
            
            // 이미지 크기 정보
            builder.width(attributes.getInt(Tag.Columns, 0));
            builder.height(attributes.getInt(Tag.Rows, 0));
            
            // 픽셀 정보
            builder.bitsAllocated(attributes.getInt(Tag.BitsAllocated, 0));
            builder.bitsStored(attributes.getInt(Tag.BitsStored, 0));
            builder.samplesPerPixel(attributes.getInt(Tag.SamplesPerPixel, 1));
            builder.photometricInterpretation(attributes.getString(Tag.PhotometricInterpretation, "UNKNOWN"));
            builder.pixelRepresentation(String.valueOf(attributes.getInt(Tag.PixelRepresentation, 0)));
            
            // 픽셀 데이터 추출
            byte[] pixelData = attributes.getBytes(Tag.PixelData);
            if (pixelData != null && pixelData.length > 0) {
                // Base64로 인코딩 (큰 픽셀 데이터의 경우 메모리 사용량 고려)
                if (pixelData.length <= 1024 * 1024) { // 1MB 이하만 Base64 인코딩
                    String pixelDataBase64 = Base64.getEncoder().encodeToString(pixelData);
                    builder.pixelDataBase64(pixelDataBase64);
                } else {
                    builder.pixelDataBase64("Pixel data too large for Base64 encoding (" + pixelData.length + " bytes)");
                }
                builder.hasPixelData(true);
            } else {
                builder.hasPixelData(false);
            }
            
            return builder.build();
            
        } catch (Exception e) {
            log.error("픽셀 데이터 추출 중 오류: {}", e.getMessage(), e);
            return DicomPixelData.builder()
                    .hasPixelData(false)
                    .build();
        }
    }
}