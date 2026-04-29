let currentProposeStuId = null;
let currentProposeType = null;

function openProposeModal(id, name, type) {
    currentProposeStuId = id;
    currentProposeType = type;
    
    document.getElementById('propose-stu-name').innerText = name;
    document.getElementById('propose-type').innerText = type.toUpperCase();
    
    const modal = document.getElementById('modal-propose');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
}

function closeProposeModal() {
    const modal = document.getElementById('modal-propose');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

async function savePropose() {
    const score = parseFloat(document.getElementById('propose-score').value);
    const comment = document.getElementById('propose-comment').value;

    if (isNaN(score) || score < 0 || score > 10) {
        alert('Vui lòng nhập điểm hợp lệ 0-10');
        return;
    }

    try {
        const res = await fetch('/teacher/student/propose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: currentProposeStuId, score, comment, type: currentProposeType })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            location.reload(); // Đơn giản nhất để cập nhật UI
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
    }
}
