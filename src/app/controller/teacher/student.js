const studentData = require('../../models/student');
const projectData = require('../../models/project');
const progressData = require('../../models/progress');

class studentController {
    async index(req, res) {
        try {
            const teacherId = req.session.teacher;
            // Fetch all approved students for this teacher
            let students = await studentData.find({ teacherId: teacherId, status: 'approved' });
            
            let data = [];
            for (let st of students) {
                const project = await projectData.findById(st.projectId);
                const progress = await progressData.findOne({ studentId: st._id });
                
                let percent = 0;
                let statusText = 'Đang thực hiện';
                let colorClass = 'text-yellow-600';
                let barColor = 'bg-blue-600';
                
                if (progress) {
                    percent = progress.precent || 0;
                    if (percent >= 100) {
                        statusText = 'Hoàn thành';
                        colorClass = 'text-green-600';
                        barColor = 'bg-green-600';
                    }
                }
                
                // Construct student data object including stringified payload for Modals
                data.push({
                    id: st._id.toString(),
                    fullName: st.fullName,
                    studentCode: st.studentCode,
                    studentEmail: st.studentEmail,
                    phone: st.phone,
                    projectName: project ? project.inputProject : 'Chưa có',
                    projectDesc: project ? project.contentProject : '',
                    projectTech: project ? project.technology : '',
                    percent: percent,
                    statusText: statusText,
                    colorClass: colorClass,
                    barColor: barColor
                });
            }

            res.render('teacher/student', {
                layout: 'teacher/main',
                active: 'student',
                data: data,
                figure: 'teacher',
            })
        }
        catch (err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
}

module.exports = new studentController
