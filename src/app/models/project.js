const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
    },
    teacherFeedbackId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
        required: true,
    },
    teacherFeedbackName: {
        type: String,
    },
    inputProject: {
        type: String,
    },
    contentProject: {
        type: String,
    },
    objective: { // [NEW] Mục tiêu
        type: String,
    },
    scope: { // [NEW] Phạm vi
        type: String,
    },
    teacherInstruct: {
        type: String,
    },
    date: {
        type: Date,
    },
    statuss: {
        type: String, // 'active' or 'inactive' for system filtering
        default: 'active'
    },
    major: { // [NEW] Chuyên ngành của đồ án
        type: String,
    },
    status: {
        type: String,
        enum: [
            'REGISTERED',       // Mới đăng ký
            'WAITING_ADVISOR',  // Chờ GVHD duyệt
            'WAITING_STUDENT_CONFIRM', // [NEW] Chờ SV xác nhận thay đổi từ GV
            'WAITING_LEADER',   // Chờ BM duyệt
            'WAITING_ADMIN',    // Chờ Admin chốt đợt
            'ONGOING',          // Đang thực hiện
            'ELIGIBLE_ADVISOR', // Đủ điều kiện (GVHD chốt)
            'WAITING_REVIEWER', // Chờ phản biện
            'ELIGIBLE_DEFENSE', // Đủ bảo vệ (GVPB chốt)
            'DEFENDED',         // Đã bảo vệ
            'COMPLETED',        // Hoàn thành
            'REJECTED',         // Bị từ chối
            'FAILED_PROGRESS',  // Không đủ điều kiện (tuần 10)
            'FAILED_REVIEW'     // Không đạt phản biến
        ],
        default: 'REGISTERED'
    },
    isAdvisorApproved: {
        type: Boolean,
        default: false
    },
    isReviewerApproved: {
        type: Boolean,
        default: false
    },
    isLeaderApproved: { // [NEW] Đánh dấu LĐBM đã duyệt
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    numberStudent: {
        type: Number,
    },
    numberSubmit: {
        type: Number,
    },
    rejectionReason: { // [NEW] Lý do từ chối
        type: String,
    },
    technology: {
        type: [String],
    },
    expectedOutcome: { // [NEW] Kết quả dự kiến
        type: String,
    },
    // Lịch bảo vệ
    defenseDate: {
        type: Date,
    },
    defenseRoom: {
        type: String,
    },
    defenseTime: {
        type: String, // Ví dụ: "08:00", "14:30"
    },
    councilId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'councils',
    },
    periodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'period',
    },
    archivedStudentInfo: {
        fullName: String,
        studentCode: String,
        studentClass: String,
        studentMajor: String
    }
}, {
    timestamps: true,
})

const modelName = 'projects'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)