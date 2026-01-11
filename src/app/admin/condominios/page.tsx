'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';
import { CondominiosService, ImageUploadService } from '@/services';
import type { Condominio } from '@/services/types';
import styles from './page.module.css';

export default function AdminCondominiosPage() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Condominio>>({});
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Condominio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadCondominios();
  }, []);

  const loadCondominios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CondominiosService.getAll();
      setCondominios(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar condomínios';
      setError(errorMessage);
      console.error('Erro ao carregar condomínios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (condominio: Condominio) => {
    setEditingId(condominio.id);
    setFormData(condominio);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({});
    setShowForm(true);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.endereco || !formData.foto_url) {
      setError('Nome, endereço e imagem são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await CondominiosService.update(editingId, formData);
      } else {
        await CondominiosService.create(formData as Omit<Condominio, 'id'>);
      }

      await loadCondominios();
      setShowForm(false);
      setEditingId(null);
      setFormData({});
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err) {
      setError('Erro ao salvar condomínio');
      console.error('Erro ao salvar condomínio:', err);
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
    if (!selectedFile || !formData.nome) return;

    try {
      setUploadingImage(true);
      setError(null);
      const imageUrl = await ImageUploadService.uploadCondominioImage(selectedFile, formData.nome);
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

  const handleDelete = (condominio: Condominio) => {
    setItemToDelete(condominio);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setSaving(true);
      setError(null);
      await CondominiosService.delete(itemToDelete.id);
      await loadCondominios();
      setItemToDelete(null);
      setModalOpen(false);
    } catch (err) {
      setError('Erro ao excluir condomínio');
      console.error('Erro ao excluir condomínio:', err);
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

  if (loading && condominios.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className="text-center">
            <p>Carregando condomínios...</p>
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
          <h1>Gerenciar Condomínios</h1>
          <button onClick={handleCreate} className="btn btn-primary">
            + Adicionar Condomínio
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
            <h3>{editingId ? 'Editar Condomínio' : 'Novo Condomínio'}</h3>
            <div className={styles.formGrid}>
              <div>
                <label>Nome *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do condomínio"
                />
              </div>

              <div>
                <label>Endereço *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.endereco || ''}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Endereço"
                />
              </div>

              <div>
                <label>Imagem *</label>

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
                        disabled={uploadingImage || !formData.nome}
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
                      id="condominio-image-upload"
                    />
                    <label htmlFor="condominio-image-upload" className={styles.fileUploadLabel}>
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
          {condominios.map((condominio) => (
            <ItemCard
              key={`mobile-${condominio.id}`}
              data={condominio}
              fields={[
                { key: 'nome', label: 'Nome' },
                { key: 'endereco', label: 'Endereço' },
                { key: 'foto_url', label: 'Imagem' },
              ]}
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
                <th>Imagem</th>
                <th>Nome</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {condominios.map((condominio) => (
                <tr key={`desktop-${condominio.id}`}>
                  <td>
                    {condominio.foto_url ? (
                      <img src={condominio.foto_url} alt={condominio.nome} className={styles.itemImage} />
                    ) : (
                      <div className={styles.placeholderImage}>🏢</div>
                    )}
                  </td>
                  <td>{condominio.nome}</td>
                  <td>{condominio.endereco}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEdit(condominio)}
                        className={`btn btn-outline ${styles.actionBtn}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(condominio)}
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
          message={`Tem certeza que deseja excluir o condomínio "${itemToDelete?.nome}"?`}
          confirmText={saving ? 'Excluindo...' : 'Excluir'}
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          type="danger"
        />
      </main>
    </div>
  );
}

