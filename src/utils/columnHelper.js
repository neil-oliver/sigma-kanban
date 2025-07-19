/**
 * Utility functions for working with Sigma column data
 * This file demonstrates how to use getElementColumns to access column information
 */

/**
 * Get column name from column key using elementColumns
 * @param {Object} elementColumns - Column information from getElementColumns
 * @param {string} columnKey - The column key to look up
 * @returns {string} - The column name or the key if not found
 */
export function getColumnName(elementColumns, columnKey) {
  if (!elementColumns || !columnKey) {
    return columnKey;
  }
  
  const columnInfo = elementColumns[columnKey];
  return columnInfo ? columnInfo.name : columnKey;
}

/**
 * Get column type from column key using elementColumns
 * @param {Object} elementColumns - Column information from getElementColumns
 * @param {string} columnKey - The column key to look up
 * @returns {string} - The column type or 'unknown' if not found
 */
export function getColumnType(elementColumns, columnKey) {
  if (!elementColumns || !columnKey) {
    return 'unknown';
  }
  
  const columnInfo = elementColumns[columnKey];
  return columnInfo ? columnInfo.columnType : 'unknown';
}

/**
 * Get all column names from elementColumns
 * @param {Object} elementColumns - Column information from getElementColumns
 * @returns {Array} - Array of column names
 */
export function getAllColumnNames(elementColumns) {
  if (!elementColumns) {
    return [];
  }
  
  return Object.values(elementColumns).map(col => col.name);
}

/**
 * Find column key by name using elementColumns
 * @param {Object} elementColumns - Column information from getElementColumns
 * @param {string} columnName - The column name to search for
 * @returns {string|null} - The column key or null if not found
 */
export function findColumnKeyByName(elementColumns, columnName) {
  if (!elementColumns || !columnName) {
    return null;
  }
  
  const entry = Object.entries(elementColumns).find(([key, col]) => col.name === columnName);
  return entry ? entry[0] : null;
}

/**
 * Example of how elementColumns data structure looks:
 * 
 * {
 *   "7C5P7RO3ZR": {
 *     "name": "Category",
 *     "columnType": "text",
 *     "id": "7C5P7RO3ZR"
 *   },
 *   "CUBMFAZ2EI": {
 *     "name": "Line 1",
 *     "columnType": "text",
 *     "id": "CUBMFAZ2EI"
 *   },
 *   "I95ACXRWGV": {
 *     "name": "Line 2",
 *     "columnType": "text",
 *     "id": "I95ACXRWGV"
 *   }
 * }
 * 
 * Usage:
 * 1. Import getElementColumns from @sigmacomputing/plugin
 * 2. Call getElementColumns(source) to get column information
 * 3. Use the column keys to access data from sigmaData
 * 4. Use the column names for display purposes
 */

/**
 * Validate that all required columns exist in elementColumns
 * @param {Object} elementColumns - Column information from getElementColumns
 * @param {Array|string} requiredColumns - Column keys that are required
 * @returns {Object} - { isValid, missingColumns }
 */
export function validateRequiredColumns(elementColumns, requiredColumns) {
  if (!elementColumns) {
    return {
      isValid: false,
      missingColumns: requiredColumns
    };
  }
  
  const columnKeys = Array.isArray(requiredColumns) ? requiredColumns : [requiredColumns];
  const missingColumns = columnKeys.filter(key => !elementColumns[key]);
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns
  };
}

/**
 * Debug utility for drag and drop operations
 * @param {Object} card - The card being moved
 * @param {string} fromBoard - The source board name
 * @param {string} toBoard - The target board name
 * @param {Object} config - The plugin configuration
 * @param {Object} elementColumns - Column information
 */
export function debugCardMove(card, fromBoard, toBoard, config, elementColumns) {
  console.group('Card Move Debug Info');
  console.log('Card:', {
    id: card.id,
    rowId: card.rowId,
    boardId: card.boardId,
    fields: card.fields
  });
  console.log('Move:', {
    fromBoard,
    toBoard
  });
  console.log('Config:', {
    source: config.source,
    ID: config.ID,
    category: config.category,
    selectedID: config.selectedID,
    selectedCategory: config.selectedCategory,
    updateRow: config.updateRow
  });
  console.log('Element Columns:', elementColumns);
  console.groupEnd();
}

/**
 * Get column information for debugging
 * @param {Object} elementColumns - Column information from getElementColumns
 * @param {string} columnKey - The column key to get info for
 * @returns {Object} - Column information or null
 */
export function getColumnInfo(elementColumns, columnKey) {
  if (!elementColumns || !columnKey) {
    return null;
  }
  
  return elementColumns[columnKey] || null;
} 