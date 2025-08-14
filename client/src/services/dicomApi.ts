import axios from 'axios';
import {
  DicomAnalysisResponse,
  DicomGenerationRequest,
  DicomGenerationResponse
} from '../types/dicom';

const API_BASE_URL = '/api/dicom';

const dicomApi = {
  // DICOM 파일 분석
  analyzeDicomFile: async (file: File): Promise<DicomAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('DICOM 분석 중 오류 발생:', error);
      throw error;
    }
  },

  // DICOM 파일 생성
  generateDicomFile: async (request: DicomGenerationRequest): Promise<DicomGenerationResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('DICOM 생성 중 오류 발생:', error);
      throw error;
    }
  },

  // 헬스 체크
  healthCheck: async (): Promise<string> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('헬스 체크 중 오류 발생:', error);
      throw error;
    }
  },

  // Base64를 Blob으로 변환
  base64ToBlob: (base64: string, mimeType: string = 'application/octet-stream'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  },

  // Blob을 다운로드
  downloadBlob: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Base64 DICOM 파일 다운로드
  downloadDicomFile: (base64: string, filename: string): void => {
    const blob = dicomApi.base64ToBlob(base64, 'application/dicom');
    dicomApi.downloadBlob(blob, filename);
  }
};

export default dicomApi;
