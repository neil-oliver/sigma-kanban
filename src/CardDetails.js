import React from 'react';
import StyledField from './components/StyledField';
import { isImageUrl } from './utils/columnStyling';

function CardDetails({ card, fieldLayout = 'stacked', elementColumns }) {
  if (!card) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Card Selected</h3>
          <p className="text-gray-500">Select a card to view its details.</p>
        </div>
      </div>
    );
  }

  // Helper function to find column key by field name
  const findColumnKeyByFieldName = (fieldName) => {
    if (!elementColumns) return null;
    return Object.keys(elementColumns).find(key => 
      elementColumns[key].name === fieldName
    );
  };

  const renderField = (fieldName, value) => {
    const columnKey = findColumnKeyByFieldName(fieldName);
    
    // Check if this field contains an image
    const isImageField = elementColumns && columnKey && (
      elementColumns[columnKey].columnType === 'link' || 
      (elementColumns[columnKey].columnType === 'text' && isImageUrl(value))
    );
    
    if (isImageField) {
      // Render image without field title or text block styling
      return (
        <div key={fieldName} className="mb-4 last:mb-0 flex justify-end">
          {elementColumns && columnKey ? (
            <StyledField 
              value={value} 
              columnKey={columnKey} 
              elementColumns={elementColumns}
              maxImageWidth="200px"
              maxImageHeight="150px"
              className="text-base"
            />
          ) : null}
        </div>
      );
    }
    
    if (fieldLayout === 'inline') {
      return (
        <div key={fieldName} className="mb-4 last:mb-0 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide flex-shrink-0 mr-4">
            {fieldName}:
          </div>
          <div className="text-base text-right flex-1">
            {elementColumns && columnKey ? (
              <StyledField 
                value={value} 
                columnKey={columnKey} 
                elementColumns={elementColumns}
                maxImageWidth="120px"
                maxImageHeight="80px"
                className="text-base"
              />
            ) : (
              <span className="text-gray-900">{value || 'N/A'}</span>
            )}
          </div>
        </div>
      );
    } else {
      // stacked layout (default)
      return (
        <div key={fieldName} className="mb-4 last:mb-0">
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            {fieldName}
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            {elementColumns && columnKey ? (
              <StyledField 
                value={value} 
                columnKey={columnKey} 
                elementColumns={elementColumns}
                maxImageWidth="200px"
                maxImageHeight="150px"
                className="text-base"
              />
            ) : (
              <span className="text-gray-900">{value || 'N/A'}</span>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="p-6">
      {/* Card Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {card.title || 'Card Details'}
        </h1>
        <p className="text-gray-600 mt-2">
          Detailed information for this card
        </p>
      </div>
      
      {/* Card Fields */}
      <div className="space-y-4">
        {Object.entries(card.fields).map(([fieldName, value]) => renderField(fieldName, value))}
      </div>
      
      {/* Additional Card Information */}
      {card.rowId && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <span className="font-medium text-gray-600">Task ID:</span>
            <span className="ml-2 text-gray-900">{card.rowId}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardDetails; 