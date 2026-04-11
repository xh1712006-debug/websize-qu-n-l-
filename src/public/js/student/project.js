const studentList = document.querySelector('.studentList')
const teacherList = document.querySelector('.teacherList')
const topicName = document.querySelector('.topic')
const topicDescription = document.querySelector('.topic_description')
const technologyList = document.querySelector('.technologyList')
const timelineList = document.querySelector('#timeline-list')
const numberProdress = document.querySelector('.numberProdress')
const widthProgress = document.querySelector('.widthProgress')
const numberReport = document.querySelector('.numberReport')
const dateText = document.querySelector('.date-text')

async function getProject(){
    const res = await fetch('/student/project/getProject')
    const data =await res.json()
    console.log(data)
    topicName.innerText = `${data.project.inputProject}`
    student(data.student)
    teacher(data.teacher)
    topicDescription.innerText = `${data.project.contentProject}`
    numberProdress.innerText = `${data.progress.precent}%`
    widthProgress.style.width = `${data.progress.precent}%`
    numberReport.innerText = `${data.report.length}`
    const date = new Date(data.project.date).toLocaleDateString('vi-VN')
    dateText.innerText = date
    topicTechnology(data.project)
    renderTimeline(data.report)
}
// technology
function topicTechnology(data){
    console.log('data.technology: ', data.technology[0])
    const arr = data.technology[0].split(' ')
    console.log(arr)
    arr.forEach(item => {
        const span = document.createElement('span')
        span.className = 'tech-badge'
        span.innerText = item
        technologyList.appendChild(span)
    })
    
}

// Timeline Render
function renderTimeline(reports) {
    let timelineHTML = '';
    
    // Tạo timeline từ Tuần 1 đến Tuần 10
    for(let w = 1; w <= 10; w++) {
        const report = reports.find(r => r.week === w)
        
        let statusColor = 'bg-gray-200'
        let icon = '⏳'
        let title = 'Chưa nộp'
        let desc = 'Sinh viên chưa thực hiện nộp báo cáo cho tuần này.'
        
        if (report) {
            title = report.title;
            if (report.status === 'đã duyệt') {
                statusColor = 'bg-green-500'
                icon = '✅'
                desc = `<span class="text-green-700 font-semibold">Đã duyệt</span><br><span class="italic text-gray-600">Lời phê: ${report.teacherFeedback || 'Không có'}</span>`
            } else if (report.status === 'yêu cầu nộp lại') {
                statusColor = 'bg-red-500'
                icon = '❌'
                desc = `<span class="text-red-600 font-semibold">Từ chối</span><br><span class="italic text-gray-600">Lý do: ${report.teacherFeedback || 'Không có'}</span>`
            } else if (report.status === 'chờ duyệt') {
                statusColor = 'bg-yellow-400'
                icon = '👀'
                desc = `<span class="text-yellow-700 font-semibold">Đang chờ chấm</span>`
            }
        }

        const isLeft = w % 2 !== 0; // Trái hoặc phải
        
        timelineHTML += `
        <div class="mb-8 flex justify-between items-center w-full ${isLeft ? 'flex-row-reverse' : ''}">
            <div class="order-1 w-5/12"></div>
            <div class="z-20 flex items-center order-1 ${statusColor} shadow-xl w-10 h-10 rounded-full justify-center text-white font-bold">
                ${icon}
            </div>
            <div class="order-1 bg-gray-50 rounded-lg shadow-md w-5/12 px-6 py-4 border">
                <h3 class="mb-1 font-bold text-gray-800 text-lg">Tuần ${w}: ${title}</h3>
                <p class="text-sm leading-snug text-gray-700">
                    ${desc}
                </p>
            </div>
        </div>
        `
    }
    
    timelineList.innerHTML = timelineHTML;
}

function student(item){
    studentList.innerHTML = ''
    studentList.innerHTML = `
        <p class="text-sm text-gray-500 mb-3">👨‍🎓 Sinh viên thực hiện</p>
        <p class="text-lg font-semibold text-gray-800">${item.fullName}</p>
        <p class="text-sm text-gray-600">MSSV: ${item.studentCode}</p>
        <p class="text-sm text-gray-600">SĐT: ${item.phone}</p>
        <p class="text-sm text-gray-600">Email: ${item.studentEmail}</p>
    `
}

function teacher(item){
    teacherList.innerHTML = ''
    teacherList.innerHTML = `
        <p class="text-sm text-gray-500 mb-3">👨‍🏫 Giảng viên hướng dẫn</p>
        <p class="text-lg font-semibold text-gray-800">${item.fullName}</p>
        <p class="text-sm text-gray-600">${item.department}</p>
        <p class="text-sm text-gray-600">Email: ${item.teacherEmail}</p>
    `
}

getProject()
