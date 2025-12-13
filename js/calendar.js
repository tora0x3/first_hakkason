import { state, saveData } from './data.js';
import { getTodayString, getDefaultTagColor, getJapaneseType, showToast } from './utils.js';
import { askDeleteMemo, askDeleteTag } from './modal.js';

let currentCalendarDate = new Date();
let selectedDateStr = getTodayString();

const calendarTableBody = document.getElementById('calendarTableBody');
const currentMonthDisplay = document.getElementById('currentMonth');
const selectedDateInfo = document.getElementById('selectedDateInfo');
const selectedDateTitle = document.getElementById('selectedDateTitle');
const selectedDateTaskList = document.getElementById('selectedDateTaskList');
const memoInput = document.getElementById('memoInput');
const tagNameInput = document.getElementById('tagNameInput');
const tagColorInput = document.getElementById('tagColorInput');
const dailyMemoList = document.getElementById('dailyMemoList');
const savedTagsList = document.getElementById('savedTagsList');

export function getSelectedDateStr() { return selectedDateStr; }

export function changeMonth(d) { 
    currentCalendarDate.setMonth(currentCalendarDate.getMonth()+d); 
    renderCalendarView(); 
    selectedDateInfo.classList.add('is-hidden'); 
}

export function renderCalendarView() {
    const y=currentCalendarDate.getFullYear(), m=currentCalendarDate.getMonth();
    const first=new Date(y,m,1), last=new Date(y,m+1,0);
    const start = first.getDay(); 

    currentMonthDisplay.textContent=`${y}年 ${m+1}月`; calendarTableBody.innerHTML='';
    let d=1;
    for(let i=0;i<6;i++){
        if(d>last.getDate()) break;
        const row=document.createElement('tr');
        for(let j=0;j<7;j++){
            const cell=document.createElement('td');
            if((i===0&&j<start)||d>last.getDate()){ cell.textContent=''; row.appendChild(cell); continue; }
            const ymd=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            cell.innerHTML=`<span class="calendar-day-number ${ymd===getTodayString()?'is-today':''}">${d}</span>`;
            
            if(state.calendarMemos[ymd] && state.calendarMemos[ymd].length > 0) {
                 const dot=document.createElement('div');
                 dot.className = 'dot-memo'; 
                 cell.appendChild(dot);
            }
            const doneTasksForDay = state.tasks.filter(t => t.isDone && t.lastDoneDate === ymd);
            doneTasksForDay.forEach(t => {
                const dot = document.createElement('div');
                dot.className = `calendar-task-dot dot-${t.type}`;
                cell.appendChild(dot);
            });
            const doneCount = doneTasksForDay.length;
            if (doneCount > 0) {
                if (doneCount >= 5) cell.classList.add('heat-lvl-4');
                else if (doneCount >= 3) cell.classList.add('heat-lvl-3');
                else if (doneCount >= 2) cell.classList.add('heat-lvl-2');
                else cell.classList.add('heat-lvl-1');
            }
            if(ymd===selectedDateStr) cell.classList.add('selected-day');
            cell.onclick=()=>{ document.querySelectorAll('.selected-day').forEach(e=>e.classList.remove('selected-day')); cell.classList.add('selected-day'); showDateDetails(ymd); };
            row.appendChild(cell); d++;
        }
        calendarTableBody.appendChild(row);
    }
}

export function showDateDetails(date) {
    selectedDateStr=date; selectedDateInfo.classList.remove('is-hidden'); selectedDateTitle.textContent=`${date} の詳細`;
    memoInput.value = '';
    tagNameInput.value = '';
    tagColorInput.value = getDefaultTagColor();
    renderMemoList(date); 
    selectedDateTaskList.innerHTML='';
    const ts = state.tasks.filter(t=>(t.isDone&&t.lastDoneDate===date) || (!t.isDone&&t.type==='daily') || (!t.isDone&&t.type!=='normal'&&date>=getTodayString()));
    if(ts.length===0) selectedDateTaskList.innerHTML='<li class="empty-history">履歴なし</li>';
    ts.forEach(t=>{
        const li=document.createElement('li'); li.className='cal-task-item';
        li.innerHTML=`<span><span class="badge ${t.type}">${getJapaneseType(t.type)}</span> ${t.text}</span> ${t.isDone?'<span class="status-done">済</span>':''}`;
        selectedDateTaskList.appendChild(li);
    });
}

export function addMemo() {
    if(!selectedDateStr) return;
    const txt = memoInput.value;
    const tName = tagNameInput.value.trim();
    const tCol = tagColorInput.value;
    if(!txt && !tName) { showToast('内容を入力してください'); return; }
    if(tName && !state.savedTags.some(t=>t.name===tName)){
        state.savedTags.push({name:tName,color:tCol});
        localStorage.setItem('feTags',JSON.stringify(state.savedTags));
    }
    if(!state.calendarMemos[selectedDateStr]) state.calendarMemos[selectedDateStr] = [];
    state.calendarMemos[selectedDateStr].push({ text: txt, tag: tName ? { name: tName, color: tCol } : null });
    localStorage.setItem('feMemos',JSON.stringify(state.calendarMemos));
    showToast('メモを追加しました');
    memoInput.value = '';
    renderCalendarView();
    renderMemoList(selectedDateStr);
}

export function renderMemoList(d) {
    const memos = state.calendarMemos[d] || [];
    dailyMemoList.innerHTML = '';
    memos.forEach((m, index) => {
        const item = document.createElement('div');
        item.className = 'memo-list-item';
        let tagHtml = '';
        if(m.tag) {
            tagHtml = `<span class="memo-tag-badge" style="background-color:${m.tag.color}">${m.tag.name}</span>`;
        }
        item.innerHTML = `
            <div class="memo-content">${tagHtml}${m.text || ''}</div>
            <button class="memo-del-btn" onclick="askDeleteMemo(${index})">×</button>
        `;
        dailyMemoList.appendChild(item);
    });
    renderSavedTags();
}

export function renderSavedTags(){
    savedTagsList.innerHTML=''; state.savedTags.forEach((t,i)=>{
        const c=document.createElement('div'); c.className='saved-tag-chip'; c.style.backgroundColor=t.color;
        c.innerHTML=`<span onclick="document.getElementById('tagNameInput').value='${t.name}';document.getElementById('tagColorInput').value='${t.color}'">${t.name}</span><span class="saved-tag-del" onclick="event.stopPropagation();askDeleteTag(${i})">×</span>`;
        savedTagsList.appendChild(c);
    });
}