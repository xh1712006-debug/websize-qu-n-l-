const express = require('express');
const router = express.Router();
const scheduleController = require('../../app/contraller/teacher/scheduleController');

router.get('/', scheduleController.index);

module.exports = router;
