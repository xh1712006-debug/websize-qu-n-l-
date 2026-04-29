const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Period = require('../../models/period');
const Project = require('../../models/project');
const Grade = require('../../models/grade');
const Student = require('../../models/student');

const logPath = path.join(__dirname, '../../../logs/archive_error.log');

const writeLog = (msg) => {
    try {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        console.error('Failed to write log:', e);
    }
};

class archiveController {
    // [GET] /admin/archive
    index = async (req, res) => {
        try {
            const periods = await Period.find({ status: 'CLOSED' }).sort({ createdAt: -1 });
            
            const formattedPeriods = periods.map(p => ({
                ...p.toObject(),
                dateRange: `${p.startDate ? p.startDate.toLocaleDateString('vi-VN') : ''} - ${p.endDate ? p.endDate.toLocaleDateString('vi-VN') : ''}`
            }));

            res.render('admin/archive/index', {
                layout: 'base',
                figure: 'admin',
                active: 'archive',
                periods: formattedPeriods,
                title: 'Lưu trữ Đồ án'
            });
        } catch (err) {
            writeLog(`Index Error: ${err.message}`);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    // [GET] /admin/archive/period/:id
    viewDetail = async (req, res) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                writeLog(`Detail Error: Invalid ID ${id}`);
                return res.redirect('/admin/archive');
            }

            // Sử dụng .lean() để Handlebars có thể truy cập thuộc tính của Object
            const period = await Period.findById(id).lean();
            if (!period) {
                writeLog(`Detail Error: Period not found ${id}`);
                return res.redirect('/admin/archive');
            }

            const majors = [
                "Công nghệ phần mềm",
                "Mạng máy tính",
                "Khoa học máy tính",
                "Hệ thống thông tin",
                "Tin học kinh tế",
                "Địa tin học"
            ];

            res.render('admin/archive/detail', {
                layout: 'base',
                figure: 'admin',
                active: 'archive',
                period: period,
                majors: majors,
                title: `Lưu trữ: ${period.name}`
            });
        } catch (err) {
            writeLog(`Detail Error: ${err.message}`);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    // [GET] /admin/archive/api/projects/:periodId
    getArchivedProjects = async (req, res) => {
        writeLog(`API Called for periodId: ${req.params.periodId}`);
        try {
            const { periodId } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(periodId)) {
                writeLog(`API Error: Invalid periodId format ${periodId}`);
                return res.status(400).json({ success: false, message: 'Mã đợt bảo vệ không đúng định dạng' });
            }

            // Chỉ lấy các đồ án đã được GVHD duyệt
            const projects = await Project.find({ 
                periodId: new mongoose.Types.ObjectId(periodId),
                isAdvisorApproved: true
            }).lean();
            writeLog(`Found ${projects.length} projects for periodId ${periodId}`);

            const results = await Promise.all(projects.map(async (prj) => {
                try {
                    const grades = await Grade.find({ 
                        projectId: prj._id,
                        periodId: new mongoose.Types.ObjectId(periodId)
                    }).populate('studentId').lean();

                    let studentList = [];

                    if (grades && grades.length > 0) {
                        studentList = grades.map(g => {
                            let displayScore = 'Chưa có';
                            let badgeClass = 'bg-slate-100 text-slate-600'; 
                            
                            if (g.isPublished && g.finalScore) {
                                displayScore = g.finalScore;
                                badgeClass = 'bg-emerald-100 text-emerald-700'; 
                            } else {
                                displayScore = 'Không đạt / Trượt';
                                badgeClass = 'bg-rose-100 text-rose-700 font-bold'; 
                            }

                            if (g.archivedStudentInfo) {
                                return {
                                    ...g.archivedStudentInfo,
                                    finalScore: displayScore,
                                    badgeClass: badgeClass
                                };
                            }

                            return {
                                fullName: (g.studentId && g.studentId.fullName) ? g.studentId.fullName : 'N/A',
                                studentCode: (g.studentId && g.studentId.studentCode) ? g.studentId.studentCode : 'N/A',
                                studentClass: (g.studentId && g.studentId.studentClass) ? g.studentId.studentClass : 'N/A',
                                studentMajor: (g.studentId && g.studentId.studentMajor) ? g.studentId.studentMajor : 'N/A',
                                finalScore: displayScore,
                                badgeClass: badgeClass
                            };
                        });
                    } else {
                        let statusLabel = 'Không đạt / Trượt';
                        let badgeClass = 'bg-rose-50 text-rose-400';

                        if (prj.status === 'DEFENDED' || prj.status === 'COMPLETED') {
                            statusLabel = 'Đã bảo vệ / Chưa có điểm';
                            badgeClass = 'bg-blue-50 text-blue-500 font-medium';
                        } else if (prj.isAdvisorApproved && prj.isReviewerApproved) {
                            statusLabel = 'Đủ ĐK Bảo vệ / Chưa có điểm';
                            badgeClass = 'bg-emerald-50 text-emerald-500 font-medium';
                        } else if (prj.isAdvisorApproved) {
                            statusLabel = 'Chờ phản biện / Trượt PB';
                            badgeClass = 'bg-amber-50 text-amber-500 font-medium';
                        }

                        if (prj.archivedStudentInfo) {
                            studentList.push({
                                ...prj.archivedStudentInfo,
                                finalScore: statusLabel,
                                badgeClass: badgeClass
                            });
                        } else if (prj.studentId) {
                            try {
                                const st = await Student.findById(prj.studentId).lean();
                                if (st) {
                                    studentList.push({
                                        fullName: st.fullName || 'N/A',
                                        studentCode: st.studentCode || 'N/A',
                                        studentClass: st.studentClass || 'N/A',
                                        studentMajor: st.studentMajor || 'N/A',
                                        finalScore: statusLabel + ' (Dữ liệu cũ)',
                                        badgeClass: badgeClass + ' opacity-70'
                                    });
                                }
                            } catch (e) {
                                writeLog(`Student Fallback Error for ${prj.studentId}: ${e.message}`);
                            }
                        }
                    }

                    return {
                        ...prj,
                        students: studentList
                    };
                } catch (e) {
                    writeLog(`Project Mapping Error for ${prj._id}: ${e.message}`);
                    return { ...prj, students: [] };
                }
            }));

            res.json(results);
        } catch (err) {
            writeLog(`CRITICAL API ERROR: ${err.message}`);
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new archiveController();
