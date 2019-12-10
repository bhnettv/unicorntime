import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import VOD from '../views/VOD.vue';
import SVOD from '../views/SVOD.vue';
import GridList from '../components/GridList.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    children: [
      {
        path: 'list/:id?',
        name: 'list',
        props: true,
        component: GridList,
      },
    ],
  },
  {
    path: '/vod/:id',
    name: 'vod',
    props: true,
    component: VOD,
  },
  {
    path: '/svod/:id',
    name: 'svod',
    props: true,
    component: SVOD,
  },
  {
    path: '*',
    redirect: '/',
  },
];

const router = new VueRouter({
  routes,
});

export default router;
