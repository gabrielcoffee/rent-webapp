import { supabase } from '@/client/supabase';
import { Avaliacao } from './types';

export class AvaliacoesService {
  static async getAll(): Promise<Avaliacao[]> {
    const { data, error } = await supabase
      .from('avaliacao')
      .select('*');

    if (error) {
      console.error('Erro ao buscar avaliações:', error);
      throw new Error('Falha ao carregar avaliações');
    }

    return data || [];
  }

  static async getByItemId(itemId: string): Promise<Avaliacao[]> {
    const { data, error } = await supabase
      .from('avaliacao')
      .select('*')
      .eq('item_id', itemId);

    if (error) {
      console.error('Erro ao buscar avaliações do item:', error);
      throw new Error('Falha ao carregar avaliações');
    }

    return data || [];
  }

  static async getByAvaliadorId(avaliadorId: string): Promise<Avaliacao[]> {
    const { data, error } = await supabase
      .from('avaliacao')
      .select('*')
      .eq('avaliador_id', avaliadorId);
      
    if (error) {
      console.error('Erro ao buscar avaliações do avaliador:', error);
      throw new Error('Falha ao carregar avaliações');
    }

    return data || [];
  }

  static async getById(id: string): Promise<Avaliacao | null> {
    const { data, error } = await supabase
      .from('avaliacao')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar avaliação:', error);
      return null;
    }

    return data;
  }

  static async create(avaliacao: Omit<Avaliacao, 'id'>): Promise<Avaliacao> {
    const { data, error } = await supabase
      .from('avaliacao')
      .insert([avaliacao])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar avaliação:', error);
      throw new Error('Falha ao criar avaliação');
    }

    return data;
  }

  static async update(id: string, avaliacao: Partial<Omit<Avaliacao, 'id'>>): Promise<Avaliacao> {
    const { data, error } = await supabase
      .from('avaliacao')
      .update(avaliacao)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw new Error('Falha ao atualizar avaliação');
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('avaliacao')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar avaliação:', error);
      throw new Error('Falha ao deletar avaliação');
    }
  }

  static async getMediaAvaliacao(itemId: string): Promise<{
    media: number;
    total: number;
  }> {
    const { data, error } = await supabase
      .from('avaliacao')
      .select('estrelas')
      .eq('item_id', itemId);

    if (error) {
      console.error('Erro ao buscar média de avaliações:', error);
      return { media: 0, total: 0 };
    }

    const total = data?.length || 0;
    if (total === 0) {
      return { media: 0, total: 0 };
    }

    const soma = data?.reduce((acc, av) => acc + av.estrelas, 0) || 0;
    const media = soma / total;

    return { media, total };
  }
}
