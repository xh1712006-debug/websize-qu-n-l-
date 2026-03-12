const text = document.querySelector('.text__content')
const fromFeedback = document.querySelector('.text__form')
const formContent = document.querySelector('.form__content')
const listStudent = document.querySelector('.list__student')
const infoStudent = document.querySelector('.info__student')

let studentList = []

function infoStudentContent(data){
    console.log('dữ liệu student:', data)
    const infoStudentContent = `
        <img src="https://i.pravatar.cc/100?img=18"
            class="w-16 h-16 rounded-full border object-cover">
        <div>
            <p class="font-semibold text-lg">${data.fullName}</p>
            <p class="text-sm text-gray-500">MSSV: ${data.studentCode}</p>
            <p class="text-sm text-gray-500">Lớp: ${data.class}</p>
        </div>
    `
    infoStudent.innerHTML = infoStudentContent
}

async function chooseStudent() {

    const res = await fetch('/teacher/feedback/getStudent')
    const data = await res.json()
    studentList = Array.isArray(data) ? data : [data]
    console.log('dữ liệu:', data)
    if(studentList){
        data.forEach(item => {
            const option = document.createElement('option')
            option.value = item._id
            option.textContent = `${item.fullName} · ${item.studentCode} · ${item.class}`
            listStudent.appendChild(option)
        })
        
    }
                    
    else{
        const option = document.createElement('option')
        option.value = data._id
        option.textContent = `${data.fullName} · ${data.studentCode} · ${data.class}`
        listStudent.appendChild(option)
        infoStudentContent(data)
    }
}

chooseStudent()

async function postFeedback(data,studentId) {
    try {

        const res = await fetch(`/teacher/feedback/postFeedback?studentId=${studentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacherContent: data,
            })
        })
        return res.json()
    }
    catch(err){
        console.log('lỗi dưa liệu:', err)
        console.error('lỗi dữ liệu:', err)
        throw err
    }
}


// xuất ra màn hình 
async function getFeedback(studentId) {
    try {
        const res = await fetch(`/teacher/feedback/getFeedback?studentId=${studentId}`)
        const data = await res.json()
    
        data.feedbacks.forEach(item => {
           
            if(item.contentType === 'teacher'){
                const textTeacher = document.createElement('div')
                textTeacher.className = 
                    'ml-auto max-w-[75%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500'
                textTeacher.innerHTML += `
                    <p class="font-semibold text-blue-700 mb-1">👨‍🏫 Giảng viên</p>
                    <p>${item.content}</p>
                    <p class="text-xs text-gray-400 mt-2 text-right">
                    ${data.fullName} · ${new Date(item.createdAt).toLocaleDateString()}
                    </p>
                `
                formContent.appendChild(textTeacher)
            }
            if(item.contentType === 'student'){
                const textStudent = document.createElement('div')
                textStudent.className = 
                    'max-w-[75%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500'
                textStudent.innerHTML += `
                    <p class="font-semibold text-green-700 mb-1">👨‍🎓 Sinh viên</p>
                    <p>${item.content}.</p>
                    <p class="text-xs text-gray-400 mt-2">
                    ${data.fullName} · ${new Date(item.createdAt).toLocaleDateString()}
                    </p>
                `
                formContent.appendChild(textStudent)
            }


        })
        
    }
    catch(err){
        console.log('lỗi dưa liệu:', err)
        console.error('lỗi dữ liệu:', err)
        throw err
    }
}


 
listStudent.addEventListener('change', (e) => {
    const studentId = e.target.value
    formContent.innerHTML = ''
    console.log('studentId:', studentId)
    console.log('studentList:', studentList)
    

    console.log(studentList)
    let selectStudent = studentList.find(s => s._id === studentId)
    console.log(selectStudent)
    getFeedback(studentId)
    infoStudentContent(selectStudent)
    
})

text.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {

        e.preventDefault()

        const textContent = text.value.trim()

        if (!textContent) return
        const studentId = listStudent.value
        console.log('studentId:', studentId)
        console.log(textContent)

        await postFeedback(textContent, studentId)

        // ✅ HIỂN THỊ NGAY
        const textTeacher = document.createElement('div')
        textTeacher.className =
            'ml-auto max-w-[75%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500'

        textTeacher.innerHTML = `
            <p class="font-semibold text-blue-700 mb-1">👨‍🏫 Giảng viên</p>
            <p>${textContent}</p>
            <p class="text-xs text-gray-400 mt-2 text-right">
            Bạn · ${new Date().toLocaleDateString()}
            </p>
        `

        formContent.appendChild(textTeacher)

        // scroll xuống cuối
        formContent.scrollTop = formContent.scrollHeight

        text.value = ''

    }
})

