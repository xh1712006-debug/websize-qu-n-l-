const studentTable = document.querySelector('#studentTable')
const modal = document.querySelector('#modal')
const scoreInput = document.querySelector('#scoreInput')
const commentInput = document.querySelector('#commentInput')
const closeModalBtn = document.querySelector('#closeModalBtn')
const saveScoreBtn = document.querySelector('#saveScoreBtn')

async function openModal(scoreId) {
    try {
        console.log('scoreId: ', scoreId)
        modal.classList.remove('hidden')
        modal.classList.add('flex')
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden')
            modal.classList.remove('flex')
        })
        saveScoreBtn.addEventListener('click', async () => {
            const res = await fetch('/teacher/score/postScore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scoreId: scoreId,
                    score: scoreInput.value,
                    comment: commentInput.value,
                }),
            })
            const data = await res.json()
            alert('chấm điểm thành công')
            modal.classList.add('hidden')
            modal.classList.remove('flex')
            getScore()
        })

    }
    catch (err) {
        console.log(err)
    }
}

function renderScore(data) {
    console.log('hello', data)
    studentTable.innerHTML = ''
    let status = data.status
        ? '<span class="text-green-500 font-semibold">Đã nộp</span>'
        : '<span class="text-red-500 font-semibold">Chưa nộp</span>';

    let score = data.score !== null
        ? `<span class="font-bold text-blue-600">${data.score}</span>`
        : '<span class="text-gray-400">Chưa có</span>';

    let button = data.status
        ? `<button onclick="openModal('${data.id}')"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                ${data.score === null ? "Chấm điểm" : data.status === false ? "sữa điểm" : "đã duyệt"}
              </button>`
        : `<button disabled
                class="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed">
                Chưa nộp
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

async function getScore() {
    try {
        const res = await fetch('/teacher/score/getScore')
        const data = await res.json()
        console.log('data: ', data)
        data.forEach(item => {
            console.log('item: ', item)
            renderScore(item)
        });


    }
    catch (err) {
        console.log(err)
    }
}
getScore()