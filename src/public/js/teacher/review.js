const assignedReviewTable = document.querySelector('#assignedReviewTable');
const urlParams = new URLSearchParams(window.location.search);
const currentView = urlParams.get('view') || 'list';

function renderReviewRow(data) {
    const progressClass = data.progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500';
    
    // Determine highlights based on view
    const isProgressView = currentView === 'progress';
    const isReportsView = currentView === 'reports';

    const reportHtml = data.latestReport 
        ? `<a href="/student/report/upload/file/${data.latestReport}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isReportsView ? 'bg-indigo-600 text-white' : 'bg-blue-50 text-blue-600'} text-[10px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
            TẢI BÁO CÁO
           </a>`
        : `<span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Chưa có báo cáo</span>`;

    assignedReviewTable.innerHTML += `
        <tr class="hover:bg-slate-50/50 transition-all duration-300 ${isProgressView ? 'bg-blue-50/30' : ''}">
            <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shadow-sm">
                        ${data.fullName.substring(0, 1)}
                    </div>
                    <div>
                        <p class="font-bold text-slate-900 text-sm leading-tight">${data.fullName}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">${data.studentCode}</p>
                    </div>
                </div>
            </td>
            <td class="px-8 py-6">
                <p class="text-xs font-bold text-slate-600 line-clamp-1" title="${data.projectName}">${data.projectName}</p>
            </td>
            <td class="px-8 py-6 ${isProgressView ? 'ring-2 ring-blue-500/20 bg-blue-50/50' : ''}">
                <div class="flex flex-col gap-2 min-w-[120px]">
                    <div class="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>TIẾN ĐỘ</span>
                        <span class="${isProgressView ? 'text-blue-600 font-black' : 'text-slate-900'}">${data.progress}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div class="h-full ${progressClass} transition-all duration-1000 shadow-sm shadow-blue-200" style="width: ${data.progress}%"></div>
                    </div>
                </div>
            </td>
            <td class="px-8 py-6 text-center ${isReportsView ? 'ring-2 ring-indigo-500/20 bg-indigo-50/50' : ''}">
                ${reportHtml}
            </td>
            <td class="px-8 py-6 text-right">
                <span class="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    ĐANG THEO DÕI
                </span>
            </td>
        </tr>
    `;
}

async function fetchAssignedStudents() {
    try {
        const res = await fetch('/teacher/review/getAssignedStudents');
        const data = await res.json();
        
        assignedReviewTable.innerHTML = '';
        if (data.length === 0) {
            assignedReviewTable.innerHTML = `
                <tr>
                    <td colspan="5" class="px-8 py-20 text-center">
                        <div class="flex flex-col items-center gap-3">
                            <span class="text-4xl opacity-20">📂</span>
                            <p class="text-sm font-bold text-slate-300 uppercase tracking-widest">Chưa có sinh viên nào được phân công phản biện</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(item => renderReviewRow(item));
    } catch (err) {
        console.error(err);
        assignedReviewTable.innerHTML = '<tr><td colspan="5" class="p-8 text-rose-500 font-bold text-center">Lỗi tải dữ liệu</td></tr>';
    }
}

fetchAssignedStudents();
