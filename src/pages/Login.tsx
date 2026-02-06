import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, Lock, Smartphone } from 'lucide-react';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Username atau password salah');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-lg bg-opacity-90">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-indigo-100 rounded-full">
                        <UserCheck className="w-10 h-10 text-indigo-600" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Selamat Datang</h2>
                <p className="text-center text-gray-500 mb-8">Silakan login untuk masuk ke sistem</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="Masukkan username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full btn-primary py-3 text-lg font-semibold"
                    >
                        Masuk Aplikasi
                    </button>
                </form>

                {/* Kiosk Mode Link */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link
                        to="/kiosk"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 rounded-xl font-semibold hover:from-purple-200 hover:to-indigo-200 transition-all"
                    >
                        <Smartphone className="w-5 h-5" />
                        Mode Kiosk - Self Check-in Siswa
                    </Link>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        Untuk siswa yang ingin check-in sendiri
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;
