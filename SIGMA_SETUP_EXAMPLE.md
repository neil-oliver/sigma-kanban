# Sigma Workbook Setup for Writeback (Drag & Drop)

This guide explains how to set up your Sigma workbook to work with the Kanban plugin's writeback features, including drag & drop.

## Prerequisites

1. **Input Table**: Your data source must be an input table (not a regular table)
2. **ID Column**: A unique identifier column for each row
3. **Status/Board Column**: A column that contains board/status values

## Step-by-Step Setup

### 1. Create Variables

In your Sigma workbook, create two variables:

#### Selected ID Variable
- **Name**: `selectedID`
- **Type**: Text or Number (depending on your ID column type)
- **Default Value**: Leave empty or set a default

#### Selected Category Variable  
- **Name**: `selectedCategory`
- **Type**: Text
- **Default Value**: Leave empty or set a default

### 2. Create Action Trigger

Create an action trigger that will be called when cards are moved:

#### Action Trigger Setup
- **Name**: `updateCategory`
- **Type**: Action Trigger
- **Description**: Updates row data when card is moved

### 3. Create Action Effect

Create an action effect that responds to the `updateCategory` trigger:

#### Action Effect Logic
```javascript
// Pseudo-code for the action effect
function updateCategoryAction() {
  // 1. Get the current values of the variables
  const rowId = getVariableValue('selectedID');
  const newCategory = getVariableValue('selectedCategory');
  
  // 2. Find the row with the matching ID
  const targetRow = findRowById(rowId);
  
  // 3. Update the board/status column for that row
  updateRowColumn(targetRow, 'boardColumn', newCategory);
  
  // 4. Refresh the data source to show changes
  refreshDataSource('yourInputTable');
}
```

### 4. Configure the Plugin

In your plugin configuration:

1. **Source**: Select your input table
2. **ID Column**: Select your ID column
3. **Card Title**: Select the column to display as the main title on each card
4. **Card Fields**: Select columns to display on cards
5. **Category Column**: Select your board/status column
6. **Selected ID Variable**: Select the `selectedID` variable you created
7. **Selected Category Variable**: Select the `selectedCategory` variable you created
8. **Update Category**: Select the `updateCategory` action trigger you created
9. **Enable Writeback**: Toggle this on

## Example Data Structure

```
| ID | Task Name | Assignee | Priority | Status      | Due Date   |
|----|-----------|----------|----------|-------------|------------|
| 1  | Fix login bug  | John     | High     | In Progress | 2024-01-15 |
| 2  | Add new feature| Sarah    | Medium   | To Do       | 2024-01-20 |
| 3  | Test feature   | Mike     | Low      | Done        | 2024-01-10 |
```

**Configuration:**
- **Card Title**: `Task Name` (displays prominently at top of card)
- **Card Fields**: `Assignee`, `Priority`, `Due Date` (displays below title)
- **Category Column**: `Status` (determines which board the card appears on)

## Testing the Setup

1. **Enable Edit Mode** in the plugin
2. **Open Browser Console** to see debug information
3. **Drag a card** from one board to another
4. **Check Console** for:
   - Variable values being set
   - Action trigger being called
   - Any error messages
5. **Verify Data Update** in your input table

## Troubleshooting

### Variables Not Setting
- Check variable names match exactly (`selectedID`, `selectedCategory`)
- Verify variable types are correct
- Ensure variables are accessible to the plugin

### Action Not Triggering
- Verify action trigger name is `updateCategory`
- Check that the action trigger is properly configured
- Look for JavaScript errors in the console

### Data Not Updating
- Ensure your input table has proper permissions
- Check that the action effect logic is correct
- Verify the data source refresh is working

### Cards Not Moving
- Confirm "Enable Writeback" is toggled on
- Check that you're using an input table (not regular table)
- Verify all required columns are selected in plugin config

## Debug Information

The plugin provides detailed logging in the browser console:

```javascript
// Example console output
Card Move Debug Info:
  Card: { id: 0, rowId: 1, boardId: "board-0", fields: {...} }
  Move: { fromBoard: "To Do", toBoard: "In Progress" }
  Config: { source: "...", ID: "...", boardColumn: "...", ... }
  Element Columns: {...}
  
Variables set and action triggered: { selectedID: 1, selectedCategory: "In Progress" }
```

## Best Practices

1. **Use Meaningful IDs**: Ensure your ID column has unique, meaningful values
2. **Consistent Status Values**: Use consistent naming for board/status values
3. **Test Thoroughly**: Test the drag and drop functionality with various scenarios
4. **Monitor Console**: Keep browser console open during testing for debugging
5. **Backup Data**: Always backup your data before testing updates 