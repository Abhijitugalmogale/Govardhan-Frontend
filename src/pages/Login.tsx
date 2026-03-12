import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { auth, googleProvider } from '../config/firebase';
import { checkBackendConnectivity } from '../utils/backendCheck';

const Login: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [backendError, setBackendError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        // Check backend connectivity on page load
        const checkBackend = async () => {
            const result = await checkBackendConnectivity();
            if (!result.isAvailable) {
                setBackendError(result.message);
                console.warn('Backend connectivity issue:', result);
            }
        };
        checkBackend();
    }, []);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            let user;

            // Check if running natively (Android/iOS)
            if (Capacitor.isNativePlatform()) {
                // Use Native Capacitor Google Auth
                const googleUser = await GoogleAuth.signIn();
                
                // Create a Firebase credential from the native Google ID token
                const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
                
                // Sign in to Firebase with the credential
                const result = await signInWithCredential(auth, credential);
                user = result.user;
            } else {
                // Fallback to standard web popup for browser testing
                const result = await signInWithPopup(auth, googleProvider);
                user = result.user;
            }

            toast.success(`Welcome, ${user.displayName || 'User'}!`);
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            
            let errorMessage = "Failed to sign in with Google. Please try again.";
            
            // Handle Web errors
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Sign-in popup was closed before completing.";
            } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
                errorMessage = "Google Sign-In is not supported in this environment (e.g., HTTP).";
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = "Sign-in popup was blocked by the browser. Please allow popups for this site.";
            } 
            // Generic fallback
            else if (error.message) {
                 errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
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
                    <p className="text-gray-600 mb-8">Sign in with your Google account to access your dashboard.</p>

                    {backendError && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Backend Connection Warning</p>
                                <p className="text-xs text-yellow-700 mt-1">{backendError}</p>
                                <p className="text-xs text-yellow-600 mt-2">You may still log in, but dashboard data may not load.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary-dark border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                                        <title>Google Logo</title>
                                        <clipPath id="g"><path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></clipPath>
                                        <g className="colors" clipPath="url(#g)">
                                            <path fill="#FBBC05" d="M0 37V11l17 13z"/>
                                            <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/>
                                            <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/>
                                            <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/>
                                        </g>
                                    </svg>
                                    Sign in with Google
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100 flex justify-center">
                    <p className="text-xs text-gray-400">Secure Authentication powered by Google</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
