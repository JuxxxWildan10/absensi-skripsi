import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Search, GraduationCap } from 'lucide-react';

const Students: React.FC = () => {
    const { students, classes, addStudent, deleteStudent } = useData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('all');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        nis: '',
        classId: '',
        gender: 'L' as 'L' | 'P',
        parentPhone: ''
    });

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.nis.includes(search);
            const matchesClass = filterClass === 'all' || student.classId === filterClass;
            return matchesSearch && matchesClass;
        });
    }, [students, search, filterClass]);

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.classId) {
            alert("Pilih kelas terlebih dahulu");
            return;
        }
        addStudent({
            id: crypto.randomUUID(),
            ...formData
        });
        setFormData({ name: '', nis: '', classId: '', gender: 'L', parentPhone: '' });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
                    <p className="text-gray-500">Kelola data siswa per kelas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Siswa
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari nama atau NIS..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
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
            </div>

            {/* Grouped by Class */}
            <div className="space-y-6">
                {(() => {
                    // Group students by class
                    const studentsByClass = classes.map(cls => {
                        const classStudents = filteredStudents.filter(s => s.classId === cls.id);
                        return {
                            class: cls,
                            students: classStudents
                        };
                    }).filter(group => group.students.length > 0);

                    if (studentsByClass.length === 0) {
                        return (
                            <div className="glass-panel p-8 rounded-2xl text-center text-gray-400">
                                Tidak ada data siswa ditemukan
                            </div>
                        );
                    }

                    return studentsByClass.map(({ class: cls, students: classStudents }) => (
                        <div key={cls.id} className="glass-panel rounded-2xl overflow-hidden">
                            {/* Class Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <GraduationCap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{cls.name}</h3>
                                        <p className="text-white/80 text-sm">{classStudents.length} siswa</p>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-gray-600 font-semibold text-sm">
                                        <tr>
                                            <th className="p-4">NIS</th>
                                            <th className="p-4">Nama Siswa</th>
                                            <th className="p-4">Jenis Kelamin</th>
                                            <th className="p-4">No. HP Ortu</th>
                                            <th className="p-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {classStudents.map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 font-mono text-sm text-gray-500">{student.nis}</td>
                                                <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    {student.name}
                                                </td>
                                                <td className="p-4 text-gray-600">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                                <td className="p-4 text-gray-600 font-mono text-sm">
                                                    {(() => {
                                                        if (!student.parentPhone) return '-';
                                                        if (user?.role === 'admin') return student.parentPhone;
                                                        const isHomeroom = user?.role === 'teacher' && user.homeroomClassId === student.classId;
                                                        if (isHomeroom) return student.parentPhone;
                                                        return '******';
                                                    })()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => { if (confirm('Hapus siswa?')) deleteStudent(student.id) }}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ));
                })()}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Tambah Siswa</h2>
                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                                <input required className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">NIS</label>
                                <input required className="w-full border p-2 rounded-lg" value={formData.nis} onChange={e => setFormData({ ...formData, nis: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kelas</label>
                                    <select required className="w-full border p-2 rounded-lg" value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })}>
                                        <option value="">Pilih...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">L/P</label>
                                    <select className="w-full border p-2 rounded-lg" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">No. HP Ortu</label>
                                <input
                                    type="tel"
                                    className="w-full border p-2 rounded-lg"
                                    value={formData.parentPhone}
                                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default Students;
