import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Example endpoint for sessions list (mock)
app.get('/api/sessions', (_req, res) => {
	res.json([
		{ id: 1, title: 'Sample Session', type: 'class', time: '09:00', location: 'Room 101', instructor: 'TBD', students: 30, program: 'CS', year: '1st', section: 'A', description: '', capacity: '30', date: new Date().toISOString().slice(0,10) },
	]);
});

const port = process.env.PORT || 5174;
app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`API dev server running on http://localhost:${port}`);
});

