import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Users, GraduationCap, CalendarCheck, Clock, LogOut, Monitor, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { AttendanceBarChart, AttendancePieChart } from '../components/dashboard/AttendanceChart';
import QRCodeKiosk from '../components/QRCodeKiosk';

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bg: string;
}> = ({ title, value, icon: Icon, color, bg }) => (
    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:scale-105 transition-transform duration-300">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { students, classes, attendance } = useData();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showQR, setShowQR] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const today = format(new Date(), 'yyyy-MM-dd');

    const stats = useMemo(() => {
        const totalStudents = students.length;
        const totalClasses = classes.length;
        const todayAttendance = attendance.filter(a => a.date === today && a.status === 'present').length;
        const todayLate = attendance.filter(a => a.date === today && a.status === 'late').length;

        return { totalStudents, totalClasses, todayAttendance, todayLate };
    }, [students, classes, attendance, today]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
                    <p className="text-gray-500">
                        Selamat datang, {user?.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors md:hidden self-end"
                >
                    <LogOut className="w-4 h-4" />
                    Keluar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Siswa"
                    value={stats.totalStudents}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-100"
                />
                <StatCard
                    title="Total Kelas"
                    value={stats.totalClasses}
                    icon={GraduationCap}
                    color="text-purple-600"
                    bg="bg-purple-100"
                />
                <StatCard
                    title="Hadir Hari Ini"
                    value={stats.todayAttendance}
                    icon={CalendarCheck}
                    color="text-green-600"
                    bg="bg-green-100"
                />
                <StatCard
                    title="Terlambat Hari Ini"
                    value={stats.todayLate}
                    icon={Clock}
                    color="text-orange-600"
                    bg="bg-orange-100"
                />
            </div>

            {/* Kiosk Mode Access Card */}
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                            <Monitor className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Mode Kiosk - Self Check-in</h3>
                            <p className="text-sm text-gray-600">
                                Siswa bisa check-in sendiri dengan verifikasi wajah dan lokasi
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/kiosk')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
                        >
                            <Smartphone className="w-5 h-5" />
                            Buka Kiosk
                        </button>
                        <button
                            onClick={() => setShowQR(true)}
                            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors border-2 border-indigo-200"
                        >
                            QR Code
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowQR(false)}
                >
                    <div
                        className="glass-panel p-8 rounded-3xl max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                            QR Code Kiosk Mode
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Scan dengan smartphone untuk akses cepat
                        </p>
                        <div className="flex justify-center mb-6">
                            <QRCodeKiosk
                                url={`${window.location.origin}/kiosk`}
                                size={250}
                            />
                        </div>
                        <button
                            onClick={() => setShowQR(false)}
                            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Bar Chart - Last 7 Days */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Tren Kehadiran 7 Hari Terakhir</h3>
                    {(() => {
                        // Generate last 7 days data
                        const last7Days = Array.from({ length: 7 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (6 - i));
                            return format(date, 'yyyy-MM-dd');
                        });

                        const chartData = last7Days.map(date => {
                            const dayAttendance = attendance.filter(a => a.date === date);
                            return {
                                date: format(new Date(date), 'dd MMM'),
                                present: dayAttendance.filter(a => a.status === 'present').length,
                                sick: dayAttendance.filter(a => a.status === 'sick').length,
                                late: dayAttendance.filter(a => a.status === 'late').length,
                                alpha: dayAttendance.filter(a => a.status === 'alpha').length,
                            };
                        });

                        return <AttendanceBarChart data={chartData} />;
                    })()}
                </div>

                {/* Attendance Pie Chart - Overall Distribution */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Distribusi Status Kehadiran</h3>
                    {(() => {
                        const pieData = [
                            { name: 'Hadir', value: attendance.filter(a => a.status === 'present').length },
                            { name: 'Sakit', value: attendance.filter(a => a.status === 'sick').length },
                            { name: 'Terlambat', value: attendance.filter(a => a.status === 'late').length },
                            { name: 'Alpa', value: attendance.filter(a => a.status === 'alpha').length },
                        ].filter(item => item.value > 0); // Only show non-zero values

                        return pieData.length > 0 ? (
                            <AttendancePieChart data={pieData} />
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-400">
                                Belum ada data kehadiran
                            </div>
                        );
                    })()}
                </div>

            </div>

            {/* Auto-Alpha List (Only shows after 08:00) */}
            {(() => {
                const now = new Date();
                const currentHour = now.getHours();
                const isPast8AM = currentHour >= 8;

                // Debug/Demo: Uncomment next line to force show it for testing even if before 8 AM
                // const isPast8AM = true; 

                if (isPast8AM) {
                    const presentStudentIds = attendance
                        .filter(a => a.date === today && (a.status === 'present' || a.status === 'late' || a.status === 'sick' || a.status === 'permission'))
                        .map(a => a.studentId);

                    const absentStudents = students.filter(s => !presentStudentIds.includes(s.id));

                    if (absentStudents.length > 0) {
                        // Group absent students by class
                        const absentByClass = classes.map(cls => {
                            const classAbsentStudents = absentStudents.filter(s => s.classId === cls.id);
                            return {
                                class: cls,
                                students: classAbsentStudents
                            };
                        }).filter(group => group.students.length > 0); // Only show classes with absent students

                        return (
                            <div className="glass-panel p-6 rounded-2xl border-2 border-red-200 bg-red-50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-500 rounded-lg">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-red-800">Siswa Belum Hadir / Alpha (Auto)</h3>
                                        <p className="text-sm text-red-600">Siswa berikut belum check-in hari ini (Melewati 08:00)</p>
                                    </div>
                                </div>

                                {/* Group by Class */}
                                <div className="space-y-6">
                                    {absentByClass.map(({ class: cls, students: classStudents }) => (
                                        <div key={cls.id} className="bg-white/50 p-4 rounded-xl border border-red-200">
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-200">
                                                <GraduationCap className="w-5 h-5 text-red-600" />
                                                <h4 className="font-bold text-red-800">{cls.name}</h4>
                                                <span className="ml-auto text-sm text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                                                    {classStudents.length} siswa
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {classStudents.map(student => (
                                                    <div key={student.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex justify-between items-center">
                                                        <div>
                                                            <p className="font-bold text-gray-800">{student.name}</p>
                                                            <p className="text-sm text-gray-500">{student.nis}</p>
                                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                                <Smartphone className="w-3 h-3" />
                                                                {student.parentPhone || 'No Phone'}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg mb-1">
                                                                Alpha
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                }
                return null;
            })()}
        </div>
    );
};

export default Dashboard;
