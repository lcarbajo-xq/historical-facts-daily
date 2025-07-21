'use client'

import Link from 'next/link'
import { useIsMobile } from '@/hooks/use-mobile'

export function Footer() {
  const isMobile = useIsMobile()
  const isMac =
    typeof window !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac')
  const closeCommand = isMac ? '⌘ + W' : 'Ctrl + W'

  return (
    <footer className='border-t border-emerald-900/30 bg-black relative z-10'>
      <div className='max-w-5xl mx-auto px-6 py-8'>
        <div className='flex flex-col gap-6 font-mono items-center'>
          <p className='text-emerald-400 text-sm tracking-wider font-medium w-full text-center'>
            © 2024 HISTORIA_DIARIA.EXE - EXPLORANDO_EL_PASADO_DIGITALMENTE -
            Desarrollado por{' '}
            <Link
              href='https://www.louie-dev.com'
              target='_blank'
              rel='noreferrer'
              className='text-emerald-300 hover:text-emerald-200 transition-colors'>
              {'>'}louie-dev
            </Link>
          </p>
          <div className='w-full text-center'>
            <p className='text-emerald-300 text-sm mb-2'>
              {'>'} INFORMACIÓN_IMPORTANTE:
            </p>
            <p className='text-emerald-400 text-xs leading-relaxed'>
              Esta es una web didáctica sin fines comerciales.
              <br />
              El contenido es de libre uso y distribución.
            </p>
          </div>
          {!isMobile && (
            <div className='w-full text-center text-emerald-500 text-xs flex items-center justify-center gap-2'>
              <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
              <p>
                {'>'} Para cerrar esta ventana:{' '}
                <span className='text-emerald-300'>{closeCommand}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
