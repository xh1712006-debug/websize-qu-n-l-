const studentTable = document.querySelector('#studentTable')
const modal = document.querySelector('#modal')
const scoreInput = document.querySelector('#scoreInput')
const closeModalBtn = document.querySelector('#closeModalBtn')
const saveScoreBtn = document.querySelector('#saveScoreBtn')

async function openModal(studentId, projectId, studentName, projectDesc, currentScore, currentComment) {
    try {
        const studentNameEl = document.querySelector('#studentName')
        const projectTextEl = document.querySelector('#projectText')
        const scoreInput = document.querySelector('#scoreInput')
        const commentInput = document.querySelector('#commentInput')
        const projectArea = document.querySelector('#projectDetailArea')
        const toggleBtn = document.querySelector('#toggleDetailBtn')

        studentNameEl.textContent = studentName
        projectTextEl.textContent = projectDesc
        scoreInput.value = (currentScore === 'Chưa có điểm' || currentScore === null) ? '' : currentScore
        commentInput.value = currentComment || ''
        projectArea.classList.add('hidden') // Reset modal state

        toggleBtn.onclick = () => {
            projectArea.classList.toggle('hidden')
        }

        modal.classList.remove('hidden')
        modal.classList.add('flex')
        
        closeModalBtn.onclick = () => {
            modal.classList.add('hidden')
            modal.classList.remove('flex')
        }

        saveScoreBtn.onclick = async () => {
            const res = await fetch('/teacher/scoreFeedback/postScoreFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: studentId,
                    projectId: projectId,
                    score: scoreInput.value,
                    comment: commentInput.value
                }),
            })
            const data = await res.json()
            alert('Cập nhật điểm phản biện thành công!')
            modal.classList.add('hidden')
            modal.classList.remove('flex')
            getScoreFeedback()
        };

    }
    catch (err) {
        console.log(err)
    }
}

function renderScore(data) {
    let statusBadge = data.status
        ? '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider border border-purple-100"><span class="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>Đủ điều điện PB</span>'
        : '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider border border-rose-100"><span class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>Chưa đủ ĐK</span>';

    let scoreDisplay = data.score !== null && data.score !== 'Chưa có điểm'
        ? `<span class="text-2xl font-black text-purple-600 tracking-tighter">${data.score}</span>`
        : '<span class="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Trống</span>';

    let reportDisplay = data.latestReport
        ? `<a href="/student/report/upload/file/${data.latestReport}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
            TẢI BÁO CÁO
           </a>`
        : '<span class="text-[10px] font-bold text-slate-300 italic uppercase">Chưa nộp</span>';

    // Encode string for safe attribute usage
    const safeDesc = data.projectDesc.replace(/'/g, "\\'").replace(/"/g, '&quot;')
    
    // Logic phân quyền: GVPB không được nộp điểm tại đây (chỉ xem báo cáo và tiến độ)
    const isReviewer = (data.role === 'reviewer' || data.role === 'gvpb');
    
    let actionButton = '';
    if (isReviewer) {
        actionButton = `
            <div class="px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 cursor-default" title="GVPB chỉ xem báo cáo">
                CHỈ XEM
            </div>
        `;
    } else if (data.status) {
        actionButton = `<button onclick="openModal('${data.studentId}', '${data.projectId}', '${data.fullName}', '${safeDesc}', '${data.score}', '${data.comment}')"
                class="px-5 py-2.5 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-sm border border-purple-100">
                ${data.score === null || data.score === 'Chưa có điểm' ? "CHẤM ĐIỂM" : "SỬA ĐIỂM"}
              </button>`;
    } else {
        actionButton = `<button disabled
                class="px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                KHÔNG KHẢ DỤNG
              </button>`;
    }

    studentTable.innerHTML += `
            <tr class="hover:bg-slate-50/50 transition-all duration-300 divide-x divide-slate-50">
                <td class="px-8 py-6">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[10px] shadow-inner">
                            ${data.fullName.substring(0, 1)}
                        </div>
                        <p class="font-bold text-slate-800 text-sm">${data.fullName}</p>
                    </div>
                </td>
                <td class="px-8 py-6">
                    <p class="text-[11px] font-bold text-slate-500 italic line-clamp-1" title="${data.projectName}">${data.projectName}</p>
                </td>
                <td class="px-8 py-6 text-center">${statusBadge}</td>
                <td class="px-8 py-6 text-center">${reportDisplay}</td>
                <td class="px-8 py-6 text-center">${scoreDisplay}</td>
                <td class="px-8 py-6 text-right">${actionButton}</td>
            </tr>
        `;
}

async function getScoreFeedback() {
    try {
        const res = await fetch('/teacher/scoreFeedback/getScoreFeedback')
        const data = await res.json()
        console.log('data: ', data)
        studentTable.innerHTML = ''
        data.forEach(item => {
            console.log('item: ', item)
            renderScore(item)
        });


    }
    catch (err) {
        console.log(err)
    }
}
getScoreFeedback()