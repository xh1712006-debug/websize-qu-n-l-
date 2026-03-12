const teacher = require('../models/teacher')

class teacherData {
  async index(req, res) {
    try {
      const data = await teacher.find()
      return res.json(data)   // 👈 trả dữ liệu ra trình duyệt
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi server' })
    }
  }
}

module.exports = new teacherData()
