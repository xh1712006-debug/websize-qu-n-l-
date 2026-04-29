const content_teacher = require('../../models/teacher')
const content_project = require('../../models/project')
const content_student = require('../../models/student')
<<<<<<< HEAD:src/app/contraller/student/addproject.js
const content_period = require('../../models/period')
=======
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/addproject.js

class addprojectController {
    async index(req, res) {
        try {
            if(!req.session.student){
<<<<<<< HEAD:src/app/contraller/student/addproject.js
                return res.redirect('/accounts/singger')
            }
            
            const now = new Date()
            const activePeriod = await content_period.findOne({ status: 'ACTIVE' })
            
            let registrationStatus = 'CLOSED' // CLOSED, OPEN, UPCOMING, EXPIRED
            let periodInfo = null
            let remainingSeconds = 0

            if (activePeriod) {
                periodInfo = activePeriod.toObject()
                if (now < activePeriod.startDate) {
                    registrationStatus = 'UPCOMING'
                } else if (now > activePeriod.endDate) {
                    registrationStatus = 'EXPIRED'
                } else {
                    registrationStatus = 'OPEN'
                    remainingSeconds = Math.max(0, Math.floor((activePeriod.endDate - now) / 1000))
                }
            }

            const studentId = req.session.student
            const student = await content_student.findById(studentId)
                .populate('teacherId')
                .populate('projectId')

            // Dữ liệu phục vụ UI Stepper
            let uiState = {
                step: 1, // 1: Info & Teacher, 2: Project Detail, 3: Confirmation
                canRegister: (registrationStatus === 'OPEN' && !student.status),
                isPending: (student.status === 'pending'),
                isRejected: (student.status === 'rejected'),
                isWaitingConfirm: (student.status === 'waiting_confirm'),
                isApproved: (student.status === 'approved')
            }

            let rejectedProject = null
            let waitingProject = null
            if (student.status === 'rejected') {
                rejectedProject = await content_project.findById(student.projectId)
            } else if (student.status === 'waiting_confirm') {
                waitingProject = await content_project.findById(student.projectId)
            }

            // Lấy danh sách giảng viên cùng ngành
            let data_teacher = []
            if (uiState.canRegister || uiState.isRejected) {
                data_teacher = await content_teacher.find({ 
                    teacherMajor: student.studentMajor,
                    'subRoles.isGVHD': true
                })
                data_teacher = data_teacher.map(item => item.toObject())
            }
            
            res.render('student/addproject', {
                layout: 'base',
                active: 'addproject',
                figure: 'student',
                registrationStatus,
                periodInfo,
                remainingSeconds,
                uiState,
                data_teacher,
                user: req.session.user,
                studentInfo: student.toObject(),
                rejectedProject: rejectedProject ? rejectedProject.toObject() : null,
                title: 'Hệ thống Đăng ký Đồ án'
            })
        } catch(err) {
            console.error(err)
=======
                return res.redirect('/loggin')
            }
            
            const studentId = req.session.student
            const student = await content_student.findById(studentId)

            // Fetch list of teachers
            let data_teacher = await content_teacher.find()
            data_teacher = data_teacher.map(item => item.toObject())
            
            res.render('student/addproject', {
                layout: 'student/main',
                active: 'addproject',
                figure: 'student',
                data_teacher: data_teacher,
                user: req.session.user,
                studentInfo: student.toObject()
            })
        } catch(err) {
            console.log(err)
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/addproject.js
            res.status(500).send('Lỗi server')
        }
    }

    async addProject(req, res) {
        try {
            if(!req.session.student){
                return res.json({ success: false, message: 'Chưa đăng nhập' })
            }
            
<<<<<<< HEAD:src/app/contraller/student/addproject.js
            const { teacherId, projectName, objective, scope, technology, expectedOutcome } = req.body

            if (!teacherId || !projectName || !objective || !scope || !technology) {
                 return res.json({ success: false, message: 'Vui lòng hoàn thành đầy đủ các bước đăng ký!' })
=======
            const teacherId = req.body.teacherId
            const projectName = req.body.projectName

            if (!teacherId || !projectName) {
                 return res.json({ success: false, message: 'Thiếu thông tin đăng ký' })
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/addproject.js
            }

            const studentId = req.session.student
            const student = await content_student.findById(studentId)

<<<<<<< HEAD:src/app/contraller/student/addproject.js
            // Chặn tuyệt đối nếu sinh viên đã có trạng thái (đang trong quy trình)
            if (student.status && student.status !== 'rejected') {
                 return res.json({ success: false, message: 'Bạn đang trong quy trình xử lý đồ án, không thể thực hiện đăng ký mới!' })
            }

            // Kiểm tra thời hạn 1 tuần
            const now = new Date()
            const activePeriod = await content_period.findOne({ 
                status: 'ACTIVE',
                startDate: { $lte: now },
                endDate: { $gte: now }
            })
            
            if (!activePeriod) {
                return res.json({ success: false, message: 'Rất tiếc, thời hạn đăng ký 1 tuần đã kết thúc!' })
            }

            const teacher = await content_teacher.findById(teacherId)
            if (!teacher || teacher.teacherMajor !== student.studentMajor || !teacher.subRoles.isGVHD) {
                return res.json({ success: false, message: 'Giảng viên không hợp lệ cho chuyên ngành của bạn!' })
            }
=======
            if (student.status === 'pending') {
                 return res.json({ success: false, message: 'Bạn đã đăng ký trước đó rồi, vui lòng chờ duyệt!' })
            }

            const teacher = await content_teacher.findById(teacherId)
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/addproject.js

            const newProjectRequest = new content_project({
                teacherId: teacherId,
                studentId: studentId,
                inputProject: projectName,
<<<<<<< HEAD:src/app/contraller/student/addproject.js
                objective: objective,
                scope: scope,
                expectedOutcome: expectedOutcome,
                technology: technology ? technology.split(',').map(s=>s.trim()) : [],
                major: student.studentMajor, 
                periodId: activePeriod._id,
                statuss: 'active',
                status: 'REGISTERED',
                teacherFeedbackId: teacherId, 
=======
                statuss: 'request',
                teacherFeedbackId: teacherId,
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/addproject.js
                teacherFeedbackName: teacher.fullName
            })

            await newProjectRequest.save()

            student.projectId = newProjectRequest._id
            student.status = 'pending'
            student.teacherId = teacherId
            await student.save()

<<<<<<< HEAD:src/app/contraller/student/addproject.js
            return res.json({ success: true, message: 'Đề xuất đồ án đã được gửi thành công!' })

        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    async resetProject(req, res) {
        try {
            if(!req.session.student) return res.json({ success: false, message: 'Chưa đăng nhập' })
            
            const studentId = req.session.student
            const student = await content_student.findById(studentId)

            if (student.status !== 'rejected') {
                return res.json({ success: false, message: 'Thao tác không hợp lệ' })
            }

            student.projectId = null
            student.status = null
            student.teacherId = null
            await student.save()

            return res.json({ success: true })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' })
        }
    }

=======
            return res.json({ success: true, message: 'Gửi yêu cầu thành công' })

        } catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/addproject.js
}

module.exports = new addprojectController
