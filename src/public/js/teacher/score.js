let currentStuId = null;

async function fetchCouncilStudents() {
    try {
        const res = await fetch('/teacher/score/getStudents');
        const data = await res.json();
        renderCouncilTable(data);
    } catch (err) {
        console.error(err);
    }
}

function renderCouncilTable(data) {
    const body = document.getElementById('council-list-body');
    body.innerHTML = '';

    data.forEach(item => {
        if (!item.isEligible) return;

        const myScoreText = item.myScore !== null ? 
            `<span class="text-xl font-black text-emerald-600">${item.myScore}</span>` : 
            `<span class="text-slate-300 italic text-sm">Chưa chấm</span>`;

        const finalScoreText = item.finalScore !== null ? 
            `<div class="mt-1"><span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded border border-blue-100 uppercase italic">TB: ${item.finalScore}</span></div>` : '';

        const statusBadge = item.isLocked ? 
            `<span class="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">🔒 Đã khóa</span>` :
            `<span class="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 animate-pulse">📝 Đang chấm (${item.councilCount}/3)</span>`;

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50/50 transition-all duration-200 group';
        row.innerHTML = `
            <td class="px-8 py-6">
                <div>
                    <p class="font-black text-slate-800">${item.fullName}</p>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-tighter">${item.studentCode}</p>
                </div>
            </td>
            <td class="px-8 py-6">
                <p class="text-sm font-semibold text-slate-600 max-w-xs truncate">${item.projectName}</p>
            </td>
            <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs">📊</span>
                    <span class="text-xs font-black text-indigo-600">${item.progress}%</span>
                </div>
            </td>
            <td class="px-8 py-6">
                ${myScoreText}
                ${finalScoreText}
            </td>
            <td class="px-8 py-6 text-right space-y-2">
                ${statusBadge}
                <div class="flex justify-end gap-2 pt-2">
                    <!-- Nút chấm điểm (Tất cả thành viên) -->
                    <button onclick='openGradeModal(${JSON.stringify(item)})' 
                        class="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all ${item.isLocked ? 'hidden' : ''}" title="Chấm điểm cá nhân">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    
                    <!-- Nút biên bản (Thư ký) -->
                    ${window.councilPos === 'Secretary' && !item.isLocked ? `
                        <button onclick='openMinutesModal(${JSON.stringify(item)})' 
                            class="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all" title="Ghi biên bản bảo vệ">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </button>
                    ` : ''}

                    <!-- Nút Tổng hợp / Phê duyệt (Thư ký / Chủ tịch) -->
                    ${(window.councilPos === 'Chairman' || window.councilPos === 'Secretary') && !item.isLocked ? `
                        <button onclick='openSynthModal(${JSON.stringify(item)})' 
                            class="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 rounded-xl transition-all" title="Tổng hợp & Phê duyệt">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        body.appendChild(row);
    });
}

function openGradeModal(item) {
    currentStuId = item.studentId;
    document.getElementById('target-stu-name').innerText = item.fullName;
    document.getElementById('input-score').value = item.myScore || '';
    
    const modal = document.getElementById('modal-grading');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
}

