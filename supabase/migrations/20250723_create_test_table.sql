-- Crear tabla de test con la misma estructura que historical_facts
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

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_historical_facts_test_publish_date ON historical_facts_test(publish_date);
CREATE INDEX IF NOT EXISTS idx_historical_facts_test_historical_date ON historical_facts_test(historical_date);

-- Función para crear la tabla de test (para usar desde el script)
CREATE OR REPLACE FUNCTION create_test_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- La tabla ya se crea arriba, esta función es para compatibilidad
  RAISE NOTICE 'Tabla historical_facts_test verificada/creada';
END;
$$;
