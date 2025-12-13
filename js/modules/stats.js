import { state, saveData } from '../store.js';
import { getTodayString, showToast } from '../utils.js';
import { renderCalendarView } from './calendar.js';

export function initStats() {
    updateScoreDisplay();
    updateStreakDisplay();
    updateExamCountdown();
    updateScoreStats();
    
    document.getElementById('omikujiBtn').onclick = drawOmikuji;
    document.getElementById('setExamDateBtn').onclick = () => {
        document.getElementById('examModal').classList.remove('is-hidden');
        if(state.examDateStr) document.getElementById('examDateInput').value = state.examDateStr;
    };
    document.getElementById('saveExamDateBtn').onclick = () => {
        const v = document.getElementById('examDateInput').value;
        state.examDateStr = v || null;
        if(!v) localStorage.removeItem('feExamDate'); else localStorage.setItem('feExamDate', v);
        updateExamCountdown();
        document.getElementById('examModal').classList.add('is-hidden');
    };
    document.getElementById('closeExamModalBtn').onclick = () => document.getElementById('examModal').classList.add('is-hidden');

    // 成績記録モーダル
    document.getElementById('openScoreModalBtn').onclick = () => {
        document.getElementById('scoreInput').value = '';
        document.getElementById('scoreModal').classList.remove('is-hidden');
    };
    document.getElementById('closeScoreModalBtn').onclick = () => document.getElementById('scoreModal').classList.add('is-hidden');
    document.getElementById('saveScoreBtn').onclick = saveScore;
}

export function updateScoreDisplay() { 
    document.getElementById('score').textContent = state.score; 
}
export function updateStreakDisplay() { 
    document.getElementById('streak-count').textContent = state.streak.count; 
}

export function updateStreakLogic(todayStr) {
    if (state.streak.lastDate === todayStr) return; 
    const y = new Date(); y.setDate(y.getDate()-1);
    const yStr = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
    if (state.streak.lastDate === yStr) state.streak.count++; else state.streak.count = 1;
    state.streak.lastDate = todayStr;
}

export function checkStreakIntegrity() {
    const tStr = getTodayString();
    if (!state.streak.lastDate || state.streak.lastDate === tStr) return;
    const y = new Date(); y.setDate(y.getDate()-1);
    const yStr = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
    if (state.streak.lastDate === yStr) return;
    if (state.streak.count > 0) { state.streak.count = 0; saveData(); showToast('連続記録がリセットされました'); }
}

function updateExamCountdown() {
    const div = document.getElementById('countdownDisplay');
    if(!state.examDateStr){ div.classList.add('is-hidden'); return; }
    const diff = Math.ceil((new Date(state.examDateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0))/86400000);
    document.getElementById('countdownDays').textContent = diff; 
    div.classList.remove('is-hidden');
    if(diff < 0) div.innerHTML = "試験終了！お疲れ様でした";
}

function drawOmikuji() {
    if(state.lastOmikujiDate === getTodayString()){ showToast('本日はもう引きました'); return; }
    const r = Math.random(); 
    let res = '末吉', pt = 5;
    if(r < 0.1){ res = '大吉'; pt = 100; }
    else if(r < 0.3){ res = '中吉'; pt = 50; }
    else if(r < 0.6){ res = '小吉'; pt = 20; }
    else if(r < 0.9){ res = '吉'; pt = 10; }
    
    state.score += pt; 
    state.lastOmikujiDate = getTodayString(); 
    localStorage.setItem('feLastOmikuji', state.lastOmikujiDate);
    updateScoreDisplay(); 
    saveData(); 
    showToast(`今日の運勢: 【${res}】 ${pt}pt獲得！`);
}

function saveScore() {
    const val = parseFloat(document.getElementById('scoreInput').value);
    if (isNaN(val) || val < 0 || val > 100) { showToast('0〜100の間で入力してください'); return; }
    state.examScores.push({ date: getTodayString(), score: val });
    saveData();
    showToast(`成績 ${val}% を記録しました`);
    updateScoreStats();
    document.getElementById('scoreModal').classList.add('is-hidden');
}

function calculateAverageInrange(startDate, endDate) {
    const targets = state.examScores.filter(item => {
        const d = new Date(item.date); d.setHours(12);
        return d >= startDate && d <= endDate;
    });
    if (targets.length === 0) return null;
    return targets.reduce((sum, item) => sum + item.score, 0) / targets.length;
}

export function updateScoreStats() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - dayOfWeek); thisWeekStart.setHours(0,0,0,0);
    const thisWeekEnd = new Date(thisWeekStart); thisWeekEnd.setDate(thisWeekStart.getDate() + 6); thisWeekEnd.setHours(23,59,59,999);
    const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart); lastWeekEnd.setDate(lastWeekStart.getDate() + 6); lastWeekEnd.setHours(23,59,59,999);

    const thisWeekAvg = calculateAverageInrange(thisWeekStart, thisWeekEnd);
    const lastWeekAvg = calculateAverageInrange(lastWeekStart, lastWeekEnd);
    
    document.getElementById('weeklyAverage').textContent = thisWeekAvg !== null ? thisWeekAvg.toFixed(1) : '--';
    const diffEl = document.getElementById('weeklyDiff');
    if (thisWeekAvg !== null && lastWeekAvg !== null) {
        const diff = thisWeekAvg - lastWeekAvg;
        diffEl.textContent = (diff > 0 ? '+' : '') + diff.toFixed(1) + '%';
        diffEl.className = `stat-diff ${diff > 0 ? 'diff-plus' : (diff < 0 ? 'diff-minus' : 'diff-even')}`;
    } else {
        diffEl.textContent = '--'; diffEl.className = 'stat-diff';
    }

    const histList = document.getElementById('weeklyHistory');
    histList.innerHTML = '';
    const thisWeekScores = state.examScores.filter(item => {
        const d = new Date(item.date); d.setHours(12);
        return d >= thisWeekStart && d <= thisWeekEnd;
    }).reverse();
    
    if (thisWeekScores.length === 0) {
        histList.innerHTML = '<div style="text-align:center; color:#ccc;">記録なし</div>';
    } else {
        thisWeekScores.forEach(item => {
            const row = document.createElement('div'); row.className = 'history-item';
            const d = item.date.split('-');
            row.innerHTML = `<span class="history-date">${parseInt(d[1])}/${parseInt(d[2])}</span><span class="history-score">${item.score}%</span>`;
            histList.appendChild(row);
        });
    }
}