const WIDTH = 1176, HEIGHT = 1470;
const layout = parseInt(localStorage.getItem('chosenLayout') || '2');
const designStyle = localStorage.getItem('chosenDesign') || 'minimal';
const useBorder = localStorage.getItem('useBorder') !== 'false'; 
const frameColor = localStorage.getItem('frameColor') || '#FFFFFF';
const thickness = parseInt(localStorage.getItem('borderThickness') || '30'); 

const elements = {
  video: document.getElementById('liveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas').getContext('2d'),
  takePhotoBtn: document.getElementById('takePhoto'),
  countdownEl: document.querySelector('.countdown-timer'),
  statusPill: document.getElementById('capture-status')
};

let capturedFrames = [];
let currentFilter = 'original';

if (elements.statusPill) {
  elements.statusPill.innerText = `Layout: ${layout} Shots — Ready`;
}

function applyFilter(filterName) {
  currentFilter = filterName;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  elements.video.className = `filter-${filterName}`;
}

const fOrig = document.getElementById('f-original');
const fVint = document.getElementById('f-vintage');
const fBw = document.getElementById('f-bw');
if (fOrig) fOrig.addEventListener('click', () => applyFilter('original'));
if (fVint) fVint.addEventListener('click', () => applyFilter('vintage'));
if (fBw) fBw.addEventListener('click', () => applyFilter('bw'));

function startCountdown(seconds, callback) {
  elements.countdownEl.textContent = seconds;
  elements.countdownEl.style.display = 'flex';
  
  const interval = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      elements.countdownEl.textContent = seconds;
    } else {
      clearInterval(interval);
      elements.countdownEl.style.display = 'none';
      callback();
    }
  }, 900);
}

function executeCaptureSequence() {
  elements.takePhotoBtn.disabled = true;
  capturedFrames = [];
  let currentShot = 0;

  function processNextShot() {
    if (currentShot < layout) {
      currentShot++;
      if (elements.statusPill) {
        elements.statusPill.innerText = `Capturing Frame ${currentShot} of ${layout}`;
      }
      startCountdown(3, () => {
        captureSingleFrame();
        setTimeout(processNextShot, 600);
      });
    } else {
      finalizePhotoStrip();
    }
  }
  processNextShot();
}

function captureSingleFrame() {
  const proxyCanvas = document.createElement('canvas');
  proxyCanvas.width = elements.video.videoWidth || 1280;
  proxyCanvas.height = elements.video.videoHeight || 960;
  const pCtx = proxyCanvas.getContext('2d');
  
  pCtx.translate(proxyCanvas.width, 0);
  pCtx.scale(-1, 1);
  pCtx.drawImage(elements.video, 0, 0, proxyCanvas.width, proxyCanvas.height);
  
  capturedFrames.push(proxyCanvas.toDataURL('image/jpeg', 0.95));
}

function drawDesignBackground(ctx) {
  const dotRadius = 12;     
  const spacing = 70;      

  if (designStyle === 'espresso') {
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#f4c9d6';
  } else if (designStyle === 'matcha') {
    ctx.fillStyle = '#f9cdd5';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#7a8450';
  } else {
    ctx.fillStyle = '#583722';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#bdd7de';
  }

  let rowIndex = 0;
  for (let y = spacing / 2; y < HEIGHT + spacing; y += spacing * 0.866) {
    let xOffset = (rowIndex % 2 === 1) ? spacing / 2 : 0;
    for (let x = (spacing / 2) - xOffset; x < WIDTH + spacing; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    rowIndex++;
  }
}

function finalizePhotoStrip() {
  elements.video.style.display = 'none';
  elements.canvas.style.display = 'block';

  // Cetak background polkadot zig-zag
  drawDesignBackground(elements.ctx);

  if (layout === 2) {
    const photoGap = 20; // Jarak antar foto atas & bawah
    const cardW = 760;
    const cardX = (WIDTH - cardW) / 2;
    const cardY = 70;
    
    // Hitung lebar foto bersih setelah dikurangi margin ketebalan (thickness)
    const photoW = cardW - (thickness * 2);
    
    // === KUNCI RASIO 4:3 ELEGAN ===
    // Mengunci tinggi foto agar selalu membentuk landscape 4:3 yang sinematik
    const photoH = photoW * (3 / 4); 

    // Hitung tinggi total kertas putih agar otomatis menutup pas di bawah foto kedua + sisa space estetik
    const cardH = (thickness * 2) + (photoH * 2) + photoGap + 120; // 120 adalah sisa kertas kosong di bawah untuk gaya retro

    if (useBorder) {
      elements.ctx.fillStyle = frameColor;
      elements.ctx.fillRect(cardX, cardY, cardW, cardH);
    }
    
    const photo1Y = cardY + thickness;
    const photo2Y = photo1Y + photoH + photoGap;

    renderImageToGrid(0, cardX + thickness, photo1Y, photoW, photoH, () => {
      renderImageToGrid(1, cardX + thickness, photo2Y, photoW, photoH, outputToReview);
    });
  } else {
    // Layout 4 Grid Editorial (Tetap dikunci kotak 1:1 proporsional yang seimbang)
    const photoGap = 25; 
    const frameW = 1020; 
    const frameH = 1140; 
    const frameX = (WIDTH - frameW) / 2;
    const frameY = 160;

    if (useBorder) {
      elements.ctx.fillStyle = frameColor;
      elements.ctx.fillRect(frameX, frameY, frameW, frameH);
    }

    const slotSize = (frameW - (thickness * 2) - photoGap) / 2;

    const px1 = frameX + thickness;
    const px2 = px1 + slotSize + photoGap;
    const py1 = frameY + thickness;
    const py2 = py1 + slotSize + photoGap;

    renderImageToGrid(0, px1, py1, slotSize, slotSize, () => {
      renderImageToGrid(1, px2, py1, slotSize, slotSize, () => {
        renderImageToGrid(2, px1, py2, slotSize, slotSize, () => {
          renderImageToGrid(3, px2, py2, slotSize, slotSize, outputToReview);
        });
      });
    });
  }
}

function renderImageToGrid(index, dx, dy, dw, dh, callback) {
  const img = new Image();
  img.onload = () => {
    elements.ctx.save();
    
    if (currentFilter === 'vintage') elements.ctx.filter = 'sepia(0.25) contrast(0.9) brightness(1.03) saturate(0.85)';
    else if (currentFilter === 'bw') elements.ctx.filter = 'grayscale(1) contrast(1.15) brightness(0.98)';
    else elements.ctx.filter = 'contrast(1.03) brightness(1.03) saturate(1.02)';

    const imgAspect = img.width / img.height;
    const targetAspect = dw / dh;
    let sx, sy, sw, sh;

    if (imgAspect > targetAspect) {
      sh = img.height; sw = img.height * targetAspect; sx = (img.width - sw) / 2; sy = 0;
    } else {
      sw = img.width; sh = img.width / targetAspect; sx = 0; sy = (img.height - sh) / 2;
    }

    elements.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    elements.ctx.restore();
    callback();
  };
  img.src = capturedFrames[index];
}

function outputToReview() {
  localStorage.setItem('photoStrip', elements.canvas.toDataURL('image/png'));
  localStorage.setItem('appliedFilter', currentFilter);
  setTimeout(() => window.location.href = 'final.html', 100);
}

navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 960 }, audio: false })
  .then(stream => { elements.video.srcObject = stream; })
  .catch(err => alert("Camera configuration error: " + err));

elements.takePhotoBtn.addEventListener('click', executeCaptureSequence);