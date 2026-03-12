const studentList = document.getElementById("studentList")

// ========================
// RENDER 1 STUDENT
// ========================
function listStudent(data){

    let badge = ""
    let actions = ""

    if (data.status === "pending") {
      badge = `<span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Chờ duyệt</span>`

      actions = `
        <button onclick="approve('${data._id}')"
          class="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 transition">
          ✅ Duyệt
        </button>

        <button onclick="reject('${data._id}')"
          class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition">
          ❌ Loại
        </button>
      `
    }

    if (data.status === "approved") {
      badge = `<span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">Đã duyệt</span>`

      actions = `
        <button onclick="reject('${data._id}')"
          class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition">
          ❌ Loại
        </button>
      `
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
// DUYỆT
// ========================
async function approve(id){
    console.log('giá trị kiếm được: ', id)
    try{
        await fetch(`/admin/project/approveStudent`,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: id })
        })

        getApi(projectId) // reload lại danh sách

    }catch(err){
        console.log(err)
    }
}


// ========================
// LOẠI
// ========================
async function reject(id){
    try{
        await fetch(`/admin/project/rejectStudent`,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: id })
        })

        getApi(projectId)

    }catch(err){
        console.log(err)
    }
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