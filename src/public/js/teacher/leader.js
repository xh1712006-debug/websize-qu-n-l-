let currentTeacherId = null;
let currentProjectId = null;

// Tab Switching
function switchTab(tab) {
    const sections = ['teachers', 'defense', 'milestones', 'reviewer'];
    sections.forEach(s => {
        const btn = document.getElementById(`tab-${s}`);
        const sec = document.getElementById(`section-${s}`);
        if (s === tab) {
            btn.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
            btn.classList.remove('text-slate-500');
            sec.classList.remove('hidden');
        } else {
            btn.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
            btn.classList.add('text-slate-500');
            sec.classList.add('hidden');
        }
    });

    if (tab === 'teachers') fetchTeachers();
    if (tab === 'defense') fetchProjects();
    if (tab === 'milestones') fetchMilestones();
    if (tab === 'reviewer') fetchReviewerAssignments();
}

async function fetchReviewerAssignments() {
    try {
        const res = await fetch('/teacher/leader/getReviewerAssignments');
        const data = await res.json();
        renderReviewerAssignments(data);
    } catch (err) {
        console.error(err);
    }
}

function renderReviewerAssignments(data) {
    const { projects, gvpbs } = data;
    const body = document.getElementById('reviewer-assignment-list-body');
    body.innerHTML = '';

    projects.forEach(p => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50/50 transition-colors duration-200';
        
        let selectHtml = `<select onchange="updateReviewerAssignment('${p.studentId}', '${p.projectId}', this.value)" class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-500">
            <option value="">-- Chọn GVPB --</option>`;
        
        gvpbs.forEach(g => {
            selectHtml += `<option value="${g._id}" ${p.reviewerId === g._id ? 'selected' : ''}>${g.fullName}</option>`;
        });
        selectHtml += `</select>`;

        row.innerHTML = `
            <td class="px-8 py-6">
                <p class="font-bold text-slate-800">${p.fullName}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${p.studentCode}</p>
            </td>
            <td class="px-8 py-6">
                <p class="text-xs font-semibold text-slate-600 line-clamp-1">${p.projectName}</p>
            </td>
            <td class="px-8 py-6">
                ${selectHtml}
            </td>
            <td class="px-8 py-6 text-right">
                <span id="status-${p.studentId}" class="px-3 py-1 ${p.reviewerId ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'} rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    ${p.reviewerId ? 'ĐÃ PHÂN CÔNG' : 'CHỜ PHÂN CÔNG'}
                </span>
            </td>
        `;
        body.appendChild(row);
    });
}

async function updateReviewerAssignment(studentId, projectId, teacherId) {
    try {
        const statusSpan = document.getElementById(`status-${studentId}`);
        statusSpan.innerText = 'ĐANG LƯU...';
        statusSpan.className = 'px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 animate-pulse';

        const res = await fetch('/teacher/leader/assignReviewer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, projectId, teacherId })
        });
        const data = await res.json();
        
        if (data.success) {
            statusSpan.innerText = teacherId ? 'ĐÃ PHÂN CÔNG' : 'CHỜ PHÂN CÔNG';
            statusSpan.className = teacherId ? 'px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100' : 'px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100';
        } else {
            alert(data.message);
            fetchReviewerAssignments();
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi cập nhật phân công');
        fetchReviewerAssignments();
    }
}

async function fetchMilestones() {
    try {
        const res = await fetch('/teacher/leader/getMilestones');
        const data = await res.json();
        renderMilestones(data);
    } catch (err) {
        console.error(err);
    }
}

function renderMilestones(milestones) {
    const body = document.getElementById('milestone-list-body');
    body.innerHTML = '';

    milestones.forEach(m => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition-colors';
        row.innerHTML = `
            <td class="px-8 py-6">
                <p class="font-bold text-slate-800">${m.title}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Đã tạo: ${new Date(m.createdAt).toLocaleDateString()}</p>
            </td>
            <td class="px-8 py-6">
                <p class="text-xs text-slate-600 line-clamp-2">${m.description || 'Không có mô tả'}</p>
            </td>
            <td class="px-8 py-6 text-center">
                <span class="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-black border border-amber-100 italic">
                    ${new Date(m.deadline).toLocaleString('vi-VN')}
                </span>
            </td>
            <td class="px-8 py-6 text-right">
                <button onclick="deleteMilestone('${m._id}')" class="p-2 text-slate-300 hover:text-rose-500 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        `;
        body.appendChild(row);
    });
}

