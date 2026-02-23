import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlanContext = createContext(null);

const STORAGE_KEYS = {
    USER_PROFILE: '@cricai_user_profile',
    TRAINING_PLAN: '@cricai_training_plan',
    PROGRESS: '@cricai_progress',
    STREAK: '@cricai_streak',
};

export function PlanProvider({ children }) {
    const [userProfile, setUserProfile] = useState(null);
    const [trainingPlan, setTrainingPlan] = useState(null);
    const [progress, setProgress] = useState({}); // { dayNumber: { completed, completedAt } }
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted data on mount
    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = async () => {
        try {
            const [profileStr, planStr, progressStr, streakStr] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
                AsyncStorage.getItem(STORAGE_KEYS.TRAINING_PLAN),
                AsyncStorage.getItem(STORAGE_KEYS.PROGRESS),
                AsyncStorage.getItem(STORAGE_KEYS.STREAK),
            ]);

            if (profileStr) setUserProfile(JSON.parse(profileStr));
            if (planStr) setTrainingPlan(JSON.parse(planStr));
            if (progressStr) setProgress(JSON.parse(progressStr));
            if (streakStr) setStreak(parseInt(streakStr, 10));
        } catch (e) {
            console.error('Error loading stored data:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveUserProfile = async (profile) => {
        setUserProfile(profile);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    };

    const saveTrainingPlan = async (plan) => {
        setTrainingPlan(plan);
        setProgress({});
        setStreak(0);
        await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.TRAINING_PLAN, JSON.stringify(plan)),
            AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS),
            AsyncStorage.setItem(STORAGE_KEYS.STREAK, '0'),
        ]);
    };

    const markDayComplete = async (dayNumber) => {
        const today = new Date().toISOString().split('T')[0];
        const newProgress = {
            ...progress,
            [dayNumber]: { completed: true, completedAt: today },
        };
        setProgress(newProgress);

        // Calculate streak
        const newStreak = calculateStreak(newProgress);
        setStreak(newStreak);

        await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(newProgress)),
            AsyncStorage.setItem(STORAGE_KEYS.STREAK, String(newStreak)),
        ]);
    };

    const calculateStreak = (progressData) => {
        const today = new Date();
        let streak = 0;
        for (let i = 1; i <= 100; i++) {
            if (progressData[i]?.completed) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    const resetAll = async () => {
        setUserProfile(null);
        setTrainingPlan(null);
        setProgress({});
        setStreak(0);
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    };

    // Computed values
    const completedDays = Object.values(progress).filter(p => p.completed).length;
    const completionPercent = trainingPlan ? Math.round((completedDays / 100) * 100) : 0;
    const currentDay = completedDays + 1;
    const todayTask = trainingPlan?.plan?.find(d => d.dayNumber === currentDay);
    const currentPhase = todayTask?.phase || 1;

    const getWeeklyProgress = () => {
        const weeks = [];
        for (let week = 1; week <= 14; week++) {
            const startDay = (week - 1) * 7 + 1;
            const endDay = Math.min(week * 7, 100);
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
            userProfile,
            trainingPlan,
            progress,
            streak,
            isLoading,
            completedDays,
            completionPercent,
            currentDay,
            todayTask,
            currentPhase,
            saveUserProfile,
            saveTrainingPlan,
            markDayComplete,
            resetAll,
            getWeeklyProgress,
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
