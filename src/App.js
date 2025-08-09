import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { client, useConfig, useElementData, useElementColumns, useVariable, useActionTrigger } from '@sigmacomputing/plugin';
import { Button } from './components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings, { DEFAULT_SETTINGS } from './Settings';
import { processKanbanData, sortCardsForSettings } from './utils/dataProcessor';
import { normalizeDate, formatDateAsLocal } from './utils/dateUtils';
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
        // Invalid config JSON - falling back to defaults
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [config.config]);

  // Apply theme variables from settings
  useEffect(() => {
    const colors = settings?.styling?.customColors;
    if (!colors) return;
    Object.entries(colors).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }, [settings?.styling]);

  // Process kanban data with column information - memoized for performance
  const kanbanData = useMemo(() => {
    return (config.source && config.cardFields && config.category) 
      ? processKanbanData(sigmaData, config, settings, elementColumns)
      : null;
  }, [sigmaData, config, settings, elementColumns]);
  
  // Use optimistic data if available, otherwise use processed data
  const displayData = optimisticData || kanbanData;
  
  // In detail view mode, if we don't have processed data yet, we might need to process it differently
  // or wait for the data to be available
  


  // Find selected card based on selectedID variable - memoized for performance
  const selectedCard = useMemo(() => {
    if (!displayData || !displayData.cards || !idVariable) return null;
    
    // Extract the actual value from the Sigma variable object
    let actualCardId = idVariable;
    if (idVariable && typeof idVariable === 'object') {
      // Handle different Sigma variable object structures
      if (idVariable.value !== undefined) {
        actualCardId = idVariable.value;
      } else if (idVariable.defaultValue && idVariable.defaultValue.value !== undefined) {
        actualCardId = idVariable.defaultValue.value;
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
  }, [displayData, idVariable]);

  // Clear optimistic data only when refreshed data reflects the same updates
  useEffect(() => {
    if (!optimisticData || settings.viewMode === 'detail') return;
    // If we have derived kanbanData from the new sigmaData
    if (!kanbanData) return;

    const updatingIds = optimisticData.updatingCardIds || [];
    if (updatingIds.length === 0) return;

    const allMatched = updatingIds.every((id) => {
      const newCard = kanbanData.cards.find((c) => c.id === id);
      const optCard = optimisticData.cards.find((c) => c.id === id);
      return newCard && optCard && newCard.boardId === optCard.boardId;
    });

    if (allMatched) {
      setOptimisticData(null);
    }
  }, [sigmaData, kanbanData, optimisticData, settings.viewMode]);

  // Clear updating state after a timeout (fallback)
  useEffect(() => {
    if (optimisticData && optimisticData.updatingCardIds) {
      const timeout = setTimeout(() => {
        setOptimisticData(prev => prev ? { ...prev, updatingCardIds: [] } : null);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [optimisticData]);

  const handleSettingsSave = useCallback((newSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
  }, []);

  const handleCardMove = useCallback(async (cardId, fromBoard, toBoard) => {
    if (!config.enableWriteback) return;
    
    try {
      // Use currently displayed data as basis for optimistic update
      const basisData = optimisticData || kanbanData;
      if (!basisData) return;

      // Find the card to get the actual rowId
      const card = basisData.cards.find(c => c.id === cardId);
      if (!card) {
        return;
      }
      
      // Optimistically update the local state immediately
      if (basisData) {
        const updatedCards = basisData.cards.map(c => {
          if (c.id === cardId) {
            const newBoard = basisData.boards.find(b => b.name === toBoard);
            return {
              ...c,
              boardId: newBoard ? newBoard.id : c.boardId
            };
          }
          return c;
        });

        const sortedCards = settings.cardSorting !== 'none'
          ? sortCardsForSettings(updatedCards, settings)
          : updatedCards;

        const optimisticKanbanData = {
          ...basisData,
          cards: sortedCards,
          updatingCardIds: [cardId]
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
      
      // Variables set and action triggered successfully
    } catch (error) {
      setError(`Failed to update card: ${error.message}`);
      // Clear optimistic data on error
      setOptimisticData(null);
    }
  }, [config.enableWriteback, kanbanData, optimisticData, settings, setIdVariable, setCategoryVariable, triggerUpdateCategory]);

  const handleUpdateDates = useCallback(async (rowId, startDate, endDate) => {
    if (!config.enableWriteback) return;
    
    try {
      // Normalize the new dates using shared utility
      const normalizedStartDate = normalizeDate(startDate);
      const normalizedEndDate = normalizeDate(endDate);

      // Set the ID variable with the selected card's row ID
      if (config.selectedID && rowId !== undefined) {
        try {
          await setIdVariable(rowId);
        } catch (error) {
          // Error setting ID variable - continue with other operations
        }
      }
      
      // Handle start date - set as YYYY-MM-DD string format in local timezone
      if (config.selectedStartDate && normalizedStartDate) {
        try {
          const startDateFormatted = formatDateAsLocal(normalizedStartDate);
          if (startDateFormatted) {
            await setStartDateVariable(startDateFormatted);
          }
        } catch (error) {
          // Error setting start date variable - continue with other operations
        }
      }
      
      // Handle end date - set as YYYY-MM-DD string format in local timezone
      if (config.selectedEndDate && normalizedEndDate) {
        try {
          const endDateFormatted = formatDateAsLocal(normalizedEndDate);
          if (endDateFormatted) {
            await setEndDateVariable(endDateFormatted);
          }
        } catch (error) {
          // Error setting end date variable - continue with other operations
        }
      }
      
      // Trigger the updateDates action
      if (triggerUpdateDates) {
        await triggerUpdateDates();
      }
      
      // Date variables set and action triggered successfully
    } catch (error) {
      setError(`Failed to update dates: ${error.message}`);
    }
  }, [config.enableWriteback, config.selectedID, config.selectedStartDate, config.selectedEndDate, setIdVariable, setStartDateVariable, setEndDateVariable, triggerUpdateDates]);

  const handleCardClick = useCallback((card) => {
    if (settings.modalPreference === 'external') {
      // Set the ID variable and trigger the external modal action
      setIdVariable(card.rowId);
      triggerOpenModal();
    }
    // For internal modal, KanbanBoard handles the modal state directly
  }, [settings.modalPreference, setIdVariable, triggerOpenModal]);

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
            className="absolute top-5 right-5 z-50 gap-2"
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
          isModal={true}
          showDates={settings?.showDates ?? false}
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
          className="absolute top-5 right-5 z-50 gap-2"
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