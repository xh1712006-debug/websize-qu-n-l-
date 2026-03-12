const confirmPassword = document.querySelector('#confirmPassword')
const password = document.querySelector('#password')
const submit = document.querySelector('#submit')
const error = document.getElementById("error")

async function postPassword(data){
    try{
        const res = await fetch('/auth/reg',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: data
            })
        })
    }
    catch(err){
        console.log(err)
    }
}

submit.addEventListener('click', (e) => {
    e.preventDefault()
    if(password.value !== confirmPassword.value){
        error.innerText = "Mật khẩu không khớp"
        return
    }

    error.innerText = ""

    alert("Đăng ký thành công")
    console.log(password.value)
    postPassword(password.value)

    window.location.href = '/student/dashboard'
    
})
