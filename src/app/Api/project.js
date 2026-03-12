const project = require('../models/project')

class projectData {
  async index(req, res) {
    try {
      const data = await project.find()
      return res.json(data)   // 👈 trả dữ liệu ra trình duyệt
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi server' })
    }
  }
  async getApiId(req, res) {
    try {
      const id = req.params.id
      const data = await project.findById(id)
      return res.json(data)   // 👈 trả dữ liệu ra trình duyệt
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi server' })
    }
  }
}

module.exports = new projectData()
