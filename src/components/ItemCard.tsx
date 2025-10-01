'use client';

import { Edit, Trash2 } from 'lucide-react';
import styles from './styles/ItemCard.module.css';

export interface ItemCardData {
  id: string;
  [key: string]: any;
}

interface ItemCardProps {
  data: ItemCardData;
  fields: Array<{
    key: string;
    label: string;
    render?: (value: any, data: ItemCardData) => React.ReactNode;
  }>;
  imageField?: string;
  imageLabel?: string;
  onEdit?: (data: ItemCardData) => void;
  onDelete?: (data: ItemCardData) => void;
}

export default function ItemCard({
  data,
  fields,
  imageField,
  imageLabel = 'Imagem',
  onEdit,
  onDelete
}: ItemCardProps) {
  const renderValue = (field: any, value: any) => {
    if (field.render) {
      return field.render(value, data);
    }
    return value || '-';
  };

  return (
    <div className={styles.card}>
      {imageField && data[imageField] && (
        <div className={styles.imageContainer}>
          <img 
            src={data[imageField]} 
            alt={imageLabel}
            className={styles.image}
          />
        </div>
      )}
      
      <div className={styles.content}>
        {fields.map((field) => (
          <div key={field.key} className={styles.field}>
            <span className={styles.label}>{field.label}:</span>
            <span className={styles.value}>
              {renderValue(field, data[field.key])}
            </span>
          </div>
        ))}
      </div>
      
      {(onEdit || onDelete) && (
        <div className={styles.actions}>
          {onEdit && (
            <button 
              onClick={() => onEdit(data)}
              className={styles.editButton}
              aria-label="Editar"
            >
              <Edit size={18} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(data)}
              className={styles.deleteButton}
              aria-label="Excluir"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
