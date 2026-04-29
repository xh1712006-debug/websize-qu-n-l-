const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const progressData = require('../../models/progress')
const teacherData = require('../../models/teacher')
const councilData = require('../../models/council')
const periodData = require('../../models/period')

class scoreController {
    async index(req, res) {
        try {
            if (!req.session.student) {
                return res.redirect('/accounts/singger')
            }

            const studentId = req.session.student
            const student = await studentData.findById(studentId)
            
            // Lấy đồ án
            const project = await projectData.findOne({ _id: student.projectId })
            if (!project) {
                return res.render('student/score', {
                    layout: 'base',
                    active: 'score',
                    figure: 'student',
                    noProject: true
                })
            }

            // Lấy GVHD
            const teacher = await teacherData.findById(student.teacherId)
            
            // Lấy Điểm
            const score = await scoreData.findOne({ studentId: studentId })
            
            // Lấy Thông tin Đợt bảo vệ
            const period = await periodData.findById(project.periodId)
            
            // Tìm Hội đồng của sinh viên này
            const council = await councilData.findOne({
                major: student.studentMajor,
                status: { $ne: 'deleted' }
            }).populate('chairmanId secretaryId memberIds')

            // Logic tính toán điểm
            let isApproved = (score && score.isPublished); // Chỉ hiển thị khi Admin đã công bố
            
            // Tính toán điểm tiêu chí (Nội dung, Hình thức, Phản biện)
            let scoreContent = 0;
            let scorePresentation = 0;
            let scoreQA = 0;
            let scoreCouncil = 0;

            if (score && score.councilScores && score.councilScores.length > 0) {
                const count = score.councilScores.length;
                const sums = score.councilScores.reduce((acc, s) => {
                    acc.total += (s.score || 0);
                    acc.content += (s.criteria?.content || 0);
                    acc.presentation += (s.criteria?.presentation || 0);
                    acc.qa += (s.criteria?.qa || 0);
                    return acc;
                  }, { total: 0, content: 0, presentation: 0, qa: 0 });

                scoreCouncil = (sums.total / count).toFixed(2);
                scoreContent = (sums.content / count).toFixed(2);
                scorePresentation = (sums.presentation / count).toFixed(2);
                scoreQA = (sums.qa / count).toFixed(2);
            }

            // 4. Điểm Tổng kết
            let finalResult = (score && score.finalScore) ? score.finalScore : 0;
            
            let statusText = 'Đang cập nhật';
            let color = 'bg-slate-400';
            let percent = 0;

            if (finalResult > 0) {
                percent = finalResult * 10;
                if (finalResult >= 8.5) { statusText = 'Xuất sắc'; color = 'bg-emerald-500'; }
                else if (finalResult >= 7.0) { statusText = 'Khá'; color = 'bg-blue-500'; }
                else if (finalResult >= 5.0) { statusText = 'Trung bình'; color = 'bg-amber-500'; }
                else { statusText = 'Học lại'; color = 'bg-rose-500'; }
            }

            const displayData = {
                fullName: student.fullName,
                studentCode: student.studentCode,
                projectName: project.inputProject,
                teacherName: teacher ? teacher.fullName : 'N/A',
                periodName: period ? period.name : 'N/A',
                semester: period ? period.semester : 'N/A',
                year: period ? period.year : 'N/A',
                scoreContent: scoreContent || '--',
                scorePresentation: scorePresentation || '--',
                scoreQA: scoreQA || '--',
                finalResult: finalResult || '--',
                statusText,
                color,
                percent: Math.round(percent),
                comment: (score && score.defenseConclusion) ? score.defenseConclusion : (score && score.comment ? score.comment : 'Chưa có nhận xét.'),
                council: council ? {
                    name: council.councilName,
                    room: council.room,
                    chairman: council.chairmanId ? council.chairmanId.fullName : 'N/A',
                    secretary: council.secretaryId ? council.secretaryId.fullName : 'N/A',
                    members: council.memberIds ? council.memberIds.map(m => m.fullName) : []
                } : null
            }

            res.render('student/score', {
                layout: 'base',
                data: [displayData],
                active: 'score',
                figure: 'student',
                isApproved: isApproved
            })
        } catch (err) {
            console.error('Student Score Controller Error:', err)
            res.status(500).send('Lỗi hệ thống khi tải bảng điểm')
        }
    }
}

module.exports = new scoreController