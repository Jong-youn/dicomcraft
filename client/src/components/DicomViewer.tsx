import React, { useEffect, useRef, useState } from 'react';
import { DicomPixelData } from '../types/dicom';
import './DicomViewer.css';

interface DicomViewerProps {
  pixelData: DicomPixelData | null | undefined;
  isLoading: boolean;
}

const DicomViewer: React.FC<DicomViewerProps> = ({ pixelData, isLoading }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (error: any) => {
    console.error('Image load error:', error);
    setImageLoaded(false);
  };

  useEffect(() => {
    if (!pixelData || !pixelData.pixelDataBase64) {
      setImageSrc(null);
      return;
    }

    try {
      // Base64 데이터를 Blob으로 변환
      const binaryString = atob(pixelData.pixelDataBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Canvas를 사용하여 이미지 데이터를 PNG로 변환
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = pixelData.width;
      canvas.height = pixelData.height;

      // 픽셀 데이터 처리 (16비트 그레이스케일 가정)
      const bytesPerPixel = pixelData.bitsAllocated / 8;
      const totalPixels = pixelData.width * pixelData.height;

      // 데이터 길이 확인
      if (bytes.length < totalPixels * bytesPerPixel) {
        console.error('Insufficient data length:', bytes.length, 'expected:', totalPixels * bytesPerPixel);
        return;
      }

      // 픽셀 값들을 먼저 수집하여 최소/최대값 찾기
      const pixelValues: number[] = [];
      let minValue = Infinity;
      let maxValue = -Infinity;
      
      for (let i = 0; i < totalPixels; i++) {
        const pixelIndex = i * bytesPerPixel;
        let pixelValue = 0;

        if (bytesPerPixel === 2) {
          // 16비트 (Little Endian)
          pixelValue = (bytes[pixelIndex + 1] << 8) | bytes[pixelIndex];
        } else {
          // 8비트
          pixelValue = bytes[pixelIndex];
        }
        
        pixelValues.push(pixelValue);
        
        // 최소/최대값 업데이트
        if (pixelValue < minValue) minValue = pixelValue;
        if (pixelValue > maxValue) maxValue = pixelValue;
      }

      const valueRange = maxValue - minValue;

      // ImageData 생성
      const imageData = ctx.createImageData(pixelData.width, pixelData.height);
      const data = imageData.data;

      for (let i = 0; i < totalPixels; i++) {
        const pixelValue = pixelValues[i];
        
        // 윈도우 레벨링 적용
        let normalizedValue = 0;
        if (valueRange > 0) {
          normalizedValue = ((pixelValue - minValue) / valueRange) * 255;
        } else {
          normalizedValue = pixelValue > 0 ? 255 : 0;
        }
        
        normalizedValue = Math.min(255, Math.max(0, normalizedValue));

        const dataIndex = i * 4;
        data[dataIndex] = normalizedValue;     // R
        data[dataIndex + 1] = normalizedValue; // G
        data[dataIndex + 2] = normalizedValue; // B
        data[dataIndex + 3] = 255;             // A
      }

      ctx.putImageData(imageData, 0, 0);

      // Canvas를 PNG 이미지로 변환
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setImageSrc(imageUrl);
        }
      }, 'image/png');

    } catch (error) {
      console.error('DICOM 이미지 변환 오류:', error);
      setImageSrc(null);
    }
  }, [pixelData]);

  // 컴포넌트 언마운트 시 URL 해제
  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

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
            {imageSrc ? (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="DICOM Image"
                className="dicom-canvas"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="placeholder-image">
                <div>No DICOM image available</div>
                <small>Upload a DICOM file to view the image</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DicomViewer;
