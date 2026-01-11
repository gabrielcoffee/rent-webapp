import { supabase } from '@/client/supabase';
import { Requisicao } from './types';

export class RequisicoesService {
  static async getAll(): Promise<Requisicao[]> {
    const { data, error } = await supabase
      .from('requisicao')
      .select('*')
      .order('nome_item');

    if (error) {
      console.error('Erro ao buscar requisições:', error);
      throw new Error('Falha ao carregar requisições');
    }

    return data || [];
  }

  static async getById(id: string): Promise<Requisicao | null> {
    const { data, error } = await supabase
      .from('requisicao')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar requisição:', error);
      return null;
    }

    return data;
  }

  static async create(requisicao: Omit<Requisicao, 'id'>): Promise<Requisicao> {
    const { data, error } = await supabase
      .from('requisicao')
      .insert([requisicao])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar requisição:', error);
      throw new Error('Falha ao criar requisição');
    }

    return data;
  }

  static async update(id: string, requisicao: Partial<Omit<Requisicao, 'id'>>): Promise<Requisicao> {
    const { data, error } = await supabase
      .from('requisicao')
      .update(requisicao)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar requisição:', error);
      throw new Error('Falha ao atualizar requisição');
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('requisicao')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar requisição:', error);
      throw new Error('Falha ao deletar requisição');
    }
  }
}

