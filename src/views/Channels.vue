<template>
  <div class="grid-page">
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <h3 class="subtitle has-text-white is-3">LIVE CHANNELS</h3>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <b-input placeholder="Filter..."
            type="search"
            icon="search"
            ref="searchInput"
            v-model="searchText">
          </b-input>
        </div>
      </div>
    </div>
    <div class="channel-container">
      <div
        v-bind:key="item.id"
        v-for="item in lazyItems"
        :item="item"
        @click="onItemClick(item)"
        class="channel-item">
        <p class="is-size-5">· {{ item.number }}</p>
        <img :src="item.icon ? item.icon : item.poster" />
        <p class="is-size-5">{{ item.name }}</p>
        <b-icon
          pack="fas"
          icon="sync-alt"
          style="margin-left: auto;"
          custom-class="fa-spin"
          v-show="item.playing">
        </b-icon>
      </div>
    </div>

    <infinite-loading
      @infinite="infiniteHandler"
      ref="infiniteLoading">
      <breeding-rhombus-spinner
        :animation-duration="1000"
        :size="30"
        :color="'#ff1d5e'"
        style="margin-top: 10px; margin-left: 10px;"
        slot="spinner"
      />
    </infinite-loading>
  </div>
</template>

<script>
import Vue from 'vue';
import client from 'api-client';
import InfiniteLoading from 'vue-infinite-loading';
import { BreedingRhombusSpinner } from 'epic-spinners';

export default {
  name: 'Channels',
  components: { BreedingRhombusSpinner, InfiniteLoading },
  data() {
    return {
      items: [],
      lazyItems: [],
      page: 1,
      perPage: 30,
      initialDataFetched: false,
      searchText: '',
    };
  },
  watch: {
    searchText(newVal) {
      // disable infinite loader when searching
      this.$refs.infiniteLoading.stateChanger.complete();
      this.page = 1;
      this.lazyItems = [];

      if (newVal.length === 0) {
        // reenable it
        this.$refs.infiniteLoading.stateChanger.reset();
      } else {
        this.lazyItems = this.items.filter((item) => {
          if (item.number && item.number.toString().toLowerCase().includes(this.searchText.toLowerCase())) {
            return true;
          }
          if (item.name && item.name.toString().toLowerCase().includes(this.searchText.toLowerCase())) {
            return true;
          }
          return false;
        });
      }
    },
  },
  methods: {
    infiniteHandler($state) {
      if (!this.initialDataFetched) {
        return;
      }

      if (this.items.length === 0) {
        $state.complete();
        return;
      }

      const nextSetOfItems = this.items.slice((this.page - 1) * this.perPage, (this.page - 1) * this.perPage + this.perPage);
      if (nextSetOfItems.length) {
        this.page += 1;
        this.lazyItems.push(...nextSetOfItems);
        $state.loaded();
      } else {
        $state.complete();
      }
    },
    async onItemClick(item) {
      if (item.streams.length > 0) {
        let streamSrc = item.streams[0].src.replace('igmp://', '');
        streamSrc = `http://192.168.150.150:4022/udp/${streamSrc}`;
        Vue.set(item, 'playing', true);
        try {
          const player = await this.$player(`${item.name} LIVE`, streamSrc);
          player.on('exit', () => {
            item.playing = false;
          });
        } catch (err) {
          console.log(err);
        }
      }
    },
  },
  mounted() {
    this.$refs.searchInput.focus();
  },
  async created() {
    const channels = await client.getLiveChannels();
    this.items = channels;
    this.initialDataFetched = true;

    if (this.$refs.infiniteLoading) {
      this.$refs.infiniteLoading.attemptLoad();
    }
  },
};
</script>

<style lang="scss">
.channel-container {
  display: flex;
  flex-direction: column;

  .channel-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 30px;
    background-color: rgba(255,255,255,.1);
    height: 50px;
    margin-bottom: 10px;;
    color: #fefefe;
    border-radius: 50px;
    transition: background-color .2s;

    img {
      max-height: 50px;
      margin-left: 24px;
      margin-right: 16px;
    }

    &:hover {
      background-color: rgba(255,255,255,.25);
    }
  }
}
</style>
