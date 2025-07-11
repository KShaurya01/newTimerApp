import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { useTimer } from '../context/TimerContext';
import { AddTimerFormData } from '../types';
import { convertDurationToSeconds, validateTimerData } from '../utils/timerUtils';
import { lightTheme, darkTheme } from '../constants/themes';

const AddTimerScreen: React.FC = () => {
    const navigation = useNavigation();
    const { state, addTimer } = useTimer();
    const theme = state.theme === 'dark' ? darkTheme : lightTheme;

    const [formData, setFormData] = useState<AddTimerFormData>({
        name: '',
        duration: { hours: 0, minutes: 5, seconds: 0 },
        category: 'General',
        halfwayAlertEnabled: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Timer name is required';
        }

        const totalSeconds = convertDurationToSeconds(
            formData.duration.hours,
            formData.duration.minutes,
            formData.duration.seconds
        );

        const validation = validateTimerData(formData.name, totalSeconds);
        if (!validation.isValid) {
            newErrors.duration = validation.error || 'Invalid duration';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        const totalSeconds = convertDurationToSeconds(
            formData.duration.hours,
            formData.duration.minutes,
            formData.duration.seconds
        );

        addTimer({
            name: formData.name,
            originalDuration: totalSeconds,
            category: formData.category,
            halfwayAlertEnabled: formData.halfwayAlertEnabled,
        });

        Alert.alert('Success', 'Timer created successfully!', [
            {
                text: 'OK',
                onPress: () => navigation.goBack(),
            },
        ]);
    };

    const incrementDuration = (unit: 'hours' | 'minutes' | 'seconds') => {
        setFormData(prev => ({
            ...prev,
            duration: {
                ...prev.duration,
                [unit]: Math.min(
                    prev.duration[unit] + 1,
                    unit === 'hours' ? 23 : 59
                ),
            },
        }));
    };

    const decrementDuration = (unit: 'hours' | 'minutes' | 'seconds') => {
        setFormData(prev => ({
            ...prev,
            duration: {
                ...prev.duration,
                [unit]: Math.max(prev.duration[unit] - 1, 0),
            },
        }));
    };

    const DurationPicker: React.FC<{
        label: string;
        value: number;
        unit: 'hours' | 'minutes' | 'seconds';
    }> = ({ label, value, unit }) => (
        <View style={[styles.durationPicker, { borderColor: theme.colors.border }]}>
            <Text style={[styles.durationLabel, { color: theme.colors.text }]}>
                {label}
            </Text>
            <View style={styles.durationControls}>
                <TouchableOpacity
                    style={[styles.durationButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => decrementDuration(unit)}
                >
                    <Icon name="minus" size={12} color={theme.colors.background} />
                </TouchableOpacity>
                <Text style={[styles.durationValue, { color: theme.colors.text }]}>
                    {value.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                    style={[styles.durationButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => incrementDuration(unit)}
                >
                    <Icon name="plus" size={12} color={theme.colors.background} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const styles = createStyles(theme);

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Timer Name */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Timer Name *
                        </Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: errors.name ? theme.colors.error : theme.colors.border,
                                    color: theme.colors.text,
                                },
                            ]}
                            placeholder="Enter timer name"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={formData.name}
                            onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
                        />
                        {errors.name && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                {errors.name}
                            </Text>
                        )}
                    </View>

                    {/* Duration */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Duration *
                        </Text>
                        <View style={styles.durationContainer}>
                            <DurationPicker
                                label="Hours"
                                value={formData.duration.hours}
                                unit="hours"
                            />
                            <DurationPicker
                                label="Minutes"
                                value={formData.duration.minutes}
                                unit="minutes"
                            />
                            <DurationPicker
                                label="Seconds"
                                value={formData.duration.seconds}
                                unit="seconds"
                            />
                        </View>
                        {errors.duration && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                {errors.duration}
                            </Text>
                        )}
                    </View>

                    {/* Category */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Category
                        </Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.text,
                                },
                            ]}
                            placeholder="Enter category"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={formData.category}
                            onChangeText={text => setFormData(prev => ({ ...prev, category: text }))}
                        />
                    </View>

                    {/* Halfway Alert */}
                    <View style={styles.section}>
                        <View style={styles.switchContainer}>
                            <View style={styles.switchLabelContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>
                                    Halfway Alert
                                </Text>
                                <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
                                    Get notified when 50% of the timer is complete
                                </Text>
                            </View>
                            <Switch
                                value={formData.halfwayAlertEnabled}
                                onValueChange={value =>
                                    setFormData(prev => ({ ...prev, halfwayAlertEnabled: value }))
                                }
                                trackColor={{
                                    false: theme.colors.border,
                                    true: theme.colors.primary,
                                }}
                                thumbColor={theme.colors.background}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSubmit}
                    >
                        <Text style={[styles.submitButtonText, { color: theme.colors.background }]}>
                            Create Timer
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        content: {
            padding: theme.spacing.md,
        },
        section: {
            marginBottom: theme.spacing.lg,
        },
        label: {
            fontSize: theme.typography.body.fontSize,
            fontWeight: '600',
            marginBottom: theme.spacing.sm,
        },
        textInput: {
            borderWidth: 1,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            fontSize: theme.typography.body.fontSize,
        },
        errorText: {
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
        },
        durationContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: theme.spacing.sm,
        },
        durationPicker: {
            flex: 1,
            borderWidth: 1,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            alignItems: 'center',
        },
        durationLabel: {
            fontSize: theme.typography.caption.fontSize,
            marginBottom: theme.spacing.sm,
        },
        durationControls: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
        },
        durationButton: {
            width: 24,
            height: 24,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        durationValue: {
            fontSize: theme.typography.h3.fontSize,
            fontWeight: '600',
            minWidth: 40,
            textAlign: 'center',
        },
        switchContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        switchLabelContainer: {
            flex: 1,
            marginRight: theme.spacing.md,
        },
        switchDescription: {
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
        },
        submitButton: {
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            alignItems: 'center',
            marginTop: theme.spacing.lg,
        },
        submitButtonText: {
            fontSize: theme.typography.body.fontSize,
            fontWeight: '600',
        },
    });

export default AddTimerScreen; 