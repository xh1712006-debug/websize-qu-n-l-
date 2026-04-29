const express = require('express');
const router = express.Router();
const logginController = require('../../app/contraller/accounts/loggin');

router.get('/', logginController.index);
router.post('/', logginController.send);
router.get('/logout', logginController.logout);

module.exports = router;