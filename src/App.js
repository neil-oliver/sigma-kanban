/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { client, useConfig, useElementData, useElementColumns, useVariable, useActionTrigger } from '@sigmacomputing/plugin';
import { Button } from './components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings, { DEFAULT_SETTINGS } from './Settings';
import { processKanbanData } from './utils/dataProcessor';
import { debugCardMove } from './utils/columnHelper';
import KanbanBoard from './KanbanBoard';
import CardDetails from './CardDetails';
import './App.css';

// Function to build configuration array based on enableWriteback setting
const buildEditorPanelConfig = (enableWriteback = false) => {
  const baseConfig = [
    { name: 'source', type: 'element' },
    { name: 'ID', type: 'column', source: 'source', allowMultiple: false, label: 'ID Column' },
    { name: 'cardTitle', type: 'column', source: 'source', allowMultiple: true, label: 'Card Title' },
    { name: 'cardFields', type: 'column', source: 'source', allowMultiple: true, label: 'Card Fields' },
    { name: 'category', type: 'column', source: 'source', allowMultiple: false, label: 'Category Column' },
    { name: 'startDate', type: 'column', source: 'source', allowMultiple: false, label: 'Start Date Column (Optional)' },
    { name: 'endDate', type: 'column', source: 'source', allowMultiple: false, label: 'End Date Column (Optional)' },
    { name: 'enableWriteback', type: 'toggle', label: 'Enable Writeback' },
    { name: 'config', type: 'text', label: 'Settings Config (JSON)', defaultValue:"{}"},
    { name: 'editMode', type: 'toggle', label: 'Edit Mode' },
    { name: 'openModal', type: 'action-trigger', label: 'Open Modal (External)' }
  ];

  // Add drag-and-drop related items only when enableWriteback is true
  if (enableWriteback) {
    baseConfig.splice(7, 0, // Insert after the date columns but before enableWriteback
      { name: 'selectedID', type: 'variable', label: 'Selected ID Variable' },
      { name: 'selectedCategory', type: 'variable', label: 'Selected Category Variable' },
      { name: 'selectedStartDate', type: 'variable', label: 'Selected Start Date Variable' },
      { name: 'selectedEndDate', type: 'variable', label: 'Selected End Date Variable' }
    );
    baseConfig.push(
      { name: 'updateCategory', type: 'action-trigger', label: 'Update Category' },
      { name: 'updateDates', type: 'action-trigger', label: 'Update Dates' }
    );
  }

  return baseConfig;
};

