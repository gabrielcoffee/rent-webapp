'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import UserHeader from '@/components/UserHeader';
import { ItensService, PessoasService, AvaliacoesService, CondominiosService } from '@/services';
import { Item, Pessoa, Avaliacao, Condominio } from '@/services/types';
import styles from './page.module.css';

const SELECTED_CONDOMINIO_STORAGE_KEY = 'rent_selected_condominio_id';
const CONDOMINIO_CHANGED_EVENT = 'rent-condominio-changed';
const OPEN_CONDOMINIO_SELECTOR_EVENT = 'rent-open-condominio-selector';

export default function ItemsPublicadosPage() {
    const [itens, setItens] = useState<Item[]>([]);
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [condominios, setCondominios] = useState<Condominio[]>([]);
    const [selectedCondominioId, setSelectedCondominioId] = useState<string>('');
    const [isCondominioModalOpen, setIsCondominioModalOpen] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [ordenacao, setOrdenacao] = useState<'nome' | 'preco' | 'avaliacao'>('preco');
    const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categorias = {
        'todas': 'Todas as categorias',
        'eletronicos_e_acessorios': 'Eletrônicos e Acessórios',
        'ferramentas_e_equipamentos': 'Ferramentas e Equipamentos',
        'esportes_e_lazer': 'Esportes e Lazer',
        'festas_e_eventos': 'Festas e Eventos',
        'moda_e_acessorios': 'Moda e Acessórios',
        'casa_e_jardim': 'Casa e Jardim',
        'brinquedos_e_jogos': 'Brinquedos e Jogos',
        'instrumentos_musicais': 'Instrumentos Musicais',
        'transporte_e_mobilidade': 'Transporte e Mobilidade',
        'outro': 'Outro'
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const readSelected = () => setSelectedCondominioId(localStorage.getItem(SELECTED_CONDOMINIO_STORAGE_KEY) || '');
        readSelected();
        window.addEventListener(CONDOMINIO_CHANGED_EVENT, readSelected);
        return () => window.removeEventListener(CONDOMINIO_CHANGED_EVENT, readSelected);
    }, []);

    useEffect(() => {
        const openSelector = () => setIsCondominioModalOpen(true);
        window.addEventListener(OPEN_CONDOMINIO_SELECTOR_EVENT, openSelector);
        return () => window.removeEventListener(OPEN_CONDOMINIO_SELECTOR_EVENT, openSelector);
    }, []);

    const loadData = async () => {
        try {
        setLoading(true);
        setError(null);
        
        // Carregar dados em paralelo
        const [itensData, pessoasData, avaliacoesData, condominiosData] = await Promise.all([
            ItensService.getAll(),
            PessoasService.getAll(),
            AvaliacoesService.getAll(),
            CondominiosService.getAll(),
        ]);
        setItens(itensData);
        setPessoas(pessoasData);
        setAvaliacoes(avaliacoesData);
        setCondominios(condominiosData);
        } catch (err) {
        setError('Erro ao carregar dados');
        console.error('Erro ao carregar dados:', err);
        } finally {
        setLoading(false);
        }
    };

    const getAnuncianteName = (anuncianteId: string) => {
        const anunciante = pessoas.find(p => p.id === anuncianteId);
        return anunciante ? anunciante.nome_pessoa : 'N/A';
    };

    const getItemRating = (itemId: string) => {
        const itemAvaliacoes = avaliacoes.filter(av => av.item_id === itemId);
        if (itemAvaliacoes.length === 0) return 0;
        const soma = itemAvaliacoes.reduce((total, av) => total + av.estrelas, 0);
        return soma / itemAvaliacoes.length;
    };

    const getItemRatingCount = (itemId: string) => {
        return avaliacoes.filter(av => av.item_id === itemId).length;
    };

    const selectedCondominio = useMemo(
        () => condominios.find((c) => c.id === selectedCondominioId),
        [condominios, selectedCondominioId],
    );

    const shouldForceSelectCondominio = condominios.length > 0 && !selectedCondominio;

    useEffect(() => {
        if (shouldForceSelectCondominio) setIsCondominioModalOpen(true);
    }, [shouldForceSelectCondominio]);

    const handleSelectCondominio = (condominioId: string) => {
        localStorage.setItem(SELECTED_CONDOMINIO_STORAGE_KEY, condominioId);
        setSelectedCondominioId(condominioId);
        window.dispatchEvent(new Event(CONDOMINIO_CHANGED_EVENT));
        setIsCondominioModalOpen(false);
    };

    const pessoasById = useMemo(() => {
        const m = new Map<string, Pessoa>();
        pessoas.forEach((p) => m.set(p.id, p));
        return m;
    }, [pessoas]);

    const itensFiltrados = itens
        .filter((item) => {
            // se não há condomínio selecionado, não mostra itens (overlay vai aparecer)
            if (!selectedCondominio) return false;

            const anunciante = pessoasById.get(item.anunciante_id);
            if (!anunciante || anunciante.condominio_id !== selectedCondominio.id) return false;

            const matchesSearch = item.nome_item.toLowerCase().includes(filtro.toLowerCase()) ||
                item.observacoes?.toLowerCase().includes(filtro.toLowerCase());
            const matchesCategory = categoriaFiltro === 'todas' || item.categoria === categoriaFiltro;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
        switch (ordenacao) {
            case 'preco':
            return a.preco_diario - b.preco_diario;
            case 'avaliacao':
            return getItemRating(b.id) - getItemRating(a.id);
            default:
            return a.nome_item.localeCompare(b.nome_item);
        }
        });

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
        stars.push('⭐');
        }
        
        if (hasHalfStar) {
        stars.push('⭐');
        }
        
        return stars.join('');
    };

    const handlePedirItemWhatsApp = () => {
        const mensagem = 'Gostaria de pedir o seguinte item: ';
        const telefoneEmpresa = '5541987865005';
        const url = `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
        <div className={styles.container}>
            <header className={styles.header}>
            <div className={styles.headerContent}>
                <Link href="/" className={styles.logo}>
                Rent Brasil
                </Link>
            </div>
            </header>
            <main className={styles.main}>
            <div className="text-center">
                <p>Carregando itens...</p>
            </div>
            </main>
        </div>
        );
    }

    if (error) {
        return (
        <div className={styles.container}>
            <header className={styles.header}>
            <div className={styles.headerContent}>
                <Link href="/" className={styles.logo}>
                Rent Brasil
                </Link>
            </div>
            </header>
            <main className={styles.main}>
            <div className="text-center">
                <p>{error}</p>
                <button onClick={loadData} className="btn btn-primary">
                Tentar novamente
                </button>
            </div>
            </main>
        </div>
        );
    }

    return (
        <div className={styles.container}>
            <UserHeader />
            
            <main className={styles.main}>
            {selectedCondominio && (
                <div className={styles.condominioHeader}>
                    <div className={styles.condominioHeaderInner}>
                        <div className={styles.condominioHeaderImage}>
                            {selectedCondominio.foto_url ? (
                                <img src={selectedCondominio.foto_url} alt={selectedCondominio.nome} />
                            ) : (
                                <div className={styles.condominioHeaderPlaceholder}>🏢</div>
                            )}
                        </div>
                        <div className={styles.condominioHeaderText}>
                            <div className={styles.condominioNameLine}>{selectedCondominio.nome}</div>
                            <h1>Itens Disponíveis para Aluguel</h1>
                            <p>Encontre o que você precisa para alugar</p>
                        </div>
                    </div>
                </div>
            )}

            {isCondominioModalOpen && (
                <div className={styles.selectOverlay} role="dialog" aria-modal="true">
                    <button
                        type="button"
                        className={styles.selectOverlayBackdrop}
                        aria-label="Fechar"
                        onClick={() => setIsCondominioModalOpen(false)}
                    />
                    <div className={styles.selectOverlayContent}>
                        <button
                            type="button"
                            className={styles.selectOverlayClose}
                            aria-label="Fechar"
                            onClick={() => setIsCondominioModalOpen(false)}
                        >
                            ×
                        </button>
                        <h2 className={styles.selectOverlayTitle}>Escolha o condomínio</h2>
                        <div className={styles.condominioGrid}>
                            {condominios.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={styles.condominioCard}
                                    onClick={() => handleSelectCondominio(c.id)}
                                >
                                    <div className={styles.condominioCardImage}>
                                        {c.foto_url ? (
                                            <img src={c.foto_url} alt={c.nome} />
                                        ) : (
                                            <div className={styles.condominioCardPlaceholder}>🏢</div>
                                        )}
                                    </div>
                                    <div className={styles.condominioCardName}>{c.nome}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.filtersRow}>
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Buscar itens..."
                            className="input"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                    
                    <div className={styles.sortBox}>
                        <label>Ordenar por:</label>
                        <select
                            className="input"
                            value={ordenacao}
                            onChange={(e) => setOrdenacao(e.target.value as 'nome' | 'preco' | 'avaliacao')}
                        >
                            <option value="nome">Nome</option>
                            <option value="preco">Preço</option>
                            <option value="avaliacao">Avaliação</option>
                        </select>
                    </div>

                    <div className={styles.sortBox}>
                        <label>Categoria:</label>
                        <select
                            className="input"
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                        >
                            {Object.entries(categorias).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.pedirCtaInline}>
                    <span className={styles.pedirLabel}>Não encontrou o que queria?</span>
                    <button onClick={handlePedirItemWhatsApp} className={`btn ${styles.pedirBtn}`}>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1198px-WhatsApp.svg.png"
                            alt="WhatsApp"
                            className={styles.whatsappIcon}
                        />
                        Pedir item
                    </button>
                </div>
            </div>

            <div className={styles.itemsGrid}>
            {itensFiltrados.map((item) => {
                const rating = getItemRating(item.id);
                const ratingCount = getItemRatingCount(item.id);
                
                return (
                <Link key={item.id} href={`/item/${item.id}`} className={styles.itemCard}>
                    <div className={styles.itemImage}>
                    {item.foto_url ? (
                        <img src={item.foto_url} alt={item.nome_item} />
                    ) : (
                        <div className={styles.placeholderImage}>📷</div>
                    )}
                    </div>
                    
                    <div className={styles.itemContent}>
                    <h3 className={styles.itemName}>{item.nome_item}</h3>
                    
                    <div className={styles.itemInfo}>
                        <p className={styles.anunciante}>
                        Anunciante: {getAnuncianteName(item.anunciante_id)}
                        </p>
                        
                        {rating > 0 && (
                        <div className={styles.rating}>
                            <span className={styles.stars}>{renderStars(rating)}</span>
                            <span className={styles.ratingText}>
                            {rating.toFixed(1)} ({ratingCount} avaliações)
                            </span>
                        </div>
                        )}
                        
                        {item.observacoes && (
                        <p className={styles.observacoes}>{item.observacoes}</p>
                        )}
                    </div>
                    
                    <div className={styles.itemFooter}>
                        <span className={styles.preco}>
                        R$ {item.preco_diario.toFixed(2)}/dia
                        </span>
                        <span className={styles.verDetalhes}>Ver detalhes →</span>
                    </div>
                    </div>
                </Link>
                );
            })}
            </div>

            {!selectedCondominio && !isCondominioModalOpen && (
                <div className={styles.emptyState}>
                    <h3>Selecione um condomínio</h3>
                    <p>Clique em “Selecionar Condomínio” no topo para escolher antes de ver os itens.</p>
                </div>
            )}

            {selectedCondominio && itensFiltrados.length === 0 && (
            <div className={styles.emptyState}>
                <h3>Nenhum item encontrado</h3>
                <p>Tente ajustar os filtros de busca</p>
            </div>
            )}

            <div className={styles.pedirCtaBottom}>
                <span className={styles.pedirLabel}>Não encontrou o que queria?</span>
                <button onClick={handlePedirItemWhatsApp} className={`btn ${styles.pedirBtn}`}>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1198px-WhatsApp.svg.png"
                        alt="WhatsApp"
                        className={styles.whatsappIcon}
                    />
                    Pedir item
                </button>
            </div>
        </main>
        </div>
    );
}
