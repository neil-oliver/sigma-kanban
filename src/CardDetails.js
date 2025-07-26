import React, { useState, useEffect } from 'react';
import StyledField from './components/StyledField';
import { isImageUrl } from './utils/columnStyling';
import { DatePicker } from './components/DatePicker';
import { getColumnName } from './utils/columnHelper';

function CardDetails({ 
  card, 
  fieldLayout = 'stacked', 
  elementColumns, 
  config, 
  onUpdateDates,
  isModal = false // Add prop to distinguish between card view and modal
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

  // Debug logging
  console.log('Date editing debug:', {
    isModal,
    isDateEditingEnabled,
    config: config ? {
      enableWriteback: config.enableWriteback,
      startDate: config.startDate,
      endDate: config.endDate,
      selectedStartDate: config.selectedStartDate,
      selectedEndDate: config.selectedEndDate,
      selectedStartDateType: typeof config.selectedStartDate,
      selectedEndDateType: typeof config.selectedEndDate
    } : null,
    startDateColumnName,
    endDateColumnName,
    cardFields: card?.fields,
    startDateValue: card?.fields?.[startDateColumnName],
    endDateValue: card?.fields?.[endDateColumnName],
    startDateValueType: typeof card?.fields?.[startDateColumnName],
    endDateValueType: typeof card?.fields?.[endDateColumnName]
  });

  // Initialize dates from card data
  useEffect(() => {
    console.log('Initializing dates from card:', {
      card,
      startDateColumnName,
      endDateColumnName,
      startDateValue: card?.fields?.[startDateColumnName],
      endDateValue: card?.fields?.[endDateColumnName],
      startDateType: typeof card?.fields?.[startDateColumnName],
      endDateType: typeof card?.fields?.[endDateColumnName]
    });
    
    // Helper function to parse date string as local date (not UTC)
    const parseDateAsLocal = (dateString) => {
      if (!dateString) return null;
      
      console.log('Parsing date string:', dateString, typeof dateString);
      
      // If it's already a Date object, return it
      if (dateString instanceof Date) {
        return dateString;
      }
      
      // If it's a timestamp string, parse it
      if (typeof dateString === 'string' && /^\d+$/.test(dateString)) {
        const timestamp = parseInt(dateString, 10);
        const date = new Date(timestamp);
        
        // If this timestamp represents midnight UTC, convert it to local midnight
        // Check if the UTC time is 00:00:00
        const utcHours = date.getUTCHours();
        const utcMinutes = date.getUTCMinutes();
        const utcSeconds = date.getUTCSeconds();
        
        if (utcHours === 0 && utcMinutes === 0 && utcSeconds === 0) {
          // This is a midnight UTC timestamp, convert to local midnight
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth();
          const day = date.getUTCDate();
          return new Date(year, month, day);
        }
        
        return date;
      }
      
      // If it's a YYYY-MM-DD string, parse it as local date
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        // Create date in local timezone (month is 0-indexed)
        return new Date(year, month - 1, day);
      }
      
      // Try parsing as ISO string but treat as local
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = new Date(dateString);
        // If it's a valid date, adjust for timezone offset
        if (!isNaN(date.getTime())) {
          const offset = date.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
          return new Date(date.getTime() + offset);
        }
      }
      
      // Fallback to regular Date parsing
      return new Date(dateString);
    };
    
    if (card && startDateColumnName && card.fields[startDateColumnName]) {
      console.log('Parsing start date from card data:', {
        rawValue: card.fields[startDateColumnName],
        rawValueType: typeof card.fields[startDateColumnName],
        columnName: startDateColumnName
      });
      const parsedStartDate = parseDateAsLocal(card.fields[startDateColumnName]);
      console.log('Parsed start date result:', parsedStartDate);
      setStartDate(parsedStartDate);
    } else {
      setStartDate(null);
    }
    
    if (card && endDateColumnName && card.fields[endDateColumnName]) {
      console.log('Parsing end date from card data:', {
        rawValue: card.fields[endDateColumnName],
        rawValueType: typeof card.fields[endDateColumnName],
        columnName: endDateColumnName
      });
      const parsedEndDate = parseDateAsLocal(card.fields[endDateColumnName]);
      console.log('Parsed end date result:', parsedEndDate);
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

  // Helper function to find column key by field name
  const findColumnKeyByFieldName = (fieldName) => {
    if (!elementColumns) return null;
    return Object.keys(elementColumns).find(key => 
      elementColumns[key].name === fieldName
    );
  };

  const handleDateChange = (dateType, newDate) => {
    console.log('handleDateChange called:', { dateType, newDate, cardRowId: card?.rowId });
    
    if (dateType === 'start') {
      setStartDate(newDate);
      // Trigger update when start date changes - allow updating with just start date
      if (onUpdateDates && newDate) {
        console.log('Calling onUpdateDates with start date change:', { rowId: card.rowId, startDate: newDate, endDate });
        onUpdateDates(card.rowId, newDate, endDate);
      }
    } else if (dateType === 'end') {
      setEndDate(newDate);
      // Trigger update when end date changes - allow updating with just end date
      if (onUpdateDates && newDate) {
        console.log('Calling onUpdateDates with end date change:', { rowId: card.rowId, startDate, endDate: newDate });
        onUpdateDates(card.rowId, startDate, newDate);
      }
    }
  };

  const renderField = (fieldName, value) => {
    const columnKey = findColumnKeyByFieldName(fieldName);
    
    // Only skip rendering date fields if date editing is enabled (both columns + variables configured)
    // If only one column is configured, show dates as regular text fields
    if (isDateEditingEnabled && (fieldName === startDateColumnName || fieldName === endDateColumnName)) {
      return null;
    }
    
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
              .map(([fieldName, value]) => renderField(fieldName, value))
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