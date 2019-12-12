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
        </figure>
        <div class="media-content info">
          <h1 class="subtitle has-text-white is-1">
            {{ title }} ({{ item.movie.details.year }})
          </h1>

          <div style="display: flex; align-items: center;">
            <span v-if="item.movie.details.director">Найруулагч: {{ item.movie.details.director }}</span>
            <b-taglist style="display: inline-block; margin-left: 12px;">
              <b-tag v-if="omdbInfo.runtime">{{ omdbInfo.runtime }}</b-tag>
              <b-tag v-if="omdbInfo.pg">{{ omdbInfo.pg }}</b-tag>
            </b-taglist>
          </div>

          <p style="margin: 10px 0 20px;">
            {{ item.movie.details.description }}
          </p>

          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <span>Хэл: </span>
              </div>
              <div class="level-item">
                <b-select rounded v-model="selectedVariant">
                  <option
                    v-for="(variant, index) in item.variants"
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
                <b-select rounded v-model="selectedVariantResource">
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
            <b-button
              size="is-medium" type="is-primary"
              icon-left="play" v-show="promo" @click="playTrailer"
              :loading="trailerPlaying">Trailer</b-button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
import BaseDetails from '@/components/BaseDetails.vue';

export default {
  name: 'VOD',
  extends: BaseDetails,
  props: ['id'],

  computed: {
    promo() {
      if (this.item.variants.length > 0) {
        const variantWithPromo = this.item.variants.filter(v => v.promo !== null);
        if (variantWithPromo.length > 0) {
          if (variantWithPromo[0].promo.mediaResources.length > 0) {
            return variantWithPromo[0].promo.mediaResources[0].src;
          }
        }
      }

      return null;
    },
    title() {
      return this.item.movie.title;
    },
    mediaTitle() {
      return this.item.movie.title;
    },
    year() {
      return this.item.movie.details.year;
    },
  },
  watch: {
    selectedVariant(variant) {
      [this.selectedVariantResource] = variant.mediaResources;
    },
  },
  created() {
    const item = this.$store.state.movies[this.id];
    if (item) {
      this.item = item;
      [this.selectedVariant] = this.item.variants;
      this.fetchMovieDB(this.title, this.year);
      this.fetchOMDB(this.title, this.year);
    } else {
      this.back();
    }
  },
};
</script>
