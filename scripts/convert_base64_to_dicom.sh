#!/bin/bash

# Base64 데이터를 DICOM 파일로 변환하는 스크립트
# 사용법: ./convert_base64_to_dicom.sh <base64_string> <output_filename>

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 사용법 출력
usage() {
    echo "사용법: $0 <base64_string> <output_filename>"
    echo "또는: $0 --from-file <base64_file> <output_filename>"
    echo ""
    echo "예시:"
    echo "  $0 'AAAAAA...' output.dcm"
    echo "  $0 --from-file base64_data.txt output.dcm"
    exit 1
}

# 함수: Base64를 DICOM 파일로 변환
convert_base64_to_dicom() {
    local base64_data="$1"
    local output_file="$2"
    
    echo -e "${BLUE}Base64 데이터 디코딩 중...${NC}"
    echo "데이터 길이: ${#base64_data} 문자"
    
    # Base64 디코딩 및 파일 저장
    echo "$base64_data" | base64 -d > "$output_file"
    
    # 파일 크기 확인
    file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo "unknown")
    
    echo -e "${GREEN}✅ DICOM 파일 생성 완료: $(pwd)/$output_file${NC}"
    echo -e "${GREEN}📁 파일 크기: $file_size 바이트${NC}"
}

# 메인 로직
main() {
    # 인수 확인
    if [ $# -lt 2 ]; then
        usage
    fi
    
    # --from-file 옵션 처리
    if [ "$1" = "--from-file" ]; then
        if [ $# -ne 3 ]; then
            echo -e "${RED}❌ --from-file 옵션 사용 시 파일명과 출력파일명이 필요합니다.${NC}"
            usage
        fi
        
        base64_file="$2"
        output_file="$3"
        
        if [ ! -f "$base64_file" ]; then
            echo -e "${RED}❌ 파일을 찾을 수 없습니다: $base64_file${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}Base64 데이터를 파일에서 읽는 중: $base64_file${NC}"
        base64_data=$(cat "$base64_file" | tr -d '\n\r')
    else
        base64_data="$1"
        output_file="$2"
    fi
    
    # 변환 실행
    convert_base64_to_dicom "$base64_data" "$output_file"
}

# 스크립트 실행
main "$@"
