package io.morningowl.dicomcraft.controller;

import io.morningowl.dicomcraft.dto.DicomAnalysisResponse;
import io.morningowl.dicomcraft.dto.DicomGenerationRequest;
import io.morningowl.dicomcraft.dto.DicomGenerationResponse;
import io.morningowl.dicomcraft.service.DicomAnalysisService;
import io.morningowl.dicomcraft.service.DicomGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/dicom")
@RequiredArgsConstructor
public class DicomController {

    private final DicomAnalysisService dicomAnalysisService;
    private final DicomGenerationService dicomGenerationService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DicomAnalysisResponse> analyzeDicomFile(
            @RequestParam("file") MultipartFile file) {
        
        log.info("DICOM 파일 분석 요청: {}", file.getOriginalFilename());
        
        // 파일 유효성 검사
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(DicomAnalysisResponse.builder()
                            .fileName(file.getOriginalFilename())
                            .analysisStatus("ERROR")
                            .errorMessage("업로드된 파일이 비어있습니다.")
                            .build());
        }
        
        // 파일 확장자 검사
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || 
            (!originalFilename.toLowerCase().endsWith(".dcm") && 
             !originalFilename.toLowerCase().endsWith(".dicom"))) {
            log.warn("지원하지 않는 파일 형식: {}", originalFilename);
            // DICOM 파일이 아닌 경우에도 분석을 시도해보도록 변경
        }
        
        try {
            DicomAnalysisResponse response = dicomAnalysisService.analyzeDicomFile(file);
            
            if ("SUCCESS".equals(response.getAnalysisStatus())) {
                log.info("DICOM 파일 분석 완료: {}, 태그 수: {}", 
                        file.getOriginalFilename(), 
                        response.getTags() != null ? response.getTags().size() : 0);
                return ResponseEntity.ok(response);
            } else {
                log.error("DICOM 파일 분석 실패: {}, 오류: {}", 
                        file.getOriginalFilename(), 
                        response.getErrorMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("DICOM 파일 분석 중 예상치 못한 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(DicomAnalysisResponse.builder()
                            .fileName(file.getOriginalFilename())
                            .analysisStatus("ERROR")
                            .errorMessage("서버 내부 오류: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<DicomGenerationResponse> generateDicomFile(@RequestBody DicomGenerationRequest request) {
        log.info("DICOM 파일 생성 요청");
        
        try {
            DicomGenerationResponse response = dicomGenerationService.generateDicomFile(request);
            
            if ("SUCCESS".equals(response.getGenerationStatus())) {
                log.info("DICOM 파일 생성 완료: {}, 파일 크기: {} bytes", 
                        response.getFileName(), response.getFileSize());
                return ResponseEntity.ok(response);
            } else {
                log.error("DICOM 파일 생성 실패: {}, 오류: {}", 
                        response.getFileName(), response.getErrorMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("DICOM 파일 생성 중 예상치 못한 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(DicomGenerationResponse.builder()
                            .fileName("unknown.dcm")
                            .generationStatus("ERROR")
                            .errorMessage("서버 내부 오류: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("DICOM Craft API is running");
    }
}
