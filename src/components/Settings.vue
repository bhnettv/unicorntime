<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Settings {{ appVersion }}</p>
    </header>
    <section class="modal-card-body">
      <b-tabs v-model="activeTab" class="settings-tabs">
        <b-tab-item label="Authenticate">
          <b-input type="password"
            placeholder="Password"
            v-model="password"
            @keyup.native.enter="onSubmit"
            ref="passwordInput">
          </b-input>
        </b-tab-item>
        <b-tab-item label="Settings">
          <b-field label="Token">
            <b-input
              type="textarea"
              v-model="token">
            </b-input>
          </b-field>

          <b-field label="Proxy">
            <b-input v-model="proxy"></b-input>
          </b-field>
        </b-tab-item>
      </b-tabs>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-link is-rounded" @click="onSubmit">Submit</button>
    </footer>
  </div>
  <!-- <section>
    <b-field>
      <b-input type="password"
        placeholder="Password reveal input"
        password-reveal>
      </b-input>
    </b-field>
  </section> -->
</template>

<script>
import { remote } from 'electron';
import SHA256 from 'crypto-js/sha256';
import settingsStore from '@/settings';

export default {
  name: 'settings',
  data() {
    return {
      activeTab: 0,
      password: '',
      token: settingsStore.get('token'),
      proxy: settingsStore.get('proxy'),
    };
  },
  methods: {
    onSubmit() {
      if (this.activeTab === 0) {
        const passwordHash = SHA256(this.password).toString();
        if (passwordHash === this.modalHash) {
          this.activeTab = 1;
        }
      } else {
        settingsStore.set('token', this.token);
        settingsStore.set('proxy', this.proxy);
        remote.getCurrentWindow().reload();
      }
    },
  },
  mounted() {
    this.$refs.passwordInput.focus();
  },
  created() {
    this.modalHash = '46cde8e146cbc10b39e76258c97db6177a8f8f235f6ca234e0bd7c2aa2f88096';
    this.appVersion = `- v${remote.app.getVersion()}`;
  },
};
</script>

<style lang="scss">
.settings-tabs {
  nav.tabs {
    display: none;
  }
  .tab-content {
    padding: 0;
  }
}
</style>
