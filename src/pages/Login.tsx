import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '../config/firebase';

const Login: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible'
            });
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error('Please enter a valid mobile number');
            return;
        }

        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        try {
            setupRecaptcha();
            const appVerifier = (window as any).recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            toast.success(`OTP sent to ${formattedPhone}`);
            setStep(2);
        } catch (error: any) {
            console.error("OTP Error:", error);

            // Provide more specific error messages for common Firebase issues
            let errorMessage = "Failed to send OTP. Please try again.";
            if (error.code === 'auth/billing-not-enabled') {
                errorMessage = "Firebase Error: Project must be on the Blaze plan to send SMS.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);

            // Clear recaptcha on error so user can try again
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
                const container = document.getElementById('recaptcha-container');
                if (container) container.innerHTML = '';
            }
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 4) {
            toast.error('Invalid OTP');
            return;
        }

        if (!confirmationResult) return;

        try {
            await confirmationResult.confirm(otp);
            toast.success('Login Successful!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Verification Error:", error);
            toast.error('Invalid OTP. Please try again.');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
            style={{
                backgroundImage: 'url(/cow-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/40 to-black/60 z-0"></div>

            <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-white/40">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-primary-dark font-bold text-xl flex items-center gap-2">
                            {/* Add SVG Cow Icon */}
                            <svg className="w-8 h-8 text-primary-dark" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 13.5c-.7 0-1.7-.5-2.2-1.3l-1.3-2.1c-.2-.4-.7-.7-1.1-.9L14 7c-.6-.4-1.4-.6-2.1-.6h-1c-.5 0-.9-.3-1.1-.7l-.4-1.1c-.2-.6-.9-1-1.5-1h-2c-.5 0-.9.2-1.2.6L3.9 6c-.4.5-.6 1.1-.5 1.7L4 12c.1.7.5 1.4 1 1.9l2 1.9v3.7c0 1.2 1 2.2 2.2 2.2h.1c1.2 0 2.2-1 2.2-2.2v-1h3v1c0 1.2 1 2.2 2.2 2.2h.1c1.2 0 2.2-1 2.2-2.2v-3.7l1.7-1.4c.5-.4.8-1 .9-1.6l.4-2.8z"></path></svg>
                            <span className="text-3xl tracking-wide text-primary-dark" style={{ fontFamily: "'Yatra One', cursive", paddingTop: '4px' }}>गोवर्धन</span>
                        </div>
                        <div className="flex gap-2 relative z-20">
                            <button onClick={() => i18n.changeLanguage('en')} className={`text-xs px-2 py-1 rounded-md transition-colors ${i18n.language === 'en' ? 'bg-primary-dark text-white' : 'bg-gray-200 text-gray-700'}`}>EN</button>
                            <button onClick={() => i18n.changeLanguage('hi')} className={`text-xs px-2 py-1 rounded-md transition-colors ${i18n.language === 'hi' ? 'bg-primary-dark text-white' : 'bg-gray-200 text-gray-700'}`}>HI</button>
                            <button onClick={() => i18n.changeLanguage('mr')} className={`text-xs px-2 py-1 rounded-md transition-colors ${i18n.language === 'mr' ? 'bg-primary-dark text-white' : 'bg-gray-200 text-gray-700'}`}>MR</button>
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{t('welcome')}</h1>
                    <p className="text-gray-600 mb-8">{step === 1 ? 'Enter your mobile number to continue.' : 'Enter the code sent to your phone.'}</p>

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('mobile_number')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Smartphone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary-dark focus:border-primary-dark transition-shadow text-gray-900 shadow-sm"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div id="recaptcha-container"></div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-dark hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
                            >
                                {t('get_otp')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('enter_otp')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary-dark focus:border-primary-dark transition-shadow text-gray-900 shadow-sm tracking-widest text-center font-bold text-lg"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-dark hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
                            >
                                {t('verify')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-sm text-gray-500 hover:text-primary-dark transition-colors"
                            >
                                Change Mobile Number
                            </button>
                        </form>
                    )}
                </div>
                <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100 flex justify-center">
                    <p className="text-xs text-gray-400">Secure OTP Authentication powered by Firebase</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
