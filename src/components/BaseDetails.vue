<script>
import client from 'api-client';

export default {
  data() {
    return {
      item: {},
      selectedVariant: null,
      selectedVariantResource: null,
      movieDBInfo: {
        rating: '',
        background: '',
      },
    };
  },
  computed: {
    imageUrl() {
      return client.translateUrl(this.item.movie.poster);
    },
    background() {
      const gradient = 'linear-gradient(45deg, #537b46, #509dde)';
      return this.movieDBInfo.background === '' ? '' : `${gradient}, ${this.movieDBInfo.background}`;
    },
    backgroundFade() {
      return this.movieDBInfo.background === '' ? 'paused' : 'running';
    },
  },
  methods: {
    play() {
      if (this.selectedVariant && this.selectedVariantResource) {
        this.$player(this.selectedVariantResource.src);
      }
    },
    back() {
      this.$router.go(-1);
    },
    variantSelected(value) {
      [this.selectedVariantResource] = value.mediaResources;
    },
    async fetchMovieDB(name, year) {
      let url = 'https://api.themoviedb.org/3/search/movie?api_key=d2a129234a7199d7e4edea0023bb7c0d&language=en-US&query=';
      url += `${name}&page=1&include_adult=false&year=${year}`;
      const response = await this.axios.get(url);

      if (response.data.results.length > 0) {
        const [result] = response.data.results;

        this.movieDBInfo.rating = result.vote_average || 0;

        if (result.backdrop_path !== null) {
          const img = new Image();
          const imgSource = `https://image.tmdb.org/t/p/w1280${result.backdrop_path}`;
          img.onload = () => {
            setTimeout(() => {
              this.movieDBInfo.background = `url(${imgSource})`;
            }, 100);
          };
          img.src = imgSource;
        }
      }
    },
  },
};
</script>
