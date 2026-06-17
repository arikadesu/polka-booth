let chosenLayout = 2;
let chosenDesign = 'minimal';
let useBorder = 'true';
let frameColor = '#fde5e8'; 
let borderThickness = '30'; 

const opt2 = document.getElementById('opt-2');
const opt4 = document.getElementById('opt-4');

const dsgnCocoa = document.getElementById('dsgn-cocoablue');
const dsgnEsp = document.getElementById('dsgn-espresso');
const dsgnMatcha = document.getElementById('dsgn-matcha');

const borderOn = document.getElementById('border-on');
const borderOff = document.getElementById('border-off');
const colorSelectionWrapper = document.getElementById('color-selection-wrapper');
const colorWhite = document.getElementById('color-white');
const colorCream = document.getElementById('color-cream');
const colorClay = document.getElementById('color-clay');

const camBtn = document.getElementById('menu-camera-button');
const upBtn = document.getElementById('menu-upload-button');

localStorage.setItem('chosenLayout', chosenLayout);
localStorage.setItem('chosenDesign', chosenDesign);
localStorage.setItem('useBorder', useBorder);
localStorage.setItem('frameColor', frameColor);
localStorage.setItem('borderThickness', borderThickness);

if (opt2 && opt4) {
  opt2.addEventListener('click', () => {
    chosenLayout = 2;
    opt2.classList.add('selected');
    opt4.classList.remove('selected');
    localStorage.setItem('chosenLayout', chosenLayout);
  });
  opt4.addEventListener('click', () => {
    chosenLayout = 4;
    opt4.classList.add('selected');
    opt2.classList.remove('selected');
    localStorage.setItem('chosenLayout', chosenLayout);
  });
}

if (dsgnCocoa && dsgnEsp && dsgnMatcha) {
  dsgnCocoa.addEventListener('click', () => {
    chosenDesign = 'minimal';
    dsgnCocoa.classList.add('selected');
    dsgnEsp.classList.remove('selected');
    dsgnMatcha.classList.remove('selected');
    localStorage.setItem('chosenDesign', chosenDesign);
  });
  dsgnEsp.addEventListener('click', () => {
    chosenDesign = 'espresso';
    dsgnEsp.classList.add('selected');
    dsgnCocoa.classList.remove('selected');
    dsgnMatcha.classList.remove('selected');
    localStorage.setItem('chosenDesign', chosenDesign);
  });
  dsgnMatcha.addEventListener('click', () => {
    chosenDesign = 'matcha';
    dsgnMatcha.classList.add('selected');
    dsgnCocoa.classList.remove('selected');
    dsgnEsp.classList.remove('selected');
    localStorage.setItem('chosenDesign', chosenDesign);
  });
}

if (borderOn && borderOff) {
  borderOn.addEventListener('click', () => {
    useBorder = 'true';
    borderOn.classList.add('selected');
    borderOff.classList.remove('selected');
    colorSelectionWrapper.style.opacity = '1';
    colorSelectionWrapper.style.pointerEvents = 'auto';
    localStorage.setItem('useBorder', useBorder);
  });
  borderOff.addEventListener('click', () => {
    useBorder = 'false';
    borderOff.classList.add('selected');
    borderOn.classList.remove('selected');
    colorSelectionWrapper.style.opacity = '0.3';
    colorSelectionWrapper.style.pointerEvents = 'none';
    localStorage.setItem('useBorder', useBorder);
  });
}

if (colorWhite && colorCream && colorClay) {
  colorWhite.addEventListener('click', () => {
    frameColor = '#fde5e8'; 
    colorWhite.classList.add('selected');
    colorCream.classList.remove('selected');
    colorClay.classList.remove('selected');
    localStorage.setItem('frameColor', frameColor);
  });
  colorCream.addEventListener('click', () => {
    frameColor = '#18191d'; 
    colorCream.classList.add('selected');
    colorWhite.classList.remove('selected');
    colorClay.classList.remove('selected');
    localStorage.setItem('frameColor', frameColor);
  });
  colorClay.addEventListener('click', () => {
    frameColor = '#fff2ba'; 
    colorClay.classList.add('selected');
    colorWhite.classList.remove('selected');
    colorCream.classList.remove('selected');
    localStorage.setItem('frameColor', frameColor);
  });
}

if (camBtn) camBtn.addEventListener('click', () => window.location.href = 'camera.html');
if (upBtn) upBtn.addEventListener('click', () => window.location.href = 'upload.html');