import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createTestTable() {
  try {
    console.log('🚀 Creando tabla de test usando inserción dummy...');
    
    // Intentar insertar un registro dummy para crear la tabla implícitamente
    const dummyFact = {
      historical_date: '2024-01-01',
      title: 'Test Record - Delete Me',
      description: 'This is a test record to create the table structure. Please delete.',
      category: 'Test',
      sources: ['Test Source'],
      publish_date: '2024-01-01'
    };
    
    const { data, error } = await supabaseAdmin
      .from('historical_facts_test')
      .insert(dummyFact)
      .select();
    
    if (error) {
      console.log('❌ La tabla no existe. Vamos a crearla copiando la estructura de historical_facts...');
      
      // Obtener la estructura de la tabla original
      const { data: originalData, error: originalError } = await supabaseAdmin
        .from('historical_facts')
        .select('*')
        .limit(1);
      
      if (originalError) {
        throw new Error(`No se pudo acceder a la tabla original: ${originalError.message}`);
      }
      
      console.log('✅ Tabla original accesible');
      console.log('\n📋 Por favor, ve a Supabase Dashboard > SQL Editor y ejecuta:');
      console.log('\nCRETE TABLE historical_facts_test (LIKE historical_facts INCLUDING ALL);');
      console.log('\nO usa este SQL completo:');
      console.log(`
CREATE TABLE historical_facts_test (
  id SERIAL PRIMARY KEY,
  historical_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  sources TEXT[] NOT NULL,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices
CREATE INDEX idx_historical_facts_test_publish_date ON historical_facts_test(publish_date);
CREATE INDEX idx_historical_facts_test_historical_date ON historical_facts_test(historical_date);

-- Habilitar Row Level Security (RLS)
ALTER TABLE historical_facts_test ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura pública
CREATE POLICY "Allow public read access on historical_facts_test" ON historical_facts_test
FOR SELECT USING (true);

-- Crear política para permitir inserción con service key
CREATE POLICY "Allow service role insert on historical_facts_test" ON historical_facts_test
FOR INSERT WITH CHECK (auth.role() = 'service_role');
      `);
      
    } else {
      console.log('✅ ¡Tabla creada exitosamente!');
      console.log('📄 Registro de prueba insertado:', data);
      
      // Eliminar el registro dummy
      if (data && data[0]) {
        const { error: deleteError } = await supabaseAdmin
          .from('historical_facts_test')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.log('⚠️  No se pudo eliminar el registro de prueba:', deleteError.message);
        } else {
          console.log('🗑️  Registro de prueba eliminado');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestTable();
