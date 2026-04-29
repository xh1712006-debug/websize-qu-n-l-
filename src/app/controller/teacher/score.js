const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const progressData = require('../../models/progress')
const teacherData = require('../../models/teacher')
const councilModel = require('../../models/council')
const notificationModel = require('../../models/notification')

class councilController {
    async index(req, res, next) {
        try {
            const teacherId = req.session.teacher
            const students = await studentData.find()
            const projects = []
            
            let totalToGrade = 0
            let gradedCount = 0

            for (const stu of students) {
                if (!stu._id) continue;
                // Chỉ lấy SV đủ điều kiện (tiến độ >= 100)
                const progress = await progressData.findOne({ studentId: stu._id })
                if (progress && progress.percent >= 100) {
                    totalToGrade++
                    const scoreRecord = await scoreData.findOne({ studentId: stu._id })
                    if (scoreRecord && scoreRecord.councilScores && teacherId) {
                        const hasGraded = scoreRecord.councilScores.some(s => s.teacherId && s.teacherId.toString() === teacherId.toString());
                        if (hasGraded) gradedCount++;
                    }
                }
            }

            res.render('teacher/council/index', {
                layout: 'base',
                active: 'council/list',
                title: 'Hội đồng Bảo vệ',
                councilPosition: req.session.councilPosition,
                stats: {
                    total: totalToGrade,
                    graded: gradedCount,
                    pending: totalToGrade - gradedCount
                }
            });
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    async getDefensePage(req, res, next) {
        try {
            const teacherId = req.session.teacher
<<<<<<< HEAD:src/app/contraller/teacher/score.js
            const { councilId } = req.query

            const myCouncils = await councilModel.find({
                $or: [
                    { chairmanId: teacherId },
                    { secretaryId: teacherId },
                    { memberIds: teacherId }
                ],
                status: 'active'
            })
            .populate('chairmanId', 'fullName text')
            .populate('secretaryId', 'fullName text')
            .populate('memberIds', 'fullName text')

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/council/defense', {
                    layout: 'base',
                    active: 'council/defense',
                    title: 'Điều hành Bảo vệ',
                    noCouncil: true
=======
            console.log(teacherId)
            const student = await studentData.find({teacherId: teacherId})
            console.log('student: ', student)
            for (const stu of student) {
                const project = await projectData.findById(stu.projectId)
                console.log('project: ', project)
                const progress = await progressData.findOne({studentId: stu._id})
                console.log('progress: ', progress)
                const score = await scoreData.findOne({studentId: stu._id})
                
                data.push({
                    id: score ? score._id : null,
                    studentId: stu._id,
                    projectId: project ? project._id : null,
                    fullName: stu.fullName,
                    projectName: project ? project.inputProject : 'Không có dự án',
                    progress: progress ? progress.precent : 'Không có tiến độ',
                    score: (score && score.score) ? score.score : 'Chưa có điểm',
                    status: (progress && progress.precent >= 100) ? true : false,
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/score.js
                })
            }

            let activeCouncil = null
            if (councilId) {
                activeCouncil = myCouncils.find(c => c._id.toString() === councilId)
            }
            if (!activeCouncil) activeCouncil = myCouncils[0]

            res.render('teacher/council/defense', {
                layout: 'base',
                active: 'council/defense',
                title: 'Điều hành Bảo vệ',
                myCouncils: myCouncils.map(c => c.toObject()),
                activeCouncil: activeCouncil.toObject(),
                isChairman: activeCouncil.chairmanId._id.toString() === teacherId
            });
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

<<<<<<< HEAD:src/app/contraller/teacher/score.js
    getMinutesPage(req, res, next) {
        res.render('teacher/council/minutes', {
            layout: 'base',
            active: 'council/minutes',
            title: 'Biên bản Bảo vệ'
        });
    }

    async getGradingPage(req, res, next) {
        try {
            const teacherId = req.session.teacher
            const { councilId } = req.query

            const myCouncils = await councilModel.find({
                $or: [
                    { chairmanId: teacherId },
                    { secretaryId: teacherId },
                    { memberIds: teacherId }
                ],
                status: 'active'
=======
    async postScore(req, res){
        try{
            const studentId = req.body.studentId === 'null' ? null : req.body.studentId;
            const projectId = req.body.projectId === 'null' ? null : req.body.projectId;
            const score = req.body.score;
            const comment = req.body.comment;
            
            if (!studentId) {
                return res.status(400).json({ error: "Missing studentId" });
            }
            
            const statius = await scoreData.findOne({studentId: studentId})
            if(statius && statius.status === 'approved') {
                return res.json({message: 'Điểm đã được chốt, không thể mửa'});
            }
            
            const soce = await scoreData.findOneAndUpdate({
                studentId: studentId,
            }, {
                projectId: projectId,
                teacherId: req.session.teacher,
                score: score,
                comment: comment,
            }, {
                new: true,
                upsert: true,
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/score.js
            })

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/council/grading', {
                    layout: 'base',
                    active: 'council/grading',
                    title: 'Chấm điểm Hội đồng',
                    noCouncil: true
                })
            }

            let activeCouncil = null
            if (councilId) {
                activeCouncil = myCouncils.find(c => c._id.toString() === councilId)
            }
            if (!activeCouncil) activeCouncil = myCouncils[0]

            res.render('teacher/council/grading', {
                layout: 'base',
                active: 'council/grading',
                title: 'Chấm điểm Hội đồng',
                myCouncils: myCouncils.map(c => c.toObject()),
                activeCouncil: activeCouncil.toObject()
            });
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [GET] /teacher/council/getStudents
    async getStudents(req, res) {
        try {
            const teacherId = req.session.teacher
            const { councilId } = req.query
            const userRole = req.session.userRole
            const data = []

            // 1. Xác định hội đồng cần lấy SV
            let targetCouncilId = councilId
            if (!targetCouncilId) {
                const firstCouncil = await councilModel.findOne({
                    $or: [
                        { chairmanId: teacherId },
                        { secretaryId: teacherId },
                        { memberIds: teacherId }
                    ],
                    status: 'active'
                })
                if (firstCouncil) targetCouncilId = firstCouncil._id
            }

            if (!targetCouncilId && userRole !== 'Admin') return res.json([])

            // 2. Kiểm tra quyền truy cập hội đồng này (Nếu không phải admin)
            if (userRole !== 'Admin') {
                const verifyCouncil = await councilModel.findOne({
                    _id: targetCouncilId,
                    $or: [
                        { chairmanId: teacherId },
                        { secretaryId: teacherId },
                        { memberIds: teacherId }
                    ]
                })
                if (!verifyCouncil) return res.status(403).json({ message: 'Không có quyền truy cập hội đồng này' })
            }

            // 3. Lấy tất cả đồ án thuộc hội đồng này (Sử dụng populate để lấy SV trực tiếp)
            const projectsInCouncil = await projectData.find({ 
                councilId: targetCouncilId, 
                statuss: 'active' 
            })
            .populate('studentId')
            .populate('teacherId', 'fullName')
            
            const assignmentModel = require('../../models/assignment')

            for (const project of projectsInCouncil) {
                if (!project.studentId) continue;
                
                const stu = project.studentId;
                const progress = await progressData.findOne({ studentId: stu._id })
                const scoreRecord = await scoreData.findOne({ studentId: stu._id })
                
                // Tìm GVPB từ assignment
                const reviewerAssign = await assignmentModel.findOne({ studentId: stu._id, role: 'reviewer' }).populate('teacherId', 'fullName')

                const myScore = scoreRecord ? scoreRecord.councilScores.find(s => s.teacherId && s.teacherId.toString() === teacherId) : null

                data.push({
                    id: scoreRecord ? scoreRecord._id : null,
                    studentId: stu._id,
                    fullName: stu.fullName,
                    studentCode: stu.studentCode,
                    projectName: project.inputProject || 'Chưa có đề tài',
                    advisorName: (project.teacherId) ? project.teacherId.fullName : 'N/A',
                    reviewerName: (reviewerAssign && reviewerAssign.teacherId) ? reviewerAssign.teacherId.fullName : 'N/A',
                    progress: progress ? progress.percent : 0,
                    isEligible: progress ? progress.percent >= 100 : false,
                    proposedScore: scoreRecord ? scoreRecord.proposedScore : { gvhd: 0, gvpb: 0 },
                    proposedComment: scoreRecord ? scoreRecord.proposedComment : { gvhd: '', gvpb: '' },
                    myScore: myScore ? myScore.score : null,
                    myCriteria: myScore ? myScore.criteria : { content: 0, presentation: 0, qa: 0 },
                    finalScore: scoreRecord ? scoreRecord.finalScore : null,
                    isLocked: scoreRecord ? scoreRecord.isLocked : false,
                    councilCount: scoreRecord ? scoreRecord.councilScores.length : 0,
                    status: scoreRecord ? scoreRecord.status : 'pending',
                    defenseQuestions: scoreRecord ? scoreRecord.defenseQuestions : [],
                    defenseConclusion: scoreRecord ? scoreRecord.defenseConclusion : ''
                })
            }
            res.json(data)
        }
        catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/council/submitScore
    async submitScore(req, res) {
        try {
            const { studentId, criteria, comment } = req.body // criteria: { content, presentation, qa }
            const teacherId = req.session.teacher

            // Tính tổng điểm dựa trên tỷ lệ: 40% - 20% - 40%
            const score = (criteria.content * 0.4 + criteria.presentation * 0.2 + criteria.qa * 0.4).toFixed(2)

            let scoreRecord = await scoreData.findOne({ studentId })
            if (!scoreRecord) {
                scoreRecord = new scoreData({ studentId, councilScores: [] })
            }

            if (scoreRecord.isLocked) {
                return res.json({ success: false, message: 'Điểm đã bị khóa, không thể chỉnh sửa.' })
            }

            const existingIndex = scoreRecord.councilScores.findIndex(s => s.teacherId.toString() === teacherId)
            if (existingIndex > -1) {
                scoreRecord.councilScores[existingIndex].criteria = criteria
                scoreRecord.councilScores[existingIndex].score = score
                scoreRecord.councilScores[existingIndex].comment = comment
                scoreRecord.councilScores[existingIndex].submittedAt = Date.now()
            } else {
                scoreRecord.councilScores.push({ teacherId, criteria, score, comment })
            }

            await scoreRecord.save()
            res.json({ success: true, score, message: 'Đã lưu điểm thành công. Tổng điểm: ' + score })
        }
        catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/council/submitMinutes
    async submitMinutes(req, res) {
        try {
            if (req.session.councilPosition !== 'Secretary') {
                return res.status(403).json({ success: false, message: 'Chỉ Thư ký mới có quyền ghi biên bản.' })
            }

            const { studentId, questions, conclusion } = req.body
            const scoreRecord = await scoreData.findOne({ studentId })
            
            if (!scoreRecord) return res.json({ success: false, message: 'Không tìm thấy bản ghi điểm' })

            scoreRecord.defenseQuestions = questions
            scoreRecord.defenseConclusion = conclusion
            scoreRecord.secretaryId = req.session.teacher

            await scoreRecord.save()
            res.json({ success: true, message: 'Đã lưu biên bản bảo vệ thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/council/synthesizeScore
    async synthesizeScore(req, res) {
        try {
            if (req.session.councilPosition !== 'Secretary') {
                return res.status(403).json({ success: false, message: 'Chỉ Thư ký mới có quyền tổng hợp điểm.' })
            }

            const { studentId } = req.body
            const scoreRecord = await scoreData.findOne({ studentId })
            
            if (!scoreRecord || scoreRecord.councilScores.length === 0) {
                return res.json({ success: false, message: 'Chưa có thành viên nào chấm điểm.' })
            }

            const sum = scoreRecord.councilScores.reduce((acc, curr) => acc + curr.score, 0)
            scoreRecord.finalScore = (sum / scoreRecord.councilScores.length).toFixed(2)

            await scoreRecord.save()

            // [NEW] Cập nhật trạng thái đồ án sang DEFENDED
            await projectData.findOneAndUpdate(
                { studentId, statuss: 'active' }, 
                { status: 'DEFENDED' }
            )

            res.json({ success: true, finalScore: scoreRecord.finalScore, message: 'Đã tổng hợp điểm trung bình. Trạng thái: Đã bảo vệ.' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/council/approveFinal
    async approveFinal(req, res) {
        try {
            if (req.session.councilPosition !== 'Chairman') {
                return res.status(403).json({ success: false, message: 'Chỉ Chủ tịch hội đồng mới có quyền duyệt điểm cuối.' })
            }

            const { studentId } = req.body
            const scoreRecord = await scoreData.findOne({ studentId })
            
            if (!scoreRecord || !scoreRecord.finalScore) {
                return res.json({ success: false, message: 'Vui lòng yêu cầu Thư ký tổng hợp điểm trước khi duyệt.' })
            }

            if (scoreRecord.defenseQuestions.length === 0 || !scoreRecord.defenseConclusion) {
                return res.json({ success: false, message: 'Vui lòng yêu cầu Thư ký hoàn thiện biên bản trước khi duyệt.' })
            }

            scoreRecord.status = 'approved'
            scoreRecord.isLocked = true
            scoreRecord.lockedAt = Date.now()
            scoreRecord.approvedBy = req.session.teacher

            await scoreRecord.save()

            // Gửi thông báo cho Sinh viên và GV hướng dẫn (Yêu cầu 2: Có nha)
            const student = await studentData.findById(studentId)
            const project = await projectData.findOne({ studentId, statuss: 'active' })
            
            if (project) {
                project.status = 'COMPLETED'; // [NEW] Hoàn thành
                await project.save();
            }

            const notifications = []
            // Thông báo cho Sinh viên
            notifications.push(new notificationModel({
                receiverId: studentId,
                title: 'Kết quả bảo vệ chính thức',
                message: `Chúc mừng! Kết quả bảo vệ đồ án của bạn đã được phê duyệt với điểm số: ${scoreRecord.finalScore}.`,
                type: 'success',
                link: '/student/project'
            }))

            // Thông báo cho GVHD nếu có
            if (project && project.teacherId) {
                notifications.push(new notificationModel({
                    receiverId: project.teacherId,
                    title: 'Sinh viên đã có điểm bảo vệ',
                    message: `Sinh viên ${student.fullName} đã được Hội đồng phê duyệt điểm bảo vệ cuối cùng: ${scoreRecord.finalScore}.`,
                    type: 'info',
                    link: '/teacher/report'
                }))
            }
            await Promise.all(notifications.map(n => n.save()))

            res.json({ success: true, message: 'Đã phê duyệt kết quả và gửi thông báo thành công.' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/score/updateEligibility
    async updateEligibility(req, res) {
        try {
            const { studentId, isEligible } = req.body;
            const project = await projectData.findOne({ studentId: studentId, statuss: 'active' });
            
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' });

            const notificationModel = require('../../models/notification');
            const student = await studentData.findById(studentId);

            if (isEligible) {
                project.status = 'ELIGIBLE_ADVISOR'; // [NEW] Đủ điều kiện (GVHD chốt)
                project.isAdvisorApproved = true; // [NEW] Đánh dấu GVHD đã chốt
                await project.save();
                
                // Cập nhật kết quả vào Score model (cột dành cho GVHD)
                await scoreData.findOneAndUpdate(
                    { studentId: studentId },
                    { 
                        'proposedScore.gvhd': 1, // Đánh giá đạt điều kiện
                        status: 'inReview'
                    },
                    { upsert: true }
                );

                // Gửi thông báo
                const notification = new notificationModel({
                    receiverId: studentId,
                    title: '✅ Đủ điều kiện bảo vệ',
                    message: `Chúc mừng sinh viên ${student.fullName}! GVHD đã xác nhận bạn ĐỦ ĐIỀU KIỆN để bảo vệ đồ án.`,
                    type: 'success',
                    link: '/student/project'
                });
                await notification.save();

                res.json({ success: true, message: 'Đã xác nhận sinh viên ĐỦ ĐIỀU KIỆN bảo vệ. Đồ án đang chờ Bộ môn phân công Phản biện.' });
            } else {
                project.status = 'FAILED_PROGRESS'; // [NEW] Không đủ điều kiện (tuần 10)
                project.isAdvisorApproved = false;
                await project.save();

                // Cập nhật kết quả vào Score model
                await scoreData.findOneAndUpdate(
                    { studentId: studentId },
                    { 'proposedScore.gvhd': 0 },
                    { upsert: true }
                );

                // Gửi thông báo
                const notification = new notificationModel({
                    receiverId: studentId,
                    title: '❌ Không đủ điều kiện bảo vệ',
                    message: `Sinh viên ${student.fullName} lưu ý: GVHD đã đánh giá bạn KHÔNG ĐỦ ĐIỀU KIỆN để ra Hội đồng bảo vệ.`,
                    type: 'error',
                    link: '/student/project'
                });
                await notification.save();

                res.json({ success: true, message: 'Đã xác nhận sinh viên KHÔNG ĐỦ ĐIỀU KIỆN bảo vệ.' });
            }

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [POST] /teacher/council/updateDefenseStatus
    async updateDefenseStatus(req, res) {
        try {
            if (req.session.councilPosition !== 'Chairman') {
                return res.status(403).json({ success: false, message: 'Chỉ Chủ tịch mới có quyền cập nhật trạng thái bảo vệ.' })
            }
            const { studentId, status } = req.body // status: wait, active, finished
            
            await projectData.findOneAndUpdate({ studentId, statuss: 'active' }, { status })
            
            res.json({ success: true, message: 'Cập nhật trạng thái bảo vệ thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
    // [GET] /teacher/score/exportReport/:studentId
    async exportReport(req, res) {
        try {
            if (req.session.councilPosition !== 'Secretary') {
                return res.status(403).send('Chỉ Thư ký mới có quyền xuất báo cáo.');
            }

            const { studentId } = req.params;
            const scoreRecord = await scoreData.findOne({ studentId }).populate('studentId').populate('projectId');
            const student = await studentData.findById(studentId);
            const project = await projectData.findOne({ studentId });

            if (!scoreRecord) return res.status(404).send('Không tìm thấy dữ liệu báo cáo.');

            // Tạo nội dung CSV đơn giản
            let csv = '\uFEFF'; // BOM for Excel UTF-8
            csv += `BIÊN BẢN BẢO VỆ ĐỒ ÁN TỐT NGHIỆP\n`;
            csv += `Sinh viên,${student.fullName},Mã SV,${student.studentCode}\n`;
            csv += `Đề tài,${project.inputProject}\n`;
            csv += `Điểm trung bình,${scoreRecord.finalScore || 'Chưa tổng hợp'}\n\n`;
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=BienBan_${student.studentCode}.csv`);
            res.send(csv);

        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi server');
        }
    }

    // [GET] /teacher/council/unified-view
    async getUnifiedView(req, res) {
        try {
            const teacherId = req.session.teacher;
            const myCouncils = await councilModel.find({
                $or: [
                    { chairmanId: teacherId },
                    { secretaryId: teacherId },
                    { memberIds: teacherId }
                ],
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName');

            res.render('teacher/council/unified_view', {
                layout: 'base',
                active: 'council/unified-view',
                title: 'Tra cứu Hội đồng',
                myCouncils: myCouncils.map(c => c.toObject()),
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi Server');
        }
    }

    // [GET] /teacher/council/api/project-detail/:studentId
    async getProjectDetail(req, res) {
        try {
            const { studentId } = req.params;
            const project = await projectData.findOne({ studentId, statuss: 'active' })
                .populate('studentId', 'fullName studentCode studentMajor')
                .populate('teacherId', 'fullName');
            
            if (!project) return res.status(404).json({ success: false, message: 'Không tìm thấy đồ án' });

            res.json({
                success: true,
                data: {
                    fullName: project.studentId.fullName,
                    studentCode: project.studentId.studentCode,
                    major: project.studentId.studentMajor,
                    projectName: project.inputProject,
                    advisor: project.teacherId ? project.teacherId.fullName : 'N/A',
                    objective: project.objective || 'Chưa cập nhật',
                    scope: project.scope || 'Chưa cập nhật',
                    content: project.contentProject || 'Chưa cập nhật',
                    expectedOutcome: project.expectedOutcome || 'Chưa cập nhật',
                    technology: project.technology || [],
                    defenseDate: project.defenseDate ? new Date(project.defenseDate).toLocaleDateString('vi-VN') : 'Chưa xếp lịch',
                    defenseTime: project.defenseTime || 'N/A',
                    defenseRoom: project.defenseRoom || 'N/A'
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

<<<<<<< HEAD:src/app/contraller/teacher/score.js
module.exports = new councilController();
=======
module.exports = new scoreController
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/score.js
