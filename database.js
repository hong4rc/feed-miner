const fs = require('fs');

class Database {
  constructor(path) {
    if (!path) {
      throw new Error('Path cannot empty');
    }
    if (!fs.existsSync(path)) {
      // TODO: deep path
      fs.writeFileSync(path, '{}');
    }
    this.path = path;

    const text = fs.readFileSync(path);
    this.store = JSON.parse(text);
    this.store.friends = this.store.friends || {};
    this.store.has = this.store.has || {};
    this.store.posts = this.store.posts || [];
  }

  setFriends(friends) {
    this.store.friends = {};
    if (!Array.isArray(friends)) {
      throw new TypeError('Friends must be array');
    }
    friends.forEach((friend) => {
      this.store.friends[friend.id] = friend.name;
      // log(friend.id, '=>', friend.name);
    });
    this.save();
  }

  has(id) {
    return id in this.store.has;
  }

  update(data) {
    this.store.posts.push(...data);
    this.save();
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.store));
  }

  set(id) {
    this.store.has[id] = true;
  }

  get(compare) {
    return this.store.posts.filter(compare);
  }
}

module.exports = Database;
