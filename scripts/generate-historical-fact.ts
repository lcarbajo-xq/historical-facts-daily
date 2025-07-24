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

// Determinar si estamos en modo test
const isTestMode = process.env.NODE_ENV === 'test' || process.argv.includes('--test');

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

// Nombre de la tabla según el modo
const tableName = isTestMode ? 'historical_facts_test' : 'historical_facts';

console.log(`Modo: ${isTestMode ? 'TEST' : 'PRODUCCIÓN'}`);
console.log(`Usando tabla: ${tableName}`);

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

  // Lista de modelos para probar en orden de preferencia
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  const maxRetries = 3;
  const baseDelay = 10000; // 10 segundos base
  
  for (const modelName of models) {
    console.log(`Intentando con modelo: ${modelName}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Intento ${attempt}/${maxRetries} con ${modelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        });
        
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

        console.log(`Hecho histórico generado: ${text.substring(0, 100)}...`);
        
        // Si llegamos aquí, el modelo funcionó, procesamos la respuesta
        return await processResponse(text);
        
      } catch (error: any) {
        console.error(`Error con ${modelName} en intento ${attempt}:`, error.message);
        
        // Detectar diferentes tipos de errores
        const errorMsg = error.message.toLowerCase();
        const isQuotaError = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('too many requests');
        const isServerError = errorMsg.includes('503') || errorMsg.includes('502') || errorMsg.includes('500') || errorMsg.includes('overloaded');
        const isNotFoundError = errorMsg.includes('404') || errorMsg.includes('not found');
        
        if (isQuotaError) {
          console.log('Error de cuota detectado - esperando más tiempo...');
          const waitTime = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff: 10s, 20s, 40s
          console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else if (isServerError) {
          console.log('Error de servidor detectado - reintentando...');
          const waitTime = baseDelay + (attempt * 5000); // 10s, 15s, 20s
          console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else if (isNotFoundError) {
          console.log('Modelo no encontrado - probando siguiente modelo...');
          break; // Saltar al siguiente modelo inmediatamente
        }
        
        // Para otros errores, esperar un poco antes del siguiente intento
        if (attempt < maxRetries) {
          const waitTime = 5000 * attempt; // 5s, 10s, 15s
          console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // Esperar entre modelos para evitar sobrecargar
    console.log('Esperando 15 segundos antes de probar el siguiente modelo...');
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  
  // Si llegamos aquí, todos los modelos fallaron
  throw new Error('Todos los modelos de IA están temporalmente no disponibles');
}

async function processResponse(text: string) {
  console.log('Procesando respuesta del modelo...');
  
  try {
    // Limpiar el texto de marcadores markdown y caracteres problemáticos
    let cleanText = text
      .replace(/```json\n?|\n?```/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u00A0]/g, ' ') // Non-breaking spaces
      .trim();
    
    // Buscar el objeto JSON en el texto
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No se encontró un objeto JSON válido en la respuesta');
    }
    
    cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
    
    // Múltiples intentos de parsing con diferentes estrategias
    const parseStrategies = [
      // Intento 1: Texto tal como viene
      () => JSON.parse(cleanText),
      
      // Intento 2: Reemplazar comillas simples por dobles
      () => {
        const quotesFixed = cleanText.replace(/'/g, '"');
        return JSON.parse(quotesFixed);
      },
      
      // Intento 3: Escapar caracteres de nueva línea
      () => {
        const escaped = cleanText.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        return JSON.parse(escaped);
      },
      
      // Intento 4: Limpiar caracteres de control
      () => {
        const controlCharsRemoved = cleanText.replace(/[\x00-\x1F\x7F]/g, ' ');
        return JSON.parse(controlCharsRemoved);
      },
      
      // Intento 5: Reconstruir el JSON con regex
      () => {
        const rebuilt = cleanText
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Añadir comillas a las claves
          .replace(/:\s*([^",\[\]{}]+)(?=[,}])/g, ': "$1"') // Añadir comillas a valores simples
          .replace(/: "(\d+)"(?=[,}])/g, ': $1') // Quitar comillas de números
          .replace(/: "(true|false|null)"(?=[,}])/g, ': $1'); // Quitar comillas de booleanos/null
        return JSON.parse(rebuilt);
      }
    ];
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < parseStrategies.length; i++) {
      try {
        console.log(`Intento de parsing ${i + 1}/${parseStrategies.length}`);
        const data = parseStrategies[i]();
        
        // Validar que el objeto tiene las propiedades requeridas
        if (!data.historical_date || !data.title || !data.description) {
          throw new Error('El objeto JSON no tiene las propiedades requeridas');
        }
        
        console.log('JSON parseado exitosamente');
        return {
          ...data,
          publish_date: new Date().toISOString().split('T')[0]
        };
      } catch (parseError: any) {
        lastError = parseError;
        console.log(`Estrategia ${i + 1} falló: ${parseError.message}`);
      }
    }
    
    throw lastError || new Error('Todos los intentos de parsing fallaron');
    
  } catch (e: any) {
    console.error('Error al analizar la respuesta JSON:', text.substring(0, 500));
    console.error('Error detallado:', e.message);
    throw new Error(`Respuesta JSON inválida del modelo: ${e.message}`);
  }
}

async function insertHistoricalFact(fact: HistoricalFact) {
  const { error } = await supabaseAdmin
    .from(tableName)
    .insert(fact);

  if (error) {
    throw new Error(`Error inserting fact: ${error.message}`);
  }
}

async function createTestTable() {
  if (!isTestMode) return;
  
  console.log('Creando tabla de test si no existe...');
  
  // Crear la tabla de test con la misma estructura que la de producción
  const { error } = await supabaseAdmin.rpc('create_test_table');
  
  if (error && !error.message.includes('already exists')) {
    console.warn('No se pudo crear la tabla de test automáticamente:', error.message);
    console.log('Asegúrate de que la tabla historical_facts_test existe en Supabase');
  }
}

async function generateHistoricalFactFallback(date: string) {
  console.log('🔄 Intentando con datos de fallback...');
  
  // Datos de fallback para emergencias
  const fallbackFacts = [
    {
      historical_date: "1969-07-20",
      title: "Primera llegada del hombre a la Luna",
      description: "El 20 de julio de 1969, Neil Armstrong y Buzz Aldrin se convirtieron en los primeros seres humanos en caminar sobre la superficie lunar durante la misión Apollo 11. Este hito histórico marcó el culminante de la carrera espacial y demostró las capacidades tecnológicas de la humanidad para explorar más allá de nuestro planeta.",
      category: "Espacio",
      sources: ["NASA", "https://www.nasa.gov", "Apollo 11 Mission Report", "https://history.nasa.gov"]
    },
    {
      historical_date: "1945-08-15",
      title: "Fin de la Segunda Guerra Mundial",
      description: "El 15 de agosto de 1945, Japón anunció su rendición incondicional, marcando el fin oficial de la Segunda Guerra Mundial. Este acontecimiento puso fin al conflicto más devastador de la historia humana y dio inicio a una nueva era geopolítica mundial.",
      category: "Historia",
      sources: ["National Archives", "https://www.archives.gov", "World War II Database", "https://ww2db.com"]
    }
  ];
  
  // Seleccionar un hecho aleatorio
  const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
  
  return {
    ...randomFact,
    publish_date: date
  };
}

async function main() {
  const maxMainRetries = 2;
  let mainAttempt = 0;
  
  while (mainAttempt < maxMainRetries) {
    try {
      mainAttempt++;
      console.log(`🚀 Intento principal ${mainAttempt}/${maxMainRetries}`);
      
      const today = new Date().toISOString().split('T')[0];
      console.log(`Generando hecho histórico para: ${today}`);
      
      // Crear tabla de test si es necesario
      await createTestTable();
      
      let fact;
      
      try {
        fact = await generateHistoricalFact(today);
        console.log('Hecho histórico generado:', fact.title);
      } catch (aiError: any) {
        console.error('❌ Error con IA:', aiError.message);
        
        if (mainAttempt === maxMainRetries) {
          console.log('🔄 Usando datos de fallback por fallo total de IA...');
          fact = await generateHistoricalFactFallback(today);
          console.log('✅ Usando hecho histórico de fallback:', fact.title);
        } else {
          console.log(`⏱️ Esperando 30 segundos antes del siguiente intento principal...`);
          await new Promise(resolve => setTimeout(resolve, 30000));
          continue;
        }
      }
      
      await insertHistoricalFact(fact);
      console.log(`✅ Hecho histórico insertado exitosamente en la tabla ${tableName}`);
      
      if (isTestMode) {
        console.log('🧪 Ejecución en modo TEST completada');
      } else {
        console.log('🚀 Ejecución en modo PRODUCCIÓN completada');
      }
      
      // Si llegamos aquí, todo salió bien
      return;
      
    } catch (error: any) {
      console.error(`❌ Error en intento principal ${mainAttempt}:`, error.message);
      
      if (mainAttempt === maxMainRetries) {
        console.error('💥 Todos los intentos principales fallaron');
        throw error;
      }
      
      console.log(`⏱️ Esperando 60 segundos antes del siguiente intento principal...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}

main()
.then(() => {
  console.log('🎉 Script completado exitosamente');
  process.exit(0);
})
.catch((error: any) => {
  console.error('💥 Error crítico:', error.message);
  console.error('📚 Stack trace:', error.stack);
  process.exit(1);
});
