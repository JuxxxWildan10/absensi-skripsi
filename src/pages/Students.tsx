import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Search, GraduationCap, Edit2, Upload, Download, History } from 'lucide-react';
import { Student } from '../types';
import { importStudentsFromExcel } from '../utils/ExportUtils';
import StudentHistoryModal from '../components/StudentHistoryModal';

const Students: React.FC = () => {
    const { students, classes, addStudent, bulkAddStudents, updateStudent, deleteStudent } = useData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('all');

    // Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importClassId, setImportClassId] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // History State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedStudentHistory, setSelectedStudentHistory] = useState<Student | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        nis: '',
        classId: '',
        gender: 'L' as 'L' | 'P',
        parentPhone: ''
    });

    const filteredStudents = useMemo(() => {
        let filtered = students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.nis.includes(search);
            const matchesClass = filterClass === 'all' || student.classId === filterClass;
            return matchesSearch && matchesClass;
        });

        // PRIVACY FILTER: If user is a homeroom teacher, only show their homeroom class students
        if (user?.role === 'teacher' && user?.homeroomClassId) {
            filtered = filtered.filter(s => s.classId === user.homeroomClassId);
        }

        return filtered;
    }, [students, search, filterClass, user]);

    const openAddModal = () => {
        setEditingStudent(null);
        setFormData({ name: '', nis: '', classId: '', gender: 'L', parentPhone: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            nis: student.nis,
            classId: student.classId,
            gender: student.gender,
            parentPhone: student.parentPhone || ''
        });
        setIsModalOpen(true);
    };

    const openHistoryModal = (student: Student) => {
        setSelectedStudentHistory(student);
        setIsHistoryModalOpen(true);
    };

    const handleSaveStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.classId) {
            alert("Pilih kelas terlebih dahulu");
            return;
        }

        if (editingStudent) {
            updateStudent({
                ...editingStudent,
                ...formData
            });
        } else {
            addStudent({
                id: crypto.randomUUID(),
                ...formData
            });
        }
        setIsModalOpen(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !importClassId) return;

        setIsImporting(true);
        try {
            const importedData = await importStudentsFromExcel(file);

            if (importedData.length === 0) {
                alert("Format file tidak valid atau data kosong. Pastikan menggunakan format yang benar (terdapat kolom NIS dan Nama Lengkap).");
                return;
            }

            const newStudents: Student[] = importedData.map(item => ({
                id: crypto.randomUUID(),
                name: item.name,
                nis: item.nis,
                gender: item.gender as 'L' | 'P',
                classId: importClassId,
                parentPhone: item.parentPhone
            }));

            const success = await bulkAddStudents(newStudents);
            if (success) {
                alert(`Berhasil mengimpor ${newStudents.length} siswa!`);
                setIsImportModalOpen(false);
            }
        } catch (error) {
            console.error('Import error:', error);
            alert("Gagal membaca file Excel. Pastikan formatnya benar.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
                    <p className="text-gray-500">Kelola data siswa per kelas</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setImportClassId('');
                            setIsImportModalOpen(true);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2 shadow-sm font-medium"
                    >
                        <Upload className="w-4 h-4" />
                        Import Excel
                    </button>
                    <button
                        onClick={openAddModal}
                        className="btn-primary flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Siswa
                    </button>
                </div>
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
                                                        onClick={() => openHistoryModal(student)}
                                                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-2"
                                                        title="Riwayat Presensi"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(student)}
                                                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                                                        title="Edit Data"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { if (confirm('Hapus siswa?')) deleteStudent(student.id) }}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Siswa"
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

            {/* Import Excel Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Import Data Siswa</h2>
                                <p className="text-sm text-gray-500">Format: .xlsx atau .xls</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Pilih Kelas Tujuan</label>
                                <select
                                    className="w-full border p-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-colors"
                                    value={importClassId}
                                    onChange={e => setImportClassId(e.target.value)}
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                                <p className="font-semibold mb-1">Struktur Kolom Excel:</p>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>NIS (Wajib)</li>
                                    <li>Nama Lengkap (Wajib)</li>
                                    <li>L/P (Opsional, Laki-laki / Perempuan)</li>
                                    <li>No HP Wali (Opsional)</li>
                                </ol>
                                <p className="mt-2 text-xs italic">*Baris pertama akan diabaikan (dianggap Header).</p>
                            </div>

                            <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center relative">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-600 text-center mb-1">Pilih File Excel Anda</p>
                                <p className="text-xs text-gray-400">Pastikan kelas sudah dipilih sebelum memilih file</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".xlsx, .xls"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={!importClassId || isImporting}
                                />
                            </div>

                            {isImporting && (
                                <p className="text-sm text-center text-blue-600 animate-pulse font-medium">Sedang memproses data...</p>
                            )}

                            <div className="flex justify-between items-center pt-2">
                                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                    <Download className="w-4 h-4" /> Download Template
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa'}</h2>
                        <form onSubmit={handleSaveStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                                <input required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">NIS</label>
                                <input required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.nis} onChange={e => setFormData({ ...formData, nis: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kelas</label>
                                    <select required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })}>
                                        <option value="">Pilih...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">L/P</label>
                                    <select className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">No. HP Ortu</label>
                                <input
                                    type="tel"
                                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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

            <StudentHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                student={selectedStudentHistory}
            />
        </div >
    );
};

export default Students;
