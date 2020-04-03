
const fetch = require('node-fetch');

const GRAPH = 'https://graph.facebook.com';

const FIRST = 0;
const FRIENDS_QUERY = '/me/friends?limit=5000';
const FEED_QUERY = '/feed?fields=id,permalink_url,created_time&limit=5000';
const TOKEN = process.env.TOKEN || '<your_token>';

/**
 * @return Promise<any>
 */
const graph = (query) => {
  let url = `${GRAPH + query}&access_token=${TOKEN}`;
  if (url.indexOf('?') < FIRST) {
    url = url.replace('&', '?');
  }
  return fetch(url).then((response) => response.json());
};

const handleFeed = (response, data = []) => {
  Array.prototype.push.apply(data, response.data);
  const next = response.paging && response.paging.next;
  if (next) {
    return fetch(next).then((response2) => response2.json())
      .then((response3) => handleFeed(response3, data));
  }
  return data;
};
module.exports = graph;
module.exports.getListFriend = () => graph(FRIENDS_QUERY).then((response) => response.data);
module.exports.loadFeed = (id) => graph(`/${id}${FEED_QUERY}`).then((response) => handleFeed(response))
  .catch(() => null);
