import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

const STORAGE_KEY = '@timer_app_state';

export const saveAppState = async (state: AppState): Promise<void> => {
  try {
    const jsonValue = JSON.stringify({
      ...state,
      // Convert Date objects to ISO strings for storage
      timers: state.timers.map(timer => ({
        ...timer,
        createdAt: timer.createdAt.toISOString(),
        completedAt: timer.completedAt
          ? timer.completedAt.toISOString()
          : undefined,
      })),
      history: state.history.map(item => ({
        ...item,
        completedAt: item.completedAt.toISOString(),
      })),
    });
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
};

export const loadAppState = async (): Promise<AppState | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      // Convert ISO strings back to Date objects
      return {
        ...parsed,
        timers: parsed.timers.map((timer: any) => ({
          ...timer,
          createdAt: new Date(timer.createdAt),
          completedAt: timer.completedAt
            ? new Date(timer.completedAt)
            : undefined,
        })),
        history: parsed.history.map((item: any) => ({
          ...item,
          completedAt: new Date(item.completedAt),
        })),
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to load app state:', error);
    return null;
  }
};

export const clearAppState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear app state:', error);
  }
};
