let currentTeacherId = null;
let teachersData = [];
let currentCategory = 'all';
let searchQuery = '';

async function fetchTeachers() {
    try {
        const res = await fetch('/admin/teacher/getTeachers');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        teachersData = await res.json();
        renderFilteredTeachers();
    } catch (err) {
        console.error('Lỗi tải giảng viên:', err);
        const container = document.getElementById('teacher-cards-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <p class="text-red-500 font-bold text-lg">Không thể tải dữ liệu. Vui lòng thử lại.</p>
                    <p class="text-slate-400 text-sm mt-1">${err.message}</p>
                </div>`;
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

    renderFilteredTeachers();
}

function handleSearch(query) {
    searchQuery = query.trim().toLowerCase();
    renderFilteredTeachers();
}

function renderFilteredTeachers() {
    const container = document.getElementById('teacher-cards-container');
    if (!container) return;

    container.innerHTML = '';

    // Lọc theo cả chuyên ngành VÀ mã giảng viên
    const filtered = teachersData.filter(t => {
        const matchCategory = currentCategory === 'all' || t.teacherMajor === currentCategory;
        const matchSearch = !searchQuery || (t.teacherCode && t.teacherCode.toLowerCase().includes(searchQuery));
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-32 text-center animate-in fade-in zoom-in duration-500">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Không tìm thấy giảng viên phù hợp</p>
                ${searchQuery ? `<p class="text-blue-500 text-[10px] mt-2 font-bold uppercase tracking-widest cursor-pointer hover:underline" onclick="document.getElementById('teacher-search').value=''; handleSearch('')">Xoá tìm kiếm</p>` : ''}
            </div>`;
        return;
    }

    filtered.forEach((t, index) => {
        const card = document.createElement('div');
        card.className = 'group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4';
        card.style.animationDelay = `${index * 50}ms`;

        // Subroles badges logic
        let badgesHtml = '';
        if (t.subRoles?.isLeader) badgesHtml += `<span class="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase border border-amber-100">👑 Leader</span> `;
        if (t.subRoles?.isGVHD) badgesHtml += `<span class="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase border border-blue-100">📋 GVHD</span> `;
        if (t.subRoles?.isGVPB) badgesHtml += `<span class="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-lg text-[9px] font-black uppercase border border-violet-100">🔍 GVPB</span> `;
        if (t.subRoles?.isCouncil) badgesHtml += `<span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase border border-emerald-100">⚖️ HĐ</span> `;

        card.innerHTML = `
            <div class="flex items-start justify-between mb-6">
                <div class="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                    👨‍🏫
                </div>
                <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button onclick="openEditTeacherModalById('${t._id}')" class="w-10 h-10 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onclick="openRoleModalById('${t._id}')" class="w-10 h-10 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </button>
                    <button onclick="deleteTeacher('${t._id}')" class="w-10 h-10 bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>

            <div class="space-y-1 mb-6">
                <p class="text-xs font-black text-blue-600 uppercase tracking-widest">${t.teacherMajor || 'KHÁC'}</p>
                <h3 class="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">${t.fullName}</h3>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">${t.teacherCode} &bull; ${t.teacherDegree || 'Giảng viên'}</p>
            </div>

            <div class="flex flex-wrap gap-2 mb-6">
                ${badgesHtml || '<span class="text-[10px] text-slate-300 italic">Chưa phân nghiệp vụ</span>'}
            </div>

            <div class="pt-6 border-t border-slate-50 space-y-3">
                <div class="flex items-center gap-3 text-slate-500">
                    <svg class="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span class="text-xs font-bold tracking-tight truncate">${t.teacherEmail}</span>
                </div>
                <div class="flex items-center gap-3 text-slate-500">
                    <svg class="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span class="text-xs font-bold tracking-tight">${t.teacherPhone || '--'}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Helpers for opening modals by ID (compatible with filtered list)
function openEditTeacherModalById(id) {
    const t = teachersData.find(x => x._id === id);
    if (!t) return;
    currentTeacherId = t._id;
    document.getElementById('modal-teacher-title').innerText = 'Chỉnh sửa thông tin';
    document.getElementById('t-code').value = t.teacherCode || '';
    document.getElementById('t-name').value = t.fullName || '';
    document.getElementById('t-email').value = t.teacherEmail || '';
    document.getElementById('t-phone').value = t.teacherPhone || '';
    document.getElementById('t-degree').value = t.teacherDegree || '';
    document.getElementById('t-major').value = t.teacherMajor || '';
    showTeacherModal();
}

function openRoleModalById(id) {
    const t = teachersData.find(x => x._id === id);
    if (!t) return;
    currentTeacherId = t._id;
    document.getElementById('role-teacher-name').innerText = t.fullName;
    document.getElementById('select-main-role').value = t.teacherRole || 'Teacher';
    document.getElementById('check-leader').checked = !!(t.subRoles && t.subRoles.isLeader);
    document.getElementById('check-gvhd').checked = !!(t.subRoles && t.subRoles.isGVHD);
    document.getElementById('check-gvpb').checked = !!(t.subRoles && t.subRoles.isGVPB);
    document.getElementById('check-council').checked = !!(t.subRoles && t.subRoles.isCouncil);
    document.getElementById('select-council-pos').value = t.councilPosition || '';
    toggleCouncilSection();
    showRoleModal();
}

function showRoleModal() {
    const m = document.getElementById('modal-roles');
    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        m.querySelector('div').classList.remove('scale-95');
    }, 10);
}

function showTeacherModal() {
    const m = document.getElementById('modal-teacher');
    m.classList.remove('hidden');
    setTimeout(() => {
        m.classList.remove('opacity-0');
        m.querySelector('div').classList.remove('scale-95');
    }, 10);
}

function closeTeacherModal() {
    const m = document.getElementById('modal-teacher');
    m.classList.add('opacity-0');
    m.querySelector('div').classList.add('scale-95');
    setTimeout(() => m.classList.add('hidden'), 300);
}

function closeRoleModal() {
    const m = document.getElementById('modal-roles');
    m.classList.add('opacity-0');
    m.querySelector('div').classList.add('scale-95');
    setTimeout(() => m.classList.add('hidden'), 300);
}

function selectAllRoles() {
    document.getElementById('check-leader').checked = true;
    document.getElementById('check-gvhd').checked = true;
    document.getElementById('check-gvpb').checked = true;
    document.getElementById('check-council').checked = true;
    toggleCouncilSection();
}

function toggleCouncilSection() {
    const section = document.getElementById('council-pos-section');
    if (document.getElementById('check-council').checked) {
        section.classList.remove('opacity-50', 'pointer-events-none');
    } else {
        section.classList.add('opacity-50', 'pointer-events-none');
        document.getElementById('select-council-pos').value = '';
    }
}

async function saveRoles() {
    const data = {
        teacherRole: document.getElementById('select-main-role').value,
        subRoles: {
            isLeader: document.getElementById('check-leader').checked,
            isGVHD: document.getElementById('check-gvhd').checked,
            isGVPB: document.getElementById('check-gvpb').checked,
            isCouncil: document.getElementById('check-council').checked
        },
        councilPosition: document.getElementById('select-council-pos').value || null
    };
    try {
        const res = await fetch('/admin/teacher/update/' + currentTeacherId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) { closeRoleModal(); fetchTeachers(); }
        else alert(result.message);
    } catch (err) { console.error(err); }
}

async function deleteTeacher(id) {
    if (!confirm('Bạn có chắc muốn xoá giảng viên này?')) return;
    try {
        const res = await fetch('/admin/teacher/' + id, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) fetchTeachers(); else alert(result.message);
    } catch (err) { console.error(err); }
}

document.addEventListener('DOMContentLoaded', () => {
    // Form submit (Chỉ dùng cho Update)
    document.getElementById('form-teacher').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentTeacherId) return; // Bảo vệ: Không cho phép tạo mới qua UI này

        const data = {
            teacherCode: document.getElementById('t-code').value,
            fullName: document.getElementById('t-name').value,
            teacherEmail: document.getElementById('t-email').value,
            teacherPhone: document.getElementById('t-phone').value,
            teacherDegree: document.getElementById('t-degree').value,
            teacherMajor: document.getElementById('t-major').value,
        };
        try {
            const res = await fetch('/admin/teacher/update/' + currentTeacherId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) { closeTeacherModal(); fetchTeachers(); } else alert(result.message);
        } catch (err) { console.error(err); }
    });

    // Search Listener
    const searchInput = document.getElementById('teacher-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Sub-role checkboxes to toggle council section
    const councilCheck = document.getElementById('check-council');
    if (councilCheck) councilCheck.addEventListener('change', toggleCouncilSection);

    // Initial load
    fetchTeachers();
});
