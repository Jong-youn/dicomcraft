import React, { useEffect, useRef } from 'react';
import { DicomPixelData } from '../types/dicom';
import './DicomViewer.css';

interface DicomViewerProps {
  pixelData?: DicomPixelData;
  isLoading: boolean;
}

const DicomViewer: React.FC<DicomViewerProps> = ({ pixelData, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pixelData || !pixelData.hasPixelData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 크기 설정
    canvas.width = pixelData.width;
    canvas.height = pixelData.height;

    try {
      // Base64 픽셀 데이터를 Uint8Array로 변환
      const pixelArray = new Uint8Array(
        atob(pixelData.pixelDataBase64)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // ImageData 생성
      const imageData = ctx.createImageData(pixelData.width, pixelData.height);
      
      // 픽셀 데이터를 ImageData에 복사
      for (let i = 0; i < pixelArray.length; i++) {
        const pixelValue = pixelArray[i];
        const index = i * 4;
        
        // 그레이스케일을 RGB로 변환
        imageData.data[index] = pixelValue;     // R
        imageData.data[index + 1] = pixelValue; // G
        imageData.data[index + 2] = pixelValue; // B
        imageData.data[index + 3] = 255;        // A
      }

      // Canvas에 이미지 그리기
      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error('DICOM 이미지 렌더링 오류:', error);
    }
  }, [pixelData]);

  const handleZoomIn = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.style.transform = `scale(${(parseFloat(canvas.style.transform.replace('scale(', '').replace(')', '')) || 1) * 1.2})`;
  };

  const handleZoomOut = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const currentScale = parseFloat(canvas.style.transform.replace('scale(', '').replace(')', '')) || 1;
    canvas.style.transform = `scale(${Math.max(0.1, currentScale * 0.8)})`;
  };

  const handleResetView = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.style.transform = 'scale(1)';
  };

  return (
    <section className="viewer-section">
      <div className="viewer-header">
        <h3 className="viewer-title">DICOM Viewer</h3>
        <div className="viewer-controls">
          <button className="control-btn" onClick={handleZoomIn} disabled={!pixelData?.hasPixelData}>
            🔍+
          </button>
          <button className="control-btn" onClick={handleZoomOut} disabled={!pixelData?.hasPixelData}>
            🔍-
          </button>
          <button className="control-btn" disabled={!pixelData?.hasPixelData}>
            📐
          </button>
          <button className="control-btn" disabled={!pixelData?.hasPixelData}>
            ⚖️
          </button>
          <button className="control-btn" onClick={handleResetView} disabled={!pixelData?.hasPixelData}>
            🔄
          </button>
        </div>
      </div>
      
      <div className="image-container">
        {isLoading ? (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>DICOM 파일 분석 중...</p>
          </div>
        ) : pixelData?.hasPixelData ? (
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              className="dicom-canvas"
              style={{ transform: 'scale(1)', transformOrigin: 'center' }}
            />
            <div className="image-info">
              {pixelData.width} × {pixelData.height} • {pixelData.bitsAllocated}-bit • {pixelData.photometricInterpretation}
            </div>
          </div>
        ) : (
          <div className="placeholder-image">
            DICOM Image Viewer
            <br />
            <small>Upload a DICOM file to view</small>
          </div>
        )}
      </div>
    </section>
  );
};

export default DicomViewer;
