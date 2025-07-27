'use client'

import { Calendar, Share2, Terminal, Zap, Archive, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HistoricalSidebar } from '@/components/ui/historical-sidebar'
import { type HistoricalFact } from '@/lib/supabase/types'
import { useHistoricalFact } from '@/hooks/use-historical-fact'
import { useSidebar } from '@/hooks/use-sidebar'

interface Props {
  fact: HistoricalFact
  recentFacts: HistoricalFact[]
}

export function HistoricalFactView({ fact, recentFacts }: Props) {
  const { displayText, isTyping, currentDate, shareContent } =
    useHistoricalFact(fact)
  const sidebar = useSidebar()

  return (
    <div className='min-h-screen bg-black text-emerald-100 relative overflow-hidden w-full'>
      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebar.isOpen ? 'lg:mr-80' : ''
        }`}>
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-pulse'></div>
          <div
            className='absolute inset-0 opacity-10'
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(16, 185, 129, 0.03) 2px,
                rgba(16, 185, 129, 0.03) 4px
              )`
            }}></div>
        </div>

        <header className='border-b border-emerald-900/30 bg-black/90 backdrop-blur-sm relative z-10'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 sm:gap-4 min-w-0 flex-1'>
                <div className='w-10 h-10 sm:w-12 sm:h-12 border-2 border-emerald-600/50 bg-emerald-900/20 flex items-center justify-center font-mono text-emerald-400 flex-shrink-0'>
                  <Terminal className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h1 className='text-lg sm:text-2xl font-mono font-bold text-emerald-300 tracking-wider truncate'>
                    HISTORIA_DIARIA.EXE
                  </h1>
                  <p className='text-xs sm:text-sm text-emerald-600 font-mono hidden sm:block'>
                    {'> Cargando archivos históricos...'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 sm:gap-4 flex-shrink-0'>
                {/* Date - hidden on mobile */}
                <div className='hidden md:flex items-center gap-3 text-sm text-emerald-500 font-mono bg-emerald-900/10 border border-emerald-800/30 px-3 py-2'>
                  <Calendar className='w-4 h-4' />
                  <span className='capitalize'>{currentDate}</span>
                </div>
                <Button
                  onClick={sidebar.toggle}
                  className='bg-emerald-900/30 text-emerald-200 border-2 border-emerald-700/50 hover:bg-emerald-800/30 hover:border-emerald-600/70 font-mono tracking-wider px-3 sm:px-4 text-xs sm:text-sm min-w-[44px] sm:min-w-auto'>
                  <Archive className='w-4 h-4 sm:mr-2' />
                  <span className='hidden sm:inline'>
                    {sidebar.isOpen ? 'CERRAR' : 'ARCHIVO'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className='max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10'>
          <div className='mb-8 sm:mb-12'>
            <div className='bg-emerald-900/10 border border-emerald-800/30 p-3 sm:p-4 font-mono text-xs sm:text-sm text-emerald-400 mb-6 sm:mb-8'>
              <div className='flex items-center gap-2 mb-2'>
                <Zap className='w-3 h-3 sm:w-4 sm:h-4 text-emerald-500' />
                <span>SISTEMA INICIADO</span>
                <div className='ml-auto flex gap-1'>
                  <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse'></div>
                  <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-600/50 rounded-full'></div>
                  <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-700/30 rounded-full'></div>
                </div>
              </div>
              <div className='text-emerald-600 text-xs sm:text-sm'>
                {'> Accediendo a base de datos histórica...'}
              </div>
              <div className='text-emerald-600 text-xs sm:text-sm'>
                {'> Dato del día cargado exitosamente'}
              </div>
            </div>

            <div className='text-center'>
              <h2 className='text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-emerald-200 mb-4 tracking-wide'>
                ARCHIVO HISTÓRICO
              </h2>
              <div className='w-24 sm:w-32 h-px bg-emerald-600/50 mx-auto mb-4'></div>
              <p className='text-emerald-500 font-mono text-xs sm:text-sm tracking-wider'>
                REGISTRO DIARIO DE EVENTOS SIGNIFICATIVOS
              </p>
            </div>
          </div>

          <Card className='bg-black/80 border-2 border-emerald-800/40 shadow-2xl shadow-emerald-900/20'>
            <CardContent className='p-4 sm:p-6 md:p-8 lg:p-12'>
              <div className='mb-6 sm:mb-8'>
                <div className='flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
                  <span className='text-xs font-mono font-bold text-emerald-300 bg-emerald-900/20 border border-emerald-700/30 px-2 sm:px-3 py-1 sm:py-2 tracking-wider'>
                    [{fact.category.toUpperCase()}]
                  </span>
                  <span className='text-xs font-mono text-emerald-600 bg-black/50 border border-emerald-800/20 px-2 sm:px-3 py-1 sm:py-2'>
                    FECHA:{' '}
                    {new Date(fact.historical_date).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }
                    )}
                  </span>
                </div>

                <div className='mb-4 sm:mb-6'>
                  <p className='text-xs sm:text-sm font-mono text-emerald-500 mb-2 tracking-wide'>
                    {'> FECHA_REGISTRO:'}{' '}
                    {new Date(fact.publish_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className='border-l-2 border-emerald-600/30 pl-3 sm:pl-4'>
                    <h3 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono font-bold text-emerald-100 mb-4 leading-tight tracking-wide'>
                      {displayText}
                      {isTyping && (
                        <span className='animate-pulse text-emerald-400'>
                          |
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              </div>

              <div className='bg-emerald-950/30 border border-emerald-800/20 p-6 mb-8 font-mono'>
                <div className='text-xs text-emerald-600 mb-3 tracking-wider'>
                  {'> DESCRIPCIÓN_DETALLADA:'}
                </div>
                <p className='text-emerald-200 leading-relaxed'>
                  {fact.description}
                </p>
              </div>

              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-emerald-800/20'>
                <div className='flex items-center gap-3 font-mono text-sm'>
                  <div className='w-3 h-3 bg-emerald-500 animate-pulse'></div>
                  <span className='text-emerald-400 tracking-wide'>
                    VERIFICADO_POR_ARCHIVOS_HISTÓRICOS
                  </span>
                </div>
                <Button
                  onClick={shareContent}
                  className='bg-emerald-900/30 text-emerald-200 border-2 border-emerald-700/50 hover:bg-emerald-800/30 hover:border-emerald-600/70 font-mono tracking-wider px-6'>
                  <Share2 className='w-4 h-4 mr-2' />
                  COMPARTIR_DATO
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
            <div className='bg-black/60 border border-emerald-800/30 p-6 text-center font-mono'>
              <div className='text-2xl font-bold text-emerald-300 mb-2 tracking-wider'>
                365
              </div>
              <div className='text-emerald-600 text-xs tracking-wider'>
                REGISTROS_ÚNICOS
              </div>
            </div>
            <div className='bg-black/60 border border-emerald-800/30 p-6 text-center font-mono'>
              <div className='text-2xl font-bold text-emerald-300 mb-2 tracking-wider'>
                5000+
              </div>
              <div className='text-emerald-600 text-xs tracking-wider'>
                AÑOS_DE_HISTORIA
              </div>
            </div>
            <div className='bg-black/60 border border-emerald-800/30 p-6 text-center font-mono'>
              <div className='text-2xl font-bold text-emerald-300 mb-2 tracking-wider'>
                ∞
              </div>
              <div className='text-emerald-600 text-xs tracking-wider'>
                CONOCIMIENTO_DISPONIBLE
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay - funciona en todas las pantallas */}
      {sidebar.isOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[45]'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            sidebar.close()
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            e.stopPropagation()
            sidebar.close()
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 w-full sm:w-96 lg:w-80 ${
          sidebar.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}>
        <HistoricalSidebar
          facts={recentFacts}
          isOpen={sidebar.isOpen}
          close={sidebar.close}
          toggle={sidebar.toggle}
        />
      </div>
    </div>
  )
}
