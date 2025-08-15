/**
 * ImportFormView - Optimized for 15" touchscreen
 * Minimal design focused on the essential import functionality
 */
export class ImportFormView {
  constructor({ calendars }) {
    this.calendars = calendars || [];
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'import-form-touch';
    
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
    wrapper.querySelector('.cancel-btn')?.addEventListener('click', () => {
      wrapper.dispatchEvent(new CustomEvent('cancel', { bubbles: true }));
    });

    // Help toggle
    wrapper.querySelector('.help-toggle')?.addEventListener('click', () => {
      const helpContent = wrapper.querySelector('.help-content');
      const helpToggle = wrapper.querySelector('.help-toggle');
      helpContent.classList.toggle('expanded');
      helpToggle.classList.toggle('expanded');
    });

    this._attachTouchFeedback(wrapper);

    return wrapper;
  }

  _template() {
    return `
      <form class="touch-import-form">
        <!-- Toast Container -->
        <div class="toast-container"></div>

        <!-- Main Content -->
        <div class="form-content">
          <!-- Calendar ID Input -->
          <div class="input-section">
            <label class="section-label" for="google-calendar-id">
              Google Calendar ID
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <svg class="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              <input 
                id="google-calendar-id" 
                type="text" 
                placeholder="example@group.calendar.google.com"
                class="input-large"
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
          <div class="help-section">
            <button type="button" class="help-toggle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
              <span>How to find your Calendar ID</span>
              <svg class="toggle-arrow" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            <div class="help-content">
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

        <!-- Action Buttons -->
        <div class="form-footer">
          <button type="button" class="btn cancel-btn">Cancel</button>
          <button type="submit" class="btn primary-btn">
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
    if (document.getElementById('import-form-touch-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'import-form-touch-styles';
    style.textContent = `
      * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      .import-form-touch {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: 100%;
        background: #f5f7fa;
        display: flex;
        align-items: flex-start;
        justify-content: center;
      }

      .touch-import-form {
        width: 100%;
        max-width: 1024px;
        margin: 0 auto;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
        position: relative;
      }

      /* Toast */
      .toast-container {
        position: absolute;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
      }

      .toast {
        padding: 20px 30px;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 500;
        color: white;
        min-width: 300px;
        text-align: center;
        animation: slideDown 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
        background: #ea4335;
      }

      .toast.success {
        background: #34a853;
      }

      /* Content */
      .form-content {
        padding: 30px 40px;
        display: flex;
        flex-direction: column;
        background: #fafbfc;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
        padding-top: 60px;
      }

      /* Input Section */
      .input-section {
        background: white;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        border: 1px solid #e1e4e8;
      }

      .section-label {
        display: block;
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .required {
        color: #ea4335;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon {
        position: absolute;
        left: 24px;
        color: #4285f4;
        pointer-events: none;
        width: 28px;
        height: 28px;
      }

      .input-large {
        width: 100%;
        height: 70px;
        font-size: 20px;
        padding: 0 24px 0 68px;
        border: 3px solid #e1e4e8;
        border-radius: 12px;
        background: #ffffff;
        color: #2c3e50;
        transition: all 0.2s;
        font-family: 'Courier New', monospace;
      }

      .input-large:focus {
        outline: none;
        border-color: #4285f4;
        background: #f8f9ff;
      }

      .input-large::placeholder {
        color: #adb5bd;
        font-family: 'Courier New', monospace;
        font-size: 18px;
      }

      .input-helper {
        margin-top: 12px;
        font-size: 16px;
        color: #6c757d;
        font-style: italic;
      }

      /* Help Section */
      .help-section {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        border: 1px solid #e1e4e8;
      }

      .help-toggle {
        width: 100%;
        padding: 20px 24px;
        background: #f8f9fa;
        border: none;
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        transition: all 0.2s;
        min-height: 60px;
      }

      .help-toggle:hover {
        background: #e9ecef;
      }

      .help-toggle:active {
        transform: scale(0.99);
      }

      .toggle-arrow {
        margin-left: auto;
        transition: transform 0.3s;
      }

      .help-toggle.expanded .toggle-arrow {
        transform: rotate(180deg);
      }

      .help-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        background: white;
      }

      .help-content.expanded {
        max-height: 600px;
      }

      .help-steps {
        list-style: none;
        margin: 0;
        padding: 24px;
      }

      .help-steps li {
        display: flex;
        gap: 16px;
        margin-bottom: 20px;
      }

      .help-steps li:last-child {
        margin-bottom: 0;
      }

      .step-number {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        background: #4285f4;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 20px;
      }

      .step-content strong {
        display: block;
        font-size: 18px;
        color: #2c3e50;
        margin-bottom: 6px;
      }

      .step-content p {
        margin: 0;
        font-size: 16px;
        color: #6c757d;
        line-height: 1.5;
      }

      /* Action Buttons */
      .form-footer {
        display: flex;
        gap: 16px;
        padding: 24px 28px;
        background: white;
        border-top: 1px solid #e0e0e0;
      }

      .btn {
        flex: 1;
        padding: 16px 24px;
        font-size: 16px;
        font-weight: 600;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 56px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .cancel-btn {
        background: #f5f5f5;
        color: #666;
      }

      .cancel-btn:hover {
        background: #e0e0e0;
      }

      .cancel-btn:active {
        transform: scale(0.98);
      }

      .primary-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .primary-btn:hover {
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        transform: translateY(-2px);
      }

      .primary-btn:active {
        transform: scale(0.98);
      }

      /* Touch Feedback */
      .touch-active {
        transform: scale(0.98);
        opacity: 0.9;
      }

      /* Responsive */
      @media (max-width: 1366px) and (max-height: 768px) {
        .form-content {
          padding: 30px;
        }

        .input-section {
          padding: 24px;
        }

        .input-large {
          height: 70px;
          font-size: 20px;
        }

        .btn-touch {
          height: 70px;
          font-size: 18px;
        }

        .help-toggle {
          min-height: 60px;
          font-size: 16px;
          padding: 20px 24px;
        }

        .help-steps {
          padding: 24px;
        }

        .step-number {
          width: 40px;
          height: 40px;
          font-size: 18px;
        }
      }

      /* High Contrast */
      @media (prefers-contrast: high) {
        .input-large {
          border-width: 3px;
        }

        .btn-import {
          background: #2c3e50;
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

  _attachTouchFeedback(wrapper) {
    const touchElements = wrapper.querySelectorAll('button, input');
    
    touchElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });
      
      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      });
      
      // Mouse events for testing
      element.addEventListener('mousedown', () => {
        element.classList.add('touch-active');
      });
      
      element.addEventListener('mouseup', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      });
    });
  }
}

export default ImportFormView;