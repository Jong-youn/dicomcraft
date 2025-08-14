# DICOM Craft - Medical Image Editor

의료 영상 파일(DICOM)을 분석하고 편집할 수 있는 웹 기반 도구입니다.

## 🏗️ 프로젝트 구조

```
dicomcraft/
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/java/io/morningowl/dicomcraft/
│   │   ├── controller/DicomController.java
│   │   ├── service/DicomAnalysisService.java
│   │   ├── service/DicomGenerationService.java
│   │   └── dto/
│   ├── build.gradle
│   └── ...
├── client/                  # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── DicomViewer.tsx
│   │   │   ├── TagEditor.tsx
│   │   │   └── StatusBar.tsx
│   │   ├── services/dicomApi.ts
│   │   ├── types/dicom.ts
│   │   └── App.tsx
│   └── package.json
├── design/                  # UI/UX 디자인
├── scripts/                 # 유틸리티 스크립트
└── package.json            # 모노레포 설정
```

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
# 루트 디렉토리에서
npm install

# 또는 개별 설치
npm run install:all
```

### 2. 개발 서버 실행

```bash
# 백엔드와 프론트엔드 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:backend    # 백엔드만 (포트 8080)
npm run dev:frontend   # 프론트엔드만 (포트 3000)
```

### 3. 브라우저에서 확인

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080

## 📋 주요 기능

### 백엔드 (Spring Boot)
- **DICOM 파일 분석**: `/api/dicom/analyze`
- **DICOM 파일 생성**: `/api/dicom/generate`
- **헬스 체크**: `/api/dicom/health`

### 프론트엔드 (React)
- **DICOM 파일 업로드**: 드래그 앤 드롭 지원
- **탭 기반 인터페이스**: DICOM Viewer와 Tag Editor 분리
- **이미지 뷰어**: 줌, 팬, 윈도우/레벨 조정
- **태그 편집기**: 검색, 그룹화, 실시간 편집
- **파일 내보내기**: 수정된 DICOM 파일 다운로드

## 🎨 UI/UX 특징

### 탭 기반 레이아웃
- **DICOM Viewer 탭**: 전체 화면 이미지 뷰어
- **Tag Editor 탭**: 전체 화면 태그 편집기
- **반응형 디자인**: 모바일/태블릿 지원

### 사용자 경험
- **직관적인 네비게이션**: 탭으로 기능 분리
- **실시간 피드백**: 로딩 상태, 오류 메시지
- **드래그 앤 드롭**: 쉬운 파일 업로드
- **검색 기능**: 빠른 태그 찾기

## 🛠️ 기술 스택

### 백엔드
- **Spring Boot 3.x**
- **dcm4che**: DICOM 파일 처리
- **Gradle**: 빌드 도구

### 프론트엔드
- **React 18** + **TypeScript**
- **Axios**: HTTP 클라이언트
- **React Dropzone**: 파일 업로드
- **Canvas API**: 이미지 렌더링

## 📁 API 엔드포인트

### DICOM 분석
```http
POST /api/dicom/analyze
Content-Type: multipart/form-data

Response:
{
  "fileName": "sample.dcm",
  "tags": [...],
  "pixelData": {...},
  "analysisStatus": "SUCCESS"
}
```

### DICOM 생성
```http
POST /api/dicom/generate
Content-Type: application/json

Request:
{
  "tags": [...],
  "pixelData": {...}
}

Response:
{
  "fileName": "generated.dcm",
  "generatedDicomBase64": "...",
  "generationStatus": "SUCCESS",
  "fileSize": 12345
}
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트
npm run test

# 백엔드만 실행
npm run dev:backend

# 프론트엔드만 실행
npm run dev:frontend
```

## 📦 빌드 및 배포

### 개발 빌드
```bash
npm run build
```

### 프로덕션 빌드
```bash
# 백엔드
cd backend && ./gradlew build

# 프론트엔드
cd client && npm run build
```

## 🐛 문제 해결

### 포트 충돌
- 백엔드: 8080 포트가 사용 중인 경우 `backend/src/main/resources/application.properties`에서 수정
- 프론트엔드: 3000 포트가 사용 중인 경우 자동으로 다음 포트 사용

### Node.js 버전
- Node.js 18+ 권장
- 현재 Node.js 16에서도 동작하지만 일부 경고 발생 가능

### DICOM 파일 문제
- 지원 형식: `.dcm` 파일
- 최대 파일 크기: 100MB
- 파일이 손상된 경우 분석 실패 가능

## 🎯 사용 방법

### 1. DICOM 파일 업로드
- "Upload DICOM" 버튼 클릭 또는 파일을 드래그 앤 드롭
- 파일이 자동으로 분석되어 태그와 이미지 데이터 추출

### 2. DICOM Viewer 사용
- DICOM Viewer 탭에서 이미지 확인
- 줌 인/아웃, 팬, 윈도우/레벨 조정 가능
- 이미지 정보 표시 (크기, 비트 깊이 등)

### 3. Tag Editor 사용
- Tag Editor 탭에서 DICOM 태그 편집
- 검색 기능으로 원하는 태그 빠르게 찾기
- 태그 그룹별로 분류되어 편리한 편집
- 실시간으로 수정된 태그 수 표시

### 4. 파일 내보내기
- 수정된 태그로 새로운 DICOM 파일 생성
- Base64 인코딩된 파일 다운로드

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- [dcm4che](https://github.com/dcm4che/dcm4che) - DICOM 처리 라이브러리
- [React](https://reactjs.org/) - 프론트엔드 프레임워크
- [Spring Boot](https://spring.io/projects/spring-boot) - 백엔드 프레임워크
