# Matikkaseikkailu

Rauhallinen, selaimessa toimiva matematiikkapeli lapsille suomeksi. Pelkkää HTML:ää, CSS:ää ja JavaScriptiä – ei riippuvuuksia, ei build-vaihetta.

## Pelaajat ja tehtävät

| Ikätaso | Tehtävät |
|---|---|
| **Pienet** (n. 4 v) | Esineiden laskeminen 1–5 ja myöhemmin 1–10, kumpi on enemmän, yhteenlasku kuvilla (summa alle 5). Ohjeet kuvina, vastaukset isoina numero- ja pistepainikkeina. |
| **Isot** (n. 8 v) | Yhteen- ja vähennyslasku 0–20 ja myöhemmin 0–100, kymmenen ylitys, puuttuva luku, kertotaulut 2, 5 ja 10. |

- Hahmo (kettu, pupu, lohikäärme, robotti, pöllö tai kissa) kulkee neljässä maailmassa: **Metsä → Meri → Avaruus → Pilvilinna**. Jokaisessa maailmassa on 3 tasoa.
- 5 oikeaa vastausta vie seuraavalle tasolle tai seuraavaan maailmaan.
- Väärästä vastauksesta ei rangaista: väärä vaihtoehto himmenee ja näkyviin tulee lempeä vihje (pienille kuvallinen: esineisiin ilmestyvät numerot). Kahden väärän vastauksen jälkeen seuraava tehtävä on helpompi.
- Oikeasta vastauksesta tähti ja lyhyt, rauhallinen animaatio. Ei ajastimia, ei mainoksia, ei jatkuvaa liikettä. Animaatiot jäävät pois, jos laitteessa on valittu "vähennä liikettä".
- Äänet ovat oletuksena pois päältä. Kaiutinpainike lukee tehtävän ohjeen ääneen selaimen puhesynteesillä.
- Eteneminen tallentuu selaimen `localStorage`en erikseen kummallekin pelaajalle. Nollaus löytyy aloitusnäytön kohdasta *Aikuisille*.

## Tiedostot

- `index.html` – sivu
- `style.css` – ulkoasu
- `game.js` – pelilogiikka, tehtävägeneraattorit ja SVG-grafiikka

## Julkaisu GitHub Pagesissa

1. Lisää tiedostot repositorion juureen ja pushaa ne `main`-haaraan.
2. GitHubissa: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, valitse `main` ja `/ (root)`.
3. Peli löytyy hetken päästä osoitteesta `https://<käyttäjä>.github.io/<repositorio>/`.

Paikallisesti pelin voi avata suoraan tuplaklikkaamalla `index.html`.
