import { state, saveData } from '../store.js';
import { getTodayString, getJapaneseType, showToast } from '../utils.js';
import { confirmAction } from './modal.js';

export function initCalendar() {
    state.selectedDateStr = getTodayString();
    document.getElementById('prevMonthBtn').onclick = () => changeMonth(-1);
    document.getElementById('nextMonthBtn').onclick = () => changeMonth(1);
    document.getElementById('addMemoBtn').onclick = addMemo;
}

function changeMonth(d) {
    state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() + d);
    renderCalendarView();
    document.getElementById('selectedDateInfo').classList.add('is-hidden');
}

export function renderCalendarView() {
    const y = state.currentCalendarDate.getFullYear();
    const m = state.currentCalendarDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const start = first.getDay(); 
    const tbody = document.getElementById('calendarTableBody');
    document.getElementById('currentMonth').textContent = `${y}年 ${m+1}月`;
    
    tbody.innerHTML = '';
    let d = 1;
    for(let i=0; i<6; i++){
        if(d > last.getDate()) break;
        const row = document.createElement('tr');
        for(let j=0; j<7; j++){
            const cell = document.createElement('td');
            if((i===0 && j<start) || d > last.getDate()){ 
                cell.textContent = ''; row.appendChild(cell); continue; 
            }
            const ymd = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            cell.innerHTML = `<span class="calendar-day-number ${ymd === getTodayString() ? 'is-today' : ''}">${d}</span>`;
            
            // メモドット
            if(state.calendarMemos[ymd] && state.calendarMemos[ymd].length > 0) {
                 const dot = document.createElement('div');
                 dot.className = 'dot-memo'; 
                 cell.appendChild(dot);
            }
            // タスクドット
            const doneTasks = state.tasks.filter(t => t.isDone && t.lastDoneDate === ymd);
            doneTasks.forEach(t => {
                const dot = document.createElement('div');
                dot.className = `calendar-task-dot dot-${t.type}`;
                cell.appendChild(dot);
            });
            // ヒートマップ
            if (doneTasks.length > 0) {
                if (doneTasks.length >= 5) cell.classList.add('heat-lvl-4');
                else if (doneTasks.length >= 3) cell.classList.add('heat-lvl-3');
                else if (doneTasks.length >= 2) cell.classList.add('heat-lvl-2');
                else cell.classList.add('heat-lvl-1');
            }
            // 選択状態
            if(ymd === state.selectedDateStr) cell.classList.add('selected-day');
            
            cell.onclick = () => { 
                document.querySelectorAll('.selected-day').forEach(e => e.classList.remove('selected-day')); 
                cell.classList.add('selected-day'); 
                showDateDetails(ymd); 
            };
            row.appendChild(cell); d++;
        }
        tbody.appendChild(row);
    }
}

export function showDateDetails(date) {
    state.selectedDateStr = date;
    const info = document.getElementById('selectedDateInfo');
    info.classList.remove('is-hidden');
    document.getElementById('selectedDateTitle').textContent = `${date} の詳細`;
    
    document.getElementById('memoInput').value = '';
    document.getElementById('tagNameInput').value = '';
    renderMemoList(date); 
    
    const taskList = document.getElementById('selectedDateTaskList');
    taskList.innerHTML = '';
    const ts = state.tasks.filter(t => 
        (t.isDone && t.lastDoneDate === date) || 
        (!t.isDone && t.type === 'daily') || 
        (!t.isDone && t.type !== 'normal' && date >= getTodayString())
    );
    
    if(ts.length === 0) taskList.innerHTML = '<li class="empty-history">履歴なし</li>';
    ts.forEach(t => {
        const li = document.createElement('li'); li.className = 'cal-task-item';
        li.innerHTML = `<span><span class="badge ${t.type}">${getJapaneseType(t.type)}</span> ${t.text}</span> ${t.isDone ? '<span class="status-done">済</span>' : ''}`;
        taskList.appendChild(li);
    });
}

function renderMemoList(d) {
    const list = document.getElementById('dailyMemoList');
    list.innerHTML = '';
    const memos = state.calendarMemos[d] || [];
    
    memos.forEach((m, index) => {
        const item = document.createElement('div');
        item.className = 'memo-list-item';
        let tagHtml = m.tag ? `<span class="memo-tag-badge" style="background-color:${m.tag.color}">${m.tag.name}</span>` : '';
        item.innerHTML = `
            <div class="memo-content">${tagHtml}${m.text || ''}</div>
            <button class="memo-del-btn" data-idx="${index}">×</button>
        `;
        list.appendChild(item);
    });
    
    document.querySelectorAll('.memo-del-btn').forEach(b => {
        b.onclick = () => confirmAction('deleteMemo', { index: parseInt(b.dataset.idx) }, 'このメモを削除しますか？', '削除', 'delete');
    });
    renderSavedTags();
}

function addMemo() {
    if(!state.selectedDateStr) return;
    const txt = document.getElementById('memoInput').value;
    const tName = document.getElementById('tagNameInput').value.trim();
    const tCol = document.getElementById('tagColorInput').value;
    
    if(!txt && !tName) { showToast('内容を入力してください'); return; }
    
    if(tName && !state.savedTags.some(t => t.name === tName)){
        state.savedTags.push({ name: tName, color: tCol });
        localStorage.setItem('feTags', JSON.stringify(state.savedTags));
    }
    
    if(!state.calendarMemos[state.selectedDateStr]) state.calendarMemos[state.selectedDateStr] = [];
    state.calendarMemos[state.selectedDateStr].push({ text: txt, tag: tName ? { name: tName, color: tCol } : null });
    
    saveData();
    showToast('メモを追加しました');
    document.getElementById('memoInput').value = '';
    renderCalendarView();
    renderMemoList(state.selectedDateStr);
}

function renderSavedTags(){
    const list = document.getElementById('savedTagsList');
    list.innerHTML = '';
    state.savedTags.forEach((t, i) => {
        const c = document.createElement('div'); 
        c.className = 'saved-tag-chip'; 
        c.style.backgroundColor = t.color;
        c.innerHTML = `<span>${t.name}</span><span class="saved-tag-del" data-idx="${i}">×</span>`;
        
        c.querySelector('span').onclick = () => {
            document.getElementById('tagNameInput').value = t.name;
            document.getElementById('tagColorInput').value = t.color;
        };
        c.querySelector('.saved-tag-del').onclick = (e) => {
            e.stopPropagation();
            confirmAction('deleteTag', { index: i, name: t.name }, `タグ「${t.name}」を削除しますか？`, '削除', 'delete');
        };
        list.appendChild(c);
    });
}

export function executeMemoDelete(action, target) {
    if (action === 'deleteMemo') {
        state.calendarMemos[state.selectedDateStr].splice(target.index, 1);
        if(state.calendarMemos[state.selectedDateStr].length === 0) delete state.calendarMemos[state.selectedDateStr];
        showToast('メモを削除しました');
    } else if (action === 'deleteTag') {
        state.savedTags.splice(target.index, 1);
        showToast('タグを削除しました');
    }
    saveData();
    renderCalendarView();
    renderMemoList(state.selectedDateStr);
}