import { state, saveData, POINTS } from '../store.js';
import { showToast, getTodayString, getJapaneseType } from '../utils.js';
import { updateScoreDisplay, updateStreakLogic, updateStreakDisplay } from './stats.js';
import { renderCalendarView, showDateDetails } from './calendar.js';
import { confirmAction } from './modal.js';

const listElements = {
    daily: document.getElementById('dailyList'),
    weekly: document.getElementById('weeklyList'),
    normal: document.getElementById('normalList'),
    dailyCompleted: document.getElementById('dailyListCleared'),
    weeklyCompleted: document.getElementById('weeklyListCleared'),
    normalCompleted: document.getElementById('normalListCleared')
};

export function renderTasks() {
    Object.values(listElements).forEach(el => el.innerHTML = '');
    state.tasks.forEach(task => {
        const li = document.createElement('li');
        const btnText = task.isDone ? '戻す' : '完了';
        const btnClass = task.isDone ? 'achieve-btn is-active' : 'achieve-btn';
        
        li.innerHTML = `
            <span class="badge ${task.type}">${getJapaneseType(task.type)}</span>
            <span class="task-text ${task.isDone?'done':''}">${task.text}</span>
            <div class="action-buttons">
                <button class="delete-btn" data-id="${task.id}">削除</button>
                <button class="${btnClass}" data-id="${task.id}">${btnText}</button>
            </div>`;
        
        let k = task.type + (task.isDone ? 'Completed' : '');
        if(listElements[k]) listElements[k].appendChild(li);
    });

    // イベントリスナーの再登録（DOM生成後）
    document.querySelectorAll('.delete-btn').forEach(b => {
        b.onclick = () => askDeleteTask(parseInt(b.dataset.id));
    });
    document.querySelectorAll('.achieve-btn').forEach(b => {
        b.onclick = () => toggleTask(parseInt(b.dataset.id));
    });
}

export function addTask() {
    const input = document.getElementById('taskInput');
    const typeSelect = document.getElementById('taskType');
    const text = input.value;
    const type = typeSelect.value;
    
    if (text.trim() === '') return;
    state.tasks.push({ id: Date.now(), text: text, type: type, isDone: false, lastDoneDate: null });
    saveData();
    renderTasks();
    showToast('タスクを追加しました');
    input.value = '';
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const today = getTodayString();
    let pt = POINTS[task.type];

    if (!task.isDone && task.type !== 'normal' && state.selectedDateStr < today) {
        showToast('過去の日付のタスクは完了できません');
        return;
    }

    if (task.isDone) {
        task.isDone = false; task.lastDoneDate = null;
        state.score = Math.max(0, state.score - pt);
    } else {
        task.isDone = true; task.lastDoneDate = state.selectedDateStr || today;
        state.score += pt;
        updateStreakLogic(today);
        showToast(`完了！ +${pt}pt`);
    }
    
    updateScoreDisplay();
    updateStreakDisplay();
    saveData();
    renderTasks();
    
    // カレンダー表示中なら更新
    const calendarView = document.getElementById('calendarView');
    if (!calendarView.classList.contains('is-hidden')) {
        renderCalendarView();
        showDateDetails(state.selectedDateStr);
    }
}

function askDeleteTask(id) {
    confirmAction('deleteSingle', { id: id }, 'タスクを削除しますか？', '削除', 'delete');
}

export function confirmBulkDelete(type) {
    if(!state.tasks.some(t => t.type === type && t.isDone)){ showToast('削除対象がありません'); return; }
    confirmAction('deleteBulk', { type: type }, '完了済みタスクを全て削除しますか？', '削除', 'delete');
}

export function executeTaskDelete(action, target) {
    if (action === 'deleteSingle') {
        state.tasks = state.tasks.filter(t => t.id !== target.id);
        showToast('削除しました');
    } else if (action === 'deleteBulk') {
        state.tasks = state.tasks.filter(t => !(t.type === target.type && t.isDone));
        showToast('一括削除しました');
    }
    saveData();
    renderTasks();
}

export function checkResetLogic() {
    const t = getTodayString();
    const m = new Date(); 
    m.setDate(m.getDate() + (m.getDay() === 0 ? -6 : 1) - m.getDay()); 
    const mStr = m.toISOString().split('T')[0];
    let ch = false;
    
    state.tasks.forEach(task => { 
        if(!task.isDone) return; 
        if(task.type === 'daily' && task.lastDoneDate !== t){
            task.isDone = false; task.lastDoneDate = null; ch = true;
        } 
        if(task.type === 'weekly' && task.lastDoneDate < mStr){
            task.isDone = false; task.lastDoneDate = null; ch = true;
        } 
    });
    if(ch) {
        saveData();
        renderTasks();
    }
}