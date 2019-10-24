import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import GridList from '../components/GridList.vue';
import VodDetails from '../components/VodDetails.vue';
import SVodDetails from '../components/SVodDetails.vue';

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
    component: VodDetails,
  },
  {
    path: '/svod/:id',
    name: 'svod',
    props: true,
    component: SVodDetails,
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
