/**
 * CalendarFormView - Light Glassmorphism Design System
 * Elegant glass panels floating over animated gradient background
 */
export class CalendarFormView {
  constructor() {
    this.selectedColor = '#6366f1';
    this.customColor = '#8b5cf6'; // Default custom color (purple gradient end)
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'calendar-form-glass';
    
    this._injectStyles();
    wrapper.innerHTML = this._template();

    const form = wrapper.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = wrapper.querySelector('#calendar-name').value.trim();
      const description = wrapper.querySelector('#calendar-description').value.trim();
      
      // Get the selected color
      const checkedColorInput = wrapper.querySelector('input[name="color"]:checked');
      const color = checkedColorInput.value;
      
      const timeZone = wrapper.querySelector('#calendar-timezone').value;
      
      if (!name) {
        this._showToast(wrapper, 'Calendar name is required', 'error');
        return;
      }
      
      const payload = { name, description, color, timeZone };
      wrapper.dispatchEvent(new CustomEvent('submitCalendar', { bubbles: true, detail: payload }));
    });

    wrapper.querySelector('.btn-cancel')?.addEventListener('click', () => {
      wrapper.dispatchEvent(new CustomEvent('cancel', { bubbles: true }));
    });

    // Initialize color selection
    this._attachColorSelection(wrapper);
    this._setupCustomColorPicker(wrapper);

    return wrapper;
  }

  _template() {
    const colors = [
      { value: '#6366f1', name: 'Indigo', label: 'Primary Indigo' },
      { value: '#8b5cf6', name: 'Purple', label: 'Accent Purple' },
      { value: '#ec4899', name: 'Pink', label: 'Rose Pink' },
      { value: '#06b6d4', name: 'Cyan', label: 'Ocean Cyan' },
      { value: '#10b981', name: 'Emerald', label: 'Forest Emerald' },
      { value: '#f59e0b', name: 'Amber', label: 'Warm Amber' },
      { value: '#64748b', name: 'Slate', label: 'Neutral Slate' }
    ];

    const timezones = [
      { value: 'local', label: 'Local Time Zone', group: 'Default' },
      { value: 'UTC', label: 'UTC (Coordinated Universal Time)', group: 'Universal' },
      { value: 'America/New_York', label: 'Eastern Time (ET)', group: 'US & Canada' },
      { value: 'America/Chicago', label: 'Central Time (CT)', group: 'US & Canada' },
      { value: 'America/Denver', label: 'Mountain Time (MT)', group: 'US & Canada' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', group: 'US & Canada' },
      { value: 'Europe/London', label: 'London (GMT)', group: 'Europe' },
      { value: 'Europe/Paris', label: 'Paris (CET)', group: 'Europe' },
      { value: 'Asia/Tokyo', label: 'Tokyo (JST)', group: 'Asia' },
      { value: 'Australia/Sydney', label: 'Sydney (AEDT)', group: 'Australia' }
    ];

    return `
      <form class="glass-calendar-form">
        <!-- Toast Container -->
        <div class="toast-container"></div>

        <!-- Glass Header -->
        <div class="form-header">
          <h1 class="gradient-text">Create Calendar</h1>
          <p class="header-subtitle">Design your personal calendar with custom colors and settings</p>
        </div>

        <!-- Main Content -->
        <div class="form-content">
          <!-- Calendar Name -->
          <div class="glass-panel input-section">
            <label class="section-label" for="calendar-name">
              Calendar Name
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="url(#purple-gradient)">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <input 
                id="calendar-name" 
                type="text" 
                required 
                placeholder="Enter calendar name"
                class="glass-input"
                autocomplete="off"
                maxlength="50"
              />
            </div>
            <div class="input-helper">Give your calendar a descriptive name</div>
          </div>

          <!-- Description -->
          <div class="glass-panel input-section">
            <label class="section-label" for="calendar-description">Description</label>
            <textarea 
              id="calendar-description" 
              rows="3"
              placeholder="Add a description for this calendar (optional)"
              class="glass-textarea"
              maxlength="200"
            ></textarea>
            <div class="input-helper">Optional: Add notes about this calendar</div>
          </div>

          <!-- Color Selection -->
          <div class="glass-panel input-section">
            <label class="section-label">Calendar Color</label>
            <div class="color-grid">
              ${colors.map((color, index) => `
                <div class="color-option">
                  <input 
                    type="radio" 
                    name="color" 
                    value="${color.value}" 
                    id="color-${color.name.toLowerCase()}"
                    ${index === 0 ? 'checked' : ''}
                  >
                  <label 
                    for="color-${color.name.toLowerCase()}" 
                    class="color-button"
                    style="--color: ${color.value}"
                    title="${color.label}"
                  >
                    <span class="color-swatch"></span>
                    <span class="color-name">${color.name}</span>
                  </label>
                </div>
              `).join('')}
              
              <!-- Custom Color Option -->
              <div class="color-option custom-color-option">
                <input 
                  type="radio" 
                  name="color" 
                  value="${this.customColor}" 
                  id="color-custom"
                >
                <label 
                  for="color-custom" 
                  class="color-button custom-color-button"
                  style="--color: ${this.customColor}"
                  title="Custom Color"
                >
                  <span class="color-swatch custom-swatch"></span>
                  <span class="color-name">Custom</span>
                </label>
              </div>
            </div>

            <!-- Custom Color Picker Panel -->
            <div class="custom-color-panel" style="display: none;">
              <div class="gradient-line"></div>
              <div class="color-picker-header">
                <span class="picker-title">Choose Custom Color</span>
                <span class="current-color-value">${this.customColor}</span>
              </div>
              <div class="color-picker-container">
                <input 
                  type="color" 
                  id="custom-color-input" 
                  value="${this.customColor}"
                  class="large-color-picker"
                >
                <div class="color-preview">
                  <div class="preview-swatch" style="background: ${this.customColor}"></div>
                  <div class="preview-info">
                    <span class="preview-label">Selected Color</span>
                    <input 
                      type="text" 
                      class="color-hex-input" 
                      value="${this.customColor}"
                      placeholder="#000000"
                      maxlength="7"
                    >
                  </div>
                </div>
              </div>
              <div class="quick-colors">
                <span class="quick-colors-label">Quick Colors</span>
                <div class="quick-color-grid">
                  <button type="button" class="quick-color" data-color="#6366f1" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)"></button>
                  <button type="button" class="quick-color" data-color="#ec4899" style="background: #ec4899"></button>
                  <button type="button" class="quick-color" data-color="#06b6d4" style="background: #06b6d4"></button>
                  <button type="button" class="quick-color" data-color="#10b981" style="background: #10b981"></button>
                  <button type="button" class="quick-color" data-color="#f59e0b" style="background: #f59e0b"></button>
                  <button type="button" class="quick-color" data-color="#8b5cf6" style="background: #8b5cf6"></button>
                  <button type="button" class="quick-color" data-color="#64748b" style="background: #64748b"></button>
                  <button type="button" class="quick-color" data-color="#ef4444" style="background: #ef4444"></button>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Zone -->
          <div class="glass-panel input-section">
            <label class="section-label" for="calendar-timezone">Time Zone</label>
            <div class="select-wrapper">
              <svg class="select-icon" width="20" height="20" viewBox="0 0 24 24" fill="url(#purple-gradient)">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <select id="calendar-timezone" class="glass-select">
                ${timezones.map(tz => `
                  <option value="${tz.value}">${tz.label}</option>
                `).join('')}
              </select>
            </div>
            <div class="input-helper">Events will be displayed in this time zone</div>
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
          <button type="submit" class="btn-glass btn-create">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create Calendar
          </button>
        </div>
      </form>
    `;
  }

  _injectStyles() {
    if (document.getElementById('calendar-form-glass-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'calendar-form-glass-styles';
    style.textContent = `
      * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      /* Animated Gradient Background */
      .calendar-form-glass {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        min-height: 100vh;
        background: linear-gradient(135deg, #e3e8ff 0%, #f0e6ff 25%, #e6f2ff 50%, #e3e8ff 100%);
        background-size: 400% 400%;
        animation: gradientFlow 25s ease infinite;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      @keyframes gradientFlow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      /* Main Form Container */
      .glass-calendar-form {
        width: 100%;
        max-width: 900px;
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

      .glass-panel:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 12px 40px rgba(0, 0, 0, 0.1),
          inset 0 0 20px rgba(255, 255, 255, 0.6);
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
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
      }

      .toast.success {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9));
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
      }

      /* Header Section */
      .form-header {
        text-align: left;
        margin-bottom: 8px;
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

      /* Input Sections */
      .input-section {
        animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
      }

      .input-section:nth-child(2) { animation-delay: 0.15s; }
      .input-section:nth-child(3) { animation-delay: 0.2s; }
      .input-section:nth-child(4) { animation-delay: 0.25s; }

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

      .input-helper {
        margin-top: 12px;
        font-size: 13px;
        font-weight: 300;
        color: rgba(100, 116, 139, 0.7);
        letter-spacing: 0.2px;
        line-height: 1.5;
      }

      /* Input Wrapper */
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

      /* Glass Input */
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

      /* Glass Textarea */
      .glass-textarea {
        width: 100%;
        min-height: 100px;
        font-size: 15px;
        font-weight: 300;
        padding: 16px 20px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(30, 41, 59, 0.95);
        resize: vertical;
        font-family: inherit;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        letter-spacing: 0.2px;
        line-height: 1.6;
      }

      .glass-textarea:focus {
        outline: none;
        border-color: rgba(139, 92, 246, 0.3);
        background: rgba(139, 92, 246, 0.04);
        box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.08);
      }

      .glass-textarea::placeholder {
        color: rgba(100, 116, 139, 0.5);
        font-weight: 300;
      }

      /* Color Grid */
      .color-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 12px;
      }

      .color-option input {
        display: none;
      }

      .color-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 90px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }

      .color-button:hover {
        background: rgba(139, 92, 246, 0.04);
        transform: translateY(-2px);
        border-color: rgba(139, 92, 246, 0.2);
      }

      .color-swatch {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color);
        margin-bottom: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .custom-swatch {
        background: var(--color) !important;
        position: relative;
      }

      .custom-swatch::after {
        content: '✎';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 16px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      .color-name {
        font-size: 12px;
        font-weight: 400;
        color: rgba(51, 65, 85, 0.8);
        text-align: center;
        letter-spacing: 0.4px;
      }

      .color-option input:checked + .color-button {
        background: rgba(139, 92, 246, 0.06);
        border-color: rgba(139, 92, 246, 0.3);
        transform: scale(0.95);
      }

      .color-option input:checked + .color-button .color-swatch {
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15);
        transform: scale(1.1);
      }

      /* Custom Color Panel */
      .custom-color-panel {
        margin-top: 20px;
        padding: 24px;
        background: rgba(139, 92, 246, 0.04);
        border-radius: 12px;
        border: 1px solid rgba(139, 92, 246, 0.2);
        animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .gradient-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(100, 116, 139, 0.1), transparent);
        margin: 0 0 20px 0;
      }

      .color-picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .picker-title {
        font-size: 14px;
        font-weight: 500;
        color: rgba(30, 41, 59, 0.9);
        letter-spacing: 0.4px;
      }

      .current-color-value {
        font-size: 13px;
        font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
        color: #8b5cf6;
        background: rgba(255, 255, 255, 0.5);
        padding: 4px 12px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        letter-spacing: 0.5px;
      }

      .color-picker-container {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 20px;
      }

      .large-color-picker {
        width: 100px;
        height: 100px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        background: none;
      }

      .large-color-picker::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      .large-color-picker::-webkit-color-swatch {
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .large-color-picker::-moz-color-swatch {
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .color-preview {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .preview-swatch {
        width: 70px;
        height: 70px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .preview-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .preview-label {
        font-size: 12px;
        color: rgba(100, 116, 139, 0.7);
        font-weight: 400;
        letter-spacing: 0.4px;
      }

      .color-hex-input {
        width: 120px;
        height: 40px;
        font-size: 15px;
        font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(30, 41, 59, 0.95);
        text-transform: uppercase;
        font-weight: 400;
        letter-spacing: 0.5px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .color-hex-input:focus {
        outline: none;
        border-color: rgba(139, 92, 246, 0.3);
        background: rgba(139, 92, 246, 0.04);
      }

      .quick-colors {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 16px;
      }

      .quick-colors-label {
        display: block;
        font-size: 12px;
        color: rgba(100, 116, 139, 0.7);
        margin-bottom: 12px;
        font-weight: 400;
        letter-spacing: 0.4px;
      }

      .quick-color-grid {
        display: flex;
        gap: 10px;
      }

      .quick-color {
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .quick-color:hover {
        transform: translateY(-2px) scale(1.1);
        border-color: rgba(139, 92, 246, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .quick-color:active {
        transform: scale(0.95);
      }

      /* Select Wrapper */
      .select-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .select-icon {
        position: absolute;
        left: 20px;
        pointer-events: none;
        opacity: 0.6;
      }

      .glass-select {
        width: 100%;
        height: 56px;
        font-size: 15px;
        font-weight: 300;
        padding: 0 40px 0 52px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(30, 41, 59, 0.95);
        cursor: pointer;
        appearance: none;
        background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%238b5cf6" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>');
        background-repeat: no-repeat;
        background-position: right 16px center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        letter-spacing: 0.2px;
      }

      .glass-select:focus {
        outline: none;
        border-color: rgba(139, 92, 246, 0.3);
        background-color: rgba(139, 92, 246, 0.04);
        box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.08);
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

      .btn-create {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
      }

      .btn-create:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
      }

      .btn-create:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .glass-calendar-form {
          max-width: 100%;
        }

        .gradient-text {
          font-size: 32px;
        }

        .glass-panel {
          padding: 20px;
        }

        .color-grid {
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
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

        .glass-input,
        .glass-textarea,
        .glass-select {
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

  _attachColorSelection(wrapper) {
    const colorInputs = wrapper.querySelectorAll('input[name="color"]');
    
    colorInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.selectedColor = input.value;
      });
    });
  }

  _setupCustomColorPicker(wrapper) {
    const customRadio = wrapper.querySelector('#color-custom');
    const customButton = wrapper.querySelector('.custom-color-button');
    const customPanel = wrapper.querySelector('.custom-color-panel');
    const colorPicker = wrapper.querySelector('#custom-color-input');
    const hexInput = wrapper.querySelector('.color-hex-input');
    const previewSwatch = wrapper.querySelector('.preview-swatch');
    const customSwatch = wrapper.querySelector('.custom-swatch');
    const currentColorValue = wrapper.querySelector('.current-color-value');
    const quickColors = wrapper.querySelectorAll('.quick-color');

    // Show/hide custom color panel when custom option is selected
    customRadio.addEventListener('change', () => {
      if (customRadio.checked) {
        customPanel.style.display = 'block';
        customPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Hide panel when other color is selected
    wrapper.querySelectorAll('input[name="color"]:not(#color-custom)').forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          customPanel.style.display = 'none';
        }
      });
    });

    // Update color when using the large color picker
    colorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      this.customColor = color;
      customRadio.value = color;
      
      // Update all color displays
      hexInput.value = color;
      previewSwatch.style.background = color;
      customSwatch.style.background = color;
      customButton.style.setProperty('--color', color);
      currentColorValue.textContent = color;
      
      // Auto-select custom option
      if (!customRadio.checked) {
        customRadio.checked = true;
        customRadio.dispatchEvent(new Event('change'));
      }
    });

    // Update color when typing hex value
    hexInput.addEventListener('input', (e) => {
      let value = e.target.value;
      
      // Add # if not present
      if (value && !value.startsWith('#')) {
        value = '#' + value;
      }
      
      // Validate hex color
      const isValidHex = /^#[0-9A-F]{6}$/i.test(value);
      
      if (isValidHex) {
        this.customColor = value;
        customRadio.value = value;
        
        // Update all displays
        colorPicker.value = value;
        previewSwatch.style.background = value;
        customSwatch.style.background = value;
        customButton.style.setProperty('--color', value);
        currentColorValue.textContent = value;
        
        // Auto-select custom option
        if (!customRadio.checked) {
          customRadio.checked = true;
          customRadio.dispatchEvent(new Event('change'));
        }
      }
    });

    // Format hex input on blur
    hexInput.addEventListener('blur', (e) => {
      let value = e.target.value;
      if (!value.startsWith('#') && value) {
        value = '#' + value;
      }
      e.target.value = value.toUpperCase();
    });

    // Quick color buttons
    quickColors.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const color = button.dataset.color;
        
        this.customColor = color;
        customRadio.value = color;
        
        // Update all displays
        colorPicker.value = color;
        hexInput.value = color;
        previewSwatch.style.background = color;
        customSwatch.style.background = color;
        customButton.style.setProperty('--color', color);
        currentColorValue.textContent = color;
        
        // Auto-select custom option
        if (!customRadio.checked) {
          customRadio.checked = true;
          customRadio.dispatchEvent(new Event('change'));
        }
      });
    });

    // Click on custom button to show panel
    customButton.addEventListener('click', (e) => {
      if (!customRadio.checked) {
        customRadio.checked = true;
        customRadio.dispatchEvent(new Event('change'));
      }
    });
  }
}

export default CalendarFormView;