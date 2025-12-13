import { state, saveData, POINTS } from './data.js';
import { getJapaneseType, getTodayString, showToast, displayMode } from './utils.js';
import { updateScoreDisplay, updateStreakDisplay, updateStreakLogic } from './stats.js';
import { renderCalendarView, showDateDetails, getSelectedDateStr } from './calendar.js';
import { askDeleteTask } from './modal.js'; // モーダル呼び出し

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
        
        // HTML文字列内にonclickを仕込む。あとでwindowに登録する必要あり。
        li.innerHTML = `<span class="badge ${task.type}">${getJapaneseType(task.type)}</span>
        <span class="task-text ${task.isDone?'done':''}">${task.text}</span>
        <div class="action-buttons">
            <button class="delete-btn" onclick="askDeleteTask(${task.id})">削除</button>
            <button class="${btnClass}" onclick="toggleTask(${task.id})">${btnText}</button>
        </div>`;
        
        let k = task.type + (task.isDone ? 'Completed' : '');
        if(listElements[k]) listElements[k].appendChild(li);
    });
}

export function addTask() {
    const input = document.getElementById('taskInput');
    const typeSelect = document.getElementById('taskType');
    _addTaskProcess(input.value, typeSelect.value);
    input.value = '';
}

function _addTaskProcess(text, type) {
    if (text.trim() === '') return;
    state.tasks.push({ id: Date.now(), text: text, type: type, isDone: false, lastDoneDate: null });
    saveData(); renderTasks(); showToast('タスクを追加しました');
}

export function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const today = getTodayString();
    const selectedDateStr = getSelectedDateStr();
    let pt = POINTS[task.type];

    if (!task.isDone && task.type !== 'normal' && selectedDateStr < today) {
        showToast('過去の日付のタスクは完了できません'); return;
    }
    if (task.isDone) {
        task.isDone = false; task.lastDoneDate = null;
        state.totalScore = Math.max(0, state.totalScore - pt);
    } else {
        task.isDone = true; task.lastDoneDate = selectedDateStr || today;
        state.totalScore += pt;
        updateStreakLogic(today);
        showToast(`完了！ +${pt}pt`);
    }
    updateScoreDisplay(); updateStreakDisplay(); saveData(); renderTasks();
    if(displayMode==='calendar') { renderCalendarView(); showDateDetails(selectedDateStr); }
}

export function checkResetLogic(){
    const t=getTodayString(), m=new Date(); m.setDate(m.getDate()+(m.getDay()===0?-6:1)-m.getDay()); const mStr=m.toISOString().split('T')[0];
    let ch=false; state.tasks.forEach(task=>{ if(!task.isDone)return; if(task.type==='daily'&&task.lastDoneDate!==t){task.isDone=false;task.lastDoneDate=null;ch=true;} if(task.type==='weekly'&&task.lastDoneDate<mStr){task.isDone=false;task.lastDoneDate=null;ch=true;} });
    if(ch) saveData();
}