function openMilestoneModal() {
    const modal = document.getElementById('modal-milestone');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeMilestoneModal() {
    const modal = document.getElementById('modal-milestone');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

document.getElementById('btn-save-milestone').onclick = async () => {
    const body = {
        title: document.getElementById('input-milestone-title').value,
        deadline: document.getElementById('input-milestone-deadline').value,
        description: document.getElementById('input-milestone-desc').value
    };

    if (!body.title || !body.deadline) return alert('Vui lòng nhập đủ thông tin');

    try {
        const res = await fetch('/teacher/leader/createMilestone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            closeMilestoneModal();
            fetchMilestones();
        }
    } catch(e) {}
};

async function deleteMilestone(id) {
    if (!confirm('Xóa mốc báo cáo này?')) return;
    try {
        const res = await fetch(`/teacher/leader/deleteMilestone/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) fetchMilestones();
    } catch(e) {}
}

async function fetchTeachers() {
    try {
        const res = await fetch('/teacher/leader/getTeachers');
        const data = await res.json();
        renderTeachers(data);
    } catch (err) {
        console.error(err);
    }
}

function renderTeachers(teachers) {
    const body = document.getElementById('teacher-list-body');
    body.innerHTML = '';

    teachers.forEach(t => {
        const subRoles = t.subRoles || {};
        const activeRoles = [];
        if (subRoles.isGVHD) activeRoles.push('GVHD');
        if (subRoles.isGVPB) activeRoles.push('GVPB');
        if (subRoles.isCouncil) activeRoles.push('Hội đồng');
        if (subRoles.isLeader) activeRoles.push('Leader');

        const roleBadges = activeRoles.map(r => 
            `<span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-wider border border-indigo-100">${r}</span>`
        ).join(' ') || '<span class="text-slate-300 italic text-xs">Chưa phân vai</span>';

        const councilSpan = t.councilPosition ? 
            `<span class="text-xs font-bold text-slate-600">${t.councilPosition}</span>` : 
            `<span class="text-slate-300">--</span>`;

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50/50 transition-colors duration-200';
        row.innerHTML = `
            <td class="px-8 py-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        ${t.fullName.charAt(0)}
                    </div>
                    <div>
                        <p class="font-bold text-slate-800">${t.fullName}</p>
                        <p class="text-xs text-slate-500 font-medium">${t.teacherEmail}</p>
                    </div>
                </div>
            </td>
            <td class="px-8 py-6">
                <div class="flex flex-wrap gap-1.5">${roleBadges}</div>
            </td>
            <td class="px-8 py-6">${councilSpan}</td>
            <td class="px-8 py-6 text-right">
                <button onclick='openModal(${JSON.stringify(t)})' class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </button>
            </td>
        `;
        body.appendChild(row);
    });
}

// Defense Logic
async function fetchProjects() {
    try {
        const res = await fetch('/teacher/leader/getStudentProjects');
        const data = await res.json();
        renderProjects(data);
    } catch (err) {
        console.error(err);
    }
}

function renderProjects(projects) {
    const body = document.getElementById('defense-list-body');
    body.innerHTML = '';

    projects.forEach(p => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50/50 transition-colors duration-200';
        row.innerHTML = `
            <td class="px-8 py-6">
                <p class="font-bold text-slate-800">${p.fullName}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${p.studentCode}</p>
            </td>
            <td class="px-8 py-6">
                <p class="text-sm font-semibold text-slate-600 line-clamp-1">${p.projectName}</p>
            </td>
            <td class="px-8 py-6 text-center">
                <span class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                    ${p.defenseDate ? new Date(p.defenseDate).toLocaleDateString('vi-VN') : '---'}
                </span>
            </td>
            <td class="px-8 py-6 text-center">
                <p class="text-xs font-bold text-slate-700">${p.defenseRoom || '---'}</p>
                <p class="text-[10px] text-slate-400 font-medium">${p.defenseTime || ''}</p>
            </td>
            <td class="px-8 py-6 text-right">
                <button onclick='openScheduleModal(${JSON.stringify(p)})' class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                    Sắp lịch
                </button>
            </td>
        `;
        body.appendChild(row);
    });
}

function openScheduleModal(project) {
    currentProjectId = project.projectId;
    document.getElementById('schedule-student-name').innerText = project.fullName;
    
    if (project.defenseDate) {
        document.getElementById('input-defense-date').value = new Date(project.defenseDate).toISOString().split('T')[0];
    }
    document.getElementById('input-defense-time').value = project.defenseTime || '';
    document.getElementById('input-defense-room').value = project.defenseRoom || '';

    const modal = document.getElementById('modal-schedule');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeScheduleModal() {
    const modal = document.getElementById('modal-schedule');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

document.getElementById('btn-save-schedule').onclick = async () => {
    const body = {
        projectId: currentProjectId,
        defenseDate: document.getElementById('input-defense-date').value,
        defenseTime: document.getElementById('input-defense-time').value,
        defenseRoom: document.getElementById('input-defense-room').value
    };

    try {
        const res = await fetch('/teacher/leader/updateDefenseSchedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            closeScheduleModal();
            fetchProjects();
        }
    } catch(e) {}
};

// Modal Logic (Roles)
function openModal(teacher) {
    currentTeacherId = teacher._id;
    document.getElementById('target-teacher-name').innerText = teacher.fullName;
    
    document.getElementById('check-gvhd').checked = teacher.subRoles?.isGVHD || false;
    document.getElementById('check-gvpb').checked = teacher.subRoles?.isGVPB || false;
    document.getElementById('check-council').checked = teacher.subRoles?.isCouncil || false;
    document.getElementById('check-leader').checked = teacher.subRoles?.isLeader || false;
    
    const councilSection = document.getElementById('council-pos-section');
    if (teacher.subRoles?.isCouncil) {
        councilSection.classList.remove('hidden');
        document.getElementById('select-council-pos').value = teacher.councilPosition || 'Member';
    } else {
        councilSection.classList.add('hidden');
    }

    const modal = document.getElementById('modal-role');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeModal() {
    const modal = document.getElementById('modal-role');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

document.getElementById('check-council').addEventListener('change', (e) => {
    const section = document.getElementById('council-pos-section');
    if (e.target.checked) section.classList.remove('hidden');
    else section.classList.add('hidden');
});

async function saveRole() {
    const roles = {
        isGVHD: document.getElementById('check-gvhd').checked,
        isGVPB: document.getElementById('check-gvpb').checked,
        isCouncil: document.getElementById('check-council').checked,
        isLeader: document.getElementById('check-leader').checked,
    };
    
    const councilPosition = document.getElementById('select-council-pos').value;

    try {
        const res = await fetch('/teacher/leader/assignRole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: currentTeacherId, roles, councilPosition })
        });
        const data = await res.json();
        if (data.success) {
            closeModal();
            fetchTeachers();
        }
    } catch (err) {
        console.error(err);
    }
}

fetchTeachers();
