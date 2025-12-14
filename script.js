/* --- 変数定義 --- */
const input = document.getElementById('taskInput');
const typeSelect = document.getElementById('taskType');
const addBtn = document.getElementById('addBtn');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak-count');
const countdownDisplay = document.getElementById('countdownDisplay');
const countdownDays = document.getElementById('countdownDays');
const examModal = document.getElementById('examModal');
const examDateInput = document.getElementById('examDateInput');

// メモ関連
const memoInput = document.getElementById('memoInput');
const tagNameInput = document.getElementById('tagNameInput');
const tagColorInput = document.getElementById('tagColorInput');
const dailyMemoList = document.getElementById('dailyMemoList');
const savedTagsList = document.getElementById('savedTagsList');

// 成績関連 (入力モーダル)
const scoreModal = document.getElementById('scoreModal');
const scoreInput = document.getElementById('scoreInput');

// 成績関連 (管理画面)
const scoreView = document.getElementById('scoreView');
const thisWeekAverageDisplay = document.getElementById('thisWeekAverage');
const scoreViewWeeklyDiff = document.getElementById('scoreViewWeeklyDiff');
const totalAverageDisplay = document.getElementById('totalAverage');
const maxScoreDisplay = document.getElementById('maxScore');
const scoreHistoryBody = document.getElementById('scoreHistoryBody');

// リスト表示用
const listElements = {
    daily: document.getElementById('dailyList'),
    weekly: document.getElementById('weeklyList'),
    normal: document.getElementById('normalList'),
    dailyCompleted: document.getElementById('dailyListCleared'),
    weeklyCompleted: document.getElementById('weeklyListCleared'),
    normalCompleted: document.getElementById('normalListCleared')
};

// 素材表示用
const invEls = {
    belt: document.getElementById('count-belt'),
    body: document.getElementById('count-body'),
    bezel: document.getElementById('count-bezel'),
    chip: document.getElementById('count-chip'),
    light: document.getElementById('count-light')
};

// 画面切り替え用
const listView = document.getElementById('listView');
const calendarView = document.getElementById('calendarView');
const wallpaperView = document.getElementById('wallpaperView');
const toggleBtns = {
    list: document.getElementById('toggleListBtn'),
    calendar: document.getElementById('toggleCalendarBtn'),
    wallpaper: document.getElementById('toggleWallpaperBtn'),
    score: document.getElementById('toggleScoreBtn')
};

// カレンダー用
const calendarTableBody = document.getElementById('calendarTableBody');
const currentMonthDisplay = document.getElementById('currentMonth');
const selectedDateInfo = document.getElementById('selectedDateInfo');
const selectedDateTitle = document.getElementById('selectedDateTitle');
const selectedDateTaskList = document.getElementById('selectedDateTaskList');

// モーダル
const actionModal = document.getElementById('actionModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

// 新規: 初期化ボタン
const resetButton = document.getElementById('resetDataBtn');

// ▼▼▼ グラフインスタンス保持用変数 ▼▼▼
let scoreChart = null;

/* --- データ定義 --- */
function getDefaultTagColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--default-tag-color').trim();
}

