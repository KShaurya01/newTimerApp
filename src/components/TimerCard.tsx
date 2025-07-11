import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { Timer } from '../types';
import { useTimer } from '../context/TimerContext';
import { formatTime, calculateProgress, getTimerStatusColor } from '../utils/timerUtils';
import { lightTheme, darkTheme } from '../constants/themes';

interface TimerCardProps {
    timer: Timer;
}

const TimerCard: React.FC<TimerCardProps> = ({ timer }) => {
    const { state, startTimer, pauseTimer, resetTimer, completeTimer, updateTimer, deleteTimer } = useTimer();
    const theme = state.theme === 'dark' ? darkTheme : lightTheme;
    const [animatedProgress] = useState(new Animated.Value(0));

    const progress = calculateProgress(timer.remainingTime, timer.originalDuration);
    const statusColor = getTimerStatusColor(timer.status);

    // Update progress animation
    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: progress / 100,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [progress, animatedProgress]);

    // Timer countdown logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timer.status === 'running' && timer.remainingTime > 0) {
            interval = setInterval(() => {
                const newRemainingTime = timer.remainingTime - 1;

                if (newRemainingTime <= 0) {
                    completeTimer(timer.id);
                    // Show completion modal/alert
                    Alert.alert(
                        '🎉 Timer Completed!',
                        `"${timer.name}" has finished!`,
                        [{ text: 'OK', style: 'default' }]
                    );
                } else {
                    updateTimer(timer.id, { remainingTime: newRemainingTime });

                    // Check for halfway alert
                    if (
                        timer.halfwayAlertEnabled &&
                        !timer.halfwayAlertTriggered &&
                        newRemainingTime <= timer.originalDuration / 2
                    ) {
                        updateTimer(timer.id, { halfwayAlertTriggered: true });
                        Alert.alert(
                            '⏰ Halfway Alert',
                            `"${timer.name}" is 50% complete!`,
                            [{ text: 'OK', style: 'default' }]
                        );
                    }
                }
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timer.status, timer.remainingTime, timer.id, timer.halfwayAlertEnabled, timer.halfwayAlertTriggered, timer.name, timer.originalDuration, completeTimer, updateTimer]);

    const handleStart = () => {
        if (timer.status === 'completed') {
            resetTimer(timer.id);
            setTimeout(() => startTimer(timer.id), 100);
        } else {
            startTimer(timer.id);
        }
    };

    const handlePause = () => {
        pauseTimer(timer.id);
    };

    const handleReset = () => {
        Alert.alert(
            'Reset Timer',
            'Are you sure you want to reset this timer?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => resetTimer(timer.id) },
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Timer',
            'Are you sure you want to delete this timer?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteTimer(timer.id) },
            ]
        );
    };

    const getPlayPauseIcon = () => {
        switch (timer.status) {
            case 'running':
                return 'pause';
            case 'completed':
                return 'refresh';
            default:
                return 'play';
        }
    };

    const getStatusText = () => {
        switch (timer.status) {
            case 'running':
                return 'Running';
            case 'paused':
                return 'Paused';
            case 'completed':
                return 'Completed';
            default:
                return 'Ready';
        }
    };

    const styles = createStyles(theme);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        {timer.name}
                    </Text>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                            {getStatusText()}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                    <Icon name="trash" size={20} color={theme.colors.error} />
                </TouchableOpacity>
            </View>

            {/* Time Display */}
            <View style={styles.timeContainer}>
                <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {formatTime(timer.remainingTime)}
                </Text>
                <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
                    / {formatTime(timer.originalDuration)}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: statusColor,
                                width: animatedProgress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                    {Math.round(progress)}%
                </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
                    onPress={timer.status === 'running' ? handlePause : handleStart}
                >
                    <Icon
                        name={getPlayPauseIcon()}
                        size={20}
                        color={theme.colors.background}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: theme.colors.secondary }]}
                    onPress={handleReset}
                >
                    <Icon name="stop" size={20} color={theme.colors.background} />
                </TouchableOpacity>
            </View>

            {/* Alerts Info */}
            {timer.halfwayAlertEnabled && (
                <View style={styles.alertInfo}>
                    <Icon
                        name={timer.halfwayAlertTriggered ? "checkmark-circle" : "notifications-outline"}
                        size={14}
                        color={timer.halfwayAlertTriggered ? theme.colors.success : theme.colors.warning}
                    />
                    <Text style={[styles.alertText, { color: theme.colors.textSecondary }]}>
                        {timer.halfwayAlertTriggered ? 'Halfway alert triggered' : 'Halfway alert enabled'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            marginVertical: theme.spacing.xs,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.sm,
        },
        titleContainer: {
            flex: 1,
        },
        title: {
            fontSize: theme.typography.h3.fontSize,
            fontWeight: theme.typography.h3.fontWeight,
            marginBottom: theme.spacing.xs / 2,
        },
        statusContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: theme.spacing.xs,
        },
        statusText: {
            fontSize: theme.typography.caption.fontSize,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
        timeContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: theme.spacing.md,
        },
        timeText: {
            fontSize: 32,
            fontWeight: '700',
            fontFamily: 'monospace',
        },
        durationText: {
            fontSize: theme.typography.body.fontSize,
            marginLeft: theme.spacing.sm,
        },
        progressContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        progressTrack: {
            flex: 1,
            height: 8,
            borderRadius: 4,
            marginRight: theme.spacing.sm,
        },
        progressFill: {
            height: '100%',
            borderRadius: 4,
        },
        progressText: {
            fontSize: theme.typography.caption.fontSize,
            fontWeight: '600',
            minWidth: 35,
        },
        controls: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
        },
        controlButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
        },
        alertInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        alertText: {
            fontSize: theme.typography.caption.fontSize,
            marginLeft: theme.spacing.xs,
        },
    });

export default TimerCard; 