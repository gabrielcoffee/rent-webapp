'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import UserHeader from '@/components/UserHeader';
import { CondominiosService, PessoasService, RequisicoesService } from '@/services';
import type { Condominio, Pessoa, Requisicao } from '@/services/types';
import styles from './page.module.css';

const SELECTED_CONDOMINIO_STORAGE_KEY = 'rent_selected_condominio_id';
const CONDOMINIO_CHANGED_EVENT = 'rent-condominio-changed';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Requisicao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [selectedCondominioId, setSelectedCondominioId] = useState<string>('');
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'pretende_pagar'>('nome');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const readSelected = () => setSelectedCondominioId(localStorage.getItem(SELECTED_CONDOMINIO_STORAGE_KEY) || '');
    readSelected();
    window.addEventListener(CONDOMINIO_CHANGED_EVENT, readSelected);
    return () => window.removeEventListener(CONDOMINIO_CHANGED_EVENT, readSelected);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pedidosData, pessoasData, condominiosData] = await Promise.all([
        RequisicoesService.getAll(),
        PessoasService.getAll(),
        CondominiosService.getAll(),
      ]);

      setPedidos(pedidosData);
      setPessoas(pessoasData);
      setCondominios(condominiosData);
    } catch (err) {
      setError('Erro ao carregar pedidos');
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUsuarioName = (usuarioId: string) => {
    const usuario = pessoas.find((p) => p.id === usuarioId);
    return usuario ? usuario.nome_pessoa : 'N/A';
  };

  const handlePedirItemWhatsApp = () => {
    const mensagem = 'Gostaria de pedir o seguinte item: ';
    const telefoneEmpresa = '5541987865005';
    const url = `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const selectedCondominio = useMemo(
    () => condominios.find((c) => c.id === selectedCondominioId),
    [condominios, selectedCondominioId],
  );

  const pessoasById = useMemo(() => {
    const m = new Map<string, Pessoa>();
    pessoas.forEach((p) => m.set(p.id, p));
    return m;
  }, [pessoas]);

  const pedidosFiltrados = useMemo(() => {
    const normalized = filtro.trim().toLowerCase();

    const filtered = pedidos.filter((p) => {
      if (!selectedCondominio) return false;
      const usuario = pessoasById.get(p.usuario_id);
      if (!usuario || usuario.condominio_id !== selectedCondominio.id) return false;
      if (!normalized) return true;
      return p.nome_item.toLowerCase().includes(normalized);
    });

    return filtered.sort((a, b) => {
      if (ordenacao === 'pretende_pagar') {
        const av = a.pretende_pagar_diario ?? Number.POSITIVE_INFINITY;
        const bv = b.pretende_pagar_diario ?? Number.POSITIVE_INFINITY;
        return av - bv;
      }
      return a.nome_item.localeCompare(b.nome_item);
    });
  }, [pedidos, filtro, ordenacao, pessoasById, selectedCondominio]);

  if (loading) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <main className={styles.main}>
          <div className="text-center">
            <p>Carregando pedidos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <UserHeader />
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
                <h1>Pedidos de Itens</h1>
                <p>Veja o que as pessoas estão procurando para alugar</p>
              </div>
            </div>
          </div>
        )}

        {!selectedCondominio && (
          <div className={styles.emptyState}>
            <h3>Selecione um condomínio</h3>
            <p>Clique em “Selecionar Condomínio” no topo para escolher antes de ver os pedidos.</p>
          </div>
        )}

        <div className={styles.filtersRow}>
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Buscar pedidos..."
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
                onChange={(e) => setOrdenacao(e.target.value as 'nome' | 'pretende_pagar')}
              >
                <option value="nome">Nome</option>
                <option value="pretende_pagar">Pretende pagar (menor)</option>
              </select>
            </div>
          </div>

          <div className={styles.pedirCtaInline}>
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

        {selectedCondominio && (
          <div className={styles.itemsGrid}>
            {pedidosFiltrados.map((pedido) => (
              <Link key={pedido.id} href={`/item_pedido/${pedido.id}`} className={styles.itemCard}>
                <div className={styles.itemImage}>
                  {pedido.foto_url ? (
                    <img src={pedido.foto_url} alt={pedido.nome_item} />
                  ) : (
                    <div className={styles.placeholderImage}>📷</div>
                  )}
                </div>

                <div className={styles.itemContent}>
                  <h3 className={styles.itemName}>{pedido.nome_item}</h3>

                  <div className={styles.itemInfo}>
                    <p className={styles.anunciante}>Usuário: {getUsuarioName(pedido.usuario_id)}</p>

                    {typeof pedido.pretende_pagar_diario === 'number' && (
                      <p className={styles.observacoes}>
                        Pretende pagar: <strong>R$ {pedido.pretende_pagar_diario.toFixed(2)}</strong>/dia
                      </p>
                    )}
                  </div>

                  <div className={styles.itemFooter}>
                    <span className={styles.verDetalhes}>Ver detalhes →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {selectedCondominio && pedidosFiltrados.length === 0 && (
          <div className={styles.emptyState}>
            <h3>Nenhum pedido encontrado</h3>
            <p>Tente ajustar a busca</p>
          </div>
        )}
      </main>
    </div>
  );
}

