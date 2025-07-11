import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Share,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';


import { useTimer } from '../context/TimerContext';
import { HistoryItem } from '../types';
import { formatDuration } from '../utils/timerUtils';
import { lightTheme, darkTheme } from '../constants/themes';

const HistoryScreen: React.FC = () => {
    const { state, clearHistory, exportData } = useTimer();
    const theme = state.theme === 'dark' ? darkTheme : lightTheme;
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
    };

    const handleClearHistory = () => {
        Alert.alert(
            'Clear History',
            'Are you sure you want to clear all history? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear All', style: 'destructive', onPress: clearHistory },
            ]
        );
    };

    const handleExportData = async () => {
        try {
            const data = exportData();

            await Share.share({
                message: data,
                title: 'Timer App Data Export',
            });
        } catch (error) {
            Alert.alert('Export Failed', 'Unable to export data. Please try again.');
        }
    };

    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInMinutes > 0) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    };

    const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
        const categoryColor = state.categories.find(cat => cat.name === item.category)?.color || theme.colors.primary;

        return (
            <View style={[styles.historyItem, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemTitleContainer}>
                        <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
                        <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                            {item.timerName}
                        </Text>
                    </View>
                    <Icon name="check-circle" size={24} color={theme.colors.success} />
                </View>

                <View style={styles.itemDetails}>
                    <View style={styles.detailRow}>
                        <Icon name="folder" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                            {item.category}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Icon name="clock-o" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                            {formatDuration(item.duration)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                            {formatRelativeTime(item.completedAt)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const styles = createStyles(theme);

    const sortedHistory = [...state.history].sort(
        (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        Completed Timers
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                        {state.history.length} total completed
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleExportData}
                        disabled={state.history.length === 0}
                    >
                        <Icon name="download" size={20} color={theme.colors.background} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                        onPress={handleClearHistory}
                        disabled={state.history.length === 0}
                    >
                        <Icon name="trash" size={20} color={theme.colors.background} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* History List */}
            {state.history.length === 0 ? (
                <View style={styles.emptyState}>
                    <Icon name="trophy" size={80} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                        No Completed Timers
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                        Complete some timers to see them here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sortedHistory}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerLeft: {
            flex: 1,
        },
        headerTitle: {
            fontSize: theme.typography.h3.fontSize,
            fontWeight: theme.typography.h3.fontWeight,
        },
        headerSubtitle: {
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs / 2,
        },
        headerActions: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
        },
        actionButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        listContainer: {
            padding: theme.spacing.md,
        },
        historyItem: {
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
        },
        itemTitleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        categoryIndicator: {
            width: 4,
            height: 20,
            borderRadius: 2,
            marginRight: theme.spacing.sm,
        },
        itemTitle: {
            fontSize: theme.typography.body.fontSize,
            fontWeight: '600',
            flex: 1,
        },
        itemDetails: {
            gap: theme.spacing.xs,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        detailText: {
            fontSize: theme.typography.caption.fontSize,
            marginLeft: theme.spacing.sm,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
        },
        emptyTitle: {
            fontSize: theme.typography.h2.fontSize,
            fontWeight: theme.typography.h2.fontWeight,
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.sm,
        },
        emptySubtitle: {
            fontSize: theme.typography.body.fontSize,
            textAlign: 'center',
        },
    });

export default HistoryScreen; 