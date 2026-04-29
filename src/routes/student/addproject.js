const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const addprojectController = require('../../app/contraller/student/addproject')

router.get('/', addprojectController.index)
router.post('/', addprojectController.addProject)
router.post('/reset', addprojectController.resetProject)
=======
const addprojectController = require('../../app/controller/student/addproject')

router.get('/', addprojectController.index)
router.post('/', addprojectController.addProject)
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26

module.exports = router
