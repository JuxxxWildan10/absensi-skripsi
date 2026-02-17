import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { PieChart, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/ExportUtils';

const Reports: React.FC = () => {
    const { students, classes, attendance } = useData();
    const [filterClass, setFilterClass] = useState('all');

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
        { label: 'Hadir', value: reportData.present, color: 'bg-green-500', text: 'text-green-600' },
        { label: 'Sakit', value: reportData.sick, color: 'bg-blue-500', text: 'text-blue-600' },
        { label: 'Terlambat', value: reportData.late, color: 'bg-orange-500', text: 'text-orange-600' },
        { label: 'Alpa', value: reportData.alpha, color: 'bg-red-500', text: 'text-red-600' },
        { label: 'Izin', value: reportData.permission, color: 'bg-purple-500', text: 'text-purple-600' },
    ];

    const total = Object.values(reportData).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Kehadiran</h1>
                    <p className="text-gray-500">Ringkasan statistik kehadiran siswa</p>
                </div>
                <div className="flex gap-3 items-center">
                    <select
                        className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        Export PDF
                    </button>

                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <div key={stat.label} className="glass-panel p-6 rounded-2xl text-center">
                        <div className={`w-3 h-3 mx-auto mb-4 rounded-full ${stat.color}`}></div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                        <p className={`font-medium ${stat.text}`}>{stat.label}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {total > 0 ? Math.round((stat.value / total) * 100) : 0}% dari total
                        </p>
                    </div>
                ))}
            </div>

            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
                <div className="p-6 bg-gray-50 rounded-full mb-4">
                    <PieChart className="w-16 h-16 text-indigo-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 text-center max-w-md">
                    Grafik visualisasi akan muncul di sini.
                    <br /><span className="text-sm text-gray-400">(Fitur visualisasi lanjutan dapat ditambahkan dengan library chart)</span>
                </h3>
            </div>
        </div>
    );
};

export default Reports;

