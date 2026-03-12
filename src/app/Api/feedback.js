const Feedback = require('../models/feedback')

class FeedbackData {
  async index(req, res) {
    try {
      const data = await Feedback.find()
      return res.json(data)   // 👈 trả dữ liệu ra trình duyệt
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi server' })
    }
  }
}

module.exports = new FeedbackData()
