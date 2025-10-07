'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart3, Users, Package, Calendar, Star, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './styles/Header.module.css';
import Image from 'next/image';

interface HeaderProps {
  showAdminNav?: boolean;
  showBackButton?: boolean;
  backHref?: string;
}

export default function Header({ 
  showAdminNav = true, 
  showBackButton = false, 
  backHref = '/' 
}: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
            <Image width={50} height={50} className={styles.logoImage} src="/assets/rent-icon-black.png" alt="logo Rent Black" />
            <Link href="/" className={styles.logo} onClick={closeMobileMenu}>
            Rent Brasil
            </Link>
        </div>
        
        {showBackButton ? (
          <>
            {/* Desktop back button */}
            <Link href={backHref} className={styles.backButton}>
              ← Voltar
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        ) : showAdminNav ? (
          <>
            {/* Desktop navigation */}
            <nav className={styles.nav}>
                <Link 
                  href="/admin" 
                  className={`${styles.navLink} ${pathname === '/admin' || pathname === '/admin/' ? styles.active : ''}`}
                >
                <BarChart3 size={16} />
                Dashboard
              </Link>
              <Link 
                href="/admin/pessoas" 
                className={`${styles.navLink} ${pathname === '/admin/pessoas' ? styles.active : ''}`}
              >
                <Users size={16} />
                Pessoas
              </Link>
              <Link 
                href="/admin/itens" 
                className={`${styles.navLink} ${pathname === '/admin/itens' ? styles.active : ''}`}
              >
                <Package size={16} />
                Itens
              </Link>
              <Link 
                href="/admin/locacoes" 
                className={`${styles.navLink} ${pathname === '/admin/locacoes' ? styles.active : ''}`}
              >
                <Calendar size={16} />
                Locações
              </Link>
              <Link 
                href="/admin/avaliacoes" 
                className={`${styles.navLink} ${pathname === '/admin/avaliacoes' ? styles.active : ''}`}
              >
                <Star size={16} />
                Avaliações
              </Link>
            </nav>
            
            {user && (
              <button 
                onClick={signOut}
                className={`${styles.logoutButton} ${styles.desktopOnly}`}
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            )}
            
            {/* Mobile menu button */}
            <button 
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        ) : null}
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
          {showBackButton ? (
            <Link href={backHref} className={styles.mobileBackButton} onClick={closeMobileMenu}>
              ← Voltar
            </Link>
          ) : showAdminNav ? (
            <nav className={styles.mobileNav}>
              <Link 
                href="/admin" 
                className={`${styles.mobileNavLink} ${pathname === '/admin' || pathname === '/admin/' ? styles.active : ''}`}
                onClick={closeMobileMenu}
              >
                <BarChart3 size={16} />
                Dashboard
              </Link>
              <Link 
                href="/admin/pessoas" 
                className={`${styles.mobileNavLink} ${pathname === '/admin/pessoas' ? styles.active : ''}`}
                onClick={closeMobileMenu}
              >
                <Users size={16} />
                Pessoas
              </Link>
              <Link 
                href="/admin/itens" 
                className={`${styles.mobileNavLink} ${pathname === '/admin/itens' ? styles.active : ''}`}
                onClick={closeMobileMenu}
              >
                <Package size={16} />
                Itens
              </Link>
              <Link 
                href="/admin/locacoes" 
                className={`${styles.mobileNavLink} ${pathname === '/admin/locacoes' ? styles.active : ''}`}
                onClick={closeMobileMenu}
              >
                <Calendar size={16} />
                Locações
              </Link>
              <Link 
                href="/admin/avaliacoes" 
                className={`${styles.mobileNavLink} ${pathname === '/admin/avaliacoes' ? styles.active : ''}`}
                onClick={closeMobileMenu}
              >
                <Star size={16} />
                Avaliações
              </Link>
              
              {user && (
                <button 
                  onClick={() => {
                    signOut();
                    closeMobileMenu();
                  }}
                  className={styles.mobileLogoutButton}
                >
                  <LogOut size={16} />
                  Sair
                </button>
              )}
            </nav>
          ) : null}
        </div>
      )}
    </header>
  );
}
