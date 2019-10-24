<script>
import client from 'api-client';

export default {
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
  },
};
</script>
