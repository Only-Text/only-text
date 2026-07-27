/**
 * Een kaartspeld, met de hand getekend.
 *
 * Zelfde regels als het oogje: geen bestand en geen iconenset, maar een paar
 * padjes met dezelfde onvaste lijn. De druppel sluit onderaan net niet, en de
 * kop zit een haartje uit het midden — precies zoals een speld die je zelf in
 * de kantlijn zet.
 */
export function Pin({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 18"
      className={`inline-block h-[1.05em] w-[0.82em] align-[-0.2em] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
    >
      <path d="M7 16.9 C 4.3 13, 1.7 10.3, 1.8 6.8 C 1.9 3.6, 4.2 1.3, 7.1 1.3 C 10.1 1.3, 12.3 3.7, 12.3 6.9 C 12.3 10.2, 9.7 12.8, 6.9 16.8" />
      <path d="M7.1 4.7 C 8.4 4.7, 9.4 5.7, 9.3 7 C 9.2 8.3, 8.3 9.2, 7 9.2 C 5.7 9.2, 4.8 8.2, 4.8 6.9 C 4.8 5.7, 5.8 4.7, 7.1 4.7" />
    </svg>
  )
}
