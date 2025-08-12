package io.morningowl.dicomcraft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DicomTag {
    private String id;
    private String name;
    private String vr; // Value Representation
    private String vrDescription; // VR 설명. 클라이언트 구현 후 삭제예정
    private Object value;
    @Builder.Default
    private List<DicomSequenceItem> children = new ArrayList<>(); // Sequence 태그인 경우 하위 아이템들
}
