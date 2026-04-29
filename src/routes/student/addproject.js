const express = require('express')
const router = express.Router()
const addprojectController = require('../../app/contraller/student/addproject')

router.get('/', addprojectController.index)
router.post('/', addprojectController.addProject)
router.post('/reset', addprojectController.resetProject)

module.exports = router
