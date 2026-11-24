# Screenshoter

## English

Screenshoter is a browser extension for Google Chrome and Yandex Browser. It lets you quickly take a screenshot of the visible tab, download it, upload it to get a shareable link, edit it (draw, add text, shapes), and keep a local history of recent screenshots.

### Features
- Capture the visible tab with one click
- Download screenshot as JPG
- Upload to basepic.com and get a link
- Built-in screenshot editor (drawing, text, shapes, color picker)
- Local screenshot history: last 12 screenshots, stored for 7 days

### Hotkey
- `Ctrl+Shift+S` (Windows/Linux) / `Cmd+Shift+S` (macOS) — capture screenshot of the active tab and download it (works in any browser window)
- Inside the popup: click **Make screenshot** or press `Ctrl+Shift+S` / `Cmd+Shift+S`

### QuotaExceededError fix
Previously screenshots were saved as full-size base64 strings in `localStorage` (browser quota ≈ 5 MB). After several screenshots the browser threw `QuotaExceededError` on `setItem`, and the button stopped working until storage was cleared. Now:
- Images are downscaled before saving (max width 600 px, JPEG quality 0.75)
- History is limited to 12 screenshots (TTL 7 days)
- All `localStorage` operations are wrapped in `try/catch`; on quota overflow old entries are removed and the write is retried
- The screenshot is always shown even if saving to history fails

### Installation (load unpacked folder)
1. Download or clone this folder to your computer.
2. Open Chrome or Yandex Browser and go to `chrome://extensions` (in Yandex Browser: `browser://extensions`).
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `Screenshoter` folder.
5. The extension icon appears in the toolbar. Click it to open the popup.

### Tests
Open `tests/index.html` in Chrome or Yandex Browser. All checks must pass (green ✅). The tests stub `chrome.*` and simulate a quota-limited `localStorage` to verify:
- File name format (`DD_MM_YY_ms`)
- Resilience to corrupted JSON in storage
- The **Make screenshot** button works 15 times in a row without throwing (including large screenshots that previously triggered `QuotaExceededError`)
- History does not exceed 12 entries after load
- `renderLocalScreenshots` does not break
- Real click on the button saves a screenshot

---

## Русский

## Описание программы

Screenshoter — расширение для браузеров Google Chrome и Яндекс Браузер. Позволяет быстро создавать скриншоты видимой вкладки, скачивать их, загружать на сервер с получением ссылки, редактировать (рисование, текст, фигуры) и хранить локальную историю недавних скриншотов.

### Основные возможности
- Снимок видимой вкладки в один клик
- Скачивание скриншота в формате JPG
- Загрузка на basepic.com и получение ссылки для доступа
- Редактор скриншотов (рисунок, текст, фигуры, выбор цвета)
- Локальная история скриншотов (последние 12, хранятся 7 дней)

### Горячая клавиша
- `Ctrl+Shift+S` (Windows/Linux) / `Cmd+Shift+S` (macOS) — сделать снимок активной вкладки и скачать его (работает в любом окне браузера)
- Всплывающее окно: кнопка **«Сделать скриншот»** или та же комбинация `Ctrl+Shift+S` / `Cmd+Shift+S` внутри окна

### Исправление ошибки QuotaExceededError
Ранее скриншоты сохранялись в `localStorage` в виде полноразмерных base64-строк (квота браузера ≈ 5 МБ). После нескольких скриншотов браузер выдавал `QuotaExceededError` при `setItem`, и кнопка переставала работать до очистки хранилища. Исправлено:
- Перед сохранением изображение сжимается (макс. ширина 600 px, качество JPEG 0.75)
- Лимит истории уменьшен до 12 скриншотов (хранятся 7 дней)
- Все операции с `localStorage` обёрнуты в `try/catch`; при переполнении квоты старые записи удаляются и запись повторяется
- Скриншот всегда отображается, даже если сохранение в историю не удалось

### Установка (через загрузку папки / unpacked extension)
1. Скачайте или склонируйте эту папку на свой компьютер.
2. Откройте Google Chrome или Яндекс Браузер и перейдите на страницу `chrome://extensions` (в Яндекс Браузере — `browser://extensions`).
3. Включите **Режим разработчика** (переключатель в верхнем правом углу).
4. Нажмите **Загрузить распакованное расширение** (Load unpacked) и выберите папку `Screenshoter`.
5. Значок расширения появится на панели инструментов. Нажмите на него, чтобы открыть всплывающее окно.

### Тесты
Откройте файл `tests/index.html` в Chrome или Яндекс Браузере. Все проверки должны быть зелёными (✅). Тесты подменяют `chrome.*` и имитируют квотированное `localStorage`, чтобы проверить:
- формат имени файла (`ДД_ММ_ГГ_мс`);
- устойчивость к битому JSON в хранилище;
- кнопку «Сделать скриншот» — 15 кликов подряд без исключений (включая большие скриншоты, которые раньше вызывали `QuotaExceededError`);
- после нагрузки в истории не более 12 записей;
- `renderLocalScreenshots` не ломается;
- реальный клик по кнопке сохраняет скриншот.
