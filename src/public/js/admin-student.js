let currentMajor = 'all';
let currentStatus = 'all';
let searchQuery = '';

async function fetchStudents() {
    try {
        const res = await fetch('/admin/student/getStudents');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        studentsData = await res.json();
        renderFilteredStudents();
    } catch (err) {
        console.error('Lỗi tải sinh viên:', err);
        const container = document.getElementById('student-cards-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <p class="text-red-500 font-bold text-lg">Không thể tải dữ liệu sinh viên. Vui lòng thử lại.</p>
                    <p class="text-slate-400 text-sm mt-1">${err.message}</p>
                </div>`;
        }
    }
}

function filterByMajor(major) {
    currentMajor = major;
    document.querySelectorAll('.major-tab-btn').forEach(btn => {
        if (btn.dataset.major === major) {
            btn.classList.add('bg-slate-900', 'text-white', 'shadow-lg', 'shadow-slate-200');
            btn.classList.remove('text-slate-500', 'hover:bg-slate-100');
        } else {
            btn.classList.remove('bg-slate-900', 'text-white', 'shadow-lg', 'shadow-slate-200');
            btn.classList.add('text-slate-500', 'hover:bg-slate-100');
        }
    });
    renderFilteredStudents();
}

function filterByStatus(status) {
    currentStatus = status;
    document.querySelectorAll('.status-tab-btn').forEach(btn => {
        if (btn.dataset.status === status) {
            btn.classList.add('bg-white', 'text-blue-600', 'shadow-sm', 'border', 'border-blue-100');
            btn.classList.remove('text-slate-400', 'hover:text-slate-600');
        } else {
            btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm', 'border', 'border-blue-100');
            btn.classList.add('text-slate-400', 'hover:text-slate-600');
        }
    });
    renderFilteredStudents();
}

function handleSearch(query) {
    searchQuery = query.trim().toLowerCase();
    renderFilteredStudents();
}

function renderFilteredStudents() {
    const container = document.getElementById('student-cards-container');
    if (!container) return;

    container.innerHTML = '';

    const filtered = studentsData.filter(s => {
        const matchMajor = currentMajor === 'all' || s.studentMajor === currentMajor;
        
        let matchStatus = true;
        if (currentStatus === 'approved') matchStatus = s.status === 'approved';
        else if (currentStatus === 'pending') matchStatus = s.status === 'pending';
        else if (currentStatus === 'none') matchStatus = !s.projectId;
        else if (currentStatus === 'all') matchStatus = true;

        const matchSearch = !searchQuery || 
            (s.studentCode && s.studentCode.toLowerCase().includes(searchQuery)) ||
            (s.fullName && s.fullName.toLowerCase().includes(searchQuery));

        return matchMajor && matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-32 text-center animate-in fade-in zoom-in duration-500">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Không tìm thấy sinh viên phù hợp</p>
                ${searchQuery ? `<p class="text-blue-500 text-[10px] mt-2 font-bold uppercase tracking-widest cursor-pointer hover:underline" onclick="document.getElementById('student-search').value=''; handleSearch('')">Xoá tìm kiếm</p>` : ''}
            </div>`;
        return;
    }

    filtered.forEach((s, index) => {
        const card = document.createElement('div');
        card.className = 'group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4';
        card.style.animationDelay = `${index * 50}ms`;

        const hasProject = s.projectId;
        const statusBadge = hasProject
            ? `<span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase border border-emerald-100">✔ Đã đăng ký</span>`
            : `<span class="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase border border-rose-100">✘ Chưa đăng ký</span>`;

        card.innerHTML = `
            <div class="flex items-start justify-between mb-6">
                <div class="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                    ${s.fullName ? s.fullName.charAt(0).toUpperCase() : '?'}
                </div>
                <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button onclick="openEditModalById('${s._id}')" class="w-10 h-10 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onclick="deleteStudent('${s._id}')" class="w-10 h-10 bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>

            <div class="space-y-1 mb-6">
                <p class="text-xs font-black text-blue-600 uppercase tracking-widest">${s.studentMajor || 'KHÁC'}</p>
                <h3 class="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">${s.fullName}</h3>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">${s.studentCode} &bull; Lớp: ${s.studentClass || 'N/A'}</p>
            </div>

            <div class="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                    Đồ án tốt nghiệp 
                    ${statusBadge}
                </p>
                <p class="text-xs font-bold text-slate-700 leading-snug line-clamp-1 italic">
                    ${s.projectName || 'Chưa đăng ký đồ án'}
                </p>
            </div>

            <div class="pt-2 flex items-center gap-3 text-slate-400">
                <svg class="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span class="text-[10px] font-bold tracking-tight truncate">${s.studentEmail}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function openEditModalById(id) {
    const s = studentsData.find(x => x._id === id);
    if (!s) return;
    currentStudentId = s._id;
    document.getElementById('modal-title').innerText = 'Chỉnh sửa sinh viên';
    document.getElementById('student-id').value = s._id;
    document.getElementById('input-code').value = s.studentCode || '';
    document.getElementById('input-name').value = s.fullName || '';
    document.getElementById('input-email').value = s.studentEmail || '';
    document.getElementById('input-class').value = s.studentClass || '';
    document.getElementById('input-major').value = s.studentMajor || '';
    showModal();
}

function showModal() {
    const modal = document.getElementById('modal-student');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('modal-student');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

async function deleteStudent(id) {
    if (!confirm('Bạn có chắc muốn xoá/reset dữ liệu sinh viên này? Thao tác này sẽ dọn dẹp toàn bộ đồ án, báo cáo và điểm số.')) return;
    try {
        const res = await fetch(`/admin/student/delete/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) fetchStudents(); else alert(result.message);
    } catch (err) { console.error(err); }
}

document.addEventListener('DOMContentLoaded', () => {
    // Search Listener
    const searchInput = document.getElementById('student-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Form submit
    document.getElementById('form-student').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('student-id').value;
        const data = {
            studentCode: document.getElementById('input-code').value,
            fullName: document.getElementById('input-name').value,
            studentEmail: document.getElementById('input-email').value,
            studentClass: document.getElementById('input-class').value,
            studentMajor: document.getElementById('input-major').value,
        };
        try {
            const res = await fetch(`/admin/student/update/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) { closeModal(); fetchStudents(); } else alert(result.message);
        } catch (err) { console.error(err); }
    });

    // Initial load
    fetchStudents();
});
