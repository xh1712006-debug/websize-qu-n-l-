const express = require('express')
const router = express.Router()
const configController = require('../../app/contraller/admin/config')

router.get('/', configController.index)
router.post('/update', configController.updateConfig)
router.post('/unlockPoint', configController.unlockPoint)
router.get('/getGlobalProjects', configController.getGlobalProjects)
router.post('/updateGlobalSchedule', configController.updateGlobalSchedule)
router.get('/getStats', configController.getStats)

module.exports = router
