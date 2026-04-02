const inputProject = document.querySelector('.input__project')
const contentProject = document.querySelector('.content__project')
const teacherInstruct = document.querySelector('.teacher__instruct')
const teacherFeedback = document.querySelector('.teacher__feedback')
const date = document.querySelector('.date')
const statuss = document.querySelector('.status')
const numberStudent = document.querySelector('.number__student')
const submit = document.querySelector('.submit')
const requirementList = document.querySelector('.requirementList')
const technology = document.querySelector('.technology') 


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

async function getteacherFeedback() {

    const defaultOption = document.createElement('option')
    defaultOption.textContent = "-- Chọn giáo viên --"
    defaultOption.value = ""
    teacherFeedback.appendChild(defaultOption)

    const res = await fetch('/Api/teacher')
    const data = await res.json()

    data.forEach(teacher => {
        const option = document.createElement('option')
        option.textContent = teacher.fullName
        option.value = teacher._id
        teacherFeedback.appendChild(option)
    })
}

getteacherInstruct()
getteacherFeedback()



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
                teacherFeedbackId: data.teacherFeedbackId,
                teacherFeedbackName: data.teacherFeedbackName,
                date: data.date,
                statuss: data.statuss,
                technology: data.technology,
                requirement: data.requirement,
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

function requirement(){
    const requirementText = document.querySelectorAll('.requirementText')
    let requirement = []
    requirementText.forEach(item => {
        console.log('requirement:',item.value)
        requirement.push(item.value)
    });
    return requirement
    
}

submit.addEventListener('click',async (e) => {
    e.preventDefault()
    console.log(requirement())
    
    const teacherId = teacherInstruct.value
    const teacherName = teacherInstruct.options[teacherInstruct.selectedIndex].textContent
    console.log('teacherId: ', teacherId)
    console.log('inputProject: ', inputProject.value.trim())
    console.log('contentProject: ', contentProject.value.trim())
    console.log('teacherInstruct: ', teacherInstruct.value.trim())
    console.log('teacherName: ', teacherName)
    console.log('teacherFeedback: ', teacherFeedback.value.trim())
    console.log('teacherFeedbackname: ', teacherFeedback.options[teacherFeedback.selectedIndex].textContent)
    console.log('date: ', date.value)
    console.log('statuss: ', statuss.value.trim())
    console.log('numberStudent: ', numberStudent.value)

    const dateValue = new Date(date.value).toLocaleDateString('vi-VN')
    postProject({
        inputProject: inputProject.value.trim(),
        contentProject: contentProject.value.trim(),
        teacherInstruct: teacherName,
        technology: technology.value.trim(),
        date: dateValue,
        statuss: statuss.value.trim(),
        numberStudent: numberStudent.value,
        id: teacherId,
        requirement: requirement(),
        teacherFeedbackId: teacherFeedback.value.trim(),
        teacherFeedbackName: teacherFeedback.options[teacherFeedback.selectedIndex].textContent
    })
    
})

