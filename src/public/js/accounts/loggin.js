<<<<<<< HEAD
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const submitBtn = document.getElementById('submitBtn');
    const errorBox = document.getElementById('errorBox');
    const errorText = document.getElementById('errorText');

    // Reset UI
    errorBox.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="relative z-10 flex items-center justify-center gap-3">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xác thực...
        </span>
    `;

    try {
        const response = await fetch('/loggin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (data.success) {
            // Success Feedback
            submitBtn.innerHTML = `
                <span class="relative z-10 flex items-center justify-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Thành công
                </span>
            `;
            submitBtn.className = "w-full py-5 bg-emerald-500 border border-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-500";
            
            setTimeout(() => {
                window.location.href = data.redirectUrl || '/';
            }, 800);
        } else {
            throw new Error(data.message || 'Lỗi đăng nhập');
        }

    } catch (err) {
        errorText.innerText = err.message;
        errorBox.classList.remove('hidden');
        
        // Reset Button
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <span class="relative z-10 flex items-center justify-center gap-3">
                Thử lại ngay
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5-5 5M6 7l5 5-5 5"></path></svg>
            </span>
        `;
    }
});
=======
const loginForm = document.querySelector('#loginForm')
const userEmail = document.querySelector('#email')
const userPassword = document.querySelector('#password')
const role = document.querySelector('#role')
const logIn = document.querySelector('.logIn')

async function getApiStudent(email,password){
    
    try {
        console.log(email, password)
        const res = await fetch('/loggin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        const data = await res.json()

        if (data.success) {
            window.location.href = '/student/dashboard'
        }

    }
    catch(err) {
        console.error('Error:', err)
    }
    
}
async function getApiTeacher(email,password){
    try {
        console.log(email, password)
        const res = await fetch('/loggin/sendTeacher', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password,
                role: 'teacher'
            })
        })
        const data = await res.json()

        if (data.success) {
            window.location.href = '/teacher/dashboard'
        }

    }
    catch(err) {
        console.log('đăng nhập sai mật khảu hoặc email')
        console.error('Error:', err)
    }
    
}
logIn.addEventListener('click', (e) => {
    e.preventDefault()

    console.log(role.value)
    const email = userEmail.value.trim()
    const password = userPassword.value.trim()
    if(role.value == 'student'){
        getApiStudent(email,password)
    }
    
    else if(role.value == 'teacher') {
        getApiTeacher(email,password)
    }
})

>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
