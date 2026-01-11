import { supabase } from '@/client/supabase';
import { Condominio } from './types';

export class CondominiosService {
  static async getAll(): Promise<Condominio[]> {
    const { data, error } = await supabase
      .from('condominio')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar condomínios:', error);
      throw new Error('Falha ao carregar condomínios');
    }

    return data || [];
  }

  static async getById(id: string): Promise<Condominio | null> {
    const { data, error } = await supabase
      .from('condominio')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar condomínio:', error);
      return null;
    }

    return data;
  }

  static async create(condominio: Omit<Condominio, 'id'>): Promise<Condominio> {
    const { data, error } = await supabase
      .from('condominio')
      .insert([condominio])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar condomínio:', error);
      throw new Error('Falha ao criar condomínio');
    }

    return data;
  }

  static async update(id: string, condominio: Partial<Omit<Condominio, 'id'>>): Promise<Condominio> {
    const { data, error } = await supabase
      .from('condominio')
      .update(condominio)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar condomínio:', error);
      throw new Error('Falha ao atualizar condomínio');
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('condominio')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar condomínio:', error);
      throw new Error('Falha ao deletar condomínio');
    }
  }
}

