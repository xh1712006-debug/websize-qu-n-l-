const reportListAdd = document.querySelector('#reportList')
const modals = document.querySelector('#modal')
let allReports = []
let allStudents = []
let currentTab = 'chờ duyệt'

function closeModal(){
    modals.classList.add('hidden')
    modals.classList.remove('flex')
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'border-blue-500', 'text-blue-600', 'bg-slate-50', 'border-slate-100', 'text-slate-400', 'border-emerald-500', 'text-emerald-600', 'border-amber-400', 'text-amber-600', 'border-rose-500', 'text-rose-600');
        btn.classList.add('bg-slate-50', 'border-slate-50', 'text-slate-400');
    });

    const tabId = tab === 'chờ duyệt' ? 'tab-waiting' : tab === 'đã duyệt' ? 'tab-approved' : 'tab-rejected';
    const activeBtn = document.getElementById(tabId);
    activeBtn.classList.remove('bg-slate-50', 'border-slate-50', 'text-slate-400');
    
    const colorClass = tab === 'chờ duyệt' ? 'border-amber-400 text-amber-600' : 
                      tab === 'đã duyệt' ? 'border-emerald-500 text-emerald-600' : 
                      'border-rose-500 text-rose-600';
    activeBtn.classList.add('bg-white', ...colorClass.split(' '));

    const indicator = document.getElementById('tab-indicator');
    indicator.style.width = '100%';
    if (tab === 'chờ duyệt') {
        indicator.className = 'absolute top-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500';
    } else if (tab === 'đã duyệt') {
        indicator.className = 'absolute top-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500';
    } else {
        indicator.className = 'absolute top-0 left-0 h-1.5 bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500';
    }

    renderTable();
}

async function getReport(){
    try{
        const res = await fetch('/teacher/report/getReport')
        const data = await res.json()
        
        allReports = data.report || []
        allStudents = data.students || []

        // Update counts
        const counts = {
            waiting: allReports.filter(r => r.status === 'chờ duyệt').length,
            approved: allReports.filter(r => r.status === 'đã duyệt').length,
            rejected: allReports.filter(r => r.status === 'yêu cầu nộp lại').length
        };

        document.getElementById('count-waiting').innerText = counts.waiting;
        document.getElementById('count-approved').innerText = counts.approved;
        document.getElementById('count-rejected').innerText = counts.rejected;
        document.getElementById('header-pending-count').innerText = counts.waiting;

        renderTable();
    }
    catch(err){
        console.error('getReport Error:', err)
    }
}

function renderTable() {
    reportListAdd.innerHTML = '';
    const filteredReports = allReports.filter(r => r.status === currentTab);

    if (filteredReports.length === 0) {
        document.getElementById('emptyReport').classList.remove('hidden');
        document.querySelector('.bg-white.rounded-\\[2\\.5rem\\]').classList.add('hidden');
        return;
    }

    document.getElementById('emptyReport').classList.add('hidden');
    document.querySelector('.bg-white.rounded-\\[2\\.5rem\\]').classList.remove('hidden');

    filteredReports.forEach(report => {
        // Find corresponding student (by index or searching)
        // Since the backend sends arrays index-aligned:
        const studentIndex = allReports.indexOf(report);
        const student = allStudents[studentIndex];

        if (!student) return;

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/50 transition-all duration-300';
        
        const date = new Date(report.updatedAt).toLocaleDateString('vi-VN');
        
        let statusBadge = '';
        if (report.status === 'chờ duyệt') {
            statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-[9px] font-black uppercase border border-amber-100 animate-pulse">⏳ Chờ duyệt</span>';
        } else if (report.status === 'đã duyệt') {
            statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase border border-emerald-100">✅ Đạt</span>';
        } else {
            statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-[9px] font-black uppercase border border-rose-100">❌ Cần sửa</span>';
        }

        tr.innerHTML = `
            <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                    <div class="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-sm italic uppercase">
                        ${student.fullName.charAt(0)}
                    </div>
                    <div>
                        <p class="font-black text-slate-900 text-sm leading-tight uppercase">${student.fullName}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">${student.studentCode}</p>
                    </div>
                </div>
            </td>
            <td class="px-8 py-6 max-w-xs">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 italic line-clamp-1">${student.projectName}</p>
                <p class="font-black text-slate-800 text-xs uppercase underline decoration-indigo-200 decoration-2 underline-offset-4">${report.title}</p>
            </td>
            <td class="px-8 py-6 text-center">
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                    <span class="text-[11px] font-bold text-slate-500">${date}</span>
                </div>
            </td>
            <td class="px-8 py-6 text-center">
                ${statusBadge}
            </td>
            <td class="px-8 py-6">
                <div class="flex justify-end gap-2">
                    <button onclick="window.open('/teacher/report/viewFile/${report.fileUrl}', '_blank')" 
                        class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Xem báo cáo">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    ${report.status === 'chờ duyệt' ? `
                        <button onclick="createrModal('${student.id}', '${report._id}', 'approve')" 
                            class="px-5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50">
                            Duyệt
                        </button>
                        <button onclick="createrModal('${student.id}', '${report._id}', 'reject')" 
                            class="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Từ chối">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    ` : `
                        <button disabled class="px-5 bg-slate-50 text-slate-300 border border-slate-100 rounded-xl text-[9px] font-black uppercase italic cursor-not-allowed">
                            Đã chốt
                        </button>
                    `}
                </div>
            </td>
        `;
        reportListAdd.appendChild(tr);
    });
}