const UNIFIED_COST = { belt: 1, body: 1, bezel: 1, chip: 1, light: 1 };
const WALLPAPERS = [
    { id: 1, name: '夕暮れ', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsL_UyrMb3RJh09uLU2knr82UmhinzsdvHzw&s', cost: null },
    { id: 2, name: '敷石の波紋', src: '画像/敷石の波紋.png', cost: UNIFIED_COST },
    { id: 3, name: '夏夜の花火', src: '画像/夏夜の花火.png', cost: UNIFIED_COST },
    { id: 4, name: '京の都', src: '画像/京の都.png', cost: UNIFIED_COST },
    { id: 5, name: '夕焼けと風車小屋', src: '画像/夕焼けと風車小屋.png', cost: UNIFIED_COST },
    { id: 6, name: '木漏れ日の誘い', src: '画像/木漏れ日の誘い.png', cost: UNIFIED_COST },
    { id: 7, name: '紅葉を映す額縁', src: '画像/紅葉を映す額縁.png', cost: UNIFIED_COST },
    { id: 8, name: '青竹の参道', src: '画像/青竹の参道.png', cost: UNIFIED_COST },
    { id: 9, name: '宵闇に灯る守り火', src: '画像/宵闇に灯る守り火.png', cost: UNIFIED_COST },
    { id: 10, name: '電光石火', src: '画像/らいちゅうもどき.png', cost: UNIFIED_COST }
];

const POINTS = { daily: 10, weekly: 20, normal: 10 };
const ITEM_COSTS = { belt: 100, body: 100, bezel: 100, chip: 100, light: 100 };
const ITEM_NAMES = { belt: 'ペンキ', body: '筆', bezel: '布', chip: 'キャンバス', light: '設計図' };

/* --- データ読み込み --- */
let tasks = JSON.parse(localStorage.getItem('feTasks')) || [];
let totalScore = parseInt(localStorage.getItem('feScore')) || 0;
let inventory = JSON.parse(localStorage.getItem('feItemsV3')) || { belt:0, body:0, bezel:0, chip:0, light:0 };
let streakInfo = JSON.parse(localStorage.getItem('feStreak')) || { count: 0, lastDate: null };
let lastOmikujiDate = localStorage.getItem('feLastOmikuji') || null;
let examDateStr = localStorage.getItem('feExamDate') || null;
let savedTags = JSON.parse(localStorage.getItem('feTags')) || [];
let unlockedWallpapers = JSON.parse(localStorage.getItem('feUnlockedWallpapers')) || [1];
let currentWallpaperId = parseInt(localStorage.getItem('feCurrentWallpaper')) || 1;
let examScores = JSON.parse(localStorage.getItem('feExamScores')) || [];

let calendarMemos = JSON.parse(localStorage.getItem('feMemos')) || {};
for (let key in calendarMemos) {
    if (!Array.isArray(calendarMemos[key])) {
        if (calendarMemos[key]) calendarMemos[key] = [calendarMemos[key]];
        else calendarMemos[key] = [];
    }
}

let displayMode = 'list'; 
let currentCalendarDate = new Date();
let selectedDateStr = getTodayString();
let pendingAction = null; 
let pendingTargetId = null;
let pendingTargetType = null;
let pendingTargetIndex = null;
let pendingMemoIndex = null;


/* --- 初期化・ループ --- */
function init() {
    checkResetLogic();
    checkStreakIntegrity();
    renderTasks();
    updateScoreDisplay();
    updateInventoryDisplay();
    updateStreakDisplay();
    updateExamCountdown(); 
    renderCalendarView();
    applyWallpaper(currentWallpaperId);
    renderWallpaperGrid();
    
    // 初回レンダリング
    renderScoreView();
    toggleDisplayMode('list'); 
}

setInterval(() => {
    updateTimers();
    updateExamCountdown(); 
}, 60000);
updateTimers();

/* --- 画面切り替え --- */
function toggleDisplayMode(mode) {
    displayMode = mode;
    Object.values(toggleBtns).forEach(btn => btn.classList.remove('active-toggle'));
    listView.classList.add('is-hidden');
    calendarView.classList.add('is-hidden');
    wallpaperView.classList.add('is-hidden');
    scoreView.classList.add('is-hidden');

    if (mode === 'list') {
        listView.classList.remove('is-hidden');
        toggleBtns.list.classList.add('active-toggle');
        renderTasks();
    } else if (mode === 'calendar') {
        calendarView.classList.remove('is-hidden');
        toggleBtns.calendar.classList.add('active-toggle');
        selectedDateStr = getTodayString();
        renderCalendarView();
        showDateDetails(selectedDateStr);
    } else if (mode === 'wallpaper') {
        wallpaperView.classList.remove('is-hidden');
        toggleBtns.wallpaper.classList.add('active-toggle');
        renderWallpaperGrid();
    } else if (mode === 'score') {
        scoreView.classList.remove('is-hidden');
        toggleBtns.score.classList.add('active-toggle');
        renderScoreView();
    }
}

/* --- 壁紙機能 --- */
function renderWallpaperGrid() {
    const grid = document.getElementById('wallpaperGrid');
    if(!grid) return;
    grid.innerHTML = '';
    WALLPAPERS.forEach(wp => {
        const isUnlocked = unlockedWallpapers.includes(wp.id);
        const isActive = (currentWallpaperId === wp.id);
        const card = document.createElement('div');
        card.className = `wallpaper-card ${isUnlocked ? '' : 'is-locked'} ${isActive ? 'is-active' : ''}`;
        let costText = (!isUnlocked && wp.cost) ? '素材各1個必要' : (isUnlocked ? '解放済み' : '');
        const imgClass = wp.src ? 'wp-image-area' : 'wp-image-area no-image';
        const imgStyle = (isUnlocked && wp.src) ? `background-image: url('${wp.src}');` : '';

        card.innerHTML = `
            <div class="${imgClass}" style="${imgStyle}"></div>
            <div class="wp-info">
                <div class="wp-name">${wp.name}</div>
                <div class="wp-cost">${costText}</div>
                ${!isUnlocked ? 
                    `<button class="wp-btn btn-unlock" onclick="askUnlockWallpaper(${wp.id})">解放</button>` : 
                    (isActive ? '' : `<button class="wp-btn btn-set" onclick="setWallpaper(${wp.id})">設定</button>`)
                }
            </div>
        `;
        grid.appendChild(card);
    });
}
function askUnlockWallpaper(id) {
    const wp = WALLPAPERS.find(w => w.id === id);
    if (!wp) return;
    const missing = [];
    if ((inventory.belt || 0) < 1) missing.push('ペンキ');
    if ((inventory.body || 0) < 1) missing.push('筆');
    if ((inventory.bezel || 0) < 1) missing.push('布');
    if ((inventory.chip || 0) < 1) missing.push('キャンバス');
    if ((inventory.light || 0) < 1) missing.push('設計図');

    if (missing.length > 0) {
        showToast(`素材不足: ${missing.join('、')}`);
        return;
    }
    pendingTargetId = id;
    pendingAction = 'unlockWallpaper';
    modalTitle.textContent = '壁紙解放';
    modalMessage.innerHTML = `素材を各1つ消費して<br><strong>「${wp.name}」</strong><br>を解放しますか？`;
    modalConfirmBtn.textContent = '解放する';
    modalConfirmBtn.className = 'modal-btn buy';
    actionModal.classList.remove('is-hidden');
}

function executeUnlockWallpaper(id) {
    const wp = WALLPAPERS.find(w => w.id === id);
    if (!wp) return;
    inventory.belt -= 1; inventory.body -= 1; inventory.bezel -= 1; inventory.chip -= 1; inventory.light -= 1;
    unlockedWallpapers.push(id);
    localStorage.setItem('feUnlockedWallpapers', JSON.stringify(unlockedWallpapers));
    updateInventoryDisplay(); saveData(); renderWallpaperGrid();
    showToast(`「${wp.name}」を解放しました！`);
}

function setWallpaper(id) {
    currentWallpaperId = id;
    localStorage.setItem('feCurrentWallpaper', currentWallpaperId);
    applyWallpaper(id);
    renderWallpaperGrid();
    showToast('壁紙を変更しました');
}

function applyWallpaper(id) {
    const wp = WALLPAPERS.find(w => w.id === id);
    if (wp && wp.src) {
        document.body.style.backgroundImage = `url('${wp.src}')`;
    } else {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = ''; 
    }
}

/* --- その他の機能 --- */
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
function getJapaneseType(type) {
    if (type === 'daily') return 'デイリー';
    if (type === 'weekly') return '週一';
    return '通常';
}

function addTask() { _addTaskProcess(input.value, typeSelect.value); input.value = ''; }
function _addTaskProcess(text, type) {
    if (text.trim() === '') return;
    tasks.push({ id: Date.now(), text: text, type: type, isDone: false, lastDoneDate: null });
    saveData(); renderTasks(); showToast('タスクを追加しました');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const today = getTodayString();
    let pt = POINTS[task.type];
    if (!task.isDone && task.type !== 'normal' && selectedDateStr < today) {
        showToast('過去の日付のタスクは完了できません'); return;
    }
    if (task.isDone) {
        task.isDone = false; task.lastDoneDate = null;
        totalScore = Math.max(0, totalScore - pt);
    } else {
        task.isDone = true; task.lastDoneDate = selectedDateStr || today;
        totalScore += pt;
        updateStreakLogic(today);
        showToast(`完了！ +${pt}pt`);
    }
    updateScoreDisplay(); updateStreakDisplay(); saveData(); renderTasks();
    if(displayMode==='calendar') { renderCalendarView(); showDateDetails(selectedDateStr); }
}

function updateStreakLogic(todayStr) {
    if (streakInfo.lastDate === todayStr) return; 
    const y = new Date(); y.setDate(y.getDate()-1);
    const yStr = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
    if (streakInfo.lastDate === yStr) streakInfo.count++; else streakInfo.count = 1;
    streakInfo.lastDate = todayStr;
}
function checkStreakIntegrity() {
    const tStr = getTodayString();
    if (!streakInfo.lastDate || streakInfo.lastDate === tStr) return;
    const y = new Date(); y.setDate(y.getDate()-1);
    const yStr = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
    if (streakInfo.lastDate === yStr) return;
    if (streakInfo.count > 0) { streakInfo.count = 0; saveData(); showToast('連続記録がリセットされました'); }
}

function askDeleteTask(id) {
    pendingTargetId = id; pendingAction = 'deleteSingle';
    modalTitle.textContent = '確認'; modalMessage.innerHTML = 'タスクを削除しますか？';
    modalConfirmBtn.textContent = '削除'; modalConfirmBtn.className = 'modal-btn delete';
    actionModal.classList.remove('is-hidden');
}
function confirmBulkDelete(type) {
    if(!tasks.some(t=>t.type===type && t.isDone)){ showToast('削除対象がありません'); return; }
    pendingTargetType = type; pendingAction = 'deleteBulk';
    modalTitle.textContent = '一括削除'; modalMessage.innerHTML = '完了済みタスクを全て削除しますか？';
    modalConfirmBtn.textContent = '削除'; modalConfirmBtn.className = 'modal-btn delete';
    actionModal.classList.remove('is-hidden');
}
function askBuyItem(itemType) {
    const cost = ITEM_COSTS[itemType];
    const name = ITEM_NAMES[itemType];
    if (totalScore < cost) { showToast(`ポイント不足 (必要:${cost}pt)`); return; }
    pendingTargetType = itemType; pendingAction = 'buyItem';
    modalTitle.textContent = '素材交換'; modalMessage.innerHTML = `<strong>${name}</strong>を交換しますか？<br>消費: ${cost}pt`;
    modalConfirmBtn.textContent = '交換'; modalConfirmBtn.className = 'modal-btn buy';
    actionModal.classList.remove('is-hidden');
}
function closeModal() { actionModal.classList.add('is-hidden'); pendingAction = null; }

modalConfirmBtn.addEventListener('click', () => {
    switch (pendingAction) {
        case 'deleteSingle': 
            tasks=tasks.filter(t=>t.id!==pendingTargetId); 
            saveData(); renderTasks(); showToast('削除しました'); 
            if(displayMode==='calendar') showDateDetails(selectedDateStr); 
            break;
        case 'deleteBulk': 
            tasks=tasks.filter(t=>!(t.type===pendingTargetType&&t.isDone)); 
            saveData(); renderTasks(); showToast('一括削除しました'); 
            break;
        case 'buyItem': 
            totalScore-=ITEM_COSTS[pendingTargetType]; 
            inventory[pendingTargetType]=(inventory[pendingTargetType]||0)+1; 
            saveData(); updateScoreDisplay(); updateInventoryDisplay(); 
            showToast(`${ITEM_NAMES[pendingTargetType]}を入手`); 
            break;
        case 'unlockWallpaper': 
            executeUnlockWallpaper(pendingTargetId); 
            break;
        case 'deleteMemo': 
            deleteMemo(pendingMemoIndex); 
            break;
        case 'deleteTag':
            savedTags.splice(pendingTargetIndex, 1);
            localStorage.setItem('feTags', JSON.stringify(savedTags));
            renderSavedTags();
            showToast('タグを削除しました');
            break;
        case 'deleteScore':
            deleteScore(pendingTargetIndex);
            break;
        case 'resetApp': // <-- 追加: 初期化処理の実行
            executeResetData();
            break;
    }
    closeModal();
});

function updateInventoryDisplay() {
    invEls.belt.textContent=inventory.belt; invEls.body.textContent=inventory.body; invEls.bezel.textContent=inventory.bezel; invEls.chip.textContent=inventory.chip; invEls.light.textContent=inventory.light;
}
function updateScoreDisplay() { scoreDisplay.textContent = totalScore; }
function updateStreakDisplay() { streakDisplay.textContent = streakInfo.count; }
function saveData() {
    localStorage.setItem('feTasks', JSON.stringify(tasks));
    localStorage.setItem('feScore', totalScore);
    localStorage.setItem('feItemsV3', JSON.stringify(inventory));
    localStorage.setItem('feStreak', JSON.stringify(streakInfo));
}

function renderTasks() {
    Object.values(listElements).forEach(el => el.innerHTML = '');
    tasks.forEach(task => {
        const li = document.createElement('li');
        const btnText = task.isDone ? '戻す' : '完了';
        const btnClass = task.isDone ? 'achieve-btn is-active' : 'achieve-btn';
        li.innerHTML = `<span class="badge ${task.type}">${getJapaneseType(task.type)}</span>
        <span class="task-text ${task.isDone?'done':''}">${task.text}</span>
        <div class="action-buttons"><button class="delete-btn" onclick="askDeleteTask(${task.id})">削除</button><button class="${btnClass}" onclick="toggleTask(${task.id})">${btnText}</button></div>`;
        let k = task.type + (task.isDone ? 'Completed' : '');
        if(listElements[k]) listElements[k].appendChild(li);
    });
}

function drawOmikuji() {
    if(lastOmikujiDate===getTodayString()){ showToast('本日はもう引きました'); return; }
    const r = Math.random(); let res='末吉', pt=5;
    if(r<0.1){res='大吉';pt=100;}else if(r<0.3){res='中吉';pt=50;}else if(r<0.6){res='小吉';pt=20;}else if(r<0.9){res='吉';pt=10;}
    totalScore+=pt; lastOmikujiDate=getTodayString(); localStorage.setItem('feLastOmikuji', lastOmikujiDate);
    updateScoreDisplay(); saveData(); 
    showToast(`今日の運勢: 【${res}】 ${pt}pt獲得！`);
}

function changeMonth(d) { currentCalendarDate.setMonth(currentCalendarDate.getMonth()+d); renderCalendarView(); selectedDateInfo.classList.add('is-hidden'); }

function renderCalendarView() {
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
            
            if(calendarMemos[ymd] && calendarMemos[ymd].length > 0) {
                 const dot=document.createElement('div');
                 dot.className = 'dot-memo'; 
                 cell.appendChild(dot);
            }
            const doneTasksForDay = tasks.filter(t => t.isDone && t.lastDoneDate === ymd);
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

function showDateDetails(date) {
    selectedDateStr=date; selectedDateInfo.classList.remove('is-hidden'); selectedDateTitle.textContent=`${date} の詳細`;
    memoInput.value = '';
    tagNameInput.value = '';
    tagColorInput.value = getDefaultTagColor();
    renderMemoList(date); 
    selectedDateTaskList.innerHTML='';
    const ts = tasks.filter(t=>(t.isDone&&t.lastDoneDate===date) || (!t.isDone&&t.type==='daily') || (!t.isDone&&t.type!=='normal'&&date>=getTodayString()));
    if(ts.length===0) selectedDateTaskList.innerHTML='<li class="empty-history">履歴なし</li>';
    ts.forEach(t=>{
        const li=document.createElement('li'); li.className='cal-task-item';
        li.innerHTML=`<span><span class="badge ${t.type}">${getJapaneseType(t.type)}</span> ${t.text}</span> ${t.isDone?'<span class="status-done">済</span>':''}`;
        selectedDateTaskList.appendChild(li);
    });
}

function renderMemoList(d) {
    const memos = calendarMemos[d] || [];
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

function addMemo() {
    if(!selectedDateStr) return;
    const txt = memoInput.value;
    const tName = tagNameInput.value.trim();
    const tCol = tagColorInput.value;
    if(!txt && !tName) { showToast('内容を入力してください'); return; }
    if(tName && !savedTags.some(t=>t.name===tName)){
        savedTags.push({name:tName,color:tCol});
        localStorage.setItem('feTags',JSON.stringify(savedTags));
    }
    if(!calendarMemos[selectedDateStr]) calendarMemos[selectedDateStr] = [];
    calendarMemos[selectedDateStr].push({ text: txt, tag: tName ? { name: tName, color: tCol } : null });
    localStorage.setItem('feMemos',JSON.stringify(calendarMemos));
    showToast('メモを追加しました');
    memoInput.value = '';
    renderCalendarView();
    renderMemoList(selectedDateStr);
}

function askDeleteMemo(index) {
    pendingMemoIndex = index; pendingAction = 'deleteMemo';
    modalTitle.textContent = 'メモ削除'; modalMessage.innerHTML = 'このメモを削除しますか？';
    modalConfirmBtn.textContent = '削除'; modalConfirmBtn.className = 'modal-btn delete';
    actionModal.classList.remove('is-hidden');
}

function deleteMemo(index) {
    if(!selectedDateStr || !calendarMemos[selectedDateStr]) return;
    calendarMemos[selectedDateStr].splice(index, 1);
    if(calendarMemos[selectedDateStr].length === 0) delete calendarMemos[selectedDateStr];
    localStorage.setItem('feMemos', JSON.stringify(calendarMemos));
    showToast('メモを削除しました');
    renderCalendarView();
    renderMemoList(selectedDateStr);
}

function renderSavedTags(){
    savedTagsList.innerHTML=''; savedTags.forEach((t,i)=>{
        const c=document.createElement('div'); c.className='saved-tag-chip'; c.style.backgroundColor=t.color;
        c.innerHTML=`<span onclick="tagNameInput.value='${t.name}';tagColorInput.value='${t.color}'">${t.name}</span><span class="saved-tag-del" onclick="event.stopPropagation();askDeleteTag(${i})">×</span>`;
        savedTagsList.appendChild(c);
    });
}
function askDeleteTag(i){ pendingTargetIndex=i; pendingAction='deleteTag'; modalTitle.textContent='タグ削除'; modalMessage.innerHTML=`タグ「${savedTags[i].name}」を削除しますか？`; modalConfirmBtn.textContent='削除'; modalConfirmBtn.className='modal-btn delete'; actionModal.classList.remove('is-hidden'); }

function openExamModal() { if(examDateStr) examDateInput.value=examDateStr; examModal.classList.remove('is-hidden'); }
function closeExamModal() { examModal.classList.add('is-hidden'); }
function saveExamDate() { const v=examDateInput.value; if(!v)localStorage.removeItem('feExamDate'); else localStorage.setItem('feExamDate',v); examDateStr=v; updateExamCountdown(); renderCalendarView(); closeExamModal(); }
function updateExamCountdown() {
    if(!examDateStr){ countdownDisplay.classList.add('is-hidden'); return; }
    const diff = Math.ceil((new Date(examDateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0))/86400000);
    countdownDays.textContent = diff; countdownDisplay.classList.remove('is-hidden');
    if(diff<0) countdownDisplay.innerHTML="試験終了！お疲れ様でした";
}

/* --- 成績管理機能 --- */
function openScoreModal() {
    scoreInput.value = '';
    scoreModal.classList.remove('is-hidden');
    scoreInput.focus();
}

function closeScoreModal() {
    scoreModal.classList.add('is-hidden');
}

function saveScore() {
    const val = parseFloat(scoreInput.value);
    if (isNaN(val) || val < 0 || val > 100) {
        showToast('0〜100の間で入力してください');
        return;
    }
    const today = getTodayString();
    examScores.push({ date: today, score: val });
    localStorage.setItem('feExamScores', JSON.stringify(examScores));
    showToast(`成績 ${val}% を記録しました`);
    
    renderScoreView(); // 成績画面を更新
    closeScoreModal();
}

// 期間内平均計算ヘルパー
function calculateAverageInrange(startDate, endDate) {
    const targets = examScores.filter(item => {
        const d = new Date(item.date);
        d.setHours(12);
        return d >= startDate && d <= endDate;
    });
    if (targets.length === 0) return null;
    const total = targets.reduce((sum, item) => sum + item.score, 0);
    return total / targets.length;
}

// 成績管理画面のレンダリング
function renderScoreView() {
    // 統計計算
    if (examScores.length === 0) {
        thisWeekAverageDisplay.textContent = '--';
        scoreViewWeeklyDiff.textContent = '';
        totalAverageDisplay.textContent = '--';
        maxScoreDisplay.textContent = '--';
        scoreHistoryBody.innerHTML = '<tr><td colspan="3" style="color:#999; padding:20px;">データがありません</td></tr>';
        
        // グラフエリアをクリア
        if (scoreChart) {
            scoreChart.destroy();
            scoreChart = null;
        }
        return;
    }

    // 全期間
    const total = examScores.reduce((sum, v) => sum + v.score, 0);
    const avg = total / examScores.length;
    const max = Math.max(...examScores.map(v => v.score));

    totalAverageDisplay.textContent = avg.toFixed(1);
    maxScoreDisplay.textContent = max.toFixed(1);

    // 今週・先週の計算
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const diffToSun = -dayOfWeek;
    
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() + diffToSun);
    thisWeekStart.setHours(0,0,0,0);
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23,59,59,999);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    lastWeekEnd.setHours(23,59,59,999);

    const thisWeekAvg = calculateAverageInrange(thisWeekStart, thisWeekEnd);
    const lastWeekAvg = calculateAverageInrange(lastWeekStart, lastWeekEnd);

    // 今週平均表示
    if (thisWeekAvg !== null) {
        thisWeekAverageDisplay.textContent = thisWeekAvg.toFixed(1);
    } else {
        thisWeekAverageDisplay.textContent = '--';
    }

    // 先週比表示
    if (thisWeekAvg !== null && lastWeekAvg !== null) {
        const diff = thisWeekAvg - lastWeekAvg;
        let diffStr = '', diffClass = '';
        if (diff > 0) { diffStr = `(先週比 +${diff.toFixed(1)}%)`; diffClass = 'diff-plus'; }
        else if (diff < 0) { diffStr = `(先週比 ${diff.toFixed(1)}%)`; diffClass = 'diff-minus'; }
        else { diffStr = `(先週比 ±0%)`; diffClass = 'diff-even'; }
        
        scoreViewWeeklyDiff.textContent = diffStr;
        scoreViewWeeklyDiff.className = `diff-small ${diffClass}`;
    } else {
        scoreViewWeeklyDiff.textContent = '';
        scoreViewWeeklyDiff.className = 'diff-small';
    }

    // 履歴テーブル（新しい順）
    scoreHistoryBody.innerHTML = '';
    const listForDisplay = examScores.map((item, index) => ({ ...item, originalIndex: index })).reverse();

    listForDisplay.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.date}</td>
            <td style="font-weight:bold; color:#4682b4;">${item.score}%</td>
            <td><button class="del-score-btn" onclick="askDeleteScore(${item.originalIndex})">削除</button></td>
        `;
        scoreHistoryBody.appendChild(tr);
    });

    // グラフ描画呼び出し
    renderScoreChart();
}

// グラフ描画関数 (週ごとに集計)
function renderScoreChart() {
    const ctx = document.getElementById('scoreChart');
    if (!ctx) return;

    // 既存のチャートがあれば破棄
    if (scoreChart) {
        scoreChart.destroy();
    }

    // データ準備 (日付順にソート)
    const sortedScores = [...examScores].sort((a, b) => a.date.localeCompare(b.date));

    // 週ごとの集計
    const weeklyGroups = {};

    sortedScores.forEach(item => {
        // "YYYY-MM-DD" をローカル日付としてパース
        const parts = item.date.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const dayDate = parseInt(parts[2]);
        
        const d = new Date(year, month, dayDate);
        
        // その週の日曜日（開始日）を求める
        const dayOfWeek = d.getDay(); // 0(Sun) - 6(Sat)
        const diffToSun = -dayOfWeek;
        
        const weekStart = new Date(year, month, dayDate);
        weekStart.setDate(weekStart.getDate() + diffToSun);
        
        // キー作成 (YYYY-MM-DD)
        const key = `${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,'0')}-${String(weekStart.getDate()).padStart(2,'0')}`;
        
        if (!weeklyGroups[key]) {
            weeklyGroups[key] = { sum: 0, count: 0, labelDate: weekStart };
        }
        weeklyGroups[key].sum += item.score;
        weeklyGroups[key].count += 1;
    });

    // キーでソート（日付順）
    const sortedKeys = Object.keys(weeklyGroups).sort();

    const labels = [];
    const dataPoints = [];

    sortedKeys.forEach(key => {
        const group = weeklyGroups[key];
        const avg = group.sum / group.count;
        
        // ラベル生成 (例: 12/14週)
        const m = group.labelDate.getMonth() + 1;
        const d = group.labelDate.getDate();
        labels.push(`${m}/${d}週`);
        
        dataPoints.push(avg);
    });

    // チャート生成
    scoreChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '週平均点',
                data: dataPoints,
                borderColor: '#4682b4',
                backgroundColor: 'rgba(70, 130, 180, 0.1)',
                borderWidth: 2,
                pointRadius: 4,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100, // 100点満点
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `平均: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

