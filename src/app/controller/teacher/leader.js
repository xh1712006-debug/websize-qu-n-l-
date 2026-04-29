const teacherModel = require('../../models/teacher')
const projectModel = require('../../models/project')
const studentModel = require('../../models/student')
const notificationModel = require('../../models/notification')
const gradeModel = require('../../models/grade')
const milestoneModel = require('../../models/milestone')
const councilModel = require('../../models/council')
const reportModel = require('../../models/report')
const assignmentModel = require('../../models/assignment')
const configModel = require('../../models/config')
const progressModel = require('../../models/progress')
const conversationModel = require('../../models/conversation')
const requirementStudentModel = require('../../models/requirementStudent')
const periodModel = require('../../models/period')

class leaderController {
    // [GET] /teacher/leader/schedule
    async getLeaderSchedulePage(req, res, next) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const major = currentLeader.teacherMajor
            const majorRegex = new RegExp(`^${major.trim()}$`, 'i')

            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' })
            const periodFilter = activePeriod ? { periodId: activePeriod._id } : {}

            // 1. Lấy tất cả đồ án ĐÃ gán lịch trong chuyên ngành (Chỉ lấy ACTIVE và thuộc đợt hiện tại)
            const scheduledProjects = await projectModel.find({ 
                major: majorRegex, 
                statuss: 'active',
                ...periodFilter,
                defenseTime: { $ne: '' } 
            })
            .populate('studentId', 'fullName studentCode')
            .populate('councilId')
            .sort({ defenseDate: 1, defenseTime: 1 })

            // 2. Lấy tất cả sinh viên ĐỦ ĐIỀU KIỆN nhưng CHƯA có lịch (Thuộc đợt hiện tại)
            const readyStudents = await projectModel.find({
                major: majorRegex,
                statuss: 'active',
                ...periodFilter,
                status: 'ELIGIBLE_DEFENSE',
                defenseTime: ''
            })
            .populate('studentId', 'fullName studentCode')

            // 3. Lấy tất cả Hội đồng trong chuyên ngành
            const allCouncils = await councilModel.find({ 
                major: majorRegex,
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName')

            const scheduleData = []
            for (const p of scheduledProjects) {
                let councilDetails = null
                if (p.councilId) {
                    councilDetails = await councilModel.findById(p.councilId)
                        .populate('chairmanId', 'fullName')
                        .populate('secretaryId', 'fullName')
                        .populate('memberIds', 'fullName')
                }
                
                scheduleData.push({
                    ...p.toObject(),
                    fullName: p.studentId ? p.studentId.fullName : 'Chưa gán SV',
                    studentCode: p.studentId ? p.studentId.studentCode : 'N/A',
                    council: councilDetails ? councilDetails.toObject() : null
                })
            }

            res.render('teacher/leader/schedule', {
                layout: 'base',
                active: 'leader/schedule',
                title: 'Trung tâm Điều phối Lịch bảo vệ',
                schedules: scheduleData,
                readyStudents: readyStudents.map(s => s.toObject()),
                allCouncils: allCouncils.map(c => c.toObject())
            });
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [GET] /schedule (Student Personal Schedule)
    async getSchedulePage(req, res, next) {
        try {
            let myCouncil = null
            let myProject = null

            if (req.session.student) {
                myProject = await projectModel.findOne({ studentId: req.session.student, statuss: 'active' })
                    .populate('teacherFeedbackId', 'fullName')
                
                if (myProject && myProject.defenseRoom) {
                    myCouncil = await councilModel.findOne({ 
                        room: myProject.defenseRoom, 
                        major: myProject.major,
                        status: 'active'
                    })
                    .populate('chairmanId', 'fullName')
                    .populate('secretaryId', 'fullName')
                    .populate('memberIds', 'fullName')
                }

                return res.render('student/schedule', {
                    layout: 'base',
                    active: 'schedule',
                    title: 'Hành trình Bảo vệ Đồ án',
                    myProject: myProject ? myProject.toObject() : null,
                    myCouncil: myCouncil ? myCouncil.toObject() : null
                });
            }

            res.status(403).send('Không có quyền truy cập');
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi Server');
        }
    }
    getTeachersPage(req, res, next) {
        res.render('teacher/leader/teachers', {
            layout: 'base',
            active: 'leader/teachers',
            title: 'Quản lý Giảng viên'
        });
    }

    getStudentsPage(req, res, next) {
        res.render('teacher/leader/students', {
            layout: 'base',
            active: 'leader/students',
            title: 'Quản lý Sinh viên'
        });
    }

    async getConfigPage(req, res, next) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const milestones = await milestoneModel.find({ 
                major: currentLeader.teacherMajor 
            }).sort({ deadline: 1 }).lean()

            res.render('teacher/leader/config', {
                layout: 'base',
                active: 'leader/config',
                title: 'Cấu hình Chuyên ngành',
                milestones: milestones // Pass milestones to the template
            });
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    getProjectsPage(req, res, next) {
        res.render('teacher/leader/projects', {
            layout: 'base',
            active: 'leader/projects',
            title: 'Danh sách Đồ án'
        });
    }



    getCouncilsPage(req, res, next) {
        res.render('teacher/leader/councils', {
            layout: 'base',
            active: 'leader/councils',
            title: 'Quản lý Hội đồng'
        });
    }

    getReviewerAssignmentsPage(req, res, next) {
        res.render('teacher/leader/reviewerAssignments', {
            layout: 'base',
            active: 'leader/reviewer-assignments',
            title: 'Phân công Phản biện'
        });
    }

    // [GET] /teacher/leader/getTeachers
    async getTeachers(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            if (!currentLeader) return res.json([])

            // UNIFIED SEARCH: Support both teacherMajor and teacherDepartment naming conventions
            const major = (currentLeader.teacherMajor || currentLeader.teacherDepartment || '').trim()
            if (!major) return res.json([])

            const majorRegex = new RegExp(`^${major}$`, 'i')

            // Query using OR to cover both possible field names in the database
            const teachers = await teacherModel.find({ 
                $or: [
                    { teacherMajor: majorRegex },
                    { teacherDepartment: majorRegex }
                ]
            }).lean()

            // Fetch global config for student capacity
            const config = await configModel.findOne({ key: 'maxStudentsPerAdvisor' })
            const maxStudents = config ? parseInt(config.value) : 5

            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' })
            const periodFilter = activePeriod ? { periodId: activePeriod._id } : {}

            const data = await Promise.all(teachers.map(async (t) => {
                // Aggregate metrics for each teacher (Only for active period)
                const [activeProjects, pendingApprovals] = await Promise.all([
                    projectModel.countDocuments({ teacherId: t._id, statuss: 'active', ...periodFilter }),
                    reportModel.countDocuments({ teacherId: t._id, status: /chờ duyệt/i })
                ])

                return {
                    ...t,
                    currentStudents: activeProjects,
                    pendingReports: pendingApprovals,
                    maxStudents: maxStudents,
                    // Ensure subRoles is an object for frontend safety
                    subRoles: t.subRoles || { isLeader: false, isGVHD: false, isGVPB: false }
                }
            }))

            res.json(data)
        } catch (err) {
            console.error('getTeachers Redesign Error:', err)
            res.status(500).json({ success: false, message: 'Lỗi đồng bộ dữ liệu đội ngũ' })
        }
    }

    // [POST] /teacher/leader/assignRole
    async assignRole(req, res) {
        try {
            const { teacherId, roles } = req.body
            
            // roles expect: { isGVHD: bool, isGVPB: bool }
            const teacher = await teacherModel.findById(teacherId)
            if (!teacher) return res.json({ success: false, message: 'Không tìm thấy giảng viên' })

            // Cập nhật từng subRole một cách an toàn
            if (!teacher.subRoles) teacher.subRoles = {};
            
            if (roles.hasOwnProperty('isGVHD')) teacher.subRoles.isGVHD = roles.isGVHD;
            if (roles.hasOwnProperty('isGVPB')) teacher.subRoles.isGVPB = roles.isGVPB;
            
            await teacher.save()

            res.json({ success: true, message: 'Cập nhật vai trò thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [GET] /teacher/leader/getStudentProjects
    async getStudentProjects(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const students = await studentModel.find({ 
                studentMajor: currentLeader.teacherMajor 
            })

            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' })
            const periodFilter = activePeriod ? { periodId: activePeriod._id } : {}

            const data = []
            for (const student of students) {
                const project = await projectModel.findOne({ 
                    studentId: student._id, 
                    statuss: 'active',
                    ...periodFilter 
                })
                if (project) {
                    // Lấy giáo viên phản biện từ assignment nếu có
                    const reviewerAssign = await require('../../models/assignment').findOne({
                        studentId: student._id,
                        role: 'reviewer'
                    }).populate('teacherId', 'fullName')

                    data.push({
                        studentId: student._id,
                        projectId: project._id,
                        fullName: student.fullName,
                        studentCode: student.studentCode,
                        projectName: project.inputProject,
                        supervisorId: project.teacherId || null,
                        supervisorName: project.teacherName || 'Chưa phân công',
                        reviewerId: reviewerAssign ? reviewerAssign.teacherId._id : null,
                        reviewerName: reviewerAssign ? reviewerAssign.teacherId.fullName : 'Chưa phân công',
                        defenseDate: project.defenseDate,
                        defenseRoom: project.defenseRoom,
                        defenseTime: project.defenseTime,
                        status: project.status || 'waiting'
                    })
                }
            }
            res.json(data)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/approveTopic
    async approveTopicByLeader(req, res) {
        try {
            const { projectId } = req.body
            const project = await projectModel.findById(projectId)
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' })

            if (project.status !== 'WAITING_LEADER') { // [NEW] Sử dụng WAITING_LEADER
                return res.json({ success: false, message: 'Trạng thái đồ án không hợp lệ để duyệt' })
            }

            project.isLeaderApproved = true
            project.status = 'WAITING_ADMIN' // Chuyển sang chờ Admin chốt
            await project.save()

            // Thông báo cho sinh viên
            const notification = new notificationModel({
                receiverId: project.studentId,
                title: 'Đề tài đã được Bộ môn phê duyệt',
                message: `Đề tài "${project.inputProject}" đã vượt qua vòng rà soát của Bộ môn và chính thức bắt đầu thực hiện.`,
                type: 'success',
                link: '/student/project'
            })
            await notification.save()

            res.json({ success: true, message: 'Phê duyệt đề tài thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/finalizeBatch
    async finalizeTopicRegistration(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const major = currentLeader.teacherMajor

            // Khóa tất cả các đồ án thuộc chuyên ngành này đang ở trạng thái DANG_THUC_HIEN
            await projectModel.updateMany(
                { major, status: 'DANG_THUC_HIEN', isLocked: false },
                { isLocked: true }
            )

            res.json({ success: true, message: 'Đã chốt danh sách và khóa dữ liệu thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/assignSupervisor
    async assignSupervisor(req, res) {
        try {
            const { studentId, projectId, teacherId } = req.body
            const project = await projectModel.findById(projectId)
            
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' })
            
            // [UPDATED] LĐBM có quyền điều phối nếu thấy không phù hợp
            // Bỏ qua check trùng ID cũ để cho phép thay đổi

            const teacher = await teacherModel.findById(teacherId)
            if (!teacher) return res.json({ success: false, message: 'Không tìm thấy giảng viên' })

            // Cập nhật project
            project.teacherId = teacherId
            project.teacherName = teacher.fullName
            await project.save()

            // Cập nhật/Tạo assignment
            const assignmentModel = require('../../models/assignment')
            await assignmentModel.findOneAndUpdate(
                { studentId, projectId, role: 'mentor' },
                { teacherId },
                { upsert: true }
            )

            res.json({ success: true, message: 'Phân công giáo viên hướng dẫn thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/updateTopicDetails
    async updateTopicDetails(req, res) {
        try {
            const { projectId, projectName, objective, scope } = req.body
            const project = await projectModel.findById(projectId)
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' })

            // [RULE] Chỉ cho phép sửa trong 1 tuần đầu sau khi Admin chốt (isLocked: true)
            if (project.isLocked) {
                const lockDate = new Date(project.updatedAt)
                const now = new Date()
                const oneWeekMs = 7 * 24 * 60 * 60 * 1000
                
                if (now - lockDate > oneWeekMs) {
                    return res.json({ 
                        success: false, 
                        message: 'Đã quá thời hạn 1 tuần kể từ khi chốt danh sách. Không thể chỉnh sửa thông tin đề tài.' 
                    })
                }
            }

            project.inputProject = projectName
            project.objective = objective
            project.scope = scope
            await project.save()

            res.json({ success: true, message: 'Cập nhật thông tin đề tài thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/updateMajorConfig
    async updateMajorConfig(req, res) {
        try {
            // Giả định lưu vào một model Config hoặc chính model Major nếu có
            // Ở đây ta có thể đơn giản là trả về success vì demo logic
            res.json({ success: true, message: 'Đã cập nhật cấu hình chuyên ngành thành công' })
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/updateDefenseSchedule
    async updateDefenseSchedule(req, res) {
        try {
            const { projectId, defenseDate, defenseRoom, defenseTime, councilId } = req.body
            
            const project = await projectModel.findById(projectId)
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' })

            // [NEW] Ràng buộc phê duyệt kép
            if (project.status !== 'ELIGIBLE_DEFENSE') {
                return res.json({ 
                    success: false, 
                    message: 'Sinh viên này chưa đủ điều kiện bảo vệ. Yêu cầu có đủ điểm từ GVHD và đánh giá ĐẠT từ GVPB mới có thể xếp lịch.' 
                })
            }

            // [NEW] Kiểm tra trùng lịch (Trùng Phòng, Ngày, Giờ)
            const conflict = await projectModel.findOne({
                _id: { $ne: projectId }, // Không tính chính đồ án này
                defenseDate: defenseDate,
                defenseTime: defenseTime,
                defenseRoom: defenseRoom,
                statuss: 'active'
            }).populate('studentId', 'fullName')

            if (conflict) {
                return res.json({
                    success: false,
                    message: `Xung đột lịch! Phòng ${defenseRoom} tại thời điểm ${defenseTime} (${new Date(defenseDate).toLocaleDateString('vi-VN')}) đã được gán cho sinh viên ${conflict.studentId ? conflict.studentId.fullName : 'khác'}.`
                })
            }

            // [NEW] Cập nhật các trường lịch trình
            project.defenseDate = defenseDate
            project.defenseRoom = defenseRoom
            project.defenseTime = defenseTime
            project.councilId = councilId && councilId.trim() !== '' ? councilId : null
            
            // Cập nhật trạng thái đồ án sang bước tiếp theo nếu cần (ví dụ: SCHEDULED)
            // Ở đây ta giữ nguyên ELIGIBLE_DEFENSE nhưng có lịch, hoặc dùng status riêng
            await project.save()

            // Thông báo cá nhân hóa
            const notification = new notificationModel({
                receiverId: project.studentId,
                title: '🎉 Đã có Lịch bảo vệ Đồ án',
                message: `Chúc mừng! Lịch bảo vệ của bạn đã được chốt: ${defenseTime}, ngày ${new Date(defenseDate).toLocaleDateString('vi-VN')} tại phòng ${defenseRoom}. Hãy chuẩn bị thật tốt nhé!`,
                type: 'success',
                link: '/student/schedule'
            })
            await notification.save()

            res.json({ success: true, message: 'Cập nhật lịch bảo vệ thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [GET] /teacher/leader/getMilestones
    async getMilestones(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const milestones = await milestoneModel.find({ 
                major: currentLeader.teacherMajor 
            }).sort({ deadline: 1 })
            res.json(milestones)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/createMilestone
    async createMilestone(req, res) {
        try {
            const { title, deadline, description } = req.body
            const currentLeader = await teacherModel.findById(req.session.teacher)
            
            const milestone = new milestoneModel({
                title,
                deadline,
                description,
                major: currentLeader.teacherMajor,
                createdBy: req.session.teacher
            })
            await milestone.save()

            const students = await studentModel.find({ studentMajor: currentLeader.teacherMajor })
            for (const student of students) {
                const notification = new notificationModel({
                    receiverId: student._id,
                    title: 'Mốc báo cáo mới',
                    message: `Mốc báo cáo "${title}" đã được tạo. Hạn nộp: ${new Date(deadline).toLocaleDateString('vi-VN')}.`,
                    type: 'warning',
                    link: '/student/project'
                })
                await notification.save()
            }

            res.redirect('/teacher/leader/config') // Redirect back to show the new milestone
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server: Không thể tạo mốc thời gian')
        }
    }

    // [DELETE] /teacher/leader/deleteMilestone/:id
    async deleteMilestone(req, res) {
        try {
            await milestoneModel.findByIdAndDelete(req.params.id)
            res.json({ success: true, message: 'Xóa mốc báo cáo thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // --- LEADER SUITE API ---

    // [GET] /teacher/leader/api/stats
    // [GET] /teacher/leader/api/stats
    async getDashboardStats(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            if (!currentLeader || !currentLeader.teacherMajor) {
                return res.json({ totalProjects: 0, pendingTopicApprovals: 0, pendingReviewerAssignments: 0, totalCouncils: 0 })
            }

            const major = currentLeader.teacherMajor.trim()
            const majorRegex = new RegExp(`^${major}$`, 'i')

            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' })
            const periodFilter = activePeriod ? { periodId: activePeriod._id } : {}

            const [totalProjects, pendingTopics, pendingReviewers, councilsCount] = await Promise.all([
                projectModel.countDocuments({ major: majorRegex, statuss: 'active', ...periodFilter }),
                // Broaden pending topics: includes all early stages
                projectModel.countDocuments({ 
                    major: majorRegex, 
                    status: { $in: ['WAITING_LEADER', 'WAITING_ADVISOR', 'REGISTERED'] }, 
                    statuss: 'active',
                    ...periodFilter
                }),
                // Pending reviewers: waiting for assignment
                projectModel.countDocuments({ major: majorRegex, status: 'WAITING_REVIEWER', statuss: 'active', ...periodFilter }),
                councilModel.countDocuments({ major: majorRegex, status: 'active' })
            ])

            res.json({
                totalProjects: totalProjects,
                pendingTopicApprovals: pendingTopics,
                pendingReviewerAssignments: pendingReviewers,
                totalCouncils: councilsCount
            })
        } catch (err) {
            console.error('Stats Error:', err)
            res.status(500).json({ success: false })
        }
    }

    // [GET] /teacher/leader/api/projects-detailed
    async getProjectsDetailed(req, res) {
        try {
            let major = '';
            
            if (req.session.teacher) {
                const currentLeader = await teacherModel.findById(req.session.teacher)
                major = currentLeader ? currentLeader.teacherMajor : '';
            } else if (req.session.student) {
                const currentStudent = await studentModel.findById(req.session.student)
                major = currentStudent ? currentStudent.studentMajor : '';
            }

            if (!major) return res.json([])

            const majorRegex = new RegExp(`^${major.trim()}$`, 'i')
            
            // [NEW] Lấy tất cả sinh viên thuộc chuyên ngành
            const students = await studentModel.find({ studentMajor: majorRegex })
                .sort({ fullName: 1 })

            // [NEW] Lấy đợt hiện tại để lọc đồ án
            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' })
            const periodFilter = activePeriod ? { periodId: activePeriod._id } : {}

            const data = []
            for (const student of students) {
                // Tìm đồ án của sinh viên (chỉ lấy đồ án đang ACTIVE và thuộc đợt hiện tại)
                const project = await projectModel.findOne({ 
                    studentId: student._id,
                    statuss: 'active',
                    ...periodFilter
                }).populate('teacherId', 'fullName')
                
                let finalReport = null
                let sourceCode = null
                let reviewerName = 'Chưa phân công'
                
                if (project && project.statuss === 'active') {
                    [finalReport, sourceCode] = await Promise.all([
                        reportModel.findOne({ projectId: project._id, title: /Báo cáo cuối/i }),
                        reportModel.findOne({ projectId: project._id, title: /Mã nguồn/i })
                    ])

                    const reviewerAssign = await assignmentModel.findOne({
                        studentId: student._id,
                        role: 'reviewer'
                    }).populate('teacherId', 'fullName')
                    
                    if (reviewerAssign && reviewerAssign.teacherId) {
                        reviewerName = reviewerAssign.teacherId.fullName
                    }
                }

                const progress = await progressModel.findOne({ studentId: student._id })
                const progressPercent = progress ? progress.percent : 0

                // [NEW] Logic Quy tắc 1 tuần: Quá 7 ngày kể từ startDate mà chưa đăng ký
                const now = new Date()
                // activePeriod đã được lấy ở trên
                
                let isLateRegistration = false
                if (activePeriod && activePeriod.startDate) {
                    const oneWeekDeadline = new Date(new Date(activePeriod.startDate).getTime() + 7 * 24 * 60 * 60 * 1000)
                    isLateRegistration = now > oneWeekDeadline
                }

                const isSpecialCase = student.status === 'rejected' || 
                                     (isLateRegistration && !project);

                // [NEW] Xác định Pipeline Status (Giai đoạn quy trình)
                let pipeline = {
                    step: 0, 
                    label: 'Chưa có đồ án',
                    color: 'amber'
                };

                if (project) {
                    if (project.status === 'WAITING_LEADER' || project.status === 'WAITING_ADMIN') {
                        pipeline = { step: 1, label: 'Duyệt đề tài', color: 'amber' };
                    } else if (project.status === 'COMPLETED' || project.status === 'DEFENDED') {
                        pipeline = { step: 5, label: 'Hoàn thành', color: 'emerald' };
                    } else if (project.status === 'ELIGIBLE_DEFENSE') {
                        pipeline = { step: 4, label: 'Đủ ĐK Bảo vệ', color: 'teal' };
                    } else if (project.status === 'WAITING_REVIEWER' || project.status === 'REVIEWING') {
                        pipeline = { step: 3, label: 'Đang phản biện', color: 'indigo' };
                    } else if (project.status === 'ONGOING') {
                        pipeline = { step: 2, label: 'Đã giao GVHD', color: 'blue' };
                    } else {
                        pipeline = { step: 1, label: 'Chờ duyệt đề tài', color: 'amber' };
                    }
                }

                data.push({
                    studentId: student._id,
                    projectId: project ? project._id : null,
                    fullName: student.fullName,
                    studentCode: student.studentCode,
                    studentStatus: student.status || 'Chưa thực hiện',
                    projectName: project ? project.inputProject : 'Chưa đăng ký đề tài',
                    objective: project ? project.objective : '',
                    scope: project ? project.scope : '',
                    supervisorId: project ? project.teacherId : null,
                    supervisorName: project && project.teacherId ? project.teacherId.fullName : 'Chưa phân công',
                    reviewerName: reviewerName,
                    hasReport: !!finalReport,
                    reportUrl: finalReport ? `/uploads/${finalReport.fileUrl}` : null,
                    hasCode: !!sourceCode,
                    codeUrl: sourceCode ? `/uploads/${sourceCode.fileUrl}` : null,
                    defenseDate: project && project.defenseDate ? new Date(project.defenseDate).toISOString().split('T')[0] : '',
                    defenseTime: project ? project.defenseTime : '',
                    defenseRoom: project ? project.defenseRoom : '',
                    councilId: project ? project.councilId : null,
                    status: project ? project.status : 'waiting',
                    isAdvisorApproved: project ? project.isAdvisorApproved : false,
                    isReviewerApproved: project ? project.isReviewerApproved : false,
                    isLeaderApproved: project ? project.isLeaderApproved : false,
                    isSpecialCase: isSpecialCase,
                    progressPercent: progressPercent,
                    pipeline: pipeline,
                    gradeStatus: await (async () => {
                        if (project && project.officeId) { 
                            // officeId here is a placeholder check, let's use councilId as per project logic
                            // but safer to just check if project exists
                        }
                        if (project) {
                            const g = await gradeModel.findOne({ projectId: project._id });
                            return g ? g.status : 'none';
                        }
                        return 'none';
                    })()
                })
            }
            res.json(data)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false })
        }
    }

    // [GET] /teacher/leader/api/teachers-slots
    async getTeachersWithSlots(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const majorRegex = new RegExp(`^${currentLeader.teacherMajor.trim()}$`, 'i')
            
            const config = await configModel.findOne({ key: 'maxStudentsPerAdvisor' })
            const maxStudents = config ? parseInt(config.value) : 5

            const teachers = await teacherModel.find({ 
                teacherMajor: majorRegex,
                $or: [
                    { 'subRoles.isGVHD': true },
                    { 'subRoles.isGVPB': true }
                ]
            }).lean()

            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' })
            const periodFilter = activePeriod ? { periodId: activePeriod._id } : {}

            const data = await Promise.all(teachers.map(async (t) => {
                const count = await projectModel.countDocuments({
                    teacherId: t._id,
                    statuss: 'active',
                    ...periodFilter
                })
                return {
                    _id: t._id,
                    fullName: t.fullName,
                    teacherCode: t.teacherCode,
                    currentStudents: count,
                    maxStudents: maxStudents,
                    isGVHD: t.subRoles?.isGVHD || false,
                    isGVPB: t.subRoles?.isGVPB || false
                }
            }))

            res.json(data)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false })
        }
    }

    // [POST] /teacher/leader/api/direct-register
    async directRegister(req, res) {
        try {
            const { 
                studentId, 
                teacherId, 
                reviewerId, 
                projectName, 
                objective, 
                scope, 
                technology,
                milestones // Array of { name, deadline }
            } = req.body
            
            const [student, teacher, reviewer] = await Promise.all([
                studentModel.findById(studentId),
                teacherModel.findById(teacherId),
                teacherModel.findById(reviewerId)
            ])
            
            if (!student || !teacher || !reviewer) {
                return res.json({ success: false, message: 'Không tìm thấy sinh viên, GV hướng dẫn hoặc GV phản biện' })
            }

            // 1. Tạo hoặc Cập nhật Project
            let project = await projectModel.findOne({ studentId: studentId })
            if (!project) {
                project = new projectModel({ studentId: studentId })
            }

            project.teacherId = teacherId
            project.teacherName = teacher.fullName
            project.teacherFeedbackId = reviewerId
            project.teacherFeedbackName = reviewer.fullName
            project.inputProject = projectName
            project.objective = objective
            project.scope = scope
            project.technology = technology ? technology.split(',').map(s => s.trim()) : []
            project.major = student.studentMajor
            project.statuss = 'active'
            project.status = 'WAITING_ADMIN' // Chuyển thẳng sang bước cuối để Admin chốt
            project.isLeaderApproved = true
            
            await project.save()

            // 2. Cập nhật Sinh viên
            student.projectId = project._id
            student.teacherId = teacherId
            student.status = 'approved'
            await student.save()

            // 3. Khởi tạo các dữ liệu liên quan
            // Progress
            await progressModel.findOneAndUpdate(
                { studentId: student._id, projectId: project._id },
                { percent: 0 },
                { upsert: true }
            )

            // Assignment: Advisor
            await assignmentModel.findOneAndUpdate(
                { studentId: student._id, projectId: project._id, role: 'advisor' },
                { teacherId: teacherId },
                { upsert: true }
            )

            // Assignment: Reviewer
            await assignmentModel.findOneAndUpdate(
                { studentId: student._id, projectId: project._id, role: 'reviewer' },
                { teacherId: reviewerId },
                { upsert: true }
            )

            // Conversation: Với GV Hướng dẫn
            await conversationModel.findOneAndUpdate(
                { studentId: student._id, teacherId: teacherId },
                {},
                { upsert: true }
            )

            // Grade
            await gradeModel.findOneAndUpdate(
                { studentId: student._id, projectId: project._id },
                { status: 'pending' },
                { upsert: true }
            )

            // --- TẠO LỊCH NỘP BÁO CÁO (MILESTONES) ---
            if (milestones && Array.isArray(milestones)) {
                // Xóa các mốc cũ nếu có (trường hợp LĐBM sửa lại)
                await requirementStudentModel.deleteMany({ projectId: project._id, studentId: student._id })
                
                for (let m of milestones) {
                    const newReq = new requirementStudentModel({
                        projectId: project._id,
                        studentId: student._id,
                        name: m.name,
                        deadline: m.deadline, // Mặc định logic trong request.js có dùng deadline
                        status: 'pending'
                    })
                    await newReq.save()
                }
            }

            // 4. Thông báo
            const notification = new notificationModel({
                receiverId: student._id,
                title: 'Đề tài đã được Bộ môn đăng ký trực tiếp',
                message: `Bộ môn đã thực hiện đăng ký trực tiếp đề tài "${projectName}" cho bạn. Bạn có thể bắt đầu làm việc ngay.`,
                type: 'success',
                link: '/student/project'
            })
            await notification.save()

            res.json({ success: true, message: 'Đăng ký đồ án trực tiếp thành công!' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' })
        }
    }

    // [POST] /teacher/leader/api/create-council
    async createCouncil(req, res) {
        try {
            const { councilName, room, chairmanId, secretaryId, memberIds } = req.body

            // 1. Kiểm tra trùng lặp vai trò nội bộ (Cùng 1 hội đồng)
            const allMembersIds = [chairmanId, secretaryId, ...memberIds].filter(id => id);
            const uniqueMembersSet = new Set(allMembersIds);
            if (uniqueMembersSet.size !== allMembersIds.length) {
                return res.json({ 
                    success: false, 
                    message: 'Vi phạm ràng buộc: Một giảng viên không thể đảm quyền nhiều vai trò trong cùng một hội đồng.' 
                });
            }

            // [NEW] 2. Kiểm tra giảng viên đã tham gia hội đồng KHÁC chưa
            const busyTeachers = await teacherModel.find({
                _id: { $in: allMembersIds },
                'subRoles.isCouncil': true
            }, 'fullName');

            if (busyTeachers.length > 0) {
                const names = busyTeachers.map(t => t.fullName).join(', ');
                return res.json({
                    success: false,
                    message: `Lỗi: Các giảng viên sau đã được đăng ký vào hội đồng khác: ${names}`
                });
            }

            const currentLeader = await teacherModel.findById(req.session.teacher)

            const newCouncil = new councilModel({
                councilName,
                room,
                chairmanId,
                secretaryId,
                memberIds,
                major: currentLeader.teacherMajor
            })
            await newCouncil.save()

            // Cập nhật vai trò cho các Giảng viên
            const updateRoles = async (ids, roleName) => {
                for (const id of ids) {
                    if (id) {
                        await teacherModel.findByIdAndUpdate(id, {
                            'subRoles.isCouncil': true,
                            councilPosition: roleName
                        });
                    }
                }
            };
            
            await updateRoles(memberIds, 'Member');
            if (secretaryId) await updateRoles([secretaryId], 'Secretary');
            if (chairmanId) await updateRoles([chairmanId], 'Chairman');

            res.json({ success: true, message: 'Thành lập hội đồng thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/api/update-council/:id
    async updateCouncil(req, res) {
        try {
            const { id } = req.params;
            const { councilName, room, chairmanId, secretaryId, memberIds } = req.body;

            const oldCouncil = await councilModel.findById(id);
            if (!oldCouncil) return res.json({ success: false, message: 'Không tìm thấy hội đồng' });

            const oldMembers = [oldCouncil.chairmanId.toString(), oldCouncil.secretaryId.toString(), ...oldCouncil.memberIds.map(m => m.toString())];
            const newMembers = [chairmanId, secretaryId, ...memberIds].filter(id => id);

            // 1. Kiểm tra xem các giảng viên MỚI có đang ở hội đồng khác không
            // (Ngoại trừ những người vốn đã ở hội đồng này)
            const brandNewMembers = newMembers.filter(m => !oldMembers.includes(m));
            const busyTeachers = await teacherModel.find({
                _id: { $in: brandNewMembers },
                'subRoles.isCouncil': true
            }, 'fullName');

            if (busyTeachers.length > 0) {
                const names = busyTeachers.map(t => t.fullName).join(', ');
                return res.json({ success: false, message: `Giảng viên đã ở Hội đồng khác: ${names}` });
            }

            // 2. Thu hồi vai trò của những người bị loại
            const removedMembers = oldMembers.filter(m => !newMembers.includes(m));
            for (const rId of removedMembers) {
                await teacherModel.findByIdAndUpdate(rId, {
                    'subRoles.isCouncil': false,
                    councilPosition: null
                });
            }

            // 3. Cập nhật hội đồng
            oldCouncil.councilName = councilName;
            oldCouncil.room = room;
            oldCouncil.chairmanId = chairmanId;
            oldCouncil.secretaryId = secretaryId;
            oldCouncil.memberIds = memberIds;
            await oldCouncil.save();

            // 4. Cập nhật vai trò cho tất cả thành viên HIỆN TẠI (Đảm bảo đồng bộ position)
            const updateRoles = async (ids, roleName) => {
                for (const id of ids) {
                    if (id) {
                        await teacherModel.findByIdAndUpdate(id, {
                            'subRoles.isCouncil': true,
                            councilPosition: roleName
                        });
                    }
                }
            };
            await updateRoles(memberIds, 'Member');
            await updateRoles([secretaryId], 'Secretary');
            await updateRoles([chairmanId], 'Chairman');

            res.json({ success: true, message: 'Cập nhật hội đồng thành công' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [DELETE] /teacher/leader/api/delete-council/:id
    async deleteCouncil(req, res) {
        try {
            const { id } = req.params;
            const council = await councilModel.findById(id);
            if (!council) return res.json({ success: false, message: 'Không tìm thấy hội đồng' });

            // 1. Thu hồi vai trò toàn bộ thành viên
            const allMembers = [council.chairmanId, council.secretaryId, ...council.memberIds];
            for (const mId of allMembers) {
                if (mId) {
                    await teacherModel.findByIdAndUpdate(mId, {
                        'subRoles.isCouncil': false,
                        councilPosition: null
                    });
                }
            }

            // 2. Gỡ councilId khỏi các đồ án
            await projectModel.updateMany({ councilId: id }, { councilId: null });

            // 3. Xoá hội đồng
            await councilModel.findByIdAndDelete(id);

            res.json({ success: true, message: 'Xoá hội đồng và giải phóng nhân sự thành công' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /teacher/leader/api/councils
    async getCouncils(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const councils = await councilModel.find({ major: currentLeader.teacherMajor })
                .populate('chairmanId', 'fullName')
                .populate('secretaryId', 'fullName')
                .populate('memberIds', 'fullName')
            res.json(councils)
        } catch (err) {
            res.status(500).json({ success: false })
        }
    }

    // [GET] /teacher/leader/getReviewerAssignments
    async getReviewerAssignments(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const students = await studentModel.find({ 
                studentMajor: currentLeader.teacherMajor 
            })

            const projectsData = []
            for (const student of students) {
                const project = await projectModel.findOne({ studentId: student._id, statuss: 'active' })
                    .populate('teacherId', 'fullName')

                if (project) {
                    const assignment = await require('../../models/assignment').findOne({ 
                        studentId: student._id, 
                        role: 'reviewer' 
                    }).populate('teacherId', 'fullName')

                    projectsData.push({
                        studentId: student._id,
                        projectId: project._id,
                        fullName: student.fullName,
                        studentCode: student.studentCode,
                        projectName: project.inputProject,
                        supervisorName: project.teacherId ? project.teacherId.fullName : 'Chưa phân công',
                        reviewerId: assignment ? assignment.teacherId._id : null,
                        reviewerName: assignment ? assignment.teacherId.fullName : 'Chưa phân công'
                    })
                }
            }

            // Lấy danh sách GV có role GVPB trong cùng bộ môn/chuyên ngành kèm theo tải công việc
            const gvpbs = await teacherModel.find({
                'subRoles.isGVPB': true,
                teacherMajor: currentLeader.teacherMajor
            }, 'fullName _id');

            const gvpbsRaw = await Promise.all(gvpbs.map(async (gv) => {
                const reviewCount = await assignmentModel.countDocuments({
                    teacherId: gv._id,
                    role: 'reviewer'
                });
                return {
                    _id: gv._id,
                    fullName: gv.fullName,
                    currentReviews: reviewCount
                };
            }));

            res.json({ projects: projectsData, gvpbs: gvpbsRaw })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/leader/assignReviewer
    async assignReviewer(req, res) {
        try {
            const { studentId, projectId, teacherId } = req.body
            const assignmentModel = require('../../models/assignment')

            // Xóa phân công cũ nếu có
            await assignmentModel.deleteMany({ studentId, role: 'reviewer' })

            if (teacherId) {
                const teacher = await teacherModel.findById(teacherId)
                if (!teacher) return res.json({ success: false, message: 'Không tìm thấy giảng viên' })

                const project = await projectModel.findById(projectId)
                if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' })

                // [RULE] GVPB không được trùng GVHD
                if (project.teacherId && project.teacherId.toString() === teacherId) {
                    return res.json({ success: false, message: 'Giáo viên phản biện không được trùng với Giáo viên hướng dẫn.' })
                }

                // Tạo phân công mới
                const newAssign = new assignmentModel({
                    studentId,
                    projectId,
                    teacherId,
                    role: 'reviewer'
                })
                await newAssign.save()

                // Đồng bộ sang project model và chuyển trạng thái
                project.teacherFeedbackId = teacherId
                project.teacherFeedbackName = teacher.fullName
                project.status = 'WAITING_REVIEWER'
                await project.save()
            } else {
                // Nếu teacherId là null/empty -> RESET
                await projectModel.findByIdAndUpdate(projectId, {
                    teacherFeedbackId: null,
                    teacherFeedbackName: null,
                    status: 'ELIGIBLE_ADVISOR' // Quay về trạng thái chờ phân công
                })
            }

            res.json({ success: true, message: 'Cập nhật phân công phản biện thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [GET] /teacher/leader/grading
    async getGradingPage(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher);
            const major = currentLeader.teacherMajor;
            const majorRegex = new RegExp(`^${major.trim()}$`, 'i');

            // Lấy tất cả hội đồng của chuyên ngành
            const councils = await councilModel.find({ major: majorRegex, status: { $ne: 'deleted' } })
                .populate('chairmanId secretaryId memberIds')
                .lean();

            // Với mỗi hội đồng, lấy thông tin tổng hợp về điểm số
            const gradingStats = [];
            for (const c of councils) {
                const projects = await projectModel.find({ councilId: c._id });
                const projectIds = projects.map(p => p._id);
                
                const grades = await gradeModel.find({ projectId: { $in: projectIds } });
                
                const completedCount = grades.filter(g => g.finalScore !== undefined).length;
                const totalCount = projects.length;
                
                // Trạng thái hội đồng: 'draft', 'submitted', 'partially_graded'
                let status = 'draft';
                if (grades.some(g => g.status === 'waiting_approval')) status = 'submitted';
                else if (grades.length > 0 && grades.every(g => g.status === 'approved')) status = 'approved';

                gradingStats.push({
                    ...c,
                    totalProjects: totalCount,
                    gradedProjects: completedCount,
                    progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
                    gradingStatus: status
                });
            }

            res.render('teacher/leader/grading', {
                layout: 'base',
                active: 'leader/grading',
                title: 'Quản lý Điểm & Tổng kết',
                councils: gradingStats
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi Server');
        }
    }

    // [GET] /teacher/leader/api/council-projects/:id
    async getCouncilProjects(req, res) {
        try {
            const { id } = req.params;
            const projects = await projectModel.find({ councilId: id })
                .populate('studentId', 'fullName studentCode studentMajor studentClass')
                .lean();

            const grades = await gradeModel.find({ 
                projectId: { $in: projects.map(p => p._id) } 
            }).lean();

            const data = projects.map(p => {
                const grade = grades.find(g => g.projectId.toString() === p._id.toString());
                return {
                    projectId: p._id,
                    studentId: p.studentId?._id,
                    fullName: p.studentId?.fullName,
                    studentCode: p.studentId?.studentCode,
                    projectName: p.inputProject,
                    grade: grade || { status: 'pending', councilScores: [] }
                };
            });

            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    // [POST] /teacher/leader/api/save-council-grades
    async saveCouncilGrades(req, res) {
        try {
            const { grades } = req.body; // Array of { projectId, studentId, scores, finalScore }
            
            for (const item of grades) {
                await gradeModel.findOneAndUpdate(
                    { projectId: item.projectId, studentId: item.studentId },
                    { 
                        councilScores: item.councilScores, 
                        finalScore: item.finalScore,
                        status: 'pending' // Still in draft
                    },
                    { upsert: true }
                );
            }

            res.json({ success: true, message: 'Lưu điểm nháp thành công' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    // [POST] /teacher/leader/api/submit-to-admin
    async submitToAdmin(req, res) {
        try {
            const { councilId } = req.body;
            
            // Tìm tất cả đồ án trong hội đồng này
            const projects = await projectModel.find({ councilId });
            const projectIds = projects.map(p => p._id);

            // Cập nhật trạng thái tất cả điểm của hội đồng này -> waiting_approval
            await gradeModel.updateMany(
                { projectId: { $in: projectIds } },
                { status: 'waiting_approval' }
            );

            res.json({ success: true, message: 'Đã gửi toàn bộ điểm lên Admin phê duyệt' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    // [GET] /teacher/leader/api/teachers-slots
    async getTeachersWithSlots(req, res) {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            const major = currentLeader.teacherMajor
            const majorRegex = new RegExp(`^${major.trim()}$`, 'i')
            
            const config = await configModel.findOne({ key: 'maxStudentsPerAdvisor' })
            const maxStudents = config ? parseInt(config.value) : 5

            const teachers = await teacherModel.find({ teacherMajor: majorRegex })
            
            const data = await Promise.all(teachers.map(async (t) => {
                const count = await projectModel.countDocuments({ 
                    teacherId: t._id, 
                    statuss: 'active' 
                })
                return {
                    _id: t._id,
                    fullName: t.fullName,
                    teacherCode: t.teacherCode,
                    currentStudents: count,
                    maxStudents: maxStudents,
                    isGVHD: t.subRoles && t.subRoles.isGVHD,
                    isGVPB: t.subRoles && t.subRoles.isGVPB
                }
            }))
            
            res.json(data)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false })
        }
    }

    // [POST] /teacher/leader/api/direct-register
    async directRegister(req, res) {
        try {
            const { 
                studentId, teacherId, reviewerId, projectName, 
                objective, scope, technology, milestones 
            } = req.body

            const student = await studentModel.findById(studentId)
            const teacher = await teacherModel.findById(teacherId)
            const reviewer = await teacherModel.findById(reviewerId)
            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' })

            if (!student || !teacher) {
                return res.json({ success: false, message: 'Thông tin sinh viên hoặc giảng viên không hợp lệ' })
            }

            // 1. Tạo Project mới ở trạng thái ONGOING
            const newProject = new projectModel({
                teacherId: teacherId,
                studentId: studentId,
                inputProject: projectName,
                objective: objective,
                scope: scope,
                technology: technology ? technology.split(',').map(s=>s.trim()) : [],
                major: student.studentMajor,
                periodId: activePeriod ? activePeriod._id : null,
                statuss: 'active',
                status: 'ONGOING',
                teacherInstruct: teacher.fullName,
                teacherFeedbackId: teacherId,
                teacherFeedbackName: teacher.fullName
            })
            await newProject.save()

            // 2. Cập nhật Student
            student.projectId = newProject._id
            student.teacherId = teacherId
            student.status = 'approved'
            await student.save()

            // 3. Khởi tạo các bản ghi phụ trợ
            // 3.1 GVPB Assignment
            const assignment = new assignmentModel({
                studentId: studentId,
                teacherId: reviewerId,
                projectId: newProject._id,
                role: 'reviewer'
            })
            // Advisor assignment
            const advisorAssign = new assignmentModel({
                studentId: studentId,
                teacherId: teacherId,
                projectId: newProject._id,
                role: 'advisor'
            })
            
            // 3.2 Progress
            const progress = new progressModel({
                studentId: studentId,
                projectId: newProject._id,
                percent: 0
            })

            // 3.3 Conversation
            const conversation = new conversationModel({
                studentId: studentId,
                teacherId: teacherId
            })

            // 3.4 Grade
            const grade = new gradeModel({
                studentId: studentId,
                projectId: newProject._id,
                status: 'pending'
            })

            // 3.5 Milestones (Requirements)
            const requirements = []
            if (milestones && milestones.length > 0) {
                for (let m of milestones) {
                    requirements.push(new requirementStudentModel({
                        projectId: newProject._id,
                        studentId: studentId,
                        name: m.name,
                        deadline: m.deadline,
                        status: 'pending'
                    }))
                }
            }

            await Promise.all([
                assignment.save(),
                advisorAssign.save(),
                progress.save(),
                conversation.save(),
                grade.save(),
                ...requirements.map(r => r.save())
            ])

            // 4. Thông báo cho sinh viên
            const notification = new notificationModel({
                receiverId: studentId,
                title: 'Đăng ký đồ án thành công (LĐBM)',
                message: `Lãnh đạo bộ môn đã đăng ký đề tài "${projectName}" cho bạn. Bạn có thể bắt đầu thực hiện ngay.`,
                type: 'success',
                link: '/student/project'
            })
            await notification.save()

            res.json({ success: true, message: 'Đăng ký đề tài đặc biệt thành công!' })

        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}

module.exports = new leaderController()
