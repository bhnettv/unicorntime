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
    <button class="button fab settings-button" @click="openSettings">
      <font-awesome-icon icon="cog" />
    </button>
    <modal
      name="password-modal"
      classes="v--modal vue-dialog"
      height="auto"
      transition="fade"
      :pivot-y="0.4"
      :adaptive="true">
      <div class="dialog-content">
        <div class="dialog-c-title">Password</div>
        <div class="dialog-c-text">
          <p>Password:</p>
          <input type="password" v-model="password" />
          <span style="color: red;" v-show="wrongPassword">Incorrect password</span>
        </div>
      </div>
      <div class="vue-dialog-buttons">
        <button
          class="vue-dialog-button"
          style="flex: 1 1 100%;"
          @click="openSettingsModal">
          Go
        </button>
      </div>
    </modal>
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
      </div>
    </modal>
  </div>
</template>

<script>
import { remote } from 'electron';
import { BreedingRhombusSpinner } from 'epic-spinners';
import SHA256 from 'crypto-js/sha256';
import settingsStore from './settings';

export default {
  components: { BreedingRhombusSpinner },
  data() {
    return {
      hideLoader: false,
      appVersion: '',
      token: settingsStore.get('token'),
      proxy: settingsStore.get('proxy'),
      password: '',
      wrongPassword: false,
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
      this.wrongPassword = false;
      this.$modal.show('password-modal');
    },
    openSettingsModal() {
      const passwordHash = SHA256(this.password).toString();
      if (passwordHash === this.modalHash) {
        this.$modal.show('settings-modal');
      } else {
        this.wrongPassword = true;
      }
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
    this.modalHash = '46cde8e146cbc10b39e76258c97db6177a8f8f235f6ca234e0bd7c2aa2f88096';
  },
};
</script>

<style lang="scss">
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

.v--modal-overlay {
  z-index: 10001 !important;
}

.settings-button {
  position: fixed;
  right: 10px;
  bottom: 30px;
  z-index: 10000;
}
</style>
