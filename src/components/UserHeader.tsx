'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import styles from './styles/UserHeader.module.css';

interface UserHeaderProps {
    showBackButton?: boolean;
    backHref?: string;
}

const SELECTED_CONDOMINIO_STORAGE_KEY = 'rent_selected_condominio_id';
const CONDOMINIO_CHANGED_EVENT = 'rent-condominio-changed';
const OPEN_CONDOMINIO_SELECTOR_EVENT = 'rent-open-condominio-selector';

export default function UserHeader({ showBackButton = false, backHref = '/' }: UserHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const isCatalogo = pathname === '/catalogo';
    const isPedidos = pathname === '/pedidos';
    const showToggleNav = isCatalogo || isPedidos;

    const handleSelecionarCondominio = () => {
        // Não limpa o condomínio atual aqui; apenas abre o seletor no /catalogo.
        router.push('/catalogo');
        // dispara num tick depois do push para o catalogo já estar montado
        setTimeout(() => window.dispatchEvent(new Event(OPEN_CONDOMINIO_SELECTOR_EVENT)), 0);
    };

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

                <div className={styles.actions}>
                    <button type="button" className={styles.navButton} onClick={handleSelecionarCondominio}>
                        Selecionar Condomínio
                    </button>

                    {showToggleNav && (
                        <Link href={isCatalogo ? '/pedidos' : '/catalogo'} className={styles.navButton}>
                            {isCatalogo ? 'Pedidos' : 'Catálogo'}
                        </Link>
                    )}

                    {showBackButton && (
                        <Link href={backHref} className={styles.backButton}>
                            ← Voltar
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

