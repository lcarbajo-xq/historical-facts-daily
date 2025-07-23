import { createClient } from '@supabase/supabase-js'
import { type HistoricalFact } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Determinar qué tabla usar según el entorno
const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'
const tableName = isDevelopment ? 'historical_facts_test' : 'historical_facts'

console.log(`[Supabase Client] Entorno: ${process.env.NODE_ENV}`)
console.log(`[Supabase Client] Usando tabla: ${tableName}`)

export const supabase = createClient<{ 
  historical_facts: HistoricalFact;
  historical_facts_test: HistoricalFact;
}>(supabaseUrl, supabaseAnonKey)

export async function getHistoricalFact(): Promise<HistoricalFact | null> {
  const today = new Date().toISOString().split('T')[0]
  
  console.log(`[getHistoricalFact] Buscando hecho para ${today} en tabla: ${tableName}`)
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('publish_date', today)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[getHistoricalFact] Error fetching historical fact:', error)
    return null
  }

  const fact = data && data.length > 0 ? data[0] : null
  console.log(`[getHistoricalFact] Encontrado:`, fact ? 'SÍ' : 'NO')
  return fact
}

export async function getHistoricalFacts(limit: number = 10): Promise<HistoricalFact[]> {
  console.log(`[getHistoricalFacts] Obteniendo últimos ${limit} hechos de tabla: ${tableName}`)
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('publish_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[getHistoricalFacts] Error fetching historical facts:', error)
    return []
  }

  console.log(`[getHistoricalFacts] Encontrados ${data.length} hechos`)
  return data || []
}
