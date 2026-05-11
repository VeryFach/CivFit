import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '@/services/firebase/index';

export function LoginScreen() {
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full"
            >
                <div className="mb-8 relative inline-block">
                    <div className="w-24 h-24 bg-brand-teal rounded-[2rem] neo-border shadow-[6px_6px_0_0_#2D3436] flex items-center justify-center text-4xl transform -rotate-6">
                        🏰
                    </div>
                    <div className="absolute -top-4 -right-4 bg-brand-yellow p-2 rounded-xl neo-border shadow-[2px_2px_0_0_#2D3436] animate-bounce">
                        <Sparkles className="w-6 h-6 text-brand-dark" />
                    </div>
                </div>

                <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4 text-brand-dark">
                    CIV<span className="text-brand-teal">FIT</span>
                </h1>
                <p className="text-brand-dark/40 font-black uppercase text-xs tracking-[0.3em] mb-12">
                    Sync your productivity with the simulation
                </p>

                <div className="space-y-4">
                    <button
                        onClick={signInWithGoogle}
                        className="w-full bg-brand-dark text-white font-black py-6 rounded-3xl neo-shadow-lg hover:bg-brand-dark/90 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4 text-xl italic uppercase tracking-tighter"
                    >
                        <LogIn className="w-6 h-6" />
                        Sign in with Google
                    </button>

                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-8">
                        Your data is stored securely in the cloud via Firebase.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}