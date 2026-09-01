/**
 * MediaPipe Hand Gesture Recognition Engine for Presentation Control
 */

class GestureEngine {
    constructor(config = {}) {
        this.videoElement = config.videoElement;
        this.canvasElement = config.canvasElement;
        this.canvasCtx = this.canvasElement ? this.canvasElement.getContext('2d') : null;
        
        // Callbacks
        this.onGestureDetected = config.onGestureDetected || (() => {});
        this.onLaserMove = config.onLaserMove || (() => {});
        this.onDrawMove = config.onDrawMove || (() => {});

        // Gesture Detection Settings
        this.cooldownMs = config.cooldownMs || 700; // 700ms debounce for actions
        this.lastGestureTime = 0;
        this.isTracking = false;
        this.currentGesture = 'NONE';
        
        // Swipe Tracking Buffer
        this.handPosHistory = [];
        this.historySize = 6;

        this.hands = null;
        this.camera = null;
    }

    async init() {
        if (!window.Hands || !window.Camera) {
            console.error("MediaPipe libraries not loaded!");
            return false;
        }

        this.hands = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults((results) => this.processResults(results));

        this.camera = new window.Camera(this.videoElement, {
            onFrame: async () => {
                if (this.isTracking) {
                    await this.hands.send({ image: this.videoElement });
                }
            },
            width: 640,
            height: 480
        });

        return true;
    }

    async start() {
        if (!this.camera) await this.init();
        this.isTracking = true;
        await this.camera.start();
    }

    stop() {
        this.isTracking = false;
        if (this.camera) {
            this.camera.stop();
        }
        if (this.canvasCtx) {
            this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }
    }

    processResults(results) {
        if (!this.canvasCtx) return;

        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Draw hand skeleton visualization
            this.drawHandSkeleton(landmarks);

            // Analyze Gestures
            this.classifyGesture(landmarks);
        } else {
            this.onGestureDetected({ gesture: 'NONE', label: 'No Hand', icon: '🖐' });
            this.onLaserMove({ active: false });
            this.onDrawMove({ active: false });
        }

        this.canvasCtx.restore();
    }

    drawHandSkeleton(landmarks) {
        const ctx = this.canvasCtx;

        // Draw connections
        if (window.drawConnectors && window.HAND_CONNECTIONS) {
            window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                color: '#6366f1',
                lineWidth: 3
            });
        }

        // Draw landmark dots
        if (window.drawLandmarks) {
            window.drawLandmarks(ctx, landmarks, {
                color: '#06b6d4',
                fillColor: '#ffffff',
                lineWidth: 1,
                radius: 4
            });
        }
    }

    classifyGesture(landmarks) {
        const now = Date.now();
        
        // 21 Keypoints reference:
        // 0: Wrist, 4: Thumb, 8: Index, 12: Middle, 16: Ring, 20: Pinky
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];
        const middleTip = landmarks[12];
        const middlePip = landmarks[10];
        const ringTip = landmarks[16];
        const ringPip = landmarks[14];
        const pinkyTip = landmarks[20];
        const pinkyPip = landmarks[18];

        // Finger open checks (y is smaller when finger is raised higher)
        const isIndexOpen = indexTip.y < indexPip.y;
        const isMiddleOpen = middleTip.y < middlePip.y;
        const isRingOpen = ringTip.y < ringPip.y;
        const isPinkyOpen = pinkyTip.y < pinkyPip.y;

        // Calculate thumb to index pinch distance
        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const pinchDist = Math.sqrt(dx * dx + dy * dy);

        // 1. Pinch Draw Gesture: Index & Thumb pinched together (< 0.065)
        if (pinchDist < 0.065) {
            const drawX = 1 - indexTip.x; // invert horizontal for mirrored webcam
            const drawY = indexTip.y;
            this.onDrawMove({ active: true, x: drawX, y: drawY });
            this.onLaserMove({ active: false });

            this.onGestureDetected({
                gesture: 'DRAW',
                label: 'Slide Drawing Active',
                icon: '✏️'
            });
            return;
        } else {
            this.onDrawMove({ active: false });
        }

        // 2. Virtual Laser Pointer: Only Index finger is open
        if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
            const laserX = 1 - indexTip.x;
            const laserY = indexTip.y;
            
            this.onLaserMove({ active: true, x: laserX, y: laserY });
            
            this.onGestureDetected({
                gesture: 'LASER',
                label: 'Laser Pointer Active',
                icon: '☝'
            });
        } else {
            this.onLaserMove({ active: false });
        }

        // Check Debounce Cooldown for action-triggering gestures
        if (now - this.lastGestureTime < this.cooldownMs) {
            return;
        }

        // 3. Victory / Peace Gesture (✌️): Index & Middle open, Ring & Pinky closed
        if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen) {
            // Check if fingers form V shape (separated in X axis)
            if (Math.abs(indexTip.x - middleTip.x) > 0.03) {
                this.triggerGesture('VICTORY', 'Victory Celebration! 🎉', '✌️');
                return;
            }
        }

        // 4. Thumbs Up Gesture (👍): Thumb tip is significantly above wrist, all other fingers closed
        if (thumbTip.y < wrist.y - 0.2 && !isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
            this.triggerGesture('THUMBS_UP', 'Awesome Reaction! 🔥', '👍');
            return;
        }

        // 5. Closed Fist Gesture (✊): All fingers folded -> Clear Drawing
        if (!isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen && thumbTip.y > indexPip.y) {
            this.triggerGesture('FIST', 'Clear Canvas 🗑️', '✊');
            return;
        }

        // 6. Horizontal motion history buffer for Swipe Gestures
        this.handPosHistory.push({ x: indexTip.x, time: now });
        if (this.handPosHistory.length > this.historySize) {
            this.handPosHistory.shift();
        }

        if (this.handPosHistory.length >= 4) {
            const firstPos = this.handPosHistory[0];
            const lastPos = this.handPosHistory[this.handPosHistory.length - 1];
            const deltaX = lastPos.x - firstPos.x;
            const deltaTime = lastPos.time - firstPos.time;

            if (Math.abs(deltaX) > 0.15 && deltaTime < 600) {
                if (deltaX < -0.15) {
                    this.triggerGesture('NEXT_SLIDE', 'Next Slide', '👉');
                    return;
                } else if (deltaX > 0.15) {
                    this.triggerGesture('PREV_SLIDE', 'Previous Slide', '👈');
                    return;
                }
            }
        }

        // 7. Static Finger Pointing Gestures (Left / Right)
        if (isIndexOpen && isMiddleOpen) {
            if (indexTip.x < wrist.x - 0.15) {
                this.triggerGesture('NEXT_SLIDE', 'Next Slide', '👉');
                return;
            } else if (indexTip.x > wrist.x + 0.15) {
                this.triggerGesture('PREV_SLIDE', 'Previous Slide', '👈');
                return;
            }
        }

        // 8. Open Palm Gesture -> Neutral / Stop
        if (isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen) {
            this.onGestureDetected({
                gesture: 'PALM',
                label: 'Neutral Palm',
                icon: '🖐'
            });
        }
    }

    triggerGesture(gesture, label, icon) {
        this.lastGestureTime = Date.now();
        this.handPosHistory = [];
        this.onGestureDetected({ gesture, label, icon, triggered: true });
    }
}

window.GestureEngine = GestureEngine;
