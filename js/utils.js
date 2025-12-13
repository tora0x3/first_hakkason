export function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

export function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
        t.classList.remove('show');
        t.addEventListener('transitionend', () => t.remove());
    }, 3000);
}

export function getJapaneseType(type) {
    if (type === 'daily') return 'デイリー';
    if (type === 'weekly') return '週一';
    return '通常';
}

export function updateTimers() {
    const n = new Date();
    const d = document.getElementById('timer-daily');
    const w = document.getElementById('timer-weekly');
    if(d) d.textContent=`(あと${Math.floor((new Date(n).setHours(24,0,0,0)-n)/3600000)}時間)`;
    if(w) w.textContent=`(あと${Math.floor((new Date(n.getFullYear(),n.getMonth(),n.getDate()+(1+7-n.getDay())%7).setHours(24,0,0,0)-n)/86400000)}日)`;
}