import StyledField from '../components/StyledField';
import { isImageUrl } from './columnStyling';

/**
 * Helper function to find column key by field name
 * @param {Object} elementColumns - Column information from Sigma
 * @param {string} fieldName - The field name to look up
 * @returns {string|null} - The column key or null if not found
 */
export const findColumnKeyByFieldName = (elementColumns, fieldName) => {
  if (!elementColumns) return null;
  return Object.keys(elementColumns).find(key => 
    elementColumns[key].name === fieldName
  );
};

/**
 * Render a field with appropriate styling and layout
 * @param {string} fieldName - The field name
 * @param {any} value - The field value
 * @param {Object} elementColumns - Column information from Sigma
 * @param {string} fieldLayout - Layout type ('stacked' or 'inline')
 * @param {Object} options - Rendering options
 * @returns {JSX.Element|null} - Rendered field component
 */
export const renderField = (fieldName, value, elementColumns, fieldLayout = 'stacked', options = {}) => {
  const {
    maxImageWidth = '80px',
    maxImageHeight = '50px',
    className = 'text-sm',
    skipDateFields = false,
    startDateColumnName = null,
    endDateColumnName = null
  } = options;

  // Skip date fields if specified
  if (skipDateFields && (fieldName === startDateColumnName || fieldName === endDateColumnName)) {
    return null;
  }

  const columnKey = findColumnKeyByFieldName(elementColumns, fieldName);
  
  // Check if this field contains an image
  const isImageField = elementColumns && columnKey && (
    elementColumns[columnKey].columnType === 'link' || 
    (elementColumns[columnKey].columnType === 'text' && isImageUrl(value))
  );
  
  if (isImageField) {
    // Render image without field title or text block styling
    return (
      <div key={fieldName} className="mb-2 last:mb-0 flex justify-end">
        {elementColumns && columnKey ? (
          <StyledField 
            value={value} 
            columnKey={columnKey} 
            elementColumns={elementColumns}
            maxImageWidth={maxImageWidth}
            maxImageHeight={maxImageHeight}
            className={className}
          />
        ) : null}
      </div>
    );
  }
  
  if (fieldLayout === 'inline') {
    return (
      <div key={fieldName} className="mb-2 last:mb-0 flex items-center justify-between">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex-shrink-0 mr-2">
          {fieldName}:
        </div>
        <div className="text-sm text-right flex-1 truncate">
          {elementColumns && columnKey ? (
            <StyledField 
              value={value} 
              columnKey={columnKey} 
              elementColumns={elementColumns}
              maxImageWidth={maxImageWidth}
              maxImageHeight={maxImageHeight}
              className={className}
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
      <div key={fieldName} className="mb-2 last:mb-0">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {fieldName}
        </div>
        <div className="mt-1">
          {elementColumns && columnKey ? (
            <StyledField 
              value={value} 
              columnKey={columnKey} 
              elementColumns={elementColumns}
              maxImageWidth={maxImageWidth}
              maxImageHeight={maxImageHeight}
              className={className}
            />
          ) : (
            <span className="text-gray-900 text-sm">{value || 'N/A'}</span>
          )}
        </div>
      </div>
    );
  }
};

/**
 * Render card fields with consistent styling
 * @param {Object} card - The card object
 * @param {Object} elementColumns - Column information from Sigma
 * @param {string} fieldLayout - Layout type ('stacked' or 'inline')
 * @param {Object} options - Rendering options
 * @returns {Array} - Array of rendered field components
 */
export const renderCardFields = (card, elementColumns, fieldLayout = 'stacked', options = {}) => {
  if (!card || !card.fields) return [];
  
  return Object.entries(card.fields)
    .map(([fieldName, value]) => renderField(fieldName, value, elementColumns, fieldLayout, options))
    .filter(Boolean); // Remove null entries from skipped fields
}; 