const express = require('express');
const router = express.Router();
const { signAccessToken, signRefreshToken, hashPassword, comparePassword } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post('/register', async (req, res) => {
	try {
		const { nom, email, password, classe } = req.body || {};
		if (!nom || !email || !password || !classe) return res.status(400).json({ error: 'nom, email, password, classe requis' });
		const cleanEmail = email.toLowerCase().trim();
		const passwordHash = await hashPassword(password);
		const { data, error } = await supabase.from('eleves').insert([{
			nom,
			email: cleanEmail,
			classe,
			password_hash: passwordHash,
			date_inscription: new Date().toISOString(),
			derniere_activite: new Date().toISOString(),
			statut: 'actif'
		}]).select('*').single();
		if (error) return res.status(400).json({ error: error.message });
		const access = signAccessToken({ sub: data.id, role: 'student' });
		const refresh = signRefreshToken({ sub: data.id, role: 'student' });
		return res.status(201).json({ user: { id: data.id, nom: data.nom, email: data.email }, access_token: access, refresh_token: refresh });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) return res.status(400).json({ error: 'email et password requis' });
		const cleanEmail = email.toLowerCase().trim();
		const { data: user, error } = await supabase.from('eleves').select('*').eq('email', cleanEmail).single();
		if (error || !user || !user.password_hash) return res.status(401).json({ error: 'Identifiants invalides' });
		const ok = await comparePassword(password, user.password_hash);
		if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
		const access = signAccessToken({ sub: user.id, role: 'student' });
		const refresh = signRefreshToken({ sub: user.id, role: 'student' });
		return res.json({ access_token: access, refresh_token: refresh });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
});

router.post('/refresh', async (req, res) => {
	try {
		const token = req.body?.refresh_token;
		if (!token) return res.status(400).json({ error: 'refresh_token requis' });
		const { verifyRefreshToken } = require('../middleware/auth');
		const decoded = verifyRefreshToken(token);
		const access = signAccessToken({ sub: decoded.sub, role: decoded.role });
		return res.json({ access_token: access });
	} catch (err) {
		return res.status(401).json({ error: 'Refresh token invalide' });
	}
});

module.exports = router;