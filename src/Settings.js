import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { HelpCircle, Palette, RotateCcw } from 'lucide-react';
import HelpModal from './HelpModal';
import { getColumnName } from './utils/columnHelper';
import { getColumnTypeStyles } from './utils/columnStyling';
import * as LucideIcons from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { HslaColorPicker } from 'react-colorful';

// Preset themes (align with Tailwind CSS variables in index.css)
const PRESET_THEMES = {
  light: {
    name: 'Light',
    colors: {
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '240 10% 3.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 10% 3.9%',
      '--primary': '240 9% 10%',
      '--primary-foreground': '0 0% 98%',
      '--secondary': '240 4.8% 95.9%',
      '--secondary-foreground': '240 5.9% 10%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 5.9% 90%',
      '--input': '240 5.9% 90%',
      '--ring': '240 5.9% 10%',
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      '--background': '240 10% 3.9%',
      '--foreground': '0 0% 98%',
      '--card': '240 10% 3.9%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 10% 3.9%',
      '--popover-foreground': '0 0% 98%',
      '--primary': '0 0% 98%',
      '--primary-foreground': '240 5.9% 10%',
      '--secondary': '240 3.7% 15.9%',
      '--secondary-foreground': '0 0% 98%',
      '--muted': '240 3.7% 15.9%',
      '--muted-foreground': '240 5% 64.9%',
      '--accent': '240 3.7% 15.9%',
      '--accent-foreground': '0 0% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 3.7% 15.9%',
      '--input': '240 3.7% 15.9%',
      '--ring': '240 4.9% 83.9%',
    }
  },
  blue: {
    name: 'Ocean Blue',
    colors: {
      '--background': '210 40% 98%',
      '--foreground': '222.2 84% 4.9%',
      '--card': '210 40% 98%',
      '--card-foreground': '222.2 84% 4.9%',
      '--popover': '210 40% 98%',
      '--popover-foreground': '222.2 84% 4.9%',
      '--primary': '221.2 83.2% 53.3%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96%',
      '--secondary-foreground': '222.2 84% 4.9%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--accent': '210 40% 96%',
      '--accent-foreground': '222.2 84% 4.9%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--input': '214.3 31.8% 91.4%',
      '--ring': '221.2 83.2% 53.3%',
    }
  },
  green: {
    name: 'Forest Green',
    colors: {
      '--background': '140 40% 98%',
      '--foreground': '140 10% 4.9%',
      '--card': '140 40% 98%',
      '--card-foreground': '140 10% 4.9%',
      '--popover': '140 40% 98%',
      '--popover-foreground': '140 10% 4.9%',
      '--primary': '142.1 76.2% 36.3%',
      '--primary-foreground': '355.7 100% 97.3%',
      '--secondary': '140 40% 96%',
      '--secondary-foreground': '140 10% 4.9%',
      '--muted': '140 40% 96%',
      '--muted-foreground': '140 5% 46.9%',
      '--accent': '140 40% 96%',
      '--accent-foreground': '140 10% 4.9%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '140 40% 98%',
      '--border': '140 30% 91.4%',
      '--input': '140 30% 91.4%',
      '--ring': '142.1 76.2% 36.3%',
    }
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      '--background': '270 40% 98%',
      '--foreground': '270 10% 4.9%',
      '--card': '270 40% 98%',
      '--card-foreground': '270 10% 4.9%',
      '--popover': '270 40% 98%',
      '--popover-foreground': '270 10% 4.9%',
      '--primary': '262.1 83.3% 57.8%',
      '--primary-foreground': '270 40% 98%',
      '--secondary': '270 40% 96%',
      '--secondary-foreground': '270 10% 4.9%',
      '--muted': '270 40% 96%',
      '--muted-foreground': '270 5% 46.9%',
      '--accent': '270 40% 96%',
      '--accent-foreground': '270 10% 4.9%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '270 40% 98%',
      '--border': '270 30% 91.4%',
      '--input': '270 30% 91.4%',
      '--ring': '262.1 83.3% 57.8%',
    }
  }
};

// Apply theme colors to CSS custom properties
const applyThemeColors = (theme, customColors = null) => {
  const colors = customColors || (PRESET_THEMES[theme]?.colors || PRESET_THEMES.light.colors);
  Object.entries(colors).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
};

