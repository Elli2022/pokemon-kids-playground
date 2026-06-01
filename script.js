const API_BASE = "https://pokeapi.co/api/v2";
const ROUNDS = 5;
const CHOICE_COUNT = 3;
/** Gen 1 — välbekanta Pokémon för små barn */
const POKEMON_POOL = Array.from({ length: 151 }, (_, index) => index + 1);
const ARTWORK_URL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const elements = {
    questionImage: document.getElementById("questionImage"),
    questionName: document.getElementById("questionName"),
    promptText: document.getElementById("promptText"),
    choices: document.getElementById("choices"),
    feedback: document.getElementById("feedback"),
    roundLabel: document.getElementById("roundLabel"),
    stars: document.getElementById("stars"),
    nextButton: document.getElementById("nextButton"),
    playAgainButton: document.getElementById("playAgainButton"),
    soundButton: document.getElementById("soundButton"),
    confetti: document.getElementById("confetti")
};

const state = {
    round: 1,
    score: 0,
    soundOn: true,
    answered: false,
    current: null,
    choices: [],
    cryAudio: null
};

const messages = {
    correct: ["Bra jobbat!", "Rätt!", "Jippie!", "Superbra!"],
    wrong: ["Nästan!", "Prova igen nästa gång!", "Oj, fel — men du klarar nästa!"],
    done: "Du klarade spelet! Vill du spela igen?"
};

function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
}

function capitalizeName(name) {
    return name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function artworkFor(id) {
    return `${ARTWORK_URL}/${id}.png`;
}

async function fetchPokemon(id) {
    const response = await fetch(`${API_BASE}/pokemon/${id}`);

    if (!response.ok) {
        throw new Error(`Kunde inte hämta Pokémon #${id}`);
    }

    return response.json();
}

function buildRoundIds() {
    return shuffle(POKEMON_POOL).slice(0, CHOICE_COUNT);
}

async function loadRound() {
    state.answered = false;
    elements.feedback.textContent = "";
    elements.feedback.className = "feedback";
    elements.nextButton.hidden = true;
    elements.playAgainButton.hidden = true;
    elements.choices.innerHTML = "";
    elements.roundLabel.textContent = `Runda ${state.round} av ${ROUNDS}`;
    elements.promptText.textContent = "Vem är det?";
    elements.questionName.hidden = true;
    elements.questionImage.alt = "Gissningsbild";
    elements.questionImage.src = "";
    elements.questionImage.classList.add("is-loading");

    const ids = buildRoundIds();
    const pokemonList = await Promise.all(ids.map((id) => fetchPokemon(id)));

    state.current = pickRandom(pokemonList);
    state.choices = shuffle(pokemonList);

    elements.questionImage.src = artworkFor(state.current.id);
    elements.questionImage.alt = `En Pokémon — gissa vilken`;
    elements.questionImage.classList.remove("is-loading");

    state.choices.forEach((pokemon) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice";
        button.dataset.id = String(pokemon.id);
        button.setAttribute("aria-label", `Välj ${capitalizeName(pokemon.name)}`);

        const image = document.createElement("img");
        image.src = artworkFor(pokemon.id);
        image.alt = "";
        image.width = 96;
        image.height = 96;

        const label = document.createElement("span");
        label.className = "choice__label";
        label.textContent = capitalizeName(pokemon.name);

        button.append(image, label);
        button.addEventListener("click", () => handleChoice(pokemon.id, button));
        elements.choices.appendChild(button);
    });
}

function updateStars() {
    elements.stars.querySelectorAll(".star").forEach((star) => {
        const earned = Number(star.dataset.star) <= state.score;
        star.classList.toggle("is-earned", earned);
    });
}

function burstConfetti() {
    const colors = ["#ffc107", "#2f7de1", "#3cb371", "#ff8a65", "#ab47bc"];

    for (let index = 0; index < 24; index += 1) {
        const piece = document.createElement("span");
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[index % colors.length];
        piece.style.animationDelay = `${Math.random() * 0.35}s`;
        elements.confetti.appendChild(piece);
        window.setTimeout(() => piece.remove(), 1600);
    }
}

function playCry() {
    if (!state.soundOn || !state.current?.cries?.latest) {
        return;
    }

    try {
        state.cryAudio = new Audio(state.current.cries.latest);
        state.cryAudio.volume = 0.45;
        void state.cryAudio.play();
    } catch {
        /* Ljud är valfritt */
    }
}

function revealChoices(correctId) {
    elements.choices.querySelectorAll(".choice").forEach((button) => {
        button.disabled = true;
        const id = Number(button.dataset.id);

        if (id === correctId) {
            button.classList.add("is-correct");
        } else if (button.classList.contains("was-picked")) {
            button.classList.add("is-wrong");
        }
    });

    elements.questionName.hidden = false;
    elements.questionName.textContent = capitalizeName(state.current.name);
}

function handleChoice(pickedId, button) {
    if (state.answered) {
        return;
    }

    state.answered = true;
    button.classList.add("was-picked");

    const isCorrect = pickedId === state.current.id;

    if (isCorrect) {
        state.score += 1;
        updateStars();
        elements.feedback.textContent = pickRandom(messages.correct);
        elements.feedback.className = "feedback is-good";
        burstConfetti();
        playCry();
    } else {
        elements.feedback.textContent = pickRandom(messages.wrong);
        elements.feedback.className = "feedback is-oops";
    }

    revealChoices(state.current.id);

    if (state.round >= ROUNDS) {
        elements.feedback.textContent = `${messages.done} Du fick ${state.score} av ${ROUNDS} stjärnor.`;
        elements.playAgainButton.hidden = false;
        return;
    }

    elements.nextButton.hidden = false;
}

function resetGame() {
    state.round = 1;
    state.score = 0;
    updateStars();
    void loadRound();
}

elements.nextButton.addEventListener("click", () => {
    state.round += 1;
    void loadRound();
});

elements.playAgainButton.addEventListener("click", resetGame);

elements.soundButton.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    elements.soundButton.setAttribute("aria-pressed", String(state.soundOn));
    elements.soundButton.textContent = state.soundOn ? "🔊 Ljud på" : "🔇 Ljud av";
});

void loadRound();
