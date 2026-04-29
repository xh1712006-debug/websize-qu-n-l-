const content_project = require('../../models/project')
const content_student = require('../../models/student')
const content_teacher = require('../../models/teacher')
const progressData = require('../../models/progress')
const requirementStudentData = require('../../models/requirementStudent')
const reportData = require('../../models/report')
const gradeData = require('../../models/grade')
const notificationData = require('../../models/notification')

class projectController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/accounts/singger')
            }
            const studentId = req.session.student;
            const student = await content_student.findById(studentId);
            
            if (!student.projectId) {
                return res.render('student/project', {
                    layout: 'base',
                    figure: 'student',
                    active: 'project',
                    noProject: true
                });
            }

            const project = await content_project.findById(student.projectId);
            const teacher = await content_teacher.findById(student.teacherId);
            const progress = await progressData.findOne({ studentId: studentId });
            const requirements = await requirementStudentData.find({ studentId: studentId }).sort({ createdAt: 1 });
            const reports = await reportData.find({ studentId: studentId });
            const grade = await gradeData.findOne({ studentId: studentId });

            // [REFINED] Dynamic Progress Calculation Engine
            const totalCount = requirements.length;
            const completedCount = requirements.filter(r => r.status === 'completed').length;
            const dynamicPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            // Ensure progress object in view is accurate
            let viewProgress = { percent: dynamicPercent };
            if (progress) {
                // If DB record exists but is outdated, prioritize the dynamic calculation
                viewProgress = progress.toObject();
                if (dynamicPercent > viewProgress.percent) {
                    viewProgress.percent = dynamicPercent;
                }
            }

            res.render('student/project', {
                layout: 'base',
                active: 'project',
                figure: 'student',
                student: student.toObject(),
                project: project ? project.toObject() : null,
                isWaitingConfirm: project && project.status === 'WAITING_STUDENT_CONFIRM',
                teacher: teacher ? teacher.toObject() : null,
                progress: viewProgress, // Pass the refined progress object
                requirements: requirements.map(r => r.toObject()),
                reportCount: reports.length,
                completedCount: completedCount,
                totalCount: totalCount,
                grade: grade ? grade.toObject() : null
            });
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    async getProject(req, res){
        try {
            const studentId = req.session.student
            const student = await content_student.findById(studentId)
            const project = await content_project.findById(student.projectId)
            const teacher = await content_teacher.findById(student.teacherId)
            const progress = await progressData.findOne({ studentId: studentId })
            const requirementStudent = await requirementStudentData.find({ studentId: studentId })
            const report = await reportData.find({ studentId: studentId })
            const grade = await gradeData.findOne({ studentId: studentId })
            
            // Lấy 5 thông báo mới nhất
            const notifications = await notificationData.find({ receiverId: studentId })
                .sort({ createdAt: -1 })
                .limit(5)

            return res.json({
                teacher,
                student,
                project, // Chứa cả defenseDate, defenseRoom, defenseTime
                requirementStudent,
                progress,
                report,
                grade, // Chứa điểm hội đồng và điểm tổng kết
                notifications
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [GET] /student/project/getTeachersByMajor
    async getTeachersByMajor(req, res) {
        try {
            const studentId = req.session.student
            const student = await content_student.findById(studentId)
            if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' })

            // Lọc giảng viên cùng chuyên ngành
            const teachers = await content_teacher.find({ 
                teacherMajor: student.studentMajor,
                status: 'active'
            })
            res.json(teachers)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /student/project/confirm
    async confirmProject(req, res) {
        try {
            if(!req.session.student) return res.json({ success: false, message: 'Chưa đăng nhập' })
            
            const studentId = req.session.student
            const student = await content_student.findById(studentId)
            const project = await content_project.findById(student.projectId)

            if (!project || project.status !== 'WAITING_STUDENT_CONFIRM') {
                return res.json({ success: false, message: 'Đồ án không ở trạng thái cần xác nhận' })
            }

            // Cập nhật trạng thái sang Chờ Bộ môn duyệt
            project.status = 'WAITING_LEADER'
            await project.save()

            // Tạo thông báo cho Giảng viên
            const teacherNotification = new notificationData({
                receiverId: student.teacherId,
                title: 'Sinh viên đã xác nhận đề tài',
                message: `Sinh viên ${student.fullName} đã đồng ý với các thay đổi của bạn cho đề tài "${project.inputProject}".`,
                type: 'info',
                link: '/teacher/request'
            })
            await teacherNotification.save()

            res.json({ success: true, message: 'Xác nhận đề tài thành công!' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' })
        }
    }

    // [POST] /student/project/update
    async updateProject(req, res) {
        try {
            if (!req.session.student) {
                return res.json({ success: false, message: 'Chưa đăng nhập' })
            }

            const { objective, scope, technology, expectedOutcome } = req.body
            const studentId = req.session.student
            const student = await content_student.findById(studentId)

            if (!student || !student.projectId) {
                return res.json({ success: false, message: 'Không tìm thấy thông tin đồ án' })
            }

            // Kiểm tra trạng thái: Không cho sửa nếu đã được duyệt hoàn toàn hoặc bị khoá
            const forbiddenStatuses = ['ELIGIBLE_ADVISOR', 'ELIGIBLE_DEFENSE', 'DEFENDED', 'COMPLETED']
            const project = await content_project.findById(student.projectId)
            
            if (!project || forbiddenStatuses.includes(project.status)) {
                return res.json({ success: false, message: 'Đồ án đã ở trạng thái ổn định, không thể chỉnh sửa thêm.' })
            }

            // Cập nhật thông tin
            project.objective = objective
            project.scope = scope
            project.expectedOutcome = expectedOutcome
            if (technology) {
                project.technology = technology.split(',').map(s => s.trim())
            }

            await project.save()

            // Cập nhật progress nếu cần (đảm bảo đồng bộ)
            const progress = await progressData.findOne({ studentId: studentId })
            if (progress) {
                progress.projectName = project.inputProject
                await progress.save()
            }

            res.json({ success: true, message: 'Cập nhật thông tin đồ án thành công!' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}

module.exports = new projectController