const client = require('prom-client');

client.collectDefaultMetrics();

const httpRequestDuration = new client.Histogram({
	name: 'http_request_duration_ms',
	help: 'Duration of HTTP requests in ms',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [50, 100, 200, 500, 1000, 2000, 5000]
});

function metricsMiddleware(req, res, next) {
	const start = Date.now();
	res.on('finish', () => {
		const duration = Date.now() - start;
		httpRequestDuration.labels(req.method, req.route?.path || req.path, String(res.statusCode)).observe(duration);
	});
	next();
}

async function metricsHandler(req, res) {
	try {
		res.set('Content-Type', client.register.contentType);
		res.end(await client.register.metrics());
	} catch (err) {
		res.status(500).end(err.message);
	}
}

module.exports = { metricsMiddleware, metricsHandler };