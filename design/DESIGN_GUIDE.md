# DICOM Craft Editor - UI/UX Design Guide

## 🎨 디자인 개요

DICOM Craft Editor는 의료 영상 파일(DICOM)을 분석하고 편집할 수 있는 웹 기반 도구입니다. 직관적이고 효율적인 사용자 경험을 제공하기 위해 다음과 같은 디자인 원칙을 따릅니다.

## 📐 레이아웃 구조

### 전체 레이아웃
```
┌─────────────────────────────────────────────────────────────┐
│                    Header (80px)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │   DICOM Viewer  │  │        Tag Editor               │  │
│  │   (50% width)   │  │        (50% width)              │  │
│  │                 │  │                                 │  │
│  │   [Image Area]  │  │  ┌─────────────────────────┐   │  │
│  │                 │  │  │ Search Tags: [_____]  │   │  │
│  │                 │  │  └─────────────────────────┘   │  │
│  │                 │  │                                 │  │
│  │   [Controls]    │  │  ┌─────────────────────────┐   │  │
│  │                 │  │  │ Tag List (Scrollable)   │   │  │
│  │                 │  │  │                         │   │  │
│  └─────────────────┘  │  └─────────────────────────┘   │  │
│                       └─────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    Status Bar (60px)                       │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 주요 컴포넌트

### 1. Header (헤더)
- **높이**: 80px
- **기능**: 로고, 주요 액션 버튼들
- **버튼들**:
  - 📁 Upload DICOM
  - 💾 Save Changes  
  - 🔄 Reset
  - 📤 Export DICOM

### 2. DICOM Viewer (뷰어)
- **위치**: 좌측 50%
- **기능**: DICOM 이미지 표시 및 조작
- **컨트롤**:
  - 🔍+ Zoom In
  - 🔍- Zoom Out
  - 📐 Pan
  - ⚖️ Window/Level
  - 🔄 Reset View

### 3. Tag Editor (태그 편집기)
- **위치**: 우측 50%
- **기능**: DICOM 태그 검색 및 편집
- **구성**:
  - 검색창
  - 태그 그룹별 분류
  - 편집 가능한 입력 필드

### 4. Status Bar (상태바)
- **높이**: 60px
- **기능**: 현재 상태, 수정된 태그 수, 파일명 표시

## 🌈 색상 시스템

### Light Theme (기본)
```css
/* Primary Colors */
--primary-blue: #2563eb;      /* 주요 액션 */
--primary-green: #10b981;     /* 성공/저장 */
--primary-red: #ef4444;       /* 오류/삭제 */
--primary-yellow: #f59e0b;    /* 경고/수정 */

/* Neutral Colors */
--bg-primary: #ffffff;        /* 메인 배경 */
--bg-secondary: #f8fafc;      /* 보조 배경 */
--text-primary: #1e293b;      /* 주요 텍스트 */
--text-secondary: #64748b;    /* 보조 텍스트 */
--border-color: #e2e8f0;      /* 테두리 */
```

### Dark Theme (다크)
```css
/* Primary Colors */
--primary-blue: #3b82f6;      /* 주요 액션 */
--primary-green: #10b981;     /* 성공/저장 */
--primary-red: #ef4444;       /* 오류/삭제 */
--primary-yellow: #f59e0b;    /* 경고/수정 */

/* Neutral Colors */
--bg-primary: #0f172a;        /* 메인 배경 */
--bg-secondary: #1e293b;      /* 보조 배경 */
--text-primary: #e2e8f0;      /* 주요 텍스트 */
--text-secondary: #94a3b8;    /* 보조 텍스트 */
--border-color: #334155;      /* 테두리 */
```

## 🔤 타이포그래피

### 폰트 패밀리
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 폰트 크기
```css
--text-xs: 0.75rem;    /* 12px - 작은 라벨 */
--text-sm: 0.875rem;   /* 14px - 보조 텍스트 */
--text-base: 1rem;     /* 16px - 기본 텍스트 */
--text-lg: 1.125rem;   /* 18px - 제목 */
--text-xl: 1.25rem;    /* 20px - 큰 제목 */
```

## 🎭 컴포넌트 스타일

### 버튼 (Button)
```css
.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
}

