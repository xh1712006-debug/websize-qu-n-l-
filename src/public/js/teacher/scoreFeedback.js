const studentTable = document.querySelector('#studentTable')
const modal = document.querySelector('#modal')
const scoreInput = document.querySelector('#scoreInput')
const closeModalBtn = document.querySelector('#closeModalBtn')
const saveScoreBtn = document.querySelector('#saveScoreBtn')

async function openModal(studentId, projectId) {
    try {
        modal.classList.remove('hidden')
        modal.classList.add('flex')
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden')
            modal.classList.remove('flex')
        })
        // Use onclick to avoid multiple event listeners stacking up
        saveScoreBtn.onclick = async () => {
            const res = await fetch('/teacher/scoreFeedback/postScoreFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: studentId,
                    projectId: projectId,
                    score: scoreInput.value,
                }),
            })
            const data = await res.json()
            alert('chấm điểm thành công')
            modal.classList.add('hidden')
            modal.classList.remove('flex')
            getScoreFeedback()
        };

    }
    catch (err) {
        console.log(err)
    }
}

function renderScore(data) {
    console.log('hello', data)
    let status = data.status
        ? '<span class="text-green-500 font-semibold">Đủ điều kiện</span>'
        : '<span class="text-red-500 font-semibold">Chưa đủ ĐK</span>';

    let score = data.score !== null
        ? `<span class="font-bold text-blue-600">${data.score}</span>`
        : '<span class="text-gray-400">Chưa có</span>';

    let button = data.status
        ? `<button onclick="openModal('${data.studentId}', '${data.projectId}')"
                class="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">
                ${data.score === null || data.score === 'Chưa có điểm' ? "Chấm điểm" : "Sửa điểm"}
              </button>`
        : `<button disabled
                class="bg-gray-200 text-gray-400 px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed">
                Chưa đủ ĐK
              </button>`;

    studentTable.innerHTML += `
            <tr class="border-t hover:bg-gray-50">
                <td class="p-4">${data.fullName}</td>
                <td class="p-4">${data.projectName}</td>
                <td class="p-4">${status}</td>
                <td class="p-4">${score}</td>
                <td class="p-4 text-center">${button}</td>
            </tr>
        `;
}

async function getScoreFeedback() {
    try {
        const res = await fetch('/teacher/scoreFeedback/getScoreFeedback')
        const data = await res.json()
        console.log('data: ', data)
        studentTable.innerHTML = ''
        data.forEach(item => {
            console.log('item: ', item)
            renderScore(item)
        });


    }
    catch (err) {
        console.log(err)
    }
}
getScoreFeedback()
