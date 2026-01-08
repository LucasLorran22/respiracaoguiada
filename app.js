/**
 * Breathe App - JavaScript
 * Aplicação de respiração guiada com animação estilo smartwatch
 * Design: Minimalismo Meditativo
 */

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================

let isRunning = false;
let selectedDuration = null;
let timeElapsed = 0;
let breathePhase = 'inspire';
let cycleProgress = 0;
let intervalId = null;

// ============================================
// CONSTANTES
// ============================================

const BREATHING_CYCLE = 12000; // ms (12 segundos total)
const INSPIRE_DURATION = 4000; // 4 segundos
const HOLD_DURATION = 4000; // 4 segundos
const EXPIRE_DURATION = 4000; // 4 segundos

// ============================================
// ELEMENTOS DOM
// ============================================

const timeControls = document.getElementById('timeControls');
const controlButtons = document.getElementById('controlButtons');
const breathingCircle = document.getElementById('breathingCircle');
const breathingTime = document.getElementById('breathingTime');
const breathingPhase = document.getElementById('breathingPhase');
const breathingInitial = document.getElementById('breathingInitial');
const breathingInitialText = document.getElementById('breathingInitialText');
const progressCircle = document.getElementById('progressCircle');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const pauseIcon = document.getElementById('pauseIcon');
const pauseText = document.getElementById('pauseText');

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Formata tempo em milissegundos para MM:SS
 * @param {number} ms - Tempo em milissegundos
 * @returns {string} Tempo formatado
 */
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Retorna o texto da fase de respiração
 * @param {string} phase - Fase ('inspire', 'hold', 'expire')
 * @returns {string} Texto da fase
 */
function getPhaseText(phase) {
    const phases = {
        'inspire': 'Inspire',
        'hold': 'Segure',
        'expire': 'Expire'
    };
    return phases[phase] || 'Inspire';
}

/**
 * Atualiza a cor da fase de respiração
 * @param {string} phase - Fase ('inspire', 'hold', 'expire')
 */
function updatePhaseColor(phase) {
    breathingTime.className = `breathing-time ${phase}`;
    breathingPhase.className = `breathing-phase animate ${phase}`;
}

/**
 * Atualiza a interface com os dados atuais
 */
function updateUI() {
    breathingTime.textContent = formatTime(timeElapsed);
    breathingPhase.textContent = getPhaseText(breathePhase);
    updatePhaseColor(breathePhase);

    // Atualizar anel de progresso (SVG)
    const circumference = 2 * Math.PI * 120; // raio = 120
    const offset = circumference - (cycleProgress / 100) * circumference;
    progressCircle.style.strokeDasharray = `${circumference - offset} ${circumference}`;
}

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Inicia o exercício de respiração
 * @param {number|null} duration - Duração em segundos (null para infinito)
 */
function startBreathing(duration) {
    selectedDuration = duration;
    isRunning = true;
    timeElapsed = 0;
    breathePhase = 'inspire';
    cycleProgress = 0;

    // Atualizar UI
    breathingInitial.classList.add('hidden');
    breathingInitialText.classList.add('hidden');
    breathingTime.classList.remove('hidden');
    breathingPhase.classList.remove('hidden');
    controlButtons.style.display = 'flex';
    breathingCircle.classList.add('active');

    // Desabilitar botões de tempo
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('active');
    });
    document.querySelector(`[data-duration="${duration}"]`).classList.add('active');

    // Iniciar loop de respiração
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        timeElapsed += 100;

        // Verificar se atingiu o tempo máximo
        if (selectedDuration && timeElapsed >= selectedDuration * 1000) {
            pauseBreathing();
            return;
        }

        // Calcular fase da respiração
        const cycleTime = timeElapsed % BREATHING_CYCLE;
        cycleProgress = (cycleTime / BREATHING_CYCLE) * 100;

        if (cycleTime < INSPIRE_DURATION) {
            breathePhase = 'inspire';
        } else if (cycleTime < INSPIRE_DURATION + HOLD_DURATION) {
            breathePhase = 'hold';
        } else {
            breathePhase = 'expire';
        }

        updateUI();
    }, 100);
}

/**
 * Pausa ou retoma o exercício de respiração
 */
function pauseBreathing() {
    isRunning = !isRunning;
    if (isRunning) {
        pauseIcon.textContent = '⏸';
        pauseText.textContent = 'Pausar';
        breathingCircle.classList.add('active');
        // Retomar o loop
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            timeElapsed += 100;

            if (selectedDuration && timeElapsed >= selectedDuration * 1000) {
                pauseBreathing();
                return;
            }

            const cycleTime = timeElapsed % BREATHING_CYCLE;
            cycleProgress = (cycleTime / BREATHING_CYCLE) * 100;

            if (cycleTime < INSPIRE_DURATION) {
                breathePhase = 'inspire';
            } else if (cycleTime < INSPIRE_DURATION + HOLD_DURATION) {
                breathePhase = 'hold';
            } else {
                breathePhase = 'expire';
            }

            updateUI();
        }, 100);
    } else {
        pauseIcon.textContent = '▶';
        pauseText.textContent = 'Retomar';
        breathingCircle.classList.remove('active');
        clearInterval(intervalId);
    }
}

/**
 * Reinicia o exercício de respiração
 */
function resetBreathing() {
    isRunning = false;
    selectedDuration = null;
    timeElapsed = 0;
    breathePhase = 'inspire';
    cycleProgress = 0;
    clearInterval(intervalId);

    // Atualizar UI
    breathingInitial.classList.remove('hidden');
    breathingInitialText.classList.remove('hidden');
    breathingTime.classList.add('hidden');
    breathingPhase.classList.add('hidden');
    controlButtons.style.display = 'none';
    breathingCircle.classList.remove('active');

    // Habilitar botões de tempo
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('active');
    });

    // Resetar anel de progresso
    progressCircle.style.strokeDasharray = '0 754';

    // Resetar ícone de pausa
    pauseIcon.textContent = '⏸';
    pauseText.textContent = 'Pausar';
}

// ============================================
// EVENT LISTENERS
// ============================================

// Botões de tempo
document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const duration = btn.dataset.duration === 'null' ? null : parseInt(btn.dataset.duration);
        startBreathing(duration);
    });
});

// Botão de pausa/retomar
pauseBtn.addEventListener('click', pauseBreathing);

// Botão de reiniciar
resetBtn.addEventListener('click', resetBreathing);

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    resetBreathing();
});