// HSLA helpers for storage as CSS var-friendly strings: "h s% l% / a"
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const parseHslaString = (value) => {
  if (!value) return { h: 0, s: 0, l: 50, a: 1 };
  // Expected forms: "h s% l%" or "h s% l% / a"
  const [hslPart, alphaPart] = value.split('/').map((v) => v.trim());
  const [hStr, sStr, lStr] = hslPart.split(' ').map((v) => v.trim());
  const h = Number.parseFloat(hStr || '0');
  const s = Number.parseFloat((sStr || '0').replace('%', ''));
  const l = Number.parseFloat((lStr || '50').replace('%', ''));
  const a = alphaPart !== undefined ? Number.parseFloat(alphaPart) : 1;
  return {
    h: clamp(Number.isFinite(h) ? h : 0, 0, 360),
    s: clamp(Number.isFinite(s) ? s : 0, 0, 100),
    l: clamp(Number.isFinite(l) ? l : 50, 0, 100),
    a: clamp(Number.isFinite(a) ? a : 1, 0, 1),
  };
};
const formatHslaString = ({ h, s, l, a }) => `${Math.round(clamp(h ?? 0, 0, 360))} ${Math.round(clamp(s ?? 0, 0, 100))}% ${Math.round(clamp(l ?? 50, 0, 100))}% / ${clamp(a ?? 1, 0, 1)}`;

