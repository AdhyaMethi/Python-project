/**
 * App.js - Main Controller for Flask Hand Gesture Presentation App with Interactive Features
 */

// Web Audio API Sound Synthesizer (Zero External Audio Files Needed)
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
    }

    playSwoosh() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playLaserChirp() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playPop() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
    }

    playCelebration() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = this.ctx.currentTime + (idx * 0.08);
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const soundFx = new SoundFX();

    // UI Elements
    const presTitle = document.getElementById('presTitle');
    const slideCounterBadge = document.getElementById('slideCounterBadge');
    const slideImage = document.getElementById('slideImage');
    const laserDot = document.getElementById('laserDot');
    const thumbnailsBar = document.getElementById('thumbnailsBar');

    const toggleCamBtn = document.getElementById('toggleCamBtn');
    const camBtnText = document.getElementById('camBtnText');
    const pipStatusDot = document.getElementById('pipStatusDot');

    const prevSlideBtn = document.getElementById('prevSlideBtn');
    const nextSlideBtn = document.getElementById('nextSlideBtn');

    const hudIcon = document.getElementById('hudIcon');
    const hudGestureName = document.getElementById('hudGestureName');

    const actionToast = document.getElementById('actionToast');
    const toastMsg = document.getElementById('toastMsg');

    const webcamVideo = document.getElementById('webcamVideo');
    const handCanvas = document.getElementById('handCanvas');
    const viewportContainer = document.getElementById('viewportContainer');

    // Interactive Toolbar Elements
    const soundFxBtn = document.getElementById('soundFxBtn');
    const soundFxText = document.getElementById('soundFxText');

    const timerDisplay = document.getElementById('timerDisplay');
    const timerToggleBtn = document.getElementById('timerToggleBtn');
    const timerResetBtn = document.getElementById('timerResetBtn');

    const drawModeBtn = document.getElementById('drawModeBtn');
    const drawModeStatus = document.getElementById('drawModeStatus');
    const colorPalette = document.getElementById('colorPalette');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const particlesContainer = document.getElementById('particlesContainer');

    // Modals
    const uploadModalBtn = document.getElementById('uploadModalBtn');
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const helpModalBtn = document.getElementById('helpModalBtn');

    const uploadModal = document.getElementById('uploadModal');
    const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadStatusText = document.getElementById('uploadStatusText');

    const helpModal = document.getElementById('helpModal');
    const closeHelpModalBtn = document.getElementById('closeHelpModalBtn');

    // State Variables
    let presentationState = {
        id: 'demo',
        title: 'Gesture Control Demo Presentation',
        slides: [],
        current_index: 0,
        total_slides: 0
    };

    let gestureEngine = null;
    let toastTimeout = null;
    let isDrawModeActive = false;
    let currentDrawColor = '#ef4444';
    let isMouseDrawing = false;
    let lastDrawPos = null;

    // Timer state
    let timerSeconds = 0;
    let timerInterval = null;

    // 1. Initialize Drawing Canvas Context
    const drawCtx = drawingCanvas ? drawingCanvas.getContext('2d') : null;
    resizeDrawingCanvas();
    window.addEventListener('resize', resizeDrawingCanvas);

    function resizeDrawingCanvas() {
        if (!drawingCanvas || !viewportContainer) return;
        drawingCanvas.width = viewportContainer.clientWidth;
        drawingCanvas.height = viewportContainer.clientHeight;
    }

    // 2. Sound FX Toggle
    if (soundFxBtn) {
        soundFxBtn.addEventListener('click', () => {
            soundFx.enabled = !soundFx.enabled;
            if (soundFxText) soundFxText.textContent = soundFx.enabled ? 'Sound ON' : 'Sound OFF';
            soundFxBtn.style.opacity = soundFx.enabled ? '1' : '0.5';
        });
    }

    // 3. Interactive Presentation Timer
    if (timerToggleBtn) {
        timerToggleBtn.addEventListener('click', () => {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerToggleBtn.textContent = '▶️';
            } else {
                timerInterval = setInterval(() => {
                    timerSeconds++;
                    updateTimerUI();
                }, 1000);
                timerToggleBtn.textContent = '⏸️';
            }
        });
    }

    if (timerResetBtn) {
        timerResetBtn.addEventListener('click', () => {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
                if (timerToggleBtn) timerToggleBtn.textContent = '▶️';
            }
            timerSeconds = 0;
            updateTimerUI();
        });
    }

    function updateTimerUI() {
        if (!timerDisplay) return;
        const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
        const secs = String(timerSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }

    // 4. Drawing Annotations Palette & Mouse Handler
    if (colorPalette) {
        const pills = colorPalette.querySelectorAll('.color-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentDrawColor = pill.getAttribute('data-color') || '#ef4444';
            });
        });
    }

    if (drawModeBtn) {
        drawModeBtn.addEventListener('click', () => {
            isDrawModeActive = !isDrawModeActive;
            if (drawModeStatus) drawModeStatus.textContent = isDrawModeActive ? 'ON' : 'OFF';
            drawModeBtn.classList.toggle('btn-primary', isDrawModeActive);
            if (drawingCanvas) drawingCanvas.classList.toggle('active', isDrawModeActive);
            showActionToast(isDrawModeActive ? '✏️ Draw Mode ON' : '✏️ Draw Mode OFF');
        });
    }

    if (clearCanvasBtn) clearCanvasBtn.addEventListener('click', clearDrawingCanvas);

    function clearDrawingCanvas() {
        if (drawCtx && drawingCanvas) {
            drawCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            showActionToast('🗑️ Cleared Slide Notes');
        }
    }

    // Mouse Drawing Fallback
    if (drawingCanvas) {
        drawingCanvas.addEventListener('mousedown', (e) => {
            if (!isDrawModeActive) return;
            isMouseDrawing = true;
            const rect = drawingCanvas.getBoundingClientRect();
            lastDrawPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        });

        drawingCanvas.addEventListener('mousemove', (e) => {
            if (!isDrawModeActive || !isMouseDrawing || !lastDrawPos) return;
            const rect = drawingCanvas.getBoundingClientRect();
            const currPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

            drawStroke(lastDrawPos, currPos, currentDrawColor);
            lastDrawPos = currPos;
        });

        drawingCanvas.addEventListener('mouseup', () => { isMouseDrawing = false; lastDrawPos = null; });
        drawingCanvas.addEventListener('mouseleave', () => { isMouseDrawing = false; lastDrawPos = null; });
    }

    function drawStroke(p1, p2, color) {
        if (!drawCtx) return;
        drawCtx.save();
        drawCtx.beginPath();
        drawCtx.moveTo(p1.x, p1.y);
        drawCtx.lineTo(p2.x, p2.y);
        drawCtx.strokeStyle = color;
        drawCtx.lineWidth = 4;
        drawCtx.lineCap = 'round';
        drawCtx.shadowColor = color;
        drawCtx.shadowBlur = 8;
        drawCtx.stroke();
        drawCtx.restore();
    }

    // 5. Floating Reaction Emoji Particles
    const reactionBtns = document.querySelectorAll('.reaction-btn');
    reactionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.getAttribute('data-emoji') || '🔥';
            spawnFloatingParticles(emoji, 6);
            soundFx.playPop();
        });
    });

    function spawnFloatingParticles(emoji, count = 5) {
        if (!particlesContainer) return;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'floating-particle';
            p.textContent = emoji;

            const leftPos = 10 + Math.random() * 80;
            p.style.left = `${leftPos}%`;
            p.style.bottom = `${5 + Math.random() * 15}%`;
            p.style.animationDelay = `${Math.random() * 0.3}s`;

            particlesContainer.appendChild(p);
            setTimeout(() => { p.remove(); }, 2000);
        }
    }

    // 6. Gesture Engine Initialization
    if (window.GestureEngine) {
        gestureEngine = new GestureEngine({
            videoElement: webcamVideo,
            canvasElement: handCanvas,
            onGestureDetected: (data) => handleGestureDetected(data),
            onLaserMove: (data) => handleLaserMove(data),
            onDrawMove: (data) => handleHandDrawMove(data)
        });
    }

    // 7. Fetch Presentation Slides
    fetchSlides();

    async function fetchSlides() {
        try {
            const res = await fetch('/api/slides');
            const data = await res.json();
            if (data.status === 'success' && data.presentation) {
                presentationState = data.presentation;
                renderPresentation();
            }
        } catch (err) {
            console.error('Error fetching presentation slides:', err);
        }
    }

    function renderPresentation() {
        if (!presentationState.slides || presentationState.slides.length === 0) return;

        const currentIdx = presentationState.current_index;
        const total = presentationState.total_slides;
        const currentSlideUrl = presentationState.slides[currentIdx];

        if (presTitle) presTitle.textContent = presentationState.title || 'Presentation';
        if (slideCounterBadge) slideCounterBadge.textContent = `Slide ${currentIdx + 1} / ${total}`;

        if (slideImage) {
            slideImage.classList.add('changing');
            setTimeout(() => {
                slideImage.src = currentSlideUrl;
                slideImage.classList.remove('changing');
            }, 100);
        }

        renderThumbnails();
    }

    function renderThumbnails() {
        if (!thumbnailsBar) return;
        thumbnailsBar.innerHTML = '';

        presentationState.slides.forEach((url, idx) => {
            const card = document.createElement('div');
            card.className = `thumb-card ${idx === presentationState.current_index ? 'active' : ''}`;
            card.innerHTML = `
                <img src="${url}" alt="Thumbnail ${idx + 1}">
                <span class="thumb-number">${idx + 1}</span>
            `;
            card.addEventListener('click', () => {
                navigateSlide('goto', idx);
            });

            thumbnailsBar.appendChild(card);
        });

        const activeCard = thumbnailsBar.children[presentationState.current_index];
        if (activeCard) {
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    async function navigateSlide(action, targetIdx = null) {
        try {
            const res = await fetch('/api/navigate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action, index: targetIdx })
            });

            const data = await res.json();
            if (data.status === 'success' && data.presentation) {
                presentationState = data.presentation;
                renderPresentation();
                soundFx.playSwoosh();
            }
        } catch (err) {
            console.error('Navigation error:', err);
        }
    }

    // 8. Gesture Callbacks Handling
    function handleGestureDetected(data) {
        if (hudIcon) hudIcon.textContent = data.icon || '🖐';
        if (hudGestureName) hudGestureName.textContent = data.label || 'Neutral';

        if (data.triggered) {
            if (data.gesture === 'NEXT_SLIDE') {
                navigateSlide('next');
                showActionToast('👉 Next Slide');
            } else if (data.gesture === 'PREV_SLIDE') {
                navigateSlide('prev');
                showActionToast('👈 Previous Slide');
            } else if (data.gesture === 'VICTORY') {
                if (window.confetti) {
                    window.confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
                }
                soundFx.playCelebration();
                showActionToast('✌️ Victory Celebration! 🎉');
            } else if (data.gesture === 'THUMBS_UP') {
                spawnFloatingParticles('👍', 6);
                spawnFloatingParticles('🔥', 4);
                soundFx.playPop();
                showActionToast('👍 Awesome Reaction!');
            } else if (data.gesture === 'FIST') {
                clearDrawingCanvas();
            }
        }
    }

    function handleLaserMove(data) {
        if (!laserDot) return;
        if (data.active) {
            laserDot.style.display = 'block';
            const posX = Math.max(2, Math.min(98, data.x * 100));
            const posY = Math.max(2, Math.min(98, data.y * 100));
            laserDot.style.left = `${posX}%`;
            laserDot.style.top = `${posY}%`;
        } else {
            laserDot.style.display = 'none';
        }
    }

    let lastHandDrawPos = null;
    function handleHandDrawMove(data) {
        if (!drawingCanvas) return;
        if (data.active) {
            if (!isDrawModeActive) {
                isDrawModeActive = true;
                if (drawModeStatus) drawModeStatus.textContent = 'ON';
                if (drawModeBtn) drawModeBtn.classList.add('btn-primary');
                if (drawingCanvas) drawingCanvas.classList.add('active');
            }

            const canvasW = drawingCanvas.width;
            const canvasH = drawingCanvas.height;
            const currPos = { x: data.x * canvasW, y: data.y * canvasH };

            if (lastHandDrawPos) {
                drawStroke(lastHandDrawPos, currPos, currentDrawColor);
            }
            lastHandDrawPos = currPos;
        } else {
            lastHandDrawPos = null;
        }
    }

    function showActionToast(msg) {
        if (!actionToast || !toastMsg) return;
        toastMsg.textContent = msg;
        actionToast.style.display = 'block';
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            if (actionToast) actionToast.style.display = 'none';
        }, 1200);
    }

    // Navigation Buttons
    if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => navigateSlide('prev'));
    if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => navigateSlide('next'));

    // Webcam Toggle Button
    if (toggleCamBtn && gestureEngine) {
        toggleCamBtn.addEventListener('click', async () => {
            if (!gestureEngine.isTracking) {
                const started = await gestureEngine.start();
                if (started !== false) {
                    if (camBtnText) camBtnText.textContent = 'Stop Camera';
                    toggleCamBtn.classList.remove('btn-primary');
                    toggleCamBtn.classList.add('btn-danger');
                    if (pipStatusDot) pipStatusDot.classList.add('active');
                }
            } else {
                gestureEngine.stop();
                if (camBtnText) camBtnText.textContent = 'Start Camera';
                toggleCamBtn.classList.remove('btn-danger');
                toggleCamBtn.classList.add('btn-primary');
                if (pipStatusDot) pipStatusDot.classList.remove('active');
                if (hudIcon) hudIcon.textContent = '🖐';
                if (hudGestureName) hudGestureName.textContent = 'Camera Off';
                if (laserDot) laserDot.style.display = 'none';
            }
        });
    }

    // Reset Demo Button
    if (resetDemoBtn) {
        resetDemoBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/reset_demo', { method: 'POST' });
                const data = await res.json();
                if (data.status === 'success' && data.presentation) {
                    presentationState = data.presentation;
                    renderPresentation();
                    clearDrawingCanvas();
                    showActionToast('🔄 Loaded Demo Deck');
                }
            } catch (err) {
                console.error('Reset demo error:', err);
            }
        });
    }

    // Fullscreen Toggle
    if (fullscreenBtn && viewportContainer) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                if (viewportContainer.requestFullscreen) {
                    viewportContainer.requestFullscreen();
                } else if (viewportContainer.webkitRequestFullscreen) {
                    viewportContainer.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    }

    // File Upload Modal
    if (uploadModalBtn) uploadModalBtn.addEventListener('click', () => uploadModal.style.display = 'flex');
    if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', () => uploadModal.style.display = 'none');

    if (dropzone) {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#6366f1'; });
        dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'rgba(99, 102, 241, 0.5)');
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'rgba(99, 102, 241, 0.5)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }

    async function handleFileUpload(file) {
        if (!uploadStatus || !uploadStatusText) return;
        uploadStatus.style.display = 'block';
        uploadStatusText.textContent = `Processing "${file.name}"... Converting slides.`;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.status === 'success' && data.presentation) {
                presentationState = data.presentation;
                renderPresentation();
                clearDrawingCanvas();
                uploadModal.style.display = 'none';
                uploadStatus.style.display = 'none';
                showActionToast(`📄 Loaded "${file.name}"`);
            } else {
                uploadStatusText.textContent = data.message || 'Error processing presentation.';
            }
        } catch (err) {
            console.error('Upload error:', err);
            uploadStatusText.textContent = 'Upload failed due to network or server error.';
        }
    }

    // Help Modal
    if (helpModalBtn) helpModalBtn.addEventListener('click', () => helpModal.style.display = 'flex');
    if (closeHelpModalBtn) closeHelpModalBtn.addEventListener('click', () => helpModal.style.display = 'none');

    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) uploadModal.style.display = 'none';
        if (e.target === helpModal) helpModal.style.display = 'none';
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            navigateSlide('next');
            showActionToast('👉 Next Slide');
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateSlide('prev');
            showActionToast('👈 Previous Slide');
        } else if (e.key === 'f' || e.key === 'F') {
            if (fullscreenBtn) fullscreenBtn.click();
        } else if (e.key === 'c' || e.key === 'C') {
            clearDrawingCanvas();
        }
    });
});
