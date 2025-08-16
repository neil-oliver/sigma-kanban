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
- **Dual View Modes**: Kanban board view and dedicated detail view
- **Flexible Modal System**: Internal modal or external detail view plugin integration
- **Date Editing**: Inline date editing in detail view with shadcn/ui components

## Quick Start

### 1. Basic Setup
1. Create a workbook with a data table containing tasks/items
2. Add a Plugin element from "UI Elements"
3. Configure required fields:
   - **Data Source**: Your Sigma data table
   - **Card Fields**: Columns to display on cards (select multiple)
   - **Board/Status Column**: Column containing status/board information

### 2. Optional: Enable Writeback (Drag & Drop + Date Updates)
1. Use an **Input Table** as your data source (not a regular table)
2. Enable **"Enable Writeback"** in the plugin config
3. Users can now drag cards between boards to update status; date updates become available in Detail view

### 3. Advanced Configuration
1. Enable **Edit Mode** in the plugin config
2. Click the **Settings** button that appears
3. Configure appearance and behavior:
   - **View Mode**: Choose between Kanban board or detail view
   - **Modal Preference**: Internal modal or external detail view integration
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
- **Selected ID Variable**: Variable to receive the row ID of moved cards or selected cards
- **Selected Category Variable**: Variable to receive the target board name
- **Selected Start Date Variable**: Variable to receive the start date when editing dates
- **Selected End Date Variable**: Variable to receive the end date when editing dates
- **Start Date Column**: Column containing start date values (for date editing)
- **End Date Column**: Column containing end date values (for date editing)
- **Update Category**: Action trigger to handle category/status updates
- **Update Dates**: Action trigger to handle date updates
- **Open Modal (External)**: Action trigger for external detail view integration
- **Enable Writeback**: Boolean toggle to enable drag & drop and date updates (requires input table)
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
- **Update Category**: `updateCategory`
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
- **View Mode**: Choose between Kanban board or detail view
- **Modal Preference**: Select internal modal or external detail view (Kanban mode only)
- **Card Layout**: Choose spacing and visual density
- **Field Layout**: Choose how field labels and values are arranged
  - **Stacked**: Field labels above values (traditional layout)
  - **Inline**: Field labels and values side by side (compact layout)
- **Board Width**: Auto-responsive or fixed width columns
- **Custom Categories**: Define your own board categories
  - **Use Custom Categories**: Toggle to enable custom category definition
  - **Category List**: Add, edit, and remove custom category names
  - **Smart Matching**: Cards are automatically assigned to matching categories
- **Card Sorting**: Sort cards within boards
  - **No Sorting**: Cards appear in data order
  - **Alphabetical**: Sort by card title or selected column
  - **Custom Order**: Planned
- **Sort Column**: Choose which column to use for sorting (when sorting is enabled)
  - **Card Title**: Sort by the card's title field
  - **Specific Column**: Sort by any available data column (excludes category and ID columns)
- **Sort Direction**: Ascending (A-Z, 1-9) or Descending (Z-A, 9-1)
- **Visual Options**: Card counts, animations, empty board indicators

## Writeback & Drag/Drop

### Requirements
- Must use **Input Table** as data source
- Enable **"Enable Writeback"**
- Configure **ID column** for row identification
- Set up **variables** and **action triggers** in Sigma workbook

### How It Works
1. User drags a card from one board to another
2. Plugin sets variables:
   - **ID variable**: Set to the selected card's row ID
   - **Category variable**: Set to the target board name
3. Plugin triggers the **updateCategory** action
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
   - `selectedID`: Will receive the row ID of the moved card
   - `selectedCategory`: Will receive the target board name
3. **Action Trigger**: Create an action trigger named `updateCategory` that:
   - Uses the `selectedID` and `selectedCategory` variables
   - Updates the appropriate row in your input table
   - Refreshes the data source

### Example Sigma Workbook Setup
```javascript
// In your Sigma workbook, create an action effect that:
// 1. Gets the selectedID variable value
// 2. Gets the selectedCategory variable value
// 3. Updates the row with the matching ID
// 4. Sets the board/status column to the selectedCategory value
// 5. Refreshes the data source
```

## Date Editing Functionality

The plugin supports inline date editing in the detail view when properly configured.

### Requirements for Date Editing
- **Enable Writeback**: Must be enabled in plugin configuration
- **Date Columns**: Both start date and end date columns must be configured
- **Date Variables**: Both `selectedStartDate` and `selectedEndDate` variables must be set
- **Action Trigger**: `updateDates` action trigger must be configured

