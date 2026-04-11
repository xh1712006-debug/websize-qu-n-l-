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

