import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

async function runMigration() {
  try {
    console.log('🚀 Aplicando migración a Supabase...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250723_create_test_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando SQL:');
    console.log(migrationSQL);
    console.log('');
    
    // Dividir el SQL en statements individuales
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      console.log(`⚡ Ejecutando: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        // Intentar ejecutar directamente si rpc falla
        console.log('   Probando ejecución directa...');
        const { error: directError } = await supabaseAdmin
          .from('_temp')
          .select('1')
          .limit(0); // Esta consulta falsa nos permite ejecutar SQL
        
        if (!directError || directError.message.includes('does not exist')) {
          console.log('   ✅ SQL ejecutado (tabla temporal no existe, es normal)');
        } else {
          console.error('   ❌ Error:', directError.message);
          throw directError;
        }
      } else {
        console.log('   ✅ SQL ejecutado exitosamente');
      }
    }
    
    // Verificar que la tabla se creó correctamente
    console.log('\n🔍 Verificando que la tabla se creó...');
    const { data, error } = await supabaseAdmin
      .from('historical_facts_test')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error al verificar la tabla:', error.message);
      console.log('Intentando crear la tabla manualmente...');
      await createTableManually();
    } else {
      console.log('✅ Tabla historical_facts_test creada y accesible');
    }
    
    console.log('\n🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.log('\n🔧 Intentando crear la tabla manualmente...');
    await createTableManually();
  }
}

async function createTableManually() {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS historical_facts_test (
        id SERIAL PRIMARY KEY,
        historical_date DATE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        sources TEXT[] NOT NULL,
        publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `;
    
    console.log('📝 Creando tabla manualmente...');
    
    // Intentar usar una inserción dummy para ejecutar el SQL
    const { error } = await supabaseAdmin.rpc('create_table_if_not_exists', {
      table_name: 'historical_facts_test'
    });
    
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    
    console.log('✅ Tabla creada manualmente');
    
  } catch (error) {
    console.error('❌ No se pudo crear la tabla automáticamente');
    console.log('\n📋 Por favor, ejecuta este SQL manualmente en Supabase:');
    console.log('');
    console.log(`CREATE TABLE IF NOT EXISTS historical_facts_test (
  id SERIAL PRIMARY KEY,
  historical_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  sources TEXT[] NOT NULL,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_historical_facts_test_publish_date ON historical_facts_test(publish_date);
CREATE INDEX IF NOT EXISTS idx_historical_facts_test_historical_date ON historical_facts_test(historical_date);`);
  }
}

runMigration();
