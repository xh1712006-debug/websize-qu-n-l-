const progressNumber = document.querySelector('.progress__number')
const progressWidth = document.querySelector('.progress__width')
const timelineList = document.querySelector('#timeline-list')

function addWidth(data) {
<<<<<<< HEAD
    if (!data) return;
    const percent = data.percent || 0;
    progressNumber.innerText = `${percent}%`
    progressWidth.innerHTML = ''
=======
    progressNumber.innerText = `${data.precent}%`
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
    const div = document.createElement('div')
    div.className = 'bg-blue-600 h-3 rounded-full transition-all duration-1000'
    div.style.width = `${percent}%`
    progressWidth.appendChild(div)
}

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

async function getProgress() {
    try {
        const res = await fetch('/student/progress/getProgress')
        const data = await res.json()

        addWidth(data.progress)
        renderTimeline(data.reports)
    } catch(e) {
        console.error(e)
    }
}

getProgress()
