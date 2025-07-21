"use client"

import { useState, useEffect } from "react"
import { Calendar, Share2, Terminal, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const historicalFacts = [
  {
    date: "15 de marzo de 44 a.C.",
    fact: "Julio César fue asesinado en los Idus de Marzo",
    description:
      "El emperador romano Julio César fue apuñalado 23 veces por un grupo de senadores en el Teatro de Pompeyo. Su último suspiro, según Shakespeare, fue 'Et tu, Brute?' dirigido a su hijo adoptivo Marco Junio Bruto.",
    category: "Política Antigua",
    year: "44 a.C.",
  },
  {
    date: "14 de abril de 1865",
    fact: "Abraham Lincoln fue asesinado en el Teatro Ford",
    description:
      "El presidente estadounidense Abraham Lincoln fue disparado por John Wilkes Booth mientras veía la obra 'Our American Cousin'. Murió la mañana siguiente, convirtiéndose en el primer presidente estadounidense asesinado.",
    category: "Historia Americana",
    year: "1865",
  },
  {
    date: "21 de julio de 1969",
    fact: "Neil Armstrong pisó la Luna por primera vez",
    description:
      "A las 02:56 UTC, Neil Armstrong se convirtió en el primer ser humano en pisar la superficie lunar, pronunciando las famosas palabras: 'Es un pequeño paso para el hombre, un gran salto para la humanidad.'",
    category: "Exploración Espacial",
    year: "1969",
  },
  {
    date: "9 de noviembre de 1989",
    fact: "Cayó el Muro de Berlín",
    description:
      "Después de 28 años dividiendo Berlín Oriental y Occidental, el Muro de Berlín comenzó a ser demolido por ciudadanos alemanes, marcando el inicio del fin de la Guerra Fría y la reunificación alemana.",
    category: "Historia Contemporánea",
    year: "1989",
  },
  {
    date: "12 de octubre de 1492",
    fact: "Cristóbal Colón llegó a América",
    description:
      "Cristóbal Colón y su expedición avistaron tierra en lo que hoy se conoce como las Bahamas, marcando el primer contacto documentado entre Europa y América, aunque él creía haber llegado a las Indias.",
    category: "Exploración",
    year: "1492",
  },
  {
    date: "4 de julio de 1776",
    fact: "Se firmó la Declaración de Independencia de Estados Unidos",
    description:
      "El Congreso Continental aprobó la Declaración de Independencia, redactada principalmente por Thomas Jefferson, estableciendo los principios fundamentales de libertad e igualdad que definirían la nueva nación.",
    category: "Historia Americana",
    year: "1776",
  },
  {
    date: "14 de julio de 1789",
    fact: "Comenzó la Revolución Francesa con la Toma de la Bastilla",
    description:
      "Los ciudadanos parisinos asaltaron la fortaleza de la Bastilla, símbolo del Antiguo Régimen, marcando el inicio de la Revolución Francesa que cambiaría para siempre la historia europea.",
    category: "Revolución",
    year: "1789",
  },
]

export default function Component() {
  const [currentFact, setCurrentFact] = useState(historicalFacts[0])
  const [currentDate, setCurrentDate] = useState("")
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
    const factIndex = dayOfYear % historicalFacts.length

    setCurrentFact(historicalFacts[factIndex])
    setCurrentDate(
      today.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )
  }, [])

  useEffect(() => {
    const text = currentFact.fact
    let index = 0
    setDisplayText("")
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
  }, [currentFact.fact])

  const shareContent = () => {
    if (navigator.share) {
      navigator.share({
        title: "Dato Histórico del Día",
        text: `${currentFact.fact} - ${currentFact.description}`,
        url: window.location.href,
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-emerald-100 relative overflow-hidden">
      {/* Vintage scan lines effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-pulse"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(16, 185, 129, 0.03) 2px,
              rgba(16, 185, 129, 0.03) 4px
            )`,
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="border-b border-emerald-900/30 bg-black/90 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-emerald-600/50 bg-emerald-900/20 flex items-center justify-center font-mono text-emerald-400">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-mono font-bold text-emerald-300 tracking-wider">HISTORIA_DIARIA.EXE</h1>
                <p className="text-sm text-emerald-600 font-mono">{"> Cargando archivos históricos..."}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-500 font-mono bg-emerald-900/10 border border-emerald-800/30 px-4 py-2">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">{currentDate}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Terminal Header */}
        <div className="mb-12">
          <div className="bg-emerald-900/10 border border-emerald-800/30 p-4 font-mono text-sm text-emerald-400 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>SISTEMA INICIADO</span>
              <div className="ml-auto flex gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-emerald-600/50 rounded-full"></div>
                <div className="w-2 h-2 bg-emerald-700/30 rounded-full"></div>
              </div>
            </div>
            <div className="text-emerald-600">{"> Accediendo a base de datos histórica..."}</div>
            <div className="text-emerald-600">{"> Dato del día cargado exitosamente"}</div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-emerald-200 mb-4 tracking-wide">
              ARCHIVO HISTÓRICO
            </h2>
            <div className="w-32 h-px bg-emerald-600/50 mx-auto mb-4"></div>
            <p className="text-emerald-500 font-mono text-sm tracking-wider">
              REGISTRO DIARIO DE EVENTOS SIGNIFICATIVOS
            </p>
          </div>
        </div>

        {/* Main Terminal Card */}
        <Card className="bg-black/80 border-2 border-emerald-800/40 shadow-2xl shadow-emerald-900/20">
          <CardContent className="p-8 md:p-12">
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-900/20 border border-emerald-700/30 px-3 py-2 tracking-wider">
                  [{currentFact.category.toUpperCase()}]
                </span>
                <span className="text-xs font-mono text-emerald-600 bg-black/50 border border-emerald-800/20 px-3 py-2">
                  AÑO: {currentFact.year}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm font-mono text-emerald-500 mb-2 tracking-wide">
                  {"> FECHA_REGISTRO:"} {currentFact.date}
                </p>
                <div className="border-l-2 border-emerald-600/30 pl-4">
                  <h3 className="text-2xl md:text-3xl font-mono font-bold text-emerald-100 mb-4 leading-tight tracking-wide">
                    {displayText}
                    {isTyping && <span className="animate-pulse text-emerald-400">|</span>}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/20 p-6 mb-8 font-mono">
              <div className="text-xs text-emerald-600 mb-3 tracking-wider">{"> DESCRIPCIÓN_DETALLADA:"}</div>
              <p className="text-emerald-200 leading-relaxed">{currentFact.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-emerald-800/20">
              <div className="flex items-center gap-3 font-mono text-sm">
                <div className="w-3 h-3 bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-400 tracking-wide">VERIFICADO_POR_ARCHIVOS_HISTÓRICOS</span>
              </div>
              <Button
                onClick={shareContent}
                className="bg-emerald-900/30 text-emerald-200 border-2 border-emerald-700/50 hover:bg-emerald-800/30 hover:border-emerald-600/70 font-mono tracking-wider px-6"
              >
                <Share2 className="w-4 h-4 mr-2" />
                COMPARTIR_DATO
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Terminal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-black/60 border border-emerald-800/30 p-6 text-center font-mono">
            <div className="text-2xl font-bold text-emerald-300 mb-2 tracking-wider">365</div>
            <div className="text-emerald-600 text-xs tracking-wider">REGISTROS_ÚNICOS</div>
          </div>
          <div className="bg-black/60 border border-emerald-800/30 p-6 text-center font-mono">
            <div className="text-2xl font-bold text-emerald-300 mb-2 tracking-wider">5000+</div>
            <div className="text-emerald-600 text-xs tracking-wider">AÑOS_DE_HISTORIA</div>
          </div>
          <div className="bg-black/60 border border-emerald-800/30 p-6 text-center font-mono">
            <div className="text-2xl font-bold text-emerald-300 mb-2 tracking-wider">∞</div>
            <div className="text-emerald-600 text-xs tracking-wider">CONOCIMIENTO</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/30 bg-black/90 mt-20 relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-center font-mono">
            <p className="text-emerald-600 text-sm tracking-wider">
              © 2024 HISTORIA_DIARIA.EXE - EXPLORANDO_EL_PASADO_DIGITALMENTE
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
