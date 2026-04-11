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
