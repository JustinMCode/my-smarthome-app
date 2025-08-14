/**
 * Event Categorization Utility
 * Enterprise-grade event categorization with configurable rules and intelligent processing
 * 
 * @module EventCategorization
 * @author Calendar System
 * @version 1.0.0
 */

import { CALENDAR_CONFIG } from '../basic/calendar-constants.js';

/**
 * Default categorization options
 */
export const DEFAULT_CATEGORIZATION_OPTIONS = {
    enableAliases: true,
    enableTimeHeuristics: true,
    enableLocationHeuristics: true,
    debugMode: false,
    cacheResults: true,
    strictMode: false // If true, requires higher confidence scores
};

/**
 * Keyword weights for different event properties
 */
const KEYWORD_WEIGHTS = {
    title: 3.0,
    summary: 3.0,
    description: 2.0,
    location: 1.5,
    aliases: 2.5
};

/**
 * Configurable event category rules with weighted keywords
 */
export const EVENT_CATEGORY_RULES = {
    [CALENDAR_CONFIG.EVENT_CATEGORIES.WORK]: {
        keywords: [
            'work', 'meeting', 'office', 'team', 'project', 'conference', 
            'standup', 'sync', 'review', 'presentation', 'client', 'business',
            'training', 'workshop', 'interview', 'deadline', 'call', 'zoom',
            'slack', 'email', 'report', 'planning', 'strategy', 'budget'
        ],
        patterns: [
            /\b(meeting|call|sync|standup|review)\b/i,
            /\b(work|office|business|client|project)\b/i,
            /\b(conference|workshop|training|interview)\b/i
        ],
        timeHints: {
            businessHours: 2.0, // 9 AM - 5 PM weekdays
            weekdays: 1.5
        }
    },
    
    [CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY]: {
        keywords: [
            'family', 'kids', 'child', 'children', 'home', 'mom', 'dad',
            'parent', 'school', 'pickup', 'dropoff', 'soccer', 'birthday',
            'anniversary', 'vacation', 'holiday', 'relatives', 'grandparents',
            'siblings', 'daycare', 'babysitter', 'family dinner', 'playdates'
        ],
        patterns: [
            /\b(family|kids?|children?)\b/i,
            /\b(mom|dad|parent|grandparent)\b/i,
            /\b(school|pickup|dropoff|daycare)\b/i,
            /\b(birthday|anniversary|holiday)\b/i
        ],
        timeHints: {
            evenings: 1.5, // 6 PM - 9 PM
            weekends: 2.0,
            schoolHours: 1.0 // For school-related events
        }
    },
    
    [CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH]: {
        keywords: [
            'health', 'doctor', 'appointment', 'medical', 'clinic', 'hospital',
            'dentist', 'physical', 'checkup', 'therapy', 'medication', 'surgery',
            'gym', 'workout', 'exercise', 'fitness', 'yoga', 'run', 'walk',
            'wellness', 'mental health', 'counseling', 'specialist', 'prescription'
        ],
        patterns: [
            /\b(doctor|dentist|medical|clinic|hospital)\b/i,
            /\b(appointment|checkup|therapy|surgery)\b/i,
            /\b(gym|workout|exercise|fitness|yoga)\b/i,
            /\b(health|wellness|medical)\b/i
        ],
        timeHints: {
            businessHours: 1.5, // Medical appointments usually during business hours
            mornings: 1.2 // Many medical appointments in morning
        }
    },
    
    [CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL]: {
        keywords: [
            'party', 'social', 'dinner', 'celebration', 'friends', 'drinks',
            'lunch', 'brunch', 'happy hour', 'networking', 'meetup', 'event',
            'concert', 'movie', 'show', 'festival', 'gathering', 'barbecue',
            'wedding', 'reception', 'date', 'night out', 'club', 'bar'
        ],
        patterns: [
            /\b(party|celebration|gathering|event)\b/i,
            /\b(dinner|lunch|brunch|drinks)\b/i,
            /\b(friends|social|networking|meetup)\b/i,
            /\b(concert|movie|show|festival)\b/i
        ],
        timeHints: {
            evenings: 2.0, // Social events often in evening
            weekends: 1.8,
            lunchTime: 1.5 // 11 AM - 2 PM
        }
    },
    
    [CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL]: {
        keywords: [
            'personal', 'private', 'me time', 'self care', 'hobby', 'reading',
            'meditation', 'reflection', 'journal', 'alone time', 'rest',
            'relax', 'spa', 'massage', 'vacation', 'travel', 'errands',
            'shopping', 'chores', 'cleaning', 'maintenance', 'repair'
        ],
        patterns: [
            /\b(personal|private|me time|self care)\b/i,
            /\b(hobby|reading|meditation|journal)\b/i,
            /\b(relax|rest|spa|massage)\b/i,
            /\b(errands|shopping|chores)\b/i
        ],
        timeHints: {
            weekends: 1.5,
            evenings: 1.3,
            earlyMorning: 1.2 // 6 AM - 8 AM
        }
    }
};

