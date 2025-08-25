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

	// ... existing code ...

	return (
		<div className="w-full max-w-none mx-auto px-6 py-4">
			{/* ... existing code ... */}
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