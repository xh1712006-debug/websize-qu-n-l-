const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const requirmentStudentData = require('../../models/requirementStudent')
const progressData = require('../../models/progress')
const assignmentData = require('../../models/assignment')

class scoreFeedbackController {
    async index(req, res) {
        try {
            res.render('teacher/scoreFeedback', {
                layout: 'base',
                active: 'scoreFeedback',
                figure: 'teacher',

            })
        }
        catch (err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async getScoreFeedback(req, res) {
        try {
            const teacherId = req.session.teacher
            // Tìm tất cả các phân công của giảng viên này (có thể là GVHD hoặc GVPB/Reviewer)
            const assignments = await assignmentData.find({ teacherId: teacherId })
            
            const data = []
            for (const assign of assignments) {
                const student = await studentData.findById(assign.studentId)
                const project = await projectData.findById(assign.projectId)
                const progress = await progressData.findOne({ studentId: assign.studentId })
                const grade = await scoreData.findOne({ studentId: assign.studentId })

                // Lấy điểm đề xuất tương ứng với vai trò
                let proposedScore = 0
                let proposedComment = ''
                
                if (assign.role === 'advisor' || assign.role === 'gvhd') {
                    proposedScore = grade?.proposedScore?.gvhd || 0
                    proposedComment = grade?.proposedComment?.gvhd || ''
                } else if (assign.role === 'reviewer' || assign.role === 'gvpb') {
                    proposedScore = grade?.proposedScore?.gvpb || 0
                    proposedComment = grade?.proposedComment?.gvpb || ''
                }

                // Tìm báo cáo mới nhất của sinh viên này
                const latestReport = await require('../../models/report').findOne({ 
                    studentId: assign.studentId 
                }).sort({ createdAt: -1 })

                data.push({
<<<<<<< HEAD:src/app/contraller/teacher/scoreFeedback.js
                    id: grade ? grade._id : null,
                    studentId: assign.studentId,
                    projectId: assign.projectId,
                    fullName: student ? student.fullName : 'Không có thông tin',
                    projectName: project ? project.inputProject : 'Không có dự án',
                    progress: progress ? progress.percent : 0,
                    score: proposedScore,
                    comment: proposedComment,
                    role: assign.role, 
                    latestReport: latestReport ? latestReport.fileUrl : null,
                    status: (progress && progress.percent >= 100) ? true : false,
=======
                    id: score ? score._id : null,
                    studentId: stu.studentId,
                    projectId: stu.projectId,
                    fullName: student ? student.fullName : 'Không có thông tin',
                    projectName: project ? project.inputProject : 'Không có dự án',
                    progress: progress ? progress.precent : 'Không có tiến độ',
                    score: (score && score.scoreFeedback) ? score.scoreFeedback : 'Chưa có điểm',
                    status: (progress && progress.precent >= 100) ? true : false,
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/scoreFeedback.js
                })
            }
            return res.json(data)
        }
        catch (err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }

    async postScoreFeedback(req, res) {
        try {
<<<<<<< HEAD:src/app/contraller/teacher/scoreFeedback.js
            const { studentId, score, comment } = req.body
            const teacherId = req.session.teacher
=======
            const studentId = req.body.studentId === 'null' ? null : req.body.studentId;
            const projectId = req.body.projectId === 'null' ? null : req.body.projectId;
            const score = req.body.score;
            const comment = req.body.comment;
            
            if (!studentId) {
                return res.status(400).json({ error: "Missing studentId" });
            }

            const statius = await scoreData.findOne({studentId: studentId})
            if(statius && statius.status === 'approved') {
                return res.json({message: 'Điểm đã được chốt, không thể sửa'});
            }

            const scoreFeedback = await scoreData.findOneAndUpdate({
                studentId: studentId,
            }, {
                projectId: projectId,
                teacherId: req.session.teacher,
                scoreFeedback: score,
            }, { new: true, upsert: true })
            
            return res.json({
                message: 'Điểm đã được thêm'
            })
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/scoreFeedback.js
            
            if (!studentId) {
                return res.status(400).json({ error: "Missing studentId" });
            }

            // Kiểm tra trạng thái khóa điểm
            const gradeRecord = await scoreData.findOne({ studentId: studentId })
            if (gradeRecord && (gradeRecord.isLocked || gradeRecord.status === 'approved')) {
                return res.json({ success: false, message: 'Điểm đã được chốt hoặc bị khóa, không thể sửa' });
            }

            // Tìm vai trò của giảng viên đối với sinh viên này
            const assignment = await assignmentData.findOne({ studentId, teacherId })
            if (!assignment) {
                return res.status(403).json({ success: false, message: 'Bạn không được phân công cho sinh viên này.' });
            }

            // CHẶN GVPB CHẤM ĐIỂM theo yêu cầu người dùng
            if (assignment.role === 'reviewer' || assignment.role === 'gvpb') {
                return res.json({ success: false, message: 'Giáo viên phản biện không có quyền chấm điểm trực tiếp tại đây.' });
            }

            const updateData = {}
            if (assignment.role === 'advisor' || assignment.role === 'gvhd') {
                updateData['proposedScore.gvhd'] = score
                updateData['proposedComment.gvhd'] = comment
            } else if (assignment.role === 'reviewer' || assignment.role === 'gvpb') {
                updateData['proposedScore.gvpb'] = score
                updateData['proposedComment.gvpb'] = comment
            }

            await scoreData.findOneAndUpdate(
                { studentId: studentId },
                { $set: updateData },
                { new: true, upsert: true }
            )
            
            return res.json({
                success: true,
                message: 'Đã lưu điểm đề xuất thành công'
            })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}

module.exports = new scoreFeedbackController
