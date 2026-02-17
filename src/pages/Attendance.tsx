import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { format, getDay } from 'date-fns';
import { Save, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { AttendanceRecord } from '../types';

const Attendance: React.FC = () => {
    const { students, classes, attendance, schedules, addAttendance } = useData();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // State
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');

    const [records, setRecords] = useState<Record<string, 'present' | 'alpha' | 'late' | 'sick' | 'permission'>>({});

    // Auto select first class
    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    // Derived: Get Day Name from Date (Senin, Selasa, etc)
    const dayName = useMemo(() => {
        const date = new Date(selectedDate);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[getDay(date)];
    }, [selectedDate]);

    // Derived: Available Subjects for this Class on this Day
    const availableSubjects = useMemo(() => {
        if (!selectedClassId || !dayName) return [];
        return schedules
            .filter(s => s.classId === selectedClassId && s.day === dayName)
            .map(s => s.subject); // Just return subject names
    }, [schedules, selectedClassId, dayName]);

    // Derived: Filter students by selected Class
    const currentClassStudents = useMemo(() => {
        return students.filter(s => s.classId === selectedClassId);
    }, [students, selectedClassId]);

    // Load existing attendance
    useEffect(() => {
        if (!selectedClassId || !selectedSubject) return;

        // Find existing records
        const existingRecords = attendance.filter(a =>
            a.date === selectedDate &&
            a.subject === selectedSubject
        );

        const newRecordsState: Record<string, any> = {};
        currentClassStudents.forEach(s => {
            const found = existingRecords.find(r => r.studentId === s.id);
            newRecordsState[s.id] = found ? found.status : 'present';
        });

        setRecords(newRecordsState);
    }, [selectedDate, selectedClassId, selectedSubject, currentClassStudents, attendance]);

    const handleStatusChange = (studentId: string, status: 'present' | 'alpha' | 'late' | 'sick' | 'permission') => {
        if (isAdmin) return;
        setRecords(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = () => {
        if (!selectedSubject) {
            alert("Pilih mata pelajaran terlebih dahulu!");
            return;
        }

        const newAttendanceRecords: AttendanceRecord[] = Object.keys(records).map(studentId => ({
            id: crypto.randomUUID(),
            studentId,
            date: selectedDate,
            subject: selectedSubject,
            status: records[studentId]
        }));

        addAttendance(newAttendanceRecords);
        alert('Data absensi berhasil disimpan!');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Absensi Per Mata Pelajaran</h1>
                    <p className="text-gray-500">
                        {isAdmin ? 'Lihat data kehadiran per mapel' : 'Catat kehadiran sesuai jadwal pelajaran'}
                    </p>
                </div>
                {!isAdmin && selectedSubject && (
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Simpan Absensi
                    </button>
                )}
            </div>

            {/* Controls */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col lg:flex-row gap-6 items-end lg:items-center">

                {/* Date */}
                <div className="w-full lg:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="date"
                            className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-indigo-600 mt-1 font-medium">{dayName}</p>
                </div>

                {/* Class */}
                <div className="w-full lg:w-auto min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                    <select
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedClassId}
                        onChange={e => {
                            setSelectedClassId(e.target.value);
                            setSelectedSubject(''); // Reset subject when class changes
                        }}
                    >
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Subject (Dynamic based on Schedule) */}
                <div className="w-full lg:w-auto flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran (Sesuai Jadwal)</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <select
                            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                            disabled={availableSubjects.length === 0}
                        >
                            <option value="">-- Pilih Mapel --</option>
                            {availableSubjects.map((subject, idx) => (
                                <option key={idx} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>
                    {availableSubjects.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">Tidak ada jadwal untuk hari {dayName} di kelas ini.</p>
                    )}
                </div>

                <div className="text-right text-gray-500 text-sm pb-2 whitespace-nowrap">
                    {currentClassStudents.length} Siswa
                </div>
            </div>

            {/* List */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                {selectedSubject ? (
                    currentClassStudents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="p-4 w-16">No</th>
                                        <th className="p-4">Nama Siswa</th>
                                        <th className="p-4 text-center">Status Kehadiran ({selectedSubject})</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentClassStudents.map((student, idx) => (
                                        <tr key={student.id} className="hover:bg-gray-50/30">
                                            <td className="p-4 text-gray-500">{idx + 1}</td>
                                            <td className="p-4 font-medium">{student.name}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    {/* Reuse existing logic for buttons */}
                                                    {[
                                                        { value: 'present', label: 'Hadir', color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },
                                                        { value: 'alpha', label: 'Alpa', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
                                                        { value: 'late', label: 'Terlambat', color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' },
                                                        { value: 'sick', label: 'Sakit', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
                                                        { value: 'permission', label: 'Izin', color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleStatusChange(student.id, opt.value as any)}
                                                            className={`
                                                        px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                                                        ${isAdmin ? 'cursor-not-allowed opacity-80' : ''}
                                                        ${records[student.id] === opt.value
                                                                    ? `${opt.color} ring-2 ring-offset-1 ring-indigo-500/30 shadow-sm transform scale-105`
                                                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
                                                    `}
                                                            disabled={isAdmin}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            Kelas ini belum memiliki siswa.
                        </div>
                    )
                ) : (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                        <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Silakan pilih Mata Pelajaran terlebih dahulu.</p>
                        <p className="text-sm mt-2">Pastikan jadwal pelajaran sudah dibuat oleh Admin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
