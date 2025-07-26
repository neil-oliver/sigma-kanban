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

export function DatePicker({ label, value, onChange, placeholder = "Pick a date" }) {
  const [open, setOpen] = useState(false);

  console.log('DatePicker received:', { label, value, placeholder });

  const handleSelect = (date) => {
    onChange(date);
    setOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      console.log('DatePicker formatDate input:', date, typeof date);
      
      // Helper function to parse date string as local date (not UTC)
      const parseDateAsLocal = (dateString) => {
        if (!dateString) return null;
        
        // If it's already a Date object, return it
        if (dateString instanceof Date) {
          return dateString;
        }
        
        // If it's a timestamp string, parse it
        if (typeof dateString === 'string' && /^\d+$/.test(dateString)) {
          const timestamp = parseInt(dateString, 10);
          const date = new Date(timestamp);
          
          // If this timestamp represents midnight UTC, convert it to local midnight
          // Check if the UTC time is 00:00:00
          const utcHours = date.getUTCHours();
          const utcMinutes = date.getUTCMinutes();
          const utcSeconds = date.getUTCSeconds();
          
          if (utcHours === 0 && utcMinutes === 0 && utcSeconds === 0) {
            // This is a midnight UTC timestamp, convert to local midnight
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth();
            const day = date.getUTCDate();
            return new Date(year, month, day);
          }
          
          return date;
        }
        
        // If it's a YYYY-MM-DD string, parse it as local date
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          const [year, month, day] = dateString.split('-').map(Number);
          // Create date in local timezone (month is 0-indexed)
          return new Date(year, month - 1, day);
        }
        
        // Try parsing as ISO string but treat as local
        if (typeof dateString === 'string' && dateString.includes('T')) {
          const date = new Date(dateString);
          // If it's a valid date, adjust for timezone offset
          if (!isNaN(date.getTime())) {
            const offset = date.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
            return new Date(date.getTime() + offset);
          }
        }
        
        // Fallback to regular Date parsing
        return new Date(dateString);
      };
      
      // Handle string dates
      if (typeof date === 'string') {
        return parseDateAsLocal(date);
      }
      
      // Handle Date objects
      if (date instanceof Date) {
        return isNaN(date.getTime()) ? null : date;
      }
      
      // Handle numbers (timestamps)
      if (typeof date === 'number') {
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
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