function createrModal(studentId, reportId, action) {
    modals.innerHTML = ''
    const div = document.createElement('div')
    div.className = 'bg-white w-full max-w-xl p-10 rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in duration-300'
    
    const isApprove = action === 'approve';
    const title = isApprove ? 'Duyệt bản báo cáo' : 'Yêu cầu chỉnh sửa';
    const accentColor = isApprove ? 'indigo' : 'rose';
    
    div.innerHTML = `
        <button onclick="closeModal()" class="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full flex items-center justify-center transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div class="flex items-center gap-5 mb-8">
            <div class="w-16 h-16 bg-${accentColor}-50 text-${accentColor}-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">
                ${isApprove ? '✨' : '⚠️'}
            </div>
            <div>
                <h3 class="text-2xl font-black text-slate-900 uppercase tracking-tight">${title}</h3>
                <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Hệ thống phản hồi trực tiếp</p>
            </div>
        </div>

        <div class="space-y-6">
            ${isApprove ? `
                <div class="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                    <p class="text-[11px] font-bold text-indigo-600 leading-relaxed italic text-center">
                        Bản báo cáo này sẽ được đánh dấu đạt yêu cầu. Sinh viên sẽ được thông báo về kết quả này.
                    </p>
                </div>
            ` : ''}

            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lời phê / Nhận xét của giảng viên</label>
                <textarea id="teacherFeedback" rows="5" 
                    class="w-full bg-slate-50 border-2 border-transparent focus:border-${accentColor}-500 focus:bg-white rounded-[2rem] p-6 text-slate-700 font-bold outline-none transition-all shadow-inner italic" 
                    placeholder="Hãy để lại lời khuyên cho sinh viên..."></textarea>
            </div>
        </div>

        <div class="flex items-center justify-end gap-4 mt-10 p-2 border-t border-slate-50 pt-8">
            <button onclick="closeModal()" class="px-8 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all">Bỏ qua</button>
            <button onclick="submitReview('${studentId}', '${reportId}', '${action}')" 
                class="px-10 py-5 bg-${isApprove ? 'emerald-600' : 'rose-600'} text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-${accentColor}-100 hover:scale-[1.02] transition-all">
                Xác nhận & Lưu →
            </button>
        </div>
    `;
    modals.innerHTML = '';
    modals.appendChild(div);
    modals.classList.add('flex');
    modals.classList.remove('hidden');
}

async function submitReview(studentId, reportId, action){
    const feedback = document.getElementById('teacherFeedback').value;
    
    if (!feedback) {
        Swal.fire('Chú ý!', 'Vui lòng nhập nhận xét cho sinh viên', 'warning');
        return;
    }

    const url = action === 'approve' ? '/teacher/report/postRequirement' : '/teacher/report/postRemove';
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentId,
                reportId: reportId,
                feedback: feedback
            })
        });
        const data = await res.json();
        
        Swal.fire({
            title: 'Thành công!',
            text: data.message,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
        
        closeModal();
        getReport();
    }
    catch(err){
        console.error('Submit Error:', err);
        Swal.fire('Lỗi!', 'Không thể kết nối máy chủ', 'error');
    }
}

// Initial fetch
getReport();
switchTab('chờ duyệt');