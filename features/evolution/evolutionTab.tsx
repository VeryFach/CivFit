import React, { useState } from 'react';
import { UserStats, CityState, Era, EvolutionBranch } from '@/core/types';
import { ERAS_CONFIG, EVOLUTION_BRANCHES, BUILDINGS } from '@/core/constants';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { ChevronRight, Target, Zap, Lock, Info } from 'lucide-react';

interface EvolutionTabProps {
    stats: UserStats;
    city: CityState;
    onBack: () => void;
    onUnlock: (branchId: string) => Promise<boolean>;
}

export function EvolutionTab({ stats, city, onBack, onUnlock }: EvolutionTabProps) {
    const [selectedEra, setSelectedEra] = useState<Era | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<EvolutionBranch | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const currentEraIndex = ERAS_CONFIG.findIndex(e => e.id === city.currentEra);

    const handleUnlock = async () => {
        if (!selectedBranch) return;
        setIsUnlocking(true);
        const success = await onUnlock(selectedBranch.id);
        if (success) {
            // Small feedback here if needed
        }
        setIsUnlocking(false);
    };

    return (
        <div className="flex flex-col gap-6 p-4 pb-32">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-brand-dark hover:text-brand-teal transition-colors font-black uppercase text-[10px] italic mb-2 w-fit"
            >
                <Icons.ArrowLeft className="w-4 h-4" />
                Kembali ke Kota
            </button>

            <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white neo-border-lg neo-shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Icons.GitBranch className="w-32 h-32" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 relative z-10">Pohon Evolusi</h2>
                <p className="text-brand-yellow font-black uppercase text-[10px] tracking-[0.3em] mb-6 relative z-10">Tentukan masa depan peradabanmu</p>

                <div className="flex items-center gap-2 bg-white/10 p-4 rounded-2xl neo-border relative z-10">
                    <Info className="w-5 h-5 text-brand-teal" />
                    <p className="text-[10px] font-bold leading-tight uppercase">
                        Pilihlah era untuk melihat jalur teknologi dan cabang kebudayaan yang tersedia.
                    </p>
                </div>
            </div>

            {/* Eras Timeline */}
            <div className="space-y-4">
                {ERAS_CONFIG.map((era, index) => {
                    const isUnlocked = stats.level >= era.minLevel;
                    const isCurrent = city.currentEra === era.id;
                    const isPast = index < currentEraIndex;

                    return (
                        <div key={era.id} className="relative">
                            {index !== ERAS_CONFIG.length - 1 && (
                                <div className={`absolute left-8 top-16 w-1 h-12 z-0 ${isPast ? 'bg-brand-teal' : 'bg-gray-200'}`} />
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedEra(era.id)}
                                className={`w-full text-left relative z-10 p-6 rounded-[2rem] neo-border-lg neo-shadow transition-all flex items-center gap-4 ${isUnlocked ? 'bg-white' : 'bg-gray-100 grayscale'
                                    } ${isCurrent ? 'border-brand-teal ring-4 ring-brand-teal/20' : 'border-gray-100'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl neo-border ${isCurrent ? 'bg-brand-teal text-white' : isUnlocked ? 'bg-brand-bg text-brand-dark' : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {isUnlocked ? (isCurrent ? '✨' : index + 1) : <Lock className="w-5 h-5" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-black uppercase italic tracking-tighter ${isUnlocked ? 'text-brand-dark' : 'text-gray-400'}`}>
                                            {era.name}
                                        </h3>
                                        {isCurrent && (
                                            <span className="bg-brand-teal text-brand-dark text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Aktif</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                        {isUnlocked ? 'Terbuka' : `Butuh Level ${era.minLevel}`}
                                    </p>
                                </div>

                                <ChevronRight className={`w-5 h-5 ${isUnlocked ? 'text-brand-dark' : 'text-gray-300'}`} />
                            </motion.button>
                        </div>
                    );
                })}
            </div>

            {/* Era Details Overlay */}
            <AnimatePresence>
                {selectedEra && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[600] bg-brand-dark/20 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
                        onClick={() => { setSelectedEra(null); setSelectedBranch(null); }}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] neo-border-lg neo-shadow-lg p-8 overflow-y-auto max-h-[90vh]"
                            onClick={(e: { stopPropagation: () => any; }) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-brand-dark">
                                        {ERAS_CONFIG.find(e => e.id === selectedEra)?.name}
                                    </h3>
                                    <p className="text-gray-400 font-extrabold uppercase text-[10px] tracking-[0.3em]">Cabang Peradaban</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedEra(null); setSelectedBranch(null); }}
                                    className="w-12 h-12 rounded-2xl bg-brand-bg neo-border flex items-center justify-center hover:bg-gray-100"
                                >
                                    <Icons.X className="w-6 h-6" />
                                </button>
                            </div>

                            <p className="font-bold text-sm text-gray-500 mb-8 italic">
                                "{ERAS_CONFIG.find(e => e.id === selectedEra)?.description}"
                            </p>

                            <div className="space-y-4 mb-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-dark opacity-40">Jalur Evolusi Tersedia</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {EVOLUTION_BRANCHES.filter(b => b.era === selectedEra).map(branch => {
                                        const Icon = (Icons as any)[branch.iconName] || Icons.Circle;
                                        const isBranchUnlocked = city.unlockedEvolutions?.includes(branch.id);
                                        return (
                                            <button
                                                key={branch.id}
                                                onClick={() => setSelectedBranch(branch)}
                                                className={`p-6 rounded-3xl border-2 text-center transition-all flex flex-col items-center gap-3 relative ${selectedBranch?.id === branch.id
                                                        ? 'bg-brand-teal border-brand-dark neo-shadow'
                                                        : isBranchUnlocked
                                                            ? 'bg-brand-teal/20 border-brand-teal/40'
                                                            : 'bg-brand-bg border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                {isBranchUnlocked && (
                                                    <div className="absolute top-2 right-2 bg-brand-teal text-white p-1 rounded-lg">
                                                        <Icons.Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                                <div className="w-14 h-14 rounded-2xl bg-white neo-border flex items-center justify-center">
                                                    <Icon className="w-8 h-8 text-brand-dark" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase italic tracking-tighter">{branch.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedBranch && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-brand-dark rounded-3xl p-6 text-white neo-border"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center">
                                                <Icons.Target className="w-5 h-5 text-brand-dark" />
                                            </div>
                                            <div>
                                                <h5 className="font-black uppercase italic tracking-tighter text-brand-teal">{selectedBranch.name}</h5>
                                                <p className="text-[8px] font-bold uppercase text-white/40 tracking-widest">Detail & Requirements</p>
                                            </div>
                                        </div>
                                        {city.unlockedEvolutions?.includes(selectedBranch.id) && (
                                            <span className="bg-brand-teal text-brand-dark px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Unlocked</span>
                                        )}
                                    </div>

                                    <p className="text-xs text-white/80 font-bold mb-6 italic leading-relaxed">
                                        "{selectedBranch.description}"
                                    </p>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-yellow">
                                            <Icons.CheckSquare className="w-4 h-4" /> Syarat Pembukaan
                                        </div>
                                        <div className="space-y-2">
                                            {selectedBranch.requirements.map((req, i) => {
                                                let isMet = false;
                                                if (req.type === 'level') isMet = stats.level >= (req.target as number);
                                                if (req.type === 'buildings') {
                                                    const count = city.buildings.filter(b => b.buildingTypeId === req.target).length;
                                                    isMet = count >= (typeof req.target === 'string' ? 2 : (req.target as number));
                                                }
                                                return (
                                                    <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl neo-border border-white/10">
                                                        <span className="text-[10px] font-bold text-white/60">{req.description}</span>
                                                        {isMet ? (
                                                            <Icons.Check className="w-4 h-4 text-brand-teal" />
                                                        ) : (
                                                            <Icons.Lock className="w-3 h-3 text-white/20" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-teal">
                                            <Zap className="w-4 h-4" /> Keuntungan Budaya
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {selectedBranch.benefits.map((benefit, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg text-[9px] font-bold text-white/80">
                                                    <div className="w-1.5 h-1.5 bg-brand-teal rounded-full" />
                                                    {benefit}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {!city.unlockedEvolutions?.includes(selectedBranch.id) && (
                                        <button
                                            disabled={isUnlocking || !selectedBranch.requirements.every(req => {
                                                if (req.type === 'level') return stats.level >= (req.target as number);
                                                if (req.type === 'buildings') return city.buildings.filter(b => b.buildingTypeId === req.target).length >= 2;
                                                return true;
                                            })}
                                            onClick={handleUnlock}
                                            className={`w-full py-4 rounded-2xl neo-border font-black uppercase italic tracking-widest text-sm transition-all focus:outline-none flex items-center justify-center gap-2 ${isUnlocking ? 'opacity-50' : ''
                                                } bg-brand-teal text-brand-dark shadow-[4px_4px_0_0_#FFF] hover:translate-y-1 hover:shadow-none disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none disabled:translate-y-0`}
                                        >
                                            {isUnlocking ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Zap className="w-4 h-4" />}
                                            Mulai Evolusi
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}