'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';
import { PessoasService } from '@/services';
import { Pessoa } from '@/services/types';
import styles from './page.module.css';

export default function AdminPessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Pessoa>>({});
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carregar dados do Supabase
  useEffect(() => {
    loadPessoas();
  }, []);

  const loadPessoas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PessoasService.getAll();
      setPessoas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pessoas';
      setError(errorMessage);
      console.error('Erro ao carregar pessoas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pessoa: Pessoa) => {
    setEditingId(pessoa.id);
    setFormData(pessoa);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({});
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.nome_pessoa || !formData.telefone || !formData.apartamento) {
      setError('Nome, telefone e apartamento são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        // Atualizar pessoa existente
        await PessoasService.update(editingId, formData);
      } else {
        // Criar nova pessoa
        await PessoasService.create(formData as Omit<Pessoa, 'id'>);
      }

      // Recarregar dados
      await loadPessoas();
      
      setShowForm(false);
      setEditingId(null);
      setFormData({});
    } catch (err) {
      setError('Erro ao salvar pessoa');
      console.error('Erro ao salvar pessoa:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (pessoa: Pessoa) => {
    setItemToDelete(pessoa);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setSaving(true);
      setError(null);
      
      await PessoasService.delete(itemToDelete.id);
      
      // Recarregar dados
      await loadPessoas();
      
      setItemToDelete(null);
      setModalOpen(false);
    } catch (err) {
      setError('Erro ao excluir pessoa');
      console.error('Erro ao excluir pessoa:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  if (loading && pessoas.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className="text-center">
            <p>Carregando pessoas...</p>
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
          <h1>Gerenciar Pessoas</h1>
          <button onClick={handleCreate} className="btn btn-primary">
            + Adicionar Pessoa
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
            <h3>{editingId ? 'Editar Pessoa' : 'Nova Pessoa'}</h3>
            <div className={styles.formGrid}>
              <div>
                <label>Nome *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.nome_pessoa || ''}
                  onChange={(e) => setFormData({ ...formData, nome_pessoa: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <label>Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <label>Telefone *</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label>Apartamento *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.apartamento || ''}
                  onChange={(e) => setFormData({ ...formData, apartamento: e.target.value })}
                  placeholder="101"
                />
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button 
                onClick={handleSave} 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button 
                onClick={handleCancel} 
                className="btn btn-outline"
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Mobile Cards */}
        <div className={styles.mobileCards}>
            {pessoas.map((pessoa) => (
                <ItemCard
                    key={`mobile-${pessoa.id}`}
                    data={pessoa}
                    fields={[
                        { key: 'nome_pessoa', label: 'Nome' },
                        { key: 'email', label: 'Email' },
                        { key: 'telefone', label: 'Telefone' },
                        { key: 'apartamento', label: 'Apartamento' }
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
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Apartamento</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {pessoas.map((pessoa) => (
                        <tr key={`desktop-${pessoa.id}`}>
                            <td>{pessoa.nome_pessoa}</td>
                            <td>{pessoa.email || '-'}</td>
                            <td>{pessoa.telefone}</td>
                            <td>{pessoa.apartamento}</td>
                            <td>
                                <div className={styles.actions}>
                                    <button 
                                        onClick={() => handleEdit(pessoa)}
                                        className={`btn btn-outline ${styles.actionBtn}`}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(pessoa)}
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
          message={`Tem certeza que deseja excluir a pessoa "${itemToDelete?.nome_pessoa}"?`}
          confirmText={saving ? "Excluindo..." : "Excluir"}
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          type="danger"
        />
      </main>
    </div>
  );
}
