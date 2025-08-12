/**
 * Grid Layout Engine Component
 * Handles time slot positioning, overlap detection, and layout calculations
 */

import { CacheFactory } from '../../utils/core/cache/index.js';

export class GridLayoutEngine {
    constructor(options = {}) {
        this.options = {
            slotHeight: 72, // Height of each time slot in pixels
            startHour: 6,   // Start hour for time grid
            endHour: 22,    // End hour for time grid
            overlapThreshold: 0.1, // Minimum overlap to consider events as overlapping
            ...options
        };
        
        this.layoutCache = CacheFactory.createCache('layout');
        this.layoutVersion = 0; // Track layout changes
    }

    /**
     * Calculate event position and dimensions for week view
     */
    calculateEventLayout(event, containerWidth, options = {}) {
        const {
            startHour = this.options.startHour,
            endHour = this.options.endHour,
            slotHeight = this.options.slotHeight
        } = options;

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end || event.start);
        
        // Calculate position
        const startMinutes = (eventStart.getHours() - startHour) * 60 + eventStart.getMinutes();
        const endMinutes = (eventEnd.getHours() - startHour) * 60 + eventEnd.getMinutes();
        const duration = Math.max(30, endMinutes - startMinutes); // Minimum 30 minutes height
        
        const top = (startMinutes / 60) * slotHeight;
        const height = (duration / 60) * slotHeight;
        
