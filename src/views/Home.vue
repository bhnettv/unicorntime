<template>
  <section>
    <sidebar-menu
      :menu="categoryCatalogueWithSearch"
      :showChild="false"
      :collapsed="false"
      :showOneChild="true"
      :hideToggle="true"
      :disableHover="true"
      width="380px">
      <font-awesome-icon icon="caret-right" slot="dropdown-icon" />
    </sidebar-menu>
    <div class="right-side">
      <router-view />
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'home',
  computed: mapState({
    categoryCatalogueWithSearch(state) {
      return [
        {
          id: 'search',
          href: '/search',
          title: 'Search',
          icon: {
            element: 'font-awesome-icon',
            attributes: {
              icon: 'search',
            },
          },
        },
        {
          id: 'channels',
          href: '/channels',
          title: 'LIVE TV',
          icon: {
            element: 'font-awesome-icon',
            attributes: {
              icon: 'tv',
            },
          },
        },
        {
          header: true,
          title: 'Categories',
        },
        ...state.categoryCatalogue,
      ];
    },
  }),
};
</script>

<style lang="scss">
.v-sidebar-menu {
  z-index: auto;

  .vsm--link {
    text-align: left;
    text-transform: uppercase;
    padding-left: 30px;
  }

  .vsm--link_exact-active .vsm--title {
    font-weight: 500;
  }

  .vsm--link_level-1.vsm--link_exact-active .vsm--icon,
  .vsm--link_level-1 .vsm--icon {
    background-color: transparent;
    width: 23px;
  }
}

.right-side {
  margin-left: 380px;
}
</style>
