import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Student } from '../types';
import { X, Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface StudentHistoryModalProps {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
}

const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({ student, isOpen, onClose }) => {
    const { attendance, classes } = useData();
    const [filterMonth, setFilterMonth] = useState('all');

    const history = useMemo(() => {
        if (!student) return [];

        let filtered = attendance.filter(a => a.studentId === student.id);

        if (filterMonth !== 'all') {
            filtered = filtered.filter(a => a.date.startsWith(filterMonth));
        }

        // Sort by date descending
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance, student, filterMonth]);

    const stats = useMemo(() => {
        const counts = { present: 0, sick: 0, permission: 0, alpha: 0, late: 0 };
        history.forEach(record => {
            if (counts[record.status] !== undefined) {
                counts[record.status]++;
            }
        });
        return counts;
    }, [history]);

    // Get unique months for filter
    const availableMonths = useMemo(() => {
        if (!student) return [];
        const studentAttendance = attendance.filter(a => a.studentId === student.id);
        const months = new Set(studentAttendance.map(a => a.date.substring(0, 7))); // YYYY-MM
        return Array.from(months).sort().reverse();
    }, [attendance, student]);

    if (!isOpen || !student) return null;

    const studentClass = classes.find(c => c.id === student.classId);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'sick': return <AlertCircle className="w-5 h-5 text-blue-500" />;
            case 'permission': return <Clock className="w-5 h-5 text-purple-500" />;
            case 'late': return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'alpha': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present': return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Hadir</span>;
            case 'sick': return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">Sakit</span>;
            case 'permission': return <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">Izin</span>;
            case 'late': return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">Terlambat</span>;
            case 'alpha': return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">Alpa</span>;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-start justify-between text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-md border border-white/30">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
                            <div className="flex flex-wrap gap-3 text-sm text-indigo-100">
                                <span className="flex items-center gap-1 font-mono">
                                    <FileText className="w-4 h-4" /> {student.nis}
                                </span>
                                <span>•</span>
                                <span>{studentClass?.name || 'Unknown Class'}</span>
                                <span>•</span>
                                <span>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{stats.present}</div>
                            <div className="text-xs font-medium text-green-600 mt-1 uppercase tracking-wider">Hadir</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{stats.sick}</div>
                            <div className="text-xs font-medium text-blue-600 mt-1 uppercase tracking-wider">Sakit</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{stats.permission}</div>
                            <div className="text-xs font-medium text-purple-600 mt-1 uppercase tracking-wider">Izin</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{stats.late}</div>
                            <div className="text-xs font-medium text-orange-600 mt-1 uppercase tracking-wider">Terlambat</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{stats.alpha}</div>
                            <div className="text-xs font-medium text-red-600 mt-1 uppercase tracking-wider">Alpa</div>
                        </div>
                    </div>

                    {/* Filter and Title */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" />
                            Riwayat Kehadiran
                        </h3>
                        <select
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium w-full sm:w-auto shadow-sm"
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                        >
                            <option value="all">Semua Waktu</option>
                            {availableMonths.map(month => (
                                <option key={month} value={month}>
                                    {format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: id })}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Timeline List */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        {history.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {history.map((record) => (
                                    <div key={record.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {getStatusIcon(record.status)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 text-base mb-1">
                                                    {record.subject}
                                                </div>
                                                <div className="text-sm text-gray-500 font-medium">
                                                    {format(parseISO(record.date), 'EEEE, d MMMM yyyy', { locale: id })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                                            {getStatusBadge(record.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Calendar className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-1">Tidak ada riwayat kehadiran</h4>
                                <p className="text-gray-500">Belum ada data absensi untuk periode ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHistoryModal;
