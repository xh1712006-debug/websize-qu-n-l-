const express = require('express');
const router = express.Router();
const periodController = require('../../app/contraller/admin/period');

router.get('/', periodController.index);
router.post('/store', periodController.store);
router.post('/close/:id', periodController.closePeriod);
router.post('/update/:id', periodController.update);
router.post('/delete/:id', periodController.destroy);
router.post('/system/reset', periodController.systemReset);

module.exports = router;
