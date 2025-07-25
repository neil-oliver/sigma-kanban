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

// Configure the plugin editor panel
client.config.configureEditorPanel([
  { name: 'source', type: 'element' },
  { name: 'ID', type: 'column', source: 'source', allowMultiple: false, label: 'ID Column' },
  { name: 'cardTitle', type: 'column', source: 'source', allowMultiple: true, label: 'Card Title' },
  { name: 'cardFields', type: 'column', source: 'source', allowMultiple: true, label: 'Card Fields' },
  { name: 'category', type: 'column', source: 'source', allowMultiple: false, label: 'Category Column' },
  { name: 'selectedID', type: 'variable', label: 'Selected ID Variable' },
  { name: 'selectedCategory', type: 'variable', label: 'Selected Category Variable' },
  { name: 'enableDragDrop', type: 'toggle', label: 'Enable Drag & Drop (Input Table Only)' },
  { name: 'config', type: 'text', label: 'Settings Config (JSON)', defaultValue:"{}"},
  { name: 'editMode', type: 'toggle', label: 'Edit Mode' },
  { name: 'updateRow', type: 'action-trigger', label: 'Update Row' },
  { name: 'openModal', type: 'action-trigger', label: 'Open Modal (External)' }
]);

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
  const triggerUpdateRow = useActionTrigger(config.updateRow);
  const triggerOpenModal = useActionTrigger(config.openModal);



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
    if (!config.enableDragDrop) return;
    
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
      
      // Trigger the updateRow action
      triggerUpdateRow();
      
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
        
        <div className="flex-1 overflow-hidden">
          <CardDetails 
            card={selectedCard} 
            fieldLayout={settings?.fieldLayout || 'stacked'} 
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
          enableDragDrop={config.enableDragDrop}
          onCardMove={handleCardMove}
          onCardClick={settings.modalPreference === 'external' ? handleCardClick : undefined}
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