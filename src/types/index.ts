export interface Timer {
  id: string;
  name: string;
  originalDuration: number; // in seconds
  remainingTime: number; // in seconds
  category: string;
  status: 'idle' | 'running' | 'paused' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  halfwayAlertEnabled: boolean;
  halfwayAlertTriggered: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
}

export interface HistoryItem {
  id: string;
  timerName: string;
  category: string;
  duration: number;
  completedAt: Date;
}

export interface AppState {
  timers: Timer[];
  categories: Category[];
  history: HistoryItem[];
  theme: 'light' | 'dark';
  isLoaded: boolean;
}

export interface TimerContextType {
  state: AppState;
  dispatch: React.Dispatch<TimerAction>;
  addTimer: (
    timer: Omit<
      Timer,
      'id' | 'createdAt' | 'status' | 'remainingTime' | 'halfwayAlertTriggered'
    >,
  ) => void;
  updateTimer: (id: string, updates: Partial<Timer>) => void;
  deleteTimer: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  completeTimer: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  toggleCategoryExpansion: (id: string) => void;
  startAllTimersInCategory: (categoryId: string) => void;
  pauseAllTimersInCategory: (categoryId: string) => void;
  resetAllTimersInCategory: (categoryId: string) => void;
  exportData: () => string;
  toggleTheme: () => void;
  clearHistory: () => void;
}

export type TimerAction =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADD_TIMER'; payload: Timer }
  | { type: 'UPDATE_TIMER'; payload: { id: string; updates: Partial<Timer> } }
  | { type: 'DELETE_TIMER'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | {
      type: 'UPDATE_CATEGORY';
      payload: { id: string; updates: Partial<Category> };
    }
  | { type: 'TOGGLE_CATEGORY_EXPANSION'; payload: string }
  | { type: 'ADD_HISTORY_ITEM'; payload: HistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_LOADED'; payload: boolean };

export interface AddTimerFormData {
  name: string;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  category: string;
  halfwayAlertEnabled: boolean;
}

export interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  scheduledTime?: Date;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    accent: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
}
