const tableBody = document.querySelector('.table__body')


async function getApi(){

    const res = await fetch('/Api/project')
    const result = await res.json()
    console.log(result)

    result.forEach(data => {
        data.date = new Date(data.date).toLocaleDateString('vi-VN')
        const tr = document.createElement('tr')
        tr.className = 'hover:bg-gray-50 transition'
        tr.innerHTML += `
            <td class="p-4">
                <p class="font-semibold text-gray-800">
                ${data.inputProject}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                ${data.contentProject}
                </p>
            </td>

            <td class="p-4 text-gray-600">
                ${data.teacherInstruct}
            </td>

            <td class="p-4">

                <div class="text-xs mb-1 text-gray-600">
                5 / ${data.numberStudent} sinh viên
                </div>

                <div class="w-32 bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full"
                    style="width: 50%">
                </div>
                </div>

            </td>

            <td class="p-4 text-gray-600">
                ${data.date}
            </td>

            <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                Đang ${data.statuss}
                </span>
            </td>

            <td class="p-4 text-center space-x-2">

                <button data-id="${data._id}" class="view__project bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition">
                👁 Xem
                </button>

                <button data-id="${data._id}" class="fix__project bg-yellow-400 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-500 transition">
                ✏️ Sửa
                </button>

                <button data-id="${data._id}" class="delete__project bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition">
                🗑 Xóa
                </button>

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