/**
 * Category aliases for semantic equivalence
 */
export const EVENT_CATEGORY_ALIASES = {
    // Work aliases
    'meet': CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
    'conference call': CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
    'video call': CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
    'zoom': CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
    'teams': CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
    'corporate': CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
    'professional': CALENDAR_CONFIG.EVENT_CATEGORIES.WORK,
    
    // Health aliases
    'gym': CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
    'exercise': CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
    'dr': CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
    'md': CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
    'physician': CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
    'pt': CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
    'physical therapy': CALENDAR_CONFIG.EVENT_CATEGORIES.HEALTH,
    
    // Social aliases
    'get together': CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL,
    'hang out': CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL,
    'catch up': CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL,
    'coffee': CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL,
    'beer': CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL,
    'wine': CALENDAR_CONFIG.EVENT_CATEGORIES.SOCIAL,
    
    // Family aliases
    'kid': CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY,
    'child': CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY,
    'spouse': CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY,
    'husband': CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY,
    'wife': CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY,
    'son': CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY,
    'daughter': CALENDAR_CONFIG.EVENT_CATEGORIES.FAMILY,
    
    // Personal aliases
    'myself': CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL,
    'self': CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL,
    'solo': CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL,
    'individual': CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL,
    'alone': CALENDAR_CONFIG.EVENT_CATEGORIES.PERSONAL
};

/**
 * Results cache for performance optimization
 */
const categorizationCache = new Map();

/**
 * Clear the categorization cache
 */
export function clearCategorizationCache() {
    categorizationCache.clear();
}

/**
 * Generate cache key for an event
 */
function generateCacheKey(event, options) {
    const keyData = {
        title: event.title || event.summary || '',
        description: event.description || '',
        location: event.location || '',
        start: event.start ? new Date(event.start).getTime() : null,
        options: JSON.stringify(options)
    };
    return JSON.stringify(keyData);
}

/**
 * Normalize text for categorization processing
 */
function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
}

/**
 * Extract and normalize text from all relevant event fields
 */
function extractEventText(event) {
    const fields = {
        title: normalizeText(event.title || event.summary || ''),
        description: normalizeText(event.description || ''),
        location: normalizeText(event.location || '')
    };
    
    // Combine all text for comprehensive matching
    const combinedText = Object.values(fields).filter(Boolean).join(' ');
    
    return { ...fields, combined: combinedText };
}

/**
 * Get time-based hints for categorization
 */
function getTimeHints(event) {
    if (!event.start) return {};
    
    const startDate = new Date(event.start);
    const hour = startDate.getHours();
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    const hints = {};
    
    // Business hours (9 AM - 5 PM, Monday - Friday)
    if (hour >= 9 && hour < 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        hints.businessHours = true;
    }
    
    // Weekdays vs weekends
    hints.weekdays = dayOfWeek >= 1 && dayOfWeek <= 5;
    hints.weekends = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Time periods
    hints.earlyMorning = hour >= 6 && hour < 8;
    hints.mornings = hour >= 8 && hour < 12;
    hints.lunchTime = hour >= 11 && hour < 14;
    hints.afternoons = hour >= 12 && hour < 17;
    hints.evenings = hour >= 17 && hour < 21;
    hints.night = hour >= 21 || hour < 6;
    hints.schoolHours = hour >= 8 && hour < 15 && hints.weekdays;
    
    return hints;
}

