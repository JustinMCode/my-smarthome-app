/**
 * Overlap Detector Component
 * Handles detection and management of overlapping events
 * 
 * Provides algorithms for:
 * - Detecting overlapping events
 * - Grouping events by overlap
 * - Calculating overlap metrics
 * - Optimizing event positioning
 */
export class OverlapDetector {
    constructor(options = {}) {
        this.options = {
            overlapThreshold: 0.1, // Minimum overlap to consider events as overlapping
            timePrecision: 60000,  // 1 minute in milliseconds
            ...options
        };
    }

    /**
     * Check if two events overlap
     * @param {Object} event1 - First event
     * @param {Object} event2 - Second event
     * @returns {boolean} True if events overlap
     */
    eventsOverlap(event1, event2) {
        const start1 = new Date(event1.start);
        const end1 = new Date(event1.end || event1.start);
        const start2 = new Date(event2.start);
        const end2 = new Date(event2.end || event2.start);
        
        // Check for overlap
        return start1 < end2 && start2 < end1;
    }

    /**
     * Calculate overlap percentage between two events
     * @param {Object} event1 - First event
     * @param {Object} event2 - Second event
     * @returns {number} Overlap percentage (0-1)
     */
    calculateOverlapPercentage(event1, event2) {
        const start1 = new Date(event1.start);
        const end1 = new Date(event1.end || event1.start);
        const start2 = new Date(event2.start);
        const end2 = new Date(event2.end || event2.start);
        
        const overlapStart = new Date(Math.max(start1, start2));
        const overlapEnd = new Date(Math.min(end1, end2));
        
        if (overlapStart >= overlapEnd) return 0;
        
        const overlapDuration = overlapEnd - overlapStart;
        const event1Duration = end1 - start1;
        const event2Duration = end2 - start2;
        
        // Return the smaller percentage to avoid bias
        return Math.min(
            overlapDuration / event1Duration,
            overlapDuration / event2Duration
        );
    }

    /**
     * Group events by overlap
     * @param {Array} events - Array of events
     * @returns {Array} Array of event groups
     */
    groupOverlappingEvents(events) {
        if (!events || events.length === 0) return [];
        
        // Sort events by start time
        const sortedEvents = events.sort((a, b) => 
            new Date(a.start) - new Date(b.start)
        );
        
        const groups = [];
        const processed = new Set();
        
        sortedEvents.forEach((event, index) => {
            if (processed.has(index)) return;
            
            const group = [event];
            processed.add(index);
            
            // Find all events that overlap with this event
            for (let i = index + 1; i < sortedEvents.length; i++) {
                if (processed.has(i)) continue;
                
                const otherEvent = sortedEvents[i];
                let overlapsWithGroup = false;
                
                // Check if this event overlaps with any event in the current group
                for (const groupEvent of group) {
                    if (this.eventsOverlap(groupEvent, otherEvent)) {
                        overlapsWithGroup = true;
                        break;
                    }
                }
                
                if (overlapsWithGroup) {
                    group.push(otherEvent);
                    processed.add(i);
                }
            }
            
            groups.push(group);
        });
        
        return groups;
    }

    /**
     * Find all overlapping events for a given event
     * @param {Object} targetEvent - Target event
     * @param {Array} events - Array of events to check against
     * @returns {Array} Array of overlapping events
     */
    findOverlappingEvents(targetEvent, events) {
        return events.filter(event => 
            event !== targetEvent && this.eventsOverlap(targetEvent, event)
        );
    }

    /**
     * Calculate overlap metrics for a set of events
     * @param {Array} events - Array of events
     * @returns {Object} Overlap metrics
     */
    calculateOverlapMetrics(events) {
        if (!events || events.length === 0) {
            return {
                totalEvents: 0,
                overlappingEvents: 0,
                overlapGroups: 0,
                maxOverlapInGroup: 0,
                averageOverlapPercentage: 0
            };
        }
        
        const groups = this.groupOverlappingEvents(events);
        let overlappingEvents = 0;
        let totalOverlapPercentage = 0;
        let overlapCount = 0;
        let maxOverlapInGroup = 0;
        
        groups.forEach(group => {
            if (group.length > 1) {
                overlappingEvents += group.length;
                maxOverlapInGroup = Math.max(maxOverlapInGroup, group.length);
                
                // Calculate overlap percentages within the group
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        const overlap = this.calculateOverlapPercentage(group[i], group[j]);
                        totalOverlapPercentage += overlap;
                        overlapCount++;
                    }
                }
            }
        });
        
        return {
            totalEvents: events.length,
            overlappingEvents,
            overlapGroups: groups.filter(g => g.length > 1).length,
            maxOverlapInGroup,
            averageOverlapPercentage: overlapCount > 0 ? totalOverlapPercentage / overlapCount : 0
        };
    }

    /**
     * Optimize event positioning to minimize overlaps
     * @param {Array} events - Array of events
     * @param {Object} options - Optimization options
     * @returns {Array} Optimized event positions
     */
    optimizeEventPositions(events, options = {}) {
        const {
            containerWidth = 100,
            minEventWidth = 20,
            maxColumns = 4
        } = options;
        
        const groups = this.groupOverlappingEvents(events);
        const positions = new Map();
        
        groups.forEach(group => {
            if (group.length === 1) {
                // Single event takes full width
                positions.set(group[0], {
                    left: 0,
                    width: containerWidth,
                    column: 0
                });
            } else {
                // Multiple overlapping events need column distribution
                const columns = Math.min(group.length, maxColumns);
                const columnWidth = containerWidth / columns;
                
                group.forEach((event, index) => {
                    const column = index % columns;
                    positions.set(event, {
                        left: column * columnWidth,
                        width: columnWidth,
                        column
                    });
                });
            }
        });
        
        return positions;
    }

    /**
     * Detect time conflicts in a schedule
     * @param {Array} events - Array of events
     * @returns {Array} Array of conflict objects
     */
    detectTimeConflicts(events) {
        const conflicts = [];
        const groups = this.groupOverlappingEvents(events);
        
        groups.forEach(group => {
            if (group.length > 1) {
                conflicts.push({
                    type: 'overlap',
                    events: group,
                    severity: group.length > 3 ? 'high' : group.length > 2 ? 'medium' : 'low',
                    description: `${group.length} events overlap at the same time`
                });
            }
        });
        
        return conflicts;
    }

    /**
     * Update overlap detection options
     * @param {Object} newOptions - New options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Get current overlap detection options
     * @returns {Object} Current options
     */
    getOptions() {
        return { ...this.options };
    }
}