function closeGradeModal() {
    const modal = document.getElementById('modal-grading');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// Logic cho Biên bản (Thư ký)
function openMinutesModal(item) {
    currentStuId = item.studentId;
    document.getElementById('minutes-stu-name').innerText = item.fullName;
    document.getElementById('minutes-conclusion').value = item.defenseConclusion || '';
    
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    if (item.defenseQuestions && item.defenseQuestions.length > 0) {
        item.defenseQuestions.forEach(q => addQuestionRow(q.question, q.answer, q.asker));
    } else {
        addQuestionRow();
    }

    const modal = document.getElementById('modal-minutes');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeMinutesModal() {
    const modal = document.getElementById('modal-minutes');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function addQuestionRow(q = '', a = '', asker = '') {
    const div = document.createElement('div');
    div.className = 'p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group';
    div.innerHTML = `
        <input type="text" placeholder="Người hỏi" value="${asker}" class="asker-input w-full bg-transparent border-b border-slate-200 outline-none text-[10px] font-black uppercase text-indigo-500">
        <input type="text" placeholder="Câu hỏi của Hội đồng" value="${q}" class="question-input w-full bg-transparent outline-none text-sm font-bold text-slate-800">
        <textarea placeholder="Câu trả lời của sinh viên" class="answer-input w-full bg-white p-3 rounded-xl border border-slate-100 text-xs font-medium text-slate-600 resize-none">${a}</textarea>
        <button onclick="this.parentElement.remove()" class="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
    `;
    document.getElementById('questions-container').appendChild(div);
}

async function saveMinutes() {
    const questions = Array.from(document.querySelectorAll('#questions-container > div')).map(div => ({
        asker: div.querySelector('.asker-input').value,
        question: div.querySelector('.question-input').value,
        answer: div.querySelector('.answer-input').value
    }));
    const conclusion = document.getElementById('minutes-conclusion').value;

    try {
        const res = await fetch('/teacher/score/submitMinutes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: currentStuId, questions, conclusion })
        });
        const data = await res.json();
        if (data.success) {
            alert('Đã lưu biên bản thành công');
            closeMinutesModal();
            fetchCouncilStudents();
        } else alert(data.message);
    } catch(e) {}
}

// Logic cho Tổng hợp & Phê duyệt
function openSynthModal(item) {
    currentStuId = item.studentId;
    document.getElementById('synth-stu-name').innerText = item.fullName;
    document.getElementById('synth-count').innerText = `${item.councilCount}/3`;
    document.getElementById('synth-avg').innerText = item.finalScore || '--.--';

    if (window.councilPos === 'Chairman') {
        document.getElementById('chairman-actions').classList.remove('hidden');
        document.getElementById('secretary-actions').classList.add('hidden');
    } else {
        document.getElementById('chairman-actions').classList.add('hidden');
        document.getElementById('secretary-actions').classList.remove('hidden');
    }

    const modal = document.getElementById('modal-synthesis');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeSynthModal() {
    const modal = document.getElementById('modal-synthesis');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

async function synthesizeScore() {
    try {
        const res = await fetch('/teacher/score/synthesizeScore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: currentStuId })
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('synth-avg').innerText = data.finalScore;
            alert(data.message);
            fetchCouncilStudents();
        } else alert(data.message);
    } catch(e) {}
}

async function approveFinalScore() {
    if (!confirm('Xác nhận phê duyệt kết quả cuối và khóa điểm?')) return;
    try {
        const res = await fetch('/teacher/score/approveFinal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: currentStuId })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            closeSynthModal();
            fetchCouncilStudents();
        } else alert(data.message);
    } catch(e) {}
}

function exportCSV() {
    window.location.href = `/teacher/score/exportReport/${currentStuId}`;
}

async function saveCouncilScore() {
    const score = parseFloat(document.getElementById('input-score').value);
    const comment = document.getElementById('input-comment').value;

    if (isNaN(score) || score < 0 || score > 10) {
        alert('Vui lòng nhập điểm hợp lệ từ 0 đến 10');
        return;
    }

    try {
        const res = await fetch('/teacher/score/submitScore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: currentStuId, score, comment })
        });
        const data = await res.json();
        if (data.success) {
            closeGradeModal();
            fetchCouncilStudents();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
    }
}

// Khởi tạo
window.councilPos = document.getElementById('council-pos-indicator')?.value || (document.querySelector('.text-sm.font-black.text-emerald-600')?.innerText.includes('CHỦ TỊCH') ? 'Chairman' : (document.querySelector('.text-sm.font-black.text-emerald-600')?.innerText.includes('THƯ KÝ') ? 'Secretary' : 'Member'));

fetchCouncilStudents();

fetchCouncilStudents();