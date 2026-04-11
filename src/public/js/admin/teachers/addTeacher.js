const names = document.querySelector("#name")
const email = document.querySelector("#email")
const phone = document.querySelector("#phone")
// const date = document.querySelector("#dob")
// const gender = document.querySelector("#gender")
const role = document.querySelector("#role")
const degree = document.querySelector("#degree")
const department = document.querySelector("#department")
const avatarFile = document.querySelector("#avatarFile")
const teacherId = document.querySelector("#teacherId")
const submit = document.querySelector(".submit")
const reset = document.querySelector(".reset")

async function postTeacher(data) {
    try {
        const response = await fetch("/admin/teacher/addTeacher", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        if (!response.ok) {
            throw new Error("Failed to add teacher")
        }
        const result = await response.json()
        console.log("Teacher added successfully:", result)
        alert("Teacher added successfully!")
    } catch (error) {
        console.error("Error adding teacher:", error)
        alert("Error adding teacher!")
    }
}


submit.addEventListener("click", async (e) => {
    e.preventDefault()    
    // console.log(name.value, email.value, phone.value, date.value, gender.value, role.value, degree.value, department.value, address.value, avatarFile.files[0].type)

    console.log(teacherId.value, names.value, email.value, phone.value, role.value, degree.value, department.value, avatarFile.files[0] ? avatarFile.files[0].name : null)

    postTeacher({
        name: names.value,
        email: email.value,
        phone: phone.value,
        // date: date.value,
        // gender: gender.value,
        role: role.value,
        code: teacherId.value,
        department: department.value,
        degree: degree.value,
        avatar: avatarFile.files[0] ? avatarFile.files[0].name : null
    })
})


reset.addEventListener("click", (e) => {
    e.preventDefault()
    window.location.reload()
})
