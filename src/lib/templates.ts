export type AttendanceTemplate = {
	name: string;
	data: Record<string, unknown>;
	createdAt: string;
};

const STORAGE_KEY = 'attendance_templates_v1';

export function getTemplates(): AttendanceTemplate[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function saveTemplate(name: string, data: Record<string, unknown>) {
	const templates = getTemplates().filter(t => t.name !== name);
	templates.push({ name, data, createdAt: new Date().toISOString() });
	localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function deleteTemplate(name: string) {
	const templates = getTemplates().filter(t => t.name !== name);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function findTemplate(name: string): AttendanceTemplate | undefined {
	return getTemplates().find(t => t.name === name);
}