function askDeleteScore(index) {
    pendingTargetIndex = index;
    pendingAction = 'deleteScore';
    modalTitle.textContent = '成績削除';
    modalMessage.innerHTML = 'この記録を削除しますか？<br>（元に戻せません）';
    modalConfirmBtn.textContent = '削除';
    modalConfirmBtn.className = 'modal-btn delete';
    actionModal.classList.remove('is-hidden');
}

function deleteScore(index) {
    examScores.splice(index, 1);
    localStorage.setItem('feExamScores', JSON.stringify(examScores));
    showToast('成績を削除しました');
    renderScoreView();
}

function toggleInventory(h){ const c=h.nextElementSibling; c.classList.toggle('is-closed'); h.querySelector('.toggle-icon').textContent=c.classList.contains('is-closed')?'▲':'▼'; }
function toggleList(id,b){ const l=document.getElementById(id); l.classList.toggle('is-hidden'); b.innerHTML=l.classList.contains('is-hidden')?'▼ 表示':'▼ 隠す'; }
function showToast(m){ const c=document.getElementById('toastContainer'), t=document.createElement('div'); t.className='toast'; t.textContent=m; c.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{t.classList.remove('show'); t.addEventListener('transitionend',()=>t.remove())},3000); }
function checkResetLogic(){
    const t=getTodayString(), m=new Date(); m.setDate(m.getDate()+(m.getDay()===0?-6:1)-m.getDay()); const mStr=m.toISOString().split('T')[0];
    let ch=false; tasks.forEach(task=>{ if(!task.isDone)return; if(task.type==='daily'&&task.lastDoneDate!==t){task.isDone=false;task.lastDoneDate=null;ch=true;} if(task.type==='weekly'&&task.lastDoneDate<mStr){task.isDone=false;task.lastDoneDate=null;ch=true;} });
    if(ch) saveData();
}
function updateTimers() {
    const n=new Date(), d=document.getElementById('timer-daily'), w=document.getElementById('timer-weekly');
    if(d) d.textContent=`(あと${Math.floor((new Date(n).setHours(24,0,0,0)-n)/3600000)}時間)`;
    if(w) w.textContent=`(あと${Math.floor((new Date(n.getFullYear(),n.getMonth(),n.getDate()+(1+7-n.getDay())%7).setHours(24,0,0,0)-n)/86400000)}日)`;
}

