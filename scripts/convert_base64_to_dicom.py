#!/usr/bin/env python3
"""
Base64 데이터를 DICOM 파일로 변환하는 스크립트
사용법: python convert_base64_to_dicom.py <base64_string> <output_filename>
"""

import sys
import base64
import argparse
from pathlib import Path

def base64_to_dicom(base64_string, output_filename):
    """
    Base64 문자열을 DICOM 파일로 변환
    
    Args:
        base64_string (str): Base64로 인코딩된 DICOM 데이터
        output_filename (str): 출력 파일명
    """
    try:
        # Base64 디코딩
        print(f"Base64 데이터 디코딩 중... (길이: {len(base64_string)} 문자)")
        dicom_bytes = base64.b64decode(base64_string)
        print(f"디코딩 완료: {len(dicom_bytes)} 바이트")
        
        # 파일 저장
        output_path = Path(output_filename)
        with open(output_path, 'wb') as f:
            f.write(dicom_bytes)
        
        print(f"✅ DICOM 파일 생성 완료: {output_path.absolute()}")
        print(f"📁 파일 크기: {len(dicom_bytes)} 바이트")
        
        return True
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Base64 데이터를 DICOM 파일로 변환')
    parser.add_argument('base64_data', help='Base64로 인코딩된 DICOM 데이터')
    parser.add_argument('output_file', help='출력 파일명 (예: output.dcm)')
    parser.add_argument('--from-file', '-f', help='Base64 데이터를 파일에서 읽기')
    
    args = parser.parse_args()
    
    # Base64 데이터 가져오기
    if args.from_file:
        try:
            with open(args.from_file, 'r') as f:
                base64_data = f.read().strip()
        except FileNotFoundError:
            print(f"❌ 파일을 찾을 수 없습니다: {args.from_file}")
            return 1
    else:
        base64_data = args.base64_data
    
    # 변환 실행
    success = base64_to_dicom(base64_data, args.output_file)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
