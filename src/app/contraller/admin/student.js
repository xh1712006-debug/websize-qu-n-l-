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
const notificationData = require('../../models/notification')

class studentController {
    async index(req,res) {
        try {
            // [MIGRATION] Thiết kế lại chuyên ngành theo chuẩn Khoa CNTT - HUMG
            await studentData.updateMany({ studentMajor: { $in: ["Kỹ thuật phần mềm", "Chưa cập nhật", "", null] } }, { studentMajor: "Công nghệ phần mềm" });
            await studentData.updateMany({ studentMajor: { $in: ["Khoa học dữ liệu", "An toàn thông tin", "Khoa học dữ liệu & AI"] } }, { studentMajor: "Khoa học máy tính" });
            await studentData.updateMany({ studentMajor: "Mạng máy tính và Truyền thông" }, { studentMajor: "Mạng máy tính" });

            const majors = [
                "Công nghệ phần mềm",
                "Mạng máy tính",
                "Khoa học máy tính",
                "Hệ thống thông tin",
                "Tin học kinh tế",
                "Địa tin học"
            ]

            res.render('admin/student', {
                layout: 'base',
                figure: 'admin',
                active: 'student',
                majors: majors
            });
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    
    // API lấy danh sách sinh viên cho AJAX
    async getStudents(req, res){
        try {
            const rawStudents = await studentData.find().lean();
            const students = [];
            
            for(let st of rawStudents) {
                let projectName = 'Chưa đăng ký';
                let projectStatusNum = 0; // percentage if needed
                
                if (st.projectId) {
                    const prj = await contentProject.findById(st.projectId).lean();
                    if (prj) {
                        projectName = prj.inputProject || 'Đồ án không tên';
                    }
                }

                students.push({
                    ...st,
                    projectName: projectName
                });
            }
            return res.json(students)
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async deleteStudent(req, res) {
        try {
            const studentId = req.params.id
            const student = await studentData.findById(studentId)
            
            if(!student) return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên!' })

            // [PROTECTION] Không được xoá tài khoản đăng nhập bằng Microsoft
            if (student.isMicrosoft) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Đây là tài khoản Microsoft SSO. Hệ thống không cho phép xoá tài khoản này để đảm bảo tính đồng bộ!' 
                })
            }

            const projectId = student.projectId

            // 1. Dọn dẹp tất cả dữ liệu liên quan đến sinh viên này
            await Promise.all([
                requirementStudentData.deleteMany({ studentId: studentId }),
                progressData.deleteMany({ studentId: studentId }),
                reportData.deleteMany({ studentId: studentId }),
                scoreData.deleteMany({ studentId: studentId }),
                assignmentData.deleteMany({ studentId: studentId }),
                // Xoá hội thoại và phản hồi
                (async () => {
                    const conv = await conversationData.findOne({ studentId: studentId })
                    if (conv) {
                        await feedbackData.deleteMany({ conversationId: conv._id })
                        await conversationData.findByIdAndDelete(conv._id)
                    }
                })()
            ])

            // 2. Xử lý Đồ án (Nếu có)
            if (projectId) {
                await requirementData.deleteMany({ projectId: projectId })
                await contentProject.findByIdAndDelete(projectId)
            }

            // 3. XÓA VĨNH VIỄN TÀI KHOẢN SINH VIÊN
            await studentData.findByIdAndDelete(studentId)
            await notificationData.deleteMany({ receiverId: studentId })

            return res.json({ success: true, message: 'Đã xóa vĩnh viễn tài khoản sinh viên và toàn bộ dữ liệu liên quan thành công!' })
        } catch(err) {
            console.error(err)
            return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thực hiện xoá dữ liệu' })
        }
    }


    // [POST] /admin/student/update/:id
    async updateStudent(req, res) {
        try {
            const { id } = req.params
            const { fullName, studentEmail, studentClass, studentMajor, studentCode } = req.body

            const student = await studentData.findById(id)
            if (!student) return res.json({ success: false, message: 'Không tìm thấy sinh viên!' })

            student.fullName = fullName
            student.studentEmail = studentEmail
            student.studentClass = studentClass
            student.studentMajor = studentMajor
            student.studentCode = studentCode
            
            await student.save()
            res.json({ success: true, message: 'Cập nhật thông tin sinh viên thành công!' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}

module.exports = new studentController