const axios = require('axios');
const debug = require('debug');

const Database = require('./database');

const log = debug('_:bot');

const GRAPH_VERSION = '5.0';
const GRAPH = `https://graph.facebook.com/v${GRAPH_VERSION}`;
const MAX_TRY_REQUEST = 3;

class Bot {
  constructor(token) {
    if (typeof token !== 'string') {
      throw new TypeError('Token must be a String');
    }
    this.token = token;
    const nameBot = token.slice(-7);
    this.log = debug(`bot:${nameBot}`);
    this.database = new Database(`${nameBot}.db.json`);
    log('Create a bot', nameBot);
  }

  graph(query) {
    const url = new URL(GRAPH + query);
    url.searchParams.set('access_token', this.token);
    return Bot.fetch(url.href);
  }

  getListFriend() {
    return this.graph('/me/friends?limit=5000').then((friends) => {
      this.database.setFriends(friends.data);
      this.log('Get friend done');
      return friends;
    });
  }

  async loadFeedWrap(friend, recursive = true) {
    // loaded
    if (this.database.has(friend.id)) {
      return [];
    }

    const data = await this.loadFeed(friend.id, recursive);
    this.database.set(friend.id);
    // eslint-disable-next-line no-param-reassign
    data.forEach((p) => { p.name = friend.name; });
    this.log('Load', friend.name, 'done!!');
    return data;
  }

  update(data) {
    this.database.update(data);
  }

  get(compare) {
    return this.database.get(compare);
  }

  async loadFeed(id, recursive = true) {
    let response;
    if (id.includes('http')) {
      response = await Bot.fetch(id);
    } else {
      response = await this.graph(`/${id}/feed?fields=id,permalink_url,created_time&limit=5000`);
    }
    const { data, paging } = response;
    if (!recursive || !paging || !paging.next) {
      return data;
    }
    const nextData = await this.loadFeed(paging.next, recursive);
    return data.concat(nextData);
  }

  static fetch(url) {
    let tried = 0;
    while (tried < MAX_TRY_REQUEST) {
      tried += 1;
      try {
        return axios(url)
          .then((response) => response.data);
      // eslint-disable-next-line no-empty
      } catch (_) {}
    }
    throw new Error('Request > MAX_TRY_REQUEST time:', url);
  }

  async miner(time) {
    const now = time ? new Date(time) : new Date();
    const friends = await this.getListFriend();
    const data = await Promise.all(friends.data.map((friend) => this.loadFeedWrap(friend, true)));
    this.update(data.flat());
    const posts = this.get((post) => {
      const date = new Date(post.created_time);
      return date.getDate() === now.getDate()
          && date.getMonth() === now.getMonth()
          && date.getFullYear() !== now.getFullYear();
    });
    posts.forEach((post) => {
      this.log(post.name, post.permalink_url);
    });
  }
}

module.exports = Bot;