### How Date Editing Works
1. **Detail View Only**: Date editing is only available in detail view mode
2. **Conditional Display**: Date editing interface appears only when all requirements are met
3. **Variable Setting**: When a date is changed, the corresponding variable is set; if both dates are provided, both variables are set
4. **Action Trigger**: `updateDates` action is triggered after variables are set
5. **Format Consistency**: Dates are converted to `YYYY-MM-DD` in your local timezone

### Date Editing Interface
- **Prominent Section**: Date editing appears as a highlighted blue section at the top of card details
- **Side-by-Side Pickers**: Start and end date pickers are displayed in a responsive grid layout
- **Smart Field Hiding**: Date fields are hidden from normal card display when editing is enabled

### Configuration for Date Editing
1. **Date Columns**: Configure start date and end date columns in plugin settings
2. **Variables**: Create variables in your Sigma workbook:
   - `selectedStartDate` variable: Will receive the start date value
   - `selectedEndDate` variable: Will receive the end date value
3. **Action Trigger**: Create an action trigger named `updateDates` that:
   - Uses the `selectedID`, `selectedStartDate`, and `selectedEndDate` variables
   - Updates the appropriate row in your input table
   - Refreshes the data source

### Example Date Editing Setup
```javascript
// In your Sigma workbook, create an action effect that:
// 1. Gets the selectedID variable value
// 2. Gets the selectedStartDate variable value
// 3. Gets the selectedEndDate variable value
// 4. Updates the row with the matching ID
// 5. Sets the start date and end date columns to the new values
// 6. Refreshes the data source
```

### Date Format Handling
- **Input Flexibility**: Accepts various date formats (strings, Date objects, timestamps)
- **ISO Output**: Always outputs dates in ISO string format for consistency
- **Validation**: Automatically validates date inputs and handles invalid dates gracefully

### Debug Information
The plugin provides comprehensive debugging information in the browser console:
- Current variable values
- Card move details
- Column information
- Action trigger status

## View Modes & Modal Integration

### View Modes

The plugin supports two distinct view modes to suit different use cases:

#### Kanban Board View (Default)
- Traditional kanban board layout with cards organized by status
- Interactive drag & drop functionality
- Card selection opens modal or triggers external detail view
- Ideal for workflow management and task tracking

#### Detail View
- Dedicated view showing detailed information for a selected card
- Automatically watches the `selectedID` variable for changes
- Shows "No Card Selected" state when no card is selected
- Perfect for focused task review and detailed information display

### Modal Preferences

When using Kanban Board view, you can choose how card details are displayed:

#### Internal Modal
- Opens card details in a modal dialog within the same plugin
- Traditional behavior - no external dependencies
- Good for quick card review without leaving the board view

#### External Detail View
- Sets the `selectedID` variable and triggers the `openModal` action
- Integrates with a separate detail view plugin instance
- Enables dual-plugin setups for enhanced user experience

### Dual Plugin Setup

Create a powerful dual-plugin experience:

1. **Main Plugin (Kanban Board)**:
   - View Mode: "Kanban Board"
   - Modal Preference: "External Detail View"
   - Configure `openModal` action trigger

2. **Detail Plugin (Detail View)**:
   - View Mode: "Detail View"
   - Connect to same data source and variables
   - Automatically displays details for selected cards

#### Benefits of Dual Plugin Setup
- **Enhanced UX**: Dedicated space for detailed information
- **Flexible Layout**: Position plugins anywhere in your workbook
- **Shared Data**: Both plugins stay synchronized
- **Scalable**: Add more detail views or specialized views as needed

## Use Cases

- **Project Management**: Track tasks across workflow stages
- **Sales Pipeline**: Move leads through sales stages  
- **Bug Tracking**: Manage issue resolution workflow
- **Content Creation**: Track content through editorial stages
- **Recruitment**: Move candidates through hiring process
- **Support Tickets**: Track ticket resolution progress
- **Dual-View Dashboards**: Kanban board with dedicated detail panels
- **Date Management**: Edit start and end dates directly in the detail view
- **Multi-User Workflows**: Separate views for different user roles

## Development

### Installation
```bash
npm install
```

### Run locally
```bash
npm start
```

This starts the development server. Load the built app into Sigma’s Plugin element via your hosting setup during development.

### Build for production
```bash
npm run build
```

Outputs a production build in `build/` suitable for hosting and embedding as a Sigma plugin.