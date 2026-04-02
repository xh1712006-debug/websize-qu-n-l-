const progressNumber = document.querySelector('.progress__number')
const progressWidth = document.querySelector('.progress__width')
const taskList = document.querySelector('#task-list')

function addWidth(data) {
    console.log('addWidth: ', data)
    progressNumber.innerText = `${data.precent}%`
    const div = document.createElement('div')
    div.className = 'bg-blue-600 h-3 rounded-full'
    div.style.width = `${data.precent}%`
    progressWidth.appendChild(div)
}

function renderTasks(data) {
    console.log('renderTasks: ', data)
    taskList.innerHTML = data.map(item => {
        const createDate = new Date(item.createdAt).toLocaleDateString('vi-VN')
        console.log(item)
        let statusText = ''
        let statusClass = ''

        if (item.status === 'pass') {
            statusText = 'Hoàn thành'
            statusClass = 'text-green-600 font-semibold'
        } else if (item.status === 'Fall') {
            statusText = 'Chưa hoàn thành'
            statusClass = 'text-gray-500'
        } else {
            statusText = 'Đang làm'
            statusClass = 'text-blue-600 font-semibold'
            
        }

        return `
        <tr>
          <td class="p-2 border text-center">${item.name}</td>
          <td class="p-2 border ${statusClass} text-center">${statusText}</td>
          <td class="p-2 border text-center">${createDate}</td> 
        </tr>
      `
    }).join('')
}

async function getProgress() {
    const res = await fetch('/student/progress/getProgress')
    const data = await res.json()

    console.log('data: ', data)
    addWidth(data.progress)
    renderTasks(data.requirementStudent)
}

getProgress()