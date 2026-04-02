
const tableHeader = document.querySelector('.table__header')
const modals = document.querySelector('#modal')
const reportListAdd = document.querySelector('#reportList')

   let add = []
function closeModal(){
    
    add = []
    modals.classList.add('hidden')
    
}

async function submitReview(id,reportId){
    try{
        
        const res = await fetch('/teacher/report/postRequirement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                listRequirementId: add,
                studentId: id,
                reportId: reportId,
            })
        })
        add = [] 
        console.log('hello')
        modals.classList.add('hidden')
        // tableHeader.innerHTML = ''
        getReport()
    }
    catch(err){
        console.log(err)
    }
}

function updateProgress(data, requirementId){
    if(data.checked == true){
        console.log(requirementId)
        add.push(requirementId)
    }
    else{
        const index = add.indexOf(requirementId)
        if(index !== -1){
            add.splice(index, 1)
        }
    }
}

function addRequirementStudent(data){
    return data.map(item => {
        return `
            <div  class="flex justify-between border p-3 rounded-xl text-center">
                <p>${item.name}</p>
                <input type="checkbox" ${item.status == 'pass' ? 'checked disabled' : ''} onchange="updateProgress(this,'${item._id}')"></input>
            </div>
        `
    }).join('')
}

async function createrModal(id,reportId) {
    try{
        const res = await fetch(`/teacher/report/getRequirement?studentId=${id}`)
        const data = await res.json()
        console.log('data: ', data.requirementStudent)
        const requirementStudent = data.requirementStudent
        console.log('data: ', data)
        modals.innerHTML = ''
        const div = document.createElement('div')
        div.className = 'bg-white w-full max-w-xl p-6 rounded-2xl shadow-xl'
        div.innerHTML = `
            <h3 class="text-xl font-bold mb-4 text-center">
                📋 Duyệt: ${data.project.inputProject}
            </h3>

            <div class="space-y-3">
                ${addRequirementStudent(requirementStudent)}
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button onclick="closeModal()" class="px-4 py-2 border rounded-lg">Hủy</button>
                <button onclick="submitReview('${id}','${reportId}')" class="px-5 py-2 bg-blue-600 text-white rounded-lg">
                    💾 Lưu
                </button>
            </div>
        `
        console.log('chào cả nhà')
        modals.appendChild(div)
        modals.classList.remove('hidden')
    }
    catch(err){
        console.log(err)
    }
}

async function postRemove(reportId){
    try{
        const res = await fetch('/teacher/report/postRemove',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: reportId,
            })
        })
    }
    catch(err){
        console.log(err)
    }
}

// async function postReport(id,status){
//     try{
//         const res = await fetch('/teacher/report/postReport', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 id: id,
//                 status: status,
//             })
//         })
//     }
//     catch(err){
//         console.log(err)
//     }
// }

async function getReport(){
    try{
        const res = await fetch('/teacher/report/getReport')
        const data = await res.json()
        const reportList = Array.isArray(data) ? data : [data]
        console.log(reportList[0].report.length)
        console.log('reportList: ', reportList)
        let text = ''
        reportListAdd.innerHTML = ``
        reportList[0].report.forEach((item, index) => {
            console.log('index: ', index)
            let student = reportList[0].students[index]
            const div = document.createElement('div')
            div.className = 'grid grid-cols-6 items-center text-sm py-3 border-b'
            let status = ''
            let act = ''
            console.log('giá trị: ',item.status)
            if(item.status == 'chờ duyệt'){
                status = `
                    <div class="flex justify-center items-center">
                        <span class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 w-fit">
                            Chờ duyệt
                        </span>
                    </div>
                    <div class="event flex justify-center gap-2">
                        <button data-file="${item.fileUrl}" data-id="${item._id}" class="view px-3 py-1 bg-blue-600 text-white rounded text-xs">
                            Xem
                        </button>
                        <button data-id="${item._id}" data-studentid="${student.id}" class="accept px-3 py-1 bg-green-600 text-white rounded text-xs">
                            Duyệt
                        </button>
                        <button data-id="${item._id}" class="refuse px-3 py-1 bg-red-600 text-white rounded text-xs">
                            Từ chối
                        </button>
                    </div>
                `
            }
            else{
                status = `
                    <div class="flex justify-center items-center">
                        <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-700 w-fit">
                            Đã duyệt
                        </span>
                    </div>
                    <div class="flex justify-center">
                        <button data-file="${item.fileUrl}" data-id="${item._id}" class="view px-3 py-1 bg-blue-600 text-white rounded text-xs">
                            Xem
                        </button>
                    </div>
                `
            }    
            reportText(div,item,status,act,student)
            console.log('text',div)
            reportListAdd.appendChild(div)
        });
        

    }
    catch(err){
        console.log(err)
    }
}

function reportText(div,item,status,act,student){
    console.log('chào')
    const date = new Date(item.updatedAt).toLocaleDateString('vi-VN')

    div.innerHTML = `
        <div>
            <p class="font-medium text-center">${student.fullName}</p>
            <p class="text-gray-500 text-xs text-center">${student.studentCode}</p>
        </div>

        <span class="text-center">${student.projectName}</span>
        <span class="text-center">${item.title}</span>
        <span class="text-center">${date}</span>
        ${status}
        ${act}
    `
}

getReport()

tableHeader.addEventListener('click', (e) => {
    
    if(e.target.classList.contains('view')){
        console.log('bạn đã click vào xem')
        const fileUrl = e.target.dataset.file
        console.log('fileUrl: ', fileUrl)
        window.open(`/teacher/report/viewFile/${fileUrl}`, '_blank')
    }
    else if(e.target.classList.contains('accept')){
        // e.preventDefault()
        console.log('bạn đã click vào chấp nhận')
   
        const id = e.target.dataset.id
        const studentId = e.target.dataset.studentid
        console.log('id: ', studentId)
        
        createrModal(studentId,id)
        // postReport(id, text)
        
    }
    else if(e.target.classList.contains('refuse')){
        
        console.log('bạn đã click vào từ chối')
        const text = 'từ chối'
        const id = e.target.dataset.id
        console.log('id: ', id)
        postRemove(id)
        // postReport(id, text)
        // tableHeader.innerHTML = ''
        // getReport()
    }
    
})