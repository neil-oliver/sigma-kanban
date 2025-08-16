import React from 'react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { HelpCircle, Settings as SettingsIcon, KanbanSquare, Database, Columns3, PlugZap } from 'lucide-react';

function StepCard({ icon: Icon, title, children, complete = false }) {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-md flex items-center justify-center border ${complete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border-border'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium leading-none">{title}</h4>
            {complete && (
              <Badge variant="secondary" className="text-[10px]">Configured</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Onboarding({
  hasSource,
  hasCardFields,
  hasCategory,
  editMode,
  onOpenSettings,
  onOpenHelp,
}) {
  return (
    <div className="h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="rounded-xl border border-border bg-card text-card-foreground p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <KanbanSquare className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold tracking-tight">Sigma Kanban</h2>
                <Badge variant="secondary">Overview</Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Visualize your Sigma data as a kanban board. Configure your source and key columns,
                then drag cards between boards. For a deeper guide, open the Help.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-2" onClick={onOpenHelp}>
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
              <Button size="sm" className="gap-2" onClick={onOpenSettings} disabled={!editMode}>
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {!editMode && (
            <div className="mt-4 rounded-md border border-border bg-muted/30 text-muted-foreground px-4 py-3 text-sm">
              Enable Edit Mode in the Sigma properties panel to open Settings and configure the plugin.
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard icon={Database} title="Choose Source" complete={hasSource}>
              Pick a Sigma element for your data. Each row becomes a kanban card.
            </StepCard>
            <StepCard icon={Columns3} title="Select Key Columns" complete={hasCardFields && hasCategory}>
              Set <span className="font-medium">ID</span>, one or more <span className="font-medium">Card Fields</span>, and the <span className="font-medium">Category/Status</span> column.
            </StepCard>
            <StepCard icon={PlugZap} title="Optional: Writeback">
              Enable writeback to update category and dates by dragging and editing.
            </StepCard>
          </div>

          
        </div>
      </div>
    </div>
  );
}

export default Onboarding;


