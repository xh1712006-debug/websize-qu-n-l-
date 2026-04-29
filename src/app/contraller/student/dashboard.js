
const contentStudent = require('../../models/student')
const contentProject = require('../../models/project')
const conversationData = require('../../models/conversation')
const feedbackData = require('../../models/feedback')
const progressData = require('../../models/progress')
const teacherData = require('../../models/teacher')
const reportData = require('../../models/report')
const contentPeriod = require('../../models/period')


class DashboardController{
    async index(req,res) {
        try {
            if(!req.session.student) {
                return res.redirect('/accounts/singger')
            }
            
            
            const studentId = req.session.student
            const student = await contentStudent.findById(studentId)
            
            // Lấy thông tin đợt bảo vệ đang mở
            const activePeriod = await contentPeriod.findOne({ status: 'ACTIVE' })
            
            if(student.status === 'approved') {
                const requirementStudentData = require('../../models/requirementStudent')
                
                const [conversation, teacher, project, progress, report, allRequirements] = await Promise.all([
                    conversationData.findOne({ studentId: studentId }),
                    teacherData.findById(student.teacherId),
                    contentProject.findById(student.projectId),
                    progressData.findOne({ studentId: studentId }),
                    reportData.find({ studentId: studentId }),
                    requirementStudentData.find({ studentId: studentId }).sort({ deadline: 1 })
                ])

                // Calculate dynamic progress
                const totalCount = allRequirements.length;
                const completedCount = allRequirements.filter(r => r.status === 'completed').length;
                const dynamicPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                
                // Use the higher of dynamic or saved percent, or saved if exists
                let finalPercent = progress ? progress.percent : dynamicPercent;
                // If progress exists but is less than dynamic, use dynamic
                if (progress && dynamicPercent > progress.percent) {
                    finalPercent = dynamicPercent;
                }

                // Filter for upcoming tasks
                const requirements = allRequirements.filter(r => r.status !== 'completed');

                
                let feedbackRead = {}
                if (conversation) {
                    feedbackRead = await feedbackData.findOne({ conversationId: conversation._id }).sort({ createdAt: -1 }) || {}
                    req.session.teacherId = conversation.teacherId
                } else if (student.teacherId) {
                    req.session.teacherId = student.teacherId
                }
                
                // [NEW] Lấy danh sách nhiệm vụ sắp tới thực tế
                const upcomingTasks = requirements.map(req => {
                    const now = new Date()
                    const deadline = req.deadline ? new Date(req.deadline) : null
                    let daysLeft = null
                    let statusColor = 'slate' // Default
                    
                    if (deadline) {
                        const diffTime = deadline - now
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        if (daysLeft <= 2) statusColor = 'rose'
                        else if (daysLeft <= 5) statusColor = 'amber'
                        else statusColor = 'indigo'
                    }

                    return {
                        name: req.name,
                        deadline: deadline ? deadline.toLocaleDateString('vi-VN') : 'Chưa đặt hạn',
                        daysLeft: daysLeft,
                        statusColor: statusColor,
                        isUrgent: daysLeft !== null && daysLeft <= 2
                    }
                }).slice(0, 3) // Lấy 3 nhiệm vụ gần nhất

                // Tối ưu hóa đếm feedback bằng countDocuments
                const feedbackCount = conversation ? await feedbackData.countDocuments({ conversationId: conversation._id }) : 0;

                // Bản đồ ánh xạ trạng thái sang tiếng Việt và màu sắc Bootstrap/Tailwind
                const statusMap = {
                    'REGISTERED': { label: 'Mới đăng ký', class: 'slate' },
                    'WAITING_ADVISOR': { label: 'Chờ GVHD duyệt', class: 'amber' },
                    'WAITING_STUDENT_CONFIRM': { label: 'Chờ xác nhận', class: 'rose' },
                    'WAITING_LEADER': { label: 'Chờ Bộ môn duyệt', class: 'amber' },
                    'WAITING_ADMIN': { label: 'Chờ Admin chốt', class: 'indigo' },
                    'ONGOING': { label: 'Đang thực hiện', class: 'blue' },
                    'ELIGIBLE_ADVISOR': { label: 'Đủ ĐK Bảo vệ (GVHD)', class: 'emerald' },
                    'WAITING_REVIEWER': { label: 'Chờ Phản biện', class: 'amber' },
                    'ELIGIBLE_DEFENSE': { label: 'Đủ ĐK Bảo vệ (Phản biện)', class: 'emerald' },
                    'DEFENDED': { label: 'Đã bảo vệ', class: 'purple' },
                    'COMPLETED': { label: 'Hoàn thành', class: 'green' },
                    'REJECTED': { label: 'Bị từ chối', class: 'rose' },
                    'FAILED_PROGRESS': { label: 'K.Đạt tiến độ', class: 'rose' },
                    'FAILED_REVIEW': { label: 'K.Đạt phản biện', class: 'rose' }
                };

                const currentStatus = (project && project.status) ? (statusMap[project.status] || { label: 'Đang thực hiện', class: 'blue' }) : { label: 'Đang tiến hành', class: 'blue' };

                const data = [{
                    fullName: student.fullName || 'N/A',
                    projectName: project ? project.inputProject : 'Chưa có tên đồ án',
                    teacherName: teacher ? teacher.fullName : 'Chưa phân giảng viên',
                    percent: finalPercent,
                    feedbackCount: feedbackCount,
                    report: report || [],
                    feedbackContent: feedbackRead.content ? feedbackRead.content : 'Không có phản hồi nào',
                    FeedbackDate: feedbackRead.createdAt ? feedbackRead.createdAt.toLocaleDateString('vi-VN') : '',
                    projectCount: 1,
                    projectStatus: currentStatus.label,
                    projectStatusClass: currentStatus.class,
                    upcomingTasks: upcomingTasks,
                }]

                if (conversation) {
                    console.log('đã lưu được giá trị: ', conversation.teacherId)
                }
                
                // Logic kiểm tra thời hạn đợt đăng ký
                const now = new Date()
                let periodStatus = 'CLOSED'
                let daysLeft = 0
                
                if (activePeriod) {
                    if (now < activePeriod.startDate) {
                        periodStatus = 'UPCOMING'
                    } else if (now > activePeriod.endDate) {
                        periodStatus = 'EXPIRED'
                    } else {
                        periodStatus = 'OPEN'
                        const diffTime = Math.abs(activePeriod.endDate - now)
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    }
                }

                return res.render('student/window/dashboard', {
                    layout: 'base',
                    active: 'dashboard',
                    data: data,
                    figure: 'student',
                    activePeriod: activePeriod ? activePeriod.toObject() : null,
                    periodStatus: periodStatus,
                    daysLeft: daysLeft
                })
                
            }
         
            return res.redirect('/student/addproject')
            
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi dữ liệu ')
        }
    }

    async selectProject(req, res) {
        try {
            const projectId = req.body.projectId
            const studentId = req.session.student
            const teacherId = await contentProject.findById(projectId).select('teacherId')

            console.log("student:", studentId)
            console.log("projectId:", projectId)
            const project = await contentStudent.findById(studentId)

            console.log('dư liệu student: ',project)
            
            project.status = 'pending'
            project.projectId = projectId
            project.teacherId = teacherId.teacherId

            req.session.teacherId = project.teacherId

            const newconversation = new conversationData({
                teacherId: teacherId.teacherId,
                studentId: studentId,

            })
            await newconversation.save()

            await project.save()
            res.json({ message: 'Chọn đồ án thành công' })
            // window.location.reload()
        }
        catch(err) {
            console.log(err)
            res.status(500).json({ message: 'Có lỗi xảy ra khi chọn đồ án!' })
        }
        
    }
}

module.exports = new DashboardController