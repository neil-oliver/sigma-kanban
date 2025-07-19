import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Button } from './components/ui/button';

function HelpModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Use the Kanban Board Plugin</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="help-section">
            <h4>1. Basic Setup</h4>
            <ul>
              <li>Select your data source from the "Source" dropdown</li>
              <li>Choose the columns you want displayed on cards in "Card Fields" (you can select multiple)</li>
              <li>Select the column that contains board/status information in "Board/Status Column"</li>
              <li>Your kanban board will automatically display with boards for each unique status value</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>2. Configure Card Fields</h4>
            <ul>
              <li>Select multiple columns in "Card Fields" to show different information on each card</li>
              <li>Each selected field will appear as a labeled section on the card</li>
              <li>Field names are automatically formatted for display</li>
              <li>Empty fields will show "N/A" on the cards</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>3. Enable Drag & Drop (Optional)</h4>
            <ul>
              <li>Toggle "Enable Drag & Drop" if you're using an input table</li>
              <li>This allows you to drag cards between boards to update their status</li>
              <li>When you drop a card in a new board, it updates the data in Sigma</li>
              <li><strong>Note:</strong> Only works with input tables, not regular data tables</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>4. Customize Appearance</h4>
            <ul>
              <li>Click the ⚙️ Settings button (in Edit Mode) to customize the board</li>
              <li>Choose between comfortable or compact card layouts</li>
              <li>Adjust board width and ordering preferences</li>
              <li>Control card animations and visual indicators</li>
              <li>Enable/disable card counts in board headers</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>5. Data Structure</h4>
            <ul>
              <li>Your data should have one column for status/board (e.g., "To Do", "In Progress", "Done")</li>
              <li>Additional columns can be selected to display on cards (e.g., Task Name, Assignee, Priority)</li>
              <li>Each row in your data becomes a card on the kanban board</li>
              <li>Empty or null values are handled gracefully</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>6. Best Practices</h4>
            <ul>
              <li>Use clear, descriptive status names for your boards (e.g., "Not Started", "In Progress", "Complete")</li>
              <li>Limit card fields to the most important information to avoid clutter</li>
              <li>Use consistent data formatting for better visual presentation</li>
              <li>Enable drag & drop only when you need to update data interactively</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>7. Troubleshooting</h4>
            <ul>
              <li><strong>No cards appearing?</strong> Check that your card fields and board column contain data</li>
              <li><strong>Cards in wrong boards?</strong> Verify the board column values match expected status names</li>
              <li><strong>Drag & drop not working?</strong> Ensure you're using an input table and have enabled the feature</li>
              <li><strong>Cards look cluttered?</strong> Try compact layout or reduce the number of card fields</li>
              <li><strong>Boards in wrong order?</strong> Use the board ordering settings to customize the layout</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default HelpModal; 