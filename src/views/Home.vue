<template>
  <main>
    <sidebar-menu
      :menu="categoryCatalogue"
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
  </main>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'home',
  computed: mapState([
    'categoryCatalogue',
  ]),
};
</script>

<style lang="scss">
.v-sidebar-menu .vsm--link {
  text-align: left;
  text-transform: uppercase;
  padding-left: 30px;
}

.vsm--link_exact-active .vsm--title {
  font-weight: 500;
}

.right-side {
  margin-left: 380px;
}
</style>
