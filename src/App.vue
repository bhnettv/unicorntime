<template>
  <div id="app">
    <keep-alive include="home">
      <router-view />
    </keep-alive>

    <b-loading :active.sync="isLoaderActive" class="uni-home-loader">
      <breeding-rhombus-spinner
        :animation-duration="1000"
        :size="40"
        :color="'#ff1d5e'"
        style="margin: 0;"
      />
    </b-loading>

    <button class="uni-button settings-button"
      @click="isSettingsModalActive = true">
      <font-awesome-icon icon="cog" />
    </button>

    <b-modal
      :active.sync="isSettingsModalActive"
      trap-focus
      aria-role="dialog"
      aria-modal
      custom-class="uni-settings-modal">
      <settings></settings>
    </b-modal>

    <transition name="fade" mode="out-in">
      <div
        class="update-notification notification"
        :class="`is-${updateNotificationType}`"
        v-show="updateNotificationVisible">
        <span class="has-text-weight-bold">{{ updateNotificationMessage }}</span>
        <b-icon
          pack="fas"
          icon="sync-alt"
          custom-class="fa-spin"
          v-show="updateNotificationStatus === 0">
        </b-icon>
      </div>
    </transition>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { BreedingRhombusSpinner } from 'epic-spinners';
import Settings from '@/components/Settings.vue';

export default {
  components: {
    BreedingRhombusSpinner,
    Settings,
  },
  data() {
    return {
      isLoaderActive: true,
      isSettingsModalActive: false,
      updateNotificationVisible: false,
      updateNotificationMessage: '',
      updateNotificationType: 'warning',
      updateNotificationStatus: 0,
    };
  },
  computed: {
    initialDataLoaded() {
      // eslint-disable-next-line no-sequences
      return [this.$store.state.movieCatalogueFetched, this.$store.state.categoryCatalogueFetched];
    },
  },
  watch: {
    initialDataLoaded(data) {
      if (data[0] === true && data[1] === true) {
        this.isLoaderActive = false;
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

    ipcRenderer.on('update', (event, message, status) => {
      this.updateNotificationVisible = true;
      this.updateNotificationMessage = message;
      this.updateNotificationStatus = status;

      let type = 'warning';
      if (status === 1) {
        type = 'success';
      } else if (status === 2) {
        type = 'danger';
      }

      this.updateNotificationType = type;

      if (status !== 0) {
        setTimeout(() => {
          this.updateNotificationVisible = false;
        }, 15000);
      }
    });
  },
};
</script>

<style lang="scss">
.uni-home-loader .loading-background {
  background: #000000;
}

.uni-settings-modal {
  z-index: 1000;
}

.settings-button {
  position: fixed;
  right: 10px;
  bottom: 20px;
  z-index: 10000;
}

.update-notification {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 360px;
  margin: 10px;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
}
</style>