        return {
            top,
            height,
            left: 0,
            width: '100%',
            startTime: eventStart,
            endTime: eventEnd,
            duration
        };
    }

    /**
     * Layout events with overlap handling
     */
    layoutEventsWithOverlaps(events, containerWidth, options = {}) {
        const {
            startHour = this.options.startHour,
            endHour = this.options.endHour,
            slotHeight = this.options.slotHeight
        } = options;

        // Sort events by start time
        const sortedEvents = events.sort((a, b) => new Date(a.start) - new Date(b.start));
        
        // Group overlapping events
        const groups = this.groupOverlappingEvents(sortedEvents);
        
        // Calculate layout for each group
        const layouts = [];
        
        groups.forEach((group, groupIndex) => {
            group.forEach((event, index) => {
                const baseLayout = this.calculateEventLayout(event, containerWidth, options);
                
                // Handle overlaps
                if (group.length > 1) {
                    const width = 100 / group.length;
                    baseLayout.width = `calc(${width}% - 6px)`;
                    baseLayout.left = `${width * index}%`;
                    baseLayout.overlapIndex = index;
                    baseLayout.overlapCount = group.length;
                }
                
                layouts.push({
                    event,
                    ...baseLayout
                });
            });
        });
        
        return layouts;
    }

    /**
     * Group overlapping events
     */
    groupOverlappingEvents(events) {
        const groups = [];
        
        events.forEach(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end || event.start);
            
            let added = false;
            for (const group of groups) {
                const groupEnd = Math.max(...group.map(e => new Date(e.end || e.start).getTime()));
                if (eventStart.getTime() < groupEnd) {
                    group.push(event);
                    added = true;
                    break;
                }
            }
            
            if (!added) {
                groups.push([event]);
            }
        });
        
        return groups;
    }

    /**
     * Calculate time slot position
     */
    calculateTimeSlotPosition(hour, options = {}) {
        const {
            startHour = this.options.startHour,
            slotHeight = this.options.slotHeight
        } = options;

        const top = (hour - startHour) * slotHeight;
        return { top, height: slotHeight };
    }

    /**
     * Calculate current time indicator position
     */
    calculateCurrentTimePosition(options = {}) {
        const {
            startHour = this.options.startHour,
            endHour = this.options.endHour,
            slotHeight = this.options.slotHeight
        } = options;

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        if (hours < startHour || hours >= endHour) {
            return { visible: false };
        }
        
        const hoursSinceStart = hours - startHour + (minutes / 60);
        const percentage = (hoursSinceStart / (endHour - startHour)) * 100;
        const pixelPosition = (percentage / 100) * ((endHour - startHour) * slotHeight);
        
        return {
            visible: true,
            top: pixelPosition,
            time: now.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            })
        };
    }

    /**
     * Calculate drag creation indicator
     */
    calculateDragIndicator(startY, currentY, startHour, options = {}) {
        const {
            slotHeight = this.options.slotHeight
        } = options;

        const deltaY = currentY - startY;
        const hours = Math.max(1, Math.round(deltaY / slotHeight) + 1);
        const height = hours * slotHeight;
        
        return {
            height,
            hours,
            startHour,
            endHour: startHour + hours
        };
    }

    /**
     * Calculate month view grid layout
     */
    calculateMonthGridLayout(currentDate, options = {}) {
        const {
            gridWidth = 7,
            gridHeight = 6,
            cellPadding = 4
        } = options;

        const cellWidth = 100 / gridWidth;
        const cellHeight = 100 / gridHeight;
        
        const grid = [];
        
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                const index = row * gridWidth + col;
                grid.push({
                    index,
                    row,
                    col,
                    left: `${col * cellWidth}%`,
                    top: `${row * cellHeight}%`,
                    width: `calc(${cellWidth}% - ${cellPadding * 2}px)`,
                    height: `calc(${cellHeight}% - ${cellPadding * 2}px)`
                });
            }
        }
        
        return grid;
    }

    /**
     * Calculate event pill layout for month view
     */
    calculateEventPillLayout(events, maxDisplay = 3, options = {}) {
        const {
            pillHeight = 20,
            pillMargin = 2
        } = options;

        const layouts = [];
        const totalHeight = events.length * (pillHeight + pillMargin);
        
        events.forEach((event, index) => {
            const top = index * (pillHeight + pillMargin);
            
            layouts.push({
                event,
                top,
                height: pillHeight,
                visible: index < maxDisplay,
                isOverflow: index >= maxDisplay
            });
        });
        
        return {
            layouts,
            totalHeight,
            overflowCount: Math.max(0, events.length - maxDisplay)
        };
    }

    /**
     * Calculate responsive breakpoints
     */
    calculateResponsiveBreakpoints(containerWidth) {
        if (containerWidth < 768) {
            return {
                isMobile: true,
                isTablet: false,
                isDesktop: false,
                maxEventsPerDay: 2,
                showTimeLabels: false,
                compactMode: true
            };
        } else if (containerWidth < 1024) {
            return {
                isMobile: false,
                isTablet: true,
                isDesktop: false,
                maxEventsPerDay: 3,
                showTimeLabels: true,
                compactMode: false
            };
        } else {
            return {
                isMobile: false,
                isTablet: false,
                isDesktop: true,
                maxEventsPerDay: 5,
                showTimeLabels: true,
                compactMode: false
            };
        }
    }

    /**
     * Optimize layout for performance
     */
    optimizeLayout(layouts, containerWidth, containerHeight) {
        // Remove off-screen elements
        const visibleLayouts = layouts.filter(layout => {
            return layout.top < containerHeight && 
                   layout.top + layout.height > 0 &&
                   layout.left < containerWidth &&
                   layout.left + (typeof layout.width === 'number' ? layout.width : 0) > 0;
        });
        
        return visibleLayouts;
    }

    /**
     * Cache layout calculations
     */
    cacheLayout(key, layout) {
        const enhancedLayout = {
            ...layout,
            layoutVersion: this.layoutVersion,
            timestamp: Date.now()
        };
        this.layoutCache.set(key, enhancedLayout);
    }

    /**
     * Get cached layout
     */
    getCachedLayout(key, maxAge = 60000) { // 1 minute default
        const cached = this.layoutCache.get(key);
        if (cached && cached.layoutVersion === this.layoutVersion) {
            return cached;
        }
        return null;
    }

    /**
     * Clear layout cache
     */
    clearLayoutCache() {
        this.layoutCache.clear();
    }

    /**
     * Update layout options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.layoutVersion++; // Increment version to invalidate cache
        this.clearLayoutCache(); // Clear cache when options change
    }

    /**
     * Get layout statistics
     */
    getLayoutStats() {
        const cacheStats = this.layoutCache.getStats();
        return {
            ...cacheStats,
            layoutVersion: this.layoutVersion,
            options: this.options
        };
    }

    /**
     * Destroy the layout engine
     */
    destroy() {
        this.layoutCache.destroy();
    }
}
