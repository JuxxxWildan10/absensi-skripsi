import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Class, AttendanceRecord, Teacher, Schedule } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
    students: Student[];
    classes: Class[];
    teachers: Teacher[];
    schedules: Schedule[];
    attendance: AttendanceRecord[];

    addClass: (cls: Class) => Promise<void>;
    deleteClass: (id: string) => Promise<void>;

    addStudent: (student: Student) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;

    addTeacher: (teacher: Teacher) => Promise<void>;
    deleteTeacher: (id: string) => Promise<void>;

    addSchedule: (schedule: Schedule) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;

    addAttendance: (records: AttendanceRecord[]) => Promise<void>;
    getAttendanceByDateClassAndSubject: (date: string, classId: string, subject: string) => AttendanceRecord[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    const fetchData = async () => {
        const { data: classData } = await supabase.from('classes').select('*');
        if (classData) setClasses(classData);

        const { data: studentData } = await supabase.from('students').select('*');
        if (studentData) {
            setStudents(studentData.map((s: any) => ({
                ...s,
                classId: s.class_id, // map db column to frontend prop
                parentPhone: s.parent_phone // map db column to frontend prop
            })));
        }

        const { data: teacherData } = await supabase.from('users').select('*').eq('role', 'teacher');
        if (teacherData) {
            setTeachers(teacherData.map((t: any) => ({
                id: t.id,
                name: t.name,
                username: t.username,
                password: t.password,
                subject: t.subject,
                homeroomClassId: t.homeroom_class_id // Map DB column to frontend prop
            })));
        }

        const { data: scheduleData } = await supabase.from('schedules').select('*');
        if (scheduleData) {
            setSchedules(scheduleData.map((s: any) => ({
                ...s,
                classId: s.class_id,
                teacherId: s.teacher_id,
                startTime: s.start_time,
                endTime: s.end_time
            })));
        }

        const { data: attendanceData } = await supabase.from('attendance').select('*');
        if (attendanceData) {
            setAttendance(attendanceData.map((a: any) => ({
                ...a,
                studentId: a.student_id
            })));
        }
    };

    // Load initial data and set up Real-time subscription
    useEffect(() => {
        fetchData();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('public:attendance')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'attendance' },
                (payload) => {
                    console.log('New attendance received!', payload);
                    const newRecord = payload.new as any;

                    // Add new record to state immediately
                    setAttendance((prev) => {
                        // Prevent duplicates just in case
                        if (prev.some(p => p.id === newRecord.id)) return prev;

                        return [...prev, {
                            ...newRecord,
                            studentId: newRecord.student_id // Map DB column to frontend prop
                        }];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const addClass = async (cls: Class) => {
        const { error } = await supabase.from('classes').insert(cls);
        if (!error) setClasses([...classes, cls]);
    };
    const deleteClass = async (id: string) => {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (!error) setClasses(classes.filter(c => c.id !== id));
    };

    const addStudent = async (student: Student) => {
        // Map frontend model to DB columns if needed (here they match: classId -> class_id)
        // Wait, in schema I used class_id but in types I used classId.
        // I must map them or update types. 
        // Supabase is smart but let's be explicit or ensure Types match DB.
        // For simplicity in this overwrite, I will map the payload.

        const dbStudent = {
            id: student.id,
            name: student.name,
            nis: student.nis,
            gender: student.gender,
            class_id: student.classId,
            parent_phone: student.parentPhone || null
        };

        const { error } = await supabase.from('students').insert(dbStudent);
        if (!error) {
            setStudents([...students, student]);
        } else {
            console.error(error);
            alert(`Gagal menambah siswa: ${error.message}`);
        }
    };

    const deleteStudent = async (id: string) => {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (!error) setStudents(students.filter(s => s.id !== id));
    };

    const addTeacher = async (teacher: Teacher) => {
        // Teachers are in 'users' table
        const dbUser = {
            id: teacher.id,
            username: teacher.username,
            password: teacher.password,
            name: teacher.name,
            role: 'teacher',
            subject: teacher.subject,
            homeroom_class_id: teacher.homeroomClassId || null // Save to DB
        };

        const { error } = await supabase.from('users').insert(dbUser);
        if (!error) {
            setTeachers([...teachers, teacher]);
        } else {
            console.error(error);
            alert(`Gagal menambah guru: ${error.message}. Pastikan kolom 'homeroom_class_id' ada di tabel 'users'.`);
        }
    };

    const deleteTeacher = async (id: string) => {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) setTeachers(teachers.filter(t => t.id !== id));
    };

    const addSchedule = async (schedule: Schedule) => {
        const dbSchedule = {
            id: schedule.id,
            day: schedule.day,
            start_time: schedule.startTime,
            end_time: schedule.endTime,
            subject: schedule.subject,
            class_id: schedule.classId,
            teacher_id: schedule.teacherId
        };
        const { error } = await supabase.from('schedules').insert(dbSchedule);
        if (!error) setSchedules([...schedules, schedule]);
        else console.error(error);
    };

    const deleteSchedule = async (id: string) => {
        const { error } = await supabase.from('schedules').delete().eq('id', id);
        if (!error) setSchedules(schedules.filter(s => s.id !== id));
    };

    const addAttendance = async (newRecords: AttendanceRecord[]) => {
        // Delete existing for same student/date/subject to strictly overwrite
        // This is inefficient loop but safe for limited records.
        // Better: upsert.

        const dbRecords = newRecords.map(r => ({
            id: r.id,
            date: r.date,
            subject: r.subject,
            status: r.status,
            student_id: r.studentId
        }));

        const { error } = await supabase.from('attendance').upsert(dbRecords);

        if (!error) {
            // Refresh local logic
            // Simple approach: filter out stale and append new
            const filtered = attendance.filter(a =>
                !newRecords.some(nr => nr.studentId === a.studentId && nr.date === a.date && nr.subject === a.subject)
            );
            setAttendance([...filtered, ...newRecords]);
        } else console.error(error);
    };

    const getAttendanceByDateClassAndSubject = (date: string, classId: string, subject: string) => {
        const classStudentIds = students.filter(s => s.classId === classId).map(s => s.id);
        return attendance.filter(a => a.date === date && a.subject === subject && classStudentIds.includes(a.studentId));
    };

    return (
        <DataContext.Provider value={{
            students, classes, teachers, schedules, attendance,
            addClass, deleteClass,
            addStudent, deleteStudent,
            addTeacher, deleteTeacher,
            addSchedule, deleteSchedule,
            addAttendance, getAttendanceByDateClassAndSubject
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};
