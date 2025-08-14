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
  const [expandedSequences, setExpandedSequences] = useState<Set<string>>(new Set());

  // 검색 필터링
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tags;
    
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(tag.value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  const handleInputChange = (tagId: string, value: string) => {
    onTagChange(tagId, value);
  };

  const toggleSequence = (tagId: string) => {
    console.log('Toggle sequence clicked for tag:', tagId);
    console.log('Current expanded sequences:', Array.from(expandedSequences));
    
    const newExpanded = new Set(expandedSequences);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
      console.log('Removing from expanded sequences');
    } else {
      newExpanded.add(tagId);
      console.log('Adding to expanded sequences');
    }
    setExpandedSequences(newExpanded);
    console.log('Updated expanded sequences:', Array.from(newExpanded));
  };

  const renderTagValue = (tag: DicomTag) => {
    if (tag.vr === 'SQ') {
      return (
        <div className="sequence-indicator">
          Sequence with {tag.children.length} items
          <span className={`expand-icon ${expandedSequences.has(tag.id) ? 'expanded' : ''}`}>
            ▶
          </span>
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

  const renderTagWithChildren = (tag: DicomTag, depth: number = 0) => {
    const isExpanded = expandedSequences.has(tag.id);
    const isSequence = tag.vr === 'SQ';
    
    console.log(`Rendering tag ${tag.id}:`, {
      isSequence,
      isExpanded,
      hasChildren: tag.children && tag.children.length > 0,
      childrenCount: tag.children?.length || 0
    });
    
    return (
      <div key={tag.id} className="tag-wrapper" style={{ marginLeft: `${depth * 20}px` }}>
        <div 
          className={`tag-item ${isSequence ? 'sequence-tag' : ''}`} 
          onClick={isSequence ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Sequence tag clicked:', tag.id);
            toggleSequence(tag.id);
          } : undefined}
        >
          <div className="tag-info">
            <div className="tag-name">
              <span className="tag-id">{tag.id}</span>
              {tag.name}
            </div>
            <div className="tag-vr">{tag.vr}</div>
          </div>
          {renderTagValue(tag)}
        </div>
        
        {/* Sequence 하위 태그들 */}
        {isSequence && isExpanded && tag.children && tag.children.length > 0 && (
          <div className="sequence-children">
            {tag.children.map((sequenceItem, itemIndex) => {
              console.log(`Rendering sequence item ${itemIndex}:`, sequenceItem);
              return (
                <div key={`${tag.id}-item-${itemIndex}`} className="sequence-item">
                  <div className="sequence-item-header">
                    Item {sequenceItem.itemNumber}
                  </div>
                  <div className="sequence-item-tags">
                    {sequenceItem.tags && sequenceItem.tags.map((childTag) => {
                      console.log(`Rendering child tag:`, childTag);
                      return renderTagWithChildren(childTag, depth + 1);
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="editor-section">
      <div className="editor-header">
        <h3 className="editor-title">Tag Editor</h3>
        <div className="editor-controls">
          <input
            type="text"
            className="search-box"
            placeholder="🔍 Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {hasOriginalData && (
            <button className="reset-button" onClick={onReset}>
              Reset Changes
            </button>
          )}
        </div>
      </div>
      
      <div className="tags-container">
        {filteredTags.length === 0 ? (
          <div className="no-results">
            {searchTerm ? 'No tags found matching your search.' : 'No tags available.'}
          </div>
        ) : (
          <div className="tag-list">
            {filteredTags.map((tag) => renderTagWithChildren(tag))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TagEditor;
