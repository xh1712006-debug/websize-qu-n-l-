async function fetchStats() {
    try {
        const res = await fetch('/admin/config/stats');
        const data = await res.json();
        document.getElementById('stat-students').innerText = data.totalStudents || 0;
        document.getElementById('stat-projects').innerText = data.totalProjects || 0;
        document.getElementById('stat-completed').innerText = data.completedProjects || 0;
        document.getElementById('stat-avg').innerText = (data.avgScore || 0).toFixed(1);
    } catch(e) {}
}

async function fetchGlobalProjects() {
    try {
        const res = await fetch('/admin/config/allProjects');
        const data = await res.json();
        const body = document.getElementById('global-project-list');
        body.innerHTML = data.map(p => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-8 py-6">
                    <p class="font-bold text-slate-800 text-sm">${p.fullName}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${p.studentCode}</p>
                </td>
                <td class="px-8 py-6">
                    <p class="text-xs font-semibold text-slate-600 line-clamp-1">${p.projectName}</p>
                    <p class="text-[9px] text-indigo-500 font-bold uppercase mt-1">${p.major || '---'}</p>
                </td>
                <td class="px-8 py-6">
                    <div class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600 w-fit">
                        ${p.defenseDate ? new Date(p.defenseDate).toLocaleDateString('vi-VN') : '---'}
                    </div>
                </td>
                <td class="px-8 py-6 text-right">
                    <p class="text-xs font-bold text-indigo-600 uppercase tracking-widest">${p.defenseRoom || 'Chưa xếp'}</p>
                    <p class="text-[9px] text-slate-400 font-medium">${p.defenseTime || ''}</p>
                </td>
            </tr>
        `).join('');
    } catch(e) {}
}

async function saveAllConfigs() {
    const inputs = document.querySelectorAll('.config-input');
    const configs = [];
    
    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        let value;
        if (input.type === 'checkbox') {
            value = input.checked;
        } else {
            value = input.value;
        }
        configs.push({ key, value });
    });

    try {
        const res = await fetch('/admin/config/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configs })
        });
        const data = await res.json();
        if (data.success) {
            alert('Cập nhật cấu hình thành công!');
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
    }
}

async function unlockPoint() {
    const studentId = document.getElementById('unlock-student-id').value;
    const reason = document.getElementById('unlock-reason').value;

    if (!studentId || !reason) {
        alert('Vui lòng nhập Mã sinh viên và lý do!');
        return;
    }

    if (!confirm('Bạn có chắc chắn muốn mở khóa điểm cho sinh viên này?')) return;

    try {
        const res = await fetch('/admin/config/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, reason })
        });
        const data = await res.json();
        if (data.success) {
            alert('Đã mở khóa điểm thành công!');
            document.getElementById('unlock-student-id').value = '';
            document.getElementById('unlock-reason').value = '';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
    }
}

fetchStats();
fetchGlobalProjects();
