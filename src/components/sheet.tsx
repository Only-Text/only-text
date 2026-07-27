import type { ReactNode } from 'react'

/**
 * Het vel papier.
 *
 * De liniatuur is een achtergrondlaag, geen elementen: dat scheelt DOM en het
 * schaalt vanzelf mee met de inhoud. De rode kantlijn bepaalt de linkerpadding,
 * zodat tekst nooit over de marge heen valt.
 *
 * De lichte rotatie is wat het vel op papier legt in plaats van in een raster.
 * Hij staat op de buitenste laag zodat de schaduwstapel meedraait.
 */
export function Sheet({
  children,
  tilt = -0.5,
  single = false,
  lines,
}: {
  children: ReactNode
  tilt?: number
  single?: boolean
  /**
   * Het aantal regels dat het vel minstens telt, inclusief de lege regel
   * onderaan. Een vel papier heeft een maat: het krimpt niet als je één zin
   * minder schrijft. Zonder dit veert de voorpagina bij elke overname mee met
   * de inhoud — de zin gaat weg, het vel wordt korter, en alles eronder
   * schuift omhoog en weer terug. Met een ondergrens gebeurt er alleen nog
   * iets binnen het vel.
   */
  lines?: number
}) {
  return (
    <article
      className={`sheet ${single ? 'sheet--single' : ''}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* Geen padding aan de bovenkant: de eerste regel tekst hoort op de eerste
          blauwe lijn te staan, net als op echt papier. Met een lege regel
          erboven zweeft de kop en verlies je het houvast van het raster.

          De ondergrens staat in hele regels, want alles daartussenin zet de
          liniatuur van de vellen eronder scheef. */}
      <div
        className="ruled px-6 pb-(--line-h) pt-0 pl-[calc(var(--margin-x)+20px)] sm:pl-[calc(var(--margin-x)+28px)]"
        style={lines ? { minHeight: `calc(${lines} * var(--line-h))` } : undefined}
      >
        {children}
      </div>
    </article>
  )
}
