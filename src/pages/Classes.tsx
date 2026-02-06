import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, Pencil, Search, BookOpen } from 'lucide-react';
import { Class } from '../types';

const Classes: React.FC = () => {
    const { classes, addClass, deleteClass } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');

    const handleAddClass = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        addClass({
            id: crypto.randomUUID(),
            name: newClassName
        });
        setNewClassName('');
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
                    <p className="text-gray-500">Kelola daftar kelas di sekolah</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Kelas
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <div key={cls.id} className="glass-panel p-6 rounded-2xl group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { if (confirm('Hapus kelas ini?')) deleteClass(cls.id) }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>ID: {cls.id.slice(0, 8)}</span>
                            {/* Could add student count here if available */}
                        </div>
                    </div>
                ))}

                {classes.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                        <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                        <p>Belum ada kelas yang ditambahkan</p>
                    </div>
                )}
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4">Tambah Kelas Baru</h2>
                        <form onSubmit={handleAddClass}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kelas</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: X IPA 1"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="btn-primary">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;
