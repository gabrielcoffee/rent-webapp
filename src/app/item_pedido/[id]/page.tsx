'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import UserHeader from '@/components/UserHeader';
import ImageModal from '@/components/ImageModal';
import { CondominiosService, PessoasService, RequisicoesService } from '@/services';
import type { Condominio, Pessoa, Requisicao } from '@/services/types';
import styles from './page.module.css';

export default function ItemPedidoPage() {
  const params = useParams();
  const pedidoId = params.id as string;

  const [pedido, setPedido] = useState<Requisicao | null>(null);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pedidoData, pessoasData, condominiosData] = await Promise.all([
        RequisicoesService.getById(pedidoId),
        PessoasService.getAll(),
        CondominiosService.getAll(),
      ]);

      setPedido(pedidoData);
      setPessoas(pessoasData);
      setCondominios(condominiosData);
    } catch (err) {
      setError('Erro ao carregar dados do pedido');
      console.error('Erro ao carregar dados do pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <UserHeader showBackButton backHref="/pedidos" />
        <main className={styles.main}>
          <div className="text-center">
            <p>Carregando pedido...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className={styles.container}>
        <UserHeader showBackButton backHref="/pedidos" />
        <main className={styles.main}>
          <div className={styles.notFound}>
            <h1>{error || 'Pedido não encontrado'}</h1>
            <p>O pedido que você está procurando não existe ou houve um erro ao carregá-lo.</p>
            <Link href="/pedidos" className="btn btn-primary">
              Voltar para a lista
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const usuario = pessoas.find((p) => p.id === pedido.usuario_id);
  const valorDia = pedido.pretende_pagar_diario;

  const getCondominioName = (condominioId: string) => {
    const condominio = condominios.find((c) => c.id === condominioId);
    return condominio ? condominio.nome : 'N/A';
  };

  const handleAnunciarWhatsApp = () => {
    const valorTexto =
      typeof valorDia === 'number' ? ` (pretende pagar R$ ${valorDia.toFixed(2)}/dia)` : '';
    const mensagem = `Olá! Vi o pedido do item "${pedido.nome_item}"${valorTexto} e gostaria de anunciar esse item.`;
    const telefoneEmpresa = '5541987865005';
    const url = `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={styles.container}>
      <UserHeader showBackButton backHref="/pedidos" />

      <main className={styles.main}>
        <div className={styles.itemContainer}>
          <div
            className={styles.itemImage}
            onClick={() => pedido.foto_url && setIsImageModalOpen(true)}
            style={{ cursor: pedido.foto_url ? 'pointer' : 'default' }}
          >
            {pedido.foto_url ? (
              <img src={pedido.foto_url} alt={pedido.nome_item} />
            ) : (
              <div className={styles.placeholderImage}>📷</div>
            )}
          </div>

          <div className={styles.itemDetails}>
            <h1 className={styles.itemName}>{pedido.nome_item}</h1>
            <p className={styles.categoria}>
              {typeof valorDia === 'number'
                ? `Pretende pagar: R$ ${valorDia.toFixed(2)}/dia`
                : 'Valor pretendido: não informado'}
            </p>

            <div className={styles.anuncianteInfo}>
              <p className={styles.anuncianteText}>
                {usuario?.nome_pessoa || 'N/A'}
                {usuario && <span className={styles.apartamento}> • {getCondominioName(usuario.condominio_id)}</span>}
              </p>
            </div>

            <button onClick={handleAnunciarWhatsApp} className={`btn ${styles.alugarBtn}`}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1198px-WhatsApp.svg.png"
                alt="WhatsApp"
                className={styles.whatsappIcon}
              />
              Anunciar esse item
            </button>
          </div>
        </div>
      </main>

      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={pedido.foto_url || ''}
        altText={pedido.nome_item}
        onClose={() => setIsImageModalOpen(false)}
      />
    </div>
  );
}

