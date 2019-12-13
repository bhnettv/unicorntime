<template>
  <div class="grid-page">
    <h3 class="subtitle has-text-white is-3">
      Search
    </h3>
    <b-field grouped>
      <b-input
        placeholder="Search..."
        expanded
        ref="searchInput"
        @keyup.native.enter="search"
        v-model="searchText"></b-input>
      <p class="control">
        <b-button @click="search" :loading="loading">Search</b-button>
      </p>
    </b-field>
    <transition-group
      name="staggered-fade"
      tag="div"
      class="grid-container"
      style="margin-top: 30px"
      v-bind:css="false"
      v-on:before-enter="beforeEnter"
      v-on:enter="enter">
      <grid-item
        v-bind:key="item.id"
        v-bind:data-index="index"
        v-for="(item, index) in items"
        :item="item"
        @click.native="onItemClick(item)"
        class="inverted" />
    </transition-group>
  </div>
</template>

<script>
import client from 'api-client';
import Velocity from 'velocity-animate';
import GridItem from '@/components/GridItem.vue';

export default {
  name: 'Search',
  components: { GridItem },
  data() {
    return {
      items: [],
      searchText: '',
      loading: false,
    };
  },
  methods: {
    beforeEnter: (el) => {
      el.style.opacity = 0;
    },
    enter(el, done) {
      const delay = el.dataset.index * 50;
      setTimeout(() => {
        Velocity(
          el,
          { opacity: 1 },
          { complete: done },
        );
      }, delay);
    },
    async search() {
      if (!this.loading && this.searchText.length >= 2) {
        this.loading = true;
        this.items = [];

        try {
          const searchItems = await client.performSearch(this.searchText);

          this.items = searchItems.map(item => ({
            id: item.contentInfo.id,
            movie: item.contentInfo,
            variants: [],
            type: 'vod',
          }));
        } finally {
          this.loading = false;
        }
      }
    },
    async onItemClick(item) {
      if (!this.$store.state.movies[item.id]) {
        const itemMedia = await client.fetchMedia(item.id);
        item.variants = itemMedia;
        this.$store.dispatch('ADD_MOVIES', {
          [item.id]: item,
        });
      }

      this.$router.push({
        name: 'vod',
        params: {
          id: item.id,
        },
      });
    },
  },
  mounted() {
    this.$refs.searchInput.focus();
  },
};
</script>

<style>

</style>
