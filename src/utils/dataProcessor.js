import { getColumnName, validateRequiredColumns } from './columnHelper';

/**
 * Process Sigma data into kanban board structure
 * @param {Object} sigmaData - Sigma data object with column arrays
 * @param {Object} config - Configuration object with column names
 * @param {Object} settings - Settings object
 * @param {Object} elementColumns - Column information from getElementColumns
 * @returns {Object} - { boards, cards } or null if no valid data
 */
export function processKanbanData(sigmaData, config, settings, elementColumns) {
  if (!sigmaData || !config.cardFields || !config.category || !elementColumns) {
    console.warn('Missing required data for kanban processing:', {
      hasSigmaData: !!sigmaData,
      hasCardFields: !!config.cardFields,
      hasCategory: !!config.category,
      hasElementColumns: !!elementColumns
    });
    return null;
  }

  // Validate that all required columns exist
  const requiredColumns = Array.isArray(config.cardFields) 
    ? [...config.cardFields, config.category]
    : [config.cardFields, config.category];
  
  // Add ID column to validation if it exists
  if (config.ID) {
    requiredColumns.push(config.ID);
  }
  
  // Add cardTitle to validation if it exists
  if (config.cardTitle) {
    const cardTitleFields = Array.isArray(config.cardTitle) ? config.cardTitle : [config.cardTitle];
    requiredColumns.push(...cardTitleFields);
  }
  
  const columnValidation = validateRequiredColumns(elementColumns, requiredColumns);
  if (!columnValidation.isValid) {
    // Only show warning if we have some data but missing required columns
    if (sigmaData && Object.keys(sigmaData).length > 0) {
      console.warn('Missing required columns:', columnValidation.missingColumns);
    }
    return null;
  }

  // Get category column data using column key
  const categoryColumnKey = config.category;
  const categoryData = sigmaData[categoryColumnKey] || [];
  if (categoryData.length === 0) {
    // Only show warning if we have data but missing category column
    if (sigmaData && Object.keys(sigmaData).length > 0) {
      console.warn('No category column data found for key:', categoryColumnKey);
    }
    return null;
  }

  // Get ID column data if available
  const idColumnKey = config.ID;
  const idData = idColumnKey ? (sigmaData[idColumnKey] || []) : null;

  // Get card title data if available
  const cardTitleKey = config.cardTitle;
  const cardTitleData = cardTitleKey ? (sigmaData[cardTitleKey] || []) : null;

  // Get unique category names and create board objects
  let boards = [];
  
  if (settings.useCustomCategories && settings.customCategories && settings.customCategories.length > 0) {
    // Use custom categories
    boards = settings.customCategories
      .filter(category => category && category.trim() !== '')
      .map((categoryName, index) => ({
        id: `board-${index}`,
        name: String(categoryName)
      }));
  } else {
    // Use categories from data
    const uniqueCategories = [...new Set(categoryData.filter(category => category != null))];
    boards = uniqueCategories.map((categoryName, index) => ({
      id: `board-${index}`,
      name: String(categoryName)
    }));
  }

  // Process card fields data using column keys
  const cardFieldsData = {};
  const fieldNames = Array.isArray(config.cardFields) ? config.cardFields : [config.cardFields];
  
  // Include date columns if they're configured (show as regular fields when not editable)
  if (config.startDate) {
    fieldNames.push(config.startDate);
  }
  if (config.endDate) {
    fieldNames.push(config.endDate);
  }
  
  fieldNames.forEach(fieldKey => {
    if (sigmaData[fieldKey]) {
      cardFieldsData[fieldKey] = sigmaData[fieldKey];
    } else {
      // Only show warning if we have data but missing field
      if (sigmaData && Object.keys(sigmaData).length > 0) {
        console.warn('Field not found in sigma data:', fieldKey);
      }
    }
  });

  // Create cards
  const cards = [];
  const dataLength = categoryData.length;

  for (let i = 0; i < dataLength; i++) {
    const categoryValue = categoryData[i];
    if (categoryValue == null) continue;

    // Find the board for this card
    let board;
    if (settings.useCustomCategories && settings.customCategories && settings.customCategories.length > 0) {
      // When using custom categories, try to match the card's category value to a custom category
      const categoryString = String(categoryValue);
      board = boards.find(b => b.name.toLowerCase() === categoryString.toLowerCase());
      
      // If no exact match, try partial matching or assign to first board
      if (!board) {
        board = boards.find(b => 
          categoryString.toLowerCase().includes(b.name.toLowerCase()) ||
          b.name.toLowerCase().includes(categoryString.toLowerCase())
        );
      }
      
      // If still no match, assign to the first board (or skip if no boards)
      if (!board && boards.length > 0) {
        board = boards[0];
      }
    } else {
      // Use data categories as before
      board = boards.find(b => b.name === String(categoryValue));
    }
    
    // In detail view mode, we want to include all cards even if they don't have a matching board
    // For kanban view, we skip cards without a board
    if (!board && settings.viewMode !== 'detail') continue;
    
    // If no board found in detail view, create a default board or assign to first available
    if (!board && settings.viewMode === 'detail') {
      if (boards.length > 0) {
        board = boards[0]; // Assign to first board as fallback
      } else {
        // Create a default board if none exist
        board = { id: 'board-default', name: 'Default' };
        boards.push(board);
      }
    }

    // Extract field values for this card using column keys and names
    const fields = {};
    fieldNames.forEach(fieldKey => {
      if (cardFieldsData[fieldKey] && cardFieldsData[fieldKey][i] != null) {
        // Use column name from elementColumns if available, otherwise use key
        const fieldName = getColumnName(elementColumns, fieldKey);
        fields[fieldName] = String(cardFieldsData[fieldKey][i]);
      }
    });

    // Get card title if available
    let cardTitle = null;
    if (cardTitleData && cardTitleData[i] != null) {
      cardTitle = String(cardTitleData[i]);
    }

    // Only create card if it has at least one field with data
    if (Object.keys(fields).length > 0) {
      // Get the actual row ID from the ID column if available, otherwise use index
      const rowId = idData && idData[i] != null ? idData[i] : i;
      
      cards.push({
        id: i, // Keep array index for internal use
        rowId: rowId, // Store actual row ID for variable setting
        boardId: board.id,
        title: cardTitle, // Add card title
        fields,
        originalIndex: i // Keep track of original order for sorting
      });
    }
  }

  // Sort cards if sorting is enabled
  if (settings.cardSorting !== 'none') {
    cards.sort((a, b) => {
      let aValue, bValue;

      if (settings.sortColumn && settings.sortColumn !== '' && settings.sortColumn !== '__card_title__') {
        // Sort by specific column
        aValue = a.fields[settings.sortColumn] || '';
        bValue = b.fields[settings.sortColumn] || '';
      } else {
        // Sort by card title
        aValue = a.title || '';
        bValue = b.title || '';
      }

      // Handle numeric sorting for priority, dates, etc.
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Numeric sorting
        if (settings.sortDirection === 'desc') {
          return bNum - aNum;
        } else {
          return aNum - bNum;
        }
      } else {
        // String sorting
        if (settings.sortDirection === 'desc') {
          return bValue.localeCompare(aValue);
        } else {
          return aValue.localeCompare(bValue);
        }
      }
    });
  }



  return {
    boards,
    cards
  };
}

/**
 * Get summary statistics for kanban data
 * @param {Object} kanbanData - Processed kanban data
 * @returns {Object} - Summary statistics
 */
export function getKanbanStats(kanbanData) {
  if (!kanbanData || !kanbanData.boards || !kanbanData.cards) {
    return {
      totalBoards: 0,
      totalCards: 0,
      cardsPerBoard: {}
    };
  }

  const cardsPerBoard = {};
  kanbanData.boards.forEach(board => {
    cardsPerBoard[board.name] = kanbanData.cards.filter(card => card.boardId === board.id).length;
  });

  return {
    totalBoards: kanbanData.boards.length,
    totalCards: kanbanData.cards.length,
    cardsPerBoard
  };
}

/**
 * Validate kanban configuration
 * @param {Object} config - Configuration object
 * @returns {Object} - { isValid, errors }
 */
export function validateKanbanConfig(config) {
  const errors = [];

  if (!config.source) {
    errors.push('Data source is required');
  }

  if (!config.cardFields || (Array.isArray(config.cardFields) && config.cardFields.length === 0)) {
    errors.push('At least one card field is required');
  }

  if (!config.category) {
    errors.push('Category column is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 