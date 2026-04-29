<<<<<<< HEAD
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
=======
// Mở Modal Sinh viên
function openStudentModal(name, code, email, phone, project) {
    document.getElementById('m_stu_name').innerText = name || 'Chưa cập nhật';
    document.getElementById('m_stu_code').innerText = 'MSSV: ' + (code || 'N/A');
    document.getElementById('m_stu_email').innerText = email || 'Chưa cập nhật';
    document.getElementById('m_stu_phone').innerText = phone || 'Chưa cập nhật';
    document.getElementById('m_stu_project').innerText = project || 'Chưa có';

    const modal = document.getElementById('studentModal');
    const content = document.getElementById('studentModalContent');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Thêm hiệu ứng trượt nhẹ
    setTimeout(() => {
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

// Mở Modal Đồ án
function openProjectModal(name, desc, tech, percent) {
    document.getElementById('m_pro_name').innerText = name || 'Chưa cập nhật';
    document.getElementById('m_pro_desc').innerText = desc || 'Không có mô tả chi tiết.';
    
    // Xử lý công nghệ mảng hoặc string
    if (tech) {
        document.getElementById('m_pro_tech').innerText = String(tech).split(',').join(', ') || 'N/A';
    } else {
        document.getElementById('m_pro_tech').innerText = 'N/A';
    }
    
    document.getElementById('m_pro_percent').innerText = (percent || '0') + '%';

    const modal = document.getElementById('projectModal');
    const content = document.getElementById('projectModalContent');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Thêm hiệu ứng trượt nhẹ
    setTimeout(() => {
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

// Đóng Modal chung
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('.bg-white'); // Get the inner content box
    
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 200); // Đợi animation xong rồi mới hide
}

// Xử lý nhấn phím Escape để đóng Modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const studentModal = document.getElementById('studentModal');
        const projectModal = document.getElementById('projectModal');
        
        if (!studentModal.classList.contains('hidden')) {
            closeModal('studentModal');
        }
        if (!projectModal.classList.contains('hidden')) {
            closeModal('projectModal');
        }
    }
});
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
