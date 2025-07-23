#!/usr/bin/env node

// Script para ejecutar el generador en modo test
process.env.NODE_ENV = 'test'

console.log('🧪 Ejecutando generador de hechos históricos en modo TEST')
console.log('Los datos se guardarán en la tabla historical_facts_test')
console.log('')

// Importar y ejecutar el script principal
require('./generate-historical-fact.ts')
