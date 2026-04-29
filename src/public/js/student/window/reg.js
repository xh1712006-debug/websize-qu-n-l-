const listProject = document.querySelector('.list__project')



function selectProject(data) {

    const divProject = document.createElement('div')
    divProject.className = 'project bg-white rounded-xl shadow-lg p-5 border card-hover'
    divProject.innerHTML = `
        
            <div class="flex justify-between items-center">

                <h3 class="text-lg font-bold text-blue-600">
                    ${data.inputProject}
                </h3>

                <span class="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                    Có thể chọn
                </span>

            </div>


            <p class="text-gray-600 mt-3">
                ${data.contentProject}
            </p>


            <div class="mt-4 text-sm text-gray-500">

                👨‍🏫 GV: ${data.teacherInstruct}

            </div>


            <button
                id="${data._id}"
                class="submit mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold"
            >
                Chọn đồ án
            </button>

    `
    listProject.appendChild(divProject)

    // listProject.addEventListener('click', async (e) => {

    //     if(e.target.classList.contains('submit')) {

    //         const projectId = e.target.id

    //         console.log('ID project:', projectId)

    //         try {
    //             const res = await fetch(`/student/dashboard/selectProject`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({
    //                     projectId: projectId,
    //                 })
    //             })

    //             if(res.ok) {
                    
    //                 window.location.href = '/student/dashboard'
    //             }

    //         } catch(err) {
    //             console.log(err)
    //         }
    //     }
    // })
}

async function getApi() {
    try {
        const res = await fetch("/Api/project")
        const data = await res.json()
        data.forEach(item => {
            selectProject(item)
        });
    }
    catch(err) {
        console.log(err)
    }
}

getApi()

listProject.addEventListener('click', async (e) => {

    if(e.target.classList.contains('submit')) {

        const projectId = e.target.id

        console.log('ID project:', projectId)

        try {
            const res = await fetch(`/student/dashboard/selectProject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId: projectId,
                })
            })

        } catch(err) {
            console.log(err)
        }
    }
})
