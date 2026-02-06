import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, GraduationCap, ClipboardCheck, FileBarChart, LogOut, UserCog, CalendarClock, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'teacher'] },
        { to: '/attendance', icon: ClipboardCheck, label: 'Absensi', roles: ['teacher', 'admin'] },
        { to: '/students', icon: Users, label: 'Data Siswa', roles: ['admin'] },
        { to: '/classes', icon: GraduationCap, label: 'Data Kelas', roles: ['admin'] },
        { to: '/teachers', icon: UserCog, label: 'Data Guru', roles: ['admin'] },
        { to: '/schedules', icon: CalendarClock, label: 'Jadwal Pelajaran', roles: ['admin'] },
        { to: '/reports', icon: FileBarChart, label: 'Laporan', roles: ['admin', 'teacher'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        user?.role && item.roles.includes(user.role)
    );

    // Close sidebar when route changes
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
            {/* Mobile Header/Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Menu Button - Floats nicely on top left or integrated into a top bar */}
            <div className="md:hidden fixed top-4 left-4 z-40">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-50"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg transition-transform duration-300 transform",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <ClipboardCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        SchoolApp
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize truncate">{user?.role} {user?.subject ? ` - ${user.subject}` : ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative w-full">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                <div className="relative p-4 md:p-8 max-w-7xl mx-auto pt-16 md:pt-8">
                    <div className="min-h-[calc(100vh-4rem)]">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
