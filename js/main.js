import { state } from './data.js';
import { renderTasks, addTask, toggleTask, checkResetLogic } from './tasks.js';
import { 
    renderCalendarView, changeMonth, showDateDetails, addMemo, 
    getSelectedDateStr 
} from './calendar.js';
import { 
    renderWallpaperGrid, setWallpaper, applyWallpaper, executeUnlockWallpaper 
} from './wallpaper.js';
import { 
    updateScoreDisplay, updateInventoryDisplay, updateStreakDisplay, 
    checkStreakIntegrity, updateExamCountdown, updateTimers, updateScoreStats,
    drawOmikuji, openExamModal, closeExamModal, saveExamDate,
    openScoreModal, closeScoreModal, saveScore
} from './stats.js';
import { 
    askDeleteTask, confirmBulkDelete, askBuyItem, closeModal, 
    askUnlockWallpaper, askDeleteMemo, askDeleteTag 
} from './modal.js';
import { toggleInventory, toggleList, showToast, setDisplayMode, getTodayString } from './utils.js';

// DOM Elements for Views
const listView = document.getElementById('listView');
const calendarView = document.getElementById('calendarView');
const wallpaperView = document.getElementById('wallpaperView');
const toggleBtns = {
    list: document.getElementById('toggleListBtn'),
    calendar: document.getElementById('toggleCalendarBtn'),
    wallpaper: document.getElementById('toggleWallpaperBtn')
};

function toggleDisplayMode(mode) {
    setDisplayMode(mode);
    Object.values(toggleBtns).forEach(btn => btn.classList.remove('active-toggle'));
    listView.classList.add('is-hidden');
    calendarView.classList.add('is-hidden');
    wallpaperView.classList.add('is-hidden');

    if (mode === 'list') {
        listView.classList.remove('is-hidden');
        toggleBtns.list.classList.add('active-toggle');
        renderTasks();
    } else if (mode === 'calendar') {
        calendarView.classList.remove('is-hidden');
        toggleBtns.calendar.classList.add('active-toggle');
        renderCalendarView();
        showDateDetails(getTodayString());
    } else if (mode === 'wallpaper') {
        wallpaperView.classList.remove('is-hidden');
        toggleBtns.wallpaper.classList.add('active-toggle');
        renderWallpaperGrid();
    }
}

// --- Initialization ---
function init() {
    checkResetLogic();
    checkStreakIntegrity();
    renderTasks();
    updateScoreDisplay();
    updateInventoryDisplay();
    updateStreakDisplay();
    updateExamCountdown(); 
    renderCalendarView();
    applyWallpaper(state.currentWallpaperId);
    renderWallpaperGrid();
    updateScoreStats();
    toggleDisplayMode('list'); 
}

setInterval(() => {
    updateTimers();
    updateExamCountdown(); 
}, 60000);
updateTimers();

// Add Button Listener
// (nullチェックを追加してエラーを防ぐ)
const addBtn = document.getElementById('addBtn');
if (addBtn) addBtn.addEventListener('click', addTask);

const taskInput = document.getElementById('taskInput');
if (taskInput) {
    taskInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') { addTask(); e.preventDefault(); } 
    });
}

// --- Register Global Functions for HTML onClick ---
window.toggleDisplayMode = toggleDisplayMode;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.askDeleteTask = askDeleteTask;
window.confirmBulkDelete = confirmBulkDelete;
window.askBuyItem = askBuyItem;
window.closeModal = closeModal;
window.askUnlockWallpaper = askUnlockWallpaper;
window.executeUnlockWallpaper = executeUnlockWallpaper;
window.setWallpaper = setWallpaper;
window.drawOmikuji = drawOmikuji;
window.changeMonth = changeMonth;
window.addMemo = addMemo;
window.askDeleteMemo = askDeleteMemo;
window.askDeleteTag = askDeleteTag;
window.openExamModal = openExamModal;
window.closeExamModal = closeExamModal;
window.saveExamDate = saveExamDate;
window.openScoreModal = openScoreModal;
window.closeScoreModal = closeScoreModal;
window.saveScore = saveScore;
window.toggleInventory = toggleInventory;
window.toggleList = toggleList;

// Start
init();