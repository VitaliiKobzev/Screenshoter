document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('button').addEventListener('click', function() {
    takeScreenshot();
  });
});

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

    var editButton = createStyledButton('Редактировать', '✐', '#337ab7');
    var downloadButton = createStyledButton('Скачать', '💾', '#5bc0de');
    var uploadButton = createStyledButton('Загрузить', '💿', '#5bc0de');

    downloadButton.classList.add('delete');

    editButton.addEventListener('click', function() {
      localStorage.setItem('editUrl', dataUrl);
      location.href = 'edit.html';
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
      var originalHtml = uploadButton.innerHTML;
      setUploadButtonLoading(uploadButton, originalHtml);
      uploadToBasepic(dataUrl, uploadButton, originalHtml);
    });

    saveScreenshotLocally(dataUrl);

    document.body.appendChild(img);
    document.body.appendChild(editButton);
    document.body.appendChild(downloadButton);
    document.body.appendChild(uploadButton);

    renderLocalScreenshots();
  });
}

var magicToggle = document.getElementById('magicToggle');
if (magicToggle) {
  var magicOn = false;
  magicToggle.addEventListener('click', function() {
    magicOn = !magicOn;
    if (magicOn) {
      document.body.classList.add('magic-gradient');
      magicToggle.textContent = '✨';
    } else {
      document.body.classList.remove('magic-gradient');
      magicToggle.textContent = '🪄';
    }
  });
}

var historyToggle = document.getElementById('historyToggle');
var historyContainer = document.getElementById('localScreenshots');
if (historyToggle && historyContainer) {
  historyToggle.addEventListener('click', function() {
    if (historyContainer.classList.contains('show')) {
      historyContainer.classList.remove('show');
      historyToggle.textContent = '📜 История';
    } else {
      historyContainer.classList.add('show');
      historyToggle.textContent = '📜 Скрыть';
      renderLocalScreenshots();
    }
  });
}

function createStyledButton(text, icon, bgColor) {
  var button = document.createElement('button');
  button.textContent = text;
  var iconEl = document.createElement('span');
  iconEl.innerHTML = icon;
  button.insertBefore(iconEl, button.firstChild);
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.backgroundColor = bgColor;
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  return button;
}

function setUploadButtonLoading(button, originalHtml) {
  button.innerHTML = '<span class="spinner"></span> Загрузка...';
  button.disabled = true;
  button.style.opacity = '0.7';
}

function resetUploadButton(button, originalHtml) {
  button.innerHTML = originalHtml;
  button.disabled = false;
  button.style.opacity = '1';
}

function uploadToBasepic(dataUrl, uploadButton, originalHtml) {
  var arr = dataUrl.split(','),
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  var blob = new Blob([u8arr], { type: 'image/png' });
  var form = new FormData();
  form.append('image', blob, 'screenshot.png');
  fetch('https://basepic.com/api/v1/images', {
    method: 'POST',
    body: form
  }).then(function(response) {
    return response.json();
  }).then(function(data) {
    var link = data.image_url;
    console.log(link);
    resetUploadButton(uploadButton, originalHtml);
    var button = document.createElement('button');
    button.textContent = 'Перейти';
    button.style.fontSize = '12px';
    button.style.padding = '2px 6px';
    button.addEventListener('click', function() {
      window.open(link);
    });
    uploadButton.parentNode.insertBefore(button, uploadButton.nextSibling);
  }).catch(function(error) {
    console.error(error);
    resetUploadButton(uploadButton, originalHtml);
  });
}

function generateFileName() {
  var d = new Date();
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = String(d.getFullYear()).slice(-2);
  var ms = d.getTime();
  return day + '_' + month + '_' + year + '_' + ms;
}

function saveScreenshotLocally(dataUrl) {
  var screenshots = JSON.parse(localStorage.getItem('localScreenshots') || '[]');
  var now = Date.now();
  var weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  screenshots = screenshots.filter(function(s) { return s.timestamp > weekAgo; });
  screenshots.unshift({ id: now, dataUrl: dataUrl, timestamp: now });
  if (screenshots.length > 30) {
    screenshots.length = 30;
  }
  localStorage.setItem('localScreenshots', JSON.stringify(screenshots));
}

function renderLocalScreenshots() {
  var container = document.getElementById('localScreenshotsList');
  if (!container) {
    return;
  }
  var screenshots = JSON.parse(localStorage.getItem('localScreenshots') || '[]');
  var now = Date.now();
  var weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  screenshots = screenshots.filter(function(s) { return s.timestamp > weekAgo; });
  localStorage.setItem('localScreenshots', JSON.stringify(screenshots));
  container.innerHTML = '';
  if (screenshots.length === 0) {
    container.innerHTML = '<p>Здесь будут ваши скриншоты (хранятся 7 дней)</p>';
    return;
  }
  screenshots.forEach(function(s) {
    var div = document.createElement('div');
    div.style.margin = '10px 0';
    div.style.textAlign = 'center';
    div.style.display = 'inline-block';
    var img = document.createElement('img');
    img.src = s.dataUrl;
    img.style.maxWidth = '150px';
    img.style.border = '1px solid #ccc';
    img.style.borderRadius = '4px';
    var date = document.createElement('p');
    date.textContent = new Date(s.timestamp).toLocaleString();
    date.style.fontSize = '12px';
    date.style.margin = '5px 0';
    var btn = document.createElement('button');
    btn.textContent = 'Скачать';
    btn.style.marginLeft = '10px';
    btn.style.fontSize = '12px';
    btn.style.padding = '4px 8px';
    btn.addEventListener('click', function() {
      var link = document.createElement('a');
      link.download = generateFileName() + '.jpg';
      link.href = s.dataUrl;
      link.click();
    });
    div.appendChild(img);
    div.appendChild(date);
    div.appendChild(btn);
    container.appendChild(div);
  });
}