import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import DicomViewer from './components/DicomViewer';
import TagEditor from './components/TagEditor';
import StatusBar from './components/StatusBar';
import { DicomAnalysisResponse, DicomTag, DicomGenerationRequest } from './types/dicom';
import dicomApi from './services/dicomApi';

type TabType = 'viewer' | 'editor';

function App() {
  const [analysisData, setAnalysisData] = useState<DicomAnalysisResponse | null>(null);
  const [modifiedTags, setModifiedTags] = useState<DicomTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('viewer');

  const handleAnalysisComplete = (data: DicomAnalysisResponse) => {
    setAnalysisData(data);
    setModifiedTags(data.tags);
    setError(null);
  };

  const handleTagChange = (tagId: string, newValue: any) => {
    if (!analysisData) return;

    const updatedTags = modifiedTags.map(tag => 
      tag.id === tagId ? { ...tag, value: newValue } : tag
    );
    setModifiedTags(updatedTags);
  };

  const handleReset = () => {
    if (analysisData) {
      setModifiedTags(analysisData.tags);
    }
  };

  const handleExportDicom = async () => {
    if (!analysisData || !analysisData.pixelData) {
      setError('DICOM 파일이 로드되지 않았습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // DicomGenerationRequest 형태로 데이터 변환
      const request: DicomGenerationRequest = {
        tags: modifiedTags.map(tag => ({
          tagNumber: tag.id,
          tagName: tag.name,
          vr: tag.vr,
          value: tag.value,
          children: tag.children.map(sequenceItem => ({
            itemNumber: sequenceItem.itemNumber,
            tags: sequenceItem.tags.map(childTag => ({
              tagNumber: childTag.id,
              tagName: childTag.name,
              vr: childTag.vr,
              value: childTag.value,
              children: [] // 중첩된 시퀀스는 현재 2단계까지만 지원
            }))
          }))
        })),
        pixelData: {
          width: analysisData.pixelData.width,
          height: analysisData.pixelData.height,
          bitsAllocated: analysisData.pixelData.bitsAllocated,
          bitsStored: analysisData.pixelData.bitsStored,
          samplesPerPixel: analysisData.pixelData.samplesPerPixel,
          photometricInterpretation: analysisData.pixelData.photometricInterpretation,
          pixelRepresentation: analysisData.pixelData.pixelRepresentation,
          pixelDataBase64: analysisData.pixelData.pixelDataBase64
        }
      };

      const response = await dicomApi.generateDicomFile(request);
      
      if (response.generationStatus === 'SUCCESS' && response.generatedDicomBase64) {
        // 파일 다운로드
        const filename = response.fileName || 'generated_dicom.dcm';
        dicomApi.downloadDicomFile(response.generatedDicomBase64, filename);
        setError(null);
      } else {
        setError(response.errorMessage || 'DICOM 파일 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Export DICOM error:', error);
      setError(error.response?.data?.errorMessage || 'DICOM 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getModifiedCount = () => {
    if (!analysisData) return 0;
    return modifiedTags.filter((tag, index) => 
      JSON.stringify(tag.value) !== JSON.stringify(analysisData.tags[index]?.value)
    ).length;
  };

  return (
    <div className="App">
      <Header 
        onAnalysisComplete={handleAnalysisComplete}
        onExportDicom={handleExportDicom}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setError={setError}
        hasData={!!analysisData}
      />
      
      {/* Main Container with unified margins */}
      <div className="main-container">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          {/* Top Ad Space */}
          <div className="ad-space-top"></div>
          
          <button 
            className={`tab-button ${activeTab === 'viewer' ? 'active' : ''}`}
            onClick={() => setActiveTab('viewer')}
          >
            🖼️ DICOM Viewer
          </button>
          <button 
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            📝 Tag Editor
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {/* Right Ad Space */}
          <div className="ad-space-right"></div>
          
          {activeTab === 'viewer' && (
            <DicomViewer 
              pixelData={analysisData?.pixelData}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'editor' && (
            <TagEditor 
              tags={modifiedTags}
              onTagChange={handleTagChange}
              onReset={handleReset}
              hasOriginalData={!!analysisData}
            />
          )}
        </div>
      </div>
      
      <StatusBar 
        fileName={analysisData?.fileName}
        modifiedCount={getModifiedCount()}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
