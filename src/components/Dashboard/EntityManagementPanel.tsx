import React, { useState } from 'react';
import styles from './EntityManagementPanel.module.scss';
import { FaPlus, FaTrash } from 'react-icons/fa';

type EntityManagementPanelProps = {
  trackedEntities: string[];
  onAddEntity: (entity: string) => void;
  onRemoveEntity: (entity: string) => void;
};

export const EntityManagementPanel: React.FC<EntityManagementPanelProps> = ({ trackedEntities, onAddEntity, onRemoveEntity }) => {
  const [newEntity, setNewEntity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntity.trim()) {
      onAddEntity(newEntity.trim());
      setNewEntity('');
    }
  };

  return (
    <div className={styles.panel}>
      <form onSubmit={handleSubmit} className={styles.addEntityForm}>
        <input
          type="text"
          value={newEntity}
          onChange={(e) => setNewEntity(e.target.value)}
          placeholder="Add new entity..."
          className={styles.addEntityInput}
        />
        <button type="submit" className={styles.addEntityButton} aria-label="Add Entity"><FaPlus /></button>
      </form>
      <ul className={styles.entityList}>
        {trackedEntities.map(entity => (
          <li key={entity} className={styles.entityItem}>
            <span className={styles.entityName}>{entity}</span>
            <button onClick={() => onRemoveEntity(entity)} className={styles.removeButton} aria-label={`Remove ${entity}`}>
              <FaTrash />
            </button>
          </li>
        ))}
        {trackedEntities.length === 0 && (
          <p className={styles.noEntitiesMessage}>No entities currently tracked.</p>
        )}
      </ul>
    </div>
  );
}; 