package io.morningowl.dicomcraft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DicomPixelDataRequest {
    private int width;
    private int height;
    private int bitsAllocated;
    private int bitsStored;
    private int samplesPerPixel;
    private String photometricInterpretation;
    private String pixelRepresentation;
    private String pixelDataBase64; // Base64 encoded pixel data
}
