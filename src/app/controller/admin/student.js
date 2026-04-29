const content_admin = require('../../models/admin')
const studentData = require('../../models/student')
const contentProject = require('../../models/project')
const conversationData = require('../../models/conversation')
const feedbackData = require('../../models/feedback')
const progressData = require('../../models/progress')
const reportData = require('../../models/report')
const requirementData = require('../../models/requirement')
const requirementStudentData = require('../../models/requirementStudent')
const assignmentData = require('../../models/assignment')
const scoreData = require('../../models/grade')

class studentController {
    async index(req,res) {
        try {
            const rawStudents = await studentData.find()
            const students = []
            
            for(let st of rawStudents) {
                let projectName = 'Chưa có'
                let projectStatuss = 'Chưa đăng ký'
                
                if (st.projectId) {
                    const prj = await contentProject.findById(st.projectId)
                    if (prj) {
                        projectName = prj.inputProject || 'Chưa rõ'
                        projectStatuss = prj.statuss === 'active' ? 'Đang thực hiện' : prj.statuss
                    }
                }

                students.push({
                    _id: st._id,
                    studentCode: st.studentCode,
                    fullName: st.fullName,
                    studentEmail: st.studentEmail,
                    projectName: projectName,
                    projectStatuss: projectStatuss
                })
            }

            res.render('admin/student', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'student/student',
                students: students
            })
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    
    async getStudent(req, res){
        const student = await studentData.find()
        return res.json(student)
    }

    async deleteStudent(req, res) {
        try {
            const studentId = req.params.id
            const student = await studentData.findById(studentId)
            
            if(!student) return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên!' })

            if(student.projectId) {
                await contentProject.findByIdAndDelete(student.projectId)
                await requirementData.deleteMany({ projectId: student.projectId })
            }

            const convs = await conversationData.find({ studentId: studentId })
            for(let c of convs) {
                await feedbackData.deleteMany({ conversationId: c._id })
            }

            await conversationData.deleteMany({ studentId: studentId })
            await progressData.deleteMany({ studentId: studentId })
            await reportData.deleteMany({ studentId: studentId })
            await requirementStudentData.deleteMany({ studentId: studentId })
            await assignmentData.deleteMany({ studentId: studentId })
            await scoreData.deleteMany({ studentId: studentId })

            // Không xoá nick sinh viên, mà reset trạng thái trở về ban đầu
            student.status = undefined
            student.projectId = null
            student.teacherId = null
            await student.save()

            return res.json({ success: true, message: 'Đã thiết lập lại dữ liệu đồ án của sinh viên, tài khoản gốc vẫn được giữ lại!' })
        } catch(err) {
            console.error(err)
            return res.status(500).json({ success: false, message: 'Lỗi máy chủ' })
        }
    }
}

module.exports = new studentController
