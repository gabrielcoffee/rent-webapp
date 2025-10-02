import { supabase } from '@/client/supabase';
import { Locacao, LocacaoComCalculos } from './types';

export class LocacoesService {
    static async getAll(): Promise<LocacaoComCalculos[]> {
        const { data, error } = await supabase
        .from('locacao')
        .select(`
            *,
            item:item_id(nome_item, preco_diario),
            locatario:locatario_id(nome_pessoa)
        `)
        .order('data_inicio', { ascending: false });

        if (error) {
        console.error('Erro ao buscar locações:', error);
        throw new Error('Falha ao carregar locações');
        }

        // Processar dados e calcular campos
        return data?.map(locacao => this.processarLocacao(locacao)) || [];
    }

    static async getById(id: string): Promise<LocacaoComCalculos | null> {
        const { data, error } = await supabase
        .from('locacao')
        .select(`
            *,
            item:item_id(nome_item, preco_diario),
            locatario:locatario_id(nome_pessoa)
        `)
        .eq('id', id)
        .single();

        if (error) {
        console.error('Erro ao buscar locação:', error);
        return null;
        }

        return this.processarLocacao(data);
    }

    static async create(locacao: Omit<Locacao, 'id'>): Promise<LocacaoComCalculos> {
        const { data, error } = await supabase
        .from('locacao')
        .insert([locacao])
        .select(`
            *,
            item:item_id(nome_item, preco_diario),
            locatario:locatario_id(nome_pessoa)
        `)
        .single();

        if (error) {
        console.error('Erro ao criar locação:', error);
        throw new Error('Falha ao criar locação');
        }

        return this.processarLocacao(data);
    }

    static async update(id: string, locacao: Partial<Omit<Locacao, 'id'>>): Promise<LocacaoComCalculos> {
        const locacaoToUpdate = {
            item_id: locacao.item_id,
            data_inicio: locacao.data_inicio,
            data_fim: locacao.data_fim,
            status_pagamento: locacao.status_pagamento,
            locatario_id: locacao.locatario_id
        };
        const { data, error } = await supabase
        .from('locacao')
        .update(locacaoToUpdate)
        .eq('id', id)
        .select(`
            *,
            item:item_id(nome_item, preco_diario),
            locatario:locatario_id(nome_pessoa)
        `)
        .single();

        if (error) {
            console.error('Erro ao atualizar locação:', error);
            throw new Error('Falha ao atualizar locação');
        }

        return this.processarLocacao(data);
    }

    static async delete(id: string): Promise<void> {
        const { error } = await supabase
        .from('locacao')
        .delete()
        .eq('id', id);

        if (error) {
        console.error('Erro ao deletar locação:', error);
        throw new Error('Falha ao deletar locação');
        }
    }

    private static processarLocacao(data: any): LocacaoComCalculos {
        const dias = this.calcularDias(data.data_inicio, data.data_fim);
        const precoDiario = data.item?.preco_diario || 0;
        const valorTotal = dias * precoDiario;

        return {
        id: data.id,
        item_id: data.item_id,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        status_pagamento: data.status_pagamento,
        locatario_id: data.locatario_id,
        dias,
        valor_total: valorTotal,
        item_nome: data.item?.nome_item || 'N/A',
        locatario_nome: data.locatario?.nome_pessoa || 'N/A'
        };
    }

    private static calcularDias(dataInicio: string, dataFim: string): number {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        const diffTime = Math.abs(fim.getTime() - inicio.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    static async getStats(): Promise<{
        total: number;
        pago: number;
        pendente: number;
        dinheiro_circulado: number;
    }> {
        const { data, error } = await supabase
        .from('locacao')
        .select(`
            status_pagamento,
            item:item_id(preco_diario),
            data_inicio,
            data_fim
        `);

        if (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw new Error('Falha ao carregar estatísticas');
        }

        const stats = {
            total: data?.length || 0,
            pago: 0,
            pendente: 0,
            dinheiro_circulado: 0
        };

        data?.forEach(locacao => {
            if (locacao.status_pagamento === 'pago') {
                stats.pago++;
                const dias = this.calcularDias(locacao.data_inicio, locacao.data_fim);
                const valor = dias * (locacao.item?.[0]?.preco_diario || 0);
                stats.dinheiro_circulado += valor;
            } else {
                stats.pendente++;
            }
        });

        return stats;
    }
}
