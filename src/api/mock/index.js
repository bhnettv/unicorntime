import categories from './data/categories.json';
import movies from './data/movies.json';
import medias from './data/medias.json';
import svodlist from './data/svodlist.json';
import svodepisodes from './data/svodepisodes.json';

const fetch = (mockData, time = 0) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(mockData);
  }, time);
});

const translateUrl = url => url;
const fetchCategories = () => fetch(categories.list, 1000);
const fetchMovies = () => fetch(movies.list, 1000);
const fetchMedias = () => fetch(medias.list, 1000);
const fetchMedia = () => fetch([medias.list[0], medias.list[11]], 1000);
const fetchSvodList = () => fetch(svodlist.data, 1000);
const fetchSvodItemEpisodes = () => fetch(svodepisodes.list, 1000);

export default {
  translateUrl,
  fetchCategories,
  fetchMovies,
  fetchMedias,
  fetchMedia,
  fetchSvodList,
  fetchSvodItemEpisodes,
};
