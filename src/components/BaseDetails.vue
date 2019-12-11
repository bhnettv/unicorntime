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
      omdbInfo: {
        imdbRating: null,
        metaRating: null,
        rtRating: null,
        runtime: null,
        pg: null,
      },
      omdbInfoFetching: false,
      playing: false,
      trailerPlaying: false,
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
    async play() {
      if (this.selectedVariant && this.selectedVariantResource) {
        this.playing = true;
        const player = await this.$player(this.mediaTitle, this.selectedVariantResource.src);
        if (player) {
          player.on('exit', () => {
            this.playing = false;
          });
        }
      } else {
        this.playing = false;
      }
    },
    async playTrailer() {
      if (this.promo) {
        this.trailerPlaying = true;
        const player = await this.$player(`${this.mediaTitle} TRAILER`, this.promo);
        if (player) {
          player.on('exit', () => {
            this.trailerPlaying = false;
          });
        }
      } else {
        this.trailerPlaying = false;
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
    async fetchOMDB(name, year) {
      this.omdbInfoFetching = true;
      const url = `http://omdbapi.com/?apikey=722079ef&t=${name}&y=${year}`;
      const response = await this.axios.get(url);

      if (response.data.Response === 'True') {
        if ('Ratings' in response.data) {
          response.data.Ratings.forEach((rating) => {
            if (rating.Source === 'Internet Movie Database') {
              this.omdbInfo.imdbRating = rating.Value;
            }

            if (rating.Source === 'Rotten Tomatoes') {
              this.omdbInfo.rtRating = rating.Value;
            }

            if (rating.Source === 'Metacritic') {
              this.omdbInfo.metaRating = rating.Value;
            }
          });
        }
        if ('Rated' in response.data) {
          this.omdbInfo.pg = response.data.Rated;
        }
        if ('Runtime' in response.data) {
          this.omdbInfo.runtime = response.data.Runtime;
        }
      }

      this.omdbInfoFetching = false;
    },
  },
};
</script>
