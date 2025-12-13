import { state, saveData, WALLPAPERS } from './data.js';
import { updateInventoryDisplay } from './stats.js';
import { askUnlockWallpaper } from './modal.js';
import { showToast } from './utils.js';

export function renderWallpaperGrid() {
    const grid = document.getElementById('wallpaperGrid');
    if(!grid) return;
    grid.innerHTML = '';
    WALLPAPERS.forEach(wp => {
        const isUnlocked = state.unlockedWallpapers.includes(wp.id);
        const isActive = (state.currentWallpaperId === wp.id);
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

export function executeUnlockWallpaper(id) {
    const wp = WALLPAPERS.find(w => w.id === id);
    if (!wp) return;
    state.inventory.belt -= 1; state.inventory.body -= 1; state.inventory.bezel -= 1; state.inventory.chip -= 1; state.inventory.light -= 1;
    state.unlockedWallpapers.push(id);
    saveData();
    updateInventoryDisplay(); 
    renderWallpaperGrid();
    showToast(`「${wp.name}」を解放しました！`);
}

export function setWallpaper(id) {
    state.currentWallpaperId = id;
    applyWallpaper(id);
    saveData();
    renderWallpaperGrid();
    showToast('壁紙を変更しました');
}

export function applyWallpaper(id) {
    const wp = WALLPAPERS.find(w => w.id === id);
    if (wp && wp.src) {
        document.body.style.backgroundImage = `url('${wp.src}')`;
    } else {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = ''; 
    }
}