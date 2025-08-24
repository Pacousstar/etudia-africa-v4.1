const request = require('supertest');
const { app } = require('../server');

describe('Health and Metrics', () => {
	it('GET /health returns 200 or 503 with JSON', async () => {
		const res = await request(app).get('/health');
		expect([200,503]).toContain(res.status);
		expect(res.headers['content-type']).toMatch(/json/);
		expect(res.body).toHaveProperty('status');
	});

	it('GET /metrics returns prometheus text', async () => {
		const res = await request(app).get('/metrics');
		expect(res.status).toBe(200);
		expect(res.headers['content-type']).toMatch(/text\/plain/);
		expect(res.text).toMatch(/http_request_duration_ms/);
	});
});