document.addEventListener('DOMContentLoaded', () => {

    const tableInformation = document.querySelector('.table__information')
    const currentPassword = document.querySelector('.current__password')
    const createPassword = document.querySelector('.create__password')
    const confirmPassword = document.querySelector('.confirm__password')
    const upDate = document.querySelector('.upDate')
    const message = document.querySelector('#message')

    if (!tableInformation) return

    
    async function putInformation(password) {
        try {
            const res = await fetch('/student/account/data', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: password
                })
            })
            const data = await res.json()
            console.log(data)
        }
        catch(err){
            console.log('loi update', err)
        }
    }

    async function getInformation() {
        try {
            const res = await fetch('/student/account/data')

            if (!res.ok) {
                throw new Error('Không lấy được dữ liệu')
            }

            const data = await res.json()
            renderInformation(data)

        } catch (err) {
            console.error(err)
        }
    }

    // lắng nghe sự kiện đổi mật khấu 
    upDate.addEventListener('click', async () => {
        const res = await fetch('/student/account/data')
        const data = await res.json()
        if(data.password == currentPassword.value.trim() 
            && createPassword.value.trim() == confirmPassword.value.trim()){
            putInformation(createPassword.value.trim() )
            message.classList.remove('hidden')
            setTimeout( () => {
                message.classList.add('hidden')
                
            }, 2000)
            currentPassword.value = ''
            createPassword.value = ''
            confirmPassword.value = ''
        }
        
    })

    function renderInformation(data) {

        const section = document.createElement('section')
        section.className = 'bg-white p-6 rounded-xl shadow'

        section.innerHTML = `
            <h2 class="text-lg font-semibold mb-4 border-b pb-2">
                📄 Thông tin cá nhân
            </h2>

            <div class="space-y-3 text-sm">
                <p><span class="text-gray-500">Họ tên:</span> <span class="font-medium">${data.fullName || ''}</span></p>
                <p><span class="text-gray-500">Mã sinh viên:</span> <span class="font-medium">${data.studentCode || ''}</span></p>
                <p><span class="text-gray-500">Email:</span> <span class="font-medium">${data.studentEmail || ''}</span></p>
                <p><span class="text-gray-500">Lớp:</span> <span class="font-medium">${data.class || ''}</span></p>
                <p><span class="text-gray-500">Khoa:</span> <span class="font-medium">${data.major || ''}</span></p>
            </div>
        `

        tableInformation.appendChild(section)
    }

    getInformation()
})
