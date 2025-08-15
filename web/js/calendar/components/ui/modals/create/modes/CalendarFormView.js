/**
 * CalendarFormView - Optimized for 15" touchscreen
 * Large touch targets, clear visual hierarchy, accessible design
 * Improved custom color picker for better touch interaction
 */
export class CalendarFormView {
  constructor() {
    this.selectedColor = '#1a73e8';
    this.customColor = '#ff6b6b'; // Default custom color
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'calendar-form-touch';
    
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
    this._attachTouchFeedback(wrapper);
    this._setupCustomColorPicker(wrapper);

    return wrapper;
  }

  _template() {
    const colors = [
      { value: '#1a73e8', name: 'Blue', label: 'Primary Blue' },
      { value: '#0b8043', name: 'Green', label: 'Forest Green' },
      { value: '#d50000', name: 'Red', label: 'Vibrant Red' },
      { value: '#8e24aa', name: 'Purple', label: 'Royal Purple' },
      { value: '#616161', name: 'Gray', label: 'Neutral Gray' },
      { value: '#e91e63', name: 'Pink', label: 'Rose Pink' },
      { value: '#009688', name: 'Teal', label: 'Ocean Teal' }
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
      <form class="touch-calendar-form">
        <!-- Toast Container -->
        <div class="toast-container"></div>

        <!-- Main Content -->
        <div class="form-body">
          <!-- Calendar Name -->
          <div class="input-section">
            <label class="section-label" for="calendar-name">Calendar Name *</label>
            <input 
              id="calendar-name" 
              type="text" 
              required 
              placeholder="Enter calendar name"
              class="input-primary"
              autocomplete="off"
              maxlength="50"
            />
            <div class="input-helper">Give your calendar a descriptive name</div>
          </div>

          <!-- Description -->
          <div class="input-section">
            <label class="section-label" for="calendar-description">Description</label>
            <textarea 
              id="calendar-description" 
              rows="3"
              placeholder="Add a description for this calendar (optional)"
              class="textarea-touch"
              maxlength="200"
            ></textarea>
            <div class="input-helper">Optional: Add notes about this calendar</div>
          </div>

          <!-- Color Selection -->
          <div class="input-section">
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
                <span class="quick-colors-label">Quick Colors:</span>
                <div class="quick-color-grid">
                  <button type="button" class="quick-color" data-color="#ff6b6b" style="background: #ff6b6b"></button>
                  <button type="button" class="quick-color" data-color="#4ecdc4" style="background: #4ecdc4"></button>
                  <button type="button" class="quick-color" data-color="#45b7d1" style="background: #45b7d1"></button>
                  <button type="button" class="quick-color" data-color="#96ceb4" style="background: #96ceb4"></button>
                  <button type="button" class="quick-color" data-color="#feca57" style="background: #feca57"></button>
                  <button type="button" class="quick-color" data-color="#ff9ff3" style="background: #ff9ff3"></button>
                  <button type="button" class="quick-color" data-color="#dfe4ea" style="background: #dfe4ea"></button>
                  <button type="button" class="quick-color" data-color="#5f27cd" style="background: #5f27cd"></button>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Zone -->
          <div class="input-section">
            <label class="section-label" for="calendar-timezone">Time Zone</label>
            <div class="select-wrapper">
              <svg class="select-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <select id="calendar-timezone" class="select-touch">
                ${timezones.map(tz => `
                  <option value="${tz.value}">${tz.label}</option>
                `).join('')}
              </select>
            </div>
            <div class="input-helper">Events will be displayed in this time zone</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-footer">
          <button type="button" class="btn-touch btn-cancel">Cancel</button>
          <button type="submit" class="btn-touch btn-create">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create Calendar
          </button>
        </div>
      </form>
    `;
  }

  _injectStyles() {
    if (document.getElementById('calendar-form-touch-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'calendar-form-touch-styles';
    style.textContent = `
      * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      .calendar-form-touch {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        color: #1a1a1a;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        max-width: 800px;
        margin: 0 auto;
      }

      .touch-calendar-form {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      /* Toast */
      .toast-container {
        position: absolute;
        top: 100px;
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

      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
      }

      .toast.error {
        background: #e74c3c;
      }

      .toast.success {
        background: #27ae60;
      }

      /* Content Area */
      .form-body {
        flex: 1;
        padding: 28px;
        background: #fafafa;
      }

      .form-section {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
      }

      /* Input Sections (Calendar Name style) */
      .input-section {
        background: white;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
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

      .input-helper {
        margin-top: 8px;
        font-size: 14px;
        color: #6c757d;
        font-style: italic;
      }

      /* Primary Input */
      .input-primary {
        width: 100%;
        height: 70px;
        font-size: 22px;
        padding: 0 20px;
        border: 3px solid #e1e4e8;
        border-radius: 12px;
        background: #ffffff;
        color: #2c3e50;
        transition: all 0.2s;
        font-weight: 500;
      }

      .input-primary:focus {
        outline: none;
        border-color: #5B21B6;
        background: #f8f9ff;
      }

      .input-primary::placeholder {
        color: #adb5bd;
        font-weight: 400;
      }

      /* Textarea */
      .textarea-touch {
        width: 100%;
        min-height: 120px;
        font-size: 18px;
        padding: 16px 20px;
        border: 2px solid #e1e4e8;
        border-radius: 12px;
        background: #ffffff;
        color: #2c3e50;
        resize: vertical;
        font-family: inherit;
        transition: all 0.2s;
      }

      .textarea-touch:focus {
        outline: none;
        border-color: #5B21B6;
        background: #f8f9ff;
      }

      .textarea-touch::placeholder {
        color: #adb5bd;
      }

      /* Color Grid */
      .color-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }

      .color-option input {
        display: none;
      }

      .color-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100px;
        padding: 12px;
        background: white;
        border: 3px solid #e1e4e8;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }

      .color-swatch {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--color);
        margin-bottom: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
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
        font-size: 20px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      .color-name {
        font-size: 14px;
        font-weight: 600;
        color: #495057;
        text-align: center;
      }

      .color-option input:checked + .color-button {
        border-color: var(--color);
        background: #f8f9ff;
        transform: scale(0.95);
      }

      .color-option input:checked + .color-button .color-swatch {
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .color-button:active {
        transform: scale(0.92);
      }

      /* Custom Color Panel */
      .custom-color-panel {
        margin-top: 20px;
        padding: 20px;
        background: #f8f9ff;
        border-radius: 12px;
        border: 2px solid #5B21B6;
        animation: slideDown 0.3s ease;
      }

      .color-picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .picker-title {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
      }

      .current-color-value {
        font-size: 14px;
        font-family: 'Courier New', monospace;
        color: #5B21B6;
        background: white;
        padding: 4px 12px;
        border-radius: 6px;
        border: 1px solid #e1e4e8;
      }

      .color-picker-container {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 20px;
      }

      .large-color-picker {
        width: 120px;
        height: 120px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        background: none;
      }

      .large-color-picker::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      .large-color-picker::-webkit-color-swatch {
        border: 3px solid #e1e4e8;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .large-color-picker::-moz-color-swatch {
        border: 3px solid #e1e4e8;
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
        width: 80px;
        height: 80px;
        border-radius: 12px;
        border: 3px solid #e1e4e8;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .preview-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .preview-label {
        font-size: 14px;
        color: #6c757d;
        font-weight: 500;
      }

      .color-hex-input {
        width: 140px;
        height: 50px;
        font-size: 18px;
        font-family: 'Courier New', monospace;
        padding: 0 12px;
        border: 2px solid #e1e4e8;
        border-radius: 8px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .color-hex-input:focus {
        outline: none;
        border-color: #5B21B6;
        background: white;
      }

      .quick-colors {
        border-top: 1px solid #e1e4e8;
        padding-top: 16px;
      }

      .quick-colors-label {
        display: block;
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 12px;
        font-weight: 500;
      }

      .quick-color-grid {
        display: flex;
        gap: 12px;
      }

      .quick-color {
        width: 50px;
        height: 50px;
        border: 2px solid #e1e4e8;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .quick-color:hover {
        transform: scale(1.1);
        border-color: #5B21B6;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
        color: #5B21B6;
      }

      .select-touch {
        width: 100%;
        height: 70px;
        font-size: 18px;
        padding: 0 20px 0 60px;
        border: 2px solid #e1e4e8;
        border-radius: 12px;
        background: white;
        color: #2c3e50;
        cursor: pointer;
        appearance: none;
        background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%235B21B6" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>');
        background-repeat: no-repeat;
        background-position: right 20px center;
        transition: all 0.2s;
      }

      .select-touch:focus {
        outline: none;
        border-color: #5B21B6;
        background-color: #f8f9ff;
      }

      .form-footer {
        display: flex;
        gap: 16px;
        padding: 24px 28px;
        background: white;
        border-top: 1px solid #e0e0e0;
      }

      .btn-touch {
        flex: 1;
        height: 80px;
        font-size: 20px;
        font-weight: 600;
        border: none;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .btn-cancel {
        background: #e9ecef;
        color: #495057;
      }

      .btn-cancel:active {
        background: #dee2e6;
        transform: scale(0.98);
      }

      .btn-create {
        background: linear-gradient(135deg, #5B21B6 0%, #EC4899 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(91, 33, 182, 0.3);
      }

      .btn-create:active {
        transform: scale(0.98);
        box-shadow: 0 2px 8px rgba(91, 33, 182, 0.3);
      }

      /* Touch Feedback */
      .touch-active {
        transform: scale(0.98);
        opacity: 0.9;
      }

      /* Responsive adjustments for 15" touch screen */
      @media (max-width: 1366px) {
        .calendar-form-touch {
          max-width: 100%;
          border-radius: 0;
        }

        .form-body {
          padding: 20px;
        }

        .input-section {
          padding: 20px;
          margin-bottom: 20px;
        }

        .input-primary {
          height: 60px;
          font-size: 20px;
        }

        .color-button {
          height: 90px;
        }

        .color-swatch {
          width: 40px;
          height: 40px;
        }

        .select-touch {
          height: 60px;
          font-size: 16px;
        }

        .btn-touch {
          height: 70px;
          font-size: 18px;
        }

        .large-color-picker {
          width: 100px;
          height: 100px;
        }

        .preview-swatch {
          width: 70px;
          height: 70px;
        }
      }

      /* High Contrast Support */
      @media (prefers-contrast: high) {
        .input-primary,
        .textarea-touch,
        .select-touch,
        .color-button {
          border-width: 3px;
        }

        .btn-create {
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
        // Update visual selection
        wrapper.querySelectorAll('.color-button').forEach(btn => {
          btn.classList.remove('selected');
        });
        
        const selectedButton = wrapper.querySelector(`label[for="${input.id}"]`);
        if (selectedButton) {
          selectedButton.classList.add('selected');
          this.selectedColor = input.value;
          
          // Provide haptic-style feedback (visual pulse)
          selectedButton.style.animation = 'pulse 0.3s ease';
          setTimeout(() => {
            selectedButton.style.animation = '';
          }, 300);
        }
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
        // Scroll to make panel visible
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
        
        // Visual feedback
        button.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
          button.style.animation = '';
        }, 300);
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

  _attachTouchFeedback(wrapper) {
    const touchElements = wrapper.querySelectorAll('button, input, select, textarea, .color-button, .quick-color');
    
    touchElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });
      
      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      });
      
      // Also handle mouse events for testing
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

export default CalendarFormView;