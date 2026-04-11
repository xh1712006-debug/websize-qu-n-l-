const studentList = document.getElementById("studentList")

// ========================
// RENDER 1 STUDENT
// ========================
function listStudent(data){

    let badge = ""
    let actions = ""

    if (data.status === "pending") {
      badge = `<span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Chờ duyệt</span>`
    }

    if (data.status === "approved") {
      badge = `<span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">Đã duyệt</span>`
    }

    if (data.status === "rejected") {
      badge = `<span class="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-600">Đã loại</span>`
    }

    studentList.innerHTML += `
      <div class="p-4 bg-gray-50 rounded-xl flex justify-between items-center hover:shadow-md transition">

        <div>
          <p class="font-semibold text-gray-800">${data.fullName}</p>
          <p class="text-sm text-gray-500">${data.studentCode}</p>
        </div>

        <div class="flex items-center gap-4">
          ${badge}
          <div class="flex gap-2">
            ${actions}
          </div>
        </div>

      </div>
    `
}



// ========================
// FETCH DATA
// ========================
async function getApi(projectId){
    try{
        const res = await fetch(`/admin/project/getListViewStudent?projectId=${projectId}`)
        const data = await res.json()

        console.log(data)

        studentList.innerHTML = ""   // reset trước khi render

        data.forEach(item => {
            listStudent(item)
        })

    }
    catch(err){
        console.log(err)
    }
}


// ========================
// LẤY PROJECT ID
// ========================
const projectId = window.location.pathname.split('/').pop()

console.log("projectId là:", projectId)

getApi(projectId)
