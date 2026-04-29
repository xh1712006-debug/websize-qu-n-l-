<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const logginController = require('../../app/contraller/accounts/loggin');

router.get('/', logginController.index);
router.post('/', logginController.send);
router.get('/logout', logginController.logout);

module.exports = router;
=======
const express = require('express')
const router = express.Router()
const logginRouter = require('../../app/controller/accounts/loggin')

router.get('/', logginRouter.index)
router.post('/', logginRouter.send)
router.post('/sendTeacher', logginRouter.sendTeacher)
router.get('/logout', logginRouter.logout)

module.exports = router;
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
