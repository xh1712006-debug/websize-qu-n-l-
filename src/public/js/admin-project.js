// admin-project.js — Quản lý Kho Đồ án Admin
let gvpbs = [];
let allProjectsData = [];
let currentCategory = 'all';
let searchQuery = '';

async function fetchGvpbs() {
    try {
        const res = await fetch('/admin/project/getGvpbs');
        gvpbs = await res.json();
    } catch (err) {
        console.error('Lỗi tải danh sách GVPB:', err);
    }
}

async function fetchProjects() {
    try {
        await fetchGvpbs();
        const res = await fetch('/admin/project/getProjects');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        allProjectsData = await res.json();
        renderProjects();
        updateStats(allProjectsData);
    } catch (err) {
        console.error('Lỗi tải đồ án:', err);
        const container = document.getElementById('project-cards-container');
        if (container) {
            container.innerHTML = `<div class="col-span-full py-20 text-center text-red-500 font-bold">Không thể tải dữ liệu. (${err.message})</div>`;
        }
    }
}

function filterByCategory(category) {
    currentCategory = category;
    // Update UI Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('bg-slate-900', 'text-white', 'shadow-lg', 'shadow-slate-200');
            btn.classList.remove('text-slate-500', 'hover:bg-slate-100');
        } else {
            btn.classList.remove('bg-slate-900', 'text-white', 'shadow-lg', 'shadow-slate-200');
            btn.classList.add('text-slate-500', 'hover:bg-slate-100');
        }
    });
    renderProjects();
}

function handleSearch(query) {
    searchQuery = query.trim().toLowerCase();
    renderProjects();
}