.btn-primary {
    background: #2563eb;
    color: white;
}

.btn-secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
}
```

### 입력 필드 (Input)
```css
.tag-input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
}

.tag-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.tag-input.modified {
    border-color: #f59e0b;
    background: #fffbeb;
}
```

### 태그 그룹 (Tag Group)
```css
.tag-group-title {
    font-weight: 600;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 0.375rem;
    cursor: pointer;
}

.tag-item {
    padding: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
}

.tag-item:hover {
    background: #f8fafc;
}
```

## 📱 반응형 디자인

### Breakpoints
```css
/* Desktop (1200px+) */
.main-container {
    display: flex;
    flex-direction: row;
}

/* Tablet (768px-1199px) */
@media (max-width: 1199px) {
    .main-container {
        flex-direction: column;
    }
    .viewer-section,
    .editor-section {
        height: 50vh;
    }
}

/* Mobile (320px-767px) */
@media (max-width: 767px) {
    .header-actions {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .viewer-controls {
        flex-wrap: wrap;
    }
}
```

## 🎨 인터랙션 디자인

### 호버 효과
- **버튼**: 배경색 변경, 그림자 효과
- **태그 아이템**: 배경색 변경
- **입력 필드**: 테두리 색상 변경

### 포커스 상태
- **입력 필드**: 파란색 테두리 + 그림자
- **버튼**: 더 진한 배경색

### 수정 상태
- **변경된 태그**: 노란색 테두리 + 배경
- **상태바**: 수정된 태그 수 표시

## 🔧 접근성 (Accessibility)

### 키보드 네비게이션
- Tab 키로 모든 인터랙티브 요소 접근 가능
- Enter/Space 키로 버튼 활성화
- Escape 키로 모달 닫기

### 스크린 리더 지원
- 적절한 ARIA 라벨
- 의미있는 HTML 구조
- 대체 텍스트 제공

### 색상 대비
- WCAG AA 기준 준수 (4.5:1 이상)
- 색상만으로 정보 전달하지 않음

## 🚀 사용자 플로우

### 1. 파일 업로드
```
[Upload Button] → [File Select] → [Loading] → [Analysis Complete]
```

### 2. 태그 편집
```
[Select Tag] → [Edit Value] → [Validation] → [Save Changes]
```

### 3. 파일 내보내기
```
[Export Button] → [Processing] → [Download Ready]
```

## 📋 디자인 체크리스트

### ✅ 완료된 항목
- [x] 기본 레이아웃 구조
- [x] 색상 시스템 (Light/Dark)
- [x] 타이포그래피
- [x] 반응형 디자인
- [x] 컴포넌트 스타일
- [x] 인터랙션 효과

### 🔄 진행 중인 항목
- [ ] 실제 DICOM 이미지 렌더링
- [ ] 드래그 앤 드롭 업로드
- [ ] 실시간 검색 기능
- [ ] 키보드 단축키

### 📝 향후 계획
- [ ] 애니메이션 효과
- [ ] 고급 뷰어 컨트롤
- [ ] 태그 필터링
- [ ] 사용자 설정 저장

## 🎯 디자인 목표

1. **직관성**: 의료진이 쉽게 사용할 수 있는 인터페이스
2. **효율성**: 빠른 태그 검색 및 편집
3. **정확성**: 실시간 유효성 검사 및 피드백
4. **접근성**: 다양한 사용자를 위한 포용적 디자인
5. **확장성**: 향후 기능 추가를 고려한 구조

이 디자인 가이드를 바탕으로 실제 React 컴포넌트를 구현할 수 있습니다.
