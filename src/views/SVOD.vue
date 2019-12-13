<!-- eslint-disable -->
<template>
  <section class="vod">
    <div class="vod-bg"
      :style="{backgroundImage: background, animationPlayState: backgroundFade}"></div>
    <div class="vod-content">
      <button class="uni-button back-button" @click="back">
        <font-awesome-icon icon="arrow-left" />
      </button>
      <article class="media">
        <figure class="media-left poster-container">
          <img class="uni-poster" :src="imageUrl">
          <template v-if="isSingleEpisodeItem">
            <b-icon
              pack="fas"
              icon="sync-alt"
              custom-class="fa-spin"
              v-if="omdbInfoFetching">
            </b-icon>
            <div class="omdb-ratings" v-else>
              <span class="rating" v-show="omdbInfo.imdbRating">
                <font-awesome-icon :icon="['fab', 'imdb']" color="#F9DF06" style="font-size: 22px;" class="provider"/>
                <p>{{ omdbInfo.imdbRating }}</p>
              </span>
              <span class="rating" v-show="omdbInfo.rtRating">
                <p>🍅 {{ omdbInfo.rtRating }}</p>
              </span>
              <span class="rating" v-show="omdbInfo.metaRating">
                <img src="@/assets/meta.png" width="22" class="provider" />
                <p>{{ omdbInfo.metaRating }}</p>
              </span>
            </div>
          </template>
        </figure>
        <div class="media-content info">
          <h1 class="subtitle has-text-white is-1">
            {{ title }} ({{ item.movie.year }})
          </h1>

          <div style="display: flex; align-items: center;" v-if="isSingleEpisodeItem && selectedEpisode">
            <span v-if="selectedEpisode.details.director">Найруулагч: {{ selectedEpisode.details.director }}</span>
            <b-taglist style="display: inline-block; margin-left: 12px;">
              <b-tag v-if="omdbInfo.runtime">{{ omdbInfo.runtime }}</b-tag>
              <b-tag v-if="omdbInfo.pg">{{ omdbInfo.pg }}</b-tag>
            </b-taglist>
          </div>

          <p v-if="isSingleEpisodeItem && selectedEpisode" style="margin: 10px 0 20px;">
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
              <nav class="level">
                <div class="level-left">
                  <div class="level-item">
                    <span>Хэл: </span>
                  </div>
                  <div class="level-item">
                    <b-select rounded v-model="selectedVariant">
                      <option
                        v-for="(variant, index) in selectedEpisodeMedia"
                        :key="`variant-${index}`"
                        :value="variant">
                        {{ variant.audios[0] }}
                      </option>
                    </b-select>
                  </div>
                  <div class="level-item">
                    <span>Source: </span>
                  </div>
                  <div class="level-item">
                    <b-select rounded v-if="selectedVariant" v-model="selectedVariantResource">
                      <option
                        v-for="resource in selectedVariant.mediaResources"
                        :key="resource.src"
                        :value="resource">
                        {{ resource.src.substr(0, 65) + (resource.src.length > 65 ? '...' : '') }}
                      </option>
                    </b-select>
                  </div>
                </div>
              </nav>

              <div class="buttons">
                <b-button size="is-medium" type="is-link"
                  icon-left="play"
                  v-show="canResume"
                  @click="play(true)" :loading="playing">Resume {{ secondsToHHMM(resumePosition) }}</b-button>
                <b-button size="is-medium" type="is-link" icon-left="play" @click="play()" :loading="playing">Watch</b-button>
                <b-button size="is-medium" type="is-primary"
                  icon-left="play"
                  v-show="isSingleEpisodeItem && promo"
                  @click="playTrailer" :loading="trailerPlaying">Trailer</b-button>
              </div>
            </template>
          </portal>
        </div>
      </article>

      <div class="is-flex episodes-container" v-if="!isSingleEpisodeItem">
        <div>
          <h3 class="subtitle is-3 has-text-white">Episodes</h3>

          <ul class="episodes">
            <li
              v-bind:key="episode.id"
              v-for="episode in episodes"
              @click="episodeSelected(episode)"
              :class="{ active: selectedEpisode === episode }">
              <b-icon
                pack="fas"
                icon="check-circle"
                style="font-size: 12px; vertical-align: middle; margin-right: 6px;"
                v-show="checkWatched(episode.id)">
              </b-icon>
              {{ episode.title }}
            </li>
          </ul>
        </div>
        <div v-if="selectedEpisode">
          <h3 class="subtitle is-3 has-text-white">Episode Info</h3>

          <portal-target name="episodePortal">
          </portal-target>

          <h4 class="title is-4 has-text-white" style="margin-top: 30px;">{{ selectedEpisode.title }}</h4>
          <p class="subtitle is-6 has-text-white">{{ selectedEpisode.details.description }} </p>
        </div>
      </div>
    </div>
  </section>
</template>
<!--eslint-enable-->
<script>
import client from 'api-client';
import { BreedingRhombusSpinner } from 'epic-spinners';
import BaseDetails from '@/components/BaseDetails.vue';

export default {
  name: 'SVOD',
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

  computed: {
    promo() {
      if (this.isSingleEpisodeItem && this.selectedEpisodeMedia && this.selectedEpisodeMedia.length > 0) {
        const mediaWithPromo = this.selectedEpisodeMedia.filter(v => v.promo !== null);
        if (mediaWithPromo.length > 0) {
          if (mediaWithPromo[0].promo.mediaResources.length > 0) {
            return mediaWithPromo[0].promo.mediaResources[0].src;
          }
        }
      }
      return null;
    },
    title() {
      return this.item.movie.name;
    },
    mediaTitle() {
      return this.selectedEpisode ? this.selectedEpisode.title : this.title;
    },
    year() {
      return this.item.movie.year;
    },
  },

  methods: {
    episodeSelected(episode) {
      if (this.selectedEpisode !== episode) {
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
      this.episodeSelected(this.episodes[0]);
    },
  },
  watch: {
    async selectedEpisode(episode) {
      this.selectedEpisodeMedia = await client.fetchMedia(episode.id);
      this.selectedEpisodeMediaFetching = false;
      [this.selectedVariant] = this.selectedEpisodeMedia;
    },
    selectedVariant(variant) {
      if (variant) {
        [this.selectedVariantResource] = variant.mediaResources;
      }
    },
  },
  created() {
    const item = this.$store.state.movies[this.id];
    if (item) {
      this.item = item;
      this.fetchMovieDB(this.title, this.year);
      this.fetchOMDB(this.title, this.year);
      this.fetchEpisodes();
    } else {
      this.back();
    }
  },
};
</script>

<style lang="scss">
.episodes-container {
  height: 400px;
  margin-top: 40px;

  > div {
    flex: 1;

    &:first-child {
      flex: 0 0 420px;
      padding-right: 20px;
      margin-right: 20px;
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
