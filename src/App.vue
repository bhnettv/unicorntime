<template>
  <div id="app">
    <keep-alive include="home">
      <router-view />
    </keep-alive>
    <div class="loader" v-show="!hideLoader">
      <breeding-rhombus-spinner
        :animation-duration="1000"
        :size="40"
        :color="'#ff1d5e'"
        style="margin: 0;"
      />
    </div>
    <p class="app-version">{{ appVersion }}</p>
    <button @click="openSettings" class="settings-modal-button">
      <font-awesome-icon icon="cog" />
    </button>
    <modal
      name="settings-modal"
      classes="v--modal vue-dialog"
      height="auto"
      transition="fade"
      :pivot-y="0.4"
      :adaptive="true">
      <div class="dialog-content">
        <div class="dialog-c-title">Settings</div>
        <div class="dialog-c-text">
          <p>Token:</p>
          <textarea rows="5" v-model="token"></textarea>
          <p>Proxy URL:</p>
          <input type="text" v-model="proxy" />
        </div>
      </div>
      <div class="vue-dialog-buttons">
        <button
          class="vue-dialog-button"
          style="flex: 1 1 100%;"
          @click="saveSettings">
          Save
        </button>
      </div> <!---->
    </modal>
  </div>
</template>

<script>
import { remote } from 'electron';
import { BreedingRhombusSpinner } from 'epic-spinners';
import settingsStore from './settings';

export default {
  components: { BreedingRhombusSpinner },
  data() {
    return {
      hideLoader: false,
      appVersion: '',
      token: settingsStore.get('token'),
      proxy: settingsStore.get('proxy'),
    };
  },
  computed: {
    initialDataLoaded() {
      // eslint-disable-next-line no-sequences
      return [this.$store.state.movieCatalogueFetched, this.$store.state.categoryCatalogueFetched];
    },
  },
  methods: {
    openSettings() {
      this.$modal.show('settings-modal');
    },
    saveSettings() {
      settingsStore.set('token', this.token);
      settingsStore.set('proxy', this.proxy);
      remote.getCurrentWindow().reload();
    },
  },
  watch: {
    initialDataLoaded(data) {
      if (data[0] === true && data[1] === true) {
        this.hideLoader = true;
        document.body.style.overflow = 'auto';
        const firstCategory = this.$store.state.categoryCatalogue[0];
        this.$router.push({
          name: 'list',
          params: {
            id: firstCategory.id,
          },
        });
      }
    },
  },
  created() {
    document.body.style.overflow = 'hidden';
    this.appVersion = `Version: ${remote.app.getVersion()}`;
  },
};
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

* {
  font-family: FiraSans;
  font-weight: 400;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  background: #1f1f1f;
  user-select: none;
}

.loader {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #000000;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.app-version {
  z-index: 10000;
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 0;
  margin: 0;
  background: rgba(255,255,255,0.8);
  color: #000000;
  padding: 2px 6px;
  font-size: 14px;
}

.dialog-c-text {
  display: flex;
  flex-direction: column;
}

.settings-modal-button {
  position: fixed;
  right: 10px;
  bottom: 30px;
  z-index: 10000;
  outline: none;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #B0B0B0;
  background-image: -webkit-linear-gradient(top, #B0B0B0, #F2F2F2);
  background-image: -moz-linear-gradient(top, #B0B0B0, #F2F2F2);
  background-image: -ms-linear-gradient(top, #B0B0B0, #F2F2F2);
  background-image: -o-linear-gradient(top, #B0B0B0, #F2F2F2);
  background-image: linear-gradient(to bottom, #B0B0B0, #F2F2F2);
  -webkit-border-radius: 100px;
  -moz-border-radius: 100px;
  border-radius: 100px;
  height: 40px;
  line-height: 50px;
  color: rgb(80, 80, 80);
  font-family: Open Sans;
  width: 40px;
  font-size: 20px;
  font-weight: 100;
  box-shadow: 1px 1px 20px 0px #000000;
  -webkit-box-shadow: 1px 1px 20px 0px #000000;
  -moz-box-shadow: 1px 1px 20px 0px #000000;
  text-shadow: 1px 1px 20px #000000;
  border: solid #CFCFCF 1px;
  text-decoration: none;
  cursor: pointer;
}

.settings-modal-button:hover {
  background: #D03434;
  border-color: #D03434;
  color: #ffffff;
  text-decoration: none;
}

.v--modal-overlay {
  z-index: 10001 !important;
}

::-webkit-scrollbar {
    width: 14px;
    height: 18px;
}
::-webkit-scrollbar-thumb {
    height: 6px;
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 7px;
    background-color: rgba(75, 102, 255, 0.8);
    box-shadow: inset -1px -1px 0px rgba(0, 0, 0, 0.05), inset 1px 1px 0px rgba(0, 0, 0, 0.05);
}
::-webkit-scrollbar-track {
  background: #1f1f1f;
}
::-webkit-scrollbar-button {
    width: 0;
    height: 0;
    display: none;
}
::-webkit-scrollbar-corner {
    background-color: transparent;
}

@font-face {
  font-family: 'FiraSans';
  src:  url('./assets/fonts/FiraSans-Regular.ttf');
  font-weight: 400;
}

@font-face {
  font-family: 'FiraSans';
  src:  url('./assets/fonts/FiraSans-Bold.ttf');
  font-weight: 500;
}

@font-face {
  font-family: 'FiraSans';
  src:  url('./assets/fonts/FiraSans-Light.ttf');
  font-weight: 300;
}
</style>
