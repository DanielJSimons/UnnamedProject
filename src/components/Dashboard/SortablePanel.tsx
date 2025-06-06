import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CollapsiblePanel } from './CollapsiblePanel';
import styles from './SortablePanel.module.scss';

export interface SortablePanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggleExpand: () => void;
  style?: React.CSSProperties;
}

export const SortablePanel: React.FC<SortablePanelProps> = ({ id, title, children, isExpanded, onToggleExpand, style: propStyle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    ...propStyle,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? '0px 10px 30px rgba(0, 0, 0, 0.3)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CollapsiblePanel 
        title={title} 
        dragAttributes={attributes} 
        dragListeners={listeners}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      >
        {children}
      </CollapsiblePanel>
    </div>
  );
}; 