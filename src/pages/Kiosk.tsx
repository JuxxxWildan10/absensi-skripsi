import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { supabase } from '../lib/supabase';
import LocationGuard from '../components/kiosk/LocationGuard';
import FaceVerification from '../components/kiosk/FaceVerification';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const Kiosk: React.FC = () => {
    const { classes, students } = useData();
    const navigate = useNavigate();

    const [step, setStep] = useState<'location' | 'class' | 'student' | 'face' | 'success'>('location');
    const [locationVerified, setLocationVerified] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [faceVerified, setFaceVerified] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleLocationVerified = (verified: boolean) => {
        setLocationVerified(verified);
        if (verified) {
            setTimeout(() => setStep('class'), 1000);
        }
    };

    const handleClassSelect = () => {
        if (selectedClassId) {
            setStep('student');
        }
    };

    const handleStudentSelect = () => {
        if (selectedStudentId) {
            setStep('face');
        }
    };

    const handleFaceDetected = (detected: boolean) => {
        setFaceVerified(detected);
    };

    const handleSubmit = async () => {
        if (!faceVerified || !selectedStudentId) return;

        setSubmitting(true);

        try {
            const today = format(new Date(), 'yyyy-MM-dd');

            // Check if already marked today
            const { data: existing } = await supabase
                .from('attendance')
                .select('*')
                .eq('student_id', selectedStudentId)
                .eq('date', today)
                .single();

            if (existing) {
                alert('Anda sudah melakukan check-in hari ini!');
                setSubmitting(false);
                return;
            }

            // Insert attendance record
            const { error } = await supabase
                .from('attendance')
                .insert([
                    {
                        student_id: selectedStudentId,
                        date: today,
                        subject: 'Self Check-in',
                        status: 'present'
                    }
                ]);

            if (error) throw error;

            setStep('success');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            console.error('Error submitting attendance:', err);
            alert('Gagal menyimpan presensi. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s => s.classId === selectedClassId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Mode Kiosk - Self Check-in</h1>
                    <p className="text-white/80">Verifikasi kehadiran Anda dengan lokasi dan wajah</p>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-between mb-8">
                    {['location', 'class', 'student', 'face', 'success'].map((s, idx) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? 'bg-white text-indigo-600' :
                                ['location', 'class', 'student', 'face', 'success'].indexOf(step) > idx ? 'bg-green-400 text-white' : 'bg-white/30 text-white/50'
                                }`}>
                                {idx + 1}
                            </div>
                            {idx < 4 && <div className="w-12 h-1 bg-white/30 mx-1" />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Location Verification */}
                {step === 'location' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4">Langkah 1: Verifikasi Lokasi</h2>
                        <LocationGuard onLocationVerified={handleLocationVerified} />
                        {!locationVerified && (
                            <p className="text-sm text-white/70 text-center">Pastikan Anda berada di area sekolah</p>
                        )}
                    </div>
                )}

                {/* Step 2: Class Selection */}
                {step === 'class' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4">Langkah 2: Pilih Kelas</h2>
                        <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-white/50 outline-none"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id} className="text-gray-800">{c.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleClassSelect}
                            disabled={!selectedClassId}
                            className="w-full px-4 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lanjut
                        </button>
                    </div>
                )}

                {/* Step 3: Student Selection */}
                {step === 'student' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4">Langkah 3: Pilih Nama Anda</h2>
                        <select
                            className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-white/50 outline-none"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                        >
                            <option value="">-- Pilih Nama --</option>
                            {filteredStudents.map(s => (
                                <option key={s.id} value={s.id} className="text-gray-800">{s.name} - {s.nis}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleStudentSelect}
                            disabled={!selectedStudentId}
                            className="w-full px-4 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lanjut
                        </button>
                    </div>
                )}

                {/* Step 4: Face Verification */}
                {step === 'face' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4">Langkah 4: Verifikasi Wajah</h2>
                        <FaceVerification onFaceDetected={handleFaceDetected} />
                        {faceVerified && (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full px-4 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Menyimpan...' : 'Konfirmasi Check-in'}
                            </button>
                        )}
                    </div>
                )}

                {/* Step 5: Success */}
                {step === 'success' && (
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Check-in Berhasil!</h2>
                        <p className="text-white/80">Kehadiran Anda telah tercatat</p>
                        <p className="text-sm text-white/60">Mengarahkan kembali ke halaman utama...</p>
                    </div>
                )}

                {/* Back Button */}
                {step !== 'location' && step !== 'success' && (
                    <button
                        onClick={() => setStep('location')}
                        className="mt-6 text-white/80 hover:text-white text-sm underline"
                    >
                        ← Kembali ke Awal
                    </button>
                )}
            </div>
        </div>
    );
};

export default Kiosk;
