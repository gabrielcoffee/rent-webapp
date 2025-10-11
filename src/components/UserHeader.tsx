'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './styles/UserHeader.module.css';

interface UserHeaderProps {
    showBackButton?: boolean;
    backHref?: string;
}

export default function UserHeader({ showBackButton = false, backHref = '/' }: UserHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <Image 
                    width={50} 
                    height={50} 
                    className={styles.logoImage} 
                    src="/assets/rent-icon-black.png" 
                    alt="logo Rent Black" 
                />

                <Link href="/" className={styles.logo}>
                    Rent Brasil
                </Link>

                {showBackButton && (
                    <Link href={backHref} className={styles.backButton}>
                        ← Voltar
                    </Link>
                )}
            </div>
        </header>
    );
}

