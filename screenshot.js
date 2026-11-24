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
      try { localStorage.setItem('editUrl', dataUrl); } catch (e) {}
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

    // Сохраняем в историю «огнём и забываем»: квота хранилища не должна ломать скриншот
    saveScreenshotLocally(dataUrl).catch(function() {});

    try {
      document.body.appendChild(img);
      document.body.appendChild(editButton);
      document.body.appendChild(downloadButton);
      document.body.appendChild(uploadButton);
      renderLocalScreenshots();
    } catch (e) {
      console.error('Screenshoter: не удалось отобразить скриншот', e);
    }
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

  // Горячая клавиша внутри всплывающего окна: Ctrl+Shift+S / Cmd+Shift+S делает скриншот
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyS') {
      e.preventDefault();
      takeScreenshot();
    }
  });

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

const STORAGE_KEY = 'localScreenshots';
const MAX_SCREENSHOTS = 12;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const DOWNSCALE_MAX_WIDTH = 600;
const DOWNSCALE_QUALITY = 0.75;

function downscaleDataUrl(dataUrl, maxWidth, quality) {
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var w = img.width;
      var h = img.height;
      if (w > maxWidth) {
        h = Math.round(h * (maxWidth / w));
        w = maxWidth;
      }
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = function() { resolve(dataUrl); };
    img.src = dataUrl;
  });
}

function readScreenshots() {
  try {
    var arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.warn('Screenshoter: повреждённое хранилище localScreenshots, сброс', e);
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    return [];
  }
}

function writeScreenshots(screenshots) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(screenshots));
    return true;
  } catch (e) {
    console.warn('Screenshoter: не удалось записать localStorage (квота?)', e);
    return false;
  }
}

function pruneScreenshots(screenshots, now) {
  var weekAgo = now - MAX_AGE_MS;
  return screenshots
    .filter(function(s) { return s && typeof s.timestamp === 'number' && s.timestamp > weekAgo; })
    .slice(0, MAX_SCREENSHOTS);
}

function saveScreenshotLocally(dataUrl) {
  // Сжимаем перед сохранением, чтобы вписаться в квоту localStorage (~5 МБ).
  return downscaleDataUrl(dataUrl, DOWNSCALE_MAX_WIDTH, DOWNSCALE_QUALITY).then(function(toStore) {
    var now = Date.now();
    var screenshots = pruneScreenshots(readScreenshots(), now);
    screenshots.unshift({ id: now, dataUrl: toStore, timestamp: now });

    if (!writeScreenshots(screenshots)) {
      // QuotaExceededError: оставим меньше скриншотов и попробуем ещё раз
      screenshots = screenshots.slice(0, 6);
      writeScreenshots(screenshots);
    }
  }).catch(function(e) {
    console.warn('Screenshoter: ошибка сохранения в историю', e);
  });
}

function renderLocalScreenshots() {
  try {
    var container = document.getElementById('localScreenshotsList');
    if (!container) {
      return;
    }
    var now = Date.now();
    var all = readScreenshots();
    var screenshots = pruneScreenshots(all, now);
    // Пишем обратно только если фильтрация удалила старые записи
    if (screenshots.length !== all.length) {
      writeScreenshots(screenshots);
    }
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
  } catch (e) {
    console.error('Screenshoter: не удалось отобразить историю', e);
  }
}