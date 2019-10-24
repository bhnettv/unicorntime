<!-- eslint-disable -->
<template>
  <div class="vod">
    <div class="background"
      :style="{backgroundImage: background, animationPlayState: backgroundFade}"></div>
    <div class="content">
      <div class="col">
        <button class="button fab back-button" @click="back">
          <font-awesome-icon icon="arrow-left" />
        </button>
        <div class="poster-container">
          <img :src="imageUrl">
          <span class="rating" v-show="movieDBInfo.rating > 0">
            <font-awesome-icon icon="star" size="1x" color="#F9DF06"/>
            <p>{{ movieDBInfo.rating }}/10</p>
          </span>
        </div>
        <div class="info">
          <h1>{{ item.movie.name }} ({{ item.movie.year }})</h1>

          <p v-if="isSingleEpisodeItem && selectedEpisode">
            {{ selectedEpisode.details.description }}
          </p>

          <portal
            to="episodePortal"
            :disabled="isSingleEpisodeItem">
            <breeding-rhombus-spinner
              :animation-duration="1000"
              :size="30"
              :color="'#ff1d5e'"
              style="margin-top: 10px; margin-left: 10px;"
              v-show="episodesFetching || selectedEpisodeMediaFetching"
            />

            <template v-if="selectedEpisodeMedia">
              <div class="options">
                <span>Хэл: </span>
                <v-select
                  :getOptionLabel="opt => opt.audios[0]"
                  :options="selectedEpisodeMedia"
                  v-model="selectedVariant"
                  :clearable="false"
                  @input="variantSelected"></v-select>

                <span>Source: </span>
                <v-select
                  class="source-select"
                  v-if="selectedVariant"
                  :getOptionLabel="opt => opt.src.substring(0, 65) + (opt.src.length > 65 ? '...' : '')"
                  :options="selectedVariant.mediaResources"
                  v-model="selectedVariantResource"
                  :clearable="false"></v-select>
              </div>
              <button class="button primary watch-button" @click="play">Watch</button>
            </template>
          </portal>
        </div>
      </div>
      <div class="col episodes-container" v-if="!isSingleEpisodeItem">
        <div>
          <h1>Episodes</h1>

          <ul class="episodes">
            <li
              v-bind:key="episode.id"
              v-for="episode in episodes"
              @click="episodeSelected(episode)"
              :class="{ active: selectedEpisode === episode }">
              {{ episode.title }}
            </li>
          </ul>
        </div>
        <div v-if="selectedEpisode">
          <h1>Episode Info</h1>

          <portal-target name="episodePortal">
          </portal-target>

          <h2>{{ selectedEpisode.title }}</h2>
          <p>{{ selectedEpisode.details.description }} </p>
        </div>
      </div>
    </div>
  </div>
</template>
<!--eslint-enable-->
<script>
import client from 'api-client';
import { BreedingRhombusSpinner } from 'epic-spinners';
import BaseDetails from './BaseDetails.vue';

export default {
  name: 'svod-details',
  extends: BaseDetails,
  props: ['id'],
  components: { BreedingRhombusSpinner },
  data() {
    return {
      isSingleEpisodeItem: true,
      episodes: [],
      episodesFetching: true,
      selectedEpisode: null,
      selectedEpisodeMedia: null,
      selectedEpisodeMediaFetching: true,
    };
  },
  methods: {
    episodeSelected(episode) {
      if (this.selectedEpisode !== episode) {
        console.log('selected', episode);
        this.selectedEpisode = episode;
        this.selectedEpisodeMediaFetching = true;
        this.selectedEpisodeMedia = null;
        this.selectedVariant = null;
        this.selectedVariantResource = null;
      }
    },
    async fetchEpisodes() {
      const contentInfoIds = this.item.movie.contentInfoIds.split(',');
      const episodes = await client.fetchSvodItemEpisodes(contentInfoIds);
      this.isSingleEpisodeItem = contentInfoIds.length === 1;
      this.episodes = episodes;
      this.episodesFetching = false;
      console.log('fetched episodes', this.episodes);
      this.episodeSelected(this.episodes[0]);
    },
  },
  watch: {
    async selectedEpisode(episode) {
      this.selectedEpisodeMedia = await client.fetchMedia([episode.id]);
      this.selectedEpisodeMediaFetching = false;
      [this.selectedVariant] = this.selectedEpisodeMedia;
      [this.selectedVariantResource] = this.selectedVariant.mediaResources;
    },
  },
  created() {
    const item = this.$store.state.movies[this.id];
    if (item) {
      this.item = item;
      this.fetchMovieDB(this.item.movie.name, this.item.movie.year);
      this.fetchEpisodes();
    } else {
      this.back();
    }
  },
};
</script>

<style lang="scss">
.col.episodes-container {
  height: 400px;
  margin-top: 30px;

  > div {
    flex: 1;

    &:first-child {
      flex: 0 0 420px;
      padding-right: 20px;
    }
  }
}

.episodes {
  max-height: 300px;
  overflow-y: scroll;
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    background: rgba(0, 0, 0, 0.5);
    padding: 10px;
    cursor: pointer;
    color: #d3d3d3;
    border-bottom: 1px solid rgba(143, 143, 143, 0.5);

    &:hover {
      background: rgba(143, 143, 143, 0.1);
    }

    &.active {
      color: #ffffff;
      background: rgb(40, 175, 47);
    }
  }
}
</style>
