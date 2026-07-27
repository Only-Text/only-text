'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Een cursor die eruitziet als een pennenpunt op de lijn.
 *
 * De ingebouwde cursor van een tekstveld is precies zo hoog als de regelhoogte.
 * Bij ons is die regelhoogte 44px terwijl de letters 21,6px zijn, dus de
 * standaardcursor steekt er ver bovenuit en snijdt dwars door de blauwe lijn.
 *
 * Dat is niet op te lossen met CSS: de cursorhoogte volgt de regelhoogte, en
 * de regelhoogte moet gelijk blijven aan de liniatuur, anders lopen meerdere
 * regels getypte tekst van de lijnen af.
 *
 * Dus: de echte cursor wordt onzichtbaar gemaakt en we tekenen er zelf een.
 * De positie komt uit een onzichtbare kopie van het veld met dezelfde
 * typografie, waarin een merkteken op de plek van de cursor staat. Dat
 * merkteken is een inline-block zonder hoogte, dus zijn bovenkant ligt exact
 * op de basislijn — precies waar een pen het papier raakt.
 */
export function PenCaret({
  fieldRef,
  value,
  visible,
}: {
  fieldRef: RefObject<HTMLTextAreaElement | null>
  value: string
  visible: boolean
}) {
  const mirror = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number; h: number } | null>(null)

  const meet = useCallback(() => {
    const field = fieldRef.current
    const spiegel = mirror.current
    if (!field || !spiegel) return

    const cs = getComputedStyle(field)
    const size = parseFloat(cs.fontSize)

    // De spiegel exact hetzelfde laten breken als het veld.
    // Let op: dit moet via toewijzing en niet via setProperty(), want die
    // verwacht CSS-notatie ('font-family') en negeert camelCase stilzwijgend.
    for (const prop of [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
      'letterSpacing', 'wordSpacing', 'textTransform', 'textIndent',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'boxSizing', 'fontVariationSettings',
    ] as const) {
      spiegel.style[prop] = cs[prop] as string
    }
    spiegel.style.width = `${field.clientWidth}px`

    const tot = field.selectionStart ?? value.length
    spiegel.textContent = value.slice(0, tot)

    const merk = document.createElement('span')
    merk.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    spiegel.appendChild(merk)

    // Een spatie aan het einde wordt anders weggevouwen en dan staat de cursor
    // op de verkeerde plek zodra je een woord afsluit.
    if (value.slice(0, tot).endsWith(' ')) {
      spiegel.insertBefore(document.createTextNode('​'), merk)
    }

    const m = merk.getBoundingClientRect()
    const s = spiegel.getBoundingClientRect()
    merk.remove()

    // De spiegel is betrouwbaar voor links-rechts, maar niet voor de hoogte:
    // hij rendeert zijn regelvakken net iets anders dan een textarea, en een
    // paar pixels verschil zie je meteen als de cursor onder de lijn hangt.
    //
    // De verticale positie komt daarom uit dezelfde geijkte formule die de
    // tekst zelf op de lijn zet: basislijn = C + lettergrootte * k, en per
    // regel daar de regelhoogte bij. De spiegel bepaalt alleen nog op welke
    // regel we zitten.
    const root = getComputedStyle(document.documentElement)
    const regelhoogte = parseFloat(getComputedStyle(field).lineHeight)
    const c = parseFloat(root.getPropertyValue('--baseline-c'))
    const k = parseFloat(root.getPropertyValue('--baseline-k'))
    if (!Number.isFinite(regelhoogte) || !Number.isFinite(c) || !Number.isFinite(k)) return

    const basisInRegel = c + size * k
    const regel = Math.max(0, Math.round((m.top - s.top - basisInRegel) / regelhoogte))
    const basislijn = regel * regelhoogte + basisInRegel

    setPos({
      x: m.left - s.left,
      // De pen staat op de lijn en steekt er nauwelijks onderdoor.
      y: basislijn - size * 0.72,
      h: size * 0.8,
    })
  }, [fieldRef, value])

  useEffect(() => {
    meet()
  }, [meet, value, visible])

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const opnieuw = () => meet()
    // selectionchange vangt klikken en pijltjestoetsen; input vangt typen.
    document.addEventListener('selectionchange', opnieuw)
    field.addEventListener('click', opnieuw)
    field.addEventListener('keyup', opnieuw)
    window.addEventListener('resize', opnieuw)
    return () => {
      document.removeEventListener('selectionchange', opnieuw)
      field.removeEventListener('click', opnieuw)
      field.removeEventListener('keyup', opnieuw)
      window.removeEventListener('resize', opnieuw)
    }
  }, [fieldRef, meet])

  return (
    <>
      <div
        ref={mirror}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 select-none whitespace-pre-wrap wrap-break-word opacity-0"
        style={{ visibility: 'hidden' }}
      />
      {visible && pos && (
        <span
          aria-hidden="true"
          className="cursor-blink pointer-events-none absolute"
          style={{
            left: pos.x,
            top: pos.y,
            width: 2,
            height: pos.h,
            background: 'var(--flame)',
            borderRadius: 1,
          }}
        />
      )}
    </>
  )
}
