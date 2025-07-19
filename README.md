# Sigma Kanban Board Plugin

A flexible Sigma Computing plugin that creates interactive kanban boards from your data. Features drag-and-drop functionality, customizable card layouts, and an advanced settings system for easy configuration.

## Features

- **Flexible Data Support**: Works with any data structure using column selection
- **Multiple Card Fields**: Display multiple data columns on each card
- **Interactive Drag & Drop**: Move cards between boards (input tables only)
- **Customizable Layout**: Comfortable or compact card layouts
- **Board Management**: Automatic board creation from status column
- **Persistent Settings**: JSON-based configuration that saves with your workbook
- **Real-time Updates**: Changes sync back to Sigma when using input tables
- **Column Information Access**: Uses `getElementColumns` to access proper column names and metadata

## Quick Start

### 1. Basic Setup
1. Create a workbook with a data table containing tasks/items
2. Add a Plugin element from "UI Elements"
3. Configure required fields:
   - **Data Source**: Your Sigma data table
   - **Card Fields**: Columns to display on cards (select multiple)
   - **Board/Status Column**: Column containing status/board information

### 2. Optional: Enable Drag & Drop
1. Use an **Input Table** as your data source (not a regular table)
2. Enable **"Enable Drag & Drop"** toggle in plugin config
3. Users can now drag cards between boards to update status

### 3. Advanced Configuration
1. Enable **Edit Mode** in the plugin config
2. Click the **Settings** button that appears
3. Configure appearance and behavior:
   - **Card Layout**: Comfortable vs compact spacing
   - **Board Ordering**: Data order, alphabetical, or custom
   - **Visual Options**: Card counts, animations, empty board highlighting

## Using getElementColumns

This plugin uses Sigma's `getElementColumns` function to access column information. This provides several benefits:

### Column Information Structure
`getElementColumns` returns an object with column keys as properties:

```javascript
{
  "7C5P7RO3ZR": {
    "name": "Category",
    "columnType": "text",
    "id": "7C5P7RO3ZR"
  },
  "CUBMFAZ2EI": {
    "name": "Line 1", 
    "columnType": "text",
    "id": "CUBMFAZ2EI"
  },
  "I95ACXRWGV": {
    "name": "Line 2",
    "columnType": "text", 
    "id": "I95ACXRWGV"
  }
}
```

### How It Works
1. **Column Keys**: Use column keys (like "7C5P7RO3ZR") to access data from `sigmaData`
2. **Column Names**: Use column names (like "Category") for display purposes
3. **Automatic Mapping**: The plugin automatically maps column keys to readable names

### Example Usage
```javascript
import { useElementColumns } from '@sigmacomputing/plugin';

function MyComponent() {
  const elementColumns = useElementColumns(config.source);
  
  // Access column name from key
  const columnName = elementColumns["7C5P7RO3ZR"]?.name; // "Category"
  
  // Access column type
  const columnType = elementColumns["7C5P7RO3ZR"]?.columnType; // "text"
}
```

### Benefits
- **Proper Column Names**: Display human-readable column names instead of cryptic keys
- **Type Information**: Access column types for validation and formatting
- **Consistent Access**: Standardized way to access column metadata across Sigma plugins
- **Future-Proof**: Works with Sigma's evolving data structure

## Configuration Reference

### Required Fields
- **Data Source**: Your Sigma data table (preferably an input table for drag & drop)
- **ID Column**: Column containing unique row identifiers
- **Card Title**: Column to display as the main title on each card
- **Card Fields**: One or more columns to display on cards
- **Category Column**: Column containing board/status values (e.g., "To Do", "In Progress", "Done")

### Optional Fields
- **Selected ID Variable**: Variable to receive the row ID of moved cards
- **Selected Category Variable**: Variable to receive the target board name
- **Update Row**: Action trigger to handle data updates
- **Enable Drag & Drop**: Boolean toggle for interactive card movement (requires input table)
- **Edit Mode**: Boolean toggle to show settings interface
- **Settings Config**: JSON configuration (auto-managed by settings UI)

## Data Structure & Examples

### Sample Data Format
```
| Task Title     | Assignee | Priority | Status      | Due Date   |
|----------------|----------|----------|-------------|------------|
| Fix login bug  | John     | High     | In Progress | 2024-01-15 |
| Add new feature| Sarah    | Medium   | To Do       | 2024-01-20 |
| Test feature   | Mike     | Low      | Done        | 2024-01-10 |
```

### Configuration Example
- **ID Column**: `ID`
- **Card Title**: `Task Name`
- **Card Fields**: `Assignee`, `Priority`, `Due Date`
- **Category Column**: `Status`
- **Selected ID Variable**: `selectedID`
- **Selected Category Variable**: `selectedCategory`
- **Update Row**: `updateRow`
- **Result**: Three boards ("To Do", "In Progress", "Done") with cards showing task name as title and additional details below

### Field Layout Options

The plugin offers two different ways to display field information on cards:

#### Stacked Layout (Default)
```
┌─────────────────────┐
│ Fix login bug       │
├─────────────────────┤
│ ASSIGNEE            │
│ John                │
│                     │
│ PRIORITY            │
│ High                │
│                     │
│ DUE DATE            │
│ 2024-01-15          │
└─────────────────────┘
```

#### Inline Layout (Compact)
```
┌─────────────────────┐
│ Fix login bug       │
├─────────────────────┤
│ ASSIGNEE: John      │
│ PRIORITY: High      │
│ DUE DATE: 2024-01-15│
└─────────────────────┘
```

Choose the layout that works best for your data and space constraints.

### Card Sorting Options

The plugin offers flexible sorting options for cards within each board:

#### Sorting Types
- **No Sorting**: Cards appear in the same order as your data
- **Alphabetical**: Sort by card title or a specific column
- **Custom Order**: Manual ordering (future feature)

