const Admin = require('../../models/admin');
const Project = require('../../models/project');

class AccountController {
    // [GET] /admin/account
    async index(req, res) {
        try {
            const adminId = req.session.admin;
            const admin = await Admin.findById(adminId).populate({
                path: 'savedProjects',
                populate: { path: 'teacherId' }
            });

            res.render('admin/account', {
                layout: 'base',
                figure: 'admin',
                active: 'admin/account',
                admin: admin.toObject(),
                title: 'Hồ sơ Quản trị viên'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    // [POST] /admin/account/save-project/:id
    async saveProject(req, res) {
        try {
            const adminId = req.session.admin;
            const projectId = req.params.id;

            await Admin.findByIdAndUpdate(adminId, {
                $addToSet: { savedProjects: projectId }
            });

            res.json({ success: true, message: 'Đã lưu đồ án vào hồ sơ' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [POST] /admin/account/unsave-project/:id
    async unsaveProject(req, res) {
        try {
            const adminId = req.session.admin;
            const projectId = req.params.id;

            await Admin.findByIdAndUpdate(adminId, {
                $pull: { savedProjects: projectId }
            });

            res.json({ success: true, message: 'Đã xóa khỏi danh sách lưu' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new AccountController();
