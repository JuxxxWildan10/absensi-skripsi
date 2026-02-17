export interface Student {
    id: string;
    name: string;
    nis: string;
    classId: string;
    gender: 'L' | 'P';
    parentPhone?: string; // Format: 628xxx
}

export interface Class {
    id: string;
    name: string; // e.g., "X IPA 1"
}

export interface Teacher {
    id: string;
    name: string;
    username: string;
    password?: string; // Optional for display, required for creation/login
    subject: string; // Mata Pelajaran
    homeroomClassId?: string; // Wali Kelas dari kelas mana (optional)
}

export interface Schedule {
    id: string;
    classId: string;
    teacherId: string;
    subject: string;
    day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
    startTime: string; // HH:mm
    endTime: string; // HH:mm
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    subject: string; // New field for specific subject attendance
    status: 'present' | 'alpha' | 'late' | 'sick' | 'permission';
}

export interface User {
    id: string;
    name: string;
    username: string;
    role: 'teacher' | 'admin';
    subject?: string; // If teacher
    homeroomClassId?: string; // If wali kelas
}
