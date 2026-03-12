const student = require('../models/student')

class studentData {
  async index(req, res) {
    try {
      // Return all students - in production, consider filtering by logged-in user
      const data = await student.find()
      return res.json(data)   // 👈 trả dữ liệu ra trình duyệt
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi server' })
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params
      const data = await student.findById(id)
      if (!data) {
        return res.status(404).json({ message: 'Không tìm thấy sinh viên' })
      }
      return res.json(data)
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi server' })
    }
  }
}

module.exports = new studentData()
