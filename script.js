/* ==========================================================================
   ACCENTURE BUBBLE MATHS GAME - CORE ENGINE
   Features: Real-time math expression generator, Web Audio sound engine,
             Accenture cognitive shortlist prediction, misclick recovery.
   ========================================================================== */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // APP STATE
  // --------------------------------------------------------------------------
  const state = {
    view: 'start', // 'start' | 'game' | 'result'
    mode: 'exam', // 'exam' | 'custom'
    timerDuration: 12, // seconds per question
    totalQuestions: 25,
    enabledTypes: {
      arithmetic: true,
      fractions: true,
      decimals: true,
      brackets: true
    },
    
    // Active session data
    currentQIndex: 0,
    questions: [],
    userAnswers: [], // { question, selectedIndices, correctIndices, isCorrect, timeSpent, timedOut }
    score: 0,
    streak: 0,
    
    // Active question timer
    timeRemaining: 12,
    timerInterval: null,
    startTime: null,
    
    // Bubble interaction & physics
    selectedIndices: [], // indices (0, 1, 2) clicked in order
    bubbleMotion: 'floating', // 'floating' (2D physics float) | 'gentle' | 'static'
    
    // Sound engine
    soundEnabled: true
  };

  // Physics animation loop handles
  let physicsReqId = null;
  let physicsBubbles = [];

  // --------------------------------------------------------------------------
  // WEB AUDIO SYNTHESIZER ENGINE (Zero asset dependencies)
  // --------------------------------------------------------------------------
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    try {
      if (type === 'select') {
        // Soft synth pop
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'unselect') {
        // Lower soft click
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'tick') {
        // Clock tick
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'success') {
        // Uplifting 3-note arpeggio
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.25, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.2);
        });
      } else if (type === 'error') {
        // Low double-buzz
        [220, 180].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.2, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.12);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.12);
        });
      } else if (type === 'fanfare') {
        // End of test victory chord
        [523.25, 659.25, 783.99, 1046.50].forEach((freq) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.8);
        });
      }
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // --------------------------------------------------------------------------
  // MATHEMATICAL EXPRESSION GENERATOR
  // --------------------------------------------------------------------------

  // Helper random integer in [min, max]
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Helper random choice from array
  function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Format fraction as HTML string
  function formatFractionHTML(num, den) {
    return `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  }

  /**
   * Generates a single mathematical expression object:
   * { html: '...', rawText: '...', value: Number, tip: '...' }
   */
  function generateSingleExpression(allowedTypes) {
    const type = randChoice(allowedTypes);

    if (type === 'arithmetic') {
      const op = randChoice(['+', '-', '×', '÷']);
      if (op === '+') {
        const a = randInt(-25, 30);
        const b = randInt(-25, 30);
        const val = a + b;
        const rawText = b < 0 ? `${a} + (${b})` : `${a} + ${b}`;
        return { html: rawText, rawText, value: val, tip: `${a} + ${b} = ${val}` };
      } else if (op === '-') {
        const a = randInt(-20, 35);
        const b = randInt(-20, 35);
        const val = a - b;
        const rawText = b < 0 ? `${a} - (${b})` : `${a} - ${b}`;
        return { html: rawText, rawText, value: val, tip: `${a} - ${b} = ${val}` };
      } else if (op === '×') {
        const a = randInt(-8, 12);
        const b = randInt(-8, 12);
        const val = a * b;
        const rawText = b < 0 ? `${a} × (${b})` : `${a} × ${b}`;
        return { html: rawText, rawText, value: val, tip: `${a} × ${b} = ${val}` };
      } else { // ÷
        const b = randChoice([-8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8]);
        const mult = randInt(-6, 9);
        const a = b * mult;
        const val = mult;
        const rawText = b < 0 ? `${a} ÷ (${b})` : `${a} ÷ ${b}`;
        return { html: rawText, rawText, value: val, tip: `${a} ÷ ${b} = ${val}` };
      }
    } else if (type === 'fractions') {
      const den = randChoice([3, 4, 5, 6, 7, 8, 9, 10, 12]);
      let num = randInt(1, den - 1);
      // Optional negative fraction
      const isNeg = Math.random() < 0.25;
      if (isNeg) num = -num;
      const val = num / den;
      const htmlStr = isNeg ? `-${formatFractionHTML(Math.abs(num), den)}` : formatFractionHTML(num, den);
      const rawText = `${num}/${den}`;
      return { html: htmlStr, rawText, value: val, tip: `${rawText} ≈ ${val.toFixed(3)}` };
    } else if (type === 'decimals') {
      const formatType = randChoice(['pure', 'mult', 'add']);
      if (formatType === 'pure') {
        // e.g. 0.345, 0.098, 0.41, -0.62
        const val = parseFloat(( (Math.random() * 2 - 0.5) * 1.5 ).toFixed(3));
        const rawText = val.toString();
        return { html: rawText, rawText, value: val, tip: `Decimal value = ${val}` };
      } else if (formatType === 'mult') {
        const a = parseFloat((randInt(1, 15) * 0.1).toFixed(1));
        const b = randChoice([0.2, 0.4, 0.5, 0.8, 1.2]);
        const val = parseFloat((a * b).toFixed(3));
        const rawText = `${a} × ${b}`;
        return { html: rawText, rawText, value: val, tip: `${a} × ${b} = ${val}` };
      } else { // add/sub
        const a = parseFloat((randInt(-10, 20) * 0.1).toFixed(1));
        const b = parseFloat((randInt(1, 15) * 0.1).toFixed(1));
        const val = parseFloat((a - b).toFixed(3));
        const rawText = `${a} - ${b}`;
        return { html: rawText, rawText, value: val, tip: `${a} - ${b} = ${val}` };
      }
    } else { // brackets / PEMDAS
      const pattern = randChoice([1, 2, 3]);
      if (pattern === 1) {
        const a = randInt(2, 6);
        const b = randInt(1, 8);
        const c = randInt(2, 4);
        const val = (a + b) * c;
        const rawText = `(${a} + ${b}) × ${c}`;
        return { html: rawText, rawText, value: val, tip: `(${a}+${b})×${c} = ${a+b}×${c} = ${val}` };
      } else if (pattern === 2) {
        const a = randInt(-10, 10);
        const b = randInt(2, 5);
        const c = randInt(2, 4);
        const val = a + (b * c);
        const rawText = a < 0 ? `(${a}) + (${b} × ${c})` : `${a} + (${b} × ${c})`;
        return { html: rawText, rawText, value: val, tip: `${a} + ${b*c} = ${val}` };
      } else {
        const a = randInt(10, 30);
        const b = randInt(2, 8);
        const c = randInt(2, 4);
        const val = (a - b) * c;
        const rawText = `(${a} - ${b}) × ${c}`;
        return { html: rawText, rawText, value: val, tip: `(${a}-${b})×${c} = ${val}` };
      }
    }
  }

  /**
   * Generates a question object containing 3 distinct mathematical expressions.
   * Guarantees all 3 numeric values are DIFFERENT so ascending order is unambiguous.
   */
  function generateQuestion(enabledTypes) {
    const activeTypes = [];
    if (enabledTypes.arithmetic) activeTypes.push('arithmetic');
    if (enabledTypes.fractions) activeTypes.push('fractions');
    if (enabledTypes.decimals) activeTypes.push('decimals');
    if (enabledTypes.brackets) activeTypes.push('brackets');
    
    if (activeTypes.length === 0) activeTypes.push('arithmetic');

    let expressions = [];
    let attempts = 0;
    while (attempts < 100) {
      attempts++;
      expressions = [];
      for (let i = 0; i < 3; i++) {
        expressions.push(generateSingleExpression(activeTypes));
      }

      // Check if all 3 numerical values differ by at least 0.01
      let isDistinct = true;
      for (let i = 0; i < expressions.length; i++) {
        for (let j = i + 1; j < expressions.length; j++) {
          if (Math.abs(expressions[i].value - expressions[j].value) <= 0.01) {
            isDistinct = false;
          }
        }
      }
      if (isDistinct) break; // Valid distinct 3 expressions!
    }

    // Determine correct ascending order of indices
    // Create copy with original index
    const indexed = expressions.map((item, idx) => ({ ...item, originalIndex: idx }));
    indexed.sort((a, b) => a.value - b.value);
    
    const correctIndicesOrder = indexed.map(item => item.originalIndex);

    return {
      expressions: expressions, // array of 3 objects
      correctIndicesOrder: correctIndicesOrder,
      sortedExpressions: indexed
    };
  }

  // Generate complete test paper of 25 questions
  function generateTestPaper() {
    const list = [];
    for (let i = 0; i < state.totalQuestions; i++) {
      list.push(generateQuestion(state.enabledTypes));
    }
    return list;
  }

  // --------------------------------------------------------------------------
  // UI RENDERERS & NAVIGATION
  // --------------------------------------------------------------------------

  function showView(viewName) {
    state.view = viewName;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }
  }

  // Start Screen Setup
  function initStartScreen() {
    showView('start');
  }

  // --------------------------------------------------------------------------
  // GAME ARENA FLOW
  // --------------------------------------------------------------------------

  function startAssessment() {
    // Read config settings
    const modeCard = document.querySelector('.mode-card.selected');
    state.mode = modeCard ? modeCard.getAttribute('data-mode') : 'exam';

    if (state.mode === 'custom') {
      const speedSelect = document.getElementById('select-timer-speed');
      state.timerDuration = parseInt(speedSelect.value, 10);
      
      const motionSelect = document.getElementById('select-bubble-motion');
      if (motionSelect) state.bubbleMotion = motionSelect.value;

      state.enabledTypes.arithmetic = document.getElementById('chk-arithmetic').checked;
      state.enabledTypes.fractions = document.getElementById('chk-fractions').checked;
      state.enabledTypes.decimals = document.getElementById('chk-decimals').checked;
      state.enabledTypes.brackets = document.getElementById('chk-brackets').checked;
    } else {
      // Standard Accenture Exam settings
      state.timerDuration = 12;
      state.bubbleMotion = 'floating'; // Dynamic drift floating in real exam pattern
      state.enabledTypes = { arithmetic: true, fractions: true, decimals: true, brackets: true };
    }

    updateMotionButtonLabel();

    state.totalQuestions = 25;
    state.currentQIndex = 0;
    state.questions = generateTestPaper();
    state.userAnswers = [];
    state.score = 0;
    state.streak = 0;

    showView('game');
    renderQuestion(0);
  }

  function stopBubblePhysics() {
    if (physicsReqId) {
      cancelAnimationFrame(physicsReqId);
      physicsReqId = null;
    }
    physicsBubbles = [];
  }

  function startBubblePhysics() {
    stopBubblePhysics();

    const stage = document.getElementById('bubble-stage');
    if (!stage) return;

    stage.className = `bubble-stage motion-${state.bubbleMotion}`;

    if (state.bubbleMotion !== 'floating') return;

    const bubbleElems = Array.from(stage.querySelectorAll('.bubble'));
    if (bubbleElems.length === 0) return;

    const stageRect = stage.getBoundingClientRect();
    const stageWidth = stageRect.width || 800;
    const stageHeight = stageRect.height || 300;

    // Dynamically query bubble diameter from DOM (defaulting to 130px)
    const sampleBubble = bubbleElems[0];
    const bubbleSize = sampleBubble ? (sampleBubble.offsetWidth || 130) : 130;

    // Divide stage into 3 horizontal zones to guarantee zero initial overlap
    const zoneWidth = stageWidth / Math.max(1, bubbleElems.length);

    bubbleElems.forEach((elem, idx) => {
      const padding = 10;
      const minX = idx * zoneWidth + padding;
      const maxX = Math.max(minX, (idx + 1) * zoneWidth - bubbleSize - padding);
      const startX = Math.random() * (maxX - minX) + minX;
      const startY = Math.random() * Math.max(10, stageHeight - bubbleSize - padding * 2) + padding;

      let vx = (Math.random() - 0.5) * 2.2;
      let vy = (Math.random() - 0.5) * 2.2;
      if (Math.abs(vx) < 0.6) vx = vx < 0 ? -0.8 : 0.8;
      if (Math.abs(vy) < 0.6) vy = vy < 0 ? -0.8 : 0.8;

      elem.style.left = `${startX}px`;
      elem.style.top = `${startY}px`;

      const obj = {
        elem: elem,
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        size: bubbleSize,
        isHovered: false
      };

      elem.addEventListener('mouseenter', () => { obj.isHovered = true; });
      elem.addEventListener('mouseleave', () => { obj.isHovered = false; });

      physicsBubbles.push(obj);
    });

    function updatePhysics() {
      const currentRect = stage.getBoundingClientRect();
      const currentWidth = currentRect.width || stageWidth;
      const currentHeight = currentRect.height || stageHeight;

      // 1. Move bubbles according to velocity
      physicsBubbles.forEach(b => {
        if (!b.elem || !b.elem.parentNode) return;

        // Query current size in case of window resize
        if (b.elem.offsetWidth) b.size = b.elem.offsetWidth;

        const speedMult = b.isHovered ? 0.35 : 1.0;
        b.x += b.vx * speedMult;
        b.y += b.vy * speedMult;
      });

      // 2. Pairwise circle-to-circle collision detection and response (No Overlapping!)
      for (let i = 0; i < physicsBubbles.length; i++) {
        for (let j = i + 1; j < physicsBubbles.length; j++) {
          const b1 = physicsBubbles[i];
          const b2 = physicsBubbles[j];
          if (!b1.elem || !b2.elem) continue;

          const r1 = b1.size / 2;
          const r2 = b2.size / 2;

          const c1x = b1.x + r1;
          const c1y = b1.y + r1;
          const c2x = b2.x + r2;
          const c2y = b2.y + r2;

          let dx = c2x - c1x;
          let dy = c2y - c1y;
          let dist = Math.hypot(dx, dy);
          const minDist = r1 + r2;

          if (dist < minDist) {
            if (dist === 0) {
              dx = 1;
              dy = 0;
              dist = 1;
            }

            const nx = dx / dist;
            const ny = dy / dist;

            // Immediately separate overlapping bubbles
            const overlap = minDist - dist;
            const separationX = nx * (overlap / 2 + 0.5);
            const separationY = ny * (overlap / 2 + 0.5);

            b1.x -= separationX;
            b1.y -= separationY;
            b2.x += separationX;
            b2.y += separationY;

            // Elastic 2D vector velocity response
            const rvx = b1.vx - b2.vx;
            const rvy = b1.vy - b2.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal > 0) {
              const restitution = 0.95;
              const impulse = (-(1 + restitution) * velAlongNormal) / 2;
              const impulseX = impulse * nx;
              const impulseY = impulse * ny;

              b1.vx += impulseX;
              b1.vy += impulseY;
              b2.vx -= impulseX;
              b2.vy -= impulseY;

              // Keep speeds smooth and gentle
              const capSpeed = (b) => {
                const spd = Math.hypot(b.vx, b.vy);
                if (spd < 0.6) {
                  b.vx = (b.vx >= 0 ? 0.6 : -0.6);
                  b.vy = (b.vy >= 0 ? 0.6 : -0.6);
                } else if (spd > 2.0) {
                  b.vx = (b.vx / spd) * 1.8;
                  b.vy = (b.vy / spd) * 1.8;
                }
              };
              capSpeed(b1);
              capSpeed(b2);
            }
          }
        }
      }

      // 3. Wall boundary collision and rendering
      physicsBubbles.forEach(b => {
        if (!b.elem || !b.elem.parentNode) return;

        const margin = 5;
        if (b.x <= margin) {
          b.x = margin;
          b.vx = Math.abs(b.vx);
        } else if (b.x >= currentWidth - b.size - margin) {
          b.x = Math.max(margin, currentWidth - b.size - margin);
          b.vx = -Math.abs(b.vx);
        }

        if (b.y <= margin) {
          b.y = margin;
          b.vy = Math.abs(b.vy);
        } else if (b.y >= currentHeight - b.size - margin) {
          b.y = Math.max(margin, currentHeight - b.size - margin);
          b.vy = -Math.abs(b.vy);
        }

        b.elem.style.left = `${b.x}px`;
        b.elem.style.top = `${b.y}px`;
      });

      if (state.view === 'game' && state.bubbleMotion === 'floating') {
        physicsReqId = requestAnimationFrame(updatePhysics);
      }
    }

    physicsReqId = requestAnimationFrame(updatePhysics);
  }

  function updateMotionButtonLabel() {
    const lbl = document.getElementById('lbl-motion-status');
    if (!lbl) return;

    if (state.bubbleMotion === 'floating') {
      lbl.textContent = 'Floating 2D';
    } else if (state.bubbleMotion === 'gentle') {
      lbl.textContent = 'Gentle Bob';
    } else {
      lbl.textContent = 'Static Grid';
    }
  }

  function renderQuestion(qIndex) {
    if (qIndex >= state.totalQuestions) {
      endAssessment();
      return;
    }

    state.currentQIndex = qIndex;
    state.selectedIndices = [];
    const qData = state.questions[qIndex];

    // Update HUD
    document.getElementById('hud-q-curr').textContent = qIndex + 1;
    document.getElementById('hud-q-total').textContent = state.totalQuestions;
    document.getElementById('hud-correct-count').textContent = state.score;
    document.getElementById('hud-streak-count').textContent = state.streak;

    // Render Selection Slots
    updateSelectionSlots();

    // Render Bubbles
    const stage = document.getElementById('bubble-stage');
    stage.innerHTML = '';

    qData.expressions.forEach((expr, idx) => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.setAttribute('data-index', idx);
      
      bubble.innerHTML = `
        <div class="bubble-inner">
          <div class="expression-text">${expr.html}</div>
        </div>
      `;

      bubble.addEventListener('click', () => handleBubbleClick(idx));
      stage.appendChild(bubble);
    });

    // Start 2D Physics float animation
    startBubblePhysics();

    // Start Timer
    startQuestionTimer();
  }

  function handleBubbleClick(clickedIdx) {
    const pos = state.selectedIndices.indexOf(clickedIdx);

    if (pos !== -1) {
      // Misclick Recovery: Already selected! Unselect it and shift back
      state.selectedIndices.splice(pos, 1);
      playSound('unselect');
    } else {
      // Select bubble
      if (state.selectedIndices.length < 3) {
        state.selectedIndices.push(clickedIdx);
        playSound('select');
      }
    }

    // Update Visuals
    updateBubbleSelectionVisuals();
    updateSelectionSlots();

    // Auto-submit when all 3 bubbles are selected
    if (state.selectedIndices.length === 3) {
      // Short delay for user to see selection then submit
      setTimeout(() => {
        submitAnswer(false);
      }, 250);
    }
  }

  function updateBubbleSelectionVisuals() {
    const bubbleElems = document.querySelectorAll('#bubble-stage .bubble');
    bubbleElems.forEach(elem => {
      const idx = parseInt(elem.getAttribute('data-index'), 10);
      const selPos = state.selectedIndices.indexOf(idx);

      // Remove existing badges
      const existingBadge = elem.querySelector('.bubble-badge');
      if (existingBadge) existingBadge.remove();

      if (selPos !== -1) {
        elem.classList.add('selected');
        // Add order badge pill (1, 2, or 3)
        const badge = document.createElement('div');
        badge.className = 'bubble-badge';
        badge.textContent = selPos + 1;
        elem.appendChild(badge);
      } else {
        elem.classList.remove('selected');
      }
    });
  }

  function updateSelectionSlots() {
    const currentQ = state.questions[state.currentQIndex];

    for (let slotNum = 1; slotNum <= 3; slotNum++) {
      const slotElem = document.getElementById(`slot-${slotNum}`);
      const valElem = document.getElementById(`slot-${slotNum}-val`);
      const selectedBubbleIdx = state.selectedIndices[slotNum - 1];

      if (slotElem && valElem) {
        if (selectedBubbleIdx !== undefined && currentQ) {
          slotElem.classList.add('filled');
          valElem.innerHTML = currentQ.expressions[selectedBubbleIdx].rawText;
        } else {
          slotElem.classList.remove('filled');
          valElem.textContent = '---';
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // TIMER ENGINE
  // --------------------------------------------------------------------------

  function startQuestionTimer() {
    clearInterval(state.timerInterval);
    const container = document.querySelector('.timer-container');
    const bar = document.getElementById('timer-ring-bar');
    const txt = document.getElementById('timer-seconds');
    
    container.classList.remove('warning', 'danger');

    if (state.timerDuration === 0) {
      // Untimed mode
      txt.textContent = '∞';
      bar.style.strokeDashoffset = '0';
      return;
    }

    state.timeRemaining = state.timerDuration;
    state.startTime = Date.now();
    txt.textContent = Math.ceil(state.timeRemaining);

    const circumference = 2 * Math.PI * 32; // 201.06

    state.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - state.startTime) / 1000;
      state.timeRemaining = Math.max(0, state.timerDuration - elapsed);

      const displaySec = Math.ceil(state.timeRemaining);
      txt.textContent = displaySec;

      // Update ring offset
      const progress = state.timeRemaining / state.timerDuration;
      const offset = circumference * (1 - progress);
      bar.style.strokeDashoffset = offset;

      // Color warnings
      if (state.timeRemaining <= 3) {
        container.classList.add('danger');
        container.classList.remove('warning');
        if (Math.abs(state.timeRemaining - Math.floor(state.timeRemaining)) < 0.1) {
          playSound('tick');
        }
      } else if (state.timeRemaining <= 6) {
        container.classList.add('warning');
      }

      // Timeout
      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        submitAnswer(true); // Timed out
      }
    }, 100);
  }

  // --------------------------------------------------------------------------
  // SUBMIT & SCORE LOGIC
  // --------------------------------------------------------------------------

  function submitAnswer(timedOut) {
    clearInterval(state.timerInterval);
    const qData = state.questions[state.currentQIndex];
    const timeSpent = state.timerDuration > 0 
      ? parseFloat((state.timerDuration - state.timeRemaining).toFixed(1))
      : parseFloat(((Date.now() - state.startTime) / 1000).toFixed(1));

    let isCorrect = false;

    if (!timedOut && state.selectedIndices.length === 3) {
      // Check if user's selected sequence matches correct ascending order
      isCorrect = state.selectedIndices.every((idxVal, i) => idxVal === qData.correctIndicesOrder[i]);
    }

    if (isCorrect) {
      state.score++;
      state.streak++;
      playSound('success');
    } else {
      state.streak = 0;
      playSound('error');
    }

    state.userAnswers.push({
      question: qData,
      selectedIndices: [...state.selectedIndices],
      correctIndices: qData.correctIndicesOrder,
      isCorrect: isCorrect,
      timeSpent: timeSpent,
      timedOut: timedOut
    });

    // Advance to next question
    renderQuestion(state.currentQIndex + 1);
  }

  // --------------------------------------------------------------------------
  // ACCENTURE SHORTLIST PREDICTOR & RESULT DASHBOARD
  // --------------------------------------------------------------------------

  function endAssessment() {
    clearInterval(state.timerInterval);
    playSound('fanfare');
    showView('result');

    const total = state.totalQuestions;
    const score = state.score;
    const accuracy = Math.round((score / total) * 100);

    // Calculate total time & average time per question
    const totalTime = state.userAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
    const avgTime = parseFloat((totalTime / total).toFixed(1));

    // Render Metrics
    document.getElementById('res-score').textContent = `${score} / ${total}`;
    document.getElementById('res-accuracy').textContent = `${accuracy}%`;
    document.getElementById('res-avg-time').textContent = `${avgTime}s`;

    // Speed efficiency rating
    let speedRating = 'Moderate';
    if (avgTime <= 7.0) speedRating = '⚡ Lightning Fast';
    else if (avgTime <= 9.5) speedRating = '🔥 Optimal Speed';
    else if (avgTime <= 11.5) speedRating = '⏱️ Average';
    else speedRating = '🐢 Slow';
    document.getElementById('res-speed-rating').textContent = speedRating;

    // Evaluate Accenture Shortlist Status & Probability
    evaluateShortlistProbability(score, accuracy, avgTime);

    // Render Question Review List
    renderQuestionReview('all');
  }

  /**
   * Calculates Accenture Cognitive Assessment Selection Probability
   * Criteria: 
   *  - Primary: Raw Score Cutoff (18 - 20+ out of 25)
   *  - Secondary: Speed Tie-Breaker
   */
  function evaluateShortlistProbability(score, accuracy, avgTime) {
    const banner = document.getElementById('shortlist-banner');
    const iconElem = document.getElementById('banner-icon');
    const pillElem = document.getElementById('status-pill');
    const titleElem = document.getElementById('shortlist-title');
    const descElem = document.getElementById('shortlist-desc');
    const probElem = document.getElementById('prob-percentage');

    const accuracyMsg = document.getElementById('algo-accuracy-msg');
    const speedMsg = document.getElementById('algo-speed-msg');

    banner.className = 'shortlist-banner';

    let probability = 0;
    let statusClass = '';
    let title = '';
    let desc = '';

    if (score >= 21) {
      // 21 - 25 Correct (84% - 100%) -> Strong Shortlist
      statusClass = 'status-high';
      // Base probability 90% + speed bonus
      probability = Math.min(99, 92 + (25 - score) + (avgTime <= 8 ? 4 : 1));
      title = 'SHORTLIST PROBABILITY: VERY HIGH (TOP TIER)';
      desc = `Outstanding performance! You scored ${score}/25 (${accuracy}%), exceeding Accenture's 18-20 correct threshold. You are in the top selection bracket.`;
      pillElem.textContent = 'HIGHLY LIKELY TO CLEAR';
      iconElem.innerHTML = '<i class="fa-solid fa-trophy"></i>';

      accuracyMsg.innerHTML = `Your score of <strong>${score}/25 (${accuracy}%)</strong> easily clears the sectional cutoff.`;
    } else if (score >= 18) {
      // 18 - 20 Correct (72% - 80%) -> Shortlisted
      statusClass = 'status-high';
      probability = Math.min(88, 75 + (score - 18) * 5 + (avgTime <= 8.5 ? 3 : 0));
      title = 'SHORTLIST PROBABILITY: HIGH';
      desc = `Great job! You scored ${score}/25 (${accuracy}%), hitting Accenture's target cognitive round cutoff range (18-20 correct).`;
      pillElem.textContent = 'SHORTLISTED';
      iconElem.innerHTML = '<i class="fa-solid fa-circle-check"></i>';

      accuracyMsg.innerHTML = `Your score of <strong>${score}/25 (${accuracy}%)</strong> meets the required sectional cutoff.`;
    } else if (score >= 15) {
      // 15 - 17 Correct (60% - 68%) -> Borderline
      statusClass = 'status-mid';
      probability = 35 + (score - 15) * 8 + (avgTime <= 7.5 ? 5 : 0);
      title = 'SHORTLIST PROBABILITY: BORDERLINE';
      desc = `You scored ${score}/25 (${accuracy}%). You are close to the 18-question target score, but selection will depend on batch-wide cutoffs.`;
      pillElem.textContent = 'BORDERLINE / UNCERTAIN';
      iconElem.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';

      accuracyMsg.innerHTML = `Your score of <strong>${score}/25</strong> is 1 to 3 points below the recommended 18+ threshold.`;
    } else {
      // < 15 Correct -> Low / Not Shortlisted
      statusClass = 'status-low';
      probability = Math.max(5, Math.round((score / 15) * 30));
      title = 'SHORTLIST PROBABILITY: LOW';
      desc = `You scored ${score}/25 (${accuracy}%). You are below Accenture's standard 18+ correct question target cutoff. Further practice is required.`;
      pillElem.textContent = 'NOT SHORTLISTED';
      iconElem.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';

      accuracyMsg.innerHTML = `Your score of <strong>${score}/25</strong> falls short of the sectional baseline requirement.`;
    }

    banner.classList.add(statusClass);
    titleElem.textContent = title;
    descElem.textContent = desc;
    probElem.textContent = `${probability}%`;

    // Speed message tie-breaker detail
    if (avgTime <= 7.5) {
      speedMsg.innerHTML = `Your fast average speed of <strong>${avgTime}s</strong> gives you a strong tie-breaker advantage against candidates with identical raw scores!`;
    } else if (avgTime <= 10.0) {
      speedMsg.innerHTML = `Your average pace of <strong>${avgTime}s</strong> per question is solid and keeps you well within the 12s budget.`;
    } else {
      speedMsg.innerHTML = `Your average pace of <strong>${avgTime}s</strong> is close to the 12s limit. Practicing mental shortcuts will boost your speed efficiency.`;
    }
  }

  // Render question-by-question breakdown list
  function renderQuestionReview(filter) {
    const listElem = document.getElementById('review-list');
    listElem.innerHTML = '';

    state.userAnswers.forEach((ans, idx) => {
      if (filter === 'correct' && !ans.isCorrect) return;
      if (filter === 'incorrect' && ans.isCorrect) return;

      const card = document.createElement('div');
      card.className = `review-item ${ans.isCorrect ? 'correct-item' : 'incorrect-item'}`;

      let statusTag = '';
      if (ans.isCorrect) {
        statusTag = `<span class="review-status-tag correct"><i class="fa-solid fa-check"></i> Correct (${ans.timeSpent}s)</span>`;
      } else if (ans.timedOut) {
        statusTag = `<span class="review-status-tag timeout"><i class="fa-solid fa-clock"></i> Timed Out</span>`;
      } else {
        statusTag = `<span class="review-status-tag incorrect"><i class="fa-solid fa-xmark"></i> Incorrect (${ans.timeSpent}s)</span>`;
      }

      // Render 3 expressions with rank order
      let exprGridHTML = '';
      ans.question.expressions.forEach((expr, exprIdx) => {
        // Find user selected rank (1, 2, or 3)
        const userRankIdx = ans.selectedIndices.indexOf(exprIdx);
        const userRank = userRankIdx !== -1 ? userRankIdx + 1 : '-';

        // Find correct rank
        const correctRankIdx = ans.question.correctIndicesOrder.indexOf(exprIdx);
        const correctRank = correctRankIdx + 1;

        exprGridHTML += `
          <div class="expr-box">
            <div class="rank-badge user-rank" title="Correct order: #${correctRank}">${correctRank}</div>
            <div class="expr-code">${expr.rawText}</div>
            <div class="expr-val">Val: ${expr.value.toFixed(2)}</div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="review-item-header">
          <span class="review-q-num">Question ${idx + 1}</span>
          ${statusTag}
        </div>
        <div class="review-expressions-grid">
          ${exprGridHTML}
        </div>
      `;

      listElem.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS & SETUP
  // --------------------------------------------------------------------------

  function setupEventListeners() {
    // Start Game Button
    document.getElementById('btn-start-game').addEventListener('click', startAssessment);

    // Restart / Home Buttons
    document.getElementById('btn-restart-game').addEventListener('click', startAssessment);
    document.getElementById('btn-home-screen').addEventListener('click', () => initStartScreen());
    document.getElementById('btn-quit-game').addEventListener('click', () => {
      if (confirm('Are you sure you want to quit this practice session?')) {
        clearInterval(state.timerInterval);
        initStartScreen();
      }
    });

    // Mode Selector toggle
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', function () {
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        const customPanel = document.getElementById('custom-options');
        if (this.getAttribute('data-mode') === 'custom') {
          customPanel.classList.remove('hidden');
        } else {
          customPanel.classList.add('hidden');
        }
      });
    });

    // Review Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.getAttribute('data-filter');
        renderQuestionReview(filter);
      });
    });

    // Motion toggle button (Floating 2D -> Gentle Bob -> Static)
    const motionBtn = document.getElementById('btn-motion-toggle');
    if (motionBtn) {
      motionBtn.addEventListener('click', () => {
        if (state.bubbleMotion === 'floating') {
          state.bubbleMotion = 'gentle';
        } else if (state.bubbleMotion === 'gentle') {
          state.bubbleMotion = 'static';
        } else {
          state.bubbleMotion = 'floating';
        }
        updateMotionButtonLabel();
        
        // Sync custom select if present
        const motionSelect = document.getElementById('select-bubble-motion');
        if (motionSelect) motionSelect.value = state.bubbleMotion;

        // Restart physics for current view if in game
        if (state.view === 'game') {
          startBubblePhysics();
        }
      });
    }

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundBtn.innerHTML = state.soundEnabled 
        ? '<i class="fa-solid fa-volume-high"></i>' 
        : '<i class="fa-solid fa-volume-xmark text-danger"></i>';
    });

    // Modal Shortcuts
    const modal = document.getElementById('modal-shortcuts');
    document.getElementById('btn-shortcuts').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('btn-close-shortcuts').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('btn-got-it').addEventListener('click', () => modal.classList.add('hidden'));
  }

  // Initialize App on DOM Load
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initStartScreen();
  });

})();
