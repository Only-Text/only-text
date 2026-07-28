import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * De permalink heette /m/<id> en heet nu /thoughts/<id>.
   *
   * Die oude vorm blijft bestaan zolang er iets naar wijst, en dat is niet af
   * te dwingen: een gedeelde link staat in andermans chatgeschiedenis, in een
   * bladwijzer, of in de index van een zoekmachine die nog niet opnieuw is
   * langsgekomen. 308 en niet 307, zodat wie hem wél opnieuw ophaalt het nieuwe
   * adres onthoudt in plaats van het elke keer twee keer te moeten vragen.
   */
  async redirects() {
    return [
      {
        source: "/m/:id",
        destination: "/thoughts/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
