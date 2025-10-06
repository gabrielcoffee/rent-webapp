'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { AvaliacoesService, PessoasService, ItensService } from '@/services';
import { Avaliacao, Pessoa, Item } from '@/services/types';
import styles from './page.module.css';

export default function AdminAvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Avaliacao>>({});
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Avaliacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carregar dados do Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [avaliacoesData, pessoasData, itensData] = await Promise.all([
        AvaliacoesService.getAll(),
        PessoasService.getAll(),
        ItensService.getAll()
      ]);
      setAvaliacoes(avaliacoesData);
      setPessoas(pessoasData);
      setItens(itensData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(errorMessage);
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (avaliacao: Avaliacao) => {
    setEditingId(avaliacao.id);
    setFormData(avaliacao);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({});
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.avaliador_id || !formData.item_id || !formData.estrelas) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await AvaliacoesService.update(editingId, formData);
      } else {
        await AvaliacoesService.create(formData as Omit<Avaliacao, 'id'>);
      }

      await loadData();
      setShowForm(false);
      setFormData({});
      setEditingId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar avaliação';
      setError(errorMessage);
      console.error('Erro ao salvar avaliação:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (avaliacao: Avaliacao) => {
    setItemToDelete(avaliacao);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setSaving(true);
      setError(null);
      await AvaliacoesService.delete(itemToDelete.id);
      await loadData();
      setModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar avaliação';
      setError(errorMessage);
      console.error('Erro ao deletar avaliação:', err);
    } finally {
      setSaving(false);
    }
  };

  /*

  const getPessoaNome = (pessoaId: string) => {
    const pessoa = pessoas.find(p => p.id === pessoaId);
    return pessoa ? `${pessoa.nome} ${pessoa.sobrenome}` : 'Pessoa não encontrada';
  };

  const getItemNome = (itemId: string) => {
    const item = itens.find(i => i.id === itemId);
    return item ? item.nome : 'Item não encontrado';
  };
  */

  const renderStars = (estrelas: number) => {
    return '★'.repeat(estrelas) + '☆'.repeat(5 - estrelas);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
        <Header />
        <div className={styles.content}>
        <div className={styles.header}>
          <h1>Avaliações (em breve...)</h1>
        </div>
      </div>
    </div>
  )
  /*

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Avaliações</h1>
          <button 
            className={styles.addButton}
            onClick={handleCreate}
          >
            + Nova Avaliação
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {avaliacoes.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhuma avaliação encontrada.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Avaliador</th>
                  <th>Item</th>
                  <th>Estrelas</th>
                  <th>Comentário</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoes.map((avaliacao) => (
                  <tr key={avaliacao.id}>
                    <td>{getPessoaNome(avaliacao.avaliador_id)}</td>
                    <td>{getItemNome(avaliacao.item_id)}</td>
                    <td>
                      <span className={styles.stars}>
                        {renderStars(avaliacao.estrelas)}
                      </span>
                    </td>
                    <td className={styles.comment}>
                      {avaliacao.comentario || '-'}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(avaliacao)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(avaliacao)}
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
        )}

        {showForm && (
          <div className={styles.overlay}>
            <div className={styles.form}>
              <h2>{editingId ? 'Editar Avaliação' : 'Nova Avaliação'}</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="avaliador_id">Avaliador *</label>
                <select
                  id="avaliador_id"
                  value={formData.avaliador_id || ''}
                  onChange={(e) => setFormData({ ...formData, avaliador_id: e.target.value })}
                  required
                >
                  <option value="">Selecione um avaliador</option>
                  {pessoas.map((pessoa) => (
                    <option key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome} {pessoa.sobrenome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="item_id">Item *</label>
                <select
                  id="item_id"
                  value={formData.item_id || ''}
                  onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                  required
                >
                  <option value="">Selecione um item</option>
                  {itens.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="estrelas">Estrelas *</label>
                <select
                  id="estrelas"
                  value={formData.estrelas || ''}
                  onChange={(e) => setFormData({ ...formData, estrelas: parseInt(e.target.value) })}
                  required
                >
                  <option value="">Selecione a avaliação</option>
                  <option value="1">1 estrela</option>
                  <option value="2">2 estrelas</option>
                  <option value="3">3 estrelas</option>
                  <option value="4">4 estrelas</option>
                  <option value="5">5 estrelas</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="comentario">Comentário</label>
                <textarea
                  id="comentario"
                  value={formData.comentario || ''}
                  onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                  placeholder="Comentário sobre a avaliação (opcional)"
                  rows={3}
                  maxLength={200}
                />
                <small className={styles.charCount}>
                  {(formData.comentario || '').length}/200 caracteres
                </small>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowForm(false);
                    setFormData({});
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir esta avaliação?`}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
  */
}

