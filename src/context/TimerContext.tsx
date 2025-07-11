import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, TimerAction, TimerContextType, Timer, Category, HistoryItem } from '../types';
import { saveAppState, loadAppState } from '../utils/storage';
import { generateId } from '../utils/timerUtils';
import { getRandomCategoryColor } from '../constants/themes';
import notificationService from '../services/NotificationService';

const initialState: AppState = {
    timers: [],
    categories: [
        {
            id: 'default',
            name: 'General',
            color: '#007AFF',
            isExpanded: true,
        },
    ],
    history: [],
    theme: 'light',
    isLoaded: false,
};

const timerReducer = (state: AppState, action: TimerAction): AppState => {
    switch (action.type) {
        case 'SET_STATE':
            return action.payload;

        case 'SET_LOADED':
            return { ...state, isLoaded: action.payload };

        case 'ADD_TIMER':
            return {
                ...state,
                timers: [...state.timers, action.payload],
            };

        case 'UPDATE_TIMER':
            return {
                ...state,
                timers: state.timers.map(timer =>
                    timer.id === action.payload.id
                        ? { ...timer, ...action.payload.updates }
                        : timer
                ),
            };

        case 'DELETE_TIMER':
            return {
                ...state,
                timers: state.timers.filter(timer => timer.id !== action.payload),
            };

        case 'ADD_CATEGORY':
            return {
                ...state,
                categories: [...state.categories, action.payload],
            };

        case 'UPDATE_CATEGORY':
            return {
                ...state,
                categories: state.categories.map(category =>
                    category.id === action.payload.id
                        ? { ...category, ...action.payload.updates }
                        : category
                ),
            };

        case 'TOGGLE_CATEGORY_EXPANSION':
            return {
                ...state,
                categories: state.categories.map(category =>
                    category.id === action.payload
                        ? { ...category, isExpanded: !category.isExpanded }
                        : category
                ),
            };

        case 'ADD_HISTORY_ITEM':
            return {
                ...state,
                history: [action.payload, ...state.history],
            };

        case 'CLEAR_HISTORY':
            return {
                ...state,
                history: [],
            };

        case 'TOGGLE_THEME':
            return {
                ...state,
                theme: state.theme === 'light' ? 'dark' : 'light',
            };

        default:
            return state;
    }
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
    children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(timerReducer, initialState);

    // Load saved state on app start
    useEffect(() => {
        const loadSavedState = async () => {
            try {
                const savedState = await loadAppState();
                if (savedState) {
                    dispatch({ type: 'SET_STATE', payload: savedState });
                }
            } catch (error) {
                console.error('Failed to load saved state:', error);
            } finally {
                dispatch({ type: 'SET_LOADED', payload: true });
            }
        };

        loadSavedState();
    }, []);

    // Save state whenever it changes (debounced)
    useEffect(() => {
        if (!state.isLoaded) return;

        const saveTimeout = setTimeout(() => {
            saveAppState(state);
        }, 500);

        return () => clearTimeout(saveTimeout);
    }, [state]);

    const addTimer = (timerData: Omit<Timer, 'id' | 'createdAt' | 'status' | 'remainingTime' | 'halfwayAlertTriggered'>) => {
        const newTimer: Timer = {
            ...timerData,
            id: generateId(),
            createdAt: new Date(),
            status: 'idle',
            remainingTime: timerData.originalDuration,
            halfwayAlertTriggered: false,
        };

        dispatch({ type: 'ADD_TIMER', payload: newTimer });

        // Create category if it doesn't exist
        const categoryExists = state.categories.some(cat => cat.name === timerData.category);
        if (!categoryExists) {
            const newCategory: Category = {
                id: generateId(),
                name: timerData.category,
                color: getRandomCategoryColor(),
                isExpanded: true,
            };
            dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
        }
    };

    const updateTimer = (id: string, updates: Partial<Timer>) => {
        dispatch({ type: 'UPDATE_TIMER', payload: { id, updates } });
    };

    const deleteTimer = (id: string) => {
        // Cancel scheduled notifications for this timer
        notificationService.cancelAllNotificationsForTimer(id);
        dispatch({ type: 'DELETE_TIMER', payload: id });
    };

    const startTimer = (id: string) => {
        const timer = state.timers.find(t => t.id === id);
        if (timer) {
            updateTimer(id, { status: 'running' });

            // Schedule completion notification
            notificationService.scheduleTimerCompletionNotification(
                timer.id,
                timer.name,
                timer.remainingTime
            );

            // Schedule halfway notification if enabled and not already triggered
            if (timer.halfwayAlertEnabled && !timer.halfwayAlertTriggered) {
                notificationService.scheduleHalfwayNotification(
                    timer.id,
                    timer.name,
                    timer.remainingTime
                );
            }
        }
    };

    const pauseTimer = (id: string) => {
        updateTimer(id, { status: 'paused' });
        // Cancel scheduled notifications for this timer
        notificationService.cancelAllNotificationsForTimer(id);
    };

    const resetTimer = (id: string) => {
        const timer = state.timers.find(t => t.id === id);
        if (timer) {
            updateTimer(id, {
                remainingTime: timer.originalDuration,
                status: 'idle',
                halfwayAlertTriggered: false,
            });
            // Cancel scheduled notifications for this timer
            notificationService.cancelAllNotificationsForTimer(id);
        }
    };

    const completeTimer = (id: string) => {
        const timer = state.timers.find(t => t.id === id);
        if (timer) {
            const historyItem: HistoryItem = {
                id: generateId(),
                timerName: timer.name,
                category: timer.category,
                duration: timer.originalDuration,
                completedAt: new Date(),
            };

            updateTimer(id, { status: 'completed', completedAt: new Date() });
            dispatch({ type: 'ADD_HISTORY_ITEM', payload: historyItem });

            // Cancel any remaining scheduled notifications for this timer
            notificationService.cancelAllNotificationsForTimer(id);

            // Show immediate completion notification (fallback for background mode)
            notificationService.showImmediateNotification(
                '🎉 Timer Completed!',
                `"${timer.name}" has finished!`
            );
        }
    };

    const addCategory = (categoryData: Omit<Category, 'id'>) => {
        const newCategory: Category = {
            ...categoryData,
            id: generateId(),
        };
        dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    };

    const updateCategory = (id: string, updates: Partial<Category>) => {
        dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
    };

    const toggleCategoryExpansion = (id: string) => {
        dispatch({ type: 'TOGGLE_CATEGORY_EXPANSION', payload: id });
    };

    const startAllTimersInCategory = (categoryName: string) => {
        state.timers
            .filter(timer => timer.category === categoryName && timer.status !== 'completed')
            .forEach(timer => startTimer(timer.id));
    };

    const pauseAllTimersInCategory = (categoryName: string) => {
        state.timers
            .filter(timer => timer.category === categoryName && timer.status === 'running')
            .forEach(timer => pauseTimer(timer.id));
    };

    const resetAllTimersInCategory = (categoryName: string) => {
        state.timers
            .filter(timer => timer.category === categoryName)
            .forEach(timer => resetTimer(timer.id));
    };

    const exportData = (): string => {
        const exportData = {
            timers: state.timers,
            categories: state.categories,
            history: state.history,
            exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
    };

    const toggleTheme = () => {
        dispatch({ type: 'TOGGLE_THEME' });
    };

    const clearHistory = () => {
        dispatch({ type: 'CLEAR_HISTORY' });
    };

    const contextValue: TimerContextType = {
        state,
        dispatch,
        addTimer,
        updateTimer,
        deleteTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        completeTimer,
        addCategory,
        updateCategory,
        toggleCategoryExpansion,
        startAllTimersInCategory,
        pauseAllTimersInCategory,
        resetAllTimersInCategory,
        exportData,
        toggleTheme,
        clearHistory,
    };

    return (
        <TimerContext.Provider value={contextValue}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = (): TimerContextType => {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}; 