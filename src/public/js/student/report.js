// filepath: d:\hoc_html\on_html\project2\src\public\js\student\report.js
const submitContent = document.querySelector('.submit__content')
const weekReport = document.querySelector('.hidden__week')
const contentReport = document.querySelector('.content__report')
const fileReport = document.querySelector('.file__report')
const tableContent = document.querySelector('.table__content')
const outContent = document.querySelector('.out__content')

// upload dư liệu file
async function uploadFile(){
    try {
<<<<<<< HEAD
        const form = document.querySelector('form');
        const formData = new FormData(form);
        
        // Thêm nội dung textarea vì nó nằm ngoài FormData tự động nếu không có name
        formData.append('content', contentReport.value);
=======
        const formData = new FormData()

        formData.append('content', contentReport.value)
        formData.append('week', weekReport.value)
        formData.append('file_url', fileReport.files[0])
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26

        const res = await fetch('/student/report/upload', {
            method: 'POST',
            body: formData
        })

        const data = await res.json()

        if(data.success){
            alert('Gửi báo cáo thành công')
            window.location.reload()
        } else {
            alert('Lỗi: ' + (data.error || 'Không thể gửi báo cáo'))
        }
    }
    catch(err){
        console.error(err)
        alert('Có lỗi xảy ra khi gửi file!')
    }
}


// Get database
async function createTable() {
    try {
        const res = await fetch('/student/report/getReport')
        const data = await res.json()
        console.log('data', data)
        const tbody = document.createElement('tbody')
        tbody.className = ''
        data.report.forEach(item => {
            const createDate = new Date(item.createdAt).toLocaleDateString('vi-VN')
            const statusClass = item.status == 'đã duyệt' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             item.status == 'chờ duyệt' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
            const statusDot = item.status == 'đã duyệt' ? 'bg-emerald-500' :
                             item.status == 'chờ duyệt' ? 'bg-amber-500' : 'bg-rose-500'
                             
            tbody.innerHTML += `
<<<<<<< HEAD
                <tr class="hover:bg-slate-50/50 transition-colors duration-200 divide-x divide-slate-50">
                    <td class="px-8 py-6">
                        <p class="font-bold text-slate-700">${item.title}</p>
                    </td>
                    <td class="px-8 py-6">
                        <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest">
                            Tuần ${item.week}
                        </span>
                    </td>
                    <td class="px-8 py-6 text-sm font-semibold text-slate-500">${createDate}</td>
                    <td class="px-8 py-6">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${statusClass} text-[10px] font-black uppercase tracking-wider border">
                            <span class="w-1.5 h-1.5 ${statusDot} rounded-full"></span>
                            ${item.status}
                        </span>
                    </td>
                    <td class="px-8 py-6 text-sm italic text-slate-500 max-w-xs truncate">${item.teacherFeedback || 'Chưa có phản hồi'}</td>
                    <td class="px-8 py-6 text-right">
                        <a href="/student/report/upload/file/${item.fileUrl}" target="_blank" 
                           class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a1 1 0 001 1h14a1 1 0 001-1v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                           TẢI XUỐNG
                        </a> 
=======
                <tr>
                    <td class="border p-2 text-center">${item.title}</td>
                    <td class="border p-2 text-center font-bold">Tuần ${item.week}</td>
                    <td class="border p-2 text-center">${createDate}</td>
                    <td class="border p-2 text-${color}-600 font-semibold text-center">${item.status}</td>
                    <td class="border p-2 text-sm italic text-gray-700">${item.teacherFeedback || 'Chưa có'}</td>
                    <td class="border p-2 text-blue-600 underline cursor-pointer text-center">
                        <a href="/student/report/upload/file/${item.fileUrl}" target="_blank">Tải xuống</a> 
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
                    </td>
                </tr>
            `
        })
        tableContent.appendChild(tbody)
    } catch (err) {
        console.error('Error loading reports:', err)
    }
}

createTable()

<<<<<<< HEAD
if (submitContent) {
    submitContent.addEventListener('click', async (e) => {
        e.preventDefault()
        const file = fileReport.files[0]
        if (!contentReport.value || !file) {
            alert('Vui lòng điền đầy đủ nội dung và chọn file!')
            return
        }

        uploadFile()
    })
}
=======
submitContent.addEventListener('click', async (e) => {
    e.preventDefault()
    const file = fileReport.files[0]
    if (!contentReport.value || !file) {
        alert('Vui lòng điền đầy đủ nội dung và chọn file!')
        return
    }

    // try {
    //     await sendTable({
    //         content: contentReport.value,
    //         title: titleReport.value,
    //         file: file,  // Pass the file object
    //         type: typeReport.value,
    //     })
    //     window.location.reload()
    // } catch (err) {
    //     console.error(err)
    //     alert('Không thể gửi báo cáo: ' + err.message)
    // }

    uploadFile()
})
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
