/**
 * Performance Dashboard Component
 * 
 * Real-time performance monitoring dashboard for the application.
 * Provides visualization of metrics, alerts, and optimization insights.
 * 
 * @module PerformanceDashboard
 * @version 1.0.0
 * @since 2024-01-01
 */

import { performanceMonitor, getReport, getMetrics, getStatistics } from '../utils/PerformanceMonitor.js';

/**
 * Performance Dashboard Class
 * Provides real-time performance monitoring interface
 */
export class PerformanceDashboard {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            updateInterval: 5000, // 5 seconds
            maxDataPoints: 100,
            enableCharts: true,
            showAlerts: true,
            showMetrics: true,
            showMemory: true,
            ...options
        };
        
        this.isVisible = false;
        this.updateTimer = null;
        this.charts = new Map();
        
        this.initialize();
    }

    /**
     * Initialize the dashboard
     */
    initialize() {
        this.createDashboard();
        this.setupEventListeners();
        this.startUpdates();
    }

    /**
     * Create the dashboard HTML structure
     */
    createDashboard() {
        this.container.innerHTML = `
            <div class="performance-dashboard" style="
                width: 100%;
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 12px;
                color: #333;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <div class="dashboard-header" style="
                    background: #6366f1;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; color: #fff; font-size: 18px; font-weight: 600;">📊 Real-time Metrics</h3>
                    <div class="dashboard-controls">
                        <button class="minimize-btn" style="
                            background: none;
                            border: none;
                            color: #fff;
                            cursor: pointer;
                            font-size: 16px;
                            padding: 4px;
                            border-radius: 4px;
                        ">−</button>
                        <button class="close-btn" style="
                            background: none;
                            border: none;
                            color: #fff;
                            cursor: pointer;
                            font-size: 16px;
                            margin-left: 8px;
                            padding: 4px;
                            border-radius: 4px;
                        ">×</button>
                    </div>
                </div>
                
                <div class="dashboard-content" style="
                    padding: 20px;
                    max-height: 400px;
                    overflow-y: auto;
                ">
                    <div class="overview-section">
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Overview</h4>
                        <div class="metrics-grid" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 16px;
                            margin-bottom: 24px;
                        ">
                            <div class="metric-card" style="
                                background: #fff;
                                padding: 16px;
                                border-radius: 8px;
                                border: 1px solid #e5e7eb;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                            ">
                                <div class="metric-label" style="color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">Response Time</div>
                                <div class="metric-value" style="color: #111827; font-size: 24px; font-weight: 700;">--</div>
                                <div class="metric-unit" style="color: #6b7280; font-size: 12px;">ms</div>
                            </div>
                            
                            <div class="metric-card" style="
                                background: #fff;
                                padding: 16px;
                                border-radius: 8px;
                                border: 1px solid #e5e7eb;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                            ">
                                <div class="metric-label" style="color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">Memory Usage</div>
                                <div class="metric-value" style="color: #111827; font-size: 24px; font-weight: 700;">--</div>
                                <div class="metric-unit" style="color: #6b7280; font-size: 12px;">MB</div>
                            </div>
                            
                            <div class="metric-card" style="
                                background: #fff;
                                padding: 16px;
                                border-radius: 8px;
                                border: 1px solid #e5e7eb;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                            ">
                                <div class="metric-label" style="color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">Cache Hit Rate</div>
                                <div class="metric-value" style="color: #111827; font-size: 24px; font-weight: 700;">--</div>
                                <div class="metric-unit" style="color: #6b7280; font-size: 12px;">%</div>
                            </div>
                            
                            <div class="metric-card" style="
                                background: #fff;
                                padding: 16px;
                                border-radius: 8px;
                                border: 1px solid #e5e7eb;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                            ">
                                <div class="metric-label" style="color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">Error Rate</div>
                                <div class="metric-value" style="color: #111827; font-size: 24px; font-weight: 700;">--</div>
                                <div class="metric-unit" style="color: #6b7280; font-size: 12px;">%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alerts-section" style="margin-bottom: 24px;">
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Alerts</h4>
                        <div class="alerts-container" style="
                            background: #fff;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            max-height: 120px;
                            overflow-y: auto;
                        ">
                            <div class="no-alerts" style="
                                padding: 16px;
                                text-align: center;
                                color: #6b7280;
                                font-style: italic;
                            ">No active alerts</div>
                        </div>
                    </div>
                    
                    <div class="details-section">
                        <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">Performance Details</h4>
                        <div class="details-tabs" style="
                            display: flex;
                            border-bottom: 1px solid #e5e7eb;
                            margin-bottom: 16px;
                        ">
                            <button class="tab-btn active" data-tab="metrics" style="
                                background: none;
                                border: none;
                                padding: 8px 16px;
                                cursor: pointer;
                                border-bottom: 2px solid #6366f1;
                                color: #6366f1;
                                font-weight: 500;
                            ">Metrics</button>
                            <button class="tab-btn" data-tab="memory" style="
                                background: none;
                                border: none;
                                padding: 8px 16px;
                                cursor: pointer;
                                color: #6b7280;
                                font-weight: 500;
                            ">Memory</button>
                            <button class="tab-btn" data-tab="optimization" style="
                                background: none;
                                border: none;
                                padding: 8px 16px;
                                cursor: pointer;
                                color: #6b7280;
                                font-weight: 500;
                            ">Optimization</button>
                        </div>
                        
                        <div class="tab-content" id="metrics-tab" style="display: block;">
                            <div class="metrics-list" style="
                                background: #fff;
                                border: 1px solid #e5e7eb;
                                border-radius: 8px;
                                max-height: 200px;
                                overflow-y: auto;
                            ">
                                <div class="no-metrics" style="
                                    padding: 16px;
                                    text-align: center;
                                    color: #6b7280;
                                    font-style: italic;
                                ">No metrics available</div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="memory-tab" style="display: none;">
                            <div class="memory-info" style="
                                background: #fff;
                                border: 1px solid #e5e7eb;
                                border-radius: 8px;
                                padding: 16px;
                            ">
                                <div class="memory-chart" style="
                                    height: 100px;
                                    background: #f3f4f6;
                                    border-radius: 4px;
                                    display: flex;
                                    align-items: end;
                                    padding: 8px;
                                    gap: 2px;
                                "></div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="optimization-tab" style="display: none;">
                            <div class="optimization-suggestions" style="
                                background: #fff;
                                border: 1px solid #e5e7eb;
                                border-radius: 8px;
                                padding: 16px;
                            ">
                                <div class="no-suggestions" style="
                                    text-align: center;
                                    color: #6b7280;
                                    font-style: italic;
                                ">No optimization suggestions available</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Set up event listeners for dashboard controls
     */
    setupEventListeners() {
        const minimizeBtn = this.container.querySelector('.minimize-btn');
        const closeBtn = this.container.querySelector('.close-btn');
        const tabBtns = this.container.querySelectorAll('.tab-btn');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    /**
     * Switch between dashboard tabs
     */
    switchTab(tabName) {
        const tabBtns = this.container.querySelectorAll('.tab-btn');
        const tabContents = this.container.querySelectorAll('.tab-content');

        // Update tab buttons
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.style.borderBottom = 'none';
            btn.style.color = '#6b7280';
        });

        const activeBtn = this.container.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.borderBottom = '2px solid #6366f1';
            activeBtn.style.color = '#6366f1';
        }

        // Update tab content
        tabContents.forEach(content => {
            content.style.display = 'none';
        });

        const activeContent = this.container.querySelector(`#${tabName}-tab`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }
    }

    /**
     * Start periodic updates
     */
    startUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        this.updateTimer = setInterval(() => {
            this.updateDashboard();
        }, this.options.updateInterval);
    }

    /**
     * Update dashboard with latest metrics
     */
    updateDashboard() {
        if (!this.isVisible) return;

        this.updateOverviewMetrics();
        this.updateAlerts();
        this.updateMetricsList();
        this.updateMemoryChart();
        this.updateOptimizationSuggestions();
    }

    /**
     * Update overview metrics
     */
    updateOverviewMetrics() {
        try {
            const report = getReport();
            const metrics = getMetrics(null, { limit: 1 });

            // Update response time
            const responseTimeEl = this.container.querySelector('.metric-card:nth-child(1) .metric-value');
            if (responseTimeEl && report.averageResponseTime !== undefined) {
                responseTimeEl.textContent = Math.round(report.averageResponseTime);
            }

            // Update memory usage
            const memoryEl = this.container.querySelector('.metric-card:nth-child(2) .metric-value');
            if (memoryEl && report.memoryUsage !== undefined) {
                memoryEl.textContent = Math.round(report.memoryUsage);
            }

            // Update cache hit rate
            const cacheEl = this.container.querySelector('.metric-card:nth-child(3) .metric-value');
            if (cacheEl && report.cacheHitRate !== undefined) {
                cacheEl.textContent = Math.round(report.cacheHitRate);
            }

            // Update error rate
            const errorEl = this.container.querySelector('.metric-card:nth-child(4) .metric-value');
            if (errorEl && report.errorRate !== undefined) {
                errorEl.textContent = report.errorRate.toFixed(1);
            }
        } catch (error) {
            console.warn('Failed to update overview metrics:', error);
        }
    }

    /**
     * Update alerts section
     */
    updateAlerts() {
        if (!this.options.showAlerts) return;

        try {
            const alertsContainer = this.container.querySelector('.alerts-container');
            if (!alertsContainer) return;

            const alerts = performanceMonitor.getAlerts();
            
            if (alerts.length === 0) {
                alertsContainer.innerHTML = `
                    <div class="no-alerts" style="
                        padding: 16px;
                        text-align: center;
                        color: #6b7280;
                        font-style: italic;
                    ">No active alerts</div>
                `;
                return;
            }

            const alertsHtml = alerts.slice(0, 5).map(alert => `
                <div class="alert-item" style="
                    padding: 12px 16px;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <div class="alert-icon" style="
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: ${alert.level === 'critical' ? '#ef4444' : '#f59e0b'};
                    "></div>
                    <div class="alert-content">
                        <div class="alert-message" style="font-size: 13px; color: #374151;">${alert.message}</div>
                        <div class="alert-time" style="font-size: 11px; color: #6b7280;">${new Date(alert.timestamp).toLocaleTimeString()}</div>
                    </div>
                </div>
            `).join('');

            alertsContainer.innerHTML = alertsHtml;
        } catch (error) {
            console.warn('Failed to update alerts:', error);
        }
    }

    /**
     * Update metrics list
     */
    updateMetricsList() {
        if (!this.options.showMetrics) return;

        try {
            const metricsContainer = this.container.querySelector('.metrics-list');
            if (!metricsContainer) return;

            const metrics = getMetrics(null, { limit: 10 });
            
            if (metrics.length === 0) {
                metricsContainer.innerHTML = `
                    <div class="no-metrics" style="
                        padding: 16px;
                        text-align: center;
                        color: #6b7280;
                        font-style: italic;
                    ">No metrics available</div>
                `;
                return;
            }

            const metricsHtml = metrics.map(metric => {
                const stats = getStatistics(metric.name);
                return `
                    <div class="metric-item" style="
                        padding: 12px 16px;
                        border-bottom: 1px solid #f3f4f6;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <div class="metric-info">
                            <div class="metric-name" style="font-size: 13px; color: #374151; font-weight: 500;">${metric.name}</div>
                            <div class="metric-time" style="font-size: 11px; color: #6b7280;">${new Date(metric.timestamp).toLocaleTimeString()}</div>
                        </div>
                        <div class="metric-value" style="font-size: 13px; color: #059669; font-weight: 600;">
                            ${typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
                        </div>
                    </div>
                `;
            }).join('');

            metricsContainer.innerHTML = metricsHtml;
        } catch (error) {
            console.warn('Failed to update metrics list:', error);
        }
    }

    /**
     * Update memory chart
     */
    updateMemoryChart() {
        if (!this.options.showMemory) return;

        try {
            const chartContainer = this.container.querySelector('.memory-chart');
            if (!chartContainer) return;

            const memoryMetrics = getMetrics('memory.usage', { limit: 10 });
            
            if (memoryMetrics.length === 0) {
                chartContainer.innerHTML = `
                    <div style="
                        width: 100%;
                        text-align: center;
                        color: #6b7280;
                        font-style: italic;
                        padding: 20px;
                    ">No memory data available</div>
                `;
                return;
            }

            const maxValue = Math.max(...memoryMetrics.map(m => m.value));
            const chartBars = memoryMetrics.map(metric => {
                const height = maxValue > 0 ? (metric.value / maxValue) * 80 : 0;
                return `
                    <div class="chart-bar" style="
                        background: #6366f1;
                        width: 8px;
                        height: ${height}px;
                        border-radius: 2px;
                        transition: height 0.3s ease;
                    " title="${metric.value.toFixed(1)} MB"></div>
                `;
            }).join('');

            chartContainer.innerHTML = chartBars;
        } catch (error) {
            console.warn('Failed to update memory chart:', error);
        }
    }

    /**
     * Update optimization suggestions
     */
    updateOptimizationSuggestions() {
        try {
            const suggestionsContainer = this.container.querySelector('.optimization-suggestions');
            if (!suggestionsContainer) return;

            const report = getReport();
            const suggestions = [];

            // Generate suggestions based on performance data
            if (report.averageResponseTime > 500) {
                suggestions.push({
                    type: 'warning',
                    message: 'Response time is above optimal threshold. Consider optimizing critical operations.',
                    priority: 'high'
                });
            }

            if (report.memoryUsage > 50) {
                suggestions.push({
                    type: 'warning',
                    message: 'Memory usage is high. Consider implementing memory cleanup strategies.',
                    priority: 'medium'
                });
            }

            if (report.cacheHitRate < 80) {
                suggestions.push({
                    type: 'info',
                    message: 'Cache hit rate could be improved. Review caching strategies.',
                    priority: 'low'
                });
            }

            if (suggestions.length === 0) {
                suggestionsContainer.innerHTML = `
                    <div class="no-suggestions" style="
                        text-align: center;
                        color: #6b7280;
                        font-style: italic;
                    ">Performance is optimal. No suggestions available.</div>
                `;
                return;
            }

            const suggestionsHtml = suggestions.map(suggestion => `
                <div class="suggestion-item" style="
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 6px;
                    background: ${suggestion.type === 'warning' ? '#fef3c7' : '#dbeafe'};
                    border-left: 4px solid ${suggestion.type === 'warning' ? '#f59e0b' : '#3b82f6'};
                ">
                    <div class="suggestion-message" style="
                        font-size: 13px;
                        color: #374151;
                        margin-bottom: 4px;
                    ">${suggestion.message}</div>
                    <div class="suggestion-priority" style="
                        font-size: 11px;
                        color: #6b7280;
                        text-transform: uppercase;
                        font-weight: 500;
                    ">Priority: ${suggestion.priority}</div>
                </div>
            `).join('');

            suggestionsContainer.innerHTML = suggestionsHtml;
        } catch (error) {
            console.warn('Failed to update optimization suggestions:', error);
        }
    }

    /**
     * Toggle dashboard minimize state
     */
    toggleMinimize() {
        const content = this.container.querySelector('.dashboard-content');
        const minimizeBtn = this.container.querySelector('.minimize-btn');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            minimizeBtn.textContent = '−';
        } else {
            content.style.display = 'none';
            minimizeBtn.textContent = '+';
        }
    }

    /**
     * Show the dashboard
     */
    show() {
        this.container.style.display = 'block';
        this.isVisible = true;
        this.updateDashboard();
    }

    /**
     * Hide the dashboard
     */
    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * Destroy the dashboard and clean up resources
     */
    destroy() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }

        if (this.container) {
            this.container.innerHTML = '';
        }

        this.charts.clear();
    }
}

/**
 * Factory function to create a performance dashboard
 * @param {HTMLElement} container - Container element for the dashboard
 * @param {Object} options - Dashboard configuration options
 * @returns {PerformanceDashboard} Dashboard instance
 */
export function createPerformanceDashboard(container, options) {
    return new PerformanceDashboard(container, options);
}

export default PerformanceDashboard;
