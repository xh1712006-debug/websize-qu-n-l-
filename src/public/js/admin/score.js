let allGrades = [];
let currentCategory = 'pending'; // pending, approved, published
let searchQuery = '';

const scoreTable = document.getElementById('scoreTable');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const statPending = document.getElementById('stat-pending');
const statApproved = document.getElementById('stat-approved');
const statPublished = document.getElementById('stat-published');
const publishAllBtn = document.getElementById('btn-publish-all');

/**
 * INITIAL LOAD
 */
async function init() {
    await fetchData();
}

async function fetchData() {
    showLoading(true);
    try {
        const res = await fetch('/admin/point/getScoreFeedback');
        allGrades = await res.json();
        updateStats();
        render();
    } catch (err) {
        console.error(err);
        scoreTable.innerHTML = `<tr><td colspan="6" class="p-20 text-center text-rose-500 font-bold">Lỗi kết nối cơ sở dữ liệu</td></tr>`;
    } finally {
        showLoading(false);
    }
}

function updateStats() {
    statPending.innerText = allGrades.filter(g => g.status === 'waiting_approval').length;
    statApproved.innerText = allGrades.filter(g => g.status === 'approved' && !g.isPublished).length;
    statPublished.innerText = allGrades.filter(g => g.isPublished).length;
}

/**
 * TAB LOGIC
 */
function switchTab(tab) {
    currentCategory = tab;
    // Update UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-slate-950', 'text-white', 'shadow-lg');
        btn.classList.add('text-slate-400', 'hover:text-slate-900');
    });
    const activeBtn = document.getElementById(`tab-${tab}`);
    activeBtn.classList.add('bg-slate-950', 'text-white', 'shadow-lg');
    activeBtn.classList.remove('text-slate-400', 'hover:text-slate-900');

    // Show/Hide Bulk Publish
    publishAllBtn.style.display = (tab === 'approved') ? 'flex' : 'none';

    render();
}

function handleSearch(val) {
    searchQuery = val.toLowerCase();
    render();
}

/**
 * RENDERING
 */
function render() {
    scoreTable.innerHTML = '';
    
    const filtered = allGrades.filter(g => {
        // Tab Filter
        let tabMatch = false;
        if (currentCategory === 'pending') tabMatch = g.status === 'waiting_approval';
        else if (currentCategory === 'approved') tabMatch = g.status === 'approved' && !g.isPublished;
        else if (currentCategory === 'published') tabMatch = g.isPublished;

        // Search Filter
        const searchMatch = !searchQuery || 
            g.fullName.toLowerCase().includes(searchQuery) || 
            g.studentCode.toLowerCase().includes(searchQuery);

        return tabMatch && searchMatch;
    });

    if (filtered.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    filtered.forEach(g => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 transition-all duration-300 group";
        
        tr.innerHTML = `
            <td class="px-10 py-6">
                <div class="flex items-center gap-5">
                    <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        ${g.fullName.charAt(0)}
                    </div>
                    <div class="flex flex-col">
                        <span class="font-black text-slate-950 tracking-tight leading-none mb-1 cursor-pointer hover:text-indigo-600" onclick="openInspector('${g.id}')">${g.fullName}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${g.studentCode}</span>
                            <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">${g.studentMajor}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-8 text-center tabular-nums font-bold text-slate-500 bg-slate-50/30">${g.avgContent || 0}</td>
            <td class="px-4 py-8 text-center tabular-nums font-bold text-slate-500 bg-slate-50/30">${g.avgPresentation || 0}</td>
            <td class="px-4 py-8 text-center tabular-nums font-bold text-slate-500 bg-slate-50/30">${g.avgQA || 0}</td>
            <td class="px-8 py-8 text-center font-black text-indigo-600 text-xl bg-indigo-50/10">
                ${g.finalScore || '--'}
            </td>
            <td class="px-10 py-8 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="openInspector('${g.id}')" class="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all tooltip" title="Soi chi tiết">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    ${currentCategory === 'approved' ? `
                        <button onclick="publishSingle('${g.id}')" class="px-5 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all">Công bố</button>
                    ` : ''}
                </div>
            </td>
        `;
        scoreTable.appendChild(tr);
    });
}

/**
 * INSPECTOR MODAL
 */
