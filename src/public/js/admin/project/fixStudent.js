const submit = document.querySelector('.submit')
const fixForm = document.querySelector('.fix__form')

const id = window.location.pathname.split('/').pop()

    console.log("ID là:", id)

// lấy API 
async function getApi(id) {
    try{
        const res = await fetch(`/Api/project/${id}`)
        
        const data = await res.json()
        console.log(data)
        const inputProject = document.querySelector('#inputProject')
        const contentProject = document.querySelector('#contentProject')
        const teacherInstruct = document.querySelector('#teacherInstruct')
        const numberStudent = document.querySelector('#numberStudent')
        const date = document.querySelector('#date')
        const statuss = document.querySelector('#statuss')


        inputProject.value = data.inputProject
        contentProject.value = data.contentProject
        teacherInstruct.value = data.teacherInstruct
        numberStudent.value = data.numberStudent
        date.value = data.date ? data.date.split('T')[0] : ''

        statuss.value = data.statuss 
        
    }
    catch(err){
        console.log(err)
    }
}

// gửi Api 
async function putApi(data) {
    try {
        const res = await fetch(`/admin/project/fixStudent/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputProject: data.inputProject,
                contentProject: data.contentProject,
                teacherInstruct: data.teacherInstruct,
                numberStudent: data.numberStudent,
                statuss: data.statuss,
                date: data.date,
            })
        })
        const result = await res.json()
        sonsole.log(result)
        sonsole.log('id là: ', data.id)
    }
    catch(err) {
        console.log(err)
    }
    
}


getApi(id)

submit.addEventListener('click', async (e) => {
    e.preventDefault()

    const inputProject = document.querySelector('#inputProject')
    const contentProject = document.querySelector('#contentProject')
    const teacherInstruct = document.querySelector('#teacherInstruct')
    const numberStudent = document.querySelector('#numberStudent')
    const date = document.querySelector('#date')
    const statuss = document.querySelector('#statuss')

    putApi({
        inputProject: inputProject.value.trim(),
        contentProject: contentProject.value.trim(),
        teacherInstruct: teacherInstruct.value.trim(),
        numberStudent: numberStudent.value.trim(),
        date: date.value,
        id: id,
        statuss: statuss.value,
    })

    window.location.href = '/admin/project'

})
