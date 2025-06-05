import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CollapsiblePanel } from './CollapsiblePanel';
import styles from './SortablePanel.module.scss';

interface SortablePanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export const SortablePanel: React.FC<SortablePanelProps> = ({ id, title, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? '0px 10px 30px rgba(0, 0, 0, 0.3)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CollapsiblePanel title={title} dragAttributes={attributes} dragListeners={listeners}>
        {children}
      </CollapsiblePanel>
    </div>
  );
}; 