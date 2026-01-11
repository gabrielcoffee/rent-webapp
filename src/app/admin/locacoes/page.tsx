'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ItemCard, { ItemCardData } from '@/components/ItemCard';
import Modal from '@/components/Modal';
import { SimpleDateSelect } from '@/components/SimpleDateSelect';
import { LocacoesService, ItensService, PessoasService } from '@/services';
import { Locacao, Item, Pessoa } from '@/services/types';
import styles from './page.module.css';

export default function AdminLocacoesPage() {
    const [locacoes, setLocacoes] = useState<Locacao[]>([]);
    const [itens, setItens] = useState<Item[]>([]);
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Locacao>>({});
    const [showForm, setShowForm] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Locacao | null>(null);
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
        const [locacoesData, itensData, pessoasData] = await Promise.all([
            LocacoesService.getAll(),
            ItensService.getAll(),
            PessoasService.getAll()
        ]);
        setLocacoes(locacoesData);
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

    const handleEdit = (locacao: Locacao) => {
        setEditingId(locacao.id);
        setFormData(locacao);
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({ status_pagamento: 'pendente' });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!formData.item_id || !formData.locatario_id || !formData.data_inicio || !formData.data_fim) {
        setError('Item, locatário e datas são obrigatórios');
        return;
        }

        try {
        setSaving(true);
        setError(null);

        if (editingId) {
            await LocacoesService.update(editingId, formData);
        } else {
            await LocacoesService.create(formData as Omit<Locacao, 'id'>);
        }

        await loadData();
        setShowForm(false);
        setEditingId(null);
        setFormData({});
        } catch (err) {
        setError('Erro ao salvar locação');
        console.error('Erro ao salvar locação:', err);
        } finally {
        setSaving(false);
        }
    };

    const handleDelete = (locacao: Locacao) => {
        setItemToDelete(locacao);
        setModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
        setSaving(true);
        setError(null);
        
        await LocacoesService.delete(itemToDelete.id);
        await loadData();
        
        setItemToDelete(null);
        setModalOpen(false);
        } catch (err) {
            setError('Erro ao excluir locação');
            console.error('Erro ao excluir locação:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({});
    };

    const getItemName = (itemId: string) => {
        const item = itens.find(i => i.id === itemId);
        return item ? item.nome_item : 'N/A';
    };

    const getLocatarioName = (locatarioId: string) => {
        const locatario = pessoas.find(p => p.id === locatarioId);
        return locatario ? locatario.nome_pessoa : 'N/A';
    };

    const getStatusBadge = (status: string) => {
        const statusClasses = {
        'pago': styles.statusPago,
        'pendente': styles.statusPendente
        };
        
        const statusLabels = {
        'pago': 'Pago',
        'pendente': 'Pendente'
        };

        return (
        <span className={`${styles.statusBadge} ${statusClasses[status as keyof typeof statusClasses]}`}>
            {statusLabels[status as keyof typeof statusLabels]}
        </span>
        );
    };

    const calculateTotalDays = (dataInicio: string, dataFim: string) => {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        const diffTime = Math.abs(fim.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const calculateTotalValue = (itemId: string, dataInicio: string, dataFim: string) => {
        const item = itens.find(i => i.id === itemId);
        if (!item) return 0;
        const days = calculateTotalDays(dataInicio, dataFim);
        return item.preco_diario * days;
    };

    // Função para corrigir a exibição das datas (problema de timezone)
    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00'); // Força timezone local
        return date.toLocaleDateString('pt-BR');
    };


    if (loading && locacoes.length === 0) {
        return (
        <div className={styles.container}>
            <Header />
            <main className={styles.main}>
            <div className="text-center">
                <p>Carregando locações...</p>
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
            <h1>Gerenciar Locações</h1>
            <button onClick={handleCreate} className="btn btn-primary">
                + Adicionar Locação
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
                <h3>{editingId ? 'Editar Locação' : 'Nova Locação'}</h3>
                <div className={styles.formGrid}>
                <div>
                    <label>Item *</label>
                    <select
                    className="input"
                    value={formData.item_id || ''}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    >
                    <option value="">Selecione um item</option>
                    {itens.map(item => (
                        <option key={item.id} value={item.id}>
                        {item.nome_item} - R$ {item.preco_diario}/dia
                        </option>
                    ))}
                    </select>
                </div>
                
                <div>
                    <label>Locatário *</label>
                    <select
                    className="input"
                    value={formData.locatario_id || ''}
                    onChange={(e) => setFormData({ ...formData, locatario_id: e.target.value })}
                    >
                    <option value="">Selecione um locatário</option>
                    {pessoas.map(pessoa => (
                        <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome_pessoa}{pessoa.apartamento ? ` - Apt ${pessoa.apartamento}` : ''}
                        </option>
                    ))}
                    </select>
                </div>
                
                <div>
                    <SimpleDateSelect
                        label="Data Início"
                        selectedDate={formData.data_inicio ? new Date(formData.data_inicio) : null}
                        onDateChange={(date) => setFormData({ 
                            ...formData, 
                            data_inicio: date.toISOString().split('T')[0] 
                        })}
                        cantBeBeforeToday={false}
                    />
                </div>
                
                <div>
                    <SimpleDateSelect
                        label="Data Fim"
                        selectedDate={formData.data_fim ? new Date(formData.data_fim) : null}
                        onDateChange={(date) => setFormData({ 
                            ...formData, 
                            data_fim: date.toISOString().split('T')[0] 
                        })}
                        cantBeBeforeToday={false}
                    />
                </div>
                
                <div>
                    <label>Status do Pagamento *</label>
                    <select
                    className="input"
                    value={formData.status_pagamento || ''}
                    onChange={(e) => setFormData({ ...formData, status_pagamento: e.target.value })}
                    >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    </select>
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
                {locacoes.map((locacao) => (
                    <ItemCard
                        key={`mobile-${locacao.id}`}
                        data={locacao}
                        onEdit={handleEdit as any}
                        onDelete={handleDelete as any}
                        fields={[
                            { 
                                key: 'item_id', 
                                label: 'Item',
                                render: (value) => getItemName(value)
                            },
                            { 
                                key: 'locatario_id', 
                                label: 'Locatário',
                                render: (value) => getLocatarioName(value)
                            },
                            { 
                                key: 'data_inicio', 
                                label: 'Período',
                                render: (value, data) => 
                                    `${formatDateForDisplay(data.data_inicio)} - ${formatDateForDisplay(data.data_fim)}`
                            },
                            { 
                                key: 'data_fim', 
                                label: 'Dias',
                                render: (value, data) => calculateTotalDays(data.data_inicio, data.data_fim)
                            },
                            { 
                                key: 'status_pagamento', 
                                label: 'Valor Total',
                                render: (value, data) => `R$ ${calculateTotalValue(data.item_id, data.data_inicio, data.data_fim).toFixed(2)}`
                            },
                            { 
                                key: 'id', 
                                label: 'Status',
                                render: (value, data) => getStatusBadge(data.status_pagamento)
                            }
                        ]}
                    />
                ))}
            </div>

            {/* Desktop Table */}
            <div className={`card ${styles.tableCard}`}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Locatário</th>
                            <th>Período</th>
                            <th>Dias</th>
                            <th>Valor Total</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locacoes.map((locacao) => (
                            <tr key={`desktop-${locacao.id}`}>
                                <td>{getItemName(locacao.item_id)}</td>
                                <td>{getLocatarioName(locacao.locatario_id)}</td>
                                <td>
                                    {formatDateForDisplay(locacao.data_inicio)} - {formatDateForDisplay(locacao.data_fim)}
                                </td>
                                <td>{calculateTotalDays(locacao.data_inicio, locacao.data_fim)}</td>
                                <td>
                                    R$ {calculateTotalValue(locacao.item_id, locacao.data_inicio, locacao.data_fim).toFixed(2)}
                                </td>
                                <td>{getStatusBadge(locacao.status_pagamento)}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <button 
                                            onClick={() => handleEdit(locacao)}
                                            className={`btn btn-outline ${styles.actionBtn}`}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(locacao)}
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
                message={`Tem certeza que deseja excluir esta locação?`}
                confirmText={saving ? "Excluindo..." : "Excluir"}
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                type="danger"
            />
        </main>
        </div>
    );
}
