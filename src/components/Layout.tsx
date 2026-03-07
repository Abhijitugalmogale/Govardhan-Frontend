import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Droplets, Wallet, Bell, Menu, X, LogOut, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: t('dashboard'), path: '/dashboard', icon: Home },
        { name: t('cows'), path: '/cows', icon: ClipboardList },
        { name: 'Breeding', path: '/pregnancy', icon: HeartPulse },
        { name: t('milk'), path: '/milk', icon: Droplets },
        { name: t('finance'), path: '/finance', icon: Wallet },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col border-r border-gray-100">
                <div className="p-6 flex items-center gap-3 border-b border-gray-50">
                    <svg className="w-8 h-8 text-primary-dark" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 13.5c-.7 0-1.7-.5-2.2-1.3l-1.3-2.1c-.2-.4-.7-.7-1.1-.9L14 7c-.6-.4-1.4-.6-2.1-.6h-1c-.5 0-.9-.3-1.1-.7l-.4-1.1c-.2-.6-.9-1-1.5-1h-2c-.5 0-.9.2-1.2.6L3.9 6c-.4.5-.6 1.1-.5 1.7L4 12c.1.7.5 1.4 1 1.9l2 1.9v3.7c0 1.2 1 2.2 2.2 2.2h.1c1.2 0 2.2-1 2.2-2.2v-1h3v1c0 1.2 1 2.2 2.2 2.2h.1c1.2 0 2.2-1 2.2-2.2v-3.7l1.7-1.4c.5-.4.8-1 .9-1.6l.4-2.8z"></path></svg>
                    <span className="text-2xl text-primary-dark tracking-wide" style={{ fontFamily: "'Yatra One', cursive" }}>गोवर्धन</span>
                </div>
                <nav className="flex-1 p-4 space-y-2 relative">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/20 text-primary-dark font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-dark' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-50 space-y-4">
                    <div className="flex gap-2 justify-center mb-4 bg-gray-50 p-1 rounded-lg">
                        <button onClick={() => i18n.changeLanguage('en')} className={`text-xs flex-1 py-1 rounded-md transition-shadow ${i18n.language === 'en' ? 'bg-white shadow text-primary-dark font-bold' : 'text-gray-500'}`}>EN</button>
                        <button onClick={() => i18n.changeLanguage('hi')} className={`text-xs flex-1 py-1 rounded-md transition-shadow ${i18n.language === 'hi' ? 'bg-white shadow text-primary-dark font-bold' : 'text-gray-500'}`}>HI</button>
                        <button onClick={() => i18n.changeLanguage('mr')} className={`text-xs flex-1 py-1 rounded-md transition-shadow ${i18n.language === 'mr' ? 'bg-white shadow text-primary-dark font-bold' : 'text-gray-500'}`}>MR</button>
                    </div>
                    <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-5 h-5" />
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <svg className="w-8 h-8 text-primary-dark" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 13.5c-.7 0-1.7-.5-2.2-1.3l-1.3-2.1c-.2-.4-.7-.7-1.1-.9L14 7c-.6-.4-1.4-.6-2.1-.6h-1c-.5 0-.9-.3-1.1-.7l-.4-1.1c-.2-.6-.9-1-1.5-1h-2c-.5 0-.9.2-1.2.6L3.9 6c-.4.5-.6 1.1-.5 1.7L4 12c.1.7.5 1.4 1 1.9l2 1.9v3.7c0 1.2 1 2.2 2.2 2.2h.1c1.2 0 2.2-1 2.2-2.2v-1h3v1c0 1.2 1 2.2 2.2 2.2h.1c1.2 0 2.2-1 2.2-2.2v-3.7l1.7-1.4c.5-.4.8-1 .9-1.6l.4-2.8z"></path></svg>
                    <span className="text-2xl tracking-wide text-primary-dark" style={{ fontFamily: "'Yatra One', cursive" }}>गोवर्धन</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-gray-500 relative">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700">
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-10 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute right-0 top-[60px] bottom-0 w-64 bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <nav className="flex-1 p-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/20 text-primary-dark font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-primary-dark' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t border-gray-50">
                            <div className="flex gap-2 justify-center mb-4 bg-gray-50 p-1 rounded-lg">
                                <button onClick={() => { i18n.changeLanguage('en'); setIsMobileMenuOpen(false); }} className={`text-xs flex-1 py-1 rounded-md transition-shadow ${i18n.language === 'en' ? 'bg-white shadow text-primary-dark font-bold' : 'text-gray-500'}`}>EN</button>
                                <button onClick={() => { i18n.changeLanguage('hi'); setIsMobileMenuOpen(false); }} className={`text-xs flex-1 py-1 rounded-md transition-shadow ${i18n.language === 'hi' ? 'bg-white shadow text-primary-dark font-bold' : 'text-gray-500'}`}>HI</button>
                                <button onClick={() => { i18n.changeLanguage('mr'); setIsMobileMenuOpen(false); }} className={`text-xs flex-1 py-1 rounded-md transition-shadow ${i18n.language === 'mr' ? 'bg-white shadow text-primary-dark font-bold' : 'text-gray-500'}`}>MR</button>
                            </div>
                            <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 transition-colors">
                                <LogOut className="w-5 h-5" />
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                <header className="hidden md:flex justify-end items-center mb-8 gap-4">
                    <button className="text-gray-400 hover:text-gray-600 relative bg-white p-2 rounded-full shadow-sm">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-dark font-bold shadow-sm">
                        DF
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
};

export default Layout;
