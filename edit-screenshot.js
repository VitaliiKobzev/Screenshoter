chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openEditor") {
    const dataUrl = request.dataUrl;
  }
});

function mousedown(){
  canvas.addEventListener("mousedown", function(e){
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    draw = true;
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
  });
}
function mouseup(){
  canvas.addEventListener("mousedown", function(e){
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    draw = true;
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
  });
}
document.addEventListener('DOMContentLoaded', function() {
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');
  const saveButton = document.getElementById('saveButton');
  let w = canvas.width;
  let h = canvas.height;
  var mouse = {x:0, y:0};
  var draw = false;
  var x = mouse.x;
  var y = mouse.y;
  var angle = Math.atan2(mouse.y - x, mouse.x - y);
  var text;
  var scaleX = 1, scaleY = 1;
  var savedImageData;

  function mousedown(e){
    savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    mouse.x = (e.pageX - this.offsetLeft) * scaleX;
    mouse.y = (e.pageY - this.offsetTop) * scaleY;
    x = mouse.x;
    y = mouse.y;
    draw = true;
    ctx.strokeStyle = bg.value;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
  }

  function mousemove1(e){
    if(draw == true){
        mouse.x = (e.pageX - this.offsetLeft) * scaleX;
        mouse.y = (e.pageY - this.offsetTop) * scaleY;
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }
  }

  function mousemoveRect(e){
    if(draw == true){
      ctx.putImageData(savedImageData, 0, 0);
      var mx = (e.pageX - this.offsetLeft) * scaleX;
      var my = (e.pageY - this.offsetTop) * scaleY;
      var w = mx - x;
      var h = my - y;
      ctx.lineWidth = 6;
      ctx.strokeRect(Math.min(x, mx), Math.min(y, my), Math.abs(w), Math.abs(h));
    }
  }

  function mouseup1(e){
    mouse.x = (e.pageX - this.offsetLeft) * scaleX;
    mouse.y = (e.pageY - this.offsetTop) * scaleY;
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    ctx.closePath();
    draw = false;
  }

  function mouseup2(e){
    mouse.x = (e.pageX - this.offsetLeft) * scaleX;
    mouse.y = (e.pageY - this.offsetTop) * scaleY;
    var w = mouse.x - x;
    var h = mouse.y - y;
    ctx.lineWidth = 6;
    ctx.strokeRect(Math.min(x, mouse.x), Math.min(y, mouse.y), Math.abs(w), Math.abs(h));
    draw = false;
  }

  function mouseup3(e){
    mouse.x = (e.pageX - this.offsetLeft) * scaleX;
    mouse.y = (e.pageY - this.offsetTop) * scaleY;
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    ctx.closePath();
    var angle = Math.atan2(mouse.y - y, mouse.x - x);
    ctx.beginPath();
    ctx.moveTo(mouse.x,   mouse.y);
    ctx.lineTo(mouse.x - 10 * Math.cos(angle - Math.PI / 6), mouse.y - 10 * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(mouse.x, mouse.y);
    ctx.lineTo(mouse.x - 10 * Math.cos(angle + Math.PI / 6), mouse.y - 10 * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    ctx.closePath();
    draw = false;
  }

  function drawtext(e){
    mouse.x = (e.pageX - this.offsetLeft) * scaleX;
    mouse.y = (e.pageY - this.offsetTop) * scaleY;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 8;
    ctx.font = "60px Arial";
    can(mouse.x, mouse.y);
  }

  function can(pageX, pageY){
    text = prompt("Введите текст:");
    if (!text) return;
    ctx.strokeText(text, pageX, pageY);
    ctx.fillText(text, pageX, pageY);
  }

  function circle(e){
    mouse.x = (e.pageX - this.offsetLeft) * scaleX;
    mouse.y = (e.pageY - this.offsetTop) * scaleY;
    ctx.beginPath();
    ctx.arc(x, y,  Math.sqrt(Math.pow((mouse.x-x), 2)+Math.pow((mouse.y-y), 2)), 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    draw = false;
  }

  function remove(){
    canvas.removeEventListener('mouseup', mouseup1);
    canvas.removeEventListener('mouseup', mouseup2);
    canvas.removeEventListener('mouseup', mouseup3);
    canvas.removeEventListener('mousemove', mousemove1);
    canvas.removeEventListener('mousemove', mousemoveRect);
    canvas.removeEventListener('click', drawtext);
    canvas.removeEventListener("mouseup", circle);
  }

  button1.addEventListener('click', function() {
      remove();
      canvas.addEventListener("mousedown", mousedown);
      canvas.addEventListener("mousemove", mousemove1);
      canvas.addEventListener("mouseup", mouseup1);
  });

  button2.addEventListener('click', function() {
      remove();
      canvas.addEventListener("mousedown", mousedown);
      canvas.addEventListener("mousemove", mousemoveRect);
      canvas.addEventListener("mouseup",  mouseup2);
    });

  button3.addEventListener('click', function() {
      remove();
      canvas.addEventListener("mousedown", mousedown);
      canvas.addEventListener("mouseup", mouseup3);
    });
  button4.addEventListener('click', function() {
      remove();
      canvas.addEventListener("click", drawtext);
    });

  button5.addEventListener('click', function() {
      remove();
      canvas.addEventListener("mousedown", mousedown);
      canvas.addEventListener("mouseup", circle);
  });

  button6.addEventListener('click', function() {
      remove();
  });

  const image = new Image();
  image.src = localStorage.getItem('editUrl');

  image.onload = function() {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.style.width = '640px';
    canvas.style.height = '298px';
    scaleX = canvas.width / canvas.clientWidth;
    scaleY = canvas.height / canvas.clientHeight;
    ctx.drawImage(image, 0, 0);
  };

  saveButton.addEventListener('click', function() {
    var link = document.createElement('a');
    link.download = generateFileName();
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  ctx.fillStyle = 'red';
  ctx.fillRect(50, 50, 100, 100);

});

function generateFileName() {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear().toString().slice(-2);
  const miliseconds = new Date().getTime();

  return `${day}_${month}_${year}_${miliseconds}`;
}
