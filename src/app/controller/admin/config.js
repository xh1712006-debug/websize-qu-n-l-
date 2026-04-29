const configModel = require('../../models/config')
const logModel = require('../../models/log')
const gradeModel = require('../../models/grade')
const studentModel = require('../../models/student')
const projectModel = require('../../models/project')
const notificationModel = require('../../models/notification')

class adminConfigController {
    // [GET] /admin/config
    async index(req, res) {
        try {
            let configs = await configModel.find()
            
            // Tự động khởi tạo nếu chưa có dữ liệu
            if (configs.length === 0) {
                const defaults = [
                    { key: 'maxStudentsPerAdvisor', value: '5' }, // [UPDATED] Theo kế hoạch mới: 5 SV
                    { key: 'pointLockDays', value: '7' },
                    { key: 'isRegistrationOpen', value: 'true' }
                ];
                await configModel.insertMany(defaults);
                configs = await configModel.find();
            }

            res.render('admin/config/index', {
                layout: 'base',
                figure: 'admin',
                active: 'config',
                configs: configs
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [POST] /admin/config/update
    async updateConfig(req, res) {
        try {
            const { configs } = req.body // Array of { key, value }
            for (const item of configs) {
                await configModel.findOneAndUpdate(
                    { key: item.key },
                    { value: item.value },
                    { upsert: true }
                )
            }

            // Lưu log cập nhật cấu hình
            const newLog = new logModel({
                userId: req.session.admin,
                userRole: 'Admin',
                action: 'UPDATE_CONFIG',
                target: 'configs',
                details: configs,
                reason: 'Cập nhật tham số hệ thống'
            })
            await newLog.save()

            res.json({ success: true, message: 'Cập nhật cấu hình thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /admin/config/unlockPoint
    async unlockPoint(req, res) {
        try {
            const { studentId, reason } = req.body
            const student = await studentModel.findOne({ studentCode: studentId })
            const targetId = student ? student._id : studentId 

            const grade = await gradeModel.findOne({ studentId: targetId })
            
            if (grade) {
                grade.isLocked = false
                grade.lockedAt = null // Xóa ngày khóa để reset 7 ngày nếu cần
                await grade.save()

                // Lưu log
                const newLog = new logModel({
                    userId: req.session.admin,
                    userRole: 'Admin',
                    action: 'UNLOCK_POINT',
                    target: 'grades',
                    details: { studentId: targetId, studentCode: student?.studentCode || 'Unknown' },
                    reason: reason
                })
                await newLog.save()

                res.json({ success: true, message: 'Mở khóa điểm thành công' })
            } else {
                res.json({ success: false, message: 'Không tìm thấy thông tin điểm của SV này.' })
            }
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [GET] /admin/logs
    async viewLogs(req, res) {
        try {
            const logs = await logModel.find().sort({ createdAt: -1 }).limit(100)
            res.render('admin/config/logs', {
                layout: 'base',
                figure: 'admin',
                active: 'logs',
                logs: logs
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [GET] /admin/config/getGlobalProjects
    async getGlobalProjects(req, res) {
        try {
            const projects = await projectModel.find({ statuss: 'active' }).populate('studentId')
            const data = projects.map(prj => ({
                projectId: prj._id,
                studentId: prj.studentId?._id,
                fullName: prj.studentId?.fullName,
                studentCode: prj.studentId?.studentCode,
                projectName: prj.inputProject,
                defenseDate: prj.defenseDate,
                defenseRoom: prj.defenseRoom,
                defenseTime: prj.defenseTime
            }))
            res.json(data)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /admin/config/updateGlobalSchedule
    async updateGlobalSchedule(req, res) {
        try {
            const { projectId, defenseDate, defenseRoom, defenseTime } = req.body
            const project = await projectModel.findById(projectId)
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' })

            project.defenseDate = defenseDate
            project.defenseRoom = defenseRoom
            project.defenseTime = defenseTime
            await project.save()

            // Thông báo cho SV
            const notification = new notificationModel({
                receiverId: project.studentId,
                title: 'Admin đã cập nhật lịch bảo vệ',
                message: `Lịch bảo vệ của bạn đã được cập nhật vào lúc ${defenseTime} ngày ${new Date(defenseDate).toLocaleDateString('vi-VN')} tại phòng ${defenseRoom}.`,
                type: 'info',
                link: '/student/project'
            })
            await notification.save()

            res.json({ success: true, message: 'Cập nhật lịch toàn cục thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [GET] /admin/config/getStats
    async getStats(req, res) {
        try {
            const totalStudents = await studentModel.countDocuments()
            const activeProjects = await projectModel.countDocuments({ statuss: 'active' })
            const completedGrades = await gradeModel.countDocuments({ status: 'approved' })
            
            // Tính điểm trung bình (giả định)
            const grades = await gradeModel.find({ status: 'approved', finalScore: { $exists: true } })
            const avgScore = grades.length > 0 
                ? (grades.reduce((acc, curr) => acc + curr.finalScore, 0) / grades.length).toFixed(2)
                : 0

            res.json({
                totalStudents,
                activeProjects,
                completedGrades,
                avgScore
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /admin/config/finalizeAll
    async finalizeAll(req, res) {
        try {
            // Bước 5: Admin chốt danh sách
            // Tìm các đồ án đã qua vòng LĐBM duyệt (isLeaderApproved: true) 
            // và đang ở trạng thái WAITING_LEADER
            const projectsToFinalize = await projectModel.find({
                isLeaderApproved: true,
                status: 'WAITING_LEADER'
            })

            if (projectsToFinalize.length === 0) {
                return res.json({ success: false, message: 'Không có đồ án nào đủ điều kiện để chốt (Cần LĐBM duyệt trước).' })
            }

            const projectIds = projectsToFinalize.map(p => p._id)

            // 1. Cập nhật trạng thái sang ONGOING và Khóa dữ liệu
            await projectModel.updateMany(
                { _id: { $in: projectIds } },
                { 
                    status: 'ONGOING',
                    isLocked: true 
                }
            )

            // 2. Thông báo cho tất cả sinh viên liên quan
            for (const prj of projectsToFinalize) {
                const notification = new notificationModel({
                    receiverId: prj.studentId,
                    title: 'Đồ án đã được chốt',
                    message: `Admin đã chốt danh sách đồ án. Đề tài của bạn đã chính thức bắt đầu giai đoạn thực hiện (10 tuần). Dữ liệu đề tài đã được khóa.`,
                    type: 'success',
                    link: '/student/project'
                })
                await notification.save()
            }

            // 3. Log hành động
            const newLog = new logModel({
                userId: req.session.admin,
                userRole: 'Admin',
                action: 'FINALIZE_PROJECTS',
                target: 'projects',
                details: { count: projectIds.length, ids: projectIds },
                reason: 'Admin chốt danh sách đăng ký đề tài'
            })
            await newLog.save()

            res.json({ 
                success: true, 
                message: `Đã chốt thành công ${projectIds.length} đồ án. Toàn bộ đã chuyển sang trạng thái Đang thực hiện.` 
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}

module.exports = new adminConfigController()
