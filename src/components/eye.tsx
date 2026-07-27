/**
 * Een oogje, met de hand getekend.
 *
 * De site bevat verder geen enkele afbeelding, en dat is een verhaalpunt dat we
 * niet willen weggeven voor een icoontje uit een set. Dit is dus geen bestand
 * maar een paar padjes die met dezelfde onregelmatige lijn zijn getekend als de
 * knoppen: de boven- en onderboog sluiten niet perfect aan, en de pupil is niet
 * helemaal rond.
 */
export function Eye({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 14"
      className={`inline-block h-[0.95em] w-[1.6em] align-[-0.12em] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
    >
      <path d="M1.4 7.3 C 5 2.2, 9.4 1.1, 12.2 1.2 C 15.6 1.3, 19.6 2.9, 22.6 7.1" />
      <path d="M22.4 6.9 C 19.2 11.6, 15.4 12.9, 12 12.8 C 8.4 12.7, 4.6 11.2, 1.5 7.1" />
      <path d="M12.1 4.4 C 14.1 4.4, 15.5 5.7, 15.5 7.1 C 15.5 8.7, 14 9.9, 12.1 9.8 C 10.2 9.7, 8.8 8.5, 8.9 7 C 9 5.6, 10.3 4.4, 12.1 4.4" />
    </svg>
  )
}
