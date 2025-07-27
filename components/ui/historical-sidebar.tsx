'use client'

import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Folder,
  X
} from 'lucide-react'
import { type HistoricalFact } from '@/lib/supabase/types'
import { Card, CardContent } from './card'
import { useState } from 'react'

interface Props {
  facts: HistoricalFact[]
  isOpen: boolean
  close: () => void
  toggle: () => void
}

interface GroupedFacts {
  year: number
  months: {
    month: number
    monthName: string
    facts: HistoricalFact[]
  }[]
}

export function HistoricalSidebar({ facts, isOpen, close, toggle }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatHistoricalDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMonthName = (month: number) => {
    const monthNames = [
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC'
    ]
    return monthNames[month - 1]
  }

  const groupFactsByDate = (facts: HistoricalFact[]): GroupedFacts[] => {
    const grouped = facts.reduce((acc, fact) => {
      const date = new Date(fact.publish_date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      if (!acc[year]) {
        acc[year] = {}
      }
      if (!acc[year][month]) {
        acc[year][month] = []
      }
      acc[year][month].push(fact)
      return acc
    }, {} as Record<number, Record<number, HistoricalFact[]>>)

    return Object.entries(grouped)
      .map(([year, months]) => ({
        year: parseInt(year),
        months: Object.entries(months)
          .map(([month, facts]) => ({
            month: parseInt(month),
            monthName: getMonthName(parseInt(month)),
            facts: facts.sort(
              (a, b) =>
                new Date(b.publish_date).getTime() -
                new Date(a.publish_date).getTime()
            )
          }))
          .sort((a, b) => b.month - a.month)
      }))
      .sort((a, b) => b.year - a.year)
  }

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  if (facts.length === 0) {
    return (
      <div className='w-full bg-black/90 border-l border-emerald-800/30 p-4 sm:p-6 font-mono'>
        <div className='mb-4'>
          <div className='flex items-center justify-between gap-2 text-emerald-400 mb-2'>
            <div className='flex items-center gap-2'>
              <Database className='w-4 h-4' />
              <span className='text-sm font-bold tracking-wider'>
                ARCHIVO_HISTÓRICO
              </span>
            </div>
            <button
              onClick={close}
              className='p-1 hover:bg-emerald-800/30 rounded transition-colors'
              aria-label='Cerrar archivo'>
              <X className='w-4 h-4' />
            </button>
          </div>
          <div className='w-full h-px bg-emerald-600/30'></div>
        </div>

        <div className='text-center text-emerald-600 text-sm'>
          <Clock className='w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50' />
          <p>{'> Sin registros previos'}</p>
          <p className='text-xs mt-1'>{'> Cargando archivos...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full bg-black/90 border-l border-emerald-800/30 p-4 sm:p-6 font-mono overflow-y-auto max-h-screen'>
      {/* Header */}
      <div className='mb-4 sm:mb-6'>
        <div className='flex items-center justify-between gap-2 text-emerald-400 mb-2'>
          <div className='flex items-center gap-2'>
            <Database className='w-4 h-4' />
            <span className='text-sm font-bold tracking-wider'>
              ARCHIVO_HISTÓRICO
            </span>
          </div>
          <button
            onClick={close}
            className='p-1 hover:bg-emerald-800/30 rounded transition-colors'
            aria-label='Cerrar archivo'>
            <X className='w-4 h-4' />
          </button>
        </div>
        <div className='w-full h-px bg-emerald-600/30 mb-2'></div>
        <p className='text-xs text-emerald-600 tracking-wide'>
          {'> Registros anteriores disponibles'}
        </p>
      </div>

      {/* Terminal status */}
      <div className='bg-emerald-900/10 border border-emerald-800/30 p-2 sm:p-3 mb-4 sm:mb-6 text-xs'>
        <div className='flex items-center gap-2 mb-1'>
          <div className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse'></div>
          <span className='text-emerald-400'>SISTEMA ACTIVO</span>
        </div>
        <div className='text-emerald-600'>
          {'> '}
          {facts.length} registros encontrados
        </div>
      </div>

      {/* Facts list grouped by year and month */}
      <div className='space-y-3'>
        {groupFactsByDate(facts).map((yearGroup) => (
          <div key={yearGroup.year} className='space-y-2'>
            {/* Year header */}
            <div className='flex items-center gap-2 text-emerald-300 border-b border-emerald-800/20 pb-2'>
              <Folder className='w-4 h-4' />
              <span className='text-sm font-bold tracking-wider'>
                AÑO_{yearGroup.year}
              </span>
              <div className='flex-1 h-px bg-emerald-800/30'></div>
              <span className='text-xs text-emerald-600'>
                {yearGroup.months.reduce(
                  (total, month) => total + month.facts.length,
                  0
                )}{' '}
                REG
              </span>
            </div>

            {/* Months */}
            {yearGroup.months.map((monthGroup) => {
              const monthGroupId = `${yearGroup.year}-${monthGroup.month}`
              const isExpanded = expandedGroups.has(monthGroupId)

              return (
                <div key={monthGroupId} className='space-y-2'>
                  {/* Month header */}
                  <button
                    onClick={() => toggleGroup(monthGroupId)}
                    className='w-full flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors p-2 rounded border border-emerald-800/20 hover:border-emerald-700/40 bg-emerald-900/10'>
                    {isExpanded ? (
                      <ChevronDown className='w-3 h-3' />
                    ) : (
                      <ChevronRight className='w-3 h-3' />
                    )}
                    <span className='text-xs font-bold tracking-wider'>
                      {monthGroup.monthName}
                    </span>
                    <div className='flex-1 h-px bg-emerald-800/20'></div>
                    <span className='text-xs text-emerald-600'>
                      {monthGroup.facts.length}
                    </span>
                  </button>

                  {/* Month facts */}
                  {isExpanded && (
                    <div className='space-y-2 ml-4 border-l border-emerald-800/20 pl-3'>
                      {monthGroup.facts.map((fact, index) => (
                        <Card
                          key={fact.id}
                          className='bg-black/40 border border-emerald-800/15 hover:border-emerald-700/30 transition-colors cursor-pointer group'>
                          <CardContent className='p-3'>
                            {/* Date header */}
                            <div className='flex items-center justify-between mb-2'>
                              <div className='flex items-center gap-2 text-xs'>
                                <Calendar className='w-3 h-3 text-emerald-500' />
                                <span className='text-emerald-400 font-bold'>
                                  {formatDate(fact.publish_date)}
                                </span>
                              </div>
                              <ChevronRight className='w-3 h-3 text-emerald-600 group-hover:text-emerald-400 transition-colors' />
                            </div>

                            {/* Category */}
                            <div className='mb-2'>
                              <span className='text-xs bg-emerald-900/20 border border-emerald-700/30 px-2 py-1 text-emerald-300 tracking-wider'>
                                [{fact.category.toUpperCase()}]
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className='text-sm text-emerald-100 font-medium leading-tight mb-2 line-clamp-2'>
                              {fact.title}
                            </h3>

                            {/* Historical date */}
                            <div className='text-xs text-emerald-600'>
                              {'> FECHA_HISTÓRICA: '}
                              <span className='text-emerald-500'>
                                {formatHistoricalDate(fact.historical_date)}
                              </span>
                            </div>

                            {/* Description preview */}
                            <p className='text-xs text-emerald-300/80 mt-2 line-clamp-2 leading-relaxed'>
                              {fact.description.substring(0, 80)}...
                            </p>

                            {/* Terminal-style separator */}
                            <div className='mt-2 pt-2 border-t border-emerald-800/20'>
                              <div className='flex items-center gap-1'>
                                <div className='w-1 h-1 bg-emerald-600 opacity-50'></div>
                                <div className='w-1 h-1 bg-emerald-600 opacity-30'></div>
                                <div className='w-1 h-1 bg-emerald-600 opacity-10'></div>
                                <span className='text-xs text-emerald-700 ml-2 tracking-widest'>
                                  REG_{String(index + 1).padStart(3, '0')}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='mt-6 pt-4 border-t border-emerald-800/20'>
        <div className='text-xs text-emerald-600 text-center'>
          <p>{'> Fin del archivo'}</p>
          <p className='mt-1 tracking-wider'>
            {'TOTAL: '}
            {facts.length} {'REGISTROS'}
          </p>
        </div>
      </div>
    </div>
  )
}
