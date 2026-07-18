/**
 * Premium Camera Manager
 * Handles camera capture with 9:16 aspect ratio in a full-screen popup.
 */
// i18n t() function is provided globally by i18n.js
const CameraManager = {
    stream: null,
    scanner: null,
    isScannerReady: false,
    activeCamera: 'environment', // default to back camera
    documentMode: false,
    onCapture: null,

    init: function () {
        if ($('#camera_popup').length) return;

        const html = `
            <div id="camera_popup" class="camera-popup">
                <button class="close-camera-btn" id="close_camera_btn">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="camera-preview-container">
                    <video id="camera_video" autoplay playsinline></video>
                    <img id="camera_captured_preview" alt="Captured Preview">
                    
                    <!-- Stabilizer Aids -->
                    <div class="camera-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                    <div class="scan-line"></div>
                    
                    <div class="camera-overlay"></div>
                    <div class="camera-loading" id="camera_loading">
                        <div class="spinner"></div>
                        <span>${t('common.camera_loading')}</span>
                    </div>
                </div>

                <div class="camera-popup-controls">
                    <button class="camera-btn capture-btn" id="capture_camera_btn" title="${t('common.capture')}">
                        <i class="fas fa-camera"></i>
                    </button>

                    <button class="camera-btn retake-btn" id="retake_camera_btn" title="${t('common.retake')}">
                        <i class="fas fa-redo"></i>
                    </button>

                    <button class="camera-btn confirm-btn" id="confirm_camera_btn" title="${t('common.confirm')}">
                        <i class="fas fa-check"></i>
                    </button>

                    <button class="camera-btn toggle-doc-btn" id="toggle_doc_btn" title="وضع المستند">
                        <i class="fas fa-file-alt"></i>
                    </button>
                </div>
                
                <canvas id="camera_canvas" style="display: none;"></canvas>
                <!-- Dedicated overlay for detection lines -->
                <div class="camera-detection-overlay">
                    <svg class="detection-svg" style="display: none;">
                        <line id="dl1"></line><line id="dl2"></line><line id="dl3"></line><line id="dl4"></line>
                    </svg>
                </div>
            </div>
        `;

        $('body').append(html);
        this.bindEvents();
        this.loadScanner();
    },

    loadScanner: function () {
        if (typeof jscanify !== 'undefined') {
            this.scanner = new jscanify();
            this.isScannerReady = true;
            return;
        }

        // Load jscanify from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jscanify@1.2.0/src/jscanify.min.js';
        script.onload = () => {
            // jscanify depends on OpenCV.js which it loads automatically usually, 
            // but we might need to wait for it.
            this.scanner = new jscanify();
            this.isScannerReady = true;
            console.log("🚀 Scanner Engine Ready");
        };
        document.head.appendChild(script);
    },

    bindEvents: function () {
        $('#close_camera_btn').on('click', () => this.close());
        $('#capture_camera_btn').on('click', () => this.capture());
        $('#retake_camera_btn').on('click', () => this.retake());
        $('#confirm_camera_btn').on('click', () => this.confirm());
        $('#toggle_doc_btn').on('click', () => this.toggleDocumentMode());
    },

    open: function () {
        return new Promise((resolve) => {
            this.init();
            this.onCapture = resolve;
            $('#camera_popup').addClass('active').removeClass('preview-mode');
            $('#camera_captured_preview').hide();
            $('#camera_video').show();
            this.startStream();
            this.startStabilizer();
        });
    },

    startStream: async function () {
        $('#camera_loading').css('display', 'flex');

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        try {
            const constraints = {
                video: {
                    facingMode: { ideal: this.activeCamera },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    // Advanced focus and clarity constraints
                    focusMode: 'continuous',
                    exposureMode: 'continuous',
                    whiteBalanceMode: 'continuous'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('camera_video');
            video.srcObject = this.stream;

            // Keep natural colors for better detection and visibility
            $(video).css({
                'image-rendering': 'crisp-edges'
            });

            // Mirror if front camera
            if (this.activeCamera === 'user') {
                $(video).addClass('mirrored');
            } else {
                $(video).removeClass('mirrored');
            }

            video.onloadedmetadata = () => {
                $('#camera_loading').hide();
                video.play();
                
                // Try to apply advanced track settings if supported
                const track = this.stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities ? track.getCapabilities() : {};
                
                // Enable torch/focus if possible (optional but helpful)
                if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
                    track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
                }

                // Start detection loop if document mode is on
                this.startDetectionLoop();
            };
        } catch (err) {
            console.error('Camera Access Error:', err);
            showToast(t('toast.error') + ': ' + err.message, 'error');
            this.close();
        }
    },

    capture: function () {
        const video = document.getElementById('camera_video');
        const canvas = document.getElementById('camera_canvas');
        const preview = document.getElementById('camera_captured_preview');

        // Set canvas size to match video with 9:16 crop
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Target 9:16
        let targetWidth, targetHeight, startX, startY;

        if (videoHeight / videoWidth > 16 / 9) {
            // Video is taller than 9:16
            targetWidth = videoWidth;
            targetHeight = videoWidth * (16 / 9);
            startX = 0;
            startY = (videoHeight - targetHeight) / 2;
        } else {
            // Video is wider than 9:16 (usual case)
            targetHeight = videoHeight;
            targetWidth = videoHeight * (9 / 16);
            startX = (videoWidth - targetWidth) / 2;
            startY = 0;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');

        // Mirror if needed
        if (this.activeCamera === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, startX, startY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

        // Apply Image Sharpening (Anti-Blur Filter)
        if (this.documentMode) {
            // Document mode: High contrast, grayscale, and sharpening
            ctx.filter = 'grayscale(1) contrast(1.5) brightness(1.1) sharp(1)';
            // Note: sharp() isn't a standard filter, using contrast/brightness for effect
            ctx.filter = 'grayscale(1) contrast(1.8) brightness(1.1)';
        } else {
            ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.05)';
        }
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';

        const imageData = canvas.toDataURL('image/jpeg', 0.95); // High quality
        preview.src = imageData;

        if (this.documentMode) {
            this.autoProcessDocument(canvas);
        } else {
            $(preview).show();
            $(video).hide();
            $('#camera_popup').addClass('preview-mode');
        }

        // Stop stream to save battery
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    },

    autoProcessDocument: function (sourceCanvas) {
        const preview = document.getElementById('camera_captured_preview');
        const video = document.getElementById('camera_video');
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;

        let pts = this.detectedCorners || [
            { x: vWidth * 0.1, y: vHeight * 0.1 },
            { x: vWidth * 0.9, y: vHeight * 0.1 },
            { x: vWidth * 0.9, y: vHeight * 0.9 },
            { x: vWidth * 0.1, y: vHeight * 0.9 }
        ];

        // Normalize points for applyPerspectiveTransform
        const normalizedPts = pts.map(p => ({
            x: p.x / vWidth,
            y: p.y / vHeight
        }));

        const transformedData = this.applyPerspectiveTransform(sourceCanvas, normalizedPts);

        preview.src = transformedData;
        $(preview).show();
        $(video).hide();
        $('#camera_popup').addClass('preview-mode');
        this.clearDetectionOverlay();
    },

    showCropper: function (capturedCanvas) {
        const cropper = $('#camera_cropper');
        const canvas = document.getElementById('cropper_canvas');
        const ctx = canvas.getContext('2d');

        // Set cropper canvas size
        const container = $('.camera-preview-container');
        canvas.width = container.width();
        canvas.height = container.height();

        // Draw captured image to cropper canvas
        ctx.drawImage(capturedCanvas, 0, 0, canvas.width, canvas.height);

        $('#camera_video').hide();
        cropper.show();
        $('#camera_popup').addClass('preview-mode');
        $('.confirm-btn').hide(); // Hide confirm until processed
        $('#process_doc_btn').show();

        this.updateCropperLines();
    },

    processDocument: function () {
        const cropper = $('#camera_cropper');
        const sourceCanvas = document.getElementById('camera_canvas');
        const finalCanvas = document.getElementById('camera_canvas'); // Reuse or use a hidden one
        const preview = document.getElementById('camera_captured_preview');

        // Get points in normalized coordinates (0-1)
        const getPoint = (id) => {
            const p = $(`#${id}`);
            return {
                x: parseFloat(p.css('left')) / 100,
                y: parseFloat(p.css('top')) / 100
            };
        };

        const pts = [getPoint('p1'), getPoint('p2'), getPoint('p3'), getPoint('p4')];
        
        // Target dimensions (A4 ratio approx)
        const targetW = 1200;
        const targetH = 1600;
        
        const transformedData = this.applyPerspectiveTransform(sourceCanvas, pts, targetW, targetH);
        
        preview.src = transformedData;
        cropper.hide();
        $(preview).show();
        $('#process_doc_btn').hide();
        $('.confirm-btn').show();
    },

    applyPerspectiveTransform: function (sourceCanvas, pts) {
        // Source points in canvas coordinates
        const src = pts.map(p => ({ x: p.x * sourceCanvas.width, y: p.y * sourceCanvas.height }));

        // Calculate natural width and height based on corner distances to avoid stretching
        const widthTop = Math.hypot(src[0].x - src[1].x, src[0].y - src[1].y);
        const widthBottom = Math.hypot(src[2].x - src[3].x, src[2].y - src[3].y);
        const heightLeft = Math.hypot(src[0].x - src[3].x, src[0].y - src[3].y);
        const heightRight = Math.hypot(src[1].x - src[2].x, src[1].y - src[2].y);

        let targetW = Math.max(widthTop, widthBottom);
        let targetH = Math.max(heightLeft, heightRight);

        // Cap size for performance but keep ratio
        const maxDim = 2000;
        if (targetW > maxDim || targetH > maxDim) {
            const scale = maxDim / Math.max(targetW, targetH);
            targetW *= scale;
            targetH *= scale;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        // Simple crop-based extract (maintains ratio)
        const minX = Math.max(0, Math.min(...src.map(p => p.x)));
        const maxX = Math.min(sourceCanvas.width, Math.max(...src.map(p => p.x)));
        const minY = Math.max(0, Math.min(...src.map(p => p.y)));
        const maxY = Math.min(sourceCanvas.height, Math.max(...src.map(p => p.y)));

        const cropW = maxX - minX;
        const cropH = maxY - minY;

        ctx.filter = 'grayscale(1) contrast(1.8) brightness(1.1)';
        ctx.drawImage(sourceCanvas, minX, minY, cropW, cropH, 0, 0, targetW, targetH);

        return canvas.toDataURL('image/jpeg', 0.9);
    },

    retake: function () {
        $('#camera_popup').removeClass('preview-mode');
        $('#camera_captured_preview').hide();
        $('#camera_video').show();
        this.startStream();
    },

    confirm: function () {
        const imageData = document.getElementById('camera_captured_preview').src;
        if (this.onCapture) {
            this.onCapture(imageData);
        }
        this.close();
    },

    switchCamera: function () {
        this.activeCamera = this.activeCamera === 'environment' ? 'user' : 'environment';
        this.startStream();
    },

    toggleDocumentMode: function () {
        this.documentMode = !this.documentMode;
        $('#toggle_doc_btn').toggleClass('active', this.documentMode);
        
        const video = document.getElementById('camera_video');
        if (this.documentMode) {
            // Keep preview colors natural as requested
            showToast(typeof t === 'function' ? t('camera.doc_mode_on') : 'Document mode enabled', 'success');
            this.startDetectionLoop();
        } else {
            showToast(typeof t === 'function' ? t('camera.doc_mode_off') : 'Document mode disabled');
            this.stopDetectionLoop();
        }
    },

    startDetectionLoop: function () {
        if (!this.documentMode || !this.isScannerReady || this.detectionLoopActive) return;
        
        const video = document.getElementById('camera_video');
        if (!video || video.paused) return;

        this.detectionLoopActive = true;
        const self = this;

        const loop = () => {
            if (!self.detectionLoopActive || !self.documentMode) return;
            
            try {
                const resultCanvas = self.scanner.highlightPaper(video);
                // The highlighted paper is returned as a canvas.
                // We want to overlay this on our video.
                // However, jscanify returns a full canvas with the contour drawn on it.
                // A better way is to get the contour and draw it ourselves on a dedicated overlay canvas.
                
                const contour = self.scanner.findPaperContour(cv.imread(video));
                if (contour) {
                    const corners = self.scanner.getCornerPoints(contour);
                    self.drawDetectionOverlay(corners);
                    cv.delete(contour);
                } else {
                    self.clearDetectionOverlay();
                }
            } catch (e) {
                // cv might not be fully loaded yet
            }
            
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    },

    stopDetectionLoop: function () {
        this.detectionLoopActive = false;
        this.clearDetectionOverlay();
    },

    drawDetectionOverlay: function (corners) {
        // Draw the 4 points on the camera-overlay
        const overlay = $('.camera-overlay');
        const video = $('#camera_video')[0];
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;
        
        // We need to map video coordinates to overlay coordinates
        const rect = video.getBoundingClientRect();
        
        // Clear previous lines (we'll use the SVG lines we already have if possible, 
        // or just draw on a dedicated canvas)
        // For simplicity, let's use the existing cropper SVG lines but visible during preview
        $('#dl1, #dl2, #dl3, #dl4').show();
        
        const videoRect = video.getBoundingClientRect();
        const cornersArr = [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft];
        this.detectedCorners = cornersArr; // Store for auto-processing

        const setLine = (id, start, end) => {
            $(`#${id}`).attr({ 
                x1: (start.x / vWidth * 100) + '%', 
                y1: (start.y / vHeight * 100) + '%', 
                x2: (end.x / vWidth * 100) + '%', 
                y2: (end.y / vHeight * 100) + '%' 
            });
        };

        setLine('dl1', cornersArr[0], cornersArr[1]);
        setLine('dl2', cornersArr[1], cornersArr[2]);
        setLine('dl3', cornersArr[2], cornersArr[3]);
        setLine('dl4', cornersArr[3], cornersArr[0]);
        
        $('.detection-svg').show().addClass('detecting');
    },

    clearDetectionOverlay: function () {
        $('.detection-svg').removeClass('detecting').hide();
        this.detectedCorners = null;
    },

    close: function () {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        $('#camera_popup').removeClass('active');
        this.stopStabilizer();
    },

    startStabilizer: function () {
        if (!window.DeviceMotionEvent) return;

        const self = this;
        this.motionHandler = function (event) {
            const acc = event.acceleration;
            if (!acc) return;

            const totalMotion = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
            const now = Date.now();

            // Digital Image Stabilization (DIS) effect
            // Counter-move the video slightly to compensate for small shakes
            const shakeX = (acc.x || 0) * -2;
            const shakeY = (acc.y || 0) * 2;
            $('#camera_video').css('transform', `translate(${shakeX}px, ${shakeY}px) ${self.activeCamera === 'user' ? 'scaleX(-1)' : ''}`);
        };

        window.addEventListener('devicemotion', this.motionHandler, true);
    },

    stopStabilizer: function () {
        if (this.motionHandler) {
            window.removeEventListener('devicemotion', this.motionHandler, true);
            this.motionHandler = null;
        }
        this.isSteady = false;
    },

    // Auto-bind to buttons with [data-camera-target]
    autoBind: function () {
        const self = this;
        $(document).off('click', '[data-camera-target]').on('click', '[data-camera-target]', async function () {
            const targetInput = $(this).attr('data-camera-target');
            const targetPreview = $(this).attr('data-camera-preview');
            const openBtn = $(this);
            const chooseBtn = $(this).siblings('[id*="choose_file_btn"]');
            const retakeBtn = $(this).siblings('[id*="retake_btn"]');

            const imageData = await self.open();
            if (imageData) {
                $(targetInput).val(imageData);

                if (targetPreview) {
                    $(targetPreview).html(`
                        <img src="${imageData}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;">
                        <br><small>${t('common.file_preview')}</small>
                    `);
                }

                // UI adjustments: Show all options so the user can change if they want
                openBtn.show().html('📷 ' + t('common.retake'));
                chooseBtn.show().html('📁 ' + t('common.choose_another'));
                retakeBtn.hide(); // No need for a separate retake button if openBtn is back
            }
        });
    }
};

// Global initializer
$(document).ready(() => {
    CameraManager.init();
    CameraManager.autoBind();
});

