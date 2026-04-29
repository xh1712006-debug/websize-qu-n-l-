const Period = require('../../models/period');
const Student = require('../../models/student');
const Teacher = require('../../models/teacher');
const Project = require('../../models/project');
const Grade = require('../../models/grade');
const Report = require('../../models/report');
const Assignment = require('../../models/assignment');
const Council = require('../../models/council');
const Progress = require('../../models/progress');
const Milestone = require('../../models/milestone');
const Feedback = require('../../models/feedback');
const RequirementStudent = require('../../models/requirementStudent');
const Notification = require('../../models/notification');
const Conversation = require('../../models/conversation');
const Requirement = require('../../models/requirement');

class periodController {
    // [GET] /admin/period
    async index(req, res) {
        try {
            const periods = await Period.find().sort({ createdAt: -1 });
            
            // Format periods for display
            const formattedPeriods = periods.map(p => ({
                ...p.toObject(),
                startDateStr: p.startDate ? p.startDate.toISOString().split('T')[0] : '',
                endDateStr: p.endDate ? p.endDate.toISOString().split('T')[0] : '',
                statusLabel: p.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng (Lưu trữ)',
                statusClass: p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }));

            res.render('admin/period', {
                layout: 'base',
                figure: 'admin',
                active: 'period',
                periods: formattedPeriods,
                title: 'Quản lý Đợt Bảo vệ'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    // HELPER: Thực hiện lưu trữ toàn bộ dữ liệu của đợt đang hoạt động
    archiveActivePeriod = async (id) => {
        // 2. Gán periodId và Snapshot thông tin sinh viên vào Đồ án (Lưu trữ)
        const activeProjects = await Project.find({ 
            $or: [
                { periodId: id },
                { periodId: { $exists: false } }
            ],
            statuss: 'active'
        }).populate('studentId');
        
        await Promise.all(activeProjects.map(async (p) => {
            const updateData = { periodId: id };
            
            // Nếu có studentId, thực hiện snapshot thông tin vào archivedStudentInfo của Project
            if (p.studentId) {
                updateData.archivedStudentInfo = {
                    fullName: p.studentId.fullName,
                    studentCode: p.studentId.studentCode,
                    studentClass: p.studentId.studentClass,
                    studentMajor: p.studentId.studentMajor
                };
            }
            
            // Xóa liên kết trực tiếp tới studentId và đánh dấu inactive để làm sạch dữ liệu cho đợt mới
            updateData.studentId = null;
            updateData.statuss = 'inactive';
            
            return Project.findByIdAndUpdate(p._id, updateData);
        }));

        // Snapshot thông tin sinh viên vào Bảng điểm (Lưu trữ)
        const activeGrades = await Grade.find({ periodId: { $exists: false } }).populate('studentId');
        
        await Promise.all(activeGrades.map(async (g) => {
            const updateData = { periodId: id };
            
            // Nếu có studentId, thực hiện snapshot thông tin vào archivedStudentInfo của Grade
            if (g.studentId) {
                updateData.archivedStudentInfo = {
                    fullName: g.studentId.fullName,
                    studentCode: g.studentId.studentCode,
                    studentClass: g.studentId.studentClass,
                    studentMajor: g.studentId.studentMajor
                };
            }
            
            return Grade.findByIdAndUpdate(g._id, updateData);
        }));

        // 3. Reset sinh viên (Làm mới trạng thái cho đợt sau)
        // Ghi nhận periodId cuối cùng cho sinh viên trước khi reset
        await Student.updateMany(
            { projectId: { $ne: null } }, 
            { periodId: id }
        );

        await Student.updateMany(
            {}, 
            {
                projectId: null,
                teacherId: null,
                status: null,
            }
        );

        // 4. Reset Giảng viên (Xóa các vai trò tạm thời trong đợt vừa đóng)
        await Teacher.updateMany({}, {
            $set: {
                councilPosition: null,
                'subRoles.isGVHD': false,
                'subRoles.isGVPB': false,
                'subRoles.isCouncil': false
            }
        });

        // 5. Reset Hội đồng và Đồ án
        await Promise.all([
            Council.deleteMany({}),
            Project.updateMany({}, {
                $set: {
                    councilId: null,
                    isCouncilApproved: false
                }
            }),
            // Xóa các dữ liệu hoạt động tạm thời của đợt vừa đóng (để tránh rác cho đợt sau)
            Assignment.deleteMany({}),
            Report.deleteMany({}),
            Progress.deleteMany({}),
            Milestone.deleteMany({}),
            Feedback.deleteMany({}),
            Conversation.deleteMany({}),
            RequirementStudent.deleteMany({}),
            Requirement.deleteMany({}),
            Notification.deleteMany({ type: { $ne: 'SYSTEM' } }) // Xóa thông báo trừ thông báo hệ thống quan trọng
        ]);

        // 6. Đóng đợt
        await Period.findByIdAndUpdate(id, { status: 'CLOSED' });
    }

    // [POST] /admin/period/store
    store = async (req, res) => {
        try {
            const { name, semester, year, startDate, description } = req.body;
            
            // Tự động tính toán ngày kết thúc = Ngày bắt đầu + 7 ngày
            const sDate = new Date(startDate);
            const eDate = new Date(sDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            // [FIX] Tìm đợt ACTIVE hiện tại để lưu trữ trước khi mở đợt mới
            const currentActive = await Period.findOne({ status: 'ACTIVE' });
            if (currentActive) {
                await this.archiveActivePeriod(currentActive._id);
            }

            const newPeriod = new Period({
                name,
                semester,
                year,
                startDate: sDate,
                endDate: eDate,
                description,
                status: 'ACTIVE'
            });

            await newPeriod.save();
            res.json({ success: true, message: 'Tạo đợt mới thành công! Hệ thống đã tự động lưu trữ dữ liệu đợt cũ.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
        }
    }

    // [POST] /admin/period/close/:id
    closePeriod = async (req, res) => {
        try {
            const { id } = req.params;
            const period = await Period.findById(id);
            if (!period) return res.json({ success: false, message: 'Không tìm thấy đợt bảo vệ!' });

            await this.archiveActivePeriod(id);

            res.json({ success: true, message: 'Đã đóng đợt và lưu trữ toàn bộ dữ liệu (bao gồm thông tin SV) thành công!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi hệ thống: ' + err.message });
        }
    }

    // [POST] /admin/period/update/:id
    update = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, semester, year, startDate, endDate, description, status } = req.body;

            const period = await Period.findById(id);
            if (!period) return res.json({ success: false, message: 'Không tìm thấy đợt!' });

            period.name = name;
            period.semester = semester;
            period.year = year;
            period.startDate = new Date(startDate);
            period.endDate = new Date(endDate);
            period.description = description;
            period.status = status;

            await period.save();
            res.json({ success: true, message: 'Cập nhật thành công!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
        }
    }

    // [POST] /admin/period/delete/:id
    destroy = async (req, res) => {
        try {
            const { id } = req.params;
            
            // 1. Tìm các đồ án thuộc đợt này để biết danh sách sinh viên, đồ án và hội đồng cần xóa
            const affectedProjects = await Project.find({ periodId: id });
            const projectIds = affectedProjects.map(p => p._id);
            const studentIds = affectedProjects.map(p => p.studentId);
            const councilIds = [...new Set(affectedProjects.map(p => p.councilId).filter(id => id))];

            // 2. Xoá sạch các dữ liệu hoạt động liên quan đến đợt này
            await Promise.all([
                Project.deleteMany({ periodId: id }),
                Grade.deleteMany({ periodId: id }),
                Council.deleteMany({ _id: { $in: councilIds } }),
                // Xoá các dữ liệu phụ thuộc thông qua ID đồ án
                Report.deleteMany({ projectId: { $in: projectIds } }),
                Assignment.deleteMany({ projectId: { $in: projectIds } }),
                Progress.deleteMany({ projectId: { $in: projectIds } }),
                Milestone.deleteMany({ projectId: { $in: projectIds } }),
                Feedback.deleteMany({ studentId: { $in: studentIds } }), // Feedback thường theo SV
                RequirementStudent.deleteMany({ studentId: { $in: studentIds } })
            ]);

            // 3. Reset trạng thái sinh viên để họ có thể tham gia đợt khác
            await Student.updateMany(
                { _id: { $in: studentIds } },
                {
                    $set: {
                        projectId: null,
                        teacherId: null,
                        status: null,
                        periodId: null
                    }
                }
            );

            // 4. Cuối cùng xoá bản ghi đợt bảo vệ
            await Period.findByIdAndDelete(id);

            res.json({ success: true, message: 'Đã xóa đợt bảo vệ và làm sạch toàn bộ dữ liệu liên quan thành công!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
        }
    }

    // [POST] /admin/period/system/reset
    // HÀNH ĐỘNG MẠNH: Tái thiết toàn bộ hệ thống (Factory Reset)
    systemReset = async (req, res) => {
        try {
            // 1. Làm sạch sinh viên
            await Student.updateMany({}, {
                $set: {
                    projectId: null,
                    teacherId: null,
                    status: null,
                    periodId: null
                }
            });

            // 2. Làm sạch giảng viên (Giữ lại isLeader theo yêu cầu)
            await Teacher.updateMany({}, {
                $set: {
                    councilPosition: null,
                    'subRoles.isGVHD': false,
                    'subRoles.isGVPB': false,
                    'subRoles.isCouncil': false
                }
            });

            // 3. Xoá sạch toàn bộ các bảng dữ liệu hoạt động và cấu hình đợt
            await Promise.all([
                Project.deleteMany({}),
                Grade.deleteMany({}),
                Report.deleteMany({}),
                Assignment.deleteMany({}),
                Council.deleteMany({}),
                Progress.deleteMany({}),
                Milestone.deleteMany({}),
                Feedback.deleteMany({}),
                RequirementStudent.deleteMany({}),
                Notification.deleteMany({}), // Xoá sạch thông báo cũ
                Period.deleteMany({})        // Xoá toàn bộ các đợt bảo vệ cũ để bắt đầu từ đầu
            ]);

            res.json({ 
                success: true, 
                message: 'Hệ thống đã được tái thiết hoàn toàn về trạng thái xuất xưởng. Mọi dữ liệu hoạt động đã được làm sạch!' 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi hệ thống khi Reset: ' + err.message });
        }
    }
}

module.exports = new periodController();
