/**
 * ImportFormView
 * Renders the import calendar form for Google Calendar ID and emits a custom event on submit
 */
export class ImportFormView {
  constructor({ calendars }) {
    this.calendars = calendars || [];
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'import-form-view';
    wrapper.innerHTML = this._template();

    const form = wrapper.querySelector('form');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const googleCalendarId = wrapper.querySelector('#google-calendar-id').value;
      
      const detail = { 
        method: 'google', 
        syncEnabled: true, 
        googleCalendarId 
      };
      
      wrapper.dispatchEvent(new CustomEvent('submitImport', { bubbles: true, detail }));
    });

    wrapper.querySelector('.cancel-btn')?.addEventListener('click', () => {
      wrapper.dispatchEvent(new CustomEvent('cancel', { bubbles: true }));
    });

    return wrapper;
  }

  _template() {
    return `
      <form class="import-form">
        <div class="row">
          <div class="field">
            <label>Google Calendar ID</label>
            <input id="google-calendar-id" type="text" placeholder="calendar@group.calendar.google.com" required />
          </div>
        </div>
        <div class="actions">
          <button type="button" class="cancel-btn">Cancel</button>
          <button type="submit" class="primary">Import</button>
        </div>
      </form>
    `;
  }
}

export default ImportFormView;


