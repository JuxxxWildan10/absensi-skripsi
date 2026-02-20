import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, UserPlus, Edit2 } from 'lucide-react';
import { Teacher } from '../types';

const Teachers: React.FC = () => {
    const { teachers, classes, addTeacher, updateTeacher, deleteTeacher } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        subject: '',
        homeroomClassId: ''
    });

    const openAddModal = () => {
        setEditingTeacher(null);
        setFormData({ name: '', username: '', password: '', subject: '', homeroomClassId: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.name,
            username: teacher.username,
            password: '', // Don't prepopulate password on edit for security
            subject: teacher.subject,
            homeroomClassId: teacher.homeroomClassId || ''
        });
        setIsModalOpen(true);
    };

    const handleSaveTeacher = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTeacher) {
            // Username and name are required, password only required on new
            if (!formData.username || !formData.name) return;
            updateTeacher({
                ...editingTeacher,
                name: formData.name,
                username: formData.username,
                subject: formData.subject,
                homeroomClassId: formData.homeroomClassId || undefined
            });
        } else {
            if (!formData.username || !formData.password || !formData.name) return;
            addTeacher({
                id: crypto.randomUUID(),
                ...formData,
                homeroomClassId: formData.homeroomClassId || undefined
            });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Guru</h1>
                    <p className="text-gray-500">Kelola akun guru dan mata pelajaran</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Guru
                </button>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-600 font-semibold text-sm">
                            <tr>
                                <th className="p-4">Nama Guru</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Mata Pelajaran</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {teachers.length > 0 ? teachers.map(teacher => (
                                <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                                            {teacher.name.charAt(0)}
                                        </div>
                                        {teacher.name}
                                    </td>
                                    <td className="p-4 text-gray-600 font-mono text-sm">{teacher.username}</td>
                                    <td className="p-4 text-gray-600">
                                        <span className="ox-2 py-1 px-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium border border-indigo-100">
                                            {teacher.subject}
                                        </span>
                                        {teacher.homeroomClassId && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                Wali Kelas: <span className="font-semibold text-gray-700">
                                                    {classes.find(c => c.id === teacher.homeroomClassId)?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => openEditModal(teacher)}
                                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Hapus akun guru ini?')) deleteTeacher(teacher.id) }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400">
                                        Belum ada data guru. Tambahkan guru baru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Teacher Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <UserPlus className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold">{editingTeacher ? 'Edit Akun Guru' : 'Tambah Akun Guru'}</h2>
                        </div>

                        <form onSubmit={handleSaveTeacher} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                                <input
                                    required
                                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Contoh: Budi Santoso, S.Pd"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mata Pelajaran</label>
                                <input
                                    required
                                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Contoh: Matematika"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Username</label>
                                    <input
                                        required
                                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Username login"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                {!editingTeacher && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Password</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Password login"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Wali Kelas (Opsional)</label>
                                <select
                                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.homeroomClassId}
                                    onChange={e => setFormData({ ...formData, homeroomClassId: e.target.value })}
                                >
                                    <option value="">-- Bukan Wali Kelas --</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="btn-primary">Simpan Akun</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teachers;
