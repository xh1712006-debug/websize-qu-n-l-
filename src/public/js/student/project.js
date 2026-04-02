const studentList = document.querySelector('.studentList')
const teacherList = document.querySelector('.teacherList')
const topicName = document.querySelector('.topic')
const topicDescription = document.querySelector('.topic_description')
const technologyList = document.querySelector('.technologyList')
const listRequest = document.querySelector('.list__request')
const numberProdress = document.querySelector('.numberProdress')
const widthProgress = document.querySelector('.widthProgress')
const numberReport = document.querySelector('.numberReport')
const dateText = document.querySelector('.date-text')
// const listReport = document.querySelector('.listReport')

async function getProject(){
    const res = await fetch('/student/project/getProject')
    const data =await res.json()
    console.log(data)
    topicName.innerText = `${data.project.inputProject}`
    student(data.student)
    teacher(data.teacher)
    topicDescription.innerText = `${data.project.contentProject}`
    topicRequest(data.requirementStudent)
    numberProdress.innerText = `${data.progress.precent}%`
    widthProgress.style.width = `${data.progress.precent}`
    numberReport.innerText = `${data.report.length}`
    const date = new Date(data.project.date).toLocaleDateString('vi-VN')
    dateText.innerText = date
     topicTechnology(data.project)
    
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

//mục tiêu đề tài
function topicRequest(data){
    console.log('data: ', data)
    data.forEach(item => {
        const li = document.createElement('li')
        console.log('item: ', item.name)
        li.innerText = `${item.name}`
        listRequest.appendChild(li)
    });
}

function eventList(item){
    const div = document.createElement('div')
    item.technology.forEach(data => {
        
    });
}

function student(item){
    studentList.innerHTML = ''
    studentList.innerHTML = `
        <p class="text-sm text-gray-500 mb-3">👨‍🎓 Sinh viên thực hiện</p>
        <p class="text-lg font-semibold text-gray-800">${item.fullName}</p>
        <p class="text-sm text-gray-600">MSSV: ${item.studentCode}</p>
        <p class="text-sm text-gray-600">phont: ${item.phont}</p>
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