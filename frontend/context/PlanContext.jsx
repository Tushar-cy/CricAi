import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
    const { user } = useAuth();
    const [userProfile, setUserProfile]   = useState(null);
    const [trainingPlan, setTrainingPlan] = useState(null);
    const [progress, setProgress]         = useState({});
    const [streak, setStreak]             = useState(0);
    const [isLoading, setIsLoading]       = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
        } else {
            setUserProfile(null);
            setTrainingPlan(null);
            setProgress({});
            setStreak(0);
            setIsLoading(false);
        }
    }, [user]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const userId = user.id;

            // 1. Try to load from Local Storage first (super fast & reliable)
            const localProfile  = await AsyncStorage.getItem(`@profile_${userId}`);
            const localPlan     = await AsyncStorage.getItem(`@plan_${userId}`);
            const localProgress = await AsyncStorage.getItem(`@progress_${userId}`);
            
            if (localProfile) setUserProfile(JSON.parse(localProfile));
            if (localPlan) setTrainingPlan(JSON.parse(localPlan));
            if (localProgress) {
                const prog = JSON.parse(localProgress);
                setProgress(prog);
                setStreak(calculateStreak(prog));
            }

            // 2. Silently try to sync from Supabase in the background (ignore if tables don't exist)
            Promise.allSettled([
                supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
                supabase.from('training_plans').select('*').eq('user_id', userId).maybeSingle(),
                supabase.from('progress').select('*').eq('user_id', userId),
            ]).then(([profileResult, planResult, progressResult]) => {
                if (profileResult.status === 'fulfilled' && profileResult.value.data && !localProfile) {
                    const p = profileResult.value.data;
                    setUserProfile({
                        name: p.name, age: p.age, ageMonths: p.age_months,
                        role: p.role, level: p.level,
                        availability: p.availability, fitness: p.fitness,
                        selectedCoach: p.selected_coach || 'virat',
                    });
                }
                if (planResult.status === 'fulfilled' && planResult.value.data && !localPlan) {
                    const row = planResult.value.data;
                    setTrainingPlan({
                        plan:          row.plan,
                        playerSummary: row.player_summary ?? null,
                    });
                }
            });

        } catch (e) {
            console.warn('[PlanContext] loadData error:', e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const saveUserProfile = async (profile) => {
        setUserProfile(profile);
        if (user) await AsyncStorage.setItem(`@profile_${user.id}`, JSON.stringify(profile));
        
        // Silently try Supabase (won't crash if table missing)
        supabase.from('user_profiles').upsert({
            user_id:       user.id,
            name:          profile.name,
            age:           profile.age,
            age_months:    profile.ageMonths ?? 0,
            role:          profile.role,
            level:         profile.level,
            availability:  profile.availability,
            fitness:       profile.fitness,
            selected_coach: profile.selectedCoach || 'virat',
            updated_at:    new Date().toISOString(),
        }, { onConflict: 'user_id' }).then(({error}) => {
            if (error) console.warn('Supabase profile sync failed:', error.message);
        });

        return true;
    };

    const saveTrainingPlan = async (planData) => {
        const planArray     = planData.plan ?? planData;
        const playerSummary = planData.playerSummary ?? null;
        const finalPlan = { plan: planArray, playerSummary };

        setTrainingPlan(finalPlan);
        setProgress({});
        setStreak(0);

        if (user) {
            await AsyncStorage.setItem(`@plan_${user.id}`, JSON.stringify(finalPlan));
            await AsyncStorage.setItem(`@progress_${user.id}`, JSON.stringify({}));
        }

        // Silently try Supabase
        supabase.from('training_plans').upsert({
            user_id:        user.id,
            plan:           planArray,
            player_summary: playerSummary,
            generated_at:   new Date().toISOString(),
        }, { onConflict: 'user_id' }).then(({error}) => {
            if (error) console.warn('Supabase plan sync failed:', error.message);
        });
        
        supabase.from('progress').delete().eq('user_id', user.id).then();
    };

    const markDayComplete = async (dayNumber) => {
        const today = new Date().toISOString().split('T')[0];
        const newProgress = {
            ...progress,
            [dayNumber]: { completed: true, completedAt: today },
        };
        setProgress(newProgress);
        setStreak(calculateStreak(newProgress));

        if (user) {
            await AsyncStorage.setItem(`@progress_${user.id}`, JSON.stringify(newProgress));
        }

        // Silently try Supabase
        supabase.from('progress').upsert({
            user_id:      user.id,
            day_number:   dayNumber,
            completed:    true,
            completed_at: today,
        }, { onConflict: 'user_id,day_number' }).then(({error}) => {
            if (error) console.warn('Supabase progress sync failed:', error.message);
        });
    };

    const saveSelectedCoach = async (coachKey) => {
        setUserProfile(prev => prev ? { ...prev, selectedCoach: coachKey } : prev);
        if (!user) return;
        await supabase.from('user_profiles').upsert({
            user_id:        user.id,
            selected_coach: coachKey,
            updated_at:     new Date().toISOString(),
        }, { onConflict: 'user_id' });
    };

    const calculateStreak = (progressData) => {
        let s = 0;
        for (let i = 1; i <= 100; i++) {
            if (progressData[i]?.completed) s++;
            else break;
        }
        return s;
    };

    const resetAll = async () => {
        setUserProfile(null);
        setTrainingPlan(null);
        setProgress({});
        setStreak(0);
        if (!user) return;
        
        await AsyncStorage.removeItem(`@profile_${user.id}`);
        await AsyncStorage.removeItem(`@plan_${user.id}`);
        await AsyncStorage.removeItem(`@progress_${user.id}`);

        Promise.allSettled([
            supabase.from('user_profiles').delete().eq('user_id', user.id),
            supabase.from('training_plans').delete().eq('user_id', user.id),
            supabase.from('progress').delete().eq('user_id', user.id),
        ]).then();
    };

    // ── Computed values ───────────────────────────────────────────────────────
    const completedDays     = Object.values(progress).filter(p => p.completed).length;
    const completionPercent = trainingPlan ? Math.round((completedDays / 100) * 100) : 0;
    const currentDay        = completedDays + 1;
    const planArray         = trainingPlan?.plan ?? [];
    const todayTask         = planArray.find(d => d.dayNumber === currentDay);
    const currentPhase      = todayTask?.phase || 1;

    const getWeeklyProgress = () => {
        const weeks = [];
        for (let week = 1; week <= 14; week++) {
            const startDay = (week - 1) * 7 + 1;
            const endDay   = Math.min(week * 7, 100);
            let count = 0;
            for (let d = startDay; d <= endDay; d++) {
                if (progress[d]?.completed) count++;
            }
            weeks.push({ week, completed: count, total: endDay - startDay + 1 });
        }
        return weeks;
    };

    return (
        <PlanContext.Provider value={{
            userProfile, trainingPlan, progress, streak, isLoading,
            completedDays, completionPercent, currentDay, todayTask, currentPhase,
            saveUserProfile, saveTrainingPlan, markDayComplete, resetAll,
            getWeeklyProgress, loadData, saveSelectedCoach,
        }}>
            {children}
        </PlanContext.Provider>
    );
}

export function usePlan() {
    const ctx = useContext(PlanContext);
    if (!ctx) throw new Error('usePlan must be used inside PlanProvider');
    return ctx;
}
