const API_BASE = "https://pokeapi.co/api/v2";
const ARTWORK_URL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

/** Bara välkända Gen 1 — inga udda namn som förvirrar barn (eller föräldrar). */
const FRIENDLY_POKEMON = [
    { id: 25, label: "Pikachu" },
    { id: 1, label: "Bulbasaur" },
    { id: 4, label: "Charmander" },
    { id: 7, label: "Squirtle" },
    { id: 39, label: "Jigglypuff" },
    { id: 54, label: "Psyduck" },
    { id: 52, label: "Meowth" },
    { id: 35, label: "Clefairy" },
    { id: 133, label: "Eevee" },
    { id: 143, label: "Snorlax" }
];

const MEMORY_PAIR_COUNT = 6;
const TRAIL_STOPS = 5;
const TRAIL_PAIRS_PER_STOP = 2;

const pokemonCache = new Map();

const elements = {
    modeHint: document.getElementById("modeHint"),
    modeTabs: document.querySelectorAll(".mode-tab"),
    memoryPanel: document.getElementById("memoryPanel"),
    trailPanel: document.getElementById("trailPanel"),
    memoryGrid: document.getElementById("memoryGrid"),
    memoryTurns: document.getElementById("memoryTurns"),
    memoryPairs: document.getElementById("memoryPairs"),
    memoryTotal: document.getElementById("memoryTotal"),
    memoryFeedback: document.getElementById("memoryFeedback"),
    memoryRestart: document.getElementById("memoryRestart"),
    trail: document.getElementById("trail"),
    trailGrid: document.getElementById("trailGrid"),
    trailStageLabel: document.getElementById("trailStageLabel"),
    trailFeedback: document.getElementById("trailFeedback"),
    trailRestart: document.getElementById("trailRestart"),
    soundButton: document.getElementById("soundButton"),
    confetti: document.getElementById("confetti")
};

const state = {
    mode: "memory",
    soundOn: true,
    memory: {
        cards: [],
        first: null,
        second: null,
        lock: false,
        turns: 0,
        matched: 0
    },
    trail: {
        stop: 0,
        cards: [],
        first: null,
        second: null,
        lock: false
    }
};

function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function artworkFor(id) {
    return `${ARTWORK_URL}/${id}.png`;
}

async function fetchPokemonMeta(id) {
    if (pokemonCache.has(id)) {
        return pokemonCache.get(id);
    }

    const response = await fetch(`${API_BASE}/pokemon/${id}`);
    if (!response.ok) {
        throw new Error(`API ${id}`);
    }

    const data = await response.json();
    const meta = {
        id,
        cry: data.cries?.latest || null
    };
    pokemonCache.set(id, meta);
    return meta;
}

function burstConfetti() {
    const colors = ["#ffc107", "#2f7de1", "#3cb371", "#ff8a65", "#ab47bc"];
    for (let i = 0; i < 20; i += 1) {
        const piece = document.createElement("span");
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.animationDelay = `${Math.random() * 0.3}s`;
        elements.confetti.appendChild(piece);
        window.setTimeout(() => piece.remove(), 1500);
    }
}

function playCry(pokemonId) {
    if (!state.soundOn) {
        return;
    }

    const meta = pokemonCache.get(pokemonId);
    if (!meta?.cry) {
        return;
    }

    try {
        const audio = new Audio(meta.cry);
        audio.volume = 0.4;
        void audio.play();
    } catch {
        /* optional */
    }
}

function buildDeck(pairCount, pool = FRIENDLY_POKEMON) {
    const picked = shuffle(pool).slice(0, pairCount);
    const cards = [];

    picked.forEach((poke, index) => {
        for (let copy = 0; copy < 2; copy += 1) {
            cards.push({
                uid: `${poke.id}-${copy}-${index}`,
                pokemonId: poke.id,
                label: poke.label,
                image: artworkFor(poke.id),
                matched: false
            });
        }
    });

    return shuffle(cards);
}

function createCardButton(card, sizeClass = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `memory-card ${sizeClass}`.trim();
    button.dataset.uid = card.uid;
    button.dataset.pokemonId = String(card.pokemonId);
    button.setAttribute("aria-label", `Flip card, ${card.label}`);

    const inner = document.createElement("span");
    inner.className = "memory-card__inner";

    const back = document.createElement("span");
    back.className = "memory-card__face memory-card__face--back";
    back.textContent = "⭐";

    const front = document.createElement("span");
    front.className = "memory-card__face memory-card__face--front";
    const img = document.createElement("img");
    img.src = card.image;
    img.alt = card.label;
    img.width = 96;
    img.height = 96;
    front.appendChild(img);

    inner.append(back, front);
    button.appendChild(inner);

    return button;
}

