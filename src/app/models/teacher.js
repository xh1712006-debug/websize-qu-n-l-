const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    teacherCode: {
        type: 'String',
        unique: true
    },
    fullName: {
        type: 'String'
    },
    teacherEmail: {
        type: 'String',
        unique: true
    },
    teacherPhone: {
        type: 'String'
    },
    // Vai trò chính (Teacher)
    teacherRole: {
        type: 'String',
        default: 'Teacher'
    },
    // Vai trò nghiệp vụ đa nhiệm
    subRoles: {
        isLeader: { type: Boolean, default: false },
        isGVHD: { type: Boolean, default: false },
        isGVPB: { type: Boolean, default: false },
        isCouncil: { type: Boolean, default: false }
    },
    // Thông tin hội đồng (nếu thuộc hội đồng)
    councilPosition: {
        type: String, // 'Chairman' (Chủ tịch), 'Secretary' (Thư ký), 'Member' (Thành viên)
        enum: ['Chairman', 'Secretary', 'Member', null],
        default: null
    },
    teacherMajor: { // Chuyên ngành quản lý/phụ trách
        type: 'String'
    },
    teacherDepartment: { // Đơn vị công tác/Bộ môn
        type: 'String'
    },
    teacherDegree: {
        type: 'String'
    },
    teacherAvatar: {
        type: 'String'
    },
    status: {
        type: 'String',
        default: 'active'
    },
<<<<<<< HEAD
    isMicrosoft: {
        type: Boolean,
        default: false
    }
=======
    password: {
        type: 'String'
    },
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26

}, {
    timestamps: true,
})

const modelName = 'teachers'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)
