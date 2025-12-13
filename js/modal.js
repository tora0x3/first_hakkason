import { saveData, state, ITEM_COSTS, ITEM_NAMES, WALLPAPERS } from './data.js';
import { renderTasks } from './tasks.js';
import { updateScoreDisplay, updateInventoryDisplay } from './stats.js';
import { renderSavedTags, renderMemoList, getSelectedDateStr, renderCalendarView } from './calendar.js';
import { renderWallpaperGrid, executeUnlockWallpaper } from './wallpaper.js';
import { showToast } from './utils.js';

const actionModal = document.getElementById('actionModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

let pendingAction = null; 
let pendingTargetId = null;
let pendingTargetType = null;
let pendingTargetIndex = null;
let pendingMemoIndex = null;

export function closeModal() { actionModal.classList.add('is-hidden'); pendingAction = null; }

export function askDeleteTask(id) {
    pendingTargetId = id; pendingAction = 'deleteSingle';
    modalTitle.textContent = '確認'; modalMessage.innerHTML = 'タスクを削除しますか？';
    modalConfirmBtn.textContent = '削除'; modalConfirmBtn.className = 'modal-btn delete';
    actionModal.classList.remove('is-hidden');
}

export function confirmBulkDelete(type) {
    if(!state.tasks.some(t=>t.type===type && t.isDone)){ showToast('削除対象がありません'); return; }
    pendingTargetType = type; pendingAction = 'deleteBulk';
    modalTitle.textContent = '一括削除'; modalMessage.innerHTML = '完了済みタスクを全て削除しますか？';
    modalConfirmBtn.textContent = '削除'; modalConfirmBtn.className = 'modal-btn delete';
    actionModal.classList.remove('is-hidden');
}

export function askBuyItem(itemType) {
    const cost = ITEM_COSTS[itemType];
    const name = ITEM_NAMES[itemType];
    if (state.totalScore < cost) { showToast(`ポイント不足 (必要:${cost}pt)`); return; }
    pendingTargetType = itemType; pendingAction = 'buyItem';
    modalTitle.textContent = '素材交換'; modalMessage.innerHTML = `<strong>${name}</strong>を交換しますか？<br>消費: ${cost}pt`;
    modalConfirmBtn.textContent = '交換'; modalConfirmBtn.className = 'modal-btn buy';
    actionModal.classList.remove('is-hidden');
}

export function askUnlockWallpaper(id) {
    const wp = WALLPAPERS.find(w => w.id === id);
    if (!wp) return;
    const missing = [];
    if ((state.inventory.belt || 0) < 1) missing.push('ペンキ');
    if ((state.inventory.body || 0) < 1) missing.push('筆');
    if ((state.inventory.bezel || 0) < 1) missing.push('布');
    if ((state.inventory.chip || 0) < 1) missing.push('キャンバス');
    if ((state.inventory.light || 0) < 1) missing.push('設計図');

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

export function askDeleteMemo(index) {
    pendingMemoIndex = index; pendingAction = 'deleteMemo';
    modalTitle.textContent = 'メモ削除'; modalMessage.innerHTML = 'このメモを削除しますか？';
    modalConfirmBtn.textContent = '削除'; modalConfirmBtn.className = 'modal-btn delete';
    actionModal.classList.remove('is-hidden');
}

export function askDeleteTag(i){ 
    pendingTargetIndex=i; pendingAction='deleteTag'; 
    modalTitle.textContent='タグ削除'; modalMessage.innerHTML=`タグ「${state.savedTags[i].name}」を削除しますか？`; 
    modalConfirmBtn.textContent='削除'; modalConfirmBtn.className='modal-btn delete'; 
    actionModal.classList.remove('is-hidden'); 
}

// 削除実行の実装（循環参照を避けるため、必要な関数は外部からimportするか、ここでロジックを書く）
modalConfirmBtn.addEventListener('click', () => {
    switch (pendingAction) {
        case 'deleteSingle': 
            state.tasks = state.tasks.filter(t=>t.id!==pendingTargetId); 
            saveData(); renderTasks(); showToast('削除しました'); 
            // カレンダー表示中なら更新が必要だが、ここでは簡易的に処理
            const selDate = getSelectedDateStr();
            if(selDate) { 
               // カレンダー詳細再描画ロジックが必要（循環依存回避のため簡易再ロード推奨だが、今回はそのまま）
               // 本当はrenderCalendarDetailsを呼びたい
            }
            break;
        case 'deleteBulk': 
            state.tasks = state.tasks.filter(t=>!(t.type===pendingTargetType&&t.isDone)); 
            saveData(); renderTasks(); showToast('一括削除しました'); 
            break;
        case 'buyItem': 
            state.totalScore -= ITEM_COSTS[pendingTargetType]; 
            state.inventory[pendingTargetType] = (state.inventory[pendingTargetType]||0)+1; 
            saveData(); updateScoreDisplay(); updateInventoryDisplay(); 
            showToast(`${ITEM_NAMES[pendingTargetType]}を入手`); 
            break;
        case 'unlockWallpaper': 
            executeUnlockWallpaper(pendingTargetId); 
            break;
        case 'deleteMemo': 
             const sDate = getSelectedDateStr();
             if(sDate && state.calendarMemos[sDate]) {
                state.calendarMemos[sDate].splice(pendingMemoIndex, 1);
                if(state.calendarMemos[sDate].length === 0) delete state.calendarMemos[sDate];
                saveData(); showToast('メモを削除しました');
                renderCalendarView(); renderMemoList(sDate);
             }
            break;
        case 'deleteTag':
            state.savedTags.splice(pendingTargetIndex, 1);
            saveData(); renderSavedTags(); showToast('タグを削除しました');
            break;
    }
    closeModal();
});