function ColorPickerField({ label, colorKey, value, onChange }) {
  const hsla = parseHslaString(value);
  const swatchStyle = {
    backgroundColor: `hsl(${formatHslaString(hsla)})`,
  };
  // Checkerboard background
  const checkerBg = {
    backgroundImage:
      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  };
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-normal min-w-0 flex-1">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-8 h-8 rounded border border-border overflow-hidden"
            style={checkerBg}
            aria-label={`Pick ${label}`}
          >
            <div className="w-full h-full" style={swatchStyle} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="space-y-2">
            <HslaColorPicker
              color={hsla}
              onChange={(c) => onChange(colorKey, formatHslaString(c))}
            />
            <div className="text-xs text-muted-foreground">
              {formatHslaString(hsla)}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Default settings for kanban board
export const DEFAULT_SETTINGS = {
  viewMode: 'kanban', // 'kanban' or 'detail' - determines if plugin shows kanban board or detail view
  modalPreference: 'internal', // 'internal' or 'external' - determines modal behavior in kanban view
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
  showDates: false, // Show start and end dates on kanban cards
  // Styling for Kanban (theme + custom colors)
  styling: {
    theme: 'light', // 'light', 'dark', 'blue', 'green', 'purple', 'custom'
    customColors: {
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '240 10% 3.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 10% 3.9%',
      '--primary': '240 9% 10%',
      '--primary-foreground': '0 0% 98%',
      '--secondary': '240 4.8% 95.9%',
      '--secondary-foreground': '240 5.9% 10%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 5.9% 90%',
      '--input': '240 5.9% 90%',
      '--ring': '240 5.9% 10%',
    },
    enableDynamicTheming: true,
  },
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
  const [activeTab, setActiveTab] = useState('general');

  // Update temp settings when current settings change
  useEffect(() => {
    // Ensure all required properties exist with defaults
    const settingsWithDefaults = {
      ...DEFAULT_SETTINGS,
      ...currentSettings
    };
    setTempSettings(settingsWithDefaults);
  }, [currentSettings]);

  

  // Apply theme dynamically when enabled and dialog is open
  useEffect(() => {
    if (tempSettings.styling?.enableDynamicTheming && isOpen) {
      if (tempSettings.styling.theme === 'custom') {
        applyThemeColors('custom', tempSettings.styling.customColors);
      } else {
        applyThemeColors(tempSettings.styling.theme);
      }
    }
  }, [tempSettings.styling, isOpen]);

  const handleThemeChange = (theme) => {
    const newStyling = { ...tempSettings.styling, theme };
    if (theme !== 'custom' && PRESET_THEMES[theme]) {
      newStyling.customColors = { ...PRESET_THEMES[theme].colors };
    }
    setTempSettings({ ...tempSettings, styling: newStyling });
  };

  const handleCustomColorChange = (colorKey, hslaString) => {
    const newCustomColors = { ...tempSettings.styling.customColors, [colorKey]: hslaString };
    setTempSettings({
      ...tempSettings,
      styling: { ...tempSettings.styling, customColors: newCustomColors }
    });
  };

  const resetToDefaultTheme = () => {
    setTempSettings({
      ...tempSettings,
      styling: {
        theme: 'light',
        customColors: { ...PRESET_THEMES.light.colors },
        enableDynamicTheming: true,
      }
    });
  };

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
        type: column.columnType,
        columnKey: key,
        format: column.format
      }))
      .filter(column => {
        // Exclude category and ID columns from sorting options
        return column.name !== categoryColumnName && column.name !== idColumnName;
      });
  };

  // Render column option with type styling
  const renderColumnOption = (column) => {
    const typeStyles = getColumnTypeStyles(column.type, column.format);
    const IconComponent = LucideIcons[typeStyles.iconName];
    
    // Only show icons for special types, not text and numbers
    const shouldShowIcon = ['boolean', 'datetime', 'link', 'variant', 'error'].includes(column.type);
    
    return (
      <div className="flex items-center gap-2">
        {shouldShowIcon && IconComponent && (
          <IconComponent className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="flex-1">{column.name}</span>
        <Badge variant="secondary" className="text-xs">
          {column.type}
        </Badge>
        {column.format && (
          <LucideIcons.FileText className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
    );
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
    // Reset theme if dynamic theming was enabled
    if (currentSettings.styling?.enableDynamicTheming) {
      if (currentSettings.styling.theme === 'custom') {
        applyThemeColors('custom', currentSettings.styling.customColors);
      } else {
        applyThemeColors(currentSettings.styling.theme);
      }
    }
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-border">
            <Button
              variant={activeTab === 'general' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('general')}
              className="rounded-b-none"
            >
              General
            </Button>
            <Button
              variant={activeTab === 'styling' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('styling')}
              className="rounded-b-none gap-2"
            >
              <Palette className="h-4 w-4" />
              Styling
            </Button>
          </div>

          {activeTab === 'general' && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="viewMode">View Mode</Label>
              <Select
                value={tempSettings.viewMode}
                onValueChange={(value) => setTempSettings({ ...tempSettings, viewMode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select view mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban Board</SelectItem>
                  <SelectItem value="detail">Detail View</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Kanban shows the board, Detail shows selected card details</p>
            </div>

            {tempSettings.viewMode === 'kanban' && (
              <div className="space-y-2">
                <Label htmlFor="modalPreference">Modal Preference</Label>
                <Select
                  value={tempSettings.modalPreference}
                  onValueChange={(value) => setTempSettings({ ...tempSettings, modalPreference: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select modal preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal Modal</SelectItem>
                    <SelectItem value="external">External Detail View</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Internal opens modal in same plugin, External triggers action for separate detail view plugin</p>
              </div>
            )}

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
                          {renderColumnOption(column)}
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

            <div className="space-y-2">
              <Label htmlFor="showDates">Show Start/End Dates</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showDates"
                  checked={tempSettings.showDates}
                  onCheckedChange={(checked) => setTempSettings({ ...tempSettings, showDates: checked })}
                />
                <Label htmlFor="showDates" className="text-sm font-normal">
                  {tempSettings.showDates ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Display start and end dates on kanban cards</p>
            </div>
          </div>
          )}

          {activeTab === 'styling' && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="stylingTheme">Theme</Label>
                <Select
                  value={tempSettings.styling?.theme || 'light'}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="blue">Ocean Blue</SelectItem>
                    <SelectItem value="green">Forest Green</SelectItem>
                    <SelectItem value="purple">Royal Purple</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose a pre-defined theme or customize colors</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enableDynamicTheming">Enable Dynamic Theming</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableDynamicTheming"
                    checked={tempSettings.styling?.enableDynamicTheming || false}
                    onCheckedChange={(checked) => setTempSettings({ 
                      ...tempSettings, 
                      styling: { ...tempSettings.styling, enableDynamicTheming: checked } 
                    })}
                  />
                  <Label htmlFor="enableDynamicTheming" className="text-sm font-normal">
                    {tempSettings.styling?.enableDynamicTheming ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">Apply theme changes in real-time while editing</p>
              </div>

              {tempSettings.styling?.theme === 'custom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customColors">Custom Colors</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToDefaultTheme}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Primary Colors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Primary Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['--primary', '--primary-foreground', '--secondary', '--secondary-foreground'].map((key) => (
                          <ColorPickerField
                            key={key}
                            label={`${key.replace('--', '').replace('-', ' ')}:`}
                            colorKey={key}
                            value={tempSettings.styling.customColors[key] || '0 0% 50% / 1'}
                            onChange={handleCustomColorChange}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Background Colors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Background Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['--background', '--foreground', '--card', '--card-foreground'].map((key) => (
                          <ColorPickerField
                            key={key}
                            label={`${key.replace('--', '').replace('-', ' ')}:`}
                            colorKey={key}
                            value={tempSettings.styling.customColors[key] || '0 0% 50% / 1'}
                            onChange={handleCustomColorChange}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Accent Colors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Accent Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['--accent', '--accent-foreground', '--muted', '--muted-foreground'].map((key) => (
                          <ColorPickerField
                            key={key}
                            label={`${key.replace('--', '').replace('-', ' ')}:`}
                            colorKey={key}
                            value={tempSettings.styling.customColors[key] || '0 0% 50% / 1'}
                            onChange={handleCustomColorChange}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Border Colors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Border & Input Colors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['--border', '--input', '--ring', '--destructive'].map((key) => (
                          <ColorPickerField
                            key={key}
                            label={`${key.replace('--', '').replace('-', ' ') }:`}
                            colorKey={key}
                            value={tempSettings.styling.customColors[key] || '0 0% 50% / 1'}
                            onChange={handleCustomColorChange}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    Click a color square to customize. Changes apply instantly when dynamic theming is enabled.
                  </p>
                </div>
              )}

              {/* Theme Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-primary"></div>
                      <span className="text-sm text-card-foreground">Primary Color</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-secondary"></div>
                      <span className="text-sm text-card-foreground">Secondary Color</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-accent"></div>
                      <span className="text-sm text-card-foreground">Accent Color</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Preview of current theme colors</p>
              </div>
            </div>
          )}

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