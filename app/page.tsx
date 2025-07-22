import { getHistoricalFact } from '@/lib/supabase/client'
import { HistoricalFactView } from '@/components/ui/historical-fact-view'

// Revalidar la página cada minuto
export const revalidate = 60

export default async function Page() {
  // Forzar revalidación de la caché
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }

  const fact = await getHistoricalFact()

  if (!fact) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center p-24 bg-black'>
        <div className='text-emerald-400 font-mono text-center'>
          <div className='w-3 h-3 bg-emerald-500 rounded-full animate-pulse mb-4 mx-auto'></div>
          <p>No hay hechos históricos disponibles para hoy.</p>
          <p className='text-emerald-600 text-sm mt-2'>
            {'">'} Por favor, inténtalo de nuevo más tarde.
          </p>
        </div>
      </main>
    )
  }

  return <HistoricalFactView fact={fact} />
}
