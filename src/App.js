/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { client, useConfig, useElementData, useElementColumns, useVariable, useActionTrigger } from '@sigmacomputing/plugin';
import { Button } from './components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings, { DEFAULT_SETTINGS } from './Settings';
import { processKanbanData } from './utils/dataProcessor';
import { debugCardMove } from './utils/columnHelper';
import KanbanBoard from './KanbanBoard';
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
  { name: 'updateRow', type: 'action-trigger', label: 'Update Row' }
]);

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const elementColumns = useElementColumns(config.source);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [optimisticData, setOptimisticData] = useState(null);

  // Get variables and action trigger
  const [idVariable, setIdVariable] = useVariable(config.selectedID);
  const [categoryVariable, setCategoryVariable] = useVariable(config.selectedCategory);
  const triggerUpdateRow = useActionTrigger(config.updateRow);

  // Debug: Log element columns structure
  console.log('Element Columns:', elementColumns);
  
  // Debug: Log current variable values
  console.log('Current variables:', {
    idVariable,
    categoryVariable,
    hasUpdateRowTrigger: !!triggerUpdateRow
  });

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
  const kanbanData = processKanbanData(sigmaData, config, settings, elementColumns);
  
  // Use optimistic data if available, otherwise use processed data
  const displayData = optimisticData || kanbanData;

  // Clear optimistic data when new data arrives
  useEffect(() => {
    if (sigmaData && optimisticData) {
      setOptimisticData(null);
    }
  }, [sigmaData]);

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