const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

function signAccessToken(payload) {
	return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl, algorithm: 'HS256' });
}

function signRefreshToken(payload) {
	return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl, algorithm: 'HS256' });
}

function verifyAccessToken(token) {
	return jwt.verify(token, config.jwt.accessSecret, { algorithms: ['HS256'] });
}

function verifyRefreshToken(token) {
	return jwt.verify(token, config.jwt.refreshSecret, { algorithms: ['HS256'] });
}

async function hashPassword(plain) {
	const saltRounds = 12;
	return bcrypt.hash(plain, saltRounds);
}

async function comparePassword(plain, hash) {
	return bcrypt.compare(plain, hash);
}

function authRequired(req, res, next) {
	try {
		const header = req.get('Authorization') || '';
		const parts = header.split(' ');
		if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });
		const token = parts[1];
		const decoded = verifyAccessToken(token);
		req.user = { id: decoded.sub, role: decoded.role };
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

module.exports = {
	signAccessToken,
	signRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	authRequired,
	hashPassword,
	comparePassword
};