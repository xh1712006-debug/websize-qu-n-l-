const Report = require('../models/report')

class ReportData {
  async index(req, res) {
    try {
      const data = await Report.find()
      return res.json(data)   // 👈 trả dữ liệu ra trình duyệt
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi server' })
    }
  }
}

module.exports = new ReportData()
