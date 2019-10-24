import Store from 'electron-store';

const settingsStore = new Store({
  defaults: {
    token: '',
    proxy: '',
    windowBounds: {
      width: 1600,
      height: 900,
    },
  },
});

export default settingsStore;
