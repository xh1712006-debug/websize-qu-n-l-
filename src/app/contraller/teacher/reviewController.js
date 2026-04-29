const studentData = require('../../models/student');
const projectData = require('../../models/project');
const progressData = require('../../models/progress');
const reportData = require('../../models/report');
const assignmentData = require('../../models/assignment');
const councilModel = require('../../models/council');
const periodModel = require('../../models/period');
const teacherModel = require('../../models/teacher');

class reviewController {
    // [GET] /teacher/review
    async index(req, res) {
        try {
            res.render('teacher/reviewer/evaluation', {
                layout: 'base',
                active: 'review',
                title: 'Danh sách Thẩm định Phản biện',
                figure: 'teacher'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    // [GET] /teacher/review/getAssignedStudents
    async getAssignedStudents(req, res) {
        try {
            const teacherId = req.session.teacher;
            const assignments = await assignmentData.find({ 
                teacherId: teacherId,
                role: 'reviewer' 
            });

            const data = [];
            for (const assign of assignments) {
                const student = await studentData.findById(assign.studentId);
                const project = await projectData.findById(assign.projectId);
                
                // Lấy báo cáo mới nhất (được coi là báo cáo cuối kỳ)
                const latestReport = await reportData.findOne({ 
                    studentId: assign.studentId 
                }).sort({ createdAt: -1 });

                const gvpbGrade = await require('../../models/grade').findOne({ studentId: assign.studentId });

                if (student) {
                    data.push({
                        studentId: student._id,
                        fullName: student.fullName,
                        studentCode: student.studentCode,
                        projectName: project ? project.inputProject : 'Chưa đăng ký',
                        contentProject: project ? project.contentProject : 'Không có mô tả',
                        objective: project ? project.objective : 'Không có mục tiêu',
                        scope: project ? project.scope : 'Không có phạm vi',
                        latestReport: latestReport ? latestReport.fileUrl : null,
                        reportCreatedAt: latestReport ? latestReport.createdAt : null,
                        reportCreatedAt: latestReport ? latestReport.createdAt : null,
                        status: student.status,
                        isAdvisorApproved: project ? project.isAdvisorApproved : false,
                        workflowState: project ? (
                            project.status === 'FAILED_PROGRESS' ? 'rejected' :
                            project.isAdvisorApproved ? 'ready' : 'locked'
                        ) : 'locked',
                        reviewVerdict: gvpbGrade ? (gvpbGrade.proposedScore ? gvpbGrade.proposedScore.gvpb : null) : null,
                        reviewFeedback: gvpbGrade ? (gvpbGrade.proposedComment ? gvpbGrade.proposedComment.gvpb : null) : null
                    });
                }
            }
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [POST] /teacher/review/submitReview
    async submitReview(req, res) {
        try {
            const { studentId, reviewResult, feedback } = req.body; // reviewResult: 'Đạt' hoặc 'Không đạt'
            const teacherId = req.session.teacher;

            const project = await projectData.findOne({ studentId: studentId, statuss: 'active' });
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án đang thực hiện' });

            // [NEW] Kiểm tra sự cho phép của GVHD
            if (!project.isAdvisorApproved) {
                return res.status(403).json({ 
                    success: false, 
                    message: project.status === 'FAILED_PROGRESS' 
                        ? 'Sinh viên này đã bị GVHD từ chối điều kiện bảo vệ.' 
                        : 'Sinh viên này chưa được GVHD phê duyệt điều kiện bảo vệ. Vui lòng đợi GVHD hoàn tất trước.' 
                });
            }

            // Cập nhật kết quả vào Grade model (cột dành cho GVPB)
            const gradeModel = require('../../models/grade');
            await gradeModel.findOneAndUpdate(
                { studentId: studentId },
                { 
                    'proposedScore.gvpb': reviewResult === 'Đạt' ? 1 : 0, 
                    'proposedComment.gvpb': feedback 
                },
                { upsert: true }
            );

            // Cập nhật trạng thái project dựa trên kết quả theo quy trình 12 bước
            if (reviewResult === 'Đạt') {
                project.isReviewerApproved = true;
                project.status = 'ELIGIBLE_DEFENSE'; // Đủ điều kiện ra Hội đồng
            } else {
                project.status = 'FAILED_REVIEW';   // Không đạt phản biện
                project.isReviewerApproved = false;
            }
            await project.save();

            // Gửi thông báo cho sinh viên về kết quả phản biện
            const notificationModel = require('../../models/notification');
            const student = await studentData.findById(studentId);
            const notification = new notificationModel({
                receiverId: studentId,
                title: reviewResult === 'Đạt' ? '✅ Đạt phản biện đồ án' : '❌ Không đạt phản biện',
                message: reviewResult === 'Đạt' 
                    ? `Chúc mừng ${student.fullName}! Đồ án của bạn đã đạt yêu cầu thẩm định phản biện và đủ điều kiện ra Hội đồng.`
                    : `Sinh viên ${student.fullName} lưu ý: Đồ án của bạn KHÔNG ĐẠT yêu cầu thẩm định phản biện.`,
                type: reviewResult === 'Đạt' ? 'success' : 'error',
                link: '/student/project'
            });
            await notification.save();

            res.json({ success: true, message: 'Gửi nhận xét phản biện thành công. Trạng thái đồ án đã được cập nhật.' });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /teacher/review/dashboard
    async getDashboard(req, res) {
        try {
            const teacherId = req.session.teacher;
            
            // 1. Tìm tất cả đồ án mà giảng viên này được phân công Phản biện
            const assignments = await assignmentData.find({ 
                teacherId: teacherId,
                role: 'reviewer' 
            });

            if (!assignments || assignments.length === 0) {
                return res.render('teacher/reviewer/dashboard', {
                    layout: 'base',
                    active: 'reviewer/dashboard',
                    noAssignment: true
                });
            }

            const studentIds = assignments.map(a => a.studentId);
            const projects = await projectData.find({ 
                studentId: { $in: studentIds },
                statuss: 'active' 
            }).populate('studentId');

            const gradeModel = require('../../models/grade');
            const grades = await gradeModel.find({ studentId: { $in: studentIds } });

            let totalAssigned = assignments.length;
            let approvedReviews = 0;
            let rejectedReviews = 0;
            
            projects.forEach(p => {
                const studentGrade = grades.find(g => g.studentId.toString() === p.studentId._id.toString());
                if (studentGrade && studentGrade.proposedScore && studentGrade.proposedScore.gvpb !== undefined) {
                    if (studentGrade.proposedScore.gvpb === 1) {
                        approvedReviews++;
                    } else {
                        rejectedReviews++;
                    }
                }
            });

            const stats = {
                totalAssigned: totalAssigned,
                approvedReviews: approvedReviews,
                rejectedReviews: rejectedReviews,
                pendingReviews: totalAssigned - (approvedReviews + rejectedReviews),
                overallProgress: totalAssigned > 0 ? Math.round(((approvedReviews + rejectedReviews) / totalAssigned) * 100) : 0
            };

            // 3. Lấy 5 ca bảo vệ sắp diễn ra của sinh viên được phân công
            const upcomingDefenses = projects
                .filter(p => p.defenseDate)
                .sort((a, b) => new Date(a.defenseDate) - new Date(b.defenseDate))
                .slice(0, 5)
                .map(p => ({
                    studentName: p.studentId ? p.studentId.fullName : 'N/A',
                    projectName: p.inputProject,
                    time: p.defenseTime,
                    date: p.defenseDate,
                    room: p.defenseRoom
                }));

            res.render('teacher/reviewer/dashboard', {
                layout: 'base',
                active: 'reviewer/dashboard',
                title: 'Bảng điều khiển Phản biện',
                stats: stats,
                upcomingDefenses: upcomingDefenses
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    // [GET] /teacher/review/schedule
    async getSchedule(req, res) {
        try {
            const teacherId = req.session.teacher;
            const assignments = await assignmentData.find({ 
                teacherId: teacherId,
                role: 'reviewer' 
            });

            if (!assignments || assignments.length === 0) {
                return res.render('teacher/reviewer/schedule', {
                    layout: 'base',
                    active: 'reviewer/schedule',
                    noAssignment: true
                });
            }

            const studentIds = assignments.map(a => a.studentId);
            const projects = await projectData.find({ 
                studentId: { $in: studentIds },
                statuss: 'active' 
            })
            .populate('studentId')
            .populate('teacherId', 'fullName') // GVHD
            .populate('councilId') // [NEW] Populate council
            .sort({ defenseDate: 1, defenseTime: 1 });

            // [NEW] Lấy chi tiết hội đồng và đợt đăng ký
            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' }).lean();

            const scheduleData = await Promise.all(projects.map(async (p) => {
                if (!p.studentId) return null;

                let councilDetails = null;
                if (p.councilId) {
                    councilDetails = await councilModel.findById(p.councilId)
                        .populate('chairmanId', 'fullName')
                        .populate('secretaryId', 'fullName')
                        .populate('memberIds', 'fullName')
                        .lean();
                }

                return {
                    studentId: p.studentId._id,
                    studentName: p.studentId.fullName,
                    studentCode: p.studentId.studentCode,
                    projectName: p.inputProject,
                    defenseDate: p.defenseDate,
                    defenseTime: p.defenseTime,
                    defenseRoom: p.defenseRoom,
                    advisorName: p.teacherId ? p.teacherId.fullName : 'N/A',
                    status: p.status,
                    council: councilDetails
                };
            }));

            res.render('teacher/reviewer/schedule', {
                layout: 'base',
                active: 'reviewer/schedule',
                title: 'Lịch bảo vệ Phản biện',
                schedules: scheduleData.filter(s => s !== null),
                activePeriod: activePeriod
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    // [GET] /teacher/review/questions
    async getQuestionsPage(req, res) {
        try {
            const teacherId = req.session.teacher;
            const assignments = await assignmentData.find({ 
                teacherId: teacherId,
                role: 'reviewer' 
            });

            if (!assignments || assignments.length === 0) {
                return res.render('teacher/reviewer/questions', {
                    layout: 'base',
                    active: 'reviewer/questions',
                    noAssignment: true
                });
            }

            const studentIds = assignments.map(a => a.studentId);
            const projects = await projectData.find({ 
                studentId: { $in: studentIds },
                statuss: 'active',
                isReviewerApproved: true // Chỉ những SV đã được duyệt mới hiện ở đây
            }).populate('studentId');

            const gradeModel = require('../../models/grade');
            const periodModel = require('../../models/period');
            
            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' }).lean();
            const grades = await gradeModel.find({ studentId: { $in: studentIds } });

            const studentList = projects.map(p => {
                const grade = grades.find(g => g.studentId.toString() === p.studentId._id.toString());
                return {
                    id: p.studentId._id,
                    name: p.studentId.fullName,
                    code: p.studentId.studentCode,
                    projectName: p.inputProject,
                    reviewerQuestions: grade ? grade.reviewerQuestions : ''
                };
            });

            res.render('teacher/reviewer/questions', {
                layout: 'base',
                active: 'reviewer/questions',
                title: 'Đặt câu hỏi Phản biện',
                students: studentList,
                activePeriod: activePeriod
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    // [POST] /teacher/review/submitQuestions
    async submitQuestions(req, res) {
        try {
            const { studentId, questions } = req.body;
            const gradeModel = require('../../models/grade');

            await gradeModel.findOneAndUpdate(
                { studentId: studentId },
                { reviewerQuestions: questions },
                { upsert: true }
            );

            res.json({ success: true, message: 'Lưu câu hỏi phản biện thành công!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server khi lưu câu hỏi' });
        }
    }
}

module.exports = new reviewController();
