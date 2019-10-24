<template>
  <div class="vod">
    <div class="col">
      <button class="button fab back-button" @click="back">
        <font-awesome-icon icon="arrow-left" />
      </button>
      <div>
        <img :src="imageUrl">
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
            :getOptionLabel="opt => opt.src"
            :options="selectedVariant.mediaResources"
            :clearable="false"
            v-model="selectedVariantResource"></v-select>
        </div>

        <button class="button primary watch-button" @click="play">Watch</button>
      </div>
    </div>
  </div>
</template>

<script>
import client from 'api-client';

export default {
  name: 'vod-details',
  props: ['id'],
  data() {
    return {
      item: {},
      selectedVariant: null,
      selectedVariantResource: null,
    };
  },
  computed: {
    imageUrl() {
      return client.translateUrl(this.item.movie.poster);
    },
  },
  methods: {
    variantSelected(value) {
      [this.selectedVariantResource] = value.mediaResources;
    },
    watch() {
      if (this.selectedVariant && this.selectedVariantResource) {
        this.$player(this.selectedVariantResource.src);
      }
    },
    back() {
      this.$router.go(-1);
    },
  },
  created() {
    const item = this.$store.state.movies[this.id];
    if (item) {
      this.item = item;
      [this.selectedVariant] = this.item.variants;
      [this.selectedVariantResource] = this.item.variants[0].mediaResources;
    } else {
      this.$router.go(-1);
    }
  },
};
</script>
