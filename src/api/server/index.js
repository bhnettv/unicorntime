import Vue from 'vue';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import settingsStore from '../../settings';

const proxyServer = settingsStore.get('proxy').trim();

let tokenObject = {};
try {
  let tokenString = settingsStore.get('token') || '';
  tokenString = tokenString.trim();
  tokenString = atob(tokenString);
  tokenObject = JSON.parse(tokenString);
  // eslint-disable-next-line no-empty
} catch (err) {}

const {
  consumerKey = '',
  consumerSecret = '',
  token = '',
  secret = '',
} = tokenObject;


const axiosTimeout = proxyServer === '' ? 5000 : 10000;

const oauth = OAuth({
  consumer: {
    key: consumerKey,
    secret: consumerSecret,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64');
  },
});

const generateOauthHeader = (url, method) => {
  const headers = oauth.toHeader(oauth.authorize({
    url,
    method,
  }, {
    key: token,
    secret,
  }));
  return headers;
};

const translateUrl = (url) => {
  if (proxyServer !== '') {
    return proxyServer + encodeURIComponent(url);
  }

  return url;
};

const requestGet = url => Vue.axios.get(translateUrl(url), {
  headers: {
    Accept: 'application/vnd.beenius+json;version=9',
    ...generateOauthHeader(url, 'GET'),
  },
  timeout: axiosTimeout,
});

const fetchCategories = async () => {
  let responseList = [];
  let url = 'http://10.200.0.41/restapi/rest/1/store/categories?purchase_item_type=on-demand&language=mn&page_size=500';
  let response = await requestGet(url);
  responseList = [...responseList, ...response.data.list];

  url = 'http://10.200.0.41/restapi/rest/svod/1/453737/category/list?language=mn&subscriberId=403977000';
  response = await requestGet(url);
  responseList = [...responseList, ...response.data.data];

  return responseList;
};

const fetchMovies = async () => {
  const subscriptions = [
    '6d5a91ee-752b-38aa-e053-0a00640a650e', // Basic XL Plus
    // '6e8bd43a-4375-61a1-e053-0900640a55d6', // VOD_extra
    'ff628541-8c36-4c72-81d6-1dc5f17d5efe', // HBO channel package paid
    '18f5b98a-0513-4560-9cc6-23775b198cc1', // Extra 88 for province customers
    '608381bd-4a14-4c6c-ba37-354c2f0b7c0d', // UniLive89 MCS Got Talent
  ];
  let responseList = [];
  let page = 1;
  const url = `http://10.200.0.41/restapi/rest/1/store/visible-products?purchase_item_type=on-demand&language=mn&page_size=10000&include_details=true&include_private_subscription_id_list=${subscriptions.sort().join(',')}`;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pageUrl = `${url}&page=${page}`;
    // eslint-disable-next-line no-await-in-loop
    const response = await requestGet(pageUrl);

    responseList = [...responseList, ...response.data.list];

    if (response.data.pageNumber * response.data.pageSize >= response.data.rowCount) {
      break;
    }
    page += 1;
  }

  responseList.forEach((item) => {
    item.poster = `http://10.200.0.41${item.poster}`;
  });

  return responseList;
};

const fetchMedias = async (mediaIds) => {
  const uniqueMediaIds = [...new Set(mediaIds)].sort();

  if (uniqueMediaIds.length === 0) {
    return [];
  }

  const perRequest = 150;
  let responseList = [];
  let url = '';
  for (let i = 0; i < Math.ceil(uniqueMediaIds.length / perRequest); i += 1) {
    url = 'http://10.200.0.41/restapi/rest/1/content/media?include_media_resources=true&include_details=true&content_media_id_list=';
    url += uniqueMediaIds.slice(i * perRequest, Math.min((i + 1) * perRequest, uniqueMediaIds.length)).join(',');

    // eslint-disable-next-line no-await-in-loop
    const response = await requestGet(url);
    responseList = [...responseList, ...response.data.list];
  }

  return responseList;
};

const fetchMedia = async (mediaId) => {
  const url = `http://10.200.0.41/restapi/rest/1/content/media?include_details=true&include_media_resources=true&content_info_id=${mediaId}`;
  const response = await requestGet(url);

  return response.data.list;
};

const fetchSvodList = async (categoryId) => {
  const url = `http://10.200.0.41/restapi/rest/svod/1/453737/season/list?language=mn&categoryId=${categoryId}`;
  const response = await requestGet(url);

  const responseList = response.data.data;

  responseList.forEach((item) => {
    item.poster = `http://10.200.0.41/BeeWidgets/univision-svod-app/ScalerServlet?url=${item.poster}&width=175&height=259`;
  });

  return response.data.data;
};

const fetchSvodItemEpisodes = async (svodContentInfoIds) => {
  const uniqueIds = [...new Set(svodContentInfoIds)].sort();

  if (uniqueIds.length === 0) {
    return [];
  }

  const url = `http://10.200.0.41/restapi/rest/1/content/info?include_details=true&language=mn&content_info_id_list=${uniqueIds.join(',')}`;
  const response = await requestGet(url);

  const responseList = response.data.list;

  responseList.forEach((item) => {
    item.poster = `http://10.200.0.41${item.poster}`;
  });

  // restore the original order
  responseList.sort((a, b) => svodContentInfoIds.indexOf(a.id) - svodContentInfoIds.indexOf(b.id));

  return responseList;
};

export default {
  translateUrl,
  fetchCategories,
  fetchMovies,
  fetchMedias,
  fetchMedia,
  fetchSvodList,
  fetchSvodItemEpisodes,
};
