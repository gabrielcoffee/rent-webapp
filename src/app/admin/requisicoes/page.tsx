'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';
import { ImageUploadService, PessoasService, RequisicoesService } from '@/services';
import type { Pessoa, Requisicao } from '@/services/types';
import styles from './page.module.css';

export default function AdminRequisicoesPage() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Requisicao>>({});
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Requisicao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const [pessoasResult, requisicoesResult] = await Promise.allSettled([
      PessoasService.getAll(),
      RequisicoesService.getAll(),
    ]);

    if (pessoasResult.status === 'fulfilled') {
      setPessoas(pessoasResult.value);
    } else {
      console.error('Erro ao carregar pessoas:', pessoasResult.reason);
      setError('Erro ao carregar pessoas');
      setPessoas([]);
    }

    if (requisicoesResult.status === 'fulfilled') {
      setRequisicoes(requisicoesResult.value);
    } else {
      // Importante: mesmo que a tabela requisicao ainda não exista,
      // queremos permitir criar requisições (principalmente selecionar usuários).
      console.error('Erro ao carregar requisições:', requisicoesResult.reason);
      setRequisicoes([]);
      setError((prev) => prev || 'Erro ao carregar requisições (verifique se a tabela "requisicao" existe no Supabase)');
    }

    setLoading(false);
  };

  const handleEdit = (requisicao: Requisicao) => {
    setEditingId(requisicao.id);
    setFormData(requisicao);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!formData.nome_item || !formData.usuario_id) {
      setError('Nome do item e usuário são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await RequisicoesService.update(editingId, formData);
      } else {
        await RequisicoesService.create(formData as Omit<Requisicao, 'id'>);
      }

      await loadData();
      setShowForm(false);
      setEditingId(null);
      setFormData({});
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err) {
      setError('Erro ao salvar requisição');
      console.error('Erro ao salvar requisição:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedFile || !formData.nome_item) return;

    try {
      setUploadingImage(true);
      setError(null);
      const imageUrl = await ImageUploadService.uploadItemImage(selectedFile, formData.nome_item);
      setFormData({ ...formData, foto_url: imageUrl });
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no upload da imagem';
      setError(errorMessage);
      console.error('Erro no upload:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({ ...formData, foto_url: undefined });
  };

  const handleDelete = (requisicao: Requisicao) => {
    setItemToDelete(requisicao);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setSaving(true);
      setError(null);
      await RequisicoesService.delete(itemToDelete.id);
      await loadData();
      setItemToDelete(null);
      setModalOpen(false);
    } catch (err) {
      setError('Erro ao excluir requisição');
      console.error('Erro ao excluir requisição:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
    setSelectedFile(null);
    setImagePreview(null);
  };

  const getUsuarioName = (usuarioId: string) => {
    const usuario = pessoas.find((p) => p.id === usuarioId);
    return usuario ? usuario.nome_pessoa : 'N/A';
  };

  if (loading && requisicoes.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className="text-center">
            <p>Carregando requisições...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Gerenciar Requisições</h1>
          <button onClick={handleCreate} className="btn btn-primary">
            + Adicionar Requisição
          </button>
        </div>

        {error && (
          <div className={`card ${styles.errorCard}`}>
            <p className={styles.errorText}>{error}</p>
            <button onClick={() => setError(null)} className="btn btn-outline">
              Fechar
            </button>
          </div>
        )}

        {showForm && (
          <div className={`card ${styles.formCard}`}>
            <h3>{editingId ? 'Editar Requisição' : 'Nova Requisição'}</h3>

            <div className={styles.formGrid}>
              <div>
                <label>Nome do Item *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.nome_item || ''}
                  onChange={(e) => setFormData({ ...formData, nome_item: e.target.value })}
                  placeholder="Nome do item"
                />
              </div>

              <div>
                <label>Usuário *</label>
                <select
                  className="input"
                  value={formData.usuario_id || ''}
                  onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                >
                  <option value="">Selecione um usuário</option>
                  {pessoas.map((pessoa) => (
                    <option key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome_pessoa}{pessoa.apartamento ? ` - Apt ${pessoa.apartamento}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Pretende pagar por dia (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.pretende_pagar_diario ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      pretende_pagar_diario: value === '' ? undefined : Number.parseFloat(value),
                    });
                  }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label>Foto (opcional)</label>

                {formData.foto_url && (
                  <div className={styles.currentImagePreview}>
                    <img src={formData.foto_url} alt="Imagem atual" className={styles.imagePreview} />
                    <button type="button" onClick={removeImage} className={styles.removeImageBtn}>
                      Remover Imagem
                    </button>
                  </div>
                )}

                {imagePreview && !formData.foto_url && (
                  <div className={styles.newImagePreview}>
                    <img src={imagePreview} alt="Nova imagem" className={styles.imagePreview} />
                    <div className={styles.imageActions}>
                      <button
                        type="button"
                        onClick={uploadImage}
                        disabled={uploadingImage || !formData.nome_item}
                        className="btn btn-primary"
                      >
                        {uploadingImage ? 'Enviando...' : 'Enviar Imagem'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="btn btn-outline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {!imagePreview && !formData.foto_url && (
                  <div className={styles.fileUploadArea}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileSelect}
                      className={styles.fileInput}
                      id="requisicao-image-upload"
                    />
                    <label htmlFor="requisicao-image-upload" className={styles.fileUploadLabel}>
                      <span>📷</span>
                      <span>Clique para selecionar uma imagem</span>
                      <small>PNG, JPEG, JPG, WebP (máx. 5MB)</small>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button onClick={handleCancel} className="btn btn-outline" disabled={saving}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Mobile Cards */}
        <div className={styles.mobileCards}>
          {requisicoes.map((requisicao) => (
            <ItemCard
              key={`mobile-${requisicao.id}`}
              data={requisicao}
              fields={[
                { key: 'nome_item', label: 'Nome' },
                {
                  key: 'usuario_id',
                  label: 'Usuário',
                  render: (value) => getUsuarioName(value),
                },
                {
                  key: 'pretende_pagar_diario',
                  label: 'Pretende pagar/dia',
                  render: (value) =>
                    typeof value === 'number' ? `R$ ${Number(value).toFixed(2)}` : '-',
                },
              ]}
              imageField="foto_url"
              imageLabel="Foto"
              onEdit={handleEdit as any}
              onDelete={handleDelete as any}
            />
          ))}
        </div>

        {/* Desktop Table */}
        <div className={`card ${styles.tableCard}`}>
          <table className="table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Usuário</th>
                <th>Pretende pagar/dia</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requisicoes.map((requisicao) => (
                <tr key={`desktop-${requisicao.id}`}>
                  <td>
                    {requisicao.foto_url ? (
                      <img
                        src={requisicao.foto_url}
                        alt={requisicao.nome_item}
                        className={styles.itemImage}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>📷</div>
                    )}
                  </td>
                  <td>{requisicao.nome_item}</td>
                  <td>{getUsuarioName(requisicao.usuario_id)}</td>
                  <td>
                    {typeof requisicao.pretende_pagar_diario === 'number'
                      ? `R$ ${requisicao.pretende_pagar_diario.toFixed(2)}`
                      : '-'}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEdit(requisicao)}
                        className={`btn btn-outline ${styles.actionBtn}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(requisicao)}
                        className={`btn btn-secondary ${styles.actionBtn}`}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => !saving && setModalOpen(false)}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir a requisição "${itemToDelete?.nome_item}"?`}
          confirmText={saving ? 'Excluindo...' : 'Excluir'}
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          type="danger"
        />
      </main>
    </div>
  );
}

