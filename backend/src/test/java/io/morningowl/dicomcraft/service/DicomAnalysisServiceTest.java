package io.morningowl.dicomcraft.service;

import io.morningowl.dicomcraft.dto.DicomAnalysisResponse;
import io.morningowl.dicomcraft.dto.DicomTag;
import io.morningowl.dicomcraft.dto.DicomPixelData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

@ExtendWith(MockitoExtension.class)
class DicomAnalysisServiceTest {

    @InjectMocks
    private DicomAnalysisService dicomAnalysisService;

    // =================== 성공 케이스 테스트 ===================
    
    @Test
    void analyzeDicomFile_should_return_success_response_with_valid_dicom() throws IOException {
        // Given: 유효한 DICOM 파일
        byte[] validDicomBytes = createValidDicomBytes();
        MultipartFile dicomFile = new MockMultipartFile(
            "dicom", "test.dcm", "application/dicom", validDicomBytes);
        
        // When: 분석 실행
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(dicomFile);
        
        // Then: 성공 응답 검증 (public 메서드의 전체 동작 검증)
        assertThat(response.getAnalysisStatus()).isEqualTo("SUCCESS");
        assertThat(response.getFileName()).isEqualTo("test.dcm");
        assertThat(response.getTags()).isNotEmpty();
        assertThat(response.getErrorMessage()).isNull();
    }

    @Test
    void analyzeDicomFile_should_extract_patient_information_correctly() throws IOException {
        // Given: 환자 정보가 포함된 DICOM 파일
        byte[] dicomWithPatientInfo = createDicomWithPatientInfo("John^Doe", "19900101", "M");
        MultipartFile dicomFile = new MockMultipartFile(
            "dicom", "patient.dcm", "application/dicom", dicomWithPatientInfo);
        
        // When
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(dicomFile);
        
        // Then: extractDicomTags() private 메서드의 동작을 간접적으로 검증
        Optional<DicomTag> patientNameTag = response.getTags().stream()
            .filter(tag -> tag.getName().contains("PatientName") || tag.getId().equals("(0010,0010)"))
            .findFirst();
            
        assertThat(patientNameTag).isPresent();
        assertThat(patientNameTag.get().getValue()).isEqualTo("John^Doe");
    }

    @Test
    void analyzeDicomFile_should_extract_pixel_data_information() throws IOException {
        // Given: 픽셀 데이터가 있는 DICOM 파일
        byte[] dicomWithPixels = createDicomWithPixelData(512, 512, 16);
        MultipartFile dicomFile = new MockMultipartFile(
            "dicom", "image.dcm", "application/dicom", dicomWithPixels);
        
        // When
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(dicomFile);
        
        // Then: extractPixelData() private 메서드의 동작을 간접적으로 검증
        DicomPixelData pixelData = response.getPixelData();
        assertThat(pixelData).isNotNull();
        assertThat(pixelData.getWidth()).isEqualTo(512);
        assertThat(pixelData.getHeight()).isEqualTo(512);
        assertThat(pixelData.getBitsAllocated()).isEqualTo(16);
        assertThat(pixelData.isHasPixelData()).isTrue();
    }

    @Test
    void analyzeDicomFile_should_handle_sequence_tags_correctly() throws IOException {
        // Given: Sequence 태그가 있는 DICOM 파일
        byte[] dicomWithSequence = createDicomWithSequenceTag();
        MultipartFile dicomFile = new MockMultipartFile(
            "dicom", "sequence.dcm", "application/dicom", dicomWithSequence);
        
        // When
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(dicomFile);
        
        // Then: extractSequenceItems() private 메서드의 동작을 간접적으로 검증
        Optional<DicomTag> sequenceTag = response.getTags().stream()
            .filter(tag -> "SQ".equals(tag.getVr()) && tag.getChildren() != null)
            .findFirst();
            
        assertThat(sequenceTag).isPresent();
        assertThat(sequenceTag.get().getChildren()).isNotEmpty();
    }

    // =================== 에러 케이스 테스트 ===================
    
    @Test
    void analyzeDicomFile_should_return_error_when_file_read_fails() throws IOException {
        // Given: 파일 읽기가 실패하는 MultipartFile
        MultipartFile faultyFile = new MockMultipartFile("dicom", "error.dcm", "application/dicom", (byte[]) null) {
            @Override
            public byte[] getBytes() throws IOException {
                throw new IOException("File read error");
            }
        };
        
        // When
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(faultyFile);
        
        // Then: 에러 핸들링 검증
        assertThat(response.getAnalysisStatus()).isEqualTo("ERROR");
        assertThat(response.getErrorMessage()).contains("파일 읽기 실패");
        assertThat(response.getTags()).isNull();
    }

    @Test
    void analyzeDicomFile_should_return_error_when_dicom_parsing_fails() throws IOException {
        // Given: 잘못된 형식의 DICOM 파일
        byte[] invalidDicomBytes = "This is not a DICOM file".getBytes();
        MultipartFile invalidDicomFile = new MockMultipartFile(
            "dicom", "invalid.dcm", "application/dicom", invalidDicomBytes);
        
        // When
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(invalidDicomFile);
        
        // Then
        assertThat(response.getAnalysisStatus()).isEqualTo("ERROR");
        assertThat(response.getErrorMessage()).contains("DICOM 파일 분석 실패");
    }

    // =================== 경계값 테스트 ===================
    
    @Test
    void analyzeDicomFile_should_handle_large_pixel_data_correctly() throws IOException {
        // Given: 1MB 이상의 큰 픽셀 데이터
        byte[] largeDicomFile = createDicomWithLargePixelData();
        MultipartFile dicomFile = new MockMultipartFile(
            "dicom", "large.dcm", "application/dicom", largeDicomFile);
        
        // When
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(dicomFile);
        
        // Then: extractPixelData() 내부의 크기 제한 로직 검증
        DicomPixelData pixelData = response.getPixelData();
        assertThat(pixelData.getPixelDataBase64())
            .contains("Pixel data too large for Base64 encoding");
    }

    @Test
    void analyzeDicomFile_should_handle_private_tags_correctly() throws IOException {
        // Given: Private 태그가 있는 DICOM 파일
        byte[] dicomWithPrivateTags = createDicomWithPrivateTags();
        MultipartFile dicomFile = new MockMultipartFile(
            "dicom", "private.dcm", "application/dicom", dicomWithPrivateTags);
        
        // When
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(dicomFile);
        
        // Then: getTagName() 내부의 Private Tag 처리 로직 검증
        boolean hasPrivateTag = response.getTags().stream()
            .anyMatch(tag -> tag.getName().contains("Private Tag"));
            
        assertThat(hasPrivateTag).isTrue();
    }

    // =================== 데이터 타입별 테스트 ===================
    
    @Test
    void analyzeDicomFile_should_handle_different_vr_types_correctly() throws IOException {
        // Given: 다양한 VR 타입을 가진 DICOM 파일
        byte[] dicomWithVariousVR = createDicomWithVariousVRTypes();
        MultipartFile dicomFile = new MockMultipartFile(
            "dicom", "various_vr.dcm", "application/dicom", dicomWithVariousVR);
        
        // When
        DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(dicomFile);
        
        // Then: getTagValue() 내부의 다양한 VR 처리 로직 검증
        assertThat(response.getTags()).extracting("vr")
            .contains("PN", "DA", "TM", "IS", "DS", "CS");
    }

    // =================== Helper Methods ===================
    
    private byte[] createValidDicomBytes() {
        // 실제 DICOM 파일 생성 로직
        // 테스트용 최소한의 DICOM 구조 생성
        return new byte[]{
            // DICOM File Meta Information
            'D', 'I', 'C', 'M',
            // ... 기본 DICOM 헤더 구조
        };
    }

    private byte[] createDicomWithPatientInfo(String name, String birthDate, String sex) {
        // 환자 정보가 포함된 테스트 DICOM 파일 생성
        return new byte[0]; // 실제 구현 필요
    }

    private byte[] createDicomWithPixelData(int width, int height, int bitsAllocated) {
        // 픽셀 데이터가 있는 테스트 DICOM 파일 생성
        return new byte[0]; // 실제 구현 필요
    }

    private byte[] createDicomWithSequenceTag() {
        // Sequence 태그가 있는 테스트 DICOM 파일 생성
        return new byte[0]; // 실제 구현 필요
    }

    private byte[] createDicomWithLargePixelData() {
        // 1MB 이상의 픽셀 데이터를 가진 테스트 파일
        return new byte[0]; // 실제 구현 필요
    }

    private byte[] createDicomWithPrivateTags() {
        // Private 태그가 있는 테스트 파일
        return new byte[0]; // 실제 구현 필요
    }

    private byte[] createDicomWithVariousVRTypes() {
        // 다양한 VR 타입의 태그들이 있는 테스트 파일
        return new byte[0]; // 실제 구현 필요
    }
} 