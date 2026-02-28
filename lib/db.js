import { supabase } from './supabase';

export async function readData(table) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`Error reading ${table}:`, error);
    return [];
  }
  return data || [];
}

export async function insertData(table, record) {
  const { data, error } = await supabase.from(table).insert([record]).select();
  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  }
  return data?.[0] || record;
}

export async function updateData(table, id, record) {
  const { data, error } = await supabase.from(table).update(record).eq('id', id).select();
  if (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
  return data?.[0] || record;
}

export async function deleteData(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
  return true;
}

export async function findById(table, id) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error) {
    // single() returns error if not found, usually 406 or GRPC error
    return null;
  }
  return data;
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
