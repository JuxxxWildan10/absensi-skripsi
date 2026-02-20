import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { PieChart as LucidePieChart, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/ExportUtils';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Student } from '../types';
import StudentHistoryModal from '../components/StudentHistoryModal';

const Reports: React.FC = () => {
    const { students, classes, attendance } = useData();
    const [filterClass, setFilterClass] = useState('all');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const reportData = useMemo(() => {
        let relevantStudents = students;
        if (filterClass !== 'all') {
            relevantStudents = students.filter(s => s.classId === filterClass);
        }

        const relevantStudentIds = relevantStudents.map(s => s.id);
        const relevantAttendance = attendance.filter(a => relevantStudentIds.includes(a.studentId));

        const counts = {
            present: 0,
            alpha: 0,
            permission: 0,
            late: 0,
            sick: 0
        };

        relevantAttendance.forEach(a => {
            if (counts[a.status] !== undefined) {
                counts[a.status]++;
            }
        });

        return counts;

    }, [students, attendance, filterClass]);

    const handleExportPDF = () => {
        const records = attendance.map(record => {
            const student = students.find(s => s.id === record.studentId);
            const studentClass = classes.find(c => c.id === student?.classId);

            return {
                studentName: student?.name || '-',
                nis: student?.nis || '-',
                class: studentClass?.name || '-',
                date: record.date,
                subject: record.subject,
                status: record.status
            };
        });

        exportToPDF(records, `laporan-presensi-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleExportExcel = () => {
        const records = attendance.map(record => {
            const student = students.find(s => s.id === record.studentId);
            const studentClass = classes.find(c => c.id === student?.classId);

            return {
                studentName: student?.name || '-',
                nis: student?.nis || '-',
                class: studentClass?.name || '-',
                date: record.date,
                subject: record.subject,
                status: record.status
            };
        });

        exportToExcel(records, `laporan-presensi-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const stats = [
        { label: 'Hadir', value: reportData.present, color: 'bg-green-500', text: 'text-green-600', fill: '#22c55e' },
        { label: 'Sakit', value: reportData.sick, color: 'bg-blue-500', text: 'text-blue-600', fill: '#3b82f6' },
        { label: 'Terlambat', value: reportData.late, color: 'bg-orange-500', text: 'text-orange-600', fill: '#f97316' },
        { label: 'Alpa', value: reportData.alpha, color: 'bg-red-500', text: 'text-red-600', fill: '#ef4444' },
        { label: 'Izin', value: reportData.permission, color: 'bg-purple-500', text: 'text-purple-600', fill: '#a855f7' },
    ];

    const chartData = stats.filter(s => s.value > 0).map(s => ({
        name: s.label,
        value: s.value,
        fill: s.fill
    }));

    const total = Object.values(reportData).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Kehadiran</h1>
                    <p className="text-gray-500">Ringkasan statistik kehadiran siswa</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={filterClass}
                        onChange={e => setFilterClass(e.target.value)}
                    >
                        <option value="all">Semua Kelas</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
                    >
                        <FileText className="w-4 h-4" />
                        Export PDF
                    </button>

                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm hover:shadow-md"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {stats.map(stat => (
                    <div key={stat.label} className="glass-panel p-4 sm:p-6 rounded-2xl text-center flex flex-col items-center justify-center">
                        <div className={`w-3 h-3 mb-3 rounded-full ${stat.color}`}></div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                        <p className={`font-medium text-sm sm:text-base ${stat.text}`}>{stat.label}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {total > 0 ? Math.round((stat.value / total) * 100) : 0}%
                        </p>
                    </div>
                ))}
            </div>

            {total > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pie Chart */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Komposisi Kehadiran</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => [`${value} Orang`, 'Jumlah']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Distribusi Kehadiran</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        formatter={(value: any) => [`${value} Orang`, 'Jumlah']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="p-6 bg-gray-50 rounded-full mb-4">
                        <LucidePieChart className="w-16 h-16 text-indigo-200" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 max-w-md">
                        Belum Ada Data Kehadiran
                    </h3>
                    <p className="text-gray-400 mt-2">
                        Grafik akan muncul secara otomatis setelah ada data absensi yang tersimpan.
                    </p>
                </div>
            )}

            {/* Student List for History Details */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Detail Riwayat Siswa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students
                        .filter(s => filterClass === 'all' || s.classId === filterClass)
                        .map(student => (
                            <button
                                key={student.id}
                                onClick={() => {
                                    setSelectedStudent(student);
                                    setIsHistoryModalOpen(true);
                                }}
                                className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 line-clamp-1">{student.name}</p>
                                    <p className="text-sm text-gray-500 font-mono">{student.nis}</p>
                                </div>
                            </button>
                        ))}
                </div>
            </div>

            <StudentHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                student={selectedStudent}
            />
        </div>
    );
};

export default Reports;

