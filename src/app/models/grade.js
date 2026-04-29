const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects',
    },
    // Điểm đề xuất
    proposedScore: {
        gvhd: { type: Number },
        gvpb: { type: Number }
    },
    // Nhận xét đề xuất
    proposedComment: {
        gvhd: { type: String, default: '' },
        gvpb: { type: String, default: '' }
    },
    // Điểm hội đồng (Chấm bởi 3-5 thành viên)
    councilScores: [{
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'teachers' },
        criteria: {
            content: { type: Number, default: 0 },      // Nội dung (40%)
            presentation: { type: Number, default: 0 }, // Hình thức & Thái độ (20%)
            qa: { type: Number, default: 0 }            // Phản biện (40%)
        },
        score: { type: Number }, // Tổng điểm của thành viên này
        comment: { type: String },
        submittedAt: { type: Date, default: Date.now }
    }],
    // Điểm tổng kết cuối cùng (thường là trung bình cộng)
    finalScore: {
        type: Number,
    },
    // Trạng thái khóa điểm
    isLocked: {
        type: Boolean,
        default: false
    },
    lockedAt: {
        type: Date
    },
    // Phê duyệt bởi Chủ tịch hội đồng
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers'
    },
    status: {
        type: String, 
        enum: ['pending', 'waiting_approval', 'approved', 'rejected'],
        default: 'pending'
    },
    // Thông tin biên bản bảo vệ (Thư ký ghi)
    defenseQuestions: [{
        question: { type: String },
        answer: { type: String },
        asker: { type: String } // Tên thành viên đặt câu hỏi
    }],
    defenseConclusion: {
        type: String,
        default: ''
    },
    secretaryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers'
    },
    periodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'period',
    },
    reviewerQuestions: {
        type: String,
        default: ''
    },
    // Ghi chú và Trạng thái Công bố của Admin
    isPublished: {
        type: Boolean,
        default: false
    },
    adminNote: {
        type: String,
        default: ''
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

const modelName = 'grades'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)