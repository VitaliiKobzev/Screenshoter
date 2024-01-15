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

  function mousedown(e){
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    x = mouse.x;
    y = mouse.y;
    draw = true;
    ctx.strokeStyle = bg.value;
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
  }

  function mousemove1(e){
    if(draw == true){
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }
  }

  function mouseup1(e){
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    ctx.closePath();
    draw = false;
  }

  function mouseup2(e){
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    ctx.strokeRect(x, y, mouse.x-x, mouse.y-y);
    ctx.closePath();
    draw = false;
  }

  function mouseup3(e){
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
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
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#F00";
    ctx.font = "10pt Times new roman";
    can(e.pageX, e.pageY);
  }

  function can(pageX, pageY){
    text = prompt("Введите текст:");
    ctx.fillText(text, pageX - canvas.offsetLeft, pageY - canvas.offsetTop);
  }

  function circle(e){
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
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
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
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
