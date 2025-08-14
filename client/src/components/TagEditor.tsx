import React, { useState, useMemo } from 'react';
import { DicomTag } from '../types/dicom';
import './TagEditor.css';

interface TagEditorProps {
  tags: DicomTag[];
  onTagChange: (tagId: string, newValue: any) => void;
  onReset: () => void;
  hasOriginalData: boolean;
}

const TagEditor: React.FC<TagEditorProps> = ({
  tags,
  onTagChange,
  onReset,
  hasOriginalData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // 태그를 그룹별로 분류
  const groupedTags = useMemo(() => {
    const groups: { [key: string]: DicomTag[] } = {};
    
    tags.forEach(tag => {
      let groupName = 'Other';
      
      if (tag.name.includes('Patient')) {
        groupName = 'Patient Information';
      } else if (tag.name.includes('Study')) {
        groupName = 'Study Information';
      } else if (tag.name.includes('Series')) {
        groupName = 'Series Information';
      } else if (tag.name.includes('Image')) {
        groupName = 'Image Information';
      } else if (tag.name.includes('Sequence') || tag.vr === 'SQ') {
        groupName = 'Sequence Tags';
      } else if (tag.name.includes('Private')) {
        groupName = 'Private Tags';
      }
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(tag);
    });
    
    return groups;
  }, [tags]);

  // 검색 필터링
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedTags;
    
    const filtered: { [key: string]: DicomTag[] } = {};
    
    Object.entries(groupedTags).forEach(([groupName, groupTags]) => {
      const filteredTags = groupTags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(tag.value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredTags.length > 0) {
        filtered[groupName] = filteredTags;
      }
    });
    
    return filtered;
  }, [groupedTags, searchTerm]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleInputChange = (tagId: string, value: string) => {
    onTagChange(tagId, value);
  };

  const renderTagValue = (tag: DicomTag) => {
    if (tag.vr === 'SQ') {
      return (
        <div className="sequence-indicator">
          Sequence with {tag.children.length} items
        </div>
      );
    }
    
    return (
      <input
        type="text"
        className="tag-input"
        value={String(tag.value || '')}
        onChange={(e) => handleInputChange(tag.id, e.target.value)}
        placeholder="Enter value..."
      />
    );
  };

  return (
    <section className="editor-section">
      <div className="editor-header">
        <h3 className="editor-title">Tag Editor</h3>
        <input
          type="text"
          className="search-box"
          placeholder="🔍 Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="tags-container">
        {Object.keys(filteredGroups).length === 0 ? (
          <div className="no-results">
            {searchTerm ? 'No tags found matching your search.' : 'No tags available.'}
          </div>
        ) : (
          Object.entries(filteredGroups).map(([groupName, groupTags]) => (
            <div key={groupName} className="tag-group">
              <div 
                className="tag-group-title"
                onClick={() => toggleGroup(groupName)}
              >
                <span className={`expand-icon ${expandedGroups.has(groupName) ? 'expanded' : ''}`}>
                  ▶
                </span>
                {groupName}
                <span className="tag-count">({groupTags.length})</span>
              </div>
              
              {expandedGroups.has(groupName) && (
                <div className="tag-items">
                  {groupTags.map((tag) => (
                    <div key={tag.id} className="tag-item">
                      <div className="tag-info">
                        <div className="tag-name">{tag.name}</div>
                        <div className="tag-id">{tag.id}</div>
                        <div className="tag-vr">{tag.vr}</div>
                        {/* <div className="tag-value">{String(tag.value || '')}</div> */}
                      </div>
                      {renderTagValue(tag)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default TagEditor;
