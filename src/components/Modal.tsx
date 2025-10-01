'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './styles/Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'danger'
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.footer}>
          <button 
            className={`btn btn-outline ${styles.cancelButton}`}
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`btn ${styles[`${type}Button`]}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}