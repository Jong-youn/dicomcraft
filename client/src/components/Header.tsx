import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import dicomApi from '../services/dicomApi';
import { DicomAnalysisResponse } from '../types/dicom';
import './Header.css';

interface HeaderProps {
  onAnalysisComplete: (data: DicomAnalysisResponse) => void;
  onExportDicom: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasData: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onAnalysisComplete,
  onExportDicom,
  isLoading,
  setIsLoading,
  setError,
  hasData
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsLoading(true);
    setError(null);

    try {
      const analysisData = await dicomApi.analyzeDicomFile(file);
      onAnalysisComplete(analysisData);
    } catch (error: any) {
      setError(error.response?.data?.errorMessage || '파일 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [onAnalysisComplete, setIsLoading, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dicom': ['.dcm'],
      'application/octet-stream': ['.dcm']
    },
    multiple: false
  });

  const handleExportDicom = async () => {
    try {
      await onExportDicom();
    } catch (error) {
      console.error('Export DICOM error:', error);
    }
  };

  return (
    <header className="header">
      <div className="logo">DICOM Craft Editor</div>
      
      <div className="header-actions">
        <div {...getRootProps()} className="upload-area">
          <input {...getInputProps()} />
          <button 
            className={`btn btn-secondary ${isDragActive ? 'drag-active' : ''}`}
            disabled={isLoading}
          >
            <span>📁</span>
            {isDragActive ? 'Drop DICOM file here' : 'Upload DICOM'}
          </button>
        </div>
        
        <button className="btn btn-success" disabled={isLoading || !hasData}>
          <span>💾</span>
          Save Changes
        </button>
        
        <button className="btn btn-secondary" disabled={isLoading || !hasData}>
          <span>🔄</span>
          Reset
        </button>
        
        <button 
          className="btn btn-primary" 
          disabled={isLoading || !hasData}
          onClick={handleExportDicom}
        >
          <span>📤</span>
          Export DICOM
        </button>
      </div>
    </header>
  );
};

export default Header;
