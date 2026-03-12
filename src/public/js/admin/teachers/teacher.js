const createTeacher = document.querySelector(".create__Teacher")
const bodyTeacher = document.querySelector(".body__teacher")

// hiện danh sách giáo viên
async function showTeachers() {
  const res = await fetch("/API/teacher")
  const data = await res.json()
  data.forEach(teacher => {
    const teacherRow = document.createElement("tr")
    teacherRow.classList.add("hover:bg-gray-50", "transition")
    teacherRow.innerHTML = `
        <tr class="hover:bg-gray-50 transition">

          <!-- TÊN + AVATAR -->
          <td class="p-4 flex items-center gap-3">
            <img src="${teacher.teacherAvatar || "https://i.pravatar.cc/40"}"
                 class="w-10 h-10 rounded-full">
            <div>
              <p class="font-medium">${teacher.fullName}</p>
              <p class="text-gray-500 text-xs">Mã GV: ${teacher.teacherCode}</p>
            </div>
          </td>

          <!-- EMAIL -->
          <td class="p-4 text-gray-600">
            ${teacher.teacherEmail}
          </td>

          <!-- CHỨC VỤ -->
          <td class="p-4">
            <span class="px-3 py-1 rounded-full text-xs font-medium
              bg-green-100 text-green-700">
              Lecturer
            </span>
          </td>

          <!-- SỐ ĐỒ ÁN -->
          <td class="p-4">
            <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              3 đồ án
            </span>
          </td>

          <!-- ACTION -->
          <td class="p-4">
            <div class="flex justify-center gap-2">

              <!-- Dropdown Role -->
              <select class="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option>Lecturer</option>
                <option>Senior</option>
                <option>Head</option>
                <option>Admin</option>
              </select>

              <!-- Update -->
              <button class="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition">
                Cập nhật
              </button>

              <!-- Khóa -->
              <button class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition">
                Khóa
              </button>

            </div>
          </td>

        </tr>
    `
    bodyTeacher.appendChild(teacherRow)
  })
}

createTeacher.addEventListener("click", () => {
  window.location.href = "/admin/teacher/addTeacher"
})

showTeachers()