function renderGrid(gridEl, cards, sizeClass = "") {
    gridEl.innerHTML = "";
    cards.forEach((card) => {
        gridEl.appendChild(createCardButton(card, sizeClass));
    });
}

function flipCardButton(button, open) {
    button.classList.toggle("is-flipped", open);
    button.disabled = open;
}

function getCardFromGrid(gridEl, uid) {
    return gridEl.querySelector(`[data-uid="${uid}"]`);
}

function handleMemoryPick(gridEl, gameState, cards, uid, onWin) {
    if (gameState.lock) {
        return;
    }

    const card = cards.find((c) => c.uid === uid);
    if (!card || card.matched) {
        return;
    }

    const button = getCardFromGrid(gridEl, uid);
    if (!button || button.classList.contains("is-flipped")) {
        return;
    }

    flipCardButton(button, true);

    if (!gameState.first) {
        gameState.first = { uid, pokemonId: card.pokemonId };
        return;
    }

    gameState.second = { uid, pokemonId: card.pokemonId };
    gameState.lock = true;

    if (gameState === state.memory) {
        state.memory.turns += 1;
        elements.memoryTurns.textContent = String(state.memory.turns);
    }

    const isMatch = gameState.first.pokemonId === gameState.second.pokemonId;

    if (isMatch) {
        cards
            .filter((c) => c.pokemonId === card.pokemonId)
            .forEach((c) => {
                c.matched = true;
            });

        playCry(card.pokemonId);
        burstConfetti();

        window.setTimeout(() => {
            gameState.first = null;
            gameState.second = null;
            gameState.lock = false;
            onWin();
        }, 500);
        return;
    }

    window.setTimeout(() => {
        [gameState.first.uid, gameState.second.uid].forEach((id) => {
            const btn = getCardFromGrid(gridEl, id);
            if (btn) {
                flipCardButton(btn, false);
                btn.disabled = false;
            }
        });
        gameState.first = null;
        gameState.second = null;
        gameState.lock = false;
    }, 750);
}

/* —— Memory mode —— */
async function startMemory() {
    elements.memoryTotal.textContent = String(MEMORY_PAIR_COUNT);
    elements.memoryPairs.textContent = "0";
    elements.memoryTurns.textContent = "0";
    elements.memoryFeedback.textContent = "";
    elements.memoryRestart.hidden = true;

    state.memory = {
        cards: buildDeck(MEMORY_PAIR_COUNT),
        first: null,
        second: null,
        lock: false,
        turns: 0,
        matched: 0
    };

    await Promise.all(
        [...new Set(state.memory.cards.map((c) => c.pokemonId))].map((id) => fetchPokemonMeta(id))
    );

    renderGrid(elements.memoryGrid, state.memory.cards);
    elements.memoryFeedback.textContent = "Tap two cards to start!";
}

function onMemoryWin() {
    state.memory.matched += 1;
    elements.memoryPairs.textContent = String(state.memory.matched);

    if (state.memory.matched < MEMORY_PAIR_COUNT) {
        return;
    }

    elements.memoryFeedback.textContent = `You got all pairs in ${state.memory.turns} turns!`;
    elements.memoryRestart.hidden = false;
    burstConfetti();
}

bindCardGrid(elements.memoryGrid, (button) => {
    handleMemoryPick(
        elements.memoryGrid,
        state.memory,
        state.memory.cards,
        button.dataset.uid,
        onMemoryWin
    );
});

elements.memoryRestart.addEventListener("click", () => void startMemory());

/* —— Trail mode —— */
function renderTrailPath() {
    elements.trail.innerHTML = "";
    const hero = document.createElement("div");
    hero.className = "trail__hero";
    hero.id = "trailHero";
    hero.setAttribute("aria-hidden", "true");
    hero.textContent = "🐾";

    const steps = document.createElement("div");
    steps.className = "trail__steps";

    for (let i = 0; i < TRAIL_STOPS; i += 1) {
        const step = document.createElement("div");
        step.className = "trail__step";
        step.dataset.step = String(i);
        if (i < state.trail.stop) {
            step.classList.add("is-done");
        }
        if (i === state.trail.stop && state.trail.stop < TRAIL_STOPS) {
            step.classList.add("is-current");
        }
        step.textContent = String(i + 1);
        steps.appendChild(step);
    }

    elements.trail.append(hero, steps);
    positionHero();
}

