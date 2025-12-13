import { renderTasks, addTask, confirmBulkDelete, checkResetLogic } from './modules/tasks.js';
import { initCalendar, renderCalendarView, showDateDetails } from './modules/calendar.js';
import { initShop } from './modules/shop.js';
import { initStats, checkStreakIntegrity, updateExamCountdown } from './modules/stats.js';
import { initModal } from './modules/modal.js';
import { updateTimers, getTodayString } from './utils.js';
import { state } from './store.js';

function init() {
    // リセットロジック・整合性チェック
    checkResetLogic();
    checkStreakIntegrity();

    // 各モジュールの初期化
    initModal();
    renderTasks();
    initCalendar();
    initShop();
    initStats();

    // グローバルイベントリスナー
    document.getElementById('addBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { addTask(); e.preventDefault(); }
    });

    // 表示切り替えボタン
    document.getElementById('toggleListBtn').onclick = () => toggleDisplay('list');
    document.getElementById('toggleCalendarBtn').onclick = () => toggleDisplay('calendar');
    document.getElementById('toggleWallpaperBtn').onclick = () => toggleDisplay('wallpaper');

    // 一括削除ボタン・リスト開閉ボタン (Delegate)
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('bulk-delete-btn')) {
            confirmBulkDelete(e.target.dataset.type);
        }
        if (e.target.classList.contains('toggle-list-btn')) {
            const list = document.getElementById(e.target.dataset.target);
            list.classList.toggle('is-hidden');
            e.target.innerHTML = list.classList.contains('is-hidden') ? '▼ 表示' : '▼ 隠す';
        }
    });

    updateTimers();
    setInterval(() => {
        updateTimers();
        // updateExamCountdownはstats内で管理またはここから呼ぶ
    }, 60000);
}

function toggleDisplay(mode) {
    const views = {
        list: document.getElementById('listView'),
        calendar: document.getElementById('calendarView'),
        wallpaper: document.getElementById('wallpaperView')
    };
    const btns = {
        list: document.getElementById('toggleListBtn'),
        calendar: document.getElementById('toggleCalendarBtn'),
        wallpaper: document.getElementById('toggleWallpaperBtn')
    };

    Object.values(views).forEach(el => el.classList.add('is-hidden'));
    Object.values(btns).forEach(el => el.classList.remove('active-toggle'));

    views[mode].classList.remove('is-hidden');
    btns[mode].classList.add('active-toggle');

    if (mode === 'calendar') {
        state.selectedDateStr = getTodayString();
        renderCalendarView();
        showDateDetails(state.selectedDateStr);
    }
}

// 起動
document.addEventListener('DOMContentLoaded', init);