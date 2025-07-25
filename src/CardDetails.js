import React from 'react';

function CardDetails({ card, fieldLayout = 'stacked' }) {
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

  const renderField = (fieldName, value) => {
    if (fieldLayout === 'inline') {
      return (
        <div key={fieldName} className="mb-4 last:mb-0 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide flex-shrink-0 mr-4">
            {fieldName}:
          </div>
          <div className="text-base text-gray-900 text-right flex-1">
            {value || 'N/A'}
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
          <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md">
            {value || 'N/A'}
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