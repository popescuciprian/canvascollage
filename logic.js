const AUDIO_ROOT = "media/audio/";
const success = "success.mp3";
const error = "winErr.mp3";
const ding = "glass_ding.mp3";

function allowDrop(ev) {
  ev.preventDefault();
}
function playSound(media_src) {
  let audio = new Audio(media_src);
  audio.play();
}
function dropPhotos(ev) {
  ev.preventDefault();
  let files = ev.dataTransfer.files;
  if (files) {
    for (let i = 0; i < files.length; i++)
      if (files[i].type.includes('image'))
        loadPhoto(files[i]);
    playSound(AUDIO_ROOT+success);
  }
}

function loadPhoto(file) {
  let menu = document.querySelector('#photo_menu>menu');
  let photo = document.createElement("img");
  var reader = new FileReader(), image = new Image();
  reader.readAsDataURL(file);
  reader.onload = function (file) {
    photo.setAttribute('src', file.target.result);
    photo.setAttribute('class', 'photo');
    photo.setAttribute('draggable', 'true');
    photo.setAttribute('ondragstart', 'dragPhoto(event)');
  }
  menu.appendChild(photo);
}

function dragPhoto(ev) {
  ev.dataTransfer.setData("text", ev.target.src);
}

function dropPhoto(ev, id) {
  ev.preventDefault();
  var srcPhoto = ev.dataTransfer.getData("text");
  let canvas = document.querySelector(`#${id}`);
  ctx = canvas.getContext('2d');
  let img = new Image();
  img.onload = function () {
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
  }
  img.src = srcPhoto;
}

function getCanvasContainerAndClear() {
  try {
    do {
      var canvas = document.querySelector('canvas');
      canvas.parentNode.removeChild(canvas);
    } while (canvas)
  } catch (err) {
  }
  return document.querySelector("#canvas_container");
}


function loadGrid(index) {
  gridIndex = index;
  let canvasContainer = getCanvasContainerAndClear();
  canvasContainer.style.width = grids[index].width;
  canvasContainer.style.height = grids[index].height;
  canvasContainer.style.gridAutoColumns = grids[index].columns;
  canvasContainer.style.gridAutoRows = grids[index].rows;
  canvasContainer.style.gridTemplateAreas = grids[index].areas;
  for (let i = 0; i < grids[index].count; i++) {
    let canvas = document.createElement('canvas');
    canvas.setAttribute('id', `grid${i + 1}`);
    canvas.setAttribute('ondrop', 'dropPhoto(event,id)');
    canvas.setAttribute('ondragover', 'allowDrop(event)');
    canvas.setAttribute('onclick', `onSelect(${i})`);
    canvasContainer.appendChild(canvas);
  }
}
var gridIndex;
var grids = [{
  width: '800px',
  height: '800px',
  columns: 'auto auto',
  rows: 'auto auto',
  areas: "'a b' 'c d'",
  count: 4
},
{
  width: '900px',
  height: '400px',
  columns: '25% 75%',
  rows: 'auto auto',
  areas: "'a b' 'c d'",
  count: 4
},
{
  width: '800px',
  height: '200px',
  columns: 'auto auto auto',
  rows: null,
  areas: "'a b c'",
  count: 3
},
{
  width: '300px',
  height: '800px',
  columns: 'auto auto auto',
  rows: null,
  areas: "'a' 'b' 'c'",
  count: 3
},
{
  width: '800px',
  height: '800px',
  columns: '25% 25% 25% 25%',
  rows: 'auto auto',
  areas: "'a a b c' 'd e f f'",
  count: 6
}]

function saveCanvas(index) {
  let pics = document.querySelectorAll('canvas');
  let collage = document.createElement('canvas');
  collage.setAttribute('width', grids[index].width.replace('px', ''));
  collage.setAttribute('height', grids[index].height.replace('px', ''));
  let ctx = collage.getContext('2d');
  let dist = pics[0].getBoundingClientRect();
  console.log(pics[0].toDataURL());
  pics.forEach(function (pic) {
    let coords = pic.getBoundingClientRect();
    ctx.drawImage(pic, coords.x - dist.x, coords.y - dist.y, coords.width, coords.height);
  });
  let url = document.createElement('a');
  url.download = "collage.png";
  url.href = collage.toDataURL();;
  url.click();
  playSound(AUDIO_ROOT+success);
}

function onSelect(index) {
  document.querySelector('#allCollageApply').checked = false;
  document.querySelector('#selected_canvas_idx').textContent = index + 1;
  selectedCanvas = index;
  playSound(AUDIO_ROOT+ding);
}
function onCheckEntire() {
  document.querySelector('#selected_canvas_idx').textContent = 'tot';
}
var selectedCanvas;

function getSelectedCanvas() {
  if (!document.querySelector('#allCollageApply').checked)
    return document.querySelector(`#grid${selectedCanvas + 1}`);
  else
    return document.querySelectorAll('[id^=grid]');
}
function efectCanvas(range, f, unit) {
  let canvas = getSelectedCanvas();
  if (canvas) {
    if (typeof canvas[Symbol.iterator] === 'function') {
      for (canv of canvas) {
        let ctx = canv.getContext('2d');
        ctx.filter = `${f}(${range.value}${unit})`;
        ctx.drawImage(canv, 0, 0);
      }
    }
    else {
      let ctx = canvas.getContext('2d');
      ctx.filter = `${f}(${range.value}${unit})`;
      ctx.drawImage(canvas, 0, 0);
    }
  } else {
    playSound(AUDIO_ROOT+error);
  }
  range.value = range.min;
}
