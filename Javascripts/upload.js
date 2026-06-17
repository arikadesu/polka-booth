const WIDTH = 1176, HEIGHT = 1470;
const layout = parseInt(localStorage.getItem('chosenLayout') || '2');
const designStyle = localStorage.getItem('chosenDesign') || 'minimal';
const useBorder = localStorage.getItem('useBorder') !== 'false';
const frameColor = localStorage.getItem('frameColor') || '#FFFFFF';
const thickness = parseInt(localStorage.getItem('borderThickness') || '30'); 

const elements = {
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas').getContext('2d'),
  uploadInput: document.getElementById('uploadPhotoInput'),
  uploadBtn: document.getElementById('uploadPhoto'),
  readyBtn: document.getElementById('readyButton'),
  statusPill: document.getElementById('upload-status')
};

let uploadedImages = [];
let currentFilter = 'original';

redrawLayoutStrip();

function drawDesignBackground(ctx) {
  const dotRadius = 12;
  const spacing = 60;

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

function redrawLayoutStrip() {
  drawDesignBackground(elements.ctx);

  if (layout === 2) {
    const photoGap = 20; 
    const cardW = 760;
    const cardX = (WIDTH - cardW) / 2;
    const cardY = 70;

    const photoW = cardW - (thickness * 2);
    const photoH = photoW * (3 / 4); // Kunci Rasio 4:3

    const cardH = (thickness * 2) + (photoH * 2) + photoGap + 120;

    if (useBorder) {
      elements.ctx.fillStyle = frameColor;
      elements.ctx.fillRect(cardX, cardY, cardW, cardH);
    }
    
    const photo1Y = cardY + thickness;
    const photo2Y = photo1Y + photoH + photoGap;

    if (uploadedImages[0]) drawImageToGridSlot(uploadedImages[0], cardX + thickness, photo1Y, photoW, photoH);
    if (uploadedImages[1]) drawImageToGridSlot(uploadedImages[1], cardX + thickness, photo2Y, photoW, photoH);
  } else {
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

    if (uploadedImages[0]) drawImageToGridSlot(uploadedImages[0], px1, py1, slotSize, slotSize);
    if (uploadedImages[1]) drawImageToGridSlot(uploadedImages[1], px2, py1, slotSize, slotSize);
    if (uploadedImages[2]) drawImageToGridSlot(uploadedImages[2], px1, py2, slotSize, slotSize);
    if (uploadedImages[3]) drawImageToGridSlot(uploadedImages[3], px2, py2, slotSize, slotSize);
  }
}

function applyFilter(filterName) {
  currentFilter = filterName;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  redrawLayoutStrip();
}

const fOrigUpload = document.getElementById('f-original');
const fVintUpload = document.getElementById('f-vintage');
const fBwUpload = document.getElementById('f-bw');
if (fOrigUpload) fOrigUpload.addEventListener('click', () => applyFilter('original'));
if (fVintUpload) fVintUpload.addEventListener('click', () => applyFilter('vintage'));
if (fBwUpload) fBwUpload.addEventListener('click', () => applyFilter('bw'));

elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());

elements.uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    uploadedImages.push(img);
    redrawLayoutStrip();
    
    if (uploadedImages.length === layout) {
      elements.uploadBtn.style.display = 'none';
      elements.readyBtn.style.display = 'inline-block';
      elements.readyBtn.disabled = false;
    }
  };
  img.src = URL.createObjectURL(file);
});

function drawImageToGridSlot(img, dx, dy, dw, dh) {
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
}

elements.readyBtn.addEventListener('click', () => {
  localStorage.setItem('photoStrip', elements.canvas.toDataURL('image/png'));
  localStorage.setItem('appliedFilter', currentFilter);
  window.location.href = 'final.html';
});