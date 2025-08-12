/**
 * CalendarFormView
 * Renders the calendar creation form and emits a custom event on submit
 */
export class CalendarFormView {
  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'calendar-form-view';
    wrapper.innerHTML = this._template();

    const form = wrapper.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = wrapper.querySelector('#calendar-name').value.trim();
      const description = wrapper.querySelector('#calendar-description').value.trim();
      const color = wrapper.querySelector('input[name="color"]:checked').value;
      const timeZone = wrapper.querySelector('#calendar-timezone').value;
      if (!name) {
        wrapper.dispatchEvent(new CustomEvent('formError', { bubbles: true, detail: { message: 'Name is required' } }));
        return;
      }
      const payload = { name, description, color, timeZone };
      wrapper.dispatchEvent(new CustomEvent('submitCalendar', { bubbles: true, detail: payload }));
    });

    wrapper.querySelector('.cancel-btn')?.addEventListener('click', () => {
      wrapper.dispatchEvent(new CustomEvent('cancel', { bubbles: true }));
    });

    // Color selection visual feedback
    const updateColorSelection = () => {
      wrapper.querySelectorAll('label[for^="color-"]').forEach(label => {
        label.classList.remove('selected');
      });
      const checked = wrapper.querySelector('input[name="color"]:checked');
      if (checked) {
        const label = wrapper.querySelector(`label[for="${checked.id}"]`);
        label?.classList.add('selected');
      }
    };
    wrapper.querySelectorAll('input[name="color"]').forEach(input => input.addEventListener('change', updateColorSelection));
    updateColorSelection();

    return wrapper;
  }

  _template() {
    return `
      <form class="calendar-form">
        <div class="row">
          <div class="field">
            <label>Calendar Name</label>
            <input id="calendar-name" type="text" required placeholder="My Calendar" />
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Description (optional)</label>
            <textarea id="calendar-description" rows="3" placeholder="Calendar description"></textarea>
          </div>
        </div>
        <div class="row two-col">
          <div class="field">
            <label>Color</label>
            <div class="color-picker">
              <input type="radio" name="color" value="#1a73e8" id="color-blue" checked hidden>
              <label for="color-blue" class="color-swatch" style="--swatch:#1a73e8"></label>
              <input type="radio" name="color" value="#0b8043" id="color-green" hidden>
              <label for="color-green" class="color-swatch" style="--swatch:#0b8043"></label>
              <input type="radio" name="color" value="#d50000" id="color-red" hidden>
              <label for="color-red" class="color-swatch" style="--swatch:#d50000"></label>
              <input type="radio" name="color" value="#f4511e" id="color-orange" hidden>
              <label for="color-orange" class="color-swatch" style="--swatch:#f4511e"></label>
              <input type="radio" name="color" value="#8e24aa" id="color-purple" hidden>
              <label for="color-purple" class="color-swatch" style="--swatch:#8e24aa"></label>
              <input type="radio" name="color" value="#616161" id="color-gray" hidden>
              <label for="color-gray" class="color-swatch" style="--swatch:#616161"></label>
            </div>
          </div>
          <div class="field">
            <label>Time Zone</label>
            <select id="calendar-timezone">
              <option value="local">Local Time Zone</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
        <div class="actions">
          <button type="button" class="cancel-btn">Cancel</button>
          <button type="submit" class="primary">Add Calendar</button>
        </div>
      </form>
    `;
  }
}

export default CalendarFormView;


