const WIDTH = 1176, HEIGHT = 1470;
const canvas = document.getElementById('finalCanvas');
const ctx = canvas.getContext('2d');

let elementsList = [];
let activeTarget = null;
let dragOffset = { x: 0, y: 0 };

const stripAsset = new Image();
const dataURL = localStorage.getItem('photoStrip');

if (dataURL) {
  stripAsset.src = dataURL;
  stripAsset.onload = updateCanvasLayer;
} else {
  alert("No active session images found.");
  window.location.href = 'menu.html';
}

function updateCanvasLayer() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(stripAsset, 0, 0, WIDTH, HEIGHT);
  
  // Gambar semua stiker emoji yang ada di daftar aksen
  elementsList.forEach(item => {
    ctx.drawImage(item.img, item.x, item.y, item.width, item.height);
  });
}

// =========================================================================
// LOGIKA UTAMA: MENGUBAH TEKS EMOJI MENJADI GAMBAR TRANSPARAN SECARA INSTAN
// =========================================================================
function createEmojiAccent(emojiSymbol) {
  // Buat kanvas bayangan sementara di memori komputer
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 200;
  tempCanvas.height = 200;
  const tCtx = tempCanvas.getContext('2d');
  
  // Atur jenis font sistem agar emoji bawaan perangkat keluar dengan tajam
  tCtx.font = '130px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  tCtx.textBaseline = 'middle';
  tCtx.textAlign = 'center';
  
  // Cetak teks emoji tepat di tengah kanvas bayangan
  tCtx.fillText(emojiSymbol, 100, 100);
  
  // Ubah kanvas bayangan berisi emoji tadi menjadi sumber gambar (.src)
  const img = new Image();
  img.onload = () => {
    elementsList.push({
      img,
      x: WIDTH / 2 - 100, // Letakkan stiker otomatis di tengah kanvas saat pertama muncul
      y: HEIGHT / 2 - 100,
      width: 160,         // Ukuran dimensi besar stiker emoji (bisa kamu ubah jika kurang besar)
      height: 160,
      dragging: false
    });
    updateCanvasLayer();
  };
  img.src = tempCanvas.toDataURL(); // Konversi teks ke format data gambar transparan (.png proxy)
}

// === LOGIKA KOORDINAT UNTUK DRAG AND DROP ===
function computePointerCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches?.[0]?.clientX ?? e.clientX;
  const clientY = e.touches?.[0]?.clientY ?? e.clientY;
  return {
    x: ((clientX - rect.left) / rect.width) * WIDTH,
    y: ((clientY - rect.top) / rect.height) * HEIGHT
  };
}

function pointerDown(e) {
  const { x, y } = computePointerCoords(e);
  for (let i = elementsList.length - 1; i >= 0; i--) {
    const item = elementsList[i];
    if (x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height) {
      activeTarget = item;
      item.dragging = true;
      dragOffset.x = x - item.x;
      dragOffset.y = y - item.y;
      
      // Bawa lapisan kedalaman stiker ke depan saat dipegang
      elementsList.splice(i, 1);
      elementsList.push(item);
      updateCanvasLayer();
      e.preventDefault();
      break;
    }
  }
}

function pointerMove(e) {
  if (!activeTarget?.dragging) return;
  const { x, y } = computePointerCoords(e);
  activeTarget.x = x - dragOffset.x;
  activeTarget.y = y - dragOffset.y;
  updateCanvasLayer();
  e.preventDefault();
}

function pointerUp() {
  if (activeTarget) activeTarget.dragging = false;
  activeTarget = null;
}

// Listener Mouse (Komputer/Laptop)
canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', pointerUp);

// Listener Touch (HP / Layar Sentuh)
canvas.addEventListener('touchstart', pointerDown, { passive: false });
canvas.addEventListener('touchmove', pointerMove, { passive: false });
canvas.addEventListener('touchend', pointerUp);


// =========================================================================
// SINKRONISASI TOMBOL: MENGHUBUNGKAN ID TOMBOL HTML DENGAN SIMBOL EMOJINYA
// =========================================================================
document.getElementById('emoji-heart').addEventListener('click', () => createEmojiAccent('❤️'));
document.getElementById('emoji-clover').addEventListener('click', () => createEmojiAccent('🍀'));
document.getElementById('emoji-sparkles').addEventListener('click', () => createEmojiAccent('✨'));
document.getElementById('emoji-saturn').addEventListener('click', () => createEmojiAccent('🪐'));
document.getElementById('emoji-cherry').addEventListener('click', () => createEmojiAccent('🍒'));
document.getElementById('emoji-apple').addEventListener('click', () => createEmojiAccent('🍎'));
document.getElementById('emoji-cookie').addEventListener('click', () => createEmojiAccent('🍪'));


// Tombol Kontrol Bawaan Proyek
const resetBtn = document.getElementById('reset');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    elementsList = [];
    updateCanvasLayer();
  });
}

const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `photobooth-print-${Date.now()}.png`;
      a.click();
    }, 'image/png');
  });
}

const homeBtn = document.getElementById('homeBtn');
if (homeBtn) {
  homeBtn.addEventListener('click', () => {
    window.location.href = 'menu.html';
  });
}