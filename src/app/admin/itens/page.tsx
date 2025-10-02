'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';
import { ItensService, PessoasService } from '@/services';
import { Item, Pessoa } from '@/services/types';
import styles from './page.module.css';

export default function AdminItemsPage() {
    const [itens, setItens] = useState<Item[]>([]);
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Item>>({});
    const [showForm, setShowForm] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
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
        const [itensData, pessoasData] = await Promise.all([
            ItensService.getAll(),
            PessoasService.getAll()
        ]);
        setItens(itensData);
        setPessoas(pessoasData);
        } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(errorMessage);
        console.error('Erro ao carregar dados:', err);
        } finally {
        setLoading(false);
        }
    };

    const handleEdit = (item: Item) => {
        setEditingId(item.id);
        setFormData(item);
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({});
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!formData.nome_item || !formData.anunciante_id || !formData.preco_diario) {
        setError('Nome do item, anunciante e preço diário são obrigatórios');
        return;
        }

        try {
        setSaving(true);
        setError(null);

        if (editingId) {
            await ItensService.update(editingId, formData);
        } else {
            await ItensService.create(formData as Omit<Item, 'id'>);
        }

        await loadData();
        setShowForm(false);
        setEditingId(null);
        setFormData({});
        } catch (err) {
        setError('Erro ao salvar item');
        console.error('Erro ao salvar item:', err);
        } finally {
        setSaving(false);
        }
    };

    const handleDelete = (item: Item) => {
        setItemToDelete(item);
        setModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
        setSaving(true);
        setError(null);
        
        await ItensService.delete(itemToDelete.id);
        await loadData();
        
        setItemToDelete(null);
        setModalOpen(false);
        } catch (err) {
        setError('Erro ao excluir item');
        console.error('Erro ao excluir item:', err);
        } finally {
        setSaving(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({});
    };

    const getAnuncianteName = (anuncianteId: string) => {
        const anunciante = pessoas.find(p => p.id === anuncianteId);
        return anunciante ? anunciante.nome_pessoa : 'N/A';
    };

    if (loading && itens.length === 0) {
        return (
        <div className={styles.container}>
            <Header />
            <main className={styles.main}>
            <div className="text-center">
                <p>Carregando itens...</p>
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
            <h1>Gerenciar Itens</h1>
            <button onClick={handleCreate} className="btn btn-primary">
                + Adicionar Item
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
                <h3>{editingId ? 'Editar Item' : 'Novo Item'}</h3>
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
                    <label>Anunciante *</label>
                    <select
                    className="input"
                    value={formData.anunciante_id || ''}
                    onChange={(e) => setFormData({ ...formData, anunciante_id: e.target.value })}
                    >
                    <option value="">Selecione um anunciante</option>
                    {pessoas.map(pessoa => (
                        <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome_pessoa} - Apt {pessoa.apartamento}
                        </option>
                    ))}
                    </select>
                </div>
                
                <div>
                    <label>Preço Diário (R$) *</label>
                    <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    value={formData.preco_diario || ''}
                    onChange={(e) => setFormData({ ...formData, preco_diario: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    />
                </div>
                
                <div>
                    <label>URL da Foto</label>
                    <input
                    type="url"
                    className="input"
                    value={formData.foto_url || ''}
                    onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                    placeholder="https://exemplo.com/foto.jpg"
                    />
                </div>
                
                <div className={styles.fullWidth}>
                    <label>Observações</label>
                    <textarea
                    className="input"
                    rows={3}
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações sobre o item..."
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
                {itens.map((item) => (
                    <ItemCard
                        key={`mobile-${item.id}`}
                        data={item}
                        fields={[
                            { key: 'nome_item', label: 'Nome' },
                            { 
                                key: 'anunciante_id', 
                                label: 'Anunciante',
                                render: (value) => getAnuncianteName(value)
                            },
                            { 
                                key: 'preco_diario', 
                                label: 'Preço Diário',
                                render: (value) => `R$ ${Number(value).toFixed(2)}`
                            },
                            { key: 'observacoes', label: 'Observações' }
                        ]}
                        imageField="foto_url"
                        imageLabel="Foto do Item"
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
                            <th>Anunciante</th>
                            <th>Preço Diário</th>
                            <th>Observações</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itens.map((item) => (
                            <tr key={`desktop-${item.id}`}>
                                <td>
                                    {item.foto_url ? (
                                        <img 
                                            src={item.foto_url} 
                                            alt={item.nome_item}
                                            className={styles.itemImage}
                                        />
                                    ) : (
                                        <div className={styles.placeholderImage}>📷</div>
                                    )}
                                </td>
                                <td>{item.nome_item}</td>
                                <td>{getAnuncianteName(item.anunciante_id)}</td>
                                <td>R$ {item.preco_diario.toFixed(2)}</td>
                                <td className={styles.observacoes}>
                                    {item.observacoes || '-'}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className={`btn btn-outline ${styles.actionBtn}`}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item)}
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
                message={`Tem certeza que deseja excluir o item "${itemToDelete?.nome_item}"?`}
                confirmText={saving ? "Excluindo..." : "Excluir"}
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                type="danger"
            />
        </main>
        </div>
    );
}
