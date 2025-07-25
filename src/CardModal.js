import React from 'react';
import {
  Dialog,
  DialogContent,
} from './components/ui/dialog';
import CardDetails from './CardDetails';

function CardModal({ isOpen, onClose, card, fieldLayout = 'stacked' }) {
  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-0">
        <CardDetails card={card} fieldLayout={fieldLayout} />
      </DialogContent>
    </Dialog>
  );
}

export default CardModal; 