function statusLabel(s) {
    const map = {
        'active':   { text: 'Đang thực hiện', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        'open':     { text: 'Mở đăng ký',     cls: 'bg-blue-50 text-blue-600 border-blue-100' },
        'pending':  { text: 'Chờ duyệt',       cls: 'bg-amber-50 text-amber-600 border-amber-100' },
        'closed':   { text: 'Đã đóng',         cls: 'bg-slate-100 text-slate-500 border-slate-200' },
        'defense':  { text: 'Bảo vệ',          cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        'complete': { text: 'Hoàn thành',      cls: 'bg-teal-50 text-teal-600 border-teal-100' },
    };
    return map[s] || { text: s || 'Không rõ', cls: 'bg-slate-100 text-slate-500 border-slate-200' };
}

function renderProjects() {
    const container = document.getElementById('project-cards-container');
    if (!container) return;
    container.innerHTML = '';
    const empty = document.getElementById('emptyProjectsState');

    const filtered = allProjectsData.filter(p => {
        const matchCategory = currentCategory === 'all' || p.major === currentCategory;
        const matchSearch = !searchQuery || 
            (p.inputProject && p.inputProject.toLowerCase().includes(searchQuery)) ||
            (p.technology && p.technology.some(t => t.toLowerCase().includes(searchQuery)));
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        if (empty) empty.classList.remove('hidden');
        container.innerHTML = `
            <div class="col-span-full py-32 text-center animate-in fade-in zoom-in duration-500">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-4xl">📚</div>
                <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Không tìm thấy đồ án phù hợp</p>
                ${searchQuery ? `<p class="text-blue-500 text-[10px] mt-2 font-bold uppercase tracking-widest cursor-pointer hover:underline" onclick="document.getElementById('project-search').value=''; handleSearch('')">Xoá tìm kiếm</p>` : ''}
            </div>`;
        return;
    }
    if (empty) empty.classList.add('hidden');

    filtered.forEach((p, index) => {
        const status = statusLabel(p.statuss);
        const slotFull = p.numberSubmit >= p.numberStudent;
        const slotPct = Math.min(100, Math.round((p.numberSubmit / (p.numberStudent || 1)) * 100));

        let gvpbOptions = `<option value="">-- Chọn GVPB --</option>`;
        gvpbs.forEach(g => {
            gvpbOptions += `<option value="${g._id}" ${p.teacherFeedbackName === g.fullName ? 'selected' : ''}>${g.fullName}</option>`;
        });

        const card = document.createElement('div');
        card.className = 'group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4';
        card.style.animationDelay = `${index * 50}ms`;

        card.innerHTML = `
            <div class="flex items-start justify-between mb-6">
                <div class="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-2xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                    📄
                </div>
                <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <a href="/admin/project/viewStudent/${p._id}" class="w-10 h-10 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </a>
                    <button onclick="deleteProject('${p._id}')" class="w-10 h-10 bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>

            <div class="space-y-1 mb-6">
                <p class="text-[9px] font-black text-blue-600 uppercase tracking-widest">${p.major || 'KỸ THUẬT PHẦN MỀM'}</p>
                <h3 class="text-lg font-black text-slate-900 tracking-tight leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" title="${p.inputProject}">${p.inputProject}</h3>
                <div class="flex flex-wrap gap-1 mt-2">
                    ${p.technology && p.technology.length ? p.technology.map(t => `<span class="px-2 py-0.5 bg-slate-50 text-slate-500 text-[8px] font-black rounded-md uppercase border border-slate-100">${t}</span>`).join('') : ''}
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">GV Hướng dẫn</p>
                    <p class="text-[10px] font-bold text-slate-700 truncate">${p.teacherInstruct}</p>
                </div>
                <div class="p-3 bg-white rounded-2xl border border-slate-200 shadow-inner">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">GV Phản biện</p>
                    <select onchange="updateReviewer('${p._id}', this.value)" class="w-full bg-transparent text-[10px] font-bold text-slate-900 outline-none cursor-pointer appearance-none">
                        ${gvpbOptions}
                    </select>
                </div>
            </div>

            <div class="flex flex-col gap-2 mb-6">
                <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
                    <span class="${slotFull ? 'text-rose-500' : 'text-emerald-600'}">Đã đăng ký: ${p.numberSubmit} / ${p.numberStudent}</span>
                    <span class="text-slate-400">${slotPct}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-1000 ${slotFull ? 'bg-rose-500' : 'bg-emerald-500'}" style="width:${slotPct}%"></div>
                </div>
            </div>

            <div class="pt-6 border-t border-slate-50 flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${status.cls}">
                    <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                    ${status.text}
                </span>
                <span class="text-[9px] font-bold text-slate-300 italic uppercase tracking-tighter">${p.date ? new Date(p.date).toLocaleDateString('vi-VN') : '--'}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

async function updateReviewer(projectId, teacherId) {
    try {
        const res = await fetch('/admin/project/assignReviewer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, teacherId })
        });
        const result = await res.json();
        if (result.success) {
            console.log('Cập nhật GVPB thành công');
            // Cập nhật local data để không phải fetch lại
            const p = allProjectsData.find(x => x._id === projectId);
            if (p) {
                const teacher = gvpbs.find(g => g._id === teacherId);
                p.teacherFeedbackName = teacher ? teacher.fullName : null;
            }
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error('Lỗi khi gán GVPB:', err);
    }
}

function updateStats(data) {
    const el = document.getElementById('stat-total');
    const elActive = document.getElementById('stat-active');
    const elOpen = document.getElementById('stat-open');
    if (el) el.textContent = data.length;
    if (elActive) elActive.textContent = data.filter(function(p){ return p.statuss === 'active'; }).length;
    if (elOpen) elOpen.textContent = data.filter(function(p){ return p.statuss === 'open'; }).length;
}

async function deleteProject(id) {
    if (!confirm('Xóa đồ án này sẽ hủy đăng ký của tất cả sinh viên liên quan. Tiếp tục?')) return;
    try {
        const res = await fetch('/admin/project/' + id, { method: 'DELETE' });
        const result = await res.json();
        if (result.message) { fetchProjects(); }
        else alert('Xóa thất bại');
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

async function finalizeBatch() {
    if (!confirm('Bạn có chắc chắn muốn CHỐT danh sách đồ án không? Việc này sẽ khóa tất cả thông tin đề tài và chuyển sinh viên sang giai đoạn thực hiện.')) return;
    try {
        const res = await fetch('/admin/project/finalizeBatch', { method: 'POST' });
        const result = await res.json();
        if (result.success) {
            alert(result.message);
            fetchProjects();
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchProjects();
});
