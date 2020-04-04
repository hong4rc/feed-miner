require('dotenv').config();

const Bot = require('./bot');

const myBot = new Bot(process.env.TOKEN);

myBot.miner();
