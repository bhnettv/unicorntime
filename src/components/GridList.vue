<template>
  <div class="grid-page">
    <h2 class="category-title">{{ category.title }}</h2>
    <transition-group
      name="staggered-fade"
      tag="div"
      class="grid-container"
      v-bind:css="false"
      v-on:before-enter="beforeEnter"
      v-on:enter="enter">
      <grid-item
        v-bind:key="item.id"
        v-bind:data-index="index"
        v-for="(item, index) in lazyItems"
        :item="item"
        @click.native="onItemClick(item)" />
    </transition-group>

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
import client from 'api-client';
import InfiniteLoading from 'vue-infinite-loading';
import { BreedingRhombusSpinner } from 'epic-spinners';
import Velocity from 'velocity-animate';
import { mapState } from 'vuex';
import GridItem from '@/components/GridItem.vue';

export default {
  name: 'GridList',
  props: ['id'],
  components: { GridItem, InfiniteLoading, BreedingRhombusSpinner },
  data() {
    return {
      items: [],
      lazyItems: [],
      page: 1,
      category: {},
    };
  },
  computed: mapState([
    'moviesFetched',
  ]),
  methods: {
    beforeEnter: (el) => {
      el.style.opacity = 0;
    },
    enter: (el, done) => {
      const delay = el.dataset.index * 50;
      setTimeout(() => {
        Velocity(
          el,
          { opacity: 1 },
          { complete: done },
        );
      }, delay);
    },
    onItemClick(item) {
      if (item.type === 'vod' || item.type === 'svod') {
        // this.$store.commit('addMovieWithVariants', item);
        this.$router.push({
          name: item.type,
          params: {
            id: item.id,
          },
        });
      }
    },
    infiniteHandler($state) {
      if (this.items.length === 0) {
        return;
      }

      const nextSetOfItems = this.items.slice((this.page - 1) * 50, (this.page - 1) * 50 + 50);
      if (nextSetOfItems.length) {
        this.page += 1;
        this.lazyItems.push(...nextSetOfItems);
        $state.loaded();
      } else {
        $state.complete();
      }
    },
    getMovieByMediaId(mediaId) {
      for (let i = 0; i < this.movieItems.length; i += 1) {
        const element = this.movieItems[i];
        if (element.items.map(ele => ele.id).includes(mediaId)) {
          return {
            element,
            i,
          };
        }
      }
      return {
        element: {},
        i: -1,
      };
    },
    async fetchMedias() {
      let itemMediaIds = this.movieItems.map(item => item.items.map(ele => ele.id));
      itemMediaIds = itemMediaIds.flat();

      const medias = await client.fetchMedias(itemMediaIds);

      const variantsContentInfoIdMap = {};
      medias.forEach((item) => {
        if (!(item.contentInfoId in variantsContentInfoIdMap)) {
          const movie = this.getMovieByMediaId(item.id);
          variantsContentInfoIdMap[item.contentInfoId] = {
            id: item.contentInfoId,
            movie: movie.element,
            variants: [],
            type: 'vod',
            order: movie.i,
          };
        }
        variantsContentInfoIdMap[item.contentInfoId].variants.push(item);
      });
      this.$store.dispatch('ADD_MOVIES', variantsContentInfoIdMap);

      const variantsArray = Object.values(variantsContentInfoIdMap);
      // restore the original order
      variantsArray.sort((a, b) => a.order - b.order);
      this.items = variantsArray;
      if (this.$refs.infiniteLoading) {
        this.$refs.infiniteLoading.attemptLoad();
      }
    },
    async fetchSVodList() {
      const svodList = await client.fetchSvodList(this.category.id);

      const svodMap = Object.assign({}, ...svodList.map(item => ({ [item.id]: { id: item.id, movie: item, type: 'svod' } })));
      this.$store.dispatch('ADD_MOVIES', svodMap);

      this.items = Object.values(svodMap);

      if (this.$refs.infiniteLoading) {
        this.$refs.infiniteLoading.attemptLoad();
      }
    },
    initializeData() {
      this.items = [];
      this.lazyItems = [];
      this.page = 1;
      if (this.$refs.infiniteLoading) {
        this.$refs.infiniteLoading.stateChanger.reset();
      }

      this.category = this.$store.getters.getCategory(this.id);

      if (this.category.type === 'SVOD') {
        this.fetchSVodList();
      } else {
        const items = [];
        this.category.purchaseGroupsIds.forEach((element) => {
          const storeMovie = this.$store.state.movieCatalogue[element];
          if (storeMovie) {
            items.push(storeMovie);
          }
        });

        this.movieItems = items;
        this.fetchMedias();
      }
    },
    initialize() {
      if (this.$store.state.movieCatalogueFetched) {
        this.initializeData();
      } else {
        this.unwatch = this.$store.watch(
          state => state.movieCatalogueFetched,
          (value) => {
            if (value === true) {
              this.initializeData();
              this.unwatch();
            }
          },
        );
      }
    },
  },
  created() {
    this.initialize();
  },
  watch: {
    $route(to, from) {
      if (to.name === from.name) {
        this.initialize();
      }
    },
  },
};
</script>

<style lang="scss">
.grid-page {
  margin: 15px 30px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, 175px);
  grid-gap: 1rem;
  justify-content: space-between;
}

.category-title {
  font-family: FiraSans;
  font-weight: 400;
  font-size: 30px;
  text-align: left;
  color: #ffffff;
}
</style>
