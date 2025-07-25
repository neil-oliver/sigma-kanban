import React from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import CardModal from './CardModal';

// Card component
function KanbanCard({ card, isDragging = false, isUpdating = false, fieldLayout = 'stacked', onCardClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const renderField = (fieldName, value) => {
    if (fieldLayout === 'inline') {
      return (
        <div key={fieldName} className="mb-2 last:mb-0 flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex-shrink-0 mr-2">
            {fieldName}:
          </div>
          <div className="text-sm text-gray-900 text-right flex-1 truncate">
            {value || 'N/A'}
          </div>
        </div>
      );
    } else {
      // stacked layout (default)
      return (
        <div key={fieldName} className="mb-2 last:mb-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {fieldName}
          </div>
          <div className="text-sm text-gray-900 mt-1">
            {value || 'N/A'}
          </div>
        </div>
      );
    }
  };

  const handleCardClick = (e) => {
    // Prevent click when dragging
    if (isSortableDragging) return;
    
    // Prevent click when updating
    if (isUpdating) return;
    
    // Call the click handler
    if (onCardClick) {
      onCardClick(card);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isDragging ? 'rotate-5 scale-105' : ''
      } ${isUpdating ? 'border-blue-300 bg-blue-50' : ''}`}
    >
      {isUpdating && (
        <div className="flex items-center justify-center mb-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-blue-600 ml-2">Updating...</span>
        </div>
      )}
      
      {/* Card Title */}
      {card.title && (
        <div className="mb-3 pb-2 border-b border-gray-100">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight">
            {card.title}
          </h4>
        </div>
      )}
      
      {/* Card Fields */}
      {Object.entries(card.fields).map(([fieldName, value]) => renderField(fieldName, value))}
    </div>
  );
}

// Board column component
function KanbanColumn({ board, cards, enableDragDrop, updatingCardIds = [], fieldLayout = 'stacked', onCardClick }) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: board.id,
    data: {
      type: 'board',
      board,
    },
    disabled: false,
  });

  const renderField = (fieldName, value) => {
    if (fieldLayout === 'inline') {
      return (
        <div key={fieldName} className="mb-2 last:mb-0 flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex-shrink-0 mr-2">
            {fieldName}:
          </div>
          <div className="text-sm text-gray-900 text-right flex-1 truncate">
            {value || 'N/A'}
          </div>
        </div>
      );
    } else {
      // stacked layout (default)
      return (
        <div key={fieldName} className="mb-2 last:mb-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {fieldName}
          </div>
          <div className="text-sm text-gray-900 mt-1">
            {value || 'N/A'}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 min-w-80 max-w-sm h-full">
      <div className="bg-gray-50 rounded-lg h-full flex flex-col">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
          <h3 className="font-semibold text-lg text-gray-800">{board.name}</h3>
          <span className="bg-gray-200 text-gray-600 w-6 h-6 rounded-full text-sm font-medium flex items-center justify-center min-w-6">
            {cards.length}
          </span>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={setNodeRef}
            className={`h-full p-4 transition-colors duration-200 overflow-y-auto ${
              isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed rounded-md' : 'border-2 border-transparent'
            }`}
          >
            {enableDragDrop ? (
              <SortableContext
                items={cards.map(card => card.id)}
                strategy={verticalListSortingStrategy}
              >
                {cards.map((card) => (
                  <KanbanCard 
                    key={card.id} 
                    card={card} 
                    isUpdating={updatingCardIds.includes(card.id)}
                    fieldLayout={fieldLayout}
                    onCardClick={onCardClick}
                  />
                ))}
              </SortableContext>
            ) : (
              cards.map((card) => (
                <div 
                  key={card.id} 
                  className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onCardClick && onCardClick(card)}
                >
                  {updatingCardIds.includes(card.id) && (
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-600 ml-2">Updating...</span>
                    </div>
                  )}
                  
                  {/* Card Title */}
                  {card.title && (
                    <div className="mb-3 pb-2 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                        {card.title}
                      </h4>
                    </div>
                  )}
                  
                  {/* Card Fields */}
                  {Object.entries(card.fields).map(([fieldName, value]) => renderField(fieldName, value))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom collision detection that prioritizes board drop zones
function customCollisionDetection(args) {
  // First, check for board collisions using pointerWithin
  const boardCollisions = pointerWithin({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      container => container.data.current?.type === 'board'
    ),
  });

  if (boardCollisions.length > 0) {
    return boardCollisions;
  }

  // Fallback to card collisions if no board collision found
  return pointerWithin(args);
}

// Main Kanban Board component
function KanbanBoard({ data, settings, enableDragDrop, onCardMove, onCardClick }) {
  const [activeCard, setActiveCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const card = data.cards.find(c => c.id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = data.cards.find(c => c.id === active.id);
    if (!activeCard) return;

    // Determine the target board - be more permissive in detection
    let targetBoardId;
    
    // First check if we're directly over a board
    if (over.data.current?.type === 'board') {
      targetBoardId = over.id;
    } 
    // Then check if we're over a card (and get its board)
    else if (over.data.current?.type === 'card') {
      const overCard = data.cards.find(c => c.id === over.id);
      targetBoardId = overCard?.boardId;
    }
    // Finally, try to find the board by ID directly (fallback)
    else {
      // Check if the over.id directly matches a board ID
      const targetBoard = data.boards.find(b => b.id === over.id);
      if (targetBoard) {
        targetBoardId = targetBoard.id;
      }
    }

    // Only trigger move if we found a valid target and it's different from current
    if (targetBoardId && activeCard.boardId !== targetBoardId) {
      const targetBoard = data.boards.find(b => b.id === targetBoardId);
      if (targetBoard) {
        onCardMove(activeCard.id, activeCard.boardId, targetBoard.name);
      }
    }
  };

  const handleCardClick = (card) => {
    if (onCardClick) {
      // Use external card click handler (for external modal)
      onCardClick(card);
    } else {
      // Use internal modal
      setSelectedCard(card);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  if (!data || !data.boards || data.boards.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
          <p className="text-gray-500">Please check your data source configuration.</p>
        </div>
      </div>
    );
  }

  const kanbanContent = (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-6 h-full p-6">
        {data.boards.map((board) => {
          const boardCards = data.cards.filter(card => card.boardId === board.id);
          return (
            <KanbanColumn
              key={board.id}
              board={board}
              cards={boardCards}
              enableDragDrop={enableDragDrop}
              updatingCardIds={data.updatingCardIds || []}
              fieldLayout={settings?.fieldLayout || 'stacked'}
              onCardClick={handleCardClick}
            />
          );
        })}
      </div>
    </div>
  );

  if (enableDragDrop) {
    return (
      <>
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {kanbanContent}
          <DragOverlay>
            {activeCard ? <KanbanCard card={activeCard} isDragging /> : null}
          </DragOverlay>
        </DndContext>
        {!onCardClick && (
          <CardModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            card={selectedCard}
            fieldLayout={settings?.fieldLayout || 'stacked'}
          />
        )}
      </>
    );
  }

  return (
    <>
      {kanbanContent}
      {!onCardClick && (
        <CardModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          card={selectedCard}
          fieldLayout={settings?.fieldLayout || 'stacked'}
        />
      )}
    </>
  );
}

export default KanbanBoard; 