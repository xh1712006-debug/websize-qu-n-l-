// filepath: d:\hoc_html\on_html\project2\src\public\js\student\report.js
const submitContent = document.querySelector('.submit__content')
const typeReport = document.querySelector('.type__report')
const titleReport = document.querySelector('.title__report')
const contentReport = document.querySelector('.content__report')
const fileReport = document.querySelector('.file__report')
const tableContent = document.querySelector('.table__content')

// Post to database with file
async function sendTable(data) {
    try {
        const formData = new FormData()
        formData.append('content', data.content)
        formData.append('type', data.type)
        formData.append('title', data.title)
        formData.append('file_url', data.file)  // Append the file

        const res = await fetch('/student/report/new-report', {
            method: 'POST',
            body: formData  // Use FormData for file upload
        })

        return await res.json()
    } catch (err) {
        console.error('Failed to create report:', err)
        throw err
    }
}

// Get database
async function createTable() {
    try {
        const res = await fetch('/student/report/getReport')
        const data = await res.json()
        const tbody = document.createElement('tbody')
        data.report.forEach(item => {
            const createDate = new Date(item.createdAt).toLocaleDateString('vi-VN')
            tbody.innerHTML += `
                <tr>
                    <td class="border p-2">${item.title}</td>
                    <td class="border p-2">${item.type}</td>
                    <td class="border p-2">${createDate}</td>
                    <td class="border p-2 text-yellow-600 font-semibold">Chờ phản hồi</td>
                    <td class="border p-2 text-blue-600 underline cursor-pointer">
                        <a href="/uploads/${item.fileUrl}" target="_blank">Tải xuống</a>  // Updated to match static route
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

    try {
        await sendTable({
            content: contentReport.value,
            title: titleReport.value,
            file: file,  // Pass the file object
            type: typeReport.value,
        })
        window.location.reload()
    } catch (err) {
        console.error(err)
        alert('Không thể gửi báo cáo: ' + err.message)
    }
})