import { state, saveData, ITEM_COSTS, ITEM_NAMES, WALLPAPERS } from '../store.js';
import { updateScoreDisplay } from './stats.js';
import { showToast } from '../utils.js';
import { confirmAction } from './modal.js';

export function initShop() {
    updateInventoryDisplay();
    renderWallpaperGrid();
    applyWallpaper(state.currentWallpaperId);

    // インベントリ開閉
    document.getElementById('toggleInventoryBtn').onclick = (e) => {
        const c = document.getElementById('inventoryContent');
        c.classList.toggle('is-closed');
        e.currentTarget.querySelector('.toggle-icon').textContent = c.classList.contains('is-closed') ? '▲' : '▼';
    };

    // ショップボタン
    document.getElementById('shopButtons').querySelectorAll('button').forEach(btn => {
        btn.onclick = () => askBuyItem(btn.dataset.item);
    });
}

function updateInventoryDisplay() {
    document.getElementById('count-belt').textContent = state.inventory.belt;
    document.getElementById('count-body').textContent = state.inventory.body;
    document.getElementById('count-bezel').textContent = state.inventory.bezel;
    document.getElementById('count-chip').textContent = state.inventory.chip;
    document.getElementById('count-light').textContent = state.inventory.light;
}

function askBuyItem(itemType) {
    const cost = ITEM_COSTS[itemType];
    const name = ITEM_NAMES[itemType];
    if (state.score < cost) { showToast(`ポイント不足 (必要:${cost}pt)`); return; }
    confirmAction('buyItem', { type: itemType, cost: cost }, `<strong>${name}</strong>を交換しますか？<br>消費: ${cost}pt`, '交換', 'buy');
}

export function executeBuyItem(target) {
    state.score -= target.cost;
    state.inventory[target.type] = (state.inventory[target.type] || 0) + 1;
    saveData();
    updateScoreDisplay();
    updateInventoryDisplay();
    showToast(`${ITEM_NAMES[target.type]}を入手`);
}

function renderWallpaperGrid() {
    const grid = document.getElementById('wallpaperGrid');
    grid.innerHTML = '';
    WALLPAPERS.forEach(wp => {
        const isUnlocked = state.unlockedWallpapers.includes(wp.id);
        const isActive = (state.currentWallpaperId === wp.id);
        const card = document.createElement('div');
        card.className = `wallpaper-card ${isUnlocked ? '' : 'is-locked'} ${isActive ? 'is-active' : ''}`;
        let costText = (!isUnlocked && wp.cost) ? '素材各1個必要' : (isUnlocked ? '解放済み' : '');
        const imgStyle = (isUnlocked && wp.src) ? `background-image: url('${wp.src}');` : '';
        const imgClass = wp.src ? 'wp-image-area' : 'wp-image-area no-image';

        card.innerHTML = `
            <div class="${imgClass}" style="${imgStyle}"></div>
            <div class="wp-info">
                <div class="wp-name">${wp.name}</div>
                <div class="wp-cost">${costText}</div>
                ${!isUnlocked ? 
                    `<button class="wp-btn btn-unlock" data-id="${wp.id}">解放</button>` : 
                    (isActive ? '' : `<button class="wp-btn btn-set" data-id="${wp.id}">設定</button>`)
                }
            </div>
        `;
        grid.appendChild(card);
    });

    // イベント登録
    grid.querySelectorAll('.btn-unlock').forEach(b => b.onclick = () => askUnlockWallpaper(parseInt(b.dataset.id)));
    grid.querySelectorAll('.btn-set').forEach(b => b.onclick = () => setWallpaper(parseInt(b.dataset.id)));
}

function askUnlockWallpaper(id) {
    const wp = WALLPAPERS.find(w => w.id === id);
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
    confirmAction('unlockWallpaper', { id: id }, `素材を各1つ消費して<br><strong>「${wp.name}」</strong><br>を解放しますか？`, '解放する', 'buy');
}

export function executeUnlockWallpaper(target) {
    const wp = WALLPAPERS.find(w => w.id === target.id);
    state.inventory.belt -= 1; state.inventory.body -= 1; state.inventory.bezel -= 1; state.inventory.chip -= 1; state.inventory.light -= 1;
    state.unlockedWallpapers.push(target.id);
    saveData();
    updateInventoryDisplay();
    renderWallpaperGrid();
    showToast(`「${wp.name}」を解放しました！`);
}

function setWallpaper(id) {
    state.currentWallpaperId = id;
    localStorage.setItem('feCurrentWallpaper', id);
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