import { createClient } from '@supabase/supabase-js'
import { type HistoricalFact } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<{ 
  historical_facts: HistoricalFact 
}>(supabaseUrl, supabaseAnonKey)

export async function getHistoricalFact() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('historical_facts')
    .select('*')
    .eq('publish_date', today)

  if (error) {
    console.error('Error en la consulta:', error.message)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  return data[0]
}

export async function getHistoricalFacts(from?: string, to?: string) {
  const query = supabase
    .from('historical_facts')
    .select('*')
    .order('publish_date', { ascending: false })

  if (from) {
    query.gte('publish_date', from)
  }
  
  if (to) {
    query.lte('publish_date', to)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error:', error.message)
    return []
  }

  return data
}
