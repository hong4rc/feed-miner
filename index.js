
require('dotenv').config();
const log = require('debug')('bot');
const graph = require('./lib/graph');

let process = graph.getListFriend();
const now = new Date();
process.then((users) => {
  users.forEach((user) => {
    log(user);
    process = process.then(() => graph.loadFeed(user.id))
      .then((feeds) => {
        feeds.forEach((feed) => {
          const that = new Date(feed.created_time);
          if (that.getDate() === now.getDate()
                              && that.getMonth() === now.getMonth()
                              && that.getFullYear() !== now.getFullYear()
                              && feed.id.match(new RegExp(`^${user.id}`))
          ) {
            log(user.name, `https://www.facebook.com/${feed.id}`);
          }
        });
      });
  });
});
