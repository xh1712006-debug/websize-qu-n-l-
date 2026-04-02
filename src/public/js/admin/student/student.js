async function getListStudent(){
    const res = await fetch('/admin/student/getStudent')
    const data = res.json()
    console.log(data)
}
getListStudent()