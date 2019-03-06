

const fetch = require('node-fetch');

const GRAPH = 'https://graph.facebook.com';

const FIRST = 0;
const FRIENDS_QUERY = '/me/friends?limit=5000';
const FEED_QUERY = '/feed?fields=id,created_time&limit=5000';
const TOKEN = process.env.TOKEN || '<your_token>';

/**
 * @return Promise<any>
 */
const graph = (query) => {
  let url = `${GRAPH + query}&access_token=${TOKEN}`;
  if (url.indexOf('?') < FIRST) {
    url = url.replace('&', '?');
  }
  return fetch(url).then(res => res.json());
};

const handleFeed = (res, data = []) => {
  Array.prototype.push.apply(data, res.data);
  const next = res.paging && res.paging.next;
  if (next) {
    return fetch(next).then(res2 => res2.json())
      .then(res3 => handleFeed(res3, data));
  }
  return data;
};
module.exports = graph;
module.exports.getListFriend = () => graph(FRIENDS_QUERY).then(res => res.data);
module.exports.loadFeed = id => graph(`/${id}${FEED_QUERY}`).then(res => handleFeed(res))
  .catch(() => null);
