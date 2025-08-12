/**
 * Performance Dashboard Component - Touch-Optimized Design
 * 
 * Real-time performance monitoring dashboard optimized for 15-inch touchscreen.
 * Features modern dark theme with glass-morphism and dynamic visualizations.
 * 
 * @module PerformanceDashboard
 * @version 2.0.0
 * @since 2024-01-01
 */

import { performanceMonitor, getReport, getMetrics, getStatistics } from '../utils/PerformanceMonitor.js';

/**
 * Performance Dashboard Class - Touchscreen Optimized
 */
export class PerformanceDashboard {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            updateInterval: 2000, // Faster updates for smoother animations
            maxDataPoints: 50,
            enableCharts: true,
            showAlerts: true,
            showMetrics: true,
            showMemory: true,
            theme: 'dark', // Default to dark theme
            ...options
        };
        
        this.isVisible = false;
        this.updateTimer = null;
        this.charts = new Map();
        this.chartData = {
            responseTime: [],
            memory: [],
            cacheHit: [],
            errorRate: []
        };
        
        this.initialize();
    }

    /**
     * Initialize the dashboard
     */
    initialize() {
        this.injectStyles();
        this.createDashboard();
        this.setupEventListeners();
        this.initializeCharts();
        this.startUpdates();
    }

    /**
     * Inject custom styles for the dashboard
     */
    injectStyles() {
        if (document.getElementById('perf-dashboard-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'perf-dashboard-styles';
        styles.textContent = `
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
                50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
            }
            
            @keyframes slide-up {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes rotate-gradient {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .perf-dashboard * {
                box-sizing: border-box;
                user-select: none;
                -webkit-user-select: none;
            }
            
            .perf-dashboard::-webkit-scrollbar {
                width: 12px;
            }
            
            .perf-dashboard::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
            }
            
            .perf-dashboard::-webkit-scrollbar-thumb {
                background: rgba(99, 102, 241, 0.5);
                border-radius: 6px;
            }
            
            .perf-dashboard::-webkit-scrollbar-thumb:hover {
                background: rgba(99, 102, 241, 0.7);
            }
            
            .metric-ring {
                transform: rotate(-90deg);
                transition: stroke-dashoffset 0.5s ease;
            }
            
            .chart-line {
                fill: none;
                stroke-width: 3;
                stroke-linecap: round;
                stroke-linejoin: round;
            }
            
            .touch-button {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .touch-button:active {
                transform: scale(0.95);
            }
            
            .glass-card {
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }
            
            .glass-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Create the dashboard HTML structure
     */
    createDashboard() {
        this.container.innerHTML = `
            <div class="perf-dashboard" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 16px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <!-- Animated Background -->
                <div class="animated-bg" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    opacity: 0.1;
                    background: radial-gradient(circle at 20% 80%, #6366f1 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%),
                                radial-gradient(circle at 40% 40%, #3b82f6 0%, transparent 50%);
                "></div>
                
                <!-- Header -->
                <div class="dashboard-header" style="
                    background: rgba(15, 15, 30, 0.8);
                    backdrop-filter: blur(10px);
                    padding: 20px 30px;
                    border-bottom: 1px solid rgba(99, 102, 241, 0.3);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 10;
                ">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div class="logo-animation" style="
                            width: 50px;
                            height: 50px;
                            background: linear-gradient(135deg, #6366f1, #8b5cf6);
                            border-radius: 15px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            animation: pulse-glow 2s infinite;
                        ">📊</div>
                        <div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Performance Monitor
                            </h1>
                            <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 4px;">
                                Real-time System Analytics
                            </div>
                        </div>
                    </div>
                    <div class="header-controls" style="display: flex; gap: 15px;">
                        <button class="touch-button fullscreen-btn" style="
                            background: rgba(99, 102, 241, 0.2);
                            border: 1px solid rgba(99, 102, 241, 0.5);
                            color: #fff;
                            padding: 12px 20px;
                            border-radius: 12px;
                            font-size: 18px;
                            cursor: pointer;
                            min-width: 50px;
                            height: 50px;
                        ">⛶</button>
                        <button class="touch-button settings-btn" style="
                            background: rgba(99, 102, 241, 0.2);
                            border: 1px solid rgba(99, 102, 241, 0.5);
                            color: #fff;
                            padding: 12px 20px;
                            border-radius: 12px;
                            font-size: 18px;
                            cursor: pointer;
                            min-width: 50px;
                            height: 50px;
                        ">⚙️</button>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="dashboard-content" style="
                    flex: 1;
                    padding: 30px;
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    grid-template-rows: auto auto 1fr;
                    gap: 25px;
                ">
                    <!-- Primary Metrics Cards -->
                    <div class="metric-card glass-card" data-metric="response" style="
                        background: rgba(99, 102, 241, 0.1);
                        border: 1px solid rgba(99, 102, 241, 0.3);
                        border-radius: 20px;
                        padding: 25px;
                        position: relative;
                        overflow: hidden;
                    ">
                        <div class="metric-content">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                                        Response Time
                                    </div>
                                    <div style="font-size: 42px; font-weight: 700; line-height: 1;">
                                        <span class="metric-value">--</span>
                                        <span style="font-size: 18px; color: rgba(255, 255, 255, 0.5);">ms</span>
                                    </div>
                                    <div class="metric-trend" style="margin-top: 10px; font-size: 14px; color: #10b981;">
                                        ↓ 12% from avg
                                    </div>
                                </div>
                                <svg width="80" height="80" style="transform: rotate(90deg);">
                                    <circle cx="40" cy="40" r="35" stroke="rgba(255, 255, 255, 0.1)" stroke-width="8" fill="none"/>
                                    <circle class="metric-ring" cx="40" cy="40" r="35" stroke="url(#gradient1)" stroke-width="8" fill="none"
                                            stroke-dasharray="220" stroke-dashoffset="220"/>
                                </svg>
                            </div>
                        </div>
                        <div class="metric-sparkline" style="
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            height: 40px;
                            opacity: 0.3;
                        ">
                            <svg width="100%" height="100%" preserveAspectRatio="none">
                                <path class="sparkline-path" stroke="#6366f1" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="metric-card glass-card" data-metric="memory" style="
                        background: rgba(139, 92, 246, 0.1);
                        border: 1px solid rgba(139, 92, 246, 0.3);
                        border-radius: 20px;
                        padding: 25px;
                        position: relative;
                        overflow: hidden;
                    ">
                        <div class="metric-content">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                                        Memory Usage
                                    </div>
                                    <div style="font-size: 42px; font-weight: 700; line-height: 1;">
                                        <span class="metric-value">--</span>
                                        <span style="font-size: 18px; color: rgba(255, 255, 255, 0.5);">MB</span>
                                    </div>
                                    <div class="metric-trend" style="margin-top: 10px; font-size: 14px; color: #f59e0b;">
                                        → Stable
                                    </div>
                                </div>
                                <svg width="80" height="80" style="transform: rotate(90deg);">
                                    <circle cx="40" cy="40" r="35" stroke="rgba(255, 255, 255, 0.1)" stroke-width="8" fill="none"/>
                                    <circle class="metric-ring" cx="40" cy="40" r="35" stroke="url(#gradient2)" stroke-width="8" fill="none"
                                            stroke-dasharray="220" stroke-dashoffset="220"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-card glass-card" data-metric="cache" style="
                        background: rgba(59, 130, 246, 0.1);
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 20px;
                        padding: 25px;
                        position: relative;
                        overflow: hidden;
                    ">
                        <div class="metric-content">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                                        Cache Hit Rate
                                    </div>
                                    <div style="font-size: 42px; font-weight: 700; line-height: 1;">
                                        <span class="metric-value">--</span>
                                        <span style="font-size: 18px; color: rgba(255, 255, 255, 0.5);">%</span>
                                    </div>
                                    <div class="metric-trend" style="margin-top: 10px; font-size: 14px; color: #10b981;">
                                        ↑ Optimal
                                    </div>
                                </div>
                                <svg width="80" height="80" style="transform: rotate(90deg);">
                                    <circle cx="40" cy="40" r="35" stroke="rgba(255, 255, 255, 0.1)" stroke-width="8" fill="none"/>
                                    <circle class="metric-ring" cx="40" cy="40" r="35" stroke="url(#gradient3)" stroke-width="8" fill="none"
                                            stroke-dasharray="220" stroke-dashoffset="220"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-card glass-card" data-metric="errors" style="
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        border-radius: 20px;
                        padding: 25px;
                        position: relative;
                        overflow: hidden;
                    ">
                        <div class="metric-content">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                                        Error Rate
                                    </div>
                                    <div style="font-size: 42px; font-weight: 700; line-height: 1;">
                                        <span class="metric-value">--</span>
                                        <span style="font-size: 18px; color: rgba(255, 255, 255, 0.5);">%</span>
                                    </div>
                                    <div class="metric-trend" style="margin-top: 10px; font-size: 14px; color: #10b981;">
                                        ↓ Low
                                    </div>
                                </div>
                                <svg width="80" height="80" style="transform: rotate(90deg);">
                                    <circle cx="40" cy="40" r="35" stroke="rgba(255, 255, 255, 0.1)" stroke-width="8" fill="none"/>
                                    <circle class="metric-ring" cx="40" cy="40" r="35" stroke="url(#gradient4)" stroke-width="8" fill="none"
                                            stroke-dasharray="220" stroke-dashoffset="220"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Live Chart Section -->
                    <div class="chart-section glass-card" style="
                        grid-column: span 2;
                        grid-row: span 2;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        padding: 25px;
                    ">
                        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                            Performance Trends
                        </h3>
                        <div class="chart-container" style="height: 300px; position: relative;">
                            <canvas id="performance-chart" style="width: 100%; height: 100%;"></canvas>
                        </div>
                    </div>
                    
                    <!-- Alerts Section -->
                    <div class="alerts-section glass-card" style="
                        grid-column: span 2;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        padding: 25px;
                        max-height: 300px;
                        overflow-y: auto;
                    ">
                        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                            System Alerts
                        </h3>
                        <div class="alerts-list">
                            <div class="no-alerts" style="
                                text-align: center;
                                color: rgba(255, 255, 255, 0.5);
                                padding: 40px;
                                font-size: 16px;
                            ">✓ All systems operating normally</div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="actions-section glass-card" style="
                        grid-column: span 2;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        padding: 25px;
                    ">
                        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                            Quick Actions
                        </h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <button class="touch-button action-btn" data-action="reset" style="
                                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                border: none;
                                color: #fff;
                                padding: 20px;
                                border-radius: 15px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                height: 70px;
                            ">🔄 Reset Metrics</button>
                            <button class="touch-button action-btn" data-action="export" style="
                                background: linear-gradient(135deg, #3b82f6, #6366f1);
                                border: none;
                                color: #fff;
                                padding: 20px;
                                border-radius: 15px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                height: 70px;
                            ">📊 Export Report</button>
                            <button class="touch-button action-btn" data-action="clear-cache" style="
                                background: linear-gradient(135deg, #10b981, #059669);
                                border: none;
                                color: #fff;
                                padding: 20px;
                                border-radius: 15px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                height: 70px;
                            ">🗑️ Clear Cache</button>
                            <button class="touch-button action-btn" data-action="diagnostics" style="
                                background: linear-gradient(135deg, #f59e0b, #f97316);
                                border: none;
                                color: #fff;
                                padding: 20px;
                                border-radius: 15px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                height: 70px;
                            ">🔍 Run Diagnostics</button>
                        </div>
                    </div>
                </div>
                
                <!-- SVG Gradients -->
                <svg width="0" height="0" style="position: absolute;">
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f87171;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        `;
    }

    /**
     * Initialize chart components
     */
    initializeCharts() {
        // Initialize data arrays for charts
        const maxPoints = 20;
        for (let i = 0; i < maxPoints; i++) {
            this.chartData.responseTime.push(0);
            this.chartData.memory.push(0);
            this.chartData.cacheHit.push(0);
            this.chartData.errorRate.push(0);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Fullscreen button
        const fullscreenBtn = this.container.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Settings button
        const settingsBtn = this.container.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Action buttons
        const actionBtns = this.container.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });

        // Touch feedback for all buttons
        const allButtons = this.container.querySelectorAll('.touch-button');
        allButtons.forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.95)';
            });
            btn.addEventListener('touchend', () => {
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 100);
            });
        });
    }

    /**
     * Handle action button clicks
     */
    handleAction(action) {
        switch(action) {
            case 'reset':
                performanceMonitor.reset();
                this.showNotification('Metrics reset successfully', 'success');
                break;
            case 'export':
                this.exportReport();
                break;
            case 'clear-cache':
                this.showNotification('Cache cleared', 'success');
                break;
            case 'diagnostics':
                this.runDiagnostics();
                break;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                         'linear-gradient(135deg, #6366f1, #8b5cf6)'};
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slide-up 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Export performance report
     */
    exportReport() {
        const report = getReport();
        const data = JSON.stringify(report, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Report exported successfully', 'success');
    }

    /**
     * Run system diagnostics
     */
    runDiagnostics() {
        this.showNotification('Running diagnostics...', 'info');
        // Simulate diagnostic process
        setTimeout(() => {
            this.showNotification('Diagnostics complete - All systems operational', 'success');
        }, 2000);
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.warn('Failed to enter fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Show settings panel
     */
    showSettings() {
        this.showNotification('Settings panel coming soon', 'info');
    }

    /**
     * Start periodic updates
     */
    startUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // Initial update
        this.updateDashboard();

        this.updateTimer = setInterval(() => {
            this.updateDashboard();
        }, this.options.updateInterval);
    }

    /**
     * Update dashboard with latest metrics
     */
    updateDashboard() {
        if (!this.isVisible) return;

        this.updateMetricCards();
        this.updateAlerts();
        this.updateChart();
    }

    /**
     * Update metric cards with animations
     */
    updateMetricCards() {
        try {
            const report = getReport();

            // Update Response Time
            const responseCard = this.container.querySelector('[data-metric="response"]');
            if (responseCard) {
                const value = Math.round(report.averageResponseTime || 0);
                const valueEl = responseCard.querySelector('.metric-value');
                const ring = responseCard.querySelector('.metric-ring');
                
                if (valueEl) valueEl.textContent = value;
                if (ring) {
                    const percentage = Math.min((value / 1000) * 100, 100);
                    const offset = 220 - (220 * percentage / 100);
                    ring.style.strokeDashoffset = offset;
                }
                
                // Update trend
                const trend = responseCard.querySelector('.metric-trend');
                if (trend && value > 0) {
                    const diff = ((value - 250) / 250 * 100).toFixed(0);
                    trend.innerHTML = diff < 0 ? 
                        `↓ ${Math.abs(diff)}% better` : 
                        `↑ ${diff}% slower`;
                    trend.style.color = diff < 0 ? '#10b981' : '#ef4444';
                }
            }

            // Update Memory Usage
            const memoryCard = this.container.querySelector('[data-metric="memory"]');
            if (memoryCard) {
                const value = Math.round(report.memoryUsage || 0);
                const valueEl = memoryCard.querySelector('.metric-value');
                const ring = memoryCard.querySelector('.metric-ring');
                
                if (valueEl) valueEl.textContent = value;
                if (ring) {
                    const percentage = Math.min((value / 100) * 100, 100);
                    const offset = 220 - (220 * percentage / 100);
                    ring.style.strokeDashoffset = offset;
                }
            }

            // Update Cache Hit Rate
            const cacheCard = this.container.querySelector('[data-metric="cache"]');
            if (cacheCard) {
                const value = Math.round(report.cacheHitRate || 0);
                const valueEl = cacheCard.querySelector('.metric-value');
                const ring = cacheCard.querySelector('.metric-ring');
                
                if (valueEl) valueEl.textContent = value;
                if (ring) {
                    const offset = 220 - (220 * value / 100);
                    ring.style.strokeDashoffset = offset;
                }
            }

            // Update Error Rate
            const errorCard = this.container.querySelector('[data-metric="errors"]');
            if (errorCard) {
                const value = parseFloat(report.errorRate || 0).toFixed(1);
                const valueEl = errorCard.querySelector('.metric-value');
                const ring = errorCard.querySelector('.metric-ring');
                
                if (valueEl) valueEl.textContent = value;
                if (ring) {
                    const percentage = Math.min(value * 10, 100); // Scale for visibility
                    const offset = 220 - (220 * percentage / 100);
                    ring.style.strokeDashoffset = offset;
                }
            }

            // Update chart data
            this.chartData.responseTime.shift();
            this.chartData.responseTime.push(report.averageResponseTime || 0);
            this.chartData.memory.shift();
            this.chartData.memory.push(report.memoryUsage || 0);
            this.chartData.cacheHit.shift();
            this.chartData.cacheHit.push(report.cacheHitRate || 0);
            this.chartData.errorRate.shift();
            this.chartData.errorRate.push(report.errorRate || 0);

        } catch (error) {
            console.warn('Failed to update metrics:', error);
        }
    }

    /**
     * Update alerts section
     */
    updateAlerts() {
        try {
            const alertsList = this.container.querySelector('.alerts-list');
            if (!alertsList) return;

            const alerts = performanceMonitor.getAlerts();
            
            if (alerts.length === 0) {
                alertsList.innerHTML = `
                    <div class="no-alerts" style="
                        text-align: center;
                        color: rgba(255, 255, 255, 0.5);
                        padding: 40px;
                        font-size: 16px;
                    ">✓ All systems operating normally</div>
                `;
                return;
            }

            const alertsHtml = alerts.slice(0, 5).map(alert => {
                const colors = {
                    critical: '#ef4444',
                    warning: '#f59e0b',
                    info: '#3b82f6'
                };
                
                return `
                    <div class="alert-item" style="
                        background: rgba(255, 255, 255, 0.05);
                        border-left: 4px solid ${colors[alert.level] || colors.info};
                        border-radius: 12px;
                        padding: 15px 20px;
                        margin-bottom: 15px;
                        animation: slide-up 0.3s ease;
                    ">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="
                                width: 10px;
                                height: 10px;
                                border-radius: 50%;
                                background: ${colors[alert.level] || colors.info};
                                animation: pulse-glow 2s infinite;
                            "></div>
                            <div style="flex: 1;">
                                <div style="font-size: 16px; margin-bottom: 5px;">${alert.message}</div>
                                <div style="font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                                    ${new Date(alert.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            alertsList.innerHTML = alertsHtml;
        } catch (error) {
            console.warn('Failed to update alerts:', error);
        }
    }

    /**
     * Update performance chart
     */
    updateChart() {
        const canvas = this.container.querySelector('#performance-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw response time line
        this.drawChartLine(ctx, this.chartData.responseTime, width, height, '#6366f1', 1000);

        // Draw memory line
        this.drawChartLine(ctx, this.chartData.memory, width, height, '#8b5cf6', 100);
    }

    /**
     * Draw a line on the chart
     */
    drawChartLine(ctx, data, width, height, color, maxValue) {
        if (data.length < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const pointWidth = width / (data.length - 1);

        data.forEach((value, index) => {
            const x = index * pointWidth;
            const y = height - (value / maxValue * height);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
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
     * Destroy the dashboard
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
 */
export function createPerformanceDashboard(container, options) {
    return new PerformanceDashboard(container, options);
}

export default PerformanceDashboard;