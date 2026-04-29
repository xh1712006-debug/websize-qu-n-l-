const studentData = require('../../models/student');
const projectData = require('../../models/project');
const progressData = require('../../models/progress');
const gradeData = require('../../models/grade');
const assignmentData = require('../../models/assignment');
const requirementStudentData = require('../../models/requirementStudent');

class studentController {
    // [GET] /teacher/student
    async index(req, res) {
        try {
            const teacherId = req.session.teacher;
            const subRoles = req.session.subRoles || {};
            const query = req.query.q || '';

            let students = [];
            
            // Xây dựng filter tìm kiếm linh hoạt
            let searchFilter = {};
            if (query) {
                searchFilter = {
                    $or: [
                        { studentCode: { $regex: query, $options: 'i' } },
                        { fullName: { $regex: query, $options: 'i' } }
                    ]
                };
            }

            // Chỉ lấy SV mình hướng dẫn (GVHD)
            // Bỏ các logic lấy SV phản biện hoặc SV hội đồng tại đây để tránh nhầm lẫn
            // GV phản biện và Hội đồng đã có các Menu riêng để quản lý.
            const myStudents = await studentData.find({ 
                teacherId: teacherId, 
                status: 'approved',
                ...searchFilter
            });
            students = myStudents;
            
            // Xử lý dữ liệu chi tiết cho từng sinh viên một cách tối ưu
            const data = await Promise.all(students.map(async (st) => {
                const [project, progress, grade] = await Promise.all([
                    projectData.findById(st.projectId),
                    progressData.findOne({ studentId: st._id }),
                    gradeData.findOne({ studentId: st._id })
                ]);
                
                let percent = progress ? (progress.percent || 0) : 0;
                
                // Xác định quan hệ của GV hiện tại với SV này
                const isMyAdvisorStudent = st.teacherId?.toString() === teacherId;
                const assignment = await assignmentData.findOne({ studentId: st._id, teacherId: teacherId, role: 'GVPB' });
                const isMyReviewerStudent = !!assignment;

                // [NEW] Kiểm tra xem có mốc báo cáo nào bị trễ hạn không
                const missedRequirement = await requirementStudentData.findOne({
                    studentId: st._id,
                    deadline: { $lt: new Date() },
                    status: { $ne: 'completed' }
                });

                return {
                    id: st._id.toString(),
                    fullName: st.fullName,
                    studentCode: st.studentCode,
                    projectName: project ? project.inputProject : 'Chưa đăng ký đề tài',
                    percent: percent,
                    isMyAdvisorStudent,
                    isMyReviewerStudent,
                    isAdvisorApproved: project ? project.isAdvisorApproved : false,
                    isRejected: project ? project.status === 'FAILED_PROGRESS' : false,
                    isReadyToApprove: project && project.status === 'ONGOING' && percent === 100,
                    proposedGVHD: grade ? grade.proposedScore?.gvhd : null,
                    proposedGVPB: grade ? grade.proposedScore?.gvpb : null,
                    isLocked: grade ? grade.isLocked : false,
                    hasMissedDeadline: !!missedRequirement 
                };
            }));

            res.render('teacher/student/index', {
                layout: 'base',
                active: 'student',
                data: data,
                figure: 'teacher',
                q: query
            })
        }
        catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }


}

module.exports = new studentController()