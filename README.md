# Pokémon Barnspel

[![Netlify Status](https://img.shields.io/badge/Live-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://pokemon-barnspel.netlify.app/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PokeAPI](https://img.shields.io/badge/Data-PokeAPI-2F7DE1?style=for-the-badge)](https://pokeapi.co/)
[![Ålder](https://img.shields.io/badge/Ålder-5–7%20år-2F7DE1?style=for-the-badge)](https://github.com/Elli2022/pokemon-barnspel)

Ett enkelt, bildbaserat Pokémon-spel för barn **5–7 år**. Syskonprojekt till [pokemon-search-app](https://github.com/Elli2022/pokemon-search-app).

## Live demo

**[Spela på Netlify](https://pokemon-barnspel.netlify.app/)**

## Så spelar man

1. En stor Pokémon-bild visas högst upp.
2. Tre val visas under — tryck på **samma** Pokémon.
3. Fem rundor. Varje rätt svar ger en gul stjärna.
4. Vid rätt svar: konfetti, uppmuntrande text och (om ljud är på) Pokémon-skrik.

Barn behöver inte läsa för att spela — bilderna är huvudledtråden. Namn visas som stöd för vuxna eller äldre syskon.

## Varför det passar små barn

| Designval | Varför |
| --- | --- |
| Bara 3 val | Mindre kognitiv belastning |
| Stora tryckytor | Enkelt på surfplatta |
| Gen 1 (151 st) | Bekanta figurer |
| Korta rundor (5) | Håller fokus |
| Tydliga färger | Rätt/fel syns direkt |
| Ljud av/på | Förskolor och kvällar |

## Teknik

- Vanilla HTML, CSS och JavaScript
- [PokeAPI](https://pokeapi.co/) för namn, bilder och cries
- Statisk hosting på Netlify (`netlify.toml`)

## Kör lokalt

```bash
cd pokemon-barnspel
python3 -m http.server 4173
```

Öppna [http://localhost:4173](http://localhost:4173).

## Deploy på Netlify

1. **Add new site → Import** från GitHub.
2. Välj repot `Elli2022/pokemon-barnspel`.
3. Publicera rotmappen (ingen build behövs).

## Författare

**Eleonora Nocentini Skoldebrink** — [@Elli2022](https://github.com/Elli2022)
