document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('button').addEventListener('click', function() {
    takeScreenshot();
  });
});

const clientId = 'clientId'; // cliendId из API imgur


function takeScreenshot() {
  chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    var img = document.createElement('img');
    img.src = dataUrl;

    img.width = 200;
    img.height = 100;

    var editButton = createEditButton();
    var downloadButton = createDownloadButton(dataUrl);
    var uploadButton = createUploadButton(dataUrl);

    document.body.appendChild(img);
    document.body.appendChild(editButton);
    document.body.appendChild(downloadButton);
    document.body.appendChild(uploadButton);

    editButton.addEventListener('click', function() {
      console.log('Клик на кнопку редактирования!');
      localStorage.setItem('editUrl', dataUrl);
      location.href='edit.html';
    });

    downloadButton.addEventListener('click', function() {
      var name = generateFileName();
      chrome.downloads.download({
          url: dataUrl,
          filename: name + '.jpg',
          saveAs: false
      });
    });

    uploadButton.addEventListener('click', function() {
      console.log('Клик на кнопку загрузки на Imgur!');
      uploadToImgur(dataUrl, function(link) {
          var newButton = document.createElement('button');
          newButton.innerHTML = link;
          newButton.addEventListener('click', function() {
              window.open(link)
          });
          uploadButton.parentNode.insertBefore(newButton, uploadButton.nextSibling);
      });
    });
  });
}

function uploadToImgur(imageUrl, callback) {
var base64Image = imageUrl.replace(/^data:image\/(png|jpeg);base64,/, '');
var binaryImage = atob(base64Image);
var arrayBuffer = new ArrayBuffer(binaryImage.length);
var view = new Uint8Array(arrayBuffer);
for (var i = 0; i < binaryImage.length; i++) {
    view[i] = binaryImage.charCodeAt(i);
}

// Создание Blob из бинарных данных
var blob = new Blob([arrayBuffer], { type: 'image/jpeg' });

var form = new FormData();
form.append("image", blob, "image.jpeg");

var settings = {
  "url": "https://api.imgur.com/3/image",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "Authorization": "Client-ID {{clientId}}"
  },
  "processData": false,
  "mimeType": "multipart/form-data",
  "contentType": false,
  "data": form
};

$.ajax(settings).done(function (response) {
  console.log(JSON.parse(response).data.link);
  var link = JSON.parse(response).data.link;
  callback(link);
});
}


function createEditButton() {
  var button = document.createElement('button');
  button.textContent = 'Редактировать';

  var editIcon = document.createElement('span');
  editIcon.innerHTML = '✐';
  button.insertBefore(editIcon, button.firstChild);

  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.backgroundColor = '#337ab7';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.cursor = 'pointer';

  return button;
}

function createDownloadButton(dataUrl) {
  var button = document.createElement('button');
  button.textContent = 'Скачать';

  var downloadIcon = document.createElement('span');
  downloadIcon.innerHTML = '💾';
  button.insertBefore(downloadIcon, button.firstChild);

  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.backgroundColor = '#5bc0de';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.cursor = 'pointer';

  button.classList.add('delete');

  return button;
}

function createUploadButton(dataUrl) {
  var button = document.createElement('button');
  button.textContent = 'Загрузить';

  var uploadIcon = document.createElement('span');
  uploadIcon.innerHTML = '💿';
  button.insertBefore(uploadIcon, button.firstChild);

  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.backgroundColor = '#5bc0de';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.cursor = 'pointer';

  return button;
}

function dataURItoBlob(dataUrl, fileName) {
  var arr = dataUrl.split(','),
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: 'image/png', name: fileName });
}

function generateFileName() {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear().toString().slice(-2);
  const miliseconds = new Date().getTime();

  return `${day}_${month}_${year}_${miliseconds}`;
}

const generatedFileName = generateFileName();


chrome.commands.onCommand.addListener(function(command) {
  if (command === 'capture-screenshot') {
    takeScreenshot();
  }
});