// --- 新規追加: データ初期化機能 ---

/**
 * データ初期化の確認モーダルを表示
 */
function askResetData() {
    pendingAction = 'resetApp';
    modalTitle.textContent = 'データ初期化の最終確認';
    modalMessage.innerHTML = '<strong>全てのタスク、スコア、素材、メモなどのデータ</strong>が削除され、初期状態に戻ります。<br>よろしいですか？';
    modalConfirmBtn.textContent = '全て削除して初期化';
    modalConfirmBtn.className = 'modal-btn delete dangerous';
    actionModal.classList.remove('is-hidden');
}

/**
 * データ初期化を実行 (トースト通知を使用)
 */
function executeResetData() {
    // ローカルストレージ内の全データを削除
    localStorage.clear();
    
    // ユーザーに通知 (トースト通知を使用)
    showToast('全てのアプリケーションデータを削除し、初期化しました。ページをリロードします。');
    
    // トースト通知が表示されるのを待ってからリロードするために、少し遅延させる
    setTimeout(() => {
        // ページをリロードして初期状態から再開
        window.location.reload();
    }, 1000); // 1秒後にリロードを実行
}

/* --- イベントリスナー --- */
addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { addTask(); e.preventDefault(); } });

// 成績入力のEnter対応
scoreInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveScore();
        e.preventDefault();
    }
});

// 新規追加: 初期化ボタンのイベントリスナー
if (resetButton) {
    resetButton.addEventListener('click', askResetData);
}

// 初期化実行
init();