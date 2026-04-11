const tableHeader = document.querySelector('.table__header')
const modals = document.querySelector('#modal')
const reportListAdd = document.querySelector('#reportList')

function closeModal(){
    modals.classList.add('hidden')
}

async function submitReview(id, reportId, action){
    const feedback = document.getElementById('teacherFeedback').value;
    const url = action === 'approve' ? '/teacher/report/postRequirement' : '/teacher/report/postRemove';
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: id,
                reportId: reportId,
                feedback: feedback
            })
        })
        const data = await res.json()
        modals.classList.add('hidden')
        getReport()
    }
    catch(err){
        console.log(err)
    }
}

function createrModal(id, reportId, action) {
    modals.innerHTML = ''
    const div = document.createElement('div')
    div.className = 'bg-white w-full max-w-xl p-6 rounded-2xl shadow-xl'
    
    const title = action === 'approve' ? '✅ Duyệt báo cáo' : '❌ Yêu cầu nộp lại';
    const btnClass = action === 'approve' ? 'bg-green-600' : 'bg-red-600';
    const btnText = action === 'approve' ? 'Duyệt & Lưu lời phê' : 'Từ chối & Gửi lời phê';

    div.innerHTML = `
        <h3 class="text-xl font-bold mb-4 text-center">
            ${title}
        </h3>

        <div class="space-y-3">
            <label class="block font-semibold">Nhận xét / Lời phê của Giáo viên:</label>
            <textarea id="teacherFeedback" rows="4" class="w-full border rounded-lg p-3" placeholder="Nhập lời phê..."></textarea>
        </div>
        <div class="flex justify-end gap-3 mt-6">
            <button onclick="closeModal()" class="px-4 py-2 border rounded-lg">Hủy</button>
            <button onclick="submitReview('${id}','${reportId}','${action}')" class="px-5 py-2 ${btnClass} text-white rounded-lg">
                ${btnText}
            </button>
        </div>
    `
    modals.appendChild(div)
    modals.classList.remove('hidden')
}

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
        const id = e.target.dataset.id
        const studentId = e.target.dataset.studentid
        createrModal(studentId, id, 'approve')
    }
    else if(e.target.classList.contains('refuse')){
        const id = e.target.dataset.id
        const studentId = e.target.dataset.studentid
        createrModal(studentId, id, 'reject')
    }
    
})
