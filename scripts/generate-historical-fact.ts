import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { type HistoricalFact } from '../lib/supabase/types';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Verificar que tenemos la API key de Google
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Cliente para escritura (usa service role key)
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

async function generateHistoricalFact(date: string) {
  const [month, day] = date.split('-').slice(1);
  const prompt = `Genera un hecho histórico importante que ocurrió un ${day} de ${month} en la historia (en cualquier año anterior a 2024).
  IMPORTANTE: Responde SOLO con un objeto JSON válido que siga exactamente esta estructura, usando ÚNICAMENTE comillas dobles (") y asegurándote que el JSON sea válido:
  {
    "historical_date": "YYYY-MM-DD",
    "title": "Título corto y conciso",
    "description": "Descripción detallada del hecho histórico con datos relevantes y curiosos",
    "category": "Una de las siguientes categorías: Ciencia, Arte, Política, Deportes, Tecnología, Espacio, Historia",
    "sources": ["Fuente 1", "URL1", "Fuente 2", "URL2"]
  }
  
  Asegúrate de que:
  1. Todas las cadenas usen comillas dobles (")
  2. No haya caracteres de escape innecesarios
  3. No incluyas texto fuera del objeto JSON
  4. Las URLs sean válidas y accesibles`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Eres un historiador experto que proporciona información precisa y verificada sobre hechos históricos. Tus respuestas deben ser en español." }]
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Como historiador experto, proporcionaré información precisa y verificada sobre hechos históricos en español." }]
      }
    ]
  });

  const result = await chat.sendMessage(prompt);
  const text = result.response.text();
  
  if (!text) {
    throw new Error('No se recibió respuesta del modelo');
  }

  try {
    // Limpiar el texto de marcadores markdown y asegurar comillas dobles
    const cleanText = text
      .replace(/```json\n|\n```/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .trim();
    
    // Intentar reparar las comillas simples por dobles si es necesario
    const jsonText = cleanText.includes('"') ? cleanText : cleanText.replace(/'/g, '"');
    
    try {
      const data = JSON.parse(jsonText);
      return {
        ...data,
        publish_date: new Date().toISOString().split('T')[0]
      };
    } catch (innerError) {
      console.error('Error en el primer intento de parsing:', innerError);
      console.error('JSON text:', jsonText);
      // Segundo intento: escapar caracteres especiales
      const escapedText = jsonText.replace(/\n/g, '\\n');
      const data = JSON.parse(escapedText);
      return {
        ...data,
        publish_date: new Date().toISOString().split('T')[0]
      };
    }
  } catch (e) {
    console.error('Error al analizar la respuesta JSON:', text);
    console.error('Error detallado:', e);
    throw new Error('Respuesta JSON inválida del modelo');
  }
}

async function insertHistoricalFact(fact: HistoricalFact) {
  const { error } = await supabaseAdmin
    .from('historical_facts')
    .insert(fact);

  if (error) {
    throw new Error(`Error inserting fact: ${error.message}`);
  }
}

async function main() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [year, month, day] = today.split('-');
    
    const fact = await generateHistoricalFact(today);
    await insertHistoricalFact(fact);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main()
