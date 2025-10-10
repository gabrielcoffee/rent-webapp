'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { ItensService, PessoasService, AvaliacoesService } from '@/services';
import { Item, Pessoa, Avaliacao } from '@/services/types';
import styles from './page.module.css';

export default function ItemPage() {
  const params = useParams();
  const itemId = params.id as string;
  
  const [item, setItem] = useState<Item | null>(null);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [itemId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [itemData, pessoasData, avaliacoesData] = await Promise.all([
        ItensService.getById(itemId),
        PessoasService.getAll(),
        AvaliacoesService.getByItemId(itemId)
      ]);
      setItem(itemData);
      setPessoas(pessoasData);
      setAvaliacoes(avaliacoesData);
    } catch (err) {
      setError('Erro ao carregar dados do item');
      console.error('Erro ao carregar dados do item:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className={styles.container}>
        <Header showAdminNav={false} showBackButton backHref="/itens-publicados" />
        <main className={styles.main}>
          <div className="text-center">
            <p>Carregando item...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.container}>
        <Header showAdminNav={false} showBackButton backHref="/itens-publicados" />
        <main className={styles.main}>
          <div className={styles.notFound}>
            <h1>{error || 'Item não encontrado'}</h1>
            <p>O item que você está procurando não existe ou houve um erro ao carregá-lo.</p>
            <Link href="/itens-publicados" className="btn btn-primary">
              Voltar para a lista
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const anunciante = pessoas.find(p => p.id === item.anunciante_id);
  const itemAvaliacoes = avaliacoes;
  
  const categorias: { [key: string]: string } = {
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

  const getCategoriaFormatada = (categoria: string | undefined) => {
    if (!categoria) return 'não foi definida';
    return categorias[categoria] || 'não foi definida';
  };
  
  const getAvaliadorName = (avaliadorId: string) => {
    const avaliador = pessoas.find(p => p.id === avaliadorId);
    return avaliador ? avaliador.nome_pessoa : 'Anônimo';
  };

  const calcularMediaAvaliacoes = () => {
    if (itemAvaliacoes.length === 0) return 0;
    const soma = itemAvaliacoes.reduce((total, av) => total + av.estrelas, 0);
    return soma / itemAvaliacoes.length;
  };

  const renderStars = (rating: number, size: 'small' | 'large' = 'small') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starSize = size === 'large' ? '1.5rem' : '1rem';
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    
    if (hasHalfStar) {
      stars.push('⭐');
    }
    
    return (
      <span style={{ fontSize: starSize }}>
        {stars.join('')}
      </span>
    );
  };

  const handleAlugarWhatsApp = () => {
    const mensagem = `Olá! Gostaria de alugar o item "${item.nome_item}" nas seguintes datas:`;
    const telefoneEmpresa = '5541987865005'; // Número da empresa
    const url = `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={styles.container}>
      <Header showAdminNav={false} showBackButton backHref="/itens-publicados" />
      
      <main className={styles.main}>
        <div className={styles.itemContainer}>
          <div className={styles.itemImage}>
            {item.foto_url ? (
              <img src={item.foto_url} alt={item.nome_item} />
            ) : (
              <div className={styles.placeholderImage}>📷</div>
            )}
          </div>
          
          <div className={styles.itemDetails}>
            <h1 className={styles.itemName}>{item.nome_item}</h1>
            <p className={styles.categoria}>Categoria: {getCategoriaFormatada(item.categoria)}</p>

            {item.observacoes && (
              <div className={styles.observacoes}>
                <h3>Descrição</h3>
                <p>{item.observacoes}</p>
              </div>
            )}
            
            <div className={styles.anuncianteInfo}>
              <p className={styles.anuncianteText}>
                {anunciante?.nome_pessoa || 'N/A'}
                {anunciante && <span className={styles.apartamento}> • Apt {anunciante.apartamento}</span>}
              </p>
            </div>
            
            <div className={styles.precosContainer}>
              <div className={`${styles.precoCard} ${styles.preco1}`}>
                <span className={styles.precoValor}>R$ {item.preco_diario.toFixed(2)}</span>
                <span className={styles.precoPeriodo}>por dia</span>
              </div>
              
              <div className={`${styles.precoCard} ${styles.preco2}`}>
                <span className={styles.precoValor}>R$ {(item.preco_diario * 3 * 0.9).toFixed(2)}</span>
                <span className={styles.precoPeriodo}>por 3 dias</span>
              </div>
              
              <div className={`${styles.precoCard} ${styles.preco3}`}>
                <span className={styles.precoValor}>R$ {(item.preco_diario * 7 * 0.85).toFixed(2)}</span>
                <span className={styles.precoPeriodo}>por 1 semana</span>
              </div>
              
              {/*
              <div className={`${styles.precoCard} ${styles.preco4}`}>
                <span className={styles.precoValor}>R$ {(item.preco_diario * 30 * 0.8).toFixed(2)}</span>
                <span className={styles.precoPeriodo}>por 1 mês</span>
              </div>
              */}

              
            </div>
            
            
            <button 
              onClick={handleAlugarWhatsApp}
              className={`btn ${styles.alugarBtn}`}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1198px-WhatsApp.svg.png" alt="WhatsApp" className={styles.whatsappIcon} />
              Alugar via WhatsApp
            </button>
          </div>
        </div>
        
        <div className={styles.avaliacoesSection}>
          <h2>Avaliações dos Usuários</h2>
          
          {itemAvaliacoes.length > 0 ? (
            <>
              <div className={styles.ratingSummary}>
                <div className={styles.ratingStars}>
                  {renderStars(calcularMediaAvaliacoes(), 'large')}
                </div>
                <div className={styles.ratingInfo}>
                  <span className={styles.ratingNumber}>
                    {calcularMediaAvaliacoes().toFixed(1)}
                  </span>
                  <span className={styles.ratingCount}>
                    ({itemAvaliacoes.length} avaliações)
                  </span>
                </div>
              </div>
              
              <div className={styles.avaliacoesList}>
                {itemAvaliacoes.map((avaliacao) => (
                  <div key={avaliacao.id} className={styles.avaliacaoItem}>
                    <div className={styles.avaliacaoHeader}>
                      <span className={styles.avaliadorName}>
                        {getAvaliadorName(avaliacao.avaliador_id)}
                      </span>
                      <div className={styles.avaliacaoStars}>
                        {renderStars(avaliacao.estrelas)}
                      </div>
                    </div>
                    {avaliacao.comentario && (
                      <p className={styles.avaliacaoComentario}>
                        {avaliacao.comentario}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.noAvaliacoes}>
              Este item ainda não possui avaliações.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
