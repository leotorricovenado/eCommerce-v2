import { ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"

import { cn } from "@/lib/utils"

export interface HeroSlide {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  to: string
  image: string
  /** Fondo + colores de texto de la slide (tokens de marca). */
  tone: "primary" | "accent" | "warning"
}

const TONE: Record<HeroSlide["tone"], { bg: string; text: string; eyebrow: string; button: string }> =
  {
    primary: {
      bg: "bg-gradient-to-br from-primary via-primary to-primary/80",
      text: "text-primary-foreground",
      eyebrow: "bg-primary-foreground/15 text-primary-foreground",
      button: "bg-accent text-accent-foreground hover:bg-accent/90",
    },
    accent: {
      bg: "bg-gradient-to-br from-accent via-accent to-accent/80",
      text: "text-accent-foreground",
      eyebrow: "bg-accent-foreground/15 text-accent-foreground",
      button: "bg-card text-foreground hover:bg-card/90",
    },
    warning: {
      bg: "bg-gradient-to-br from-warning via-warning to-warning/80",
      text: "text-foreground",
      eyebrow: "bg-foreground/10 text-foreground",
      button: "bg-foreground text-background hover:bg-foreground/90",
    },
  }

interface HeroCarouselProps {
  slides: HeroSlide[]
  intervalMs?: number
}

export function HeroCarousel({ slides, intervalMs = 5500 }: HeroCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const scrollTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" })
  }

  useEffect(() => {
    if (paused || slides.length < 2) return
    const t = window.setInterval(() => {
      scrollTo((active + 1) % slides.length)
    }, intervalMs)
    return () => window.clearInterval(t)
  }, [active, paused, slides.length, intervalMs])

  const onScroll = () => {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    if (index !== active) setActive(index)
  }

  return (
    <section
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-3xl shadow-lg shadow-primary/10"
      >
        {slides.map((s) => {
          const tone = TONE[s.tone]
          return (
            <div
              key={s.id}
              className={cn(
                "relative flex h-56 w-full shrink-0 snap-center overflow-hidden sm:h-64",
                tone.bg,
                tone.text
              )}
            >
              {/* Formas decorativas de fondo */}
              <span className="pointer-events-none absolute -top-16 -right-8 size-56 rounded-full bg-primary-foreground/10 sm:size-72" />
              <span className="pointer-events-none absolute -bottom-24 right-24 size-48 rounded-full bg-primary-foreground/10" />

              <div className="relative z-10 flex w-[62%] flex-col justify-center gap-2 p-5 sm:w-[58%] sm:p-8">
                <span
                  className={cn(
                    "w-fit rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase",
                    tone.eyebrow
                  )}
                >
                  {s.eyebrow}
                </span>
                <h1 className="text-xl leading-[1.1] sm:text-3xl">{s.title}</h1>
                <p className="text-xs opacity-85 sm:text-sm">{s.subtitle}</p>
                <Link
                  to={s.to}
                  className={cn(
                    "mt-1 flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-md transition-all hover:gap-2.5 active:scale-95 sm:text-sm",
                    tone.button
                  )}
                >
                  {s.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <img
                src={s.image}
                alt=""
                className="pointer-events-none absolute -right-3 bottom-[-6%] z-0 h-[112%] w-[46%] -rotate-6 object-contain drop-shadow-2xl sm:right-4 sm:w-[40%]"
              />
            </div>
          )
        })}
      </div>

      {slides.length > 1 && (
        <div className="mt-2.5 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Ir a la promoción ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-1.5 cursor-pointer rounded-full transition-all",
                i === active ? "w-6 bg-primary" : "w-1.5 bg-primary/25 hover:bg-primary/50"
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
