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
          <h1>{{ item.movie.title }} ({{ item.movie.details.year }})</h1>

          <p v-show="item.movie.details.director">Найруулагч: {{ item.movie.details.director }}</p>

          <p>{{ item.movie.details.description }}</p>

          <div class="options">
            <span>Хэл: </span>
            <v-select
              :getOptionLabel="opt => opt.audios[0]"
              :options="item.variants"
              v-model="selectedVariant"
              :clearable="false"
              @input="variantSelected"></v-select>

            <span>Source: </span>
            <v-select
              class="source-select"
              :getOptionLabel="opt => opt.src.substring(0, 65) + (opt.src.length > 65 ? '...' : '')"
              :options="selectedVariant.mediaResources"
              :clearable="false"
              v-model="selectedVariantResource"></v-select>
          </div>

          <button class="button primary watch-button" @click="play">Watch</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseDetails from './BaseDetails.vue';

export default {
  name: 'vod-details',
  extends: BaseDetails,
  props: ['id'],
  created() {
    const item = this.$store.state.movies[this.id];
    if (item) {
      this.item = item;
      [this.selectedVariant] = this.item.variants;
      [this.selectedVariantResource] = this.item.variants[0].mediaResources;
      this.fetchMovieDB(this.item.movie.title, this.item.movie.details.year);
    } else {
      this.back();
    }
  },
};
</script>
