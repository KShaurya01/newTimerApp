import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { Timer, Category } from '../types';
import { useTimer } from '../context/TimerContext';
import { lightTheme, darkTheme } from '../constants/themes';
import TimerCard from './TimerCard';

interface CategorySectionProps {
    category: Category;
    timers: Timer[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, timers }) => {
    const {
        state,
        toggleCategoryExpansion,
        startAllTimersInCategory,
        pauseAllTimersInCategory,
        resetAllTimersInCategory,
    } = useTimer();
    const theme = state.theme === 'dark' ? darkTheme : lightTheme;

    const runningTimers = timers.filter(t => t.status === 'running');
    const pausedTimers = timers.filter(t => t.status === 'paused');
    const activeTimers = timers.filter(t => t.status !== 'completed');

    const handleStartAll = () => {
        if (activeTimers.length === 0) {
            Alert.alert('No Active Timers', 'There are no timers to start in this category.');
            return;
        }

        Alert.alert(
            'Start All Timers',
            `Start all ${activeTimers.length} active timers in "${category.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Start All', onPress: () => startAllTimersInCategory(category.name) },
            ]
        );
    };

    const handlePauseAll = () => {
        if (runningTimers.length === 0) {
            Alert.alert('No Running Timers', 'There are no running timers to pause in this category.');
            return;
        }

        pauseAllTimersInCategory(category.name);
    };

    const handleResetAll = () => {
        if (timers.length === 0) {
            Alert.alert('No Timers', 'There are no timers in this category.');
            return;
        }

        Alert.alert(
            'Reset All Timers',
            `Reset all ${timers.length} timers in "${category.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset All', style: 'destructive', onPress: () => resetAllTimersInCategory(category.name) },
            ]
        );
    };

    const getStatusSummary = () => {
        const running = runningTimers.length;
        const paused = pausedTimers.length;
        const completed = timers.filter(t => t.status === 'completed').length;

        const parts = [];
        if (running > 0) parts.push(`${running} running`);
        if (paused > 0) parts.push(`${paused} paused`);
        if (completed > 0) parts.push(`${completed} completed`);

        return parts.join(', ') || 'No timers';
    };

    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            {/* Category Header */}
            <TouchableOpacity
                style={[styles.header, { backgroundColor: theme.colors.surface }]}
                onPress={() => toggleCategoryExpansion(category.id)}
            >
                <View style={styles.headerLeft}>
                    <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
                    <View style={styles.titleContainer}>
                        <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                            {category.name}
                        </Text>
                        <Text style={[styles.statusSummary, { color: theme.colors.textSecondary }]}>
                            {timers.length} timers • {getStatusSummary()}
                        </Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    {/* Bulk Action Buttons */}
                    {category.isExpanded && (
                        <View style={styles.bulkActions}>
                            <TouchableOpacity
                                style={[styles.bulkButton, { backgroundColor: theme.colors.success }]}
                                onPress={handleStartAll}
                                disabled={activeTimers.length === 0}
                            >
                                <Icon name="play" size={16} color={theme.colors.background} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.bulkButton, { backgroundColor: theme.colors.warning }]}
                                onPress={handlePauseAll}
                                disabled={runningTimers.length === 0}
                            >
                                <Icon name="pause" size={16} color={theme.colors.background} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.bulkButton, { backgroundColor: theme.colors.error }]}
                                onPress={handleResetAll}
                                disabled={timers.length === 0}
                            >
                                <Icon name="stop" size={16} color={theme.colors.background} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Expand/Collapse Icon */}
                    <Icon
                        name={category.isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color={theme.colors.textSecondary}
                    />
                </View>
            </TouchableOpacity>

            {/* Timers List */}
            {category.isExpanded && (
                <View style={styles.timersContainer}>
                    {timers.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="timer-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                No timers in this category
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                                Tap the + button to add a timer
                            </Text>
                        </View>
                    ) : (
                        timers.map((timer) => (
                            <TimerCard key={timer.id} timer={timer} />
                        ))
                    )}
                </View>
            )}
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            marginVertical: theme.spacing.xs,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        colorIndicator: {
            width: 4,
            height: 40,
            borderRadius: 2,
            marginRight: theme.spacing.md,
        },
        titleContainer: {
            flex: 1,
        },
        categoryTitle: {
            fontSize: theme.typography.h3.fontSize,
            fontWeight: theme.typography.h3.fontWeight,
            marginBottom: theme.spacing.xs / 2,
        },
        statusSummary: {
            fontSize: theme.typography.caption.fontSize,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        bulkActions: {
            flexDirection: 'row',
            gap: theme.spacing.xs,
        },
        bulkButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        timersContainer: {
            marginTop: theme.spacing.sm,
            paddingLeft: theme.spacing.lg,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: theme.spacing.xl,
        },
        emptyText: {
            fontSize: theme.typography.body.fontSize,
            fontWeight: '600',
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.xs,
        },
        emptySubtext: {
            fontSize: theme.typography.caption.fontSize,
        },
    });

export default CategorySection; 