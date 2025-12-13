import { state, saveData } from './data.js';
import { getTodayString, showToast } from './utils.js';
import { renderCalendarView } from './calendar.js';

const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak-count');
const countdownDisplay = document.getElementById('countdownDisplay');
const countdownDays = document.getElementById('countdownDays');
const invEls = {
    belt: document.getElementById('count-belt'),
    body: document.getElementById('count-body'),
    bezel: document.getElementById('count-bezel'),
    chip: document.getElementById('count-chip'),
    light: document.getElementById('count-light')
};
const examModal = document.getElementById('examModal');
const examDateInput = document.getElementById('examDateInput');
const scoreModal = document.getElementById('scoreModal');
const scoreInput = document.getElementById('scoreInput');
const weeklyAverageDisplay = document.getElementById('weeklyAverage');
const weeklyDiffDisplay = document.getElementById('weeklyDiff');
const weeklyHistoryDisplay = document.getElementById('weeklyHistory');

export function updateScoreDisplay() { scoreDisplay.textContent = state.totalScore; }
export function updateStreakDisplay() { streakDisplay.textContent = state.streakInfo.count; }
export function updateInventoryDisplay() {
    invEls.belt.textContent=state.inventory.belt; invEls.body.textContent=state.inventory.body; 
    invEls.bezel.textContent=state.inventory.bezel; invEls.chip.textContent=state.inventory.chip; 
    invEls.light.textContent=state.inventory.light;
}

export function updateStreakLogic(todayStr) {
    if (state.streakInfo.lastDate === todayStr) return; 
    const y = new Date(); y.setDate(y.getDate()-1);
    const yStr = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
    if (state.streakInfo.lastDate === yStr) state.streakInfo.count++; else state.streakInfo.count = 1;
    state.streakInfo.lastDate = todayStr;
}

export function checkStreakIntegrity() {
    const tStr = getTodayString();
    if (!state.streakInfo.lastDate || state.streakInfo.lastDate === tStr) return;
    const y = new Date(); y.setDate(y.getDate()-1);
    const yStr = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
    if (state.streakInfo.lastDate === yStr) return;
    if (state.streakInfo.count > 0) { state.streakInfo.count = 0; saveData(); showToast('連続記録がリセットされました'); }
}

export function drawOmikuji() {
    if(state.lastOmikujiDate===getTodayString()){ showToast('本日はもう引きました'); return; }
    const r = Math.random(); let res='末吉', pt=5;
    if(r<0.1){res='大吉';pt=100;}else if(r<0.3){res='中吉';pt=50;}else if(r<0.6){res='小吉';pt=20;}else if(r<0.9){res='吉';pt=10;}
    state.totalScore+=pt; state.lastOmikujiDate=getTodayString(); 
    updateScoreDisplay(); saveData(); 
    showToast(`今日の運勢: 【${res}】 ${pt}pt獲得！`);
}

// Exam & Timer
export function updateExamCountdown() {
    if(!state.examDateStr){ countdownDisplay.classList.add('is-hidden'); return; }
    const diff = Math.ceil((new Date(state.examDateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0))/86400000);
    countdownDays.textContent = diff; countdownDisplay.classList.remove('is-hidden');
    if(diff<0) countdownDisplay.innerHTML="試験終了！お疲れ様でした";
}
export function updateTimers() {
    const n=new Date(), d=document.getElementById('timer-daily'), w=document.getElementById('timer-weekly');
    if(d) d.textContent=`(あと${Math.floor((new Date(n).setHours(24,0,0,0)-n)/3600000)}時間)`;
    if(w) w.textContent=`(あと${Math.floor((new Date(n.getFullYear(),n.getMonth(),n.getDate()+(1+7-n.getDay())%7).setHours(24,0,0,0)-n)/86400000)}日)`;
}

// Modals for Exam
export function openExamModal() { if(state.examDateStr) examDateInput.value=state.examDateStr; examModal.classList.remove('is-hidden'); }
export function closeExamModal() { examModal.classList.add('is-hidden'); }
export function saveExamDate() { 
    const v=examDateInput.value; state.examDateStr=v; 
    updateExamCountdown(); renderCalendarView(); saveData(); closeExamModal(); 
}

export function openScoreModal() { scoreInput.value = ''; scoreModal.classList.remove('is-hidden'); scoreInput.focus(); }
export function closeScoreModal() { scoreModal.classList.add('is-hidden'); }
export function saveScore() {
    const val = parseFloat(scoreInput.value);
    if (isNaN(val) || val < 0 || val > 100) { showToast('0〜100の間で入力してください'); return; }
    state.examScores.push({ date: getTodayString(), score: val });
    showToast(`成績 ${val}% を記録しました`);
    saveData(); updateScoreStats(); closeScoreModal();
}

// Stats Logic
export function updateScoreStats() {
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const diffToSun = -dayOfWeek;
    const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() + diffToSun); thisWeekStart.setHours(0,0,0,0);
    const thisWeekEnd = new Date(thisWeekStart); thisWeekEnd.setDate(thisWeekStart.getDate() + 6); thisWeekEnd.setHours(23,59,59,999);
    const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart); lastWeekEnd.setDate(lastWeekStart.getDate() + 6); lastWeekEnd.setHours(23,59,59,999);

    function calculateAverageInrange(s, e) {
        const targets = state.examScores.filter(item => { const d = new Date(item.date); d.setHours(12); return d >= s && d <= e; });
        if (targets.length === 0) return null;
        return targets.reduce((sum, item) => sum + item.score, 0) / targets.length;
    }

    const thisWeekAvg = calculateAverageInrange(thisWeekStart, thisWeekEnd);
    const lastWeekAvg = calculateAverageInrange(lastWeekStart, lastWeekEnd);

    weeklyAverageDisplay.textContent = thisWeekAvg !== null ? thisWeekAvg.toFixed(1) : '--';
    if (thisWeekAvg !== null && lastWeekAvg !== null) {
        const diff = thisWeekAvg - lastWeekAvg;
        weeklyDiffDisplay.textContent = (diff > 0 ? '+' : '') + diff.toFixed(1) + '%';
        weeklyDiffDisplay.className = `stat-diff ${diff > 0 ? 'diff-plus' : (diff < 0 ? 'diff-minus' : 'diff-even')}`;
    } else {
        weeklyDiffDisplay.textContent = '--';
        weeklyDiffDisplay.className = 'stat-diff';
    }

    const thisWeekScores = state.examScores.filter(item => { const d = new Date(item.date); d.setHours(12); return d >= thisWeekStart && d <= thisWeekEnd; });
    weeklyHistoryDisplay.innerHTML = thisWeekScores.length === 0 ? '<div style="text-align:center; color:#ccc;">記録なし</div>' : '';
    [...thisWeekScores].reverse().forEach(item => {
        const row = document.createElement('div'); row.className = 'history-item';
        const dateParts = item.date.split('-'); 
        row.innerHTML = `<span class="history-date">${parseInt(dateParts[1])}/${parseInt(dateParts[2])}</span><span class="history-score">${item.score}%</span>`;
        weeklyHistoryDisplay.appendChild(row);
    });
}