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
public class DicomGenerationRequest {
    private List<DicomTagRequest> tags;
    private DicomPixelDataRequest pixelData;
}
