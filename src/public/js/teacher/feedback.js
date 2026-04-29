document.addEventListener('DOMContentLoaded', () => {
    const studentListContainer = document.getElementById('studentListContainer');
    const studentSearch = document.getElementById('studentSearch');
    const welcomeState = document.getElementById('welcomeState');
    const chatHeader = document.getElementById('chatHeader');
    const messageContainer = document.getElementById('messageContainer');
    const inputArea = document.getElementById('inputArea');
    const feedbackForm = document.getElementById('feedbackForm');
    const messageInput = document.getElementById('messageInput');
    
    // Header elements
    const activeStudentName = document.getElementById('activeStudentName');
    const activeStudentCode = document.getElementById('activeStudentCode');
    const studentAvatar = document.getElementById('studentAvatar');

    let activeStudentId = null;
    let currentMessageCount = 0;
    let allStudents = [];
    let chatPolling = null;

    // --- 1. STUDENT LIST LOGIC ---

    async function fetchStudents() {
        try {
            const res = await fetch('/teacher/feedback/getStudent');
            const data = await res.json();
            allStudents = data;
            renderStudentList(allStudents);
        } catch (err) {
            console.error('Fetch students error:', err);
        }
    }

    function renderStudentList(students) {
        const searchTerm = studentSearch.value.toLowerCase();
        const filtered = students.filter(s => 
            s.fullName.toLowerCase().includes(searchTerm) || 
            s.studentCode.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            studentListContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-32 opacity-30 italic text-xs text-center p-4">
                    <p>Không tìm thấy sinh viên nào</p>
                </div>
            `;
            return;
        }

        studentListContainer.innerHTML = filtered.map(s => {
            const isActive = s._id === activeStudentId;
            const displayName = s.fullName || 'Sinh viên';
            const initials = displayName.trim().split(' ').pop().substring(0, 2).toUpperCase() || 'SV';
            const time = s.lastMsgTime ? new Date(s.lastMsgTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
            
            return `
                <div class="student-item p-4 rounded-2xl cursor-pointer flex items-center gap-3 relative hover:bg-slate-50 transition-all ${isActive ? 'active shadow-sm' : ''}" 
                     onclick="window.selectStudent('${s._id}')">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs flex-shrink-0">
                        ${initials}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline mb-0.5">
                            <h4 class="text-xs font-black text-slate-800 truncate">${displayName}</h4>
                            <span class="text-[8px] font-bold text-slate-400">${time}</span>
                        </div>
                        <p class="text-[10px] text-slate-500 truncate font-medium">${s.lastMessage || '...'}</p>
                    </div>
                    ${s.unreadCount > 0 ? `
                        <div class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            ${s.unreadCount}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    window.selectStudent = (id) => {
        if (activeStudentId === id) return;
        
        activeStudentId = id;
        currentMessageCount = 0;
        messageContainer.innerHTML = '';
        
        // UI transitions
        welcomeState.classList.add('hidden');
        chatHeader.classList.remove('hidden');
        messageContainer.classList.remove('hidden');
        inputArea.classList.remove('hidden');

        // Update Header
        const student = allStudents.find(s => s._id === id);
        if (student) {
            activeStudentName.innerText = student.fullName;
            activeStudentCode.innerText = `MSSV: ${student.studentCode}`;
            studentAvatar.innerText = student.fullName.split(' ').pop().substring(0, 2).toUpperCase();
        }

        // Fresh fetch
        fetchChat(id);
        renderStudentList(allStudents); // Re-render to show active state

        // Reset Polling
        if (chatPolling) clearInterval(chatPolling);
        chatPolling = setInterval(() => fetchChat(id, true), 2000);
    };

    // --- 2. CHAT LOGIC ---

    async function fetchChat(studentId, isPolling = false) {
        try {
            const res = await fetch(`/teacher/feedback/getFeedback?studentId=${studentId}`);
            const data = await res.json();
            
            if (!data || !data.feedbacks) return;

            if (isPolling && data.feedbacks.length <= currentMessageCount) {
                return;
            }

            if (!isPolling) {
                messageContainer.innerHTML = '';
                currentMessageCount = 0;
            }

            for (let i = currentMessageCount; i < data.feedbacks.length; i++) {
                const msg = data.feedbacks[i];
                const date = new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                
                const studentShortName = (data.fullName || 'SV').trim().split(' ').pop().toUpperCase();
                
                const msgEl = document.createElement('div');
                if (msg.contentType === 'teacher') {
                    msgEl.className = 'flex flex-col items-end';
                    msgEl.innerHTML = `
                        <div class="teacher-msg-bubble">
                            <p class="text-[13px] font-bold leading-relaxed whitespace-pre-wrap">${msg.content}</p>
                        </div>
                        <span class="msg-meta mr-2">${date} · BẠN</span>
                    `;
                } else {
                    msgEl.className = 'flex flex-col items-start';
                    msgEl.innerHTML = `
                        <div class="student-msg-bubble">
                            <p class="text-[13px] font-bold leading-relaxed whitespace-pre-wrap text-slate-700">${msg.content}</p>
                        </div>
                        <span class="msg-meta ml-2">${date} · ${studentShortName}</span>
                    `;
                }
                messageContainer.appendChild(msgEl);
            }

            currentMessageCount = data.feedbacks.length;
            
            // Scroll to bottom
            setTimeout(() => {
                messageContainer.scrollTo({
                    top: messageContainer.scrollHeight,
                    behavior: isPolling ? 'smooth' : 'auto'
                });
            }, 100);

            // Also refresh student list to clear badge
            if (!isPolling) fetchStudents();

        } catch (err) {
            console.error('Fetch chat error:', err);
        }
    }

    async function sendMessage() {
        const content = messageInput.value.trim();
        if (!content || !activeStudentId) return;

        messageInput.value = '';
        messageInput.style.height = 'auto';

        try {
            const res = await fetch(`/teacher/feedback/postFeedback?studentId=${activeStudentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherContent: content })
            });
            const result = await res.json();
            if (result.success) {
                fetchChat(activeStudentId, true);
                fetchStudents(); // Update snippet in list
            }
        } catch (err) {
            console.error('Send message error:', err);
        }
    }

    // --- 3. EVENT LISTENERS ---

    studentSearch.addEventListener('input', () => renderStudentList(allStudents));

    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Init
    fetchStudents();
    setInterval(fetchStudents, 5000); // Poll list every 5s

});
