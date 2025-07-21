import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rgqixxeaghfldruucogj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  throw new Error('Missing Supabase anon key')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const today = new Date().toISOString().split('T')[0]
  console.log('Fecha actual:', today)
  
  // Obtener todos los registros para verificar
  const { data: allData, error: allError } = await supabase
    .from('historical_facts')
    .select('*')
    .order('publish_date', { ascending: true })

  if (allError) {
    console.error('Error al obtener todos los registros:', allError.message)
    return
  }

  console.log('Total de registros:', allData?.length || 0)
  console.log('Registros encontrados:', allData)

  // Buscar específicamente el registro de hoy
  const { data: todayData, error: todayError } = await supabase
    .from('historical_facts')
    .select('*')
    .eq('publish_date', today)

  if (todayError) {
    console.error('Error al buscar el registro de hoy:', todayError.message)
    return
  }

  console.log('Datos para hoy:', todayData)
}

main()
