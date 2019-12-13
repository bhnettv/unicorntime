<template>
  <div class="grid-item">
    <div class="img-container">
      <img :src="imageUrl" />
    </div>

    <div class="overlay">
      <h4>{{ title }}</h4>
      <span>{{ year }}</span>
    </div>
  </div>
</template>

<script>
import client from 'api-client';

export default {
  name: 'GridItem',
  props: ['item'],
  computed: {
    imageUrl() {
      return client.translateUrl(this.item.movie.poster);
    },
    title() {
      if (this.item.type === 'vod') {
        return this.item.movie.title;
      }
      if (this.item.type === 'svod') {
        return this.item.movie.name;
      }
      return 'UNKNOWN';
    },
    year() {
      if (this.item.type === 'vod') {
        return this.item.movie.details.year;
      }
      if (this.item.type === 'svod') {
        return this.item.movie.year;
      }
      return 'UNKNOWN';
    },
  },
};
</script>

<style lang="scss">
.grid-item {
  position: relative;
  width: 175px;
  height: 259px;
  display: inline-block;
  cursor: pointer;
  text-align: center;
  border-radius: 16px;

  .img-container {
    width: 175px;
    height: 259px;
    overflow: hidden;
    border-radius: 16px;

    img {
      width: 175px;
      height: 259px;
      transition: transform .3s;
      transform: scale(1.04);
    }
  }

  .overlay {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.65);
    border-radius: 16px;
    opacity: 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #ffffff;
    padding: 8px;

    transition: opacity .3s;

    h4 {
      font-size: 18px;
      font-weight: 500;
      margin: 8px 0;
    }
  }

  &:hover {
    img {
      transform: scale(1.16);
    }
    .overlay {
      box-shadow: 0 0 35px 8px #4dafff;
      opacity: 1;
    }
  }

  &.inverted {
    .overlay {
      opacity: 1;
    }
  }
}
</style>
