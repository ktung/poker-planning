class Toggle {
  #togglesState = new Map();

  #defaultToggles = {
    CONFIG_BANNER: 'off'
  };

  /**
   *
   * @param {('CONFIG_BANNER')} key toggle name
   * @returns {boolean} true if the toggle is active
   */
  isActive(key) {
    return this.#togglesState.get(key) === 'on';
  }

  /**
   * Init toggles from localstorage
   * @param {Storage} localStorage
   */
  initToggles(localStorage) {
    for (const [key, defaultValue] of Object.entries(this.#defaultToggles)) {
      this.#togglesState.set(key, localStorage.getItem(key) || defaultValue);
    }
  }
}
const ToggleConfig = new Toggle();
export { ToggleConfig };
