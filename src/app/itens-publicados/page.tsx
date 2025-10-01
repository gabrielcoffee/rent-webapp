'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ItensService, PessoasService, AvaliacoesService } from '@/services';
import { Item, Pessoa, Avaliacao } from '@/services/types';
import styles from './page.module.css';

export default function ItemsPublicadosPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'preco' | 'avaliacao'>('nome');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados em paralelo
      const [itensData, pessoasData, avaliacoesData] = await Promise.all([
        ItensService.getAll(),
        PessoasService.getAll(),
        AvaliacoesService.getAll()
      ]);
      setItens(itensData);
      setPessoas(pessoasData);
      setAvaliacoes(avaliacoesData);
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

  const itensFiltrados = itens
    .filter(item => 
      item.nome_item.toLowerCase().includes(filtro.toLowerCase()) ||
      item.observacoes?.toLowerCase().includes(filtro.toLowerCase())
    )
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
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            Rent Brasil
          </Link>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Itens Disponíveis para Aluguel</h1>
          <p>Encontre o que você precisa para alugar</p>
        </div>

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

        {itensFiltrados.length === 0 && (
          <div className={styles.emptyState}>
            <h3>Nenhum item encontrado</h3>
            <p>Tente ajustar os filtros de busca</p>
          </div>
        )}
      </main>
    </div>
  );
}