/**
 * Calculate category score based on keyword matching
 */
function calculateKeywordScore(text, category, textFields) {
    const rules = EVENT_CATEGORY_RULES[category];
    if (!rules) return 0;
    
    let totalScore = 0;
    let matchCount = 0;
    
    // Check individual keywords
    for (const keyword of rules.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        
        // Check each text field with appropriate weighting
        Object.entries(textFields).forEach(([field, fieldText]) => {
            if (field === 'combined') return; // Skip combined text to avoid double counting
            
            const matches = (fieldText.match(regex) || []).length;
            if (matches > 0) {
                const weight = KEYWORD_WEIGHTS[field] || 1.0;
                totalScore += matches * weight;
                matchCount += matches;
            }
        });
    }
    
    // Check regex patterns
    for (const pattern of rules.patterns || []) {
        const matches = (text.match(pattern) || []).length;
        if (matches > 0) {
            totalScore += matches * 2.0; // Patterns get higher weight
            matchCount += matches;
        }
    }
    
    return { score: totalScore, matches: matchCount };
}

/**
 * Calculate alias-based score
 */
function calculateAliasScore(text, category, options) {
    if (!options.enableAliases) return { score: 0, matches: 0 };
    
    let totalScore = 0;
    let matchCount = 0;
    
    Object.entries(EVENT_CATEGORY_ALIASES).forEach(([alias, aliasCategory]) => {
        if (aliasCategory === category) {
            const regex = new RegExp(`\\b${alias}\\b`, 'gi');
            const matches = (text.match(regex) || []).length;
            if (matches > 0) {
                totalScore += matches * KEYWORD_WEIGHTS.aliases;
                matchCount += matches;
            }
        }
    });
    
    return { score: totalScore, matches: matchCount };
}

/**
 * Calculate time-based score
 */
function calculateTimeScore(event, category, options) {
    if (!options.enableTimeHeuristics) return { score: 0, hints: {} };
    
    const rules = EVENT_CATEGORY_RULES[category];
    const timeHints = getTimeHints(event);
    
    if (!rules?.timeHints || !timeHints) {
        return { score: 0, hints: timeHints };
    }
    
    let totalScore = 0;
    
    Object.entries(rules.timeHints).forEach(([hint, multiplier]) => {
        if (timeHints[hint]) {
            totalScore += multiplier;
        }
    });
    
    return { score: totalScore, hints: timeHints };
}

/**
 * Main event categorization function
 */
