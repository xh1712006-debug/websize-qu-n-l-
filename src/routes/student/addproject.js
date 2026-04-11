const express = require('express')
const router = express.Router()
const addprojectController = require('../../app/controller/student/addproject')

router.get('/', addprojectController.index)
router.post('/', addprojectController.addProject)

module.exports = router
