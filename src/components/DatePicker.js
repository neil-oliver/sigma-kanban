import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Label } from './ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { parseDateAsLocal } from '../utils/dateUtils';

export function DatePicker({ label, value, onChange, placeholder = "Pick a date" }) {
  const [open, setOpen] = useState(false);

  // DatePicker component initialized

  const handleSelect = (date) => {
    onChange(date);
    setOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      // Use shared date parsing utility
      return parseDateAsLocal(date);
    } catch (error) {
      return null;
    }
  };

  const formattedDate = formatDate(value);

  return (
    <div className="flex flex-col gap-2">
      {label && <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !formattedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedDate ? format(formattedDate, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formattedDate}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 