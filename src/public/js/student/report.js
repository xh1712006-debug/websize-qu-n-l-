// filepath: d:\hoc_html\on_html\project2\src\public\js\student\report.js
const submitContent = document.querySelector('.submit__content')
const typeReport = document.querySelector('.type__report')
const titleReport = document.querySelector('.title__report')
const contentReport = document.querySelector('.content__report')
const fileReport = document.querySelector('.file__report')
const tableContent = document.querySelector('.table__content')
const outContent = document.querySelector('.out__content')

// upload dư liệu file
async function uploadFile(){
    try {
        const formData = new FormData()

        formData.append('title', titleReport.value)
        formData.append('content', contentReport.value)
        formData.append('type', typeReport.value)
        formData.append('file_url', fileReport.files[0])

        const res = await fetch('/student/report/upload', {
            method: 'POST',
            body: formData
        })

        const data = await res.json()

        if(data.success){
            alert('Gửi báo cáo thành công')
            window.location.reload()
        }
    }
    catch(err){
        console.log(err)
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
            const color = item.status == 'đã duyệt' ? 'green' :
             item.status == 'chờ duyệt' ? 'yellow' : 'red'
            tbody.innerHTML += `
                <tr>
                    <td class="border p-2 text-center">${item.title}</td>
                    <td class="border p-2 text-center">${item.type}</td>
                    <td class="border p-2 text-center">${createDate}</td>
                    <td class="border p-2 text-${color}-600 font-semibold text-center">${item.status}</td>
                    <td class="border p-2 text-blue-600 underline cursor-pointer text-center">
                        <a href="/student/report/upload/file/${item.fileUrl}" target="_blank">Tải xuống</a> 
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

submitContent.addEventListener('click', async (e) => {
    e.preventDefault()
    const file = fileReport.files[0]
    if (!titleReport.value || !contentReport.value || !file) {
        alert('Vui lòng điền đầy đủ thông tin và chọn file!')
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