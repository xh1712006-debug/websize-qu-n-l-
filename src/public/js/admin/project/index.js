const tableBody = document.querySelector('.table__body')


async function getApi(){

    const res = await fetch('/Api/project')
    const result = await res.json()

    console.log('result: ', result)

    result.forEach(data => {
        data.date = new Date(data.date).toLocaleDateString('vi-VN')
        const tr = document.createElement('tr')
        const progressPercent = (data.numberSubmit / data.numberStudent) * 100
        const progressColor = progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
        
        tr.className = 'hover:bg-slate-50/50 transition-all duration-300 group divide-x divide-slate-50'
        tr.innerHTML = `
            <td class="px-8 py-6">
                <p class="font-black text-slate-800 tracking-tight leading-snug">${data.inputProject}</p>
                <p class="text-[10px] font-bold text-slate-400 mt-1 italic line-clamp-1" title="${data.contentProject}">${data.contentProject}</p>
            </td>

            <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span class="text-xs font-black text-slate-600">${data.teacherInstruct}</span>
                </div>
            </td>

            <td class="px-8 py-6">
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span>Lưu lượng</span>
                        <span class="${progressPercent >= 100 ? 'text-emerald-500' : 'text-blue-600'}">${data.numberSubmit}/${data.numberStudent}</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner flex">
                        <div class="${progressColor} h-full rounded-full transition-all duration-1000"
                            style="width: ${progressPercent}%">
                        </div>
                    </div>
                </div>
            </td>

            <td class="px-8 py-6 text-center">
                 <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${data.statuss === 'Mở' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    <span class="w-1.5 h-1.5 ${data.statuss === 'Mở' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full"></span>
                    ${data.statuss}
                </span>
            </td>

            <td class="px-8 py-6">
                <div class="flex items-center justify-end gap-2">
                    <button data-id="${data._id}" class="view__project w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button data-id="${data._id}" class="fix__project w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                        <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button data-id="${data._id}" class="delete__project w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                        <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </td>
        `
        tableBody.appendChild(tr)
    });
    
}

async function deleteApi(id){
    try {
        const res = await fetch(`/admin/project/${id}`, {
            method: 'DELETE',
        })
        const data = await res.json()
        console.log('giá trị đang tìm: ', data)
    }

    catch(err) {
        console.log(err)

    }
}

getApi()

// const viewProject = document.querySelectorAll('.view__project')
// const fixProject = document.querySelectorAll('.fix__project')
// const deleteProject = document.querySelectorAll('.delete__project')

tableBody.addEventListener('click', (e) => {
    // xoá dữ liệu 
    if(e.target.classList.contains('delete__project')){
        console.log(e.target)
        // const parent = e.target.
        const idProject = e.target.dataset.id
        deleteApi(idProject)
        window.location.reload()
    }

    // chỉnh sữa dữ liệu 
    else if(e.target.classList.contains('fix__project')){
        const id = e.target.dataset.id
        window.location.href = `/admin/project/fixStudent/${id}`
        console.log('đã click vào sữa')
    }
    else if(e.target.classList.contains('view__project')){
        const id = e.target.dataset.id
        window.location.href = `/admin/project/viewStudent/${id}`
        console.log('đã click vào sữa')
    }


})
