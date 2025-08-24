const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');

router.use(authRequired);

router.get('/profile', async (req, res) => {
	return res.json({ ok: true, user: req.user });
});

module.exports = router;