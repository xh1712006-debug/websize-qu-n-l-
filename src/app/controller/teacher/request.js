const content_project = require('../../models/project')
const content_student = require('../../models/student')
const progressData = require('../../models/progress')
const assignmentData = require('../../models/assignment')
const conversationData = require('../../models/conversation')
const scoreData = require('../../models/grade')
<<<<<<< HEAD:src/app/contraller/teacher/request.js
const configModel = require('../../models/config')
const notificationModel = require('../../models/notification')
const requirementStudentData = require('../../models/requirementStudent')
const content_period = require('../../models/period')
=======
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js

class requestController {
    async index(req, res) {
        try {
            if(!req.session.teacher){
<<<<<<< HEAD:src/app/contraller/teacher/request.js
                return res.redirect('/accounts/singger')
            }
            const teacherId = req.session.teacher
            
            const activePeriod = await content_period.findOne({ status: 'ACTIVE' })
            let query = {
                teacherId: teacherId,
                status: { $in: ['REGISTERED', 'WAITING_STUDENT_CONFIRM', 'ONGOING', 'REJECTED', 'ELIGIBLE_ADVISOR', 'ELIGIBLE_DEFENSE', 'FAILED_PROGRESS'] }
            }
            
            // Nếu có đợt đang active, chỉ lấy đồ án của đợt đó. 
            // Nếu không có đợt active (vừa đóng), vẫn cho phép xem các đồ án cũ hoặc mới gữi.
            if (activePeriod) {
                query.periodId = activePeriod._id
            }

            let data_request = await content_project.find(query)
=======
                return res.redirect('/loggin')
            }
            const teacherId = req.session.teacher
            
            let data_request = await content_project.find({
                teacherId: teacherId,
                statuss: 'request'
            })
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
            
            const requests = []
            for(let prj of data_request) {
                const student = await content_student.findById(prj.studentId)
                requests.push({
                    projectId: prj._id,
                    studentId: prj.studentId,
                    studentName: student ? student.fullName : 'Không rõ',
                    studentCode: student ? student.studentCode : '',
                    projectName: prj.inputProject,
<<<<<<< HEAD:src/app/contraller/teacher/request.js
                    status: prj.status,
=======
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
                    date: prj.createdAt.toLocaleDateString('vi-VN')
                })
            }

            res.render('teacher/request', {
<<<<<<< HEAD:src/app/contraller/teacher/request.js
                layout: 'base',
=======
                layout: 'teacher/main',
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
                active: 'request',
                figure: 'teacher',
                requests: requests
            })
        } catch(err) {
            console.log(err)
            res.status(500).send('Lỗi server')
        }
    }

    async getApproveForm(req, res) {
        try {
<<<<<<< HEAD:src/app/contraller/teacher/request.js
            if(!req.session.teacher) return res.redirect('/accounts/singger')
=======
            if(!req.session.teacher) return res.redirect('/loggin')
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
            const projectId = req.params.id
            const project = await content_project.findById(projectId)
            if(!project) return res.redirect('/teacher/request')
            
            const teacherData = require('../../models/teacher')
            const teacher = await teacherData.findById(req.session.teacher)
            
<<<<<<< HEAD:src/app/contraller/teacher/request.js
            // [NEW] Chuẩn bị dữ liệu để hiển thị lên form
            const technologyStr = project.technology ? project.technology.join(', ') : ''
            
            res.render('teacher/approveForm', {
                layout: 'base',
                active: 'request',
                figure: 'teacher',
                project: project.toObject(),
                technologyStr, // Truyền chuỗi công nghệ
=======
            res.render('teacher/approveForm', {
                layout: 'teacher/main',
                active: 'request',
                figure: 'teacher',
                project: project.toObject(),
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
                teacherName: teacher.fullName
            })
        } catch(err) {
            console.log(err)
            res.status(500).send('Lỗi máy chủ')
        }
    }

    async approve(req, res) {
        try {
            const { 
                projectId, 
                teacherName, 
<<<<<<< HEAD:src/app/contraller/teacher/request.js
                requirements // Chỉ nhận các đợt nộp báo cáo
            } = req.body
            const teacherId = req.session.teacher
            
            // 1. Kiểm tra giới hạn số lượng sinh viên
            const config = await configModel.findOne({ key: 'maxStudentsPerAdvisor' })
            const maxStudents = config ? parseInt(config.value) : 5
            
            const currentStudentsCount = await content_project.countDocuments({
                teacherId: teacherId,
                statuss: 'active'
            })

            if (currentStudentsCount >= maxStudents) {
                return res.json({ 
                    success: false, 
                    message: `Bạn đã đạt giới hạn tối đa ${maxStudents} sinh viên hướng dẫn. Không thể duyệt thêm.` 
                })
            }

=======
                projectName,
                contentProject,
                numberStudent,
                technology
            } = req.body
            
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
            const project = await content_project.findById(projectId)
            if(!project) return res.json({ success: false, message: 'Không tìm thấy yêu cầu' })
            
            project.statuss = 'active'
<<<<<<< HEAD:src/app/contraller/teacher/request.js
            project.status = 'ONGOING' // Luôn đặt là đang thực hiện

=======
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
            project.numberSubmit = 0
            
            project.teacherInstruct = teacherName
            project.teacherFeedbackName = teacherName
<<<<<<< HEAD:src/app/contraller/teacher/request.js
            // [REMOVED] Không cập nhật lại nội dung sinh viên đã đăng ký
            
            // Giữ lại logic lấy ngày nộp cuối cùng từ requirements nếu có
            if (requirements && requirements.length > 0) {
                const dates = requirements.map(r => new Date(r.deadline));
                const maxDate = new Date(Math.max.apply(null, dates));
                project.date = maxDate;
            } else {
                const completionDate = new Date();
                completionDate.setDate(completionDate.getDate() + 70);
                project.date = completionDate;
            }
=======
            project.inputProject = projectName
            project.contentProject = contentProject
            project.numberStudent = numberStudent
            
            // Tự động tính 10 tuần (70 ngày) kể từ hiện tại
            const completionDate = new Date();
            completionDate.setDate(completionDate.getDate() + 70);
            project.date = completionDate;

            project.technology = technology ? technology.split(',').map(s=>s.trim()) : []
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
            
            await project.save()

            const student = await content_student.findById(project.studentId)
            if(student) {
                student.status = 'approved'
                await student.save()
            }

<<<<<<< HEAD:src/app/contraller/teacher/request.js
            // --- TẠO CÁC ĐỢT BÁO CÁO (REQUIREMENTS) ---
            if (requirements && Array.isArray(requirements)) {
                for (let reqItem of requirements) {
                    const newReq = new requirementStudentData({
                        projectId: project._id,
                        studentId: student._id,
                        name: reqItem.name,
                        deadline: reqItem.deadline ? new Date(reqItem.deadline) : null,
                        status: 'pending' // Trạng thái ban đầu là chờ nộp
                    });
                    await newReq.save();
                }
            }

=======
            // Requirements have been removed
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
            // Create progress
            const newProgress = new progressData({
                studentId: student._id,
                projectId: project._id,
<<<<<<< HEAD:src/app/contraller/teacher/request.js
                percent: 0
=======
                precent: 0
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
            })
            await newProgress.save()

            // Assignment
            const assignment = new assignmentData({
                studentId: student._id,
                teacherId: project.teacherId,
                projectId: project._id,
<<<<<<< HEAD:src/app/contraller/teacher/request.js
                role: 'advisor', 
=======
                role: 'reviewer',
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
            })
            await assignment.save()

            // Conversation
            const aconversation = new conversationData({
                studentId: student._id,
                teacherId: project.teacherId,
            })
            await aconversation.save()

            // Score
            const score = new scoreData({
                studentId: student._id,
<<<<<<< HEAD:src/app/contraller/teacher/request.js
                projectId: project._id,
                status: 'pending',
            })
            await score.save()

            // 2. Gửi thông báo trực tiếp cho sinh viên
            const notification = new notificationModel({
                receiverId: student._id,
                title: 'Đề tài đã được duyệt',
                message: `Giảng viên ${teacherName} đã duyệt đề tài "${project.inputProject}" của bạn.`,
                type: 'success',
                link: '/student/project'
            })
            await notification.save()

            return res.json({ 
                success: true, 
                message: 'Phê duyệt đồ án thành công! Sinh viên có thể bắt đầu làm việc ngay.'
            })
=======
                teacherId: project.teacherId,
                projectId: project._id,
                score: null,
                scoreFeedback: null,
                status: false,
            })
            await score.save()

            return res.json({ success: true, message: 'Khởi tạo đồ án thành công!' })
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
        } catch(err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    async reject(req, res) {
        try {
<<<<<<< HEAD:src/app/contraller/teacher/request.js
            const { projectId, rejectionReason } = req.body
            const project = await content_project.findById(projectId)
            if(!project) return res.json({ success: false, message: 'Không tìm thấy yêu cầu' })

            const student = await content_student.findById(project.studentId)
            if(student) {
                student.status = 'rejected' // [NEW] Chuyển trạng thái sang rejected
                // KHÔNG xoá projectId lúc này để sinh viên có thể xem lý do trên dashboard
                await student.save()
            }

            // [NEW] Cập nhật bản ghi Project thay vì xoá
            project.status = 'REJECTED'
            project.statuss = 'inactive'
            project.rejectionReason = rejectionReason
            await project.save()

            // Gửi thông báo cho sinh viên kèm lý do
            const notification = new notificationModel({
                receiverId: student._id,
                title: 'Đề tài đã bị từ chối',
                message: `Giảng viên đã từ chối đề tài của bạn. Lý do: ${rejectionReason}`,
                type: 'warning',
                link: '/student/addproject'
            })
            await notification.save()

            return res.json({ success: true, message: 'Đã từ chối Đề tài thành công. Lý do đã được gửi đến sinh viên.' })
=======
            const { projectId } = req.body
            const project = await content_project.findById(projectId)
            if(!project) return res.json({ success: false, message: 'Không tìm thấy yêu cầu' })

            // Cập nhật lại Student thành trạng thái null để có quyền đăng ký lại
            const student = await content_student.findById(project.studentId)
            if(student) {
                student.status = undefined
                student.projectId = null
                student.teacherId = null
                await student.save()
            }

            // Xoá bản ghi Project Request
            await content_project.findByIdAndDelete(projectId)

            return res.json({ success: true, message: 'Đã từ chối Đồ án thành công.' })
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
        } catch(err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
<<<<<<< HEAD:src/app/contraller/teacher/request.js

    // [GET] /teacher/request/eligible
    async getEligiblePage(req, res) {
        try {
            if(!req.session.teacher) return res.redirect('/accounts/singger')
            const teacherId = req.session.teacher
            
            // Tìm các đồ án do mình hướng dẫn đang ở các giai đoạn có thể xét điều kiện bảo vệ
            const projects = await content_project.find({
                teacherId: teacherId,
                status: { $in: ['ONGOING', 'WAITING_ADMIN', 'WAITING_REVIEWER', 'ELIGIBLE_ADVISOR'] },
            }).populate('studentId')

            const data = await Promise.all(projects.map(async (p) => {
                const progress = await progressData.findOne({ studentId: p.studentId })
                return {
                    projectId: p._id,
                    studentName: p.studentId ? p.studentId.fullName : 'N/A',
                    studentCode: p.studentId ? p.studentId.studentCode : 'N/A',
                    projectName: p.inputProject,
                    isAdvisorApproved: p.isAdvisorApproved,
                    status: p.status,
                    percent: progress ? progress.percent : 0
                }
            }))

            res.render('teacher/eligibleProjects', {
                layout: 'base',
                active: 'eligible',
                figure: 'teacher',
                projects: data
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [POST] /teacher/request/approve-eligible
    async approveEligible(req, res) {
        try {
            const { projectId, action } = req.body
            const project = await content_project.findById(projectId)
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' })

            if (action === 'approve') {
                // [NEW] Kiểm tra tiến độ 80%
                const progress = await progressData.findOne({ studentId: project.studentId })
                const percent = progress ? progress.percent : 0
                if (percent < 80) {
                    return res.json({ 
                        success: false, 
                        message: `Sinh viên chưa đạt 80% tiến độ (Hiện tại: ${percent}%). Không thể duyệt!` 
                    })
                }

                project.isAdvisorApproved = true
                project.status = 'ELIGIBLE_ADVISOR'
                
                // [SYNC LOGIC] Nếu GVPB cũng đã duyệt rồi thì lên thẳng ELIGIBLE_DEFENSE
                if (project.isReviewerApproved) {
                    project.status = 'ELIGIBLE_DEFENSE'
                }
                
                await project.save()
                
                const notification = new notificationModel({
                    receiverId: project.studentId,
                    title: 'Xác nhận Đủ điều kiện Bảo vệ',
                    message: project.status === 'ELIGIBLE_DEFENSE' 
                        ? 'Bạn đã được cả GVHD và GVPB phê duyệt. Đủ điều kiện bảo vệ chính thức!'
                        : 'Giảng viên hướng dẫn đã xác nhận bạn đủ điều kiện. Đang chờ GVPB phê duyệt.',
                    type: 'success',
                    link: '/student/project'
                })
                await notification.save()

                return res.json({ success: true, message: 'Đã xác nhận sinh viên đủ điều kiện bảo vệ' })
            } else {
                project.status = 'FAILED_PROGRESS' 
                project.isAdvisorApproved = false
                await project.save()

                const notification = new notificationModel({
                    receiverId: project.studentId,
                    title: 'Kết quả xét duyệt điều kiện bảo vệ',
                    message: 'Giảng viên hướng dẫn đánh giá bạn không đủ điều kiện bảo vệ đợt này.',
                    type: 'danger',
                    link: '/student/project'
                })
                await notification.save()

                return res.json({ success: true, message: 'Đã đánh dấu sinh viên không đạt điều kiện bảo vệ' })
            }
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
=======
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/request.js
}
module.exports = new requestController
