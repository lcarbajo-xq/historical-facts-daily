import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkTestData() {
  try {
    console.log('🔍 Consultando datos de la tabla de test...\n');
    
    const { data, error } = await supabase
      .from('historical_facts_test')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Error al consultar:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('📭 No hay datos en la tabla de test');
      return;
    }
    
    console.log(`📊 Encontrados ${data.length} registros en historical_facts_test:\n`);
    
    data.forEach((fact, index) => {
      console.log(`${index + 1}. 📅 ${fact.historical_date}`);
      console.log(`   📰 ${fact.title}`);
      console.log(`   🏷️  ${fact.category}`);
      console.log(`   📝 ${fact.description.substring(0, 100)}...`);
      console.log(`   📚 Fuentes: ${fact.sources.length} fuente(s)`);
      console.log(`   🚀 Publicado: ${fact.publish_date}`);
      console.log(`   ⏰ Creado: ${fact.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTestData();
