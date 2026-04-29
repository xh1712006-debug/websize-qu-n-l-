const studentList = document.getElementById("studentList")

// ========================
// RENDER 1 STUDENT
// ========================
function listStudent(data){
    let badge = ""
    const initial = data.fullName.substring(0, 1) || 'S'

<<<<<<< HEAD
    if (data.status === "pending" || !data.status) {
      badge = `<span class="px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-xl bg-amber-50 text-amber-600 border border-amber-100">Chờ duyệt</span>`
    } else if (data.status === "approved") {
      badge = `<span class="px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">Đã duyệt</span>`
    } else if (data.status === "rejected") {
      badge = `<span class="px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-xl bg-slate-100 text-slate-400 border border-slate-200">Đã loại</span>`
=======
    if (data.status === "pending") {
      badge = `<span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Chờ duyệt</span>`
    }

    if (data.status === "approved") {
      badge = `<span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">Đã duyệt</span>`
    }

    if (data.status === "rejected") {
      badge = `<span class="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-600">Đã loại</span>`
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
    }

    studentList.innerHTML += `
      <div class="p-6 bg-slate-50 rounded-[2rem] flex justify-between items-center hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 border border-transparent hover:border-blue-100 group animate-in zoom-in-95 duration-500">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 font-black text-sm shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                ${initial}
            </div>
            <div>
              <p class="font-black text-slate-900 tracking-tight leading-none">${data.fullName}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">${data.studentCode}</p>
            </div>
        </div>

        <div class="flex items-center gap-3">
          ${badge}
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </div>
      </div>
    `
}

<<<<<<< HEAD
=======


// ========================
// FETCH DATA
// ========================
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
async function getApi(projectId){
    try{
        const res = await fetch(`/admin/project/getListViewStudent?projectId=${projectId}`)
        const data = await res.json()
        
        const countBox = document.getElementById("countStudent")
        if(countBox) countBox.innerText = `${data.length} Sinh viên`

        const emptyBox = document.getElementById("empty")
        if (data.length === 0) {
            if(emptyBox) emptyBox.classList.remove("hidden")
        } else {
            if(emptyBox) emptyBox.classList.add("hidden")
        }

        studentList.innerHTML = ""
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
