const express = require('express');
const router = express.Router();
const accountController = require('../../app/contraller/admin/account');

router.get('/', accountController.index);
router.post('/save-project/:id', accountController.saveProject);
router.post('/unsave-project/:id', accountController.unsaveProject);

module.exports = router;
