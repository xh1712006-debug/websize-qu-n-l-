const scoreTable = document.querySelector('#scoreTable')
const submitBtn = document.querySelector('.submit')

let data = []

async function updateScoreFeedback(data) {
    try {
        const res = await fetch('/admin/point/updateScoreFeedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: data,
            })
        })

    }
    catch (err) {
        console.log('err: ', err)
    }
}

submitBtn.addEventListener('click', () => {
    data = []
    const rows = scoreTable.querySelectorAll('tr')
    rows.forEach(row => {
        
        const inputs1 = row.querySelectorAll('.score-input1')
        const inputs2 = row.querySelectorAll('.score-input2')

        for(let i = 0; i < inputs1.length; i++) {
            const input1 = inputs1[i]
            const input2 = inputs2[i]
            const inputId = input1.dataset.id
            
            console.log('input1: ', input1.value)
            console.log('input2: ', input2.value)
            console.log('inputId: ', inputId)
            if(input1.value === '' && input2.value === '')
                return;
            data.push({
                id: inputId,
                score: input1.value,
                scoreFeedback: input2.value
            })
           
        }
        console.log('data: ', data)
        updateScoreFeedback(data)
    })
})

function calculateAverage(input) {
    const row = input.closest("tr");
    const inputs = row.querySelectorAll(".score-input");
    let total = 0;
    let count = 0;

    inputs.forEach(i => {
        console.log('i.value: ', i.value)
        if (i.value !== "") {
            total += parseFloat(i.value);
            count++;
        }
    });

    const averageCell = row.querySelector(".average");

    if (count > 0) {
        averageCell.textContent = (total / count).toFixed(2);
        console.log('average: ', averageCell.textContent)
    } else {
        averageCell.textContent = "chưa có điểm";
        console.log('average1: ', averageCell.textContent)
    }
}

function renderScoreFeedback(data) {
    const tr = document.createElement('tr')
    tr.className = 'border-t hover:bg-gray-50 transition'
    tr.innerHTML = `
        <td class="p-4 font-medium text-gray-800">
            ${data.fullName}
        </td>

        <td class="p-4 text-center">
            <input type="number" min="0" max="10" step="0.1"
            data-id="${data.id}"
            value="${data.score !== 'chưa có điểm' ? data.score : ''}"
              oninput="calculateAverage(this)"
              class="score-input1 score-input border border-gray-300 rounded-lg px-2 py-1 w-20 text-center focus:ring-2 focus:ring-blue-400 focus:outline-none transition">
        </td>

        <td class="p-4 text-center">
            <input type="number" min="0" max="10" step="0.1"
              value="${data.scoreFeedback !== 'chưa có điểm' ? data.scoreFeedback : ''}"
              data-id="${data.id}"
              oninput="calculateAverage(this)"
              class="score-input2 score-input border border-gray-300 rounded-lg px-2 py-1 w-20 text-center focus:ring-2 focus:ring-blue-400 focus:outline-none transition">
        </td>

        <td class="p-4 text-center font-bold text-blue-600 average">
            
        </td>
    `
    const firstInput = tr.querySelector('.score-input')
    if (firstInput) 
        calculateAverage(firstInput)
    scoreTable.appendChild(tr)
}

async function getScoreFeedback() {
    try {
        const res = await fetch('/admin/point/getScoreFeedback')
        const data = await res.json()
        console.log('data: ', data)
        for (const item of data) {
            console.log('item: ', item)
            renderScoreFeedback(item)
        }
    }
    catch (err) {
        console.log('err: ', err)
    }
}

getScoreFeedback()
