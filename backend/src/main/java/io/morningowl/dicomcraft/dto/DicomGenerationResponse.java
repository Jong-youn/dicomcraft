package io.morningowl.dicomcraft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DicomGenerationResponse {
    private String fileName;
    private String generatedDicomBase64; // 생성된 DICOM 파일의 Base64
    private String generationStatus;
    private String errorMessage;
    private long fileSize;
}
