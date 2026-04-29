const content_admin = require('../../models/admin')
const projectAdmin = require('../../models/project')
const studentData = require('../../models/student')
const progressData = require('../../models/progress')
const requirementStudentData = require('../../models/requirementStudent')
const requirementData = require('../../models/requirement')
const scoreData = require('../../models/grade')
const reportData = require('../../models/report')
const assignmentData = require('../../models/assignment')
const feedbackData = require('../../models/feedback')
const aconversationData = require('../../models/conversation')

class projectController{
    async index(req,res) {
        try {
            // [MIGRATION] Thiết kế lại chuyên ngành cho Đồ án theo chuẩn Khoa CNTT - HUMG
            await projectAdmin.updateMany({ major: { $in: ["Kỹ thuật phần mềm", "Chưa cập nhật", "", null] } }, { major: "Công nghệ phần mềm" });
            await projectAdmin.updateMany({ major: { $in: ["Khoa học dữ liệu", "An toàn thông tin", "Khoa học dữ liệu & AI"] } }, { major: "Khoa học máy tính" });
            await projectAdmin.updateMany({ major: "Mạng máy tính và Truyền thông" }, { major: "Mạng máy tính" });

            const majors = [
                "Công nghệ phần mềm",
                "Mạng máy tính",
                "Khoa học máy tính",
                "Hệ thống thông tin",
                "Tin học kinh tế",
                "Địa tin học"
            ]

            res.render('admin/project/index', {
                layout: 'base',
                figure: 'admin',
                active: 'project',
                majors: majors
            })
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async create(req, res) {
        try{
            res.render('admin/project/create', {
                layout: 'base',
                figure: 'admin',
                active: 'project'
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }

    // [GET] /admin/project/getProjects
    async getProjects(req, res) {
        try {
            // Chỉ lấy các đồ án đang hoạt động (chưa gán vào đợt lưu trữ)
            const projects = await projectAdmin.find({ periodId: { $exists: false } }).sort({ createdAt: -1 })
            const Student = require('../../models/student')
            const result = await Promise.all(projects.map(async (p) => {
                // Đếm số SV đang đăng ký đồ án này
                const registeredCount = await Student.countDocuments({ projectId: p._id })
                return {
                    _id: p._id,
                    inputProject: p.inputProject || 'Chưa đặt tên',
                    teacherInstruct: p.teacherInstruct || '--',
                    teacherFeedbackName: p.teacherFeedbackName || '--',
                    numberStudent: p.numberStudent || 1,
                    numberSubmit: registeredCount,
                    statuss: p.statuss || 'open',
                    technology: p.technology || [],
                    date: p.date
                }
            }))
            res.json(result)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    async createProject(req, res){
        try {
            const inputProject = req.body.inputProject
            const contentProject = req.body.contentProject
            const teacherInstruct = req.body.teacherInstruct
            const teacherFeedbackName = req.body.teacherFeedbackName
            const date = req.body.date
            const statuss = req.body.statuss
            const requirement = req.body.requirement
            const technology = req.body.technology
            const numberStudent = req.body.numberStudent 
            const id = req.body.id
            const teacherFeedbackId = req.body.teacherFeedbackId

            console.log('teacherFeedbackId: ', teacherFeedbackId)

            const technologyList = technology.split()
            console.log('requirement: ', requirement)

            const Teacher = require('../../models/teacher')
            const teacher = await Teacher.findById(id)
            const major = teacher ? teacher.teacherMajor : null

            const Period = require('../../models/period')
            const activePeriod = await Period.findOne({ status: 'ACTIVE' })

            const newProject = new projectAdmin({
                inputProject: inputProject,
                contentProject: contentProject,
                teacherInstruct: teacherInstruct,
                date: date,
                statuss: statuss,
                major: major, 
                numberStudent: numberStudent,
                teacherId: id,
                numberSubmit: 0,
                technology: technologyList,
                teacherFeedbackId: teacherFeedbackId,
                teacherFeedbackName: teacherFeedbackName,
                periodId: activePeriod ? activePeriod._id : null // [NEW] Gán mã đợt hiện tại
            })


            requirement.forEach(item => {
                const newRequirement = new requirementData({
                    projectId: newProject._id,
                    name: item,
                    status: 'Fall',
                })
                newRequirement.save()
            });
            
            await newProject.save()
           
            console.log('newProject: ', newProject)
            return res.status(201).json({
                message: 'Tạo project thành công',
                data: newProject
            })
        }
        catch(err){
            console.log(err)
            res.status(500).json({ success: false, error: 'Server error' })
        }
    }

    async deleteProject(req, res){
        try{
            console.log(req.params)
            console.log('id của body cần tim là:', req.params.id)
            const idProject = req.params.id
            const student = await studentData.updateMany(
                {
                    projectId: idProject,
                },
                {
                    teacherId: null,
                    projectId: null,
                    status: null,
                }
            )
            const requirement = await requirementData.deleteMany({
                projectId: idProject,
            })
            const requirementStudent = await requirementStudentData.deleteMany({
                projectId: idProject,
            })

            const project = await projectAdmin.findByIdAndDelete(idProject)
            
            res.json({ message: "Xoá thành công" })

        }
        catch(err) {
            console.log(err)
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi xoá" })
        }
    }

    async listStudent(req, res) {
        try{
            res.render('admin/project/listStudent', {
                layout: 'base',
                figure: 'admin',
                active: 'project/listStudent'
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async fixStudent(req, res) {
        try{
            res.render('admin/project/fixStudent', {
                layout: 'base',
                figure: 'admin',
                active: 'project/fixStudent'
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async getFixStudent(req, res) {
        try{
            const id = req.body.id
            const project = projectAdmin.findById({
                id: id
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async putFixStudent(req, res) {
        try{
            const inputProject = req.body.inputProject
            const contentProject = req.body.contentProject
            const teacherInstruct = req.body.teacherInstruct
            const numberStudent = req.body.numberStudent
            const date = req.body.date
            const statuss = req.body.statuss
            const id = req.params.id

            console.log(id)
            const project = await projectAdmin.findById(id)

            project.inputProject = inputProject
            project.contentProject = contentProject
            project.teacherInstruct = teacherInstruct
            project.numberStudent = numberStudent
            project.statuss = statuss
            project.date = new Date(date)

            // [FIX] Cập nhật lại major nếu thay đổi GVHD (giả sử teacherInstruct đổi)
            // Tuy nhiên trong code này teacherId chưa được cập nhật ở đây
            // Tôi sẽ giữ nguyên major cũ hoặc bạn có thể bổ sung update teacherId tại đây
            
            await project.save()
            console.log('đổi thành công')
            
        }
        catch(err){
            console.log(err)
            res.status(500).send('loi')
        }
        
    }

    async viewStudent(req, res) {
        try{
            res.render('admin/project/viewStudent', {
                layout: 'base',
                figure: 'admin',
                active: 'project/viewStudent'
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async getListViewStudent(req, res){
        try{
            const projectId = req.query.projectId
            console.log('projectId: ', projectId)
            const student = await studentData.find({
                projectId: projectId,
            })
            console.log(student)
            res.json(student)
        }
        catch(err){
            res.status(500).send('loi')
        }
    }

<<<<<<< HEAD:src/app/contraller/admin/project.js
    // [GET] /admin/project/getGvpbs
    async getGvpbs(req, res) {
        try {
            const Teacher = require('../../models/teacher')
            const gvpbs = await Teacher.find({ 'subRoles.isGVPB': true }, 'fullName _id')
            res.json(gvpbs)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /admin/project/assignReviewer
    async assignReviewer(req, res) {
        try {
            const { projectId, teacherId } = req.body
            const Teacher = require('../../models/teacher')
            const projectModel = require('../../models/project')
            const assignmentModel = require('../../models/assignment')

            const project = await projectModel.findById(projectId)
            if (!project) return res.json({ success: false, message: 'Không tìm thấy đồ án' })

            // Xóa phân công cũ nếu có (Admin gán cho đồ án, nên xóa dựa trên projectId và role reviewer)
            await assignmentModel.deleteMany({ projectId, role: 'reviewer' })

            if (teacherId) {
                const teacher = await Teacher.findById(teacherId)
                if (!teacher) return res.json({ success: false, message: 'Không tìm thấy giảng viên' })

                // Gán cho tất cả sinh viên đang thuộc đồ án này
                const students = await require('../../models/student').find({ projectId: projectId })
                for (const student of students) {
                    const newAssign = new assignmentModel({
                        studentId: student._id,
                        projectId: projectId,
                        teacherId: teacherId,
                        role: 'reviewer'
                    })
                    await newAssign.save()
                }

                // Cập nhật thông tin nhanh trong project model
                project.teacherFeedbackId = teacherId
                project.teacherFeedbackName = teacher.fullName
                await project.save()
            } else {
                project.teacherFeedbackId = null
                project.teacherFeedbackName = null
                await project.save()
            }

            res.json({ success: true, message: 'Cập nhật giáo viên phản biện thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

=======
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/admin/project.js
}

module.exports = new projectController
