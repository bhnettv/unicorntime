/* eslint-disable no-restricted-syntax */
import Vue from 'vue';
import Vuex from 'vuex';
import client from 'api-client';

Vue.use(Vuex);

const createDataTree = (dataset) => {
  const hashTable = Object.create(null);
  dataset.forEach((aData) => {
    hashTable[aData.id] = {
      ...aData,
      href: `/list/${aData.id}`,
    };
  });
  const dataTree = [];
  dataset.forEach((aData) => {
    if (aData.parentId) {
      if (hashTable[aData.parentId]) {
        if (!('child' in hashTable[aData.parentId])) {
          hashTable[aData.parentId].href = '';
          hashTable[aData.parentId].child = [];
        }
        hashTable[aData.parentId].child.push(hashTable[aData.id]);
      }
    } else {
      dataTree.push(hashTable[aData.id]);
    }
  });
  return dataTree;
};

export default new Vuex.Store({
  state: {
    categoryCatalogue: [],
    categoryCatalogueRaw: [],
    categoryCatalogueFetched: false,
    movieCatalogue: {},
    movieCatalogueFetched: false,
    movies: {},
  },
  getters: {
    // eslint-disable-next-line arrow-body-style
    getCategory: state => (id) => {
      return state.categoryCatalogueRaw.find(category => category.id.toString() === id.toString());
    },
  },
  mutations: {
    updateCategoryCatalogueRaw(state, data) {
      state.categoryCatalogueRaw = Object.freeze(data);
    },
    updateCategoryCatalogue(state, data) {
      state.categoryCatalogue = Object.freeze(data);
    },
    updateMovieCatalogue(state, data) {
      state.movieCatalogue = Object.freeze(data);
    },
    updateCategoryCatalogueFetched(state, data) {
      state.categoryCatalogueFetched = data;
    },
    updateMovieCatalogueFetched(state, data) {
      state.movieCatalogueFetched = data;
    },
    addMovie(state, data) {
      state.movies[data.id] = data;
    },
  },
  actions: {
    async GET_CATEGORY_CATALOGUE({ commit }) {
      const categories = await client.fetchCategories();

      commit('updateCategoryCatalogueRaw', categories);
      commit('updateCategoryCatalogue', createDataTree(categories));
      commit('updateCategoryCatalogueFetched', true);
    },
    async GET_MOVIE_CATALOGUE({ commit }) {
      const movies = await client.fetchMovies();

      const moviesMap = Object.assign({}, ...movies.map(item => ({ [item.id]: item })));
      commit('updateMovieCatalogue', moviesMap);
      commit('updateMovieCatalogueFetched', true);
    },
    ADD_MOVIES({ commit }, payload) {
      Object.keys(payload).forEach((item) => {
        commit('addMovie', payload[item]);
      });
    },
  },
  modules: {
  },
});
