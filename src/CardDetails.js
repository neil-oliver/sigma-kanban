import React, { useState, useEffect } from 'react';
import { DatePicker } from './components/DatePicker';
import { getColumnName } from './utils/columnHelper';
import { renderField } from './utils/fieldRenderer';
import { parseDateAsLocal } from './utils/dateUtils';

function CardDetails({ 
  card, 
  fieldLayout = 'stacked', 
  elementColumns, 
  config, 
  onUpdateDates,
  isModal = false, // Add prop to distinguish between card view and modal
  showDates = false // Add prop to control date field visibility
}) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Check if date editing is enabled - only in modal and when all conditions are met
  const isDateEditingEnabled = Boolean(isModal && config && config.enableWriteback && 
    config.startDate && config.endDate && 
    config.selectedStartDate && config.selectedEndDate);

  // Get start and end date column names from config
  const startDateColumnName = config?.startDate ? getColumnName(elementColumns, config.startDate) : null;
  const endDateColumnName = config?.endDate ? getColumnName(elementColumns, config.endDate) : null;

  // Date editing configuration determined

  // Initialize dates from card data
  useEffect(() => {
    if (card && startDateColumnName && card.fields[startDateColumnName]) {
      const parsedStartDate = parseDateAsLocal(card.fields[startDateColumnName]);
      setStartDate(parsedStartDate);
    } else {
      setStartDate(null);
    }
    
    if (card && endDateColumnName && card.fields[endDateColumnName]) {
      const parsedEndDate = parseDateAsLocal(card.fields[endDateColumnName]);
      setEndDate(parsedEndDate);
    } else {
      setEndDate(null);
    }
  }, [card, startDateColumnName, endDateColumnName]);

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



  const handleDateChange = (dateType, newDate) => {
    if (dateType === 'start') {
      setStartDate(newDate);
      // Trigger update when start date changes - allow updating with just start date
      if (onUpdateDates && newDate) {
        onUpdateDates(card.rowId, newDate, endDate);
      }
    } else if (dateType === 'end') {
      setEndDate(newDate);
      // Trigger update when end date changes - allow updating with just end date
      if (onUpdateDates && newDate) {
        onUpdateDates(card.rowId, startDate, newDate);
      }
    }
  };

  // Use shared field renderer with date field handling
  const renderCardField = (fieldName, value) => {
    return renderField(fieldName, value, elementColumns, fieldLayout, {
      maxImageWidth: fieldLayout === 'inline' ? '120px' : '200px',
      maxImageHeight: fieldLayout === 'inline' ? '80px' : '150px',
      className: 'text-base',
      skipDateFields: isDateEditingEnabled || !showDates,
      startDateColumnName,
      endDateColumnName
    });
  };

  // Old renderField function removed - using shared utility

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background border-b border-gray-200 z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {card.title || 'Card Details'}
          </h1>
          <p className="text-gray-600 mt-2">
            Detailed information for this card
          </p>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Date Editing Section */}
          {isDateEditingEnabled && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label={startDateColumnName || "Start Date"}
                  value={startDate}
                  onChange={(date) => handleDateChange('start', date)}
                  placeholder="Select start date"
                />
                <DatePicker
                  label={endDateColumnName || "End Date"}
                  value={endDate}
                  onChange={(date) => handleDateChange('end', date)}
                  placeholder="Select end date"
                />
              </div>
            </div>
          )}

          {/* Card Fields */}
          <div className="space-y-4">
            {Object.entries(card.fields)
              .map(([fieldName, value]) => renderCardField(fieldName, value))
              .filter(Boolean) // Remove null entries from skipped date fields
            }
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
      </div>
    </div>
  );
}

export default CardDetails; 