async function openInspector(id) {
    const modal = document.getElementById('modal-inspector');
    const content = document.getElementById('inspector-content');
    const actions = document.getElementById('modal-actions');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    content.innerHTML = '<div class="h-full flex items-center justify-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Đang tải hồ sơ bảo vệ...</div>';
    actions.innerHTML = '';

    try {
        const res = await fetch(`/admin/point/api/detail/${id}`);
        const s = await res.json();

        // Calculate council avg
        let avgCouncil = 0;
        if (s.councilScores?.length) {
            avgCouncil = (s.councilScores.reduce((acc, c) => acc + (c.score || 0), 0) / s.councilScores.length).toFixed(2);
        }

        content.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <!-- Left: Student & Project Info -->
                <div class="lg:col-span-4 space-y-10">
                    <div class="space-y-4">
                        <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Hồ sơ sinh viên</p>
                        <h2 class="text-3xl font-black text-slate-900 leading-tight">${s.studentId.fullName}</h2>
                        <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p class="text-[9px] font-black text-slate-400 uppercase mb-4">Thông tin căn bản</p>
                            <div class="space-y-3">
                                <div class="flex justify-between text-xs font-bold"><span class="text-slate-400">MSSV:</span> <span class="text-slate-900">${s.studentId.studentCode}</span></div>
                                <div class="flex justify-between text-xs font-bold"><span class="text-slate-400">Lớp:</span> <span class="text-slate-900">${s.studentId.studentClass}</span></div>
                                <div class="flex justify-between text-xs font-bold"><span class="text-slate-400">Chuyên ngành:</span> <span class="text-slate-900 text-right">${s.studentId.studentMajor}</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <p class="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Đề tài thực hiện</p>
                        <div class="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 italic font-black text-amber-900 leading-relaxed text-lg shadow-inner">
                            "${s.projectId?.projectName || 'Chưa cập nhật'}"
                        </div>
                    </div>

                    <div class="p-8 bg-indigo-600 rounded-[3rem] text-white shadow-2xl shadow-indigo-200">
                        <p class="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-4">Điểm tổng kết cuối</p>
                        <input type="number" id="final-override" value="${s.finalScore || 0}" step="0.1" min="0" max="10" 
                            class="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-6 text-4xl font-black text-center outline-none focus:bg-white focus:text-indigo-600 transition-all">
                        <p class="text-[9px] font-bold text-center mt-4 opacity-70 italic">* Admin có quyền hiệu chỉnh điểm trước khi chốt</p>
                    </div>
                </div>

                <!-- Right: Detailed Breakdowns -->
                <div class="lg:col-span-8 space-y-12">
                    <!-- Advisor & Reviewer Reviews -->
                    <div class="grid grid-cols-2 gap-8">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hướng dẫn (GVHD)</p>
                                <span class="text-xl font-black text-slate-900">${s.proposedScore?.gvhd || 0}</span>
                            </div>
                            <div class="p-6 bg-slate-50 rounded-2xl text-xs font-medium text-slate-500 italic border border-slate-100 min-h-[100px]">
                                ${s.proposedComment?.gvhd || 'Không có nhận xét'}
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phản biện (GVPB)</p>
                                <span class="text-xl font-black text-slate-900">${s.proposedScore?.gvpb || 0}</span>
                            </div>
                            <div class="p-6 bg-slate-50 rounded-2xl text-xs font-medium text-slate-500 italic border border-slate-100 min-h-[100px]">
                                ${s.proposedComment?.gvpb || 'Không có nhận xét'}
                            </div>
                        </div>
                    </div>

                    <!-- Council Member Matrix -->
                    <div class="space-y-6">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hội đồng bảo vệ công khai (${s.councilScores?.length || 0} TV)</p>
                        <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-50">
                                    <tr class="font-black text-slate-400 uppercase">
                                        <th class="px-6 py-4">Thành viên</th>
                                        <th class="px-4 py-4 text-center">Nội dung</th>
                                        <th class="px-4 py-4 text-center">H.Thức</th>
                                        <th class="px-4 py-4 text-center">P.Biện</th>
                                        <th class="px-6 py-4 text-right">Tổng</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-50 font-bold">
                                    ${(s.councilScores || []).map(cs => `
                                        <tr>
                                            <td class="px-6 py-4 text-slate-900">${cs.teacherId?.fullName}</td>
                                            <td class="px-4 py-4 text-center text-slate-500 font-medium">${cs.criteria?.content || 0}</td>
                                            <td class="px-4 py-4 text-center text-slate-500 font-medium">${cs.criteria?.presentation || 0}</td>
                                            <td class="px-4 py-4 text-center text-slate-500 font-medium">${cs.criteria?.qa || 0}</td>
                                            <td class="px-6 py-4 text-right font-black text-indigo-600">${cs.score || 0}</td>
                                        </tr>
                                    `).join('')}
                                    <tr class="bg-indigo-50/20 border-t-2 border-indigo-100">
                                        <td colspan="4" class="px-6 py-5 font-black uppercase text-[10px] text-indigo-600">Trung bình Hội đồng</td>
                                        <td class="px-6 py-5 text-right font-black text-indigo-600 text-lg">${avgCouncil}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Defense questions & conclusions -->
                    <div class="space-y-4">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Biên bản hỏi & đáp</p>
                        <div class="space-y-4 max-h-48 overflow-y-auto pr-4 custom-scrollbar">
                            ${(s.defenseQuestions || []).map(q => `
                                <div class="bg-slate-50 p-4 rounded-2xl border-l-4 border-indigo-500">
                                    <p class="text-[10px] font-black text-indigo-600 uppercase mb-1">${q.asker || 'Hội đồng'}: "${q.question}"</p>
                                    <p class="text-[11px] font-medium text-slate-600 leading-relaxed">${q.answer || 'Chưa ghi nhận câu trả lời'}</p>
                                </div>
                            `).join('') || '<p class="text-xs text-slate-300 italic">Không có biên bản câu hỏi</p>'}
                        </div>
                    </div>

                    <!-- Admin Note -->
                    <div class="space-y-3">
                         <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ghi chú của Admin (Nội bộ)</p>
                         <textarea id="admin-note" class="w-full bg-slate-950 text-white/80 p-6 rounded-3xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" rows="3" placeholder="Ghi chú về quyết định điều chỉnh điểm hoặc lưu ý cho sinh viên...">${s.adminNote || ''}</textarea>
                    </div>
                </div>
            </div>
        `;

        // Update Modal Buttons
        if (s.status === 'waiting_approval') {
            actions.innerHTML = `
                <button onclick="handleReject('${s._id}')" class="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all">Từ chối & Yêu cầu sửa</button>
                <button onclick="handleCommit('${s._id}')" class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-100">Phê duyệt Điểm</button>
            `;
        } else if (s.status === 'approved' && !s.isPublished) {
            actions.innerHTML = `
                <button onclick="handleCommit '${s._id}')" class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Lưu thay đổi</button>
                <button onclick="publishSingle('${s._id}')" class="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-100">Công bố ngay</button>
            `;
        } else {
             actions.innerHTML = `<span class="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">Đã công bố</span>`;
        }

    } catch (err) {
        console.error(err);
        content.innerHTML = '<div class="text-rose-500 font-bold text-center py-20">Không thể tải thông tin hồ sơ</div>';
    }
}

function closeInspector() {
    document.getElementById('modal-inspector').classList.remove('flex');
    document.getElementById('modal-inspector').classList.add('hidden');
}

/**
 * ACTIONS
 */
async function handleCommit(id) {
    const finalScore = document.getElementById('final-override').value;
    const adminNote = document.getElementById('admin-note').value;

    try {
        const res = await fetch('/admin/point/updateScoreFeedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [{ id, finalScore, adminNote }] })
        });
        const result = await res.json();
        if (result.success) {
            closeInspector();
            await fetchData();
        }
    } catch (err) { console.error(err); }
}

async function handleReject(id) {
    const reason = prompt("Nhập lý do từ chối (Gửi về cho Bộ môn):", "Yêu cầu kiểm tra lại điểm số hội đồng");
    if (reason === null) return;

    try {
        const res = await fetch('/admin/point/api/reject-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [id], reason })
        });
        const result = await res.json();
        if (result.success) {
            closeInspector();
            await fetchData();
        }
    } catch (err) { console.error(err); }
}

async function publishSingle(id) {
    if (!confirm("Bạn có chắc muốn CÔNG BỐ kết quả này cho sinh viên?")) return;
    try {
        const res = await fetch('/admin/point/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [id] })
        });
        const result = await res.json();
        if (result.success) {
            closeInspector();
            await fetchData();
        }
    } catch (err) { console.error(err); }
}

async function bulkPublish() {
    const approvedIds = allGrades.filter(g => g.status === 'approved' && !g.isPublished).map(g => g.id);
    if (!approvedIds.length) return alert("Không có điểm nào đủ điều kiện công bố");

    if (!confirm(`Xác nhận CÔNG BỐ toàn bộ ${approvedIds.length} bảng điểm đã duyệt cho sinh viên?`)) return;

    try {
        const res = await fetch('/admin/point/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: approvedIds })
        });
        const result = await res.json();
        if (result.success) await fetchData();
    } catch (err) { console.error(err); }
}

/**
 * HELPERS
 */
function showLoading(show) {
    loadingState.style.display = show ? 'block' : 'none';
}

// Start
document.addEventListener('DOMContentLoaded', init);