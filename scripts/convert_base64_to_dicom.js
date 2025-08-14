#!/usr/bin/env node

/**
 * Base64 데이터를 DICOM 파일로 변환하는 Node.js 스크립트
 * 사용법: node convert_base64_to_dicom.js <base64_string> <output_filename>
 */

const fs = require('fs');
const path = require('path');

// 색상 출력을 위한 유틸리티
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function base64ToDicom(base64String, outputFilename) {
    try {
        // Base64 디코딩
        log(`Base64 데이터 디코딩 중... (길이: ${base64String.length} 문자)`, 'blue');
        const dicomBuffer = Buffer.from(base64String, 'base64');
        log(`디코딩 완료: ${dicomBuffer.length} 바이트`, 'blue');
        
        // 파일 저장
        const outputPath = path.resolve(outputFilename);
        fs.writeFileSync(outputPath, dicomBuffer);
        
        log(`✅ DICOM 파일 생성 완료: ${outputPath}`, 'green');
        log(`📁 파일 크기: ${dicomBuffer.length} 바이트`, 'green');
        
        return true;
        
    } catch (error) {
        log(`❌ 오류 발생: ${error.message}`, 'red');
        return false;
    }
}

function main() {
    const args = process.argv.slice(2);
    
    // 인수 확인
    if (args.length < 2) {
        log('사용법: node convert_base64_to_dicom.js <base64_string> <output_filename>', 'yellow');
        log('또는: node convert_base64_to_dicom.js --from-file <base64_file> <output_filename>', 'yellow');
        log('', 'yellow');
        log('예시:', 'yellow');
        log('  node convert_base64_to_dicom.js "AAAAAA..." output.dcm', 'yellow');
        log('  node convert_base64_to_dicom.js --from-file base64_data.txt output.dcm', 'yellow');
        process.exit(1);
    }
    
    let base64Data;
    let outputFile;
    
    // --from-file 옵션 처리
    if (args[0] === '--from-file') {
        if (args.length !== 3) {
            log('❌ --from-file 옵션 사용 시 파일명과 출력파일명이 필요합니다.', 'red');
            process.exit(1);
        }
        
        const base64File = args[1];
        outputFile = args[2];
        
        if (!fs.existsSync(base64File)) {
            log(`❌ 파일을 찾을 수 없습니다: ${base64File}`, 'red');
            process.exit(1);
        }
        
        log(`Base64 데이터를 파일에서 읽는 중: ${base64File}`, 'yellow');
        base64Data = fs.readFileSync(base64File, 'utf8').trim();
    } else {
        base64Data = args[0];
        outputFile = args[1];
    }
    
    // 변환 실행
    const success = base64ToDicom(base64Data, outputFile);
    
    process.exit(success ? 0 : 1);
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { base64ToDicom };
