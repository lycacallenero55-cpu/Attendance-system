export function buildGoogleCalendarUrl(opts: {
	title: string;
	start: Date;
	end?: Date;
	description?: string;
	location?: string;
}) {
	const start = formatDate(opts.start);
	const end = formatDate(opts.end || new Date(opts.start.getTime() + 60 * 60 * 1000));
	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: opts.title,
		dates: `${start}/${end}`,
		details: opts.description || '',
		location: opts.location || ''
	});
	return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function buildICS(opts: {
	title: string;
	start: Date;
	end?: Date;
	description?: string;
	location?: string;
}) {
	const dtStart = toICSDate(opts.start);
	const dtEnd = toICSDate(opts.end || new Date(opts.start.getTime() + 60 * 60 * 1000));
	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//AMSUIP//Attendance//EN',
		'BEGIN:VEVENT',
		`DTSTART:${dtStart}`,
		`DTEND:${dtEnd}`,
		`SUMMARY:${escapeICS(opts.title)}`,
		opts.description ? `DESCRIPTION:${escapeICS(opts.description)}` : '',
		opts.location ? `LOCATION:${escapeICS(opts.location)}` : '',
		'END:VEVENT',
		'END:VCALENDAR'
	].filter(Boolean).join('\r\n');
}

export function downloadICS(filename: string, icsContent: string) {
	const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function toICSDate(d: Date) {
	return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICS(str: string) {
	return str.replace(/[\\,;\n]/g, (m) => ({ '\\': '\\\\', ',': '\\,', ';': '\\;', '\n': '\\n' }[m] as string));
}

function formatDate(d: Date) {
	// Google accepts YYYYMMDDTHHmmssZ
	return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

