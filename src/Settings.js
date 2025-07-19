import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';
import { getColumnName } from './utils/columnHelper';

// Default settings for kanban board
export const DEFAULT_SETTINGS = {
  cardLayout: 'comfortable', // 'comfortable', 'compact'
  fieldLayout: 'stacked', // 'stacked' (title above value), 'inline' (title and value side by side)
  showCardCounts: true, // Show number of cards in each board
  boardWidth: 'auto', // 'auto', 'fixed'
  boardOrder: 'data', // 'data' (order from data), 'alphabetical', 'custom'
  customBoardOrder: [], // Array of board names in custom order
  customCategories: [], // Array of custom category names
  useCustomCategories: false, // Whether to use custom categories instead of data
  cardSorting: 'none', // 'none', 'alphabetical', 'custom'
  sortColumn: '__card_title__', // Column to use for sorting cards
  sortDirection: 'asc', // 'asc' or 'desc'
  enableCardAnimations: true, // Smooth animations for drag and drop
  compactFieldDisplay: false, // Show field names inline vs above
  highlightEmptyBoards: true, // Visual indication for empty boards
};

function Settings({ 
  isOpen, 
  onClose, 
  currentSettings, 
  onSave, 
  client,
  elementColumns = {},
  config = {}
}) {
  const [tempSettings, setTempSettings] = useState(currentSettings);
  const [showHelp, setShowHelp] = useState(false);

  // Update temp settings when current settings change
  useEffect(() => {
    // Ensure all required properties exist with defaults
    const settingsWithDefaults = {
      ...DEFAULT_SETTINGS,
      ...currentSettings
    };
    setTempSettings(settingsWithDefaults);
  }, [currentSettings]);

  // Get available column names for sorting
  const getAvailableColumns = () => {
    if (!elementColumns) return [];
    
    // Get the category and ID column names to exclude them
    const categoryColumnName = config.category ? getColumnName(elementColumns, config.category) : null;
    const idColumnName = config.ID ? getColumnName(elementColumns, config.ID) : null;
    
    return Object.entries(elementColumns)
      .map(([key, column]) => ({
        key: column.name,
        name: column.name,
        type: column.columnType
      }))
      .filter(column => {
        // Exclude category and ID columns from sorting options
        return column.name !== categoryColumnName && column.name !== idColumnName;
      });
  };

  const availableColumns = getAvailableColumns();

  const handleSave = () => {
    const configJson = JSON.stringify(tempSettings, null, 2);
    
    try {
      client.config.set({ config: configJson });
      onSave(tempSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleCancel = () => {
    setTempSettings(currentSettings);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>Kanban Board Settings</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardLayout">Card Layout</Label>
              <Select
                value={tempSettings.cardLayout}
                onValueChange={(value) => setTempSettings({ ...tempSettings, cardLayout: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select card layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable (More Spacing)</SelectItem>
                  <SelectItem value="compact">Compact (Less Spacing)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Choose how much space cards take up</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldLayout">Field Layout</Label>
              <Select
                value={tempSettings.fieldLayout}
                onValueChange={(value) => setTempSettings({ ...tempSettings, fieldLayout: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stacked">Stacked (Title Above Value)</SelectItem>
                  <SelectItem value="inline">Inline (Title and Value Side by Side)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How field labels and values are arranged</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boardWidth">Board Width</Label>
              <Select
                value={tempSettings.boardWidth}
                onValueChange={(value) => setTempSettings({ ...tempSettings, boardWidth: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select board width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Responsive)</SelectItem>
                  <SelectItem value="fixed">Fixed Width</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How board columns should be sized</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boardOrder">Board Order</Label>
              <Select
                value={tempSettings.boardOrder}
                onValueChange={(value) => setTempSettings({ ...tempSettings, boardOrder: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select board order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Data Order</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="custom">Custom Order</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How to order the board columns</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCustomCategories">Use Custom Categories</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="useCustomCategories"
                  checked={tempSettings.useCustomCategories}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, useCustomCategories: checked })}
                />
                <Label htmlFor="useCustomCategories" className="text-sm font-normal">
                  {tempSettings.useCustomCategories ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Define your own board categories instead of using data values</p>
            </div>

            {tempSettings.useCustomCategories && (
              <div className="space-y-2">
                <Label htmlFor="customCategories">Custom Categories</Label>
                <div className="space-y-2">
                  {tempSettings.customCategories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => {
                          const newCategories = [...tempSettings.customCategories];
                          newCategories[index] = e.target.value;
                          setTempSettings({ ...tempSettings, customCategories: newCategories });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category name"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCategories = tempSettings.customCategories.filter((_, i) => i !== index);
                          setTempSettings({ ...tempSettings, customCategories: newCategories });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newCategories = [...tempSettings.customCategories, ''];
                      setTempSettings({ ...tempSettings, customCategories: newCategories });
                    }}
                    className="w-full"
                  >
                    Add Category
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Define the categories/boards you want to display. Cards will be assigned to these categories based on their data.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cardSorting">Card Sorting</Label>
              <Select
                value={tempSettings.cardSorting}
                onValueChange={(value) => setTempSettings({ ...tempSettings, cardSorting: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select card sorting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Sorting (Data Order)</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="custom">Custom Order</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How to sort cards within each board</p>
            </div>

            {tempSettings.cardSorting !== 'none' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sortColumn">Sort Column</Label>
                  <Select
                    value={tempSettings.sortColumn}
                    onValueChange={(value) => setTempSettings({ ...tempSettings, sortColumn: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column to sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__card_title__">No specific column (use card title)</SelectItem>
                      {availableColumns.map((column) => (
                        <SelectItem key={column.key} value={column.key}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Choose which column to use for sorting cards</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortDirection">Sort Direction</Label>
                  <Select
                    value={tempSettings.sortDirection}
                    onValueChange={(value) => setTempSettings({ ...tempSettings, sortDirection: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending (A-Z, 1-9)</SelectItem>
                      <SelectItem value="desc">Descending (Z-A, 9-1)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Choose the order for sorting</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="showCardCounts">Show Card Counts</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showCardCounts"
                  checked={tempSettings.showCardCounts}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, showCardCounts: checked })}
                />
                <Label htmlFor="showCardCounts" className="text-sm font-normal">
                  {tempSettings.showCardCounts ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Display the number of cards in each board header</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compactFieldDisplay">Compact Field Display</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="compactFieldDisplay"
                  checked={tempSettings.compactFieldDisplay}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, compactFieldDisplay: checked })}
                />
                <Label htmlFor="compactFieldDisplay" className="text-sm font-normal">
                  {tempSettings.compactFieldDisplay ? 'Inline Labels' : 'Stacked Labels'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Show field labels inline with values vs. above them</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enableCardAnimations">Card Animations</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableCardAnimations"
                  checked={tempSettings.enableCardAnimations}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, enableCardAnimations: checked })}
                />
                <Label htmlFor="enableCardAnimations" className="text-sm font-normal">
                  {tempSettings.enableCardAnimations ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Smooth animations during drag and drop operations</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlightEmptyBoards">Highlight Empty Boards</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="highlightEmptyBoards"
                  checked={tempSettings.highlightEmptyBoards}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, highlightEmptyBoards: checked })}
                />
                <Label htmlFor="highlightEmptyBoards" className="text-sm font-normal">
                  {tempSettings.highlightEmptyBoards ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Visual indication for boards with no cards</p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </>
  );
}

export default Settings; 