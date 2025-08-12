package io.morningowl.dicomcraft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DicomAnalysisResponse {
    private String fileName;
    private List<DicomTag> tags;
    private DicomPixelData pixelData;
    private String analysisStatus;
    private String errorMessage;
}
