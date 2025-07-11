import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AddTimerScreen from '../screens/AddTimerScreen';
import { useTimer } from '../context/TimerContext';
import { lightTheme, darkTheme } from '../constants/themes';

export type RootStackParamList = {
    MainTabs: undefined;
    AddTimer: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    History: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs: React.FC = () => {
    const { state } = useTimer();
    const theme = state.theme === 'dark' ? darkTheme : lightTheme;

    const AddButton: React.FC = () => {
        const navigation = useNavigation();

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('AddTimer' as never)}
                style={{ marginRight: 16 }}
            >
                <Icon name="plus" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
        );
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    if (route.name === 'Home') {
                        iconName = focused ? 'hourglass-start' : 'clock-o';
                    } else if (route.name === 'History') {
                        iconName = 'history';
                    } else {
                        iconName = 'circle';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                },
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Timers',
                    headerRight: () => <AddButton />
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ title: 'History' }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator: React.FC = () => {
    const { state } = useTimer();
    const theme = state.theme === 'dark' ? darkTheme : lightTheme;

    return (
        <NavigationContainer
            theme={{
                dark: state.theme === 'dark',
                colors: {
                    primary: theme.colors.primary,
                    background: theme.colors.background,
                    card: theme.colors.surface,
                    text: theme.colors.text,
                    border: theme.colors.border,
                    notification: theme.colors.accent,
                },
            }}
        >
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.surface,
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AddTimer"
                    component={AddTimerScreen}
                    options={{
                        title: 'Add Timer',
                        presentation: 'modal',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator; 