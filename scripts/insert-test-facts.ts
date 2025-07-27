// Script para generar múltiples hechos históricos de test con fechas diferentes
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

const sampleFacts = [
  {
    historical_date: "1969-07-20",
    title: "Primera llegada del hombre a la Luna",
    description: "Neil Armstrong y Buzz Aldrin se convirtieron en los primeros seres humanos en caminar sobre la superficie lunar durante la misión Apollo 11.",
    category: "Espacio",
    sources: ["NASA", "https://www.nasa.gov", "Apollo 11 Mission", "https://history.nasa.gov"],
    publish_date: "2025-07-26"
  },
  {
    historical_date: "1789-07-14",
    title: "Toma de la Bastilla",
    description: "Los ciudadanos parisinos tomaron la fortaleza de la Bastilla, marcando el inicio simbólico de la Revolución Francesa.",
    category: "Historia",
    sources: ["Encyclopædia Britannica", "https://britannica.com", "Historia Universal", "https://history.com"],
    publish_date: "2025-07-25"
  },
  {
    historical_date: "1885-07-23",
    title: "Primer tratamiento contra la rabia",
    description: "Louis Pasteur administró con éxito la primera vacuna contra la rabia a Joseph Meister, un niño de 9 años.",
    category: "Ciencia",
    sources: ["Instituto Pasteur", "https://pasteur.fr", "Historia de la Medicina", "https://medicalhistory.org"],
    publish_date: "2025-07-24"
  },
  {
    historical_date: "1903-07-23",
    title: "Fundación de Ford Motor Company",
    description: "Henry Ford fundó la Ford Motor Company, revolucionando la industria automotriz con la producción en masa.",
    category: "Tecnología",
    sources: ["Ford Archives", "https://ford.com", "Historia Industrial", "https://industrialhistory.org"],
    publish_date: "2025-06-28"
  },
  {
    historical_date: "1969-06-28",
    title: "Disturbios de Stonewall",
    description: "Los disturbios de Stonewall en Nueva York marcaron el inicio del movimiento moderno de derechos LGBT.",
    category: "Historia",
    sources: ["Stonewall Inn", "https://stonewall-inn.com", "LGBT History", "https://lgbthistory.org"],
    publish_date: "2025-06-27"
  },
  {
    historical_date: "1945-06-26",
    title: "Firma de la Carta de las Naciones Unidas",
    description: "Se firmó la Carta de las Naciones Unidas en San Francisco, estableciendo oficialmente la ONU.",
    category: "Política",
    sources: ["United Nations", "https://un.org", "Historia Política", "https://politicalhistory.org"],
    publish_date: "2025-06-26"
  }
];

async function insertTestFacts() {
  console.log('Insertando hechos históricos de prueba...');
  
  for (const fact of sampleFacts) {
    try {
      const { error } = await supabaseAdmin
        .from('historical_facts_test')
        .insert(fact);
      
      if (error) {
        console.error(`Error insertando hecho para ${fact.publish_date}:`, error);
      } else {
        console.log(`✅ Insertado: ${fact.title} (${fact.publish_date})`);
      }
    } catch (err) {
      console.error(`Error general:`, err);
    }
  }
  
  console.log('✅ Proceso completado');
}

insertTestFacts();
