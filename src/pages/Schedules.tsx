import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import { Schedule } from '../types';

const Schedules: React.FC = () => {
    const { schedules, classes, teachers, addSchedule, deleteSchedule } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Schedule>>({
        day: 'Senin',
        classId: '',
        teacherId: '',
        subject: '',
        startTime: '',
        endTime: ''
    });

    const handleAddSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.classId || !formData.teacherId || !formData.subject) return;

        addSchedule({
            id: crypto.randomUUID(),
            ...formData as Schedule
        });
        // Reset but keep class/teacher for easier repeated entry
        setFormData(prev => ({
            ...prev,
            startTime: '',
            endTime: '',
            subject: ''
        }));
        setIsModalOpen(false);
    };

    // Helper to get names
    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || 'Unknown';
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'Unknown';

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Jadwal Pelajaran</h1>
                    <p className="text-gray-500">Atur jadwal mata pelajaran per kelas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Jadwal
                </button>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-600 font-semibold text-sm">
                            <tr>
                                <th className="p-4">Hari</th>
                                <th className="p-4">Jam</th>
                                <th className="p-4">Kelas</th>
                                <th className="p-4">Mata Pelajaran</th>
                                <th className="p-4">Guru Pengampu</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schedules.length > 0 ? schedules.sort((a, b) => a.day.localeCompare(b.day) || a.startTime.localeCompare(b.startTime)).map(schedule => (
                                <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase">
                                            {schedule.day}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-mono text-sm">{schedule.startTime} - {schedule.endTime}</td>
                                    <td className="p-4 text-gray-800 font-medium">{getClassName(schedule.classId)}</td>
                                    <td className="p-4 text-gray-800">{schedule.subject}</td>
                                    <td className="p-4 text-gray-600 text-sm">{getTeacherName(schedule.teacherId)}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => { if (confirm('Hapus jadwal ini?')) deleteSchedule(schedule.id) }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        Belum ada jadwal.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <CalendarClock className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold">Tambah Jadwal</h2>
                        </div>

                        <form onSubmit={handleAddSchedule} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hari</label>
                                    <select required className="w-full border p-2 rounded-lg" value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value as any })}>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kelas</label>
                                    <select required className="w-full border p-2 rounded-lg" value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })}>
                                        <option value="">Pilih...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Guru Pengampu</label>
                                <select
                                    required
                                    className="w-full border p-2 rounded-lg"
                                    value={formData.teacherId}
                                    onChange={e => {
                                        const selectedTeacher = teachers.find(t => t.id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            teacherId: e.target.value,
                                            subject: selectedTeacher ? selectedTeacher.subject : '' // Auto fill subject from teacher
                                        });
                                    }}
                                >
                                    <option value="">Pilih Guru...</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} - {t.subject}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Mata Pelajaran</label>
                                <input
                                    required
                                    className="w-full border p-2 rounded-lg"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jam Mulai</label>
                                    <input required type="time" className="w-full border p-2 rounded-lg" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jam Selesai</label>
                                    <input required type="time" className="w-full border p-2 rounded-lg" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedules;
