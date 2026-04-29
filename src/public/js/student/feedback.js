// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  
  const listContent = document.querySelector('#list__content')
  let currentMessageCount = 0;

  // create feedback

  async function postMessage(data) {
    try {
      const res = await fetch('/student/feedback/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data,
        })
      })
      return await res.json()
    } catch (err) {
      console.error('Failed to post message:', err)
      throw err
    }
  }

  
  // delete feedback 
  async function loadFeedback(id) {
    try {
      const res = await fetch(`/student/feedback/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      return res.status === 204 ? null :await res.json()
    } catch (err) {
      console.error('Failed to delete feedback:', err)
      throw err
    }
  }



  async function getFeedbackData(isPolling = false) {
    const res = await fetch('/student/feedback/data',{
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()

    // Kiểm tra an toàn dữ liệu
    if (!data || !data.feedbacks) {
        return;
    }

    if (!isPolling) {
      const teacherNameHeader = document.getElementById('teacherNameHeader')
      const teacherNameSub = document.getElementById('teacherNameSub')
      const teacherInitial = document.getElementById('teacherInitial')

      if(data.fullName && data.fullName !== 'N/A') {
        if(teacherNameHeader) teacherNameHeader.innerText = data.fullName
        if(teacherNameSub) teacherNameSub.innerText = data.fullName
        
        if(teacherInitial) {
            const nameParts = data.fullName.trim().split(' ');
            const initial = nameParts.length > 0 ? nameParts[nameParts.length - 1].substring(0, 2).toUpperCase() : 'GV';
            teacherInitial.innerText = initial;
        }
      }
      listContent.innerHTML = '';
      currentMessageCount = 0;
    }
    
    if (data.feedbacks.length <= currentMessageCount) {
        return; // nothing new
    }

    function formatTime(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' | ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }

    for(let i = currentMessageCount; i < data.feedbacks.length; i++) {
      const item = data.feedbacks[i];
      // in nhận xét của student 
      if(item.contentType === 'student') {
        const newBox = document.createElement('div')
        newBox.className = 'w-full msg-group'
        newBox.innerHTML = `
          <p class="msg-author text-right">Bạn</p>
          <div class="student-msg-bubble">
            <p class="text-white text-sm leading-relaxed font-semibold">${item.content}</p>
            <div class="msg-meta text-indigo-100/70 text-right">${formatTime(item.createdAt)}</div>
          </div>
        `
        listContent.appendChild(newBox)
      }
      // in nhận xét của teacher 
      else if(item.contentType === 'teacher') {
        const textTeacher = document.createElement('div')
        textTeacher.className = 'w-full msg-group'
        textTeacher.innerHTML = `
          <p class="msg-author">${data.fullName}</p>
          <div class="teacher-msg-bubble">
            <p class="text-slate-700 text-sm leading-relaxed font-semibold">${item.content}</p>
            <div class="msg-meta text-slate-400 font-bold">${formatTime(item.createdAt)}</div>
          </div>
        `
        listContent.appendChild(textTeacher)
      }
    }
    
    currentMessageCount = data.feedbacks.length;
    setTimeout(() => {
        listContent.scrollTop = listContent.scrollHeight;
    }, 50);
  }

  getFeedbackData()
  
  setInterval(() => { getFeedbackData(true); }, 2000);


  const deleteBtn = document.querySelectorAll('.delete-btn')
  const replyText = document.querySelector('.reply-text')
  const fromFeedback = document.querySelector('.from__feedback')
  const text = document.querySelector('.text__content')

  

  

  


  


  async function handleSend() {
      const textContent = text.value.trim()
      if(!textContent) {
        alert('Vui lòng nhập nội dung phản hồi')
        return
      }
      
      const newBox = document.createElement('div')
      newBox.className = 'w-full msg-group opacity-60'
      newBox.innerHTML = `
        <p class="msg-author text-right">Bạn</p>
        <div class="student-msg-bubble">
          <p class="text-white text-sm leading-relaxed font-semibold">${textContent}</p>
          <div class="msg-meta text-indigo-100/70 text-right">Đang gửi...</div>
        </div>
      `
      listContent.appendChild(newBox)
      text.value = ''
      listContent.scrollTop = listContent.scrollHeight
      
      await postMessage(textContent)
      // will be replaced cleanly by next poll
      getFeedbackData(true);
      newBox.remove();
  }

  fromFeedback.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSend();
  });

  // click create feedback
  text.addEventListener('keydown', async (e) => {
    // gửi sự kiến input
    if(e.key == 'Enter' && !e.shiftKey){
      e.preventDefault()
      await handleSend()
    }
  })
  
})