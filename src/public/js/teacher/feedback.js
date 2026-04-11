const text = document.querySelector('.text__content')
const fromFeedback = document.querySelector('.text__form')
const formContent = document.querySelector('.form__content')
const listStudent = document.querySelector('.list__student')
const infoStudent = document.querySelector('.info__student')

let studentList = [];
let currentMessageCount = 0;
let pollingInterval = null;

function infoStudentContent(data){
    console.log('dữ liệu student:', data)
    const infoStudentContent = `
        <div>
            <p class="font-semibold text-lg">${data.fullName}</p>
            <p class="text-sm text-gray-500">MSSV: ${data.studentCode}</p>
            <p class="text-sm text-gray-500">Email: ${data.studentEmail || 'Chưa cập nhật'}</p>
        </div>
    `
    infoStudent.innerHTML = infoStudentContent
    document.getElementById('infoProjectName').innerText = data.projectName || 'Chưa có đồ án';
}

async function chooseStudent() {

    const res = await fetch('/teacher/feedback/getStudent')
    const data = await res.json()
    studentList = Array.isArray(data) ? data : [data]
    console.log('dữ liệu:', data)
    if(studentList && studentList.length > 0){
        studentList.forEach(item => {
            const option = document.createElement('option')
            option.value = item._id
            
            // Mark unread symbol
            let label = `${item.fullName} · ${item.studentCode}`;
            if (item.unread) {
                label = '🔴 ' + label + ' (Có tin nhắn mới)';
            }
            
            option.textContent = label;
            listStudent.appendChild(option)
        })
    }
}

chooseStudent()

async function postFeedback(data,studentId) {
    try {

        const res = await fetch(`/teacher/feedback/postFeedback?studentId=${studentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacherContent: data,
            })
        })
        return res.json()
    }
    catch(err){
        console.log('lỗi dưa liệu:', err)
        console.error('lỗi dữ liệu:', err)
        throw err
    }
}


// xuất ra màn hình 
async function getFeedback(studentId, isPolling = false) {
    try {
        const res = await fetch(`/teacher/feedback/getFeedback?studentId=${studentId}`)
        const data = await res.json()
    
        const newFeedbacks = data.feedbacks;
        if (isPolling && newFeedbacks.length <= currentMessageCount) {
            return; // No new messages
        }
        
        if (!isPolling) {
            formContent.innerHTML = '';
            currentMessageCount = 0;
        }
        
        for (let i = currentMessageCount; i < newFeedbacks.length; i++) {
            const item = newFeedbacks[i];
            if(item.contentType === 'teacher'){
                const textTeacher = document.createElement('div')
                textTeacher.className = 
                    'ml-auto max-w-[75%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500'
                textTeacher.innerHTML += `
                    <p class="font-semibold text-blue-700 mb-1">👨‍🏫 Giảng viên</p>
                    <p>${item.content}</p>
                    <p class="text-xs text-gray-400 mt-2 text-right">
                    ${data.fullName} · ${new Date(item.createdAt).toLocaleDateString()}
                    </p>
                `
                formContent.appendChild(textTeacher)
            }
            if(item.contentType === 'student'){
                const textStudent = document.createElement('div')
                textStudent.className = 
                    'max-w-[75%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500'
                textStudent.innerHTML += `
                    <p class="font-semibold text-green-700 mb-1">👨‍🎓 Sinh viên</p>
                    <p>${item.content}</p>
                    <p class="text-xs text-gray-400 mt-2">
                    ${data.fullName} · ${new Date(item.createdAt).toLocaleDateString()}
                    </p>
                `
                formContent.appendChild(textStudent)
            }
        }
        currentMessageCount = newFeedbacks.length;
        setTimeout(() => {
            formContent.scrollTop = formContent.scrollHeight;
        }, 50);
        
    }
    catch(err){
        console.error('lỗi dữ liệu:', err)
    }
}


 
listStudent.addEventListener('change', (e) => {
    const studentId = e.target.value
    
    if (pollingInterval) clearInterval(pollingInterval);
    
    // Hide panel if no student selected
    if (!studentId) {
        document.getElementById('studentInfoBox').classList.add('hidden');
        formContent.classList.add('hidden');
        fromFeedback.classList.add('hidden');
        infoStudent.innerHTML = '';
        currentMessageCount = 0;
        return;
    }
    
    document.getElementById('studentInfoBox').classList.remove('hidden');
    formContent.classList.remove('hidden');
    fromFeedback.classList.remove('hidden');
    
    formContent.innerHTML = ''
    currentMessageCount = 0;
    
    let selectStudent = studentList.find(s => s._id === studentId)
    getFeedback(studentId)
    infoStudentContent(selectStudent)
    
    pollingInterval = setInterval(() => {
        getFeedback(studentId, true);
    }, 2000);
    
})

async function handleSendMessage() {
    const textContent = text.value.trim();
    if (!textContent) return;
    const studentId = listStudent.value;
    
    // Optimistic UI update
    const textTeacher = document.createElement('div')
    textTeacher.className =
        'ml-auto max-w-[75%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500 opacity-70'
    textTeacher.innerHTML = `
        <p class="font-semibold text-blue-700 mb-1">👨‍🏫 Giảng viên</p>
        <p>${textContent}</p>
        <p class="text-xs text-gray-400 mt-2 text-right">Đang gửi...</p>
    `
    formContent.appendChild(textTeacher)
    formContent.scrollTop = formContent.scrollHeight
    text.value = ''
    
    await postFeedback(textContent, studentId)
    // The next polling tick or manual refresh will finalize it
    getFeedback(studentId, true);
    // Remove optimistic text since getFeedback will append it properly
    textTeacher.remove();
}

fromFeedback.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSendMessage();
});

text.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        await handleSendMessage();
    }
})

