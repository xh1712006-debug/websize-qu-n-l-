async function deleteStudent(studentId){
    if(!confirm('Cảnh báo: Hành động này sẽ dọn dẹp TOÀN BỘ dữ liệu cấu trúc đồ án của sinh viên (bao gồm đồ án, điểm số, bài nộp). Tuy nhiên, tài khoản gốc của sinh viên vẫn sẽ được giữ lại. Bạn có CHẮC CHẮN không?')) return;
    
    try {
        const res = await fetch(`/admin/student/delete/${studentId}`, {
            method: 'DELETE'
        })
        const data = await res.json()
        if (data.success) {
            alert(data.message)
            window.location.reload()
        } else {
            alert(data.message)
        }
    } catch(err) {
        console.error(err)
        alert('Lỗi khi thực hiện xoá.')
    }
}
