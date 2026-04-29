const studentData = require('../../models/student')
const scoreData = require('../../models/grade')

class pointController{
    async index(req,res) {
        try {
            // [MIGRATION] Chuẩn hóa chuyên ngành sinh viên cho HUMG (Khoa CNTT)
            await studentData.updateMany({ studentMajor: { $in: ["Kỹ thuật phần mềm", "Chưa cập nhật", "", null] } }, { studentMajor: "Công nghệ phần mềm" });
            await studentData.updateMany({ studentMajor: { $in: ["Khoa học dữ liệu", "An toàn thông tin", "Khoa học dữ liệu & AI"] } }, { studentMajor: "Khoa học máy tính" });
            await studentData.updateMany({ studentMajor: "Mạng máy tính và Truyền thông" }, { studentMajor: "Mạng máy tính" });

            const majors = [
                "Công nghệ phần mềm",
                "Mạng máy tính",
                "Khoa học máy tính",
                "Hệ thống thông tin",
                "Tin học kinh tế",
                "Địa tin học"
            ]

            res.render('admin/point', {
                layout: 'base',
                figure: 'admin',
                active: 'score',
                majors: majors
            })
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }

    // [GET] /admin/point/getScoreFeedback
    async getScoreFeedback(req, res) {
        try {
            const data = [];
            const students = await studentData.find().lean();
            
            for (const item of students) {
                const score = await scoreData.findOne({ studentId: item._id })
                    .populate('projectId', 'projectName')
                    .lean();

                if (!score) continue;

                // Tính điểm hội đồng trung bình và các tiêu chí
                let avgCouncil = 0;
                let avgContent = 0;
                let avgPresentation = 0;
                let avgQA = 0;

                if (score.councilScores && score.councilScores.length > 0) {
                    const count = score.councilScores.length;
                    const sums = score.councilScores.reduce((acc, s) => {
                        acc.total += (s.score || 0);
                        acc.content += (s.criteria?.content || 0);
                        acc.presentation += (s.criteria?.presentation || 0);
                        acc.qa += (s.criteria?.qa || 0);
                        return acc;
                    }, { total: 0, content: 0, presentation: 0, qa: 0 });

                    avgCouncil = (sums.total / count).toFixed(2);
                    avgContent = (sums.content / count).toFixed(2);
                    avgPresentation = (sums.presentation / count).toFixed(2);
                    avgQA = (sums.qa / count).toFixed(2);
                }

                data.push({
                    id: score._id,
                    fullName: item.fullName,
                    studentCode: item.studentCode || 'N/A',
                    studentMajor: item.studentMajor || 'Công nghệ phần mềm',
                    studentClass: item.studentClass || 'N/A',
                    studentEmail: item.studentEmail || '',
                    projectName: score.projectId ? score.projectId.projectName : 'N/A',
                    avgContent: avgContent,
                    avgPresentation: avgPresentation,
                    avgQA: avgQA,
                    councilScore: avgCouncil,
                    finalScore: score.finalScore || 0,
                    status: score.status,
                    isPublished: score.isPublished,
                    isLocked: score.isLocked
                });
            }
            return res.json(data);
        } catch (err) {
            console.error('getScoreFeedback Error:', err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [POST] /admin/point/updateScoreFeedback
    async updateScoreFeedback(req, res) {
        try {
            const { data } = req.body;
            for (const item of data) {
                await scoreData.findByIdAndUpdate(item.id, {
                    finalScore: item.finalScore,
                    adminNote: item.adminNote || '',
                    status: 'approved',
                    isLocked: true,
                    lockedAt: new Date()
                });
            }
            return res.json({ success: true, message: 'Cập nhật và phê duyệt điểm thành công' });
        } catch (err) {
            console.error('updateScoreFeedback Error:', err);
            res.status(500).json({ success: false });
        }
    }

    // [POST] /admin/point/api/publish
    async publishGrades(req, res) {
        try {
            const { ids } = req.body;
            await scoreData.updateMany(
                { _id: { $in: ids } },
                { isPublished: true }
            );
            res.json({ success: true, message: 'Công bố điểm thành công' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    // [GET] /admin/point/api/pending-submissions
    async getPendingSubmissions(req, res) {
        try {
            const pendingGrades = await scoreData.find({ status: 'waiting_approval' })
                .populate('studentId', 'fullName studentCode studentMajor studentClass')
                .populate('projectId', 'projectName')
                .lean();

            res.json(pendingGrades);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    // [POST] /admin/point/api/approve-submission
    async approveSubmission(req, res) {
        try {
            const { ids } = req.body;
            await scoreData.updateMany(
                { _id: { $in: ids } },
                { status: 'approved', lockedAt: new Date(), isLocked: true }
            );
            res.json({ success: true, message: 'Phê duyệt điểm thành công' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    // [POST] /admin/point/api/reject-submission
    async rejectSubmission(req, res) {
        try {
            const { ids, reason } = req.body;
            await scoreData.updateMany(
                { _id: { $in: ids } },
                { status: 'pending', adminNote: reason || 'Yêu cầu xem xét lại điểm' }
            );
            res.json({ success: true, message: 'Đã từ chối và gửi yêu cầu chỉnh sửa' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    // [GET] /admin/point/api/detail/:id
    async getGradeDetail(req, res) {
        try {
            const score = await scoreData.findById(req.params.id)
                .populate('studentId', 'fullName studentCode studentMajor studentClass')
                .populate('projectId', 'projectName')
                .populate({
                    path: 'councilScores.teacherId',
                    select: 'fullName'
                })
                .lean();
            
            if (!score) return res.status(404).json({ success: false });
            res.json(score);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }
}

module.exports = new pointController