'use client'

import { useState, useEffect } from 'react'
import { type HistoricalFact } from '@/lib/supabase/types'

export function useHistoricalFact(fact: HistoricalFact) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const today = new Date()
    setCurrentDate(
      today.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    )
  }, [])

  useEffect(() => {
    const text = fact.title
    let index = 0
    setDisplayText('')
    setIsTyping(true)

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [fact.title])

  const shareContent = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Dato Histórico del Día',
        text: `${fact.title} - ${fact.description}`,
        url: window.location.href
      })
    }
  }

  return {
    displayText,
    isTyping,
    currentDate,
    shareContent
  }
}
