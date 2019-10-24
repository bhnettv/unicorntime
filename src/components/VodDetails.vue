<template>
  <div class="vod">
    <div class="col" style="position: relative;">
      <button class="back-button" @click="back">
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

        <button class="watch-button" @click="watch">Watch</button>
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

<style lang="scss">
.vod {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 250px;
  color: #ffffff;

  .col {
    display: flex;
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
  }

  .info {
    margin-left: 30px;

    h1 {
      font-size: 60px;
      font-weight: 300;
      margin: 0;
      padding: 0;
    }
  }

  .options {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    > span {
      margin-right: 8px;
    }
  }

  .v-select {
    display: inline-block;
    padding-right: 30px;

    &.source-select {
      flex: 1;
      padding-right: 0;
    }

    .vs__dropdown-toggle {
      border: 1px solid #9b9b9b;
    }

    .vs__selected {
      color: #ffffff;
    }

    .vs__clear, .vs__open-indicator {
      fill: #9b9b9b;
    }
  }

  .watch-button {
    background: #3D94F6;
    background-image: -webkit-linear-gradient(top, #3D94F6, #1E62D0);
    background-image: -moz-linear-gradient(top, #3D94F6, #1E62D0);
    background-image: -ms-linear-gradient(top, #3D94F6, #1E62D0);
    background-image: -o-linear-gradient(top, #3D94F6, #1E62D0);
    background-image: linear-gradient(to bottom, #3D94F6, #1E62D0);
    -webkit-border-radius: 0px;
    -moz-border-radius: 0px;
    border-radius: 0px;
    height: 45px;
    line-height: 45px;
    color: #FFFFFF;
    width: 160px;
    font-size: 26px;
    padding: 0px;
    box-shadow: 1px 1px 20px 0px #000000;
    -webkit-box-shadow: 1px 1px 20px 0px #000000;
    -moz-box-shadow: 1px 1px 20px 0px #000000;
    text-shadow: 1px 1px 20px #000000;
    border: solid #337FED 1px;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
  }

  .watch-button:hover {
    background: #1E62D0;
    background-image: -webkit-linear-gradient(top, #1E62D0, #3D94F6);
    background-image: -moz-linear-gradient(top, #1E62D0, #3D94F6);
    background-image: -ms-linear-gradient(top, #1E62D0, #3D94F6);
    background-image: -o-linear-gradient(top, #1E62D0, #3D94F6);
    background-image: linear-gradient(to bottom, #1E62D0, #3D94F6);
    text-decoration: none;
  }

  .back-button {
    outline: none;
    position: absolute;
    left: -120px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #B0B0B0;
    background-image: -webkit-linear-gradient(top, #B0B0B0, #F2F2F2);
    background-image: -moz-linear-gradient(top, #B0B0B0, #F2F2F2);
    background-image: -ms-linear-gradient(top, #B0B0B0, #F2F2F2);
    background-image: -o-linear-gradient(top, #B0B0B0, #F2F2F2);
    background-image: linear-gradient(to bottom, #B0B0B0, #F2F2F2);
    -webkit-border-radius: 100px;
    -moz-border-radius: 100px;
    border-radius: 100px;
    height: 70px;
    line-height: 50px;
    color: rgb(80, 80, 80);
    font-family: Open Sans;
    width: 70px;
    font-size: 30px;
    font-weight: 100;
    box-shadow: 1px 1px 20px 0px #000000;
    -webkit-box-shadow: 1px 1px 20px 0px #000000;
    -moz-box-shadow: 1px 1px 20px 0px #000000;
    text-shadow: 1px 1px 20px #000000;
    border: solid #CFCFCF 1px;
    text-decoration: none;
    cursor: pointer;
  }

  .back-button:hover {
    background: #D03434;
    border-color: #D03434;
    color: #ffffff;
    text-decoration: none;
  }
}
</style>
