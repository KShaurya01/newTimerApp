import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useTimer } from '../context/TimerContext';
import { lightTheme, darkTheme } from '../constants/themes';
import CategorySection from '../components/CategorySection';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen: React.FC = () => {
    const { state, toggleTheme } = useTimer();
    const theme = state.theme === 'dark' ? darkTheme : lightTheme;
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate refresh delay
        setTimeout(() => setRefreshing(false), 500);
    };

    // Filter timers based on search query and category filter
    const filteredTimers = state.timers.filter(timer => {
        const matchesSearch = timer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            timer.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || timer.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Group timers by category
    const timersByCategory = state.categories.reduce((acc, category) => {
        acc[category.name] = filteredTimers.filter(timer => timer.category === category.name);
        return acc;
    }, {} as Record<string, typeof state.timers>);

    // Add timers from categories that don't exist in the categories list
    const orphanedTimers = filteredTimers.filter(timer =>
        !state.categories.some(cat => cat.name === timer.category)
    );

    if (orphanedTimers.length > 0) {
        timersByCategory.Other = orphanedTimers;
    }

    const getActiveTimersCount = () => {
        return state.timers.filter(timer => timer.status !== 'completed').length;
    };

    const getRunningTimersCount = () => {
        return state.timers.filter(timer => timer.status === 'running').length;
    };

    const styles = createStyles(theme);

    if (!state.isLoaded) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Icon name="clock-o" size={48} color={theme.colors.primary} />

                <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    Loading timers...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header Stats */}
            <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                        {state.timers.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Total
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                        {getRunningTimersCount()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Running
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
                        {getActiveTimersCount()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Active
                    </Text>
                </View>
                <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon
                            name={state.theme === 'dark' ? 'sun-o' : 'moon-o'}
                            size={24}
                            color={theme.colors.primary}
                        />
                        <Text style={{ marginLeft: 6, color: theme.colors.primary, fontWeight: '500' }}>
                            {state.theme === 'dark' ? 'Light' : 'Dark'}
                        </Text>
                    </View>
                </TouchableOpacity>

            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="search" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Search timers..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            {
                                backgroundColor: filterCategory === 'all' ? theme.colors.primary : theme.colors.surface,
                                borderColor: theme.colors.border,
                            }
                        ]}
                        onPress={() => setFilterCategory('all')}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                { color: filterCategory === 'all' ? theme.colors.background : theme.colors.text }
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>

                    {state.categories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: filterCategory === category.name ? theme.colors.primary : theme.colors.surface,
                                    borderColor: theme.colors.border,
                                }
                            ]}
                            onPress={() => setFilterCategory(category.name)}
                        >
                            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    { color: filterCategory === category.name ? theme.colors.background : theme.colors.text }
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Timers List */}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {state.timers.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="timer-outline" size={80} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                                No Timers Yet
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                                Tap the + button to create your first timer
                            </Text>
                        </View>
                    ) : filteredTimers.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="search-outline" size={80} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                                No Results Found
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                                Try adjusting your search or filter
                            </Text>
                        </View>
                    ) : (
                        Object.entries(timersByCategory).map(([categoryName, timers]) => {
                            if (timers.length === 0) return null;

                            // Find category or create default one
                            let category = state.categories.find(cat => cat.name === categoryName);
                            if (!category) {
                                category = {
                                    id: 'default',
                                    name: categoryName,
                                    color: theme.colors.primary,
                                    isExpanded: true,
                                };
                            }

                            return (
                                <CategorySection
                                    key={categoryName}
                                    category={category}
                                    timers={timers}
                                />
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        loadingContainer: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            fontSize: theme.typography.body.fontSize,
            marginTop: theme.spacing.md,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        statItem: {
            alignItems: 'center',
        },
        statNumber: {
            fontSize: theme.typography.h2.fontSize,
            fontWeight: theme.typography.h2.fontWeight,
        },
        statLabel: {
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs / 2,
        },
        themeButton: {
            padding: theme.spacing.sm,
        },
        searchContainer: {
            padding: theme.spacing.md,
            paddingBottom: 0,
        },
        searchInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        searchInput: {
            flex: 1,
            fontSize: theme.typography.body.fontSize,
            marginLeft: theme.spacing.sm,
        },
        filterContainer: {
            flexDirection: 'row',
        },
        filterChip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.borderRadius.lg,
            marginRight: theme.spacing.sm,
            borderWidth: 1,
        },
        filterChipText: {
            fontSize: theme.typography.caption.fontSize,
            fontWeight: '600',
        },
        categoryDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: theme.spacing.xs,
        },
        scrollView: {
            flex: 1,
        },
        content: {
            padding: theme.spacing.md,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: theme.spacing.xl * 2,
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

export default HomeScreen; 