function positionHero() {
    const hero = document.getElementById("trailHero");
    const current = elements.trail.querySelector(".trail__step.is-current");
    if (!hero || !current) {
        if (hero && state.trail.stop >= TRAIL_STOPS) {
            hero.style.left = "92%";
        }
        return;
    }

    const trailRect = elements.trail.getBoundingClientRect();
    const stepRect = current.getBoundingClientRect();
    const left = stepRect.left - trailRect.left + stepRect.width / 2 - 16;
    hero.style.left = `${left}px`;
}

async function startTrailStop() {
    if (state.trail.stop >= TRAIL_STOPS) {
        elements.trailStageLabel.textContent = "Finish!";
        elements.trailGrid.innerHTML = "";
        elements.trailFeedback.textContent = "You completed the whole trail!";
        elements.trailRestart.hidden = false;
        burstConfetti();
        return;
    }

    elements.trailFeedback.textContent = "";
    elements.trailStageLabel.textContent = `Stop ${state.trail.stop + 1} of ${TRAIL_STOPS} — find 2 pairs`;

    const offset = state.trail.stop * TRAIL_PAIRS_PER_STOP;
    const pool = FRIENDLY_POKEMON.slice(offset, offset + TRAIL_PAIRS_PER_STOP * 2);
    const safePool = pool.length >= TRAIL_PAIRS_PER_STOP ? pool : FRIENDLY_POKEMON;

    state.trail.cards = buildDeck(TRAIL_PAIRS_PER_STOP, safePool);
    state.trail.first = null;
    state.trail.second = null;
    state.trail.lock = false;
    state.trail.matched = 0;

    await Promise.all(
        [...new Set(state.trail.cards.map((c) => c.pokemonId))].map((id) => fetchPokemonMeta(id))
    );

    renderGrid(elements.trailGrid, state.trail.cards, "memory-card--small");
    renderTrailPath();
}

function onTrailWin() {
    state.trail.matched = (state.trail.matched || 0) + 1;

    if (state.trail.matched < TRAIL_PAIRS_PER_STOP) {
        return;
    }

    elements.trailFeedback.textContent = "Nice! Next stop…";
    state.trail.stop += 1;

    window.setTimeout(() => {
        void startTrailStop();
    }, 900);
}

async function startTrail() {
    state.trail.stop = 0;
    state.trail.matched = 0;
    elements.trailRestart.hidden = true;
    elements.trailFeedback.textContent = "";
    await startTrailStop();
}

bindCardGrid(elements.trailGrid, (button) => {
    handleMemoryPick(
        elements.trailGrid,
        state.trail,
        state.trail.cards,
        button.dataset.uid,
        onTrailWin
    );
});

elements.trailRestart.addEventListener("click", () => void startTrail());

window.addEventListener("resize", positionHero);

/* —— Mode switch —— */
function setMode(mode) {
    state.mode = mode;
    const isMemory = mode === "memory";

    elements.memoryPanel.hidden = !isMemory;
    elements.trailPanel.hidden = isMemory;

    elements.modeTabs.forEach((tab) => {
        const active = tab.dataset.mode === mode;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-pressed", String(active));
    });

    elements.modeHint.textContent = isMemory
        ? "Memory: flip two cards and find matching Pokémon."
        : "Adventure trail: clear mini memory at each stop.";

    if (isMemory) {
        void startMemory();
    } else {
        void startTrail();
    }
}

elements.modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

elements.soundButton.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    elements.soundButton.setAttribute("aria-pressed", String(state.soundOn));
    elements.soundButton.textContent = state.soundOn ? "Sound on" : "Sound off";
});

/** Reliable taps on phones — pointerup avoids double-firing with click. */
function bindCardGrid(gridEl, onPick) {
    let lastUid = "";
    let lastAt = 0;

    gridEl.addEventListener(
        "pointerup",
        (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            const button = event.target.closest(".memory-card");
            if (!button || !gridEl.contains(button)) {
                return;
            }

            const now = Date.now();
            const uid = button.dataset.uid;
            if (uid === lastUid && now - lastAt < 400) {
                return;
            }

            lastUid = uid;
            lastAt = now;
            onPick(button);
        },
        { passive: true }
    );
}

void startMemory();
