const createTeacher = document.querySelector(".create__Teacher")
const bodyTeacher = document.querySelector(".body__teacher")

// hiện danh sách giáo viên
async function showTeachers() {
  const res = await fetch("/API/teacher")
  const data = await res.json()
  data.forEach(teacher => {
    const teacherRow = document.createElement("tr")
    teacherRow.className = "hover:bg-slate-50/50 transition-all duration-300 group divide-x divide-slate-50"
    
    teacherRow.innerHTML = `
          <!-- TÊN + AVATAR -->
          <td class="px-8 py-6">
            <div class="flex items-center gap-3">
              <img src="${teacher.teacherAvatar || "https://i.pravatar.cc/40"}"
                   class="w-10 h-10 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform">
              <div>
                <p class="font-black text-slate-900 tracking-tight">${teacher.fullName}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${teacher.teacherCode}</p>
              </div>
            </div>
          </td>

          <!-- EMAIL -->
          <td class="px-8 py-6 text-slate-600 font-bold text-xs italic">
            ${teacher.teacherEmail}
          </td>

          <!-- CHỨC VỤ -->
          <td class="px-8 py-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
              <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              ${teacher.teacherRole || 'Lecturer'}
            </span>
          </td>

          <!-- SỐ ĐỒ ÁN -->
          <td class="px-8 py-6 text-center">
            <span class="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 italic">
              3 Đồ án
            </span>
          </td>

          <!-- ACTION -->
          <td class="px-8 py-6">
            <div class="flex items-center justify-end gap-3">

              <!-- Dropdown Role -->
              <select class="role-select appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer">
                <option value="GVHD" ${teacher.teacherRole === 'GVHD' ? 'selected' : ''}>GV Hướng dẫn</option>
                <option value="GVPB" ${teacher.teacherRole === 'GVPB' ? 'selected' : ''}>GV Phản biện</option>
                <option value="Council" ${teacher.teacherRole === 'Council' ? 'selected' : ''}>Hội đồng</option>
              </select>

              <!-- Update -->
              <button onclick="updateRole('${teacher._id}', this)" class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>

              <!-- Khóa -->
              <button class="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </button>

            </div>
          </td>
    `
    bodyTeacher.appendChild(teacherRow)
  })
}

createTeacher.addEventListener("click", () => {
  window.location.href = "/admin/teacher/addTeacher"
})

async function updateRole(teacherId, btn) {
    const row = btn.closest('tr')
    const role = row.querySelector('.role-select').value
    
    try {
        const res = await fetch('/admin/teacher/updateRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                teacherId: teacherId,
                role: role
            })
        })
        const result = await res.json()
        if (result.success) {
            alert('Cập nhật quyền thành công!')
            location.reload()
        } else {
            alert('Lỗi: ' + result.message)
        }
    } catch (err) {
        console.error(err)
        alert('Lỗi kết nối server')
    }
}

showTeachers()

