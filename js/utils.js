export function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

export function getJapaneseType(type) {
    if (type === 'daily') return 'デイリー';
    if (type === 'weekly') return '週一';
    return '通常';
}

export function getDefaultTagColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--default-tag-color').trim();
}

export function showToast(m){ 
    const c=document.getElementById('toastContainer');
    const t=document.createElement('div'); 
    t.className='toast'; t.textContent=m; c.appendChild(t); 
    requestAnimationFrame(()=>t.classList.add('show')); 
    setTimeout(()=>{t.classList.remove('show'); t.addEventListener('transitionend',()=>t.remove())},3000); 
}

export function toggleInventory(h){ 
    const c=h.nextElementSibling; c.classList.toggle('is-closed'); 
    h.querySelector('.toggle-icon').textContent=c.classList.contains('is-closed')?'▲':'▼'; 
}

export function toggleList(id,b){ 
    const l=document.getElementById(id); 
    l.classList.toggle('is-hidden'); 
    b.innerHTML=l.classList.contains('is-hidden')?'▼ 表示':'▼ 隠す'; 
}

// 共通変数
export let displayMode = 'list';
export function setDisplayMode(mode) { displayMode = mode; }