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

    if (!isPolling) {
      const teacherNameHeader = document.getElementById('teacherNameHeader')
      if(teacherNameHeader && data.fullName) {
        teacherNameHeader.innerText = data.fullName
      }
      listContent.innerHTML = '';
      currentMessageCount = 0;
    }
    
    if (isPolling && data.feedbacks.length <= currentMessageCount) {
        return; // nothing new
    }

    for(let i = currentMessageCount; i < data.feedbacks.length; i++) {
      const item = data.feedbacks[i];
      // in nhận xét của student 
      if(item.contentType === 'student') {
        const newBox = document.createElement('div')
        newBox.className =
          'ml-auto max-w-[80%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500'
        newBox.innerHTML += 
        `
          <p class="font-semibold text-green-700 mb-1">👨‍🎓 Bạn</p>
          <p>
            ${item.content}
          </p>
          <p class="text-xs text-gray-400 mt-2 text-right">
            ${new Date(item.createdAt).toLocaleDateString()}
          </p>
        `
        listContent.appendChild(newBox)
      }
      // in nhận xét của teacher 
      else if(item.contentType === 'teacher') {
        const textTeacher = document.createElement('div')
        textTeacher.className = 
          'max-w-[80%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500'
        textTeacher.innerHTML += `
          
          <p class="font-semibold text-blue-700 mb-1">👨‍🏫 ${data.fullName}</p>
          <p>
            ${item.content}
          </p>
          <p class="text-xs text-gray-400 mt-2">
            ${new Date(item.createdAt).toLocaleDateString()}
          </p>
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
      newBox.className =
        'ml-auto max-w-[80%] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500 opacity-70'
      newBox.innerHTML += 
      `
        <p class="font-semibold text-green-700 mb-1">👨‍🎓 Bạn</p>
        <p>${textContent}</p>
        <p class="text-xs text-gray-400 mt-2 text-right">Đang gửi...</p>
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
