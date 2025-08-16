import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  HelpCircle, Database, Fingerprint, Type, Columns3, CalendarDays, 
  MoveRight, SlidersHorizontal, Eye, Paintbrush, Wrench, Info, AlertTriangle
} from 'lucide-react';

function HelpModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Intro */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <p className="text-sm text-muted-foreground">
              Configure your Sigma data as a kanban. Use Settings in Edit Mode to tailor boards, cards, and styling. This guide reflects the current feature set.
            </p>
          </div>

          {/* Quick start */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Database className="h-4 w-4" />
              Quick Start
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Select <span className="font-medium">Source</span> (Sigma element).</li>
              <li>Set <span className="font-medium">ID Column</span>, <span className="font-medium">Card Title</span>, one or more <span className="font-medium">Card Fields</span>, and the <span className="font-medium">Category</span> column.</li>
              <li>Optional: add <span className="font-medium">Start</span> and <span className="font-medium">End</span> date columns.</li>
            </ul>
          </div>

          {/* Required config */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4" />
              Required Configuration <Badge variant="secondary">Required</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Fingerprint className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">ID Column</div>
                  <div className="text-muted-foreground">Unique identifier for each row/card.</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Type className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Card Title</div>
                  <div className="text-muted-foreground">Primary title shown on cards and in details.</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Columns3 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Card Fields</div>
                  <div className="text-muted-foreground">Select multiple fields to render on each card.</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MoveRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Category (Board/Status)</div>
                  <div className="text-muted-foreground">Determines which board a card appears in.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Optional: Dates & Writeback */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Dates & Writeback <Badge variant="secondary">Optional</Badge>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Add <span className="font-medium">Start Date</span> and <span className="font-medium">End Date</span> columns to show/edit dates.</li>
              <li>Enable <span className="font-medium">Enable Writeback</span> to allow drag & drop updates and date editing.</li>
              <li>When writeback is enabled, configure:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><span className="font-medium">Variables</span>: Selected ID, Selected Category, Selected Start Date, Selected End Date.</li>
                  <li><span className="font-medium">Action Triggers</span>: Update Category, Update Dates, and optionally Open Modal (External).</li>
                </ul>
              </li>
            </ul>
            <div className="rounded-md border border-border bg-muted/30 text-muted-foreground text-sm p-3 flex gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              Drag & drop moves cards between boards only when writeback is enabled and your source supports input.
            </div>
          </div>

          {/* Views & Modals */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4" />
              Views & Modals
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><span className="font-medium">View Mode</span>: Kanban (boards) or Detail (single card view).</li>
              <li><span className="font-medium">Modal Preference</span> (Kanban): Internal modal, or External detail view via the <span className="font-medium">Open Modal</span> action.</li>
            </ul>
          </div>

          {/* Boards & Sorting */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <SlidersHorizontal className="h-4 w-4" />
              Boards & Sorting
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><span className="font-medium">Board Width</span>: Auto or Fixed.</li>
              <li><span className="font-medium">Board Order</span>: Data, Alphabetical, or Custom (define order or custom categories).</li>
              <li><span className="font-medium">Show Card Counts</span> and <span className="font-medium">Highlight Empty Boards</span> toggles.</li>
              <li><span className="font-medium">Card Sorting</span>: None, Alphabetical, or Custom with column + direction.</li>
            </ul>
          </div>

          {/* Cards & Layout */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Columns3 className="h-4 w-4" />
              Cards & Layout
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><span className="font-medium">Card Layout</span>: Comfortable or Compact.</li>
              <li><span className="font-medium">Field Layout</span>: Stacked or Inline; Compact Field Display toggles label style.</li>
              <li><span className="font-medium">Show Dates</span>: Display start/end dates on cards.</li>
              <li><span className="font-medium">Card Animations</span>: Smooth drag & drop transitions.</li>
            </ul>
          </div>

          {/* Styling */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Paintbrush className="h-4 w-4" />
              Styling
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Select a theme: Light, Dark, Ocean Blue, Forest Green, Royal Purple, or Custom.</li>
              <li>Enable <span className="font-medium">Dynamic Theming</span> to preview changes live.</li>
              <li>Customize CSS color tokens when using Custom theme.</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              Troubleshooting
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><span className="font-medium">No cards?</span> Ensure Source, ID, Card Fields, and Category are set.</li>
              <li><span className="font-medium">Wrong boards?</span> Check Category values and custom category/order settings.</li>
              <li><span className="font-medium">Drag & drop not working?</span> Enable Writeback and verify variables + actions.</li>
              <li><span className="font-medium">Cluttered cards?</span> Use Compact layout, Inline fields, fewer Card Fields, or hide dates.</li>
            </ul>
          </div>

          {/* Feedback & Issues */}
          <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              Feedback & Issues
            </h4>
            <p className="text-sm text-muted-foreground">
              Found a bug or have a feature request? Please report it using GitHub Issues at
              {' '}
              <a
                href="https://github.com/neil-oliver/sigma-kanban/issues"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                github.com/neil-oliver/sigma-kanban
              </a>
              .
            </p>
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