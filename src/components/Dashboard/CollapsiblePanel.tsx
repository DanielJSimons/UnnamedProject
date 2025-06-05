import React, { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { FaChevronDown, FaGripVertical } from 'react-icons/fa';
import styles from './CollapsiblePanel.module.scss';

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  dragAttributes?: any;
  dragListeners?: any;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ title, children, dragAttributes, dragListeners }) => {
  const [isOpen, setIsOpen] = useState(true); // Expanded by default

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className={styles.collapsiblePanel}>
      <header className={styles.panelHeader}>
        <div className={styles.titleGroup}>
          <button className={styles.dragHandle} {...dragAttributes} {...dragListeners}>
            <FaGripVertical />
          </button>
          <h3>{title}</h3>
        </div>
        <Collapsible.Trigger asChild>
          <button className={styles.triggerButton}>
            <FaChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
          </button>
        </Collapsible.Trigger>
      </header>
      <Collapsible.Content className={styles.panelContent}>
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}; 