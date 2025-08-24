const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('../config');

// Basic sensitive value redactor for logs
function redact(value) {
	if (!value) return value;
	const str = String(value);
	if (str.length <= 8) return '***';
	return str.slice(0, 4) + '…' + str.slice(-2);
}

const morganFormat = config.isProduction ? 'combined' : 'dev';

const morganRedactor = morgan(function (tokens, req, res) {
	// clone headers and sanitize
	const headers = { ...req.headers };
	if (headers.authorization) headers.authorization = 'Bearer ' + redact(headers.authorization.split(' ').pop());
	if (headers['x-api-key']) headers['x-api-key'] = redact(headers['x-api-key']);
	if (headers['x-client-version']) headers['x-client-version'] = headers['x-client-version'];
	return [
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens.res(req, res, 'content-length'), '-'
		+ tokens['response-time'](req, res), 'ms',
		JSON.stringify({ ip: req.ip, origin: req.headers.origin, headers })
	].join(' ');
});

function buildHelmet() {
	const directives = {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'", "'unsafe-inline'"],
		styleSrc: ["'self'", "'unsafe-inline'"],
		imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
		connectSrc: ["'self'", ...config.security.allowedOrigins],
		fontSrc: ["'self'", 'data:'],
		objectSrc: ["'none'"],
		baseUri: ["'self'"],
		frameAncestors: ["'none'"]
	};
	return helmet({
		contentSecurityPolicy: config.security.enableCsp ? { useDefaults: true, directives } : false,
		referrerPolicy: { policy: 'no-referrer' },
		xContentTypeOptions: true,
		xDnsPrefetchControl: true,
		xDownloadOptions: true,
		xFrameOptions: { action: 'deny' },
		hsts: config.security.enableHsts ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
		xPoweredBy: false,
		noSniff: true
	});
}

function buildCors() {
	return cors({
		origin: (origin, cb) => {
			if (!origin) return cb(null, true);
			if (config.security.allowedOrigins.includes(origin)) return cb(null, true);
			return cb(new Error('CORS blocked for origin'), false);
		},
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-API-Key', 'X-Client-Version'],
		exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining', 'X-OpenRouter-Model-Used']
	});
}

module.exports = {
	buildHelmet,
	buildCors,
	morganRedactor,
	morganFormat
};