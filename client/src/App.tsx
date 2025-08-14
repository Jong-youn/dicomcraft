import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import DicomViewer from './components/DicomViewer';
import TagEditor from './components/TagEditor';
import StatusBar from './components/StatusBar';
import { DicomAnalysisResponse, DicomTag } from './types/dicom';

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
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setError={setError}
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
