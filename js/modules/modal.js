import { state } from '../store.js';
import { executeTaskDelete, executeBulkDelete } from './tasks.js';
import { executeBuyItem, executeUnlockWallpaper } from './shop.js';
import { executeMemoDelete } from './calendar.js';

// 他モジュールへのブリッジ
import * as Tasks from './tasks.js';
import * as Shop from './shop.js';
import * as Calendar from './calendar.js';

const modal = document.getElementById('actionModal');
const title = document.getElementById('modalTitle');
const msg = document.getElementById('modalMessage');
const btn = document.getElementById('modalConfirmBtn');
const cancel = document.getElementById('modalCancelBtn');

export function initModal() {
    cancel.onclick = closeModal;
    btn.onclick = executeAction;
}

export function confirmAction(actionType, targetData, messageHtml, btnText, btnClass) {
    state.pendingAction = actionType;
    state.pendingTarget = targetData;
    
    title.textContent = '確認';
    msg.innerHTML = messageHtml;
    btn.textContent = btnText;
    btn.className = `modal-btn ${btnClass}`;
    modal.classList.remove('is-hidden');
}

function closeModal() {
    modal.classList.add('is-hidden');
    state.pendingAction = null;
    state.pendingTarget = null;
}

function executeAction() {
    const action = state.pendingAction;
    const target = state.pendingTarget;
    
    switch (action) {
        case 'deleteSingle':
        case 'deleteBulk':
            Tasks.executeTaskDelete(action, target);
            break;
        case 'buyItem':
            Shop.executeBuyItem(target);
            break;
        case 'unlockWallpaper':
            Shop.executeUnlockWallpaper(target);
            break;
        case 'deleteMemo':
        case 'deleteTag':
            Calendar.executeMemoDelete(action, target);
            break;
    }
    closeModal();
}