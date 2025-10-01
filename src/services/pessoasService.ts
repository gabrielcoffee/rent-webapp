import { supabase } from '@/client/supabase';
import { Pessoa } from './types';

export class PessoasService {
  static async getAll(): Promise<Pessoa[]> {
    const { data, error } = await supabase
      .from('pessoa')
      .select('*')
      .order('nome_pessoa');

    if (error) {
      console.error('Erro ao buscar pessoas:', error);
      throw new Error('Falha ao carregar pessoas');
    }

    return data || [];
  }

  static async getById(id: string): Promise<Pessoa | null> {
    const { data, error } = await supabase
      .from('pessoa')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar pessoa:', error);
      return null;
    }

    return data;
  }

  static async create(pessoa: Omit<Pessoa, 'id'>): Promise<Pessoa> {
    const { data, error } = await supabase
      .from('pessoa')
      .insert([pessoa])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pessoa:', error);
      throw new Error('Falha ao criar pessoa');
    }

    return data;
  }

  static async update(id: string, pessoa: Partial<Omit<Pessoa, 'id'>>): Promise<Pessoa> {
    const { data, error } = await supabase
      .from('pessoa')
      .update(pessoa)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar pessoa:', error);
      throw new Error('Falha ao atualizar pessoa');
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pessoa')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar pessoa:', error);
      throw new Error('Falha ao deletar pessoa');
    }
  }
}