export function categorizeEvent(event, options = {}) {
    // Validate input
    if (!event || typeof event !== 'object') {
        console.warn('Invalid event object provided to categorizeEvent');
        return CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER;
    }
    
    // Merge options with defaults
    const config = { ...DEFAULT_CATEGORIZATION_OPTIONS, ...options };
    
    // Check cache first
    if (config.cacheResults) {
        const cacheKey = generateCacheKey(event, config);
        if (categorizationCache.has(cacheKey)) {
            return categorizationCache.get(cacheKey);
        }
    }
    
    // Extract and normalize text
    const textFields = extractEventText(event);
    const combinedText = textFields.combined;
    
    // If no meaningful text, return fallback
    if (!combinedText.trim()) {
        const fallback = event.category || CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER;
        return normalizeCategory(fallback);
    }
    
    // Calculate scores for each category
    const categoryScores = new Map();
    const debugInfo = config.debugMode ? {} : null;
    
    Object.values(CALENDAR_CONFIG.EVENT_CATEGORIES).forEach(category => {
        const keywordResult = calculateKeywordScore(combinedText, category, textFields);
        const aliasResult = calculateAliasScore(combinedText, category, config);
        const timeResult = calculateTimeScore(event, category, config);
        
        const totalScore = keywordResult.score + aliasResult.score + timeResult.score;
        
        categoryScores.set(category, {
            total: totalScore,
            keyword: keywordResult,
            alias: aliasResult,
            time: timeResult
        });
        
        if (debugInfo) {
            debugInfo[category] = {
                totalScore,
                keywordScore: keywordResult.score,
                keywordMatches: keywordResult.matches,
                aliasScore: aliasResult.score,
                aliasMatches: aliasResult.matches,
                timeScore: timeResult.score,
                timeHints: timeResult.hints
            };
        }
    });
    
    // Find the highest scoring category
    let bestCategory = CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER;
    let bestScore = 0;
    
    categoryScores.forEach((scoreData, category) => {
        if (scoreData.total > bestScore) {
            bestScore = scoreData.total;
            bestCategory = category;
        }
    });
    
    // Apply strict mode threshold if enabled
    if (config.strictMode && bestScore < 2.0) {
        bestCategory = event.category || CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER;
    }
    
    // Normalize the result
    const result = normalizeCategory(bestCategory);
    
    // Debug logging
    if (config.debugMode) {
        console.log('Event Categorization Debug:', {
            event: {
                title: event.title,
                description: event.description?.substring(0, 100),
                location: event.location
            },
            textFields,
            scores: debugInfo,
            result,
            bestScore
        });
    }
    
    // Cache the result
    if (config.cacheResults) {
        const cacheKey = generateCacheKey(event, config);
        categorizationCache.set(cacheKey, result);
    }
    
    return result;
}

/**
 * Normalize category to ensure valid values
 */
export function normalizeCategory(category) {
    if (!category || typeof category !== 'string') {
        return CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER;
    }
    
    const normalized = category.toLowerCase().trim();
    
    // Check if it's a valid category
    const validCategories = Object.values(CALENDAR_CONFIG.EVENT_CATEGORIES);
    if (validCategories.includes(normalized)) {
        return normalized;
    }
    
    // Check aliases
    if (EVENT_CATEGORY_ALIASES[normalized]) {
        return EVENT_CATEGORY_ALIASES[normalized];
    }
    
    return CALENDAR_CONFIG.EVENT_CATEGORIES.OTHER;
}

/**
 * Get all available categories
 */
export function getAvailableCategories() {
    return Object.values(CALENDAR_CONFIG.EVENT_CATEGORIES);
}

/**
 * Add custom categorization rule
 */
export function addCustomRule(category, rule) {
    if (!category || !rule) {
        throw new Error('Category and rule are required');
    }
    
    const normalizedCategory = normalizeCategory(category);
    
    if (!EVENT_CATEGORY_RULES[normalizedCategory]) {
        EVENT_CATEGORY_RULES[normalizedCategory] = {
            keywords: [],
            patterns: [],
            timeHints: {}
        };
    }
    
    const categoryRules = EVENT_CATEGORY_RULES[normalizedCategory];
    
    if (rule.keywords) {
        categoryRules.keywords.push(...rule.keywords);
    }
    
    if (rule.patterns) {
        categoryRules.patterns.push(...rule.patterns);
    }
    
    if (rule.timeHints) {
        Object.assign(categoryRules.timeHints, rule.timeHints);
    }
    
    // Clear cache when rules change
    clearCategorizationCache();
}

/**
 * Add category alias
 */
export function addCategoryAlias(alias, category) {
    if (!alias || !category) {
        throw new Error('Alias and category are required');
    }
    
    const normalizedCategory = normalizeCategory(category);
    EVENT_CATEGORY_ALIASES[alias.toLowerCase()] = normalizedCategory;
    
    // Clear cache when aliases change
    clearCategorizationCache();
}

/**
 * Get categorization statistics for debugging
 */
export function getCategorizationStats() {
    return {
        cacheSize: categorizationCache.size,
        totalRules: Object.keys(EVENT_CATEGORY_RULES).length,
        totalAliases: Object.keys(EVENT_CATEGORY_ALIASES).length,
        categories: getAvailableCategories()
    };
}
