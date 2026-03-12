const inputProject = document.querySelector('.input__project')
const contentProject = document.querySelector('.content__project')
const teacherInstruct = document.querySelector('.teacher__instruct')
const teacherFeedback = document.querySelector('.teacher__feedback')
const date = document.querySelector('.date')
const statuss = document.querySelector('.status')
const numberStudent = document.querySelector('.number__student')
const submit = document.querySelector('.submit')

async function getteacherInstruct() {

    const defaultOption = document.createElement('option')
    defaultOption.textContent = "-- Chọn giáo viên --"
    defaultOption.value = ""
    teacherInstruct.appendChild(defaultOption)

    const res = await fetch('/Api/teacher')
    const data = await res.json()

    data.forEach(teacher => {
        const option = document.createElement('option')
        option.textContent = teacher.fullName
        option.value = teacher._id
        teacherInstruct.appendChild(option)
    })
}

getteacherInstruct()



// post vào database
async function postProject(data){
    try {
        const res = await fetch('/admin/project/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputProject: data.inputProject,
                contentProject: data.contentProject,
                teacherInstruct: data.teacherInstruct,
                date: data.date,
                statuss: data.statuss,
                numberStudent: data.numberStudent,
                id: data.id
            })
        })
        const result = await res.json()
        console.log(result)
        window.location.href = '/admin/project'
    }
    catch(err){
        console.log('lỗi create: ',err)
    }
}

submit.addEventListener('click',async (e) => {
    e.preventDefault()
    const teacherId = teacherInstruct.value
    const teacherName = teacherInstruct.options[teacherInstruct.selectedIndex].textContent
    console.log(teacherId)
    console.log(inputProject.value.trim())
    console.log(contentProject.value.trim())
    console.log(teacherInstruct.value.trim())
    console.log(teacherName)
    
    console.log(statuss.value.trim())
    console.log(numberStudent.value)

    // date = new Date(date.value).toLocaleDateString('vi-VN')
    postProject({
        inputProject: inputProject.value.trim(),
        contentProject: contentProject.value.trim(),
        teacherInstruct: teacherName,
        // teacherFeedback: teacherName,
        date: date.value,
        statuss: statuss.value.trim(),
        numberStudent: numberStudent.value,
        id: teacherId,
    })
    
})

