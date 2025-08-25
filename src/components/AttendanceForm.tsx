import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Users, BookOpen, Calendar, Star, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchStudents } from "@/lib/supabaseService";
import { getTemplates, saveTemplate, findTemplate } from "@/lib/templates";
import { buildGoogleCalendarUrl, buildICS, downloadICS } from "@/lib/calendar";

export type AttendanceType = "class" | "event" | "other";

export interface SessionData {
	title: string;
	program: string;
	year: string;
	section: string;
	date: string;
	timeIn: string;
	timeOut: string;
	attendanceType: AttendanceType;
	venue?: string;
	description?: string;
	capacity?: string | number;
}

interface AttendanceFormProps {
	onSuccess?: () => void;
	onSubmit?: (session: SessionData) => void;
	initialData?: Partial<SessionData> & { id?: number };
}

const AttendanceForm = ({ onSuccess, onSubmit, initialData }: AttendanceFormProps) => {
	const [attendanceType, setAttendanceType] = useState<AttendanceType>(initialData?.attendanceType || "class");
	const [step, setStep] = useState<number>(1);
	const [formData, setFormData] = useState({
		title: initialData?.title || "",
		program: initialData?.program || "",
		year: initialData?.year || "",
		section: initialData?.section || "",
		date: initialData?.date || "",
		timeIn: initialData?.timeIn || "",
		timeOut: initialData?.timeOut || "",
	});
	const [templateName, setTemplateName] = useState<string>("");
	const [templatesVersion, setTemplatesVersion] = useState<number>(0);
	
	// State for dropdown options
	const [loadingOptions, setLoadingOptions] = useState(false);
	const [studentOptions, setStudentOptions] = useState<{
		programs: string[];
		years: string[];
		sections: { [key: string]: string[] };
	}>({ programs: [], years: [], sections: {} });
	
	// Available sections based on selected program and year
	const availableSections = useCallback(() => {
		if (!formData.program || !formData.year) return [];
		const key = `${formData.program}|${formData.year}`;
		return studentOptions.sections[key] || [];
	}, [formData.program, formData.year, studentOptions.sections]);
	
	// Fetch students for a specific program and year
	const fetchStudents = async (program: string, year: string) => {
		try {
			// Convert year to the format stored in the database (e.g., '1st' instead of '1st Year')
			const yearShort = year.replace(' Year', '');
			
			// Helper function to fetch all students with pagination
			const fetchAllStudents = async () => {
				interface StudentSection {
					section: string | null;
				}
				
				const allStudents: StudentSection[] = [];
				let from = 0;
				const pageSize = 1000; // Supabase default limit
				
				while (true) {
					const { data, error } = await supabase
						.from('students')
						.select('section')
						.eq('program', program)
						.eq('year', yearShort)
						.not('section', 'is', null)
						.range(from, from + pageSize - 1);
					
					if (error) throw error;
					
					if (!data || data.length === 0) break;
					
					allStudents.push(...data);
					
					// If we got less than pageSize, we've reached the end
					if (data.length < pageSize) break;
					
					from += pageSize;
				}
				
				return allStudents;
			};
			
			// Fetch all students with pagination
			const data = await fetchAllStudents();
			
			// Return an array of sections with empty strings converted to 'Uncategorized'
			return (data || []).map(student => ({
				section: student.section || 'Uncategorized'
			}));
		} catch (error) {
			console.error('Error fetching students:', error);
			toast.error('Failed to load student data');
			return [];
		}
	};

	const applyTemplate = (name: string) => {
		const t = findTemplate(name);
		if (!t) return;
		const data = t.data as Partial<typeof formData & { attendanceType: AttendanceType }>;
		setFormData(prev => ({
			...prev,
			title: (data.title as string) || prev.title,
			program: (data.program as string) || prev.program,
			year: (data.year as string) || prev.year,
			section: (data.section as string) || prev.section,
			date: (data.date as string) || prev.date,
			timeIn: (data.timeIn as string) || prev.timeIn,
			timeOut: (data.timeOut as string) || prev.timeOut,
		}));
		if (data.attendanceType) setAttendanceType(data.attendanceType);
		toast.success(`Applied template: ${name}`);
	};

	const handleSaveTemplate = () => {
		const name = templateName || prompt("Template name?") || "";
		if (!name.trim()) return;
		saveTemplate(name.trim(), { ...formData, attendanceType });
		setTemplatesVersion(v => v + 1);
		toast.success("Template saved");
	};

	const handleCalendarActions = () => {
		if (!formData.title || !formData.date || !formData.timeIn) {
			toast.warning("Please set title, date and start time");
			return;
		}
		const start = new Date(`${formData.date}T${formData.timeIn}:00Z`);
		const end = formData.timeOut ? new Date(`${formData.date}T${formData.timeOut}:00Z`) : new Date(start.getTime() + 60*60*1000);
		const url = buildGoogleCalendarUrl({ title: formData.title, start, end, description: initialData?.description, location: initialData?.venue });
		window.open(url, '_blank');
		const ics = buildICS({ title: formData.title, start, end, description: initialData?.description, location: initialData?.venue });
		downloadICS(formData.title.replace(/\s+/g, '_'), ics);
	};

	return (
		<div className="w-full max-w-none mx-auto px-6 py-4">
			{/* Templates & Calendar actions row */}
			<div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-2">
				<div className="flex items-center gap-2">
					<Select value="" onValueChange={(v) => applyTemplate(v)}>
						<SelectTrigger className="w-[200px]"><SelectValue placeholder="Load template" /></SelectTrigger>
						<SelectContent>
							{getTemplates().map(t => (
								<SelectItem key={t.name + templatesVersion} value={t.name}>{t.name}</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input placeholder="Template name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-[180px]" />
					<Button variant="outline" onClick={handleSaveTemplate}>Save Template</Button>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={handleCalendarActions}>Add to Calendar (Google/ICS)</Button>
				</div>
			</div>

			<div className="pb-8">
				<form onSubmit={handleSubmit} className="space-y-5" aria-live="polite">
					{/* ... existing code ... */}
					{/* Wizard Controls */}
					<div className="md:col-span-2 pt-3 pb-4 flex gap-2 justify-center">
						{step > 1 && (
							<Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} className="min-w-[120px]">Back</Button>
						)}
						{step < 3 && (
							<Button type="button" disabled={step === 1 && !canGoNextFromDetails()} onClick={() => setStep((s) => Math.min(3, s + 1))} className="min-w-[160px]">Next</Button>
						)}
						{step === 3 && (
							<Button 
								type="submit" 
								className={`${getTypeColor(attendanceType)} shadow-glow hover:opacity-90 transition-opacity min-w-[200px] min-h-[42px] text-base`}
							>
								<Users className="w-4 h-4 mr-2" />
								{initialData?.id ? 'Update Session' : 'Create Session'}
							</Button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default AttendanceForm;