#### Sort Column Selection
When sorting is enabled, you can choose which column to sort by:
- **Card Title**: Sort by the main card title
- **Any Data Column**: Sort by any column in your data (Priority, Due Date, Assignee, etc.)

#### Sort Direction
- **Ascending**: A-Z, 1-9, earliest to latest dates
- **Descending**: Z-A, 9-1, latest to earliest dates

#### Smart Sorting
The plugin automatically detects data types:
- **Numbers**: Priority levels, quantities, etc.
- **Dates**: Due dates, created dates, etc.
- **Text**: Names, descriptions, categories, etc.

#### Example Sorting Scenarios
```
Priority (High → Low): High, Medium, Low
Due Date (Earliest → Latest): 2024-01-10, 2024-01-15, 2024-01-20
Assignee (A-Z): John, Mike, Sarah
```

### Custom Categories

The plugin allows you to define your own board categories instead of using the values from your data:

#### Benefits
- **Consistent Naming**: Use standardized category names regardless of data variations
- **Controlled Order**: Define exactly which boards appear and in what order
- **Data Flexibility**: Handle inconsistent data values (e.g., "To Do", "todo", "To-Do")
- **Future-Proofing**: Add categories before data exists

#### How It Works
1. **Enable Custom Categories**: Toggle "Use Custom Categories" in settings
2. **Define Categories**: Add your desired category names (e.g., "To Do", "In Progress", "Done")
3. **Smart Matching**: Cards are automatically assigned based on:
   - **Exact Match**: "To Do" matches "To Do"
   - **Case Insensitive**: "todo" matches "To Do"
   - **Partial Match**: "In Progress" matches "In Progress - Development"
   - **Fallback**: Unmatched cards go to the first category

#### Example Setup
```
Data Values: "todo", "in-progress", "completed", "blocked"
Custom Categories: "To Do", "In Progress", "Done", "Blocked"

Result: All variations are mapped to your standardized categories
```

#### Use Cases
- **Standardize Workflow**: Ensure consistent board names across teams
- **Handle Data Variations**: Map different data formats to standard categories
- **Plan Ahead**: Set up categories before data is available
- **Clean Presentation**: Use professional category names regardless of data

## Settings System

### Edit Mode
- **Purpose**: Toggle advanced settings interface
- **When enabled**: Shows ⚙️ Settings button in top-right
- **When disabled**: Clean view for end users

### Settings Options
- **Card Layout**: Choose spacing and visual density
- **Field Layout**: Choose how field labels and values are arranged
  - **Stacked**: Field labels above values (traditional layout)
  - **Inline**: Field labels and values side by side (compact layout)
- **Board Width**: Auto-responsive or fixed width columns
- **Board Order**: Control how boards are arranged
- **Custom Categories**: Define your own board categories
  - **Use Custom Categories**: Toggle to enable custom category definition
  - **Category List**: Add, edit, and remove custom category names
  - **Smart Matching**: Cards are automatically assigned to matching categories
- **Card Sorting**: Sort cards within boards
  - **No Sorting**: Cards appear in data order
  - **Alphabetical**: Sort by card title or selected column
  - **Custom Order**: Manual card ordering
- **Sort Column**: Choose which column to use for sorting (when sorting is enabled)
  - **Card Title**: Sort by the card's title field
  - **Specific Column**: Sort by any available data column (excludes category and ID columns)
- **Sort Direction**: Ascending (A-Z, 1-9) or Descending (Z-A, 9-1)
- **Visual Options**: Card counts, animations, empty board indicators

## Drag & Drop Functionality

### Requirements
- Must use **Input Table** as data source
- Enable **"Enable Drag & Drop"** toggle
- Configure **ID column** for row identification
- Set up **variables** and **action triggers** in Sigma workbook

### How It Works
1. User drags a card from one board to another
2. Plugin sets variables:
   - **ID variable**: Set to the selected card's row ID
   - **Category variable**: Set to the target board name
3. Plugin triggers the **updateRow action**
4. **Optimistic Update**: Card immediately appears in new position
5. Sigma workbook processes the action and updates the data
6. Plugin refreshes to show updated data

### Optimistic Updates
The plugin uses optimistic updates to provide immediate visual feedback:
- **Instant Response**: Cards appear in their new position immediately
- **Visual Feedback**: Cards show a subtle "Updating..." indicator
- **Fallback**: If data doesn't refresh within 5 seconds, updating state clears
- **Error Handling**: If update fails, card reverts to original position

### Configuration Setup
1. **ID Column**: Select the column containing unique row identifiers
2. **Variables**: Create variables in your Sigma workbook:
   - `id` variable: Will receive the row ID of the moved card
   - `category` variable: Will receive the target board name
3. **Action Trigger**: Create an action trigger named `updateRow` that:
   - Uses the `id` and `category` variables
   - Updates the appropriate row in your input table
   - Refreshes the data source

### Example Sigma Workbook Setup
```javascript
// In your Sigma workbook, create an action effect that:
// 1. Gets the id variable value
// 2. Gets the category variable value  
// 3. Updates the row with the matching ID
// 4. Sets the board/status column to the category value
// 5. Refreshes the data source
```

### Debug Information
The plugin provides comprehensive debugging information in the browser console:
- Current variable values
- Card move details
- Column information
- Action trigger status

## Use Cases

- **Project Management**: Track tasks across workflow stages
- **Sales Pipeline**: Move leads through sales stages  
- **Bug Tracking**: Manage issue resolution workflow
- **Content Creation**: Track content through editorial stages
- **Recruitment**: Move candidates through hiring process
- **Support Tickets**: Track ticket resolution progress

## Development

### Installation
```bash
npm install
```