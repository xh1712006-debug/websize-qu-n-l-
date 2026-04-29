const teacherModel = require('../../models/teacher')
const projectModel = require('../../models/project')
const studentModel = require('../../models/student')
const milestoneModel = require('../../models/milestone')
const gradeModel = require('../../models/grade')
const councilModel = require('../../models/council')

class leaderDashboardController {
    // [GET] /teacher/leader
    index = async (req, res, next) => {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            if (!currentLeader) return res.redirect('/accounts/singger')

            const major = currentLeader.teacherMajor
            const majorRegex = new RegExp(`^${major}$`, 'i')

            // Aggregation for the 12-step Waterfall visualization
            // Mapping project status to the 12 phases
            const stepCounts = await projectModel.aggregate([
                { $match: { major: majorRegex, statuss: 'active' } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const waterfall = {
                reg: 0, // Step 1-2: Registered
                adv: 0, // Step 3: Advisor Approval
                topic: 0, // Step 4: Topic Selection (Leader Approval)
                init: 0, // Step 5-7: Ongoing/Init
                rev: 0, // Step 8-9: Reviewer Assignment/Review
                def: 0, // Step 10-11: Defense
                fin: 0  // Step 12: Done
            }

            stepCounts.forEach(s => {
                if (['REGISTERED'].includes(s._id)) waterfall.reg += s.count;
                if (['WAITING_ADVISOR'].includes(s._id)) waterfall.adv += s.count;
                if (['WAITING_LEADER'].includes(s._id)) waterfall.topic += s.count;
                if (['WAITING_ADMIN', 'ONGOING'].includes(s._id)) waterfall.init += s.count;
                if (['WAITING_REVIEWER'].includes(s._id)) waterfall.rev += s.count;
                if (['ELIGIBLE_DEFENSE'].includes(s._id)) waterfall.def += s.count;
                if (['DEFENDED', 'COMPLETED'].includes(s._id)) waterfall.fin += s.count;
            });

            // Lấy 10 hoạt động gần nhất (đồ án vừa cập nhật)
            const recentProjects = await projectModel.find({ major: majorRegex, statuss: 'active' })
                .populate('studentId')
                .sort({ updatedAt: -1 })
                .limit(10)

            const activities = recentProjects.map(p => ({
                studentName: p.studentId ? p.studentId.fullName : 'Ẩn danh',
                projectName: p.projectName,
                status: p.status,
                time: new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                date: new Date(p.updatedAt).toLocaleDateString('vi-VN')
            }))

            // Tính toán % cho các biểu đồ vòng tròn (Vital Signs)
            const total = stepCounts.reduce((acc, s) => acc + s.count, 0)
            const vitals = {
                topic: total > 0 ? Math.round(((waterfall.adv + waterfall.topic + waterfall.init + waterfall.rev + waterfall.def + waterfall.fin) / total) * 100) : 0,
                review: total > 0 ? Math.round(((waterfall.rev + waterfall.def + waterfall.fin) / total) * 100) : 0,
                defense: total > 0 ? Math.round((waterfall.fin / total) * 100) : 0
            }

            // Lấy các mốc mốc thời gian gần nhất
            const milestones = await milestoneModel.find({ major: majorRegex })
                .sort({ deadline: 1 })
                .limit(6)

            // [NEW] ADVANCED COMMAND METRICS
            const [
                unregisteredCount,
                registeredCount,
                completedCount,
                ongoingCount,
                totalGVHD,
                totalGVPB
            ] = await Promise.all([
                studentModel.countDocuments({ studentMajor: majorRegex, projectId: null }),
                studentModel.countDocuments({ studentMajor: majorRegex, projectId: { $ne: null } }),
                projectModel.countDocuments({ major: majorRegex, status: { $in: ['DEFENDED', 'COMPLETED'] }, statuss: 'active' }),
                projectModel.countDocuments({ major: majorRegex, status: 'ONGOING', statuss: 'active' }),
                teacherModel.countDocuments({ teacherMajor: majorRegex, 'subRoles.isGVHD': true }),
                teacherModel.countDocuments({ teacherMajor: majorRegex, 'subRoles.isGVPB': true })
            ])

            res.render('teacher/leader/index', {
                layout: 'base',
                active: 'leader/dashboard',
                title: 'Sở chỉ huy | Trưởng bộ môn',
                waterfall,
                vitals,
                activities,
                metrics: {
                    unregisteredCount,
                    registeredCount,
                    completedCount,
                    ongoingCount,
                    totalGVHD,
                    totalGVPB
                },
                milestones: milestones.map(m => ({
                    ...m.toObject(),
                    deadlineStr: new Date(m.deadline).toLocaleDateString('vi-VN')
                })),
                stats: await this.getCoreStats(majorRegex)
            });
        } catch (err) {
            console.error('LeaderDashboardController Error:', err)
            res.status(500).send('Lỗi Server: Không thể tải Command Center')
        }
    }

    getCoreStats = async (majorRegex) => {
        try {
            const [
                totalStudents, 
                totalTeachers, 
                unregisteredStudents,
                activeProjects,
                pendingReviewers,
                totalCouncils,
                pendingSchedules,
                totalGVHD,
                totalGVPB
            ] = await Promise.all([
                studentModel.countDocuments({ studentMajor: majorRegex }),
                teacherModel.countDocuments({ teacherMajor: majorRegex }),
                studentModel.countDocuments({ studentMajor: majorRegex, projectId: null }),
                projectModel.countDocuments({ major: majorRegex, status: 'ONGOING', statuss: 'active' }),
                projectModel.countDocuments({ major: majorRegex, status: 'WAITING_REVIEWER', statuss: 'active' }),
                councilModel.countDocuments({ major: majorRegex }),
                projectModel.countDocuments({ 
                    major: majorRegex, 
                    status: { $in: ['ELIGIBLE_DEFENSE', 'WAITING_REVIEWER'] }, 
                    defenseDate: null,
                    statuss: 'active' 
                }),
                teacherModel.countDocuments({ teacherMajor: majorRegex, 'subRoles.isGVHD': true }),
                teacherModel.countDocuments({ teacherMajor: majorRegex, 'subRoles.isGVPB': true })
            ]);
            return { 
                totalStudents, 
                totalTeachers, 
                unregisteredStudents,
                activeProjects,
                pendingReviewers,
                totalCouncils,
                pendingSchedules,
                totalGVHD,
                totalGVPB
            };
        } catch (err) {
            console.error('Core Stats Error:', err);
            return { totalStudents: 0, totalTeachers: 0, unregisteredStudents: 0 };
        }
    }



    // [GET] /teacher/leader/api/stats
    getDashboardStats = async (req, res) => {
        try {
            const currentLeader = await teacherModel.findById(req.session.teacher)
            if (!currentLeader || !currentLeader.teacherMajor) {
                return res.json({ success: false })
            }

            const major = currentLeader.teacherMajor.trim()
            const majorRegex = new RegExp(`^${major}$`, 'i')

            const [
                totalProjects, 
                ongoingProjects,
                pendingTopics, 
                pendingReviewers, 
                pendingSchedules,
                councilsCount,
                milestonesCount
            ] = await Promise.all([
                projectModel.countDocuments({ major: majorRegex, statuss: 'active' }),
                projectModel.countDocuments({ major: majorRegex, status: 'ONGOING', statuss: 'active' }),
                projectModel.countDocuments({ major: majorRegex, status: 'WAITING_LEADER', statuss: 'active' }),
                projectModel.countDocuments({ major: majorRegex, status: 'WAITING_REVIEWER', statuss: 'active' }),
                projectModel.countDocuments({ 
                    major: majorRegex, 
                    status: { $in: ['ELIGIBLE_DEFENSE', 'WAITING_REVIEWER'] }, 
                    defenseDate: null,
                    statuss: 'active' 
                }),
                councilModel.countDocuments({ major: majorRegex }),
                milestoneModel.countDocuments({ major: majorRegex })
            ])

            // Determine Health Status for each pillar
            // Red: > 10 pending or > 20% of total
            // Amber: > 0 pending
            // Green: 0 pending
            const getStatus = (count, total) => {
                if (count > 10 || (total > 0 && count / total > 0.3)) return 'urgent';
                if (count > 0) return 'warning';
                return 'normal';
            }

            res.json({
                pillars: {
                    monitoring: {
                        count: totalProjects,
                        status: getStatus(totalProjects - ongoingProjects - pendingTopics, totalProjects), 
                        label: 'Tổng số Đồ án'
                    },
                    councils: {
                        count: councilsCount,
                        status: councilsCount > 0 ? 'normal' : 'warning',
                        label: 'Hội đồng Bảo vệ'
                    },
                    reviewers: {
                        count: pendingReviewers,
                        status: getStatus(pendingReviewers, totalProjects),
                        label: 'Chờ phân Phản biện'
                    },
                    schedules: {
                        count: pendingSchedules,
                        status: getStatus(pendingSchedules, totalProjects),
                        label: 'Chờ điều phối Lịch'
                    },
                    config: {
                        count: milestonesCount,
                        status: milestonesCount >= 12 ? 'normal' : 'warning',
                        label: 'Quy trình 12 Bước'
                    }
                },
                summary: {
                    totalProjects,
                    pendingTopics
                }
            })
        } catch (err) {
            console.error('Leader Stats API Error:', err)
            res.status(500).json({ success: false })
        }
    }
}

module.exports = new leaderDashboardController();
