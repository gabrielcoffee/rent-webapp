'use client';

import { useEffect } from 'react';
import styles from './styles/ImageModal.module.css';

interface ImageModalProps {
    isOpen: boolean;
    imageUrl: string;
    altText: string;
    onClose: () => void;
}

export default function ImageModal({ isOpen, imageUrl, altText, onClose }: ImageModalProps) {
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

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <button 
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Fechar"
            >
                ✕
            </button>
            <div className={styles.imageContainer} onClick={(e) => e.stopPropagation()}>
                <img 
                    src={imageUrl} 
                    alt={altText}
                    className={styles.image}
                />
            </div>
        </div>
    );
}

