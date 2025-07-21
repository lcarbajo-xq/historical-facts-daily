'use client'

import { type HistoricalFact } from '@/lib/supabase/types'

interface HistoricalFactCardProps {
  fact: HistoricalFact
}

export function HistoricalFactCard({ fact }: HistoricalFactCardProps) {
  return (
    <div className='w-full max-w-5xl flex flex-col gap-8'>
      <div className='flex flex-col gap-4'>
        <h1 className='text-4xl font-bold text-emerald-400'>
          Hoy en la historia: {fact.title}
        </h1>
        <p className='text-emerald-300'>
          {new Date(fact.historical_date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div className='flex flex-col gap-6'>
        <p className='text-emerald-100 text-lg leading-relaxed'>
          {fact.description}
        </p>

        {fact.sources && fact.sources.length > 0 && (
          <div className='flex flex-col gap-2'>
            <h2 className='text-emerald-300 text-sm'>Fuentes:</h2>
            <ul className='list-disc list-inside text-emerald-400 text-sm'>
              {fact.sources.map((source, index) => (
                <li key={index}>
                  {source.startsWith('http') ? (
                    <a
                      href={source}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:text-emerald-200 transition-colors'>
                      {source}
                    </a>
                  ) : (
                    source
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='inline-flex items-center gap-2'>
          <span className='text-emerald-400 text-sm'>Categoría:</span>
          <span className='px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-300 text-xs'>
            {fact.category}
          </span>
        </div>
      </div>
    </div>
  )
}
