import React, { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { FaChevronDown, FaGripVertical, FaExpandArrowsAlt } from 'react-icons/fa';
import styles from './CollapsiblePanel.module.scss';

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  dragAttributes?: any;
  dragListeners?: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ title, children, dragAttributes, dragListeners, isExpanded, onToggleExpand }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className={styles.collapsiblePanel}>
      <header className={styles.panelHeader}>
        <div className={styles.titleGroup}>
          <button className={styles.dragHandle} {...dragAttributes} {...dragListeners}>
            <FaGripVertical />
          </button>
          <h3>{title}</h3>
        </div>
        <div className={styles.controlsGroup}>
          <button onClick={onToggleExpand} className={styles.triggerButton} aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}>
            <FaExpandArrowsAlt />
          </button>
          <Collapsible.Trigger asChild>
            <button className={styles.triggerButton}>
              <FaChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
            </button>
          </Collapsible.Trigger>
        </div>
      </header>
      <Collapsible.Content className={styles.panelContent}>
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}; 