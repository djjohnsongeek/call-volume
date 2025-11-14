// Calendar state
let viewDate = new Date(); // current visible month
const today = new Date();
const highVolumeDays = [new Date(2025, 10, 25), new Date(2025, 10, 26), new Date(2025, 10, 24)]

// Render calendar grid for the given viewDate
function renderCalendar() {
  const grid = document.getElementById('grid');
  const monthTitle = document.getElementById('monthTitle');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Title: e.g., "November 2025"
  const monthName = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(viewDate);
  monthTitle.textContent = `${monthName} ${year}`;

  grid.innerHTML = '';

  // First day of month and counts
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Leading days from previous month to fill first week
  const prevMonthDays = new Date(year, month, 0).getDate();

  const totalCells = 42; // 6 weeks x 7 days for stable layout
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';

    let dayNum, isOutside = false;
    if (i < startWeekday) {
      // previous month
      dayNum = prevMonthDays - startWeekday + 1 + i;
      isOutside = true;
    } else if (i < startWeekday + daysInMonth) {
      // current month
      dayNum = i - startWeekday + 1;
    } else {
      // next month
      dayNum = i - (startWeekday + daysInMonth) + 1;
      isOutside = true;
    }

    const dateEl = document.createElement('div');
    dateEl.className = 'date';
    dateEl.textContent = dayNum;
    cell.appendChild(dateEl);

    if (isOutside) cell.classList.add('outside');

    // Highlight today when visible in current month
    const isToday =
      !isOutside &&
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === dayNum;

    const isHighVolumeDay = highVolumeDays.some(d =>
      d.getFullYear() === year &&
      d.getMonth() === month &&
      d.getDate() === dayNum
    );

    if (isToday) {
      cell.classList.add('today');
      cell.setAttribute('aria-current', 'date');
      cell.setAttribute('title', 'Today');
    }
    else if (isHighVolumeDay) {
      cell.classList.add('high-volume');
      cell.setAttribute('title', 'High Volume Day');
    }

    grid.appendChild(cell);
  }
}

// Navigation
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();

  document.getElementById('prevBtn').addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
  });

  document.getElementById('todayBtn').addEventListener('click', () => {
    viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
  });

  // PWA: register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
  }

  // Install prompt handling
  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });

  installBtn.addEventListener('click', async () => {
    installBtn.hidden = true;
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    installBtn.hidden = true;
  });
});
