const contentTeacher = require('../../models/teacher')

class teacherController{
    async index(req,res) {
        try {
            // [MIGRATION] Thiết kế lại chuyên ngành cho GV theo chuẩn Khoa CNTT - HUMG
            await contentTeacher.updateMany({ teacherMajor: { $in: ["Kỹ thuật phần mềm", "Chưa cập nhật", "", null] } }, { teacherMajor: "Công nghệ phần mềm" });
            await contentTeacher.updateMany({ teacherMajor: { $in: ["Khoa học dữ liệu", "An toàn thông tin", "Khoa học dữ liệu & AI"] } }, { teacherMajor: "Khoa học máy tính" });
            await contentTeacher.updateMany({ teacherMajor: "Mạng máy tính và Truyền thông" }, { teacherMajor: "Mạng máy tính" });

            const majors = [
                "Công nghệ phần mềm",
                "Mạng máy tính",
                "Khoa học máy tính",
                "Hệ thống thông tin",
                "Tin học kinh tế",
                "Địa tin học"
            ]

            res.render('admin/teachers/teacher', {
                layout: 'base',
                figure: 'admin',
                active: 'teacher',
                majors: majors
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    async addTeacher(req,res) {
        try{
            res.render('admin/teachers/addTeacher', {
                layout: 'base',
                figure: 'admin',
                active: 'teacher'
            })
            
        }
        catch(err){
                res.status(500).send('loi')
            }
    }

    async getTeachers(req,res) {
        try{
            const teachers = await contentTeacher.find()
            return res.json(teachers)
        }
        catch(err){
            res.status(500).send('loi')
        }
    }

    // [POST] /admin/teacher/create
    async createTeacher(req, res) {
        try {
            const { fullName, teacherEmail, teacherCode, teacherPhone, teacherDegree, teacherMajor } = req.body
            
            const existing = await contentTeacher.findOne({ $or: [{ teacherCode }, { teacherEmail }] })
            if (existing) return res.json({ success: false, message: 'Mã GV hoặc Email đã tồn tại!' })

            const newTeacher = new contentTeacher({
                fullName,
                teacherEmail,
                teacherCode,
                teacherPhone,
                teacherDegree,
                teacherMajor,
                teacherRole: 'Teacher',
                subRoles: { isLeader: false, isGVHD: true, isGVPB: true, isCouncil: false },
                status: 'active'
            })
            await newTeacher.save()

            res.json({ success: true, message: 'Thêm giảng viên mới thành công!' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /admin/teacher/update/:id
    async updateTeacher(req, res) {
        try {
            const { id } = req.params
            const { 
                fullName, teacherEmail, teacherPhone, teacherDegree, 
                teacherMajor, teacherRole, subRoles, councilPosition 
            } = req.body

            const teacher = await contentTeacher.findById(id)
            if (!teacher) return res.json({ success: false, message: 'Không tìm thấy giảng viên!' })

            // Chỉ cập nhật các trường có trong body (tránh ghi đè undefined)
            if (fullName !== undefined)      teacher.fullName = fullName
            if (teacherEmail !== undefined)  teacher.teacherEmail = teacherEmail
            if (teacherPhone !== undefined)  teacher.teacherPhone = teacherPhone
            if (teacherDegree !== undefined) teacher.teacherDegree = teacherDegree
            if (teacherMajor !== undefined)  teacher.teacherMajor = teacherMajor
            if (teacherRole !== undefined)   teacher.teacherRole = teacherRole
            
            // Cập nhật phân quyền phụ (nếu có)
            if (subRoles) {
                teacher.subRoles = {
                    isLeader:  subRoles.isLeader  === true || subRoles.isLeader  === 'true',
                    isGVHD:    subRoles.isGVHD    === true || subRoles.isGVHD    === 'true',
                    isGVPB:    subRoles.isGVPB    === true || subRoles.isGVPB    === 'true',
                    isCouncil: subRoles.isCouncil === true || subRoles.isCouncil === 'true'
                }
            }

            // Cập nhật vị trí hội đồng (nếu có trong body)
            if (councilPosition !== undefined) {
                teacher.councilPosition = councilPosition || null
            }
            
            await teacher.save()
            res.json({ success: true, message: 'Cập nhật thành công!' })
        } catch (err) {
            console.error('Update Teacher Error:', err)
            res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message })
        }
    }

    // [DELETE] /admin/teacher/:id
    async deleteTeacher(req, res) {
        try {
            const { id } = req.params
            
            // 1. Kiểm tra vai trò Hướng dẫn (Advisor)
            const isGuiding = await require('../../models/student').findOne({ teacherId: id })
            if (isGuiding) {
                return res.json({ success: false, message: 'Không thể xóa giảng viên đang HƯỚNG DẪN đồ án. Vui lòng chuyển hướng dẫn trước!' })
            }

            // 2. Kiểm tra vai trò Phản biện (Reviewer)
            const isReviewing = await require('../../models/project').findOne({ teacherFeedbackId: id, statuss: 'active' })
            if (isReviewing) {
                return res.json({ success: false, message: 'Giảng viên đang trong danh sách PHẢN BIỆN của ít nhất một đồ án. Vui lòng thay đổi GV phản biện trước!' })
            }

            // 3. Kiểm tra vai trò Hội đồng (Council Member)
            const isMemberOfCouncil = await require('../../models/council').findOne({
                $or: [{ chairmanId: id }, { secretaryId: id }, { memberIds: id }],
                status: 'active'
            })
            if (isMemberOfCouncil) {
                return res.json({ success: false, message: 'Giảng viên đang là thành viên của một HỘI ĐỒNG bảo vệ đang hoạt động. Vui lòng cập nhật hội đồng trước!' })
            }

            // 4. Thực hiện xóa và dọn dẹp dữ liệu phụ trợ
            await Promise.all([
                require('../../models/notification').deleteMany({ receiverId: id }),
                contentTeacher.findByIdAndDelete(id)
            ])

            res.json({ success: true, message: 'Đã xóa giảng viên và dọn dẹp thông báo liên quan thành công!' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server khi xóa giảng viên: ' + err.message })
        }
    }
}

module.exports = new teacherController
