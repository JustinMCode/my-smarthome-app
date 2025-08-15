/**
 * ImportFormView - Light Glassmorphism Design System
 * Elegant glass panels floating over animated gradient background
 */
export class ImportFormView {
  constructor({ calendars }) {
    this.calendars = calendars || [];
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'import-form-glass';
    
    this._injectStyles();
    wrapper.innerHTML = this._template();

    const form = wrapper.querySelector('form');
    const input = wrapper.querySelector('#google-calendar-id');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const googleCalendarId = input.value.trim();
      
      // Basic validation
      if (!googleCalendarId) {
        this._showToast(wrapper, 'Please enter a Google Calendar ID', 'error');
        return;
      }
      
      // Validate format (basic check)
      if (!this._validateCalendarId(googleCalendarId)) {
        this._showToast(wrapper, 'Invalid Calendar ID format', 'error');
        return;
      }
      
      this._showToast(wrapper, 'Importing calendar...', 'success');
      
      const detail = { 
        method: 'google', 
        syncEnabled: true, 
        googleCalendarId 
      };
      
      setTimeout(() => {
        wrapper.dispatchEvent(new CustomEvent('submitImport', { bubbles: true, detail }));
      }, 500);
    });

    // Cancel button
    wrapper.querySelector('.btn-cancel')?.addEventListener('click', () => {
      wrapper.dispatchEvent(new CustomEvent('cancel', { bubbles: true }));
    });

    // Help toggle
    wrapper.querySelector('.help-toggle')?.addEventListener('click', () => {
      const helpContent = wrapper.querySelector('.help-content');
      const helpToggle = wrapper.querySelector('.help-toggle');
      helpContent.classList.toggle('expanded');
      helpToggle.classList.toggle('expanded');
    });

    return wrapper;
  }

  _template() {
    return `
      <form class="glass-import-form">
        <!-- Toast Container -->
        <div class="toast-container"></div>

        <!-- Glass Header -->
        <div class="form-header">
          <h1 class="gradient-text">Import Calendar</h1>
          <p class="header-subtitle">Connect your Google Calendar to sync events</p>
        </div>

        <!-- Main Content -->
        <div class="form-content">
          <!-- Calendar ID Input -->
          <div class="glass-panel input-section">
            <label class="section-label" for="google-calendar-id">
              Google Calendar ID
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="url(#purple-gradient)">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              <input 
                id="google-calendar-id" 
                type="text" 
                placeholder="example@group.calendar.google.com"
                class="glass-input"
                autocomplete="off"
                spellcheck="false"
                required
              />
            </div>
            <div class="input-helper">
              Enter your Google Calendar ID (usually ends with @group.calendar.google.com)
            </div>
          </div>

          <!-- Help Section -->
          <div class="glass-panel help-section">
            <button type="button" class="help-toggle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
              <span>How to find your Calendar ID</span>
              <svg class="toggle-arrow" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            <div class="help-content">
              <div class="gradient-line"></div>
              <ol class="help-steps">
                <li>
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <strong>Open Google Calendar</strong>
                    <p>Go to calendar.google.com in your browser</p>
                  </div>
                </li>
                <li>
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <strong>Find your calendar</strong>
                    <p>In the left sidebar, hover over the calendar you want to import</p>
                  </div>
                </li>
                <li>
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <strong>Open Settings</strong>
                    <p>Click the three dots menu and select "Settings and sharing"</p>
                  </div>
                </li>
                <li>
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <strong>Copy Calendar ID</strong>
                    <p>Scroll down to "Integrate calendar" section and copy the Calendar ID</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <!-- SVG Gradient Definition -->
        <svg width="0" height="0">
          <defs>
            <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button type="button" class="btn-glass btn-cancel">Cancel</button>
          <button type="submit" class="btn-glass btn-import">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Import Calendar
          </button>
        </div>
      </form>
    `;
  }

  _injectStyles() {
    if (document.getElementById('import-form-glass-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'import-form-glass-styles';
    style.textContent = `
      * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      /* Animated Gradient Background */
      .import-form-glass {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        width: 100%;
        background: linear-gradient(135deg, #e3e8ff 0%, #f0e6ff 25%, #e6f2ff 50%, #e3e8ff 100%);
        background-size: 400% 400%;
        animation: gradientFlow 25s ease infinite;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
      }

      @keyframes gradientFlow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* Main Form Container */
      .glass-import-form {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 28px;
        position: relative;
        animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Glass Panel Base */
      .glass-panel {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(20px) saturate(150%);
        -webkit-backdrop-filter: blur(20px) saturate(150%);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.08),
          inset 0 0 20px rgba(255, 255, 255, 0.5);
        padding: 28px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Toast Notifications */
      .toast-container {
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
      }

      .toast {
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 400;
        letter-spacing: 0.2px;
        color: white;
        min-width: 250px;
        text-align: center;
        animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .toast.error {
        background: linear-gradient(135deg, rgba(234, 67, 53, 0.9), rgba(219, 68, 55, 0.9));
        box-shadow: 0 4px 12px rgba(234, 67, 53, 0.25);
      }

      .toast.success {
        background: linear-gradient(135deg, rgba(52, 168, 83, 0.9), rgba(46, 160, 67, 0.9));
        box-shadow: 0 4px 12px rgba(52, 168, 83, 0.25);
      }

      /* Header Section */
      .form-header {
        text-align: left;
        margin-bottom: 8px;
        margin-top: 0px;
      }

      .gradient-text {
        font-size: 42px;
        font-weight: 200;
        letter-spacing: 1.2px;
        margin: 0 0 8px 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .header-subtitle {
        font-size: 16px;
        font-weight: 300;
        color: rgba(51, 65, 85, 0.8);
        letter-spacing: 0.4px;
        margin: 0;
      }

      /* Content Container */
      .form-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      /* Input Section */
      .input-section {
        animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
      }

      .section-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: rgba(30, 41, 59, 0.95);
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .required {
        color: #8b5cf6;
        font-weight: 300;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon {
        position: absolute;
        left: 20px;
        pointer-events: none;
        opacity: 0.6;
      }

      .glass-input {
        width: 100%;
        height: 56px;
        font-size: 16px;
        font-weight: 300;
        padding: 0 20px 0 52px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(30, 41, 59, 0.95);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        letter-spacing: 0.2px;
        font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
      }

      .glass-input:focus {
        outline: none;
        border-color: rgba(139, 92, 246, 0.3);
        background: rgba(139, 92, 246, 0.04);
        box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.08);
      }

      .glass-input::placeholder {
        color: rgba(100, 116, 139, 0.5);
        font-weight: 300;
      }

      .input-helper {
        margin-top: 12px;
        font-size: 13px;
        font-weight: 300;
        color: rgba(100, 116, 139, 0.7);
        letter-spacing: 0.2px;
        line-height: 1.5;
      }

      /* Help Section */
      .help-section {
        overflow: hidden;
        padding: 0;
        animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
      }

      .help-toggle {
        width: 100%;
        padding: 24px 28px;
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 400;
        color: rgba(30, 41, 59, 0.9);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        letter-spacing: 0.4px;
      }

      .help-toggle:hover {
        background: rgba(139, 92, 246, 0.04);
        transform: translateX(2px);
      }

      .help-toggle svg {
        color: #8b5cf6;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .toggle-arrow {
        margin-left: auto;
        color: rgba(100, 116, 139, 0.5) !important;
      }

      .help-toggle.expanded .toggle-arrow {
        transform: rotate(180deg);
      }

      .gradient-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(100, 116, 139, 0.1), transparent);
        margin: 0 0 24px 0;
      }

      .help-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .help-content.expanded {
        max-height: 500px;
      }

      .help-steps {
        list-style: none;
        margin: 0;
        padding: 0 28px 28px 28px;
      }

      .help-steps li {
        display: flex;
        gap: 16px;
        margin-bottom: 20px;
        opacity: 0;
        animation: fadeInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .help-content.expanded .help-steps li:nth-child(1) { animation-delay: 0.05s; }
      .help-content.expanded .help-steps li:nth-child(2) { animation-delay: 0.1s; }
      .help-content.expanded .help-steps li:nth-child(3) { animation-delay: 0.15s; }
      .help-content.expanded .help-steps li:nth-child(4) { animation-delay: 0.2s; }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .step-number {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 400;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
      }

      .step-content strong {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: rgba(30, 41, 59, 0.95);
        margin-bottom: 4px;
        letter-spacing: 0.2px;
      }

      .step-content p {
        margin: 0;
        font-size: 13px;
        font-weight: 300;
        color: rgba(100, 116, 139, 0.7);
        line-height: 1.5;
        letter-spacing: 0.2px;
      }

      /* Action Buttons */
      .form-actions {
        display: flex;
        gap: 16px;
        animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
      }

      .btn-glass {
        flex: 1;
        height: 56px;
        font-size: 14px;
        font-weight: 400;
        letter-spacing: 0.8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-transform: uppercase;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .btn-cancel {
        background: rgba(255, 255, 255, 0.25);
        color: rgba(51, 65, 85, 0.8);
        border: 1px solid rgba(139, 92, 246, 0.2);
      }

      .btn-cancel:hover {
        background: rgba(139, 92, 246, 0.04);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .btn-cancel:active {
        transform: translateY(0);
      }

      .btn-import {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
      }

      .btn-import:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
      }

      .btn-import:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .glass-import-form {
          max-width: 100%;
        }

        .gradient-text {
          font-size: 32px;
        }

        .glass-panel {
          padding: 20px;
        }

        .form-actions {
          flex-direction: column;
        }

        .btn-glass {
          width: 100%;
        }
      }

      /* High Contrast Mode */
      @media (prefers-contrast: high) {
        .glass-panel {
          border-width: 2px;
        }

        .glass-input {
          border-width: 2px;
        }
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  _validateCalendarId(calendarId) {
    // Basic validation - check for common patterns
    const patterns = [
      /^primary$/,
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      /@group\.calendar\.google\.com$/,
      /@group\.v\.calendar\.google\.com$/
    ];
    
    return patterns.some(pattern => pattern.test(calendarId));
  }

  _showToast(wrapper, message, type) {
    const container = wrapper.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

export default ImportFormView;