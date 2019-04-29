
require('dotenv').config();

const log = require('debug')('bot');
const graph = require('./lib/graph');

let process = graph.getListFriend();
const now = new Date();
process.then((users) => {
  if (!Array.isArray(users)) {
    return log('Omg!! where is your friend?');
  }
  return users.forEach((user) => {
    log(user);
    process = process.then(() => graph.loadFeed(user.id))
      .then((feeds) => {
        if (!Array.isArray(feeds)) {
          return log('%s: fail to load feed', user.name);
        }
        return feeds.forEach((feed) => {
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
