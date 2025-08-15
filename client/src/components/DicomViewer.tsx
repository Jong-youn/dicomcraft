import React, { useEffect, useRef, useState } from 'react';
import { DicomPixelData } from '../types/dicom';
import './DicomViewer.css';

interface DicomViewerProps {
  pixelData: DicomPixelData | null | undefined;
  isLoading: boolean;
}

const DicomViewer: React.FC<DicomViewerProps> = ({ pixelData, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!pixelData || !pixelData.pixelDataBase64 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Base64 데이터를 Uint8Array로 변환
      const binaryString = atob(pixelData.pixelDataBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 캔버스 크기 설정
      canvas.width = pixelData.width;
      canvas.height = pixelData.height;

      // ImageData 생성
      const imageData = ctx.createImageData(pixelData.width, pixelData.height);
      const data = imageData.data;

      // 픽셀 데이터 처리 (16비트 그레이스케일 가정)
      const bytesPerPixel = pixelData.bitsAllocated / 8;
      const samplesPerPixel = pixelData.samplesPerPixel;

      for (let i = 0; i < pixelData.width * pixelData.height; i++) {
        const pixelIndex = i * bytesPerPixel;
        let pixelValue = 0;

        if (bytesPerPixel === 2) {
          // 16비트
          pixelValue = (bytes[pixelIndex + 1] << 8) | bytes[pixelIndex];
        } else {
          // 8비트
          pixelValue = bytes[pixelIndex];
        }

        // 그레이스케일로 변환 (0-255 범위로 정규화)
        const normalizedValue = Math.min(255, Math.max(0, (pixelValue / 65535) * 255));

        const dataIndex = i * 4;
        data[dataIndex] = normalizedValue;     // R
        data[dataIndex + 1] = normalizedValue; // G
        data[dataIndex + 2] = normalizedValue; // B
        data[dataIndex + 3] = 255;             // A
      }

      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error('DICOM 이미지 렌더링 오류:', error);
    }
  }, [pixelData]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <section className="viewer-section">
        <div className="viewer-header">
          <h3 className="viewer-title">DICOM Viewer</h3>
        </div>
        <div className="image-container">
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <div>Loading DICOM image...</div>
          </div>
        </div>
      </section>
    );
  }

  if (!pixelData) {
    return (
      <section className="viewer-section">
        <div className="viewer-header">
          <h3 className="viewer-title">DICOM Viewer</h3>
        </div>
        <div className="image-container">
          <div className="placeholder-image">
            <div>No DICOM image loaded</div>
            <small>Upload a DICOM file to view the image</small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="viewer-section">
      <div className="viewer-header">
        <h3 className="viewer-title">DICOM Viewer</h3>
        <div className="viewer-controls">
          <button className="control-btn" onClick={handleZoomIn} disabled={!pixelData}>
            🔍+
          </button>
          <button className="control-btn" onClick={handleZoomOut} disabled={!pixelData}>
            🔍-
          </button>
          <button className="control-btn" onClick={handleReset} disabled={!pixelData}>
            🔄 Reset
          </button>
        </div>
      </div>
      
      <div className="viewer-content">
        {/* Pixel Data 정보 표시 */}
        {pixelData && (
          <div className="pixel-data-info">
            <h4>Pixel Data Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Width:</span>
                <span className="info-value">{pixelData.width}px</span>
              </div>
              <div className="info-item">
                <span className="info-label">Height:</span>
                <span className="info-value">{pixelData.height}px</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bits Allocated:</span>
                <span className="info-value">{pixelData.bitsAllocated}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bits Stored:</span>
                <span className="info-value">{pixelData.bitsStored}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Samples Per Pixel:</span>
                <span className="info-value">{pixelData.samplesPerPixel}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Photometric Interpretation:</span>
                <span className="info-value">{pixelData.photometricInterpretation}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Pixel Representation:</span>
                <span className="info-value">{pixelData.pixelRepresentation}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Has Pixel Data:</span>
                <span className="info-value">{pixelData.hasPixelData ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}
        <div className="image-container">
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              className="dicom-canvas"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DicomViewer;
