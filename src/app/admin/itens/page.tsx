'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';
import { ItensService, PessoasService, ImageUploadService } from '@/services';
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
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categorias = {
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({});
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
        if (!formData.nome_item || !formData.anunciante_id || !formData.preco_diario) {
        setError('Nome do item, anunciante e preço diário são obrigatórios');
        return;
        }

        try {
        setSaving(true);
        setError(null);

        console.log('Salvando observações:', formData.observacoes);
        console.log('Quebras de linha:', formData.observacoes?.split('\n').length);

        if (editingId) {
            await ItensService.update(editingId, formData);
        } else {
            await ItensService.create(formData as Omit<Item, 'id'>);
        }

        await loadData();
        setShowForm(false);
        setEditingId(null);
        setFormData({});
        setSelectedFile(null);
        setImagePreview(null);
        } catch (err) {
        setError('Erro ao salvar item');
        console.error('Erro ao salvar item:', err);
        } finally {
        setSaving(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            
            // Criar preview da imagem
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!selectedFile || !formData.nome_item) return;

        try {
            setUploadingImage(true);
            setError(null);

            const imageUrl = await ImageUploadService.uploadItemImage(selectedFile, formData.nome_item);
            setFormData({ ...formData, foto_url: imageUrl });
            
            // Limpar estados de upload
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
        setSelectedFile(null);
        setImagePreview(null);
    };

    const getAnuncianteName = (anuncianteId: string) => {
        const anunciante = pessoas.find(p => p.id === anuncianteId);
        return anunciante ? anunciante.nome_pessoa : 'N/A';
    };

    const getCategoriaFormatada = (categoria: string | undefined) => {
        if (!categoria) return '-';
        return categorias[categoria as keyof typeof categorias] || '-';
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
                        {pessoa.nome_pessoa}{pessoa.apartamento ? ` - Apt ${pessoa.apartamento}` : ''}
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
                    <label>Categoria</label>
                    <select
                    className="input"
                    value={formData.categoria || ''}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    >
                    <option value="">Selecione uma categoria</option>
                    {Object.entries(categorias).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                    </select>
                </div>
                
                <div>
                    <label>Foto do Item</label>
                    
                    {/* Preview da imagem atual */}
                    {formData.foto_url && (
                        <div className={styles.currentImagePreview}>
                            <img src={formData.foto_url} alt="Imagem atual" className={styles.imagePreview} />
                            <button 
                                type="button"
                                onClick={removeImage}
                                className={styles.removeImageBtn}
                            >
                                Remover Imagem
                            </button>
                        </div>
                    )}
                    
                    {/* Preview da nova imagem selecionada */}
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
                    
                    {/* Input de seleção de arquivo */}
                    {!imagePreview && !formData.foto_url && (
                        <div className={styles.fileUploadArea}>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleFileSelect}
                                className={styles.fileInput}
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className={styles.fileUploadLabel}>
                                <span>📷</span>
                                <span>Clique para selecionar uma imagem</span>
                                <small>PNG, JPEG, JPG, WebP (máx. 5MB)</small>
                            </label>
                        </div>
                    )}
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
                            { 
                                key: 'categoria', 
                                label: 'Categoria',
                                render: (value) => getCategoriaFormatada(value)
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
                            <th>Categoria</th>
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
                                <td>{getCategoriaFormatada(item.categoria)}</td>
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
