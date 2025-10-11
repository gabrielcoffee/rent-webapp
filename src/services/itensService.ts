import { supabase } from '@/client/supabase';
import { Item, ItemComAvaliacoes } from './types';

export class ItensService {
  static async getAll(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('item')
      .select('*')
      .order('nome_item');

    if (error) {
      console.error('Erro ao buscar itens:', error);
      throw new Error('Falha ao carregar itens');
    }

    return data || [];
  }

  static async getById(id: string): Promise<Item | null> {
    const { data, error } = await supabase
      .from('item')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar item:', error);
      return null;
    }

    return data;
  }

  static async getAllWithAvaliacoes(): Promise<ItemComAvaliacoes[]> {
    const { data: itens, error: itensError } = await supabase
      .from('item')
      .select(`
        *,
        avaliacao(estrelas)
      `)
      .order('nome_item');

    if (itensError) {
      console.error('Erro ao buscar itens com avaliações:', itensError);
      throw new Error('Falha ao carregar itens');
    }

    // Processar avaliações
    return itens?.map(item => {
      const avaliacoes = item.avaliacao || [];
      const totalAvaliacoes = avaliacoes.length;
      const media = totalAvaliacoes > 0 
        ? avaliacoes.reduce((sum: number, av: any) => sum + av.estrelas, 0) / totalAvaliacoes
        : 0;

      return {
        ...item,
        avaliacao_media: media,
        total_avaliacoes: totalAvaliacoes
      };
    }) || [];
  }

  static async create(item: Omit<Item, 'id'>): Promise<Item> {
    console.log('ItensService.create - Observações antes de salvar:', item.observacoes);
    
    const { data, error } = await supabase
      .from('item')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar item:', error);
      throw new Error('Falha ao criar item');
    }

    console.log('ItensService.create - Observações depois de salvar:', data.observacoes);
    return data;
  }

  static async update(id: string, item: Partial<Omit<Item, 'id'>>): Promise<Item> {
    console.log('ItensService.update - Observações antes de salvar:', item.observacoes);
    
    const { data, error } = await supabase
      .from('item')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar item:', error);
      throw new Error('Falha ao atualizar item');
    }

    console.log('ItensService.update - Observações depois de salvar:', data.observacoes);
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('item')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar item:', error);
      throw new Error('Falha ao deletar item');
    }
  }
}