// Initial configuration setup
client.config.configureEditorPanel(buildEditorPanelConfig());

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const elementColumns = useElementColumns(config.source);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [optimisticData, setOptimisticData] = useState(null);

  // Get variables and action triggers
  const [idVariable, setIdVariable] = useVariable(config.selectedID);
  const [, setCategoryVariable] = useVariable(config.selectedCategory);
  const [, setStartDateVariable] = useVariable(config.selectedStartDate);
  const [, setEndDateVariable] = useVariable(config.selectedEndDate);
  const triggerUpdateCategory = useActionTrigger(config.updateCategory);
  const triggerUpdateDates = useActionTrigger(config.updateDates);
  const triggerOpenModal = useActionTrigger(config.openModal);

  // Reconfigure editor panel when enableWriteback changes
  useEffect(() => {
    const newConfig = buildEditorPanelConfig(config.enableWriteback);
    client.config.configureEditorPanel(newConfig);
  }, [config.enableWriteback]);

  // Parse config JSON and load settings
  useEffect(() => {
    if (config.config && config.config.trim()) {
      try {
        const parsedConfig = JSON.parse(config.config);
        const newSettings = { ...DEFAULT_SETTINGS, ...parsedConfig };
        setSettings(newSettings);
      } catch (err) {
        console.error('Invalid config JSON:', err);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [config.config]);

  // Process kanban data with column information
  // Only process if we have the minimum required configuration
  const kanbanData = (config.source && config.cardFields && config.category) 
    ? processKanbanData(sigmaData, config, settings, elementColumns)
    : null;
  
  // Use optimistic data if available, otherwise use processed data
  const displayData = optimisticData || kanbanData;
  
  // In detail view mode, if we don't have processed data yet, we might need to process it differently
  // or wait for the data to be available
  


  // Find selected card based on selectedID variable
  const findCardById = (cardId) => {
    if (!displayData || !displayData.cards || !cardId) return null;
    
    // Extract the actual value from the Sigma variable object
    let actualCardId = cardId;
    if (cardId && typeof cardId === 'object') {
      // Handle different Sigma variable object structures
      if (cardId.value !== undefined) {
        actualCardId = cardId.value;
      } else if (cardId.defaultValue && cardId.defaultValue.value !== undefined) {
        actualCardId = cardId.defaultValue.value;
      }
    }
    
    // Try to find by rowId first (this is the actual task ID from the data)
    let card = displayData.cards.find(card => card.rowId === actualCardId);
    
    // If not found by rowId, try by internal id
    if (!card) {
      card = displayData.cards.find(card => card.id === actualCardId);
    }
    
    // If still not found, try string comparison (in case of type mismatches)
    if (!card) {
      card = displayData.cards.find(card => 
        String(card.rowId) === String(actualCardId) || 
        String(card.id) === String(actualCardId)
      );
    }
    
    return card;
  };

  const selectedCard = findCardById(idVariable);

  // Clear optimistic data when new data arrives (but not in detail view mode)
  useEffect(() => {
    if (sigmaData && optimisticData && settings.viewMode !== 'detail') {
      setOptimisticData(null);
    }
  }, [sigmaData, settings.viewMode]);

  // Clear updating state after a timeout (fallback)
  useEffect(() => {
    if (optimisticData && optimisticData.updatingCardIds) {
      const timeout = setTimeout(() => {
        setOptimisticData(prev => prev ? { ...prev, updatingCardIds: [] } : null);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [optimisticData]);

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
  };

  const handleCardMove = async (cardId, fromBoard, toBoard) => {
    if (!config.enableWriteback) return;
    
    try {
      console.log('Card move triggered:', { cardId, fromBoard, toBoard });
      
      // Find the card to get the actual rowId
      const card = kanbanData.cards.find(c => c.id === cardId);
      if (!card) {
        console.error('Card not found:', cardId);
        return;
      }
      
      // Debug the card move operation
      debugCardMove(card, fromBoard, toBoard, config, elementColumns);
      
      // Optimistically update the local state immediately
      if (kanbanData) {
        const optimisticKanbanData = {
          ...kanbanData,
          cards: kanbanData.cards.map(c => {
            if (c.id === cardId) {
              // Find the new board
              const newBoard = kanbanData.boards.find(b => b.name === toBoard);
              return {
                ...c,
                boardId: newBoard ? newBoard.id : c.boardId
              };
            }
            return c;
          }),
          updatingCardIds: [cardId] // Track which card is being updated
        };
        setOptimisticData(optimisticKanbanData);
      }
      
      // Set the ID variable with the selected card's actual row ID
      const actualRowId = card.rowId;
      setIdVariable(actualRowId);
      
      // Set the category variable with the selected card's board column value
      setCategoryVariable(toBoard);
      
      // Trigger the updateCategory action
      triggerUpdateCategory();
      
      console.log('Variables set and action triggered:', {
        id: actualRowId,
        category: toBoard
      });
    } catch (error) {
      console.error('Error updating card position:', error);
      setError(`Failed to update card: ${error.message}`);
      // Clear optimistic data on error
      setOptimisticData(null);
    }
  };

  const handleUpdateDates = async (rowId, startDate, endDate) => {
    if (!config.enableWriteback) return;
    
    try {
      console.log('Date update triggered:', { rowId, startDate, endDate });
      
      // Normalize the new dates
      let normalizedStartDate = null;
      let normalizedEndDate = null;

      console.log('Date normalization input:', { startDate, endDate, startDateType: typeof startDate, endDateType: typeof endDate });

      // Handle start date normalization
      if (startDate instanceof Date) {
        normalizedStartDate = startDate;
      } else if (typeof startDate === 'string') {
        // Handle timestamp strings (e.g., "1750723200000")
        if (/^\d+$/.test(startDate)) {
          const timestamp = parseInt(startDate, 10);
          normalizedStartDate = new Date(timestamp);
        } else {
          normalizedStartDate = new Date(startDate);
        }
      } else if (Array.isArray(startDate) && startDate.length > 0) {
        const firstDate = startDate[0];
        if (firstDate instanceof Date) {
          normalizedStartDate = firstDate;
        } else if (typeof firstDate === 'string' && /^\d+$/.test(firstDate)) {
          const timestamp = parseInt(firstDate, 10);
          normalizedStartDate = new Date(timestamp);
        } else {
          normalizedStartDate = new Date(String(firstDate));
        }
      }

      // Handle end date normalization
      if (endDate instanceof Date) {
        normalizedEndDate = endDate;
      } else if (typeof endDate === 'string') {
        // Handle timestamp strings (e.g., "1750723200000")
        if (/^\d+$/.test(endDate)) {
          const timestamp = parseInt(endDate, 10);
          normalizedEndDate = new Date(timestamp);
        } else {
          normalizedEndDate = new Date(endDate);
        }
      } else if (Array.isArray(endDate) && endDate.length > 0) {
        const firstDate = endDate[0];
        if (firstDate instanceof Date) {
          normalizedEndDate = firstDate;
        } else if (typeof firstDate === 'string' && /^\d+$/.test(firstDate)) {
          const timestamp = parseInt(firstDate, 10);
          normalizedEndDate = new Date(timestamp);
        } else {
          normalizedEndDate = new Date(String(firstDate));
        }
      }

      console.log('Date normalization result:', { 
        normalizedStartDate, 
        normalizedEndDate,
        startDateValid: normalizedStartDate && !isNaN(normalizedStartDate.getTime()),
        endDateValid: normalizedEndDate && !isNaN(normalizedEndDate.getTime())
      });

      // Set the ID variable with the selected card's row ID
      if (config.selectedID && rowId !== undefined) {
        try {
          await setIdVariable(rowId);
        } catch (error) {
          console.error('Error setting ID variable:', error);
        }
      }
      
      // Handle start date - set as YYYY-MM-DD string format in local timezone
      if (config.selectedStartDate && normalizedStartDate && !isNaN(normalizedStartDate.getTime())) {
        try {
          // Format as YYYY-MM-DD in local timezone
          const year = normalizedStartDate.getFullYear();
          const month = String(normalizedStartDate.getMonth() + 1).padStart(2, '0');
          const day = String(normalizedStartDate.getDate()).padStart(2, '0');
          const startDateFormatted = `${year}-${month}-${day}`;
          await setStartDateVariable(startDateFormatted);
        } catch (error) {
          console.error('Error setting start date variable:', error);
        }
      }
      
      // Handle end date - set as YYYY-MM-DD string format in local timezone
      if (config.selectedEndDate && normalizedEndDate && !isNaN(normalizedEndDate.getTime())) {
        try {
          // Format as YYYY-MM-DD in local timezone
          const year = normalizedEndDate.getFullYear();
          const month = String(normalizedEndDate.getMonth() + 1).padStart(2, '0');
          const day = String(normalizedEndDate.getDate()).padStart(2, '0');
          const endDateFormatted = `${year}-${month}-${day}`;
          await setEndDateVariable(endDateFormatted);
        } catch (error) {
          console.error('Error setting end date variable:', error);
        }
      }
      
      // Trigger the updateDates action
      if (triggerUpdateDates) {
        await triggerUpdateDates();
      }
      
      console.log('Date variables set and action triggered:', {
        id: rowId,
        startDate: normalizedStartDate && !isNaN(normalizedStartDate.getTime()) ? 
          `${normalizedStartDate.getFullYear()}-${String(normalizedStartDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedStartDate.getDate()).padStart(2, '0')}` : null,
        endDate: normalizedEndDate && !isNaN(normalizedEndDate.getTime()) ? 
          `${normalizedEndDate.getFullYear()}-${String(normalizedEndDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedEndDate.getDate()).padStart(2, '0')}` : null
      });
    } catch (error) {
      console.error('Error updating card dates:', error);
      setError(`Failed to update dates: ${error.message}`);
    }
  };

  const handleCardClick = (card) => {
    if (settings.modalPreference === 'external') {
      // Set the ID variable and trigger the external modal action
      setIdVariable(card.rowId);
      triggerOpenModal();
    }
    // For internal modal, KanbanBoard handles the modal state directly
  };

  if (error) {
    return (
      <div className="h-screen bg-background text-foreground flex items-center justify-center p-10">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!config.source || !config.cardFields || !config.category) {
    return (
      <div className="h-screen bg-background text-foreground flex items-center justify-center p-10">
        <div className="text-center max-w-xl">
          <h3 className="text-lg font-semibold mb-2">Kanban Board Plugin</h3>
          <p className="text-muted-foreground">Please configure the data source, card fields, and category column.</p>
        </div>
      </div>
    );
  }

  if (!sigmaData || !displayData) {
    return (
      <div className="h-screen bg-background text-foreground flex items-center justify-center p-10">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">Loading data...</h3>
        </div>
      </div>
    );
  }

  // Render based on view mode
  if (settings.viewMode === 'detail') {
    // Detail view mode - show only card details
    return (
      <div className="h-screen bg-background text-foreground relative flex flex-col">
        {config.editMode && (
          <Button 
            className="absolute top-5 right-5 z-10 gap-2"
            onClick={() => setShowSettings(true)}
            size="sm"
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Button>
        )}
        
        <div className="flex-1 overflow-y-auto">
          <CardDetails 
            card={selectedCard} 
            fieldLayout={settings?.fieldLayout || 'stacked'}
            elementColumns={elementColumns}
            config={config}
            onUpdateDates={handleUpdateDates}
          />
        </div>
        
        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentSettings={settings}
          onSave={handleSettingsSave}
          client={client}
          elementColumns={elementColumns}
          config={config}
        />
      </div>
    );
  }

  // Kanban view mode (default)
  return (
    <div className="h-screen bg-background text-foreground relative flex flex-col">
      {config.editMode && (
        <Button 
          className="absolute top-5 right-5 z-10 gap-2"
          onClick={() => setShowSettings(true)}
          size="sm"
        >
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Button>
      )}
      
      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          data={displayData}
          settings={settings}
          enableWriteback={config.enableWriteback}
          onCardMove={handleCardMove}
          onCardClick={settings.modalPreference === 'external' ? handleCardClick : undefined}
          elementColumns={elementColumns}
          config={config}
          onUpdateDates={handleUpdateDates}
        />
      </div>
      
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentSettings={settings}
        onSave={handleSettingsSave}
        client={client}
        elementColumns={elementColumns}
        config={config}
      />
    </div>
  );
}

export default App; 