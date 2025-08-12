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
public class DicomTagRequest {
    private String tagNumber; // "(0010,0010)" 형식
    private String tagName;
    private String vr; // Value Representation
    private Object value;
    private List<DicomSequenceItemRequest> children; // Sequence 태그인 경우
}
