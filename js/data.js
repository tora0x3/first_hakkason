export const UNIFIED_COST = { belt: 1, body: 1, bezel: 1, chip: 1, light: 1 };
export const POINTS = { daily: 10, weekly: 20, normal: 10 };
export const ITEM_COSTS = { belt: 100, body: 100, bezel: 100, chip: 100, light: 100 };
export const ITEM_NAMES = { belt: 'ペンキ', body: '筆', bezel: '布', chip: 'キャンバス', light: '設計図' };

export const WALLPAPERS = [
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

// State container
export const state = {
    tasks: JSON.parse(localStorage.getItem('feTasks')) || [],
    totalScore: parseInt(localStorage.getItem('feScore')) || 0,
    inventory: JSON.parse(localStorage.getItem('feItemsV3')) || { belt:0, body:0, bezel:0, chip:0, light:0 },
    streakInfo: JSON.parse(localStorage.getItem('feStreak')) || { count: 0, lastDate: null },
    lastOmikujiDate: localStorage.getItem('feLastOmikuji') || null,
    examDateStr: localStorage.getItem('feExamDate') || null,
    savedTags: JSON.parse(localStorage.getItem('feTags')) || [],
    unlockedWallpapers: JSON.parse(localStorage.getItem('feUnlockedWallpapers')) || [1],
    currentWallpaperId: parseInt(localStorage.getItem('feCurrentWallpaper')) || 1,
    examScores: JSON.parse(localStorage.getItem('feExamScores')) || [],
    calendarMemos: JSON.parse(localStorage.getItem('feMemos')) || {}
};

// Memo Initialization
for (let key in state.calendarMemos) {
    if (!Array.isArray(state.calendarMemos[key])) {
        if (state.calendarMemos[key]) state.calendarMemos[key] = [state.calendarMemos[key]];
        else state.calendarMemos[key] = [];
    }
}

export function saveData() {
    localStorage.setItem('feTasks', JSON.stringify(state.tasks));
    localStorage.setItem('feScore', state.totalScore);
    localStorage.setItem('feItemsV3', JSON.stringify(state.inventory));
    localStorage.setItem('feStreak', JSON.stringify(state.streakInfo));
    localStorage.setItem('feTags', JSON.stringify(state.savedTags));
    localStorage.setItem('feUnlockedWallpapers', JSON.stringify(state.unlockedWallpapers));
    localStorage.setItem('feCurrentWallpaper', state.currentWallpaperId);
    localStorage.setItem('feExamScores', JSON.stringify(state.examScores));
    localStorage.setItem('feMemos', JSON.stringify(state.calendarMemos));
    if(state.lastOmikujiDate) localStorage.setItem('feLastOmikuji', state.lastOmikujiDate);
    if(state.examDateStr) localStorage.setItem('feExamDate', state.examDateStr);
    else localStorage.removeItem('feExamDate');
}