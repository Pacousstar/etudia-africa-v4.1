// Centralized configuration for ÉtudIA backend
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Whitelist origins: prioritize env ALLOWED_ORIGINS (comma-separated), fallback to known list
const envAllowed = (process.env.ALLOWED_ORIGINS || '')
	.split(',')
	.map(o => o.trim())
	.filter(Boolean);

const defaultAllowed = [
	'http://localhost:3000',
	'http://localhost:3001',
	'http://localhost:3002',
	'http://127.0.0.1:3000',
	'https://etudia-africa.vercel.app',
	'https://etudia-v4.gsnexpertises.com',
	'https://etudia-africa-v4-frontend.vercel.app',
	'https://etudia-v4-1.vercel.app',
	'https://backoffice.etudia-africa.com',
	'https://parents.etudia-africa.com',
	'https://enseignants.etudia-africa.com',
	'https://etablissements.etudia-africa.com',
	'https://dren.etudia-africa.com',
	'https://partenaires.etudia-africa.com'
];

const allowedOrigins = envAllowed.length > 0 ? envAllowed : defaultAllowed;

const config = {
	isProduction,
	port: Number(process.env.PORT || 3001),
	jwt: {
		accessSecret: process.env.JWT_SECRET || 'change_me_access_secret',
		refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'change_me_refresh_secret',
		accessTtl: process.env.JWT_TTL || '15m',
		refreshTtl: process.env.REFRESH_TTL || '30d'
	},
	security: {
		allowedOrigins,
		enableHsts: isProduction,
		enableCsp: true
	},
	openRouter: {
		apiKey: process.env.OPENROUTER_API_KEY,
		baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
	}
};

module.exports = config;