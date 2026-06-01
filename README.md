# Pokémon Kids Playground

[![Live Demo](https://img.shields.io/badge/Live-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://pokemon-kids-playground.netlify.app/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PokeAPI](https://img.shields.io/badge/Data-PokeAPI-2F7DE1?style=for-the-badge)](https://pokeapi.co/)
[![Ages](https://img.shields.io/badge/Ages-5–7-2F7DE1?style=for-the-badge)](https://github.com/Elli2022/pokemon-kids-playground)
[![Mobile first](https://img.shields.io/badge/Layout-Mobile%20first-2F7DE1?style=for-the-badge)](https://github.com/Elli2022/pokemon-kids-playground)
[![Touch](https://img.shields.io/badge/Input-Touch%20friendly-2F7DE1?style=for-the-badge)](https://github.com/Elli2022/pokemon-kids-playground)
[![Memory](https://img.shields.io/badge/Mode-Memory-2F7DE1?style=for-the-badge)](https://github.com/Elli2022/pokemon-kids-playground)
[![Trail](https://img.shields.io/badge/Mode-Adventure%20trail-2F7DE1?style=for-the-badge)](https://github.com/Elli2022/pokemon-kids-playground)

A **mobile-first**, touch-friendly Pokémon mini-game for children ages **5–7**. Sibling project to [pokemon-search-app](https://github.com/Elli2022/pokemon-search-app).

Kids match picture cards only — no reading required. A curated roster (Pikachu, Charmander, Eevee, and friends) avoids random obscure species names.

## Screenshot

![Memory mode on a phone-sized layout — three-column card grid, mode tabs, and turn counter](images/screenshot.png)

## Live demo

**[Play on Netlify](https://pokemon-kids-playground.netlify.app/)**

## Game modes

| Mode | Description |
| --- | --- |
| **Memory** | 12 cards, 6 pairs. Flip two at a time until all matches are found. |
| **Adventure trail** | Five stops on a path. Each stop has a 4-card mini memory (2 pairs). Clear a stop to move the buddy forward. |

## Mobile & touch

Built **mobile-first**, then enhanced for larger screens:

- 3-column memory grid on phones, 4 columns from `36rem` up
- Minimum **48×48px** tap targets (tabs, cards, buttons)
- `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` to reduce tap delay and flash
- `pointerup` handlers with debounce to avoid double-flips on touch
- `safe-area-inset` padding for notched devices
- `100dvh` layout and horizontal scroll on the trail when needed

## Tech stack

| Layer | Choice |
| --- | --- |
| Markup | HTML5 |
| Styles | CSS3 (custom properties, grid, mobile-first breakpoints) |
| Logic | Vanilla JavaScript |
| Data | [PokeAPI](https://pokeapi.co/) (artwork & cries) |
| Hosting | [Netlify](https://www.netlify.com/) — static, no build step |

## Project structure

```text
pokemon-kids-playground/
├── images/
│   └── screenshot.png
├── index.html
├── script.js
├── style.css
├── netlify.toml
└── README.md
```

## Run locally

```bash
git clone https://github.com/Elli2022/pokemon-kids-playground.git
cd pokemon-kids-playground
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173). Use your browser’s device toolbar to test touch layouts.

## Deploy on Netlify

1. Import `Elli2022/pokemon-kids-playground` from GitHub.
2. **Build command:** leave empty.
3. **Publish directory:** `.` (repository root).
4. `netlify.toml` sets publish path and security headers.

## Author

**Eleonora Nocentini Skoldebrink** — [@Elli2022](https://github.com/Elli2022)
