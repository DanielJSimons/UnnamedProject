import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { FaUsersCog, FaTimes } from 'react-icons/fa';
import { EntityManagementPanel } from './EntityManagementPanel';
import styles from './EntityManagementModal.module.scss';

type EntityManagementModalProps = {
  trackedEntities: string[];
  onAddEntity: (entity: string) => void;
  onRemoveEntity: (entity: string) => void;
};

export const EntityManagementModal: React.FC<EntityManagementModalProps> = (props) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className={styles.triggerButton}>
          <FaUsersCog />
          <span>Manage Entities</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent}>
          <Dialog.Title className={styles.dialogTitle}>
            Tracked Entities
          </Dialog.Title>
          <div className={styles.panelContainer}>
            <EntityManagementPanel {...props} />
          </div>
          <Dialog.Close asChild>
            <button className={styles.closeButton} aria-label="Close">
              <FaTimes />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}; 