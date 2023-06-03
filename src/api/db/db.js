const dayjs = require('dayjs');
const knex = require('knex');
const { types } = require('pg');
const { builtins } = require('pg-types');

const { getSecret } = require('../secrets');

BOX_TYPE = 603;
BOX_RE = /\((.*),(.*)\),\((.*),(.*)\)/;
types.setTypeParser(builtins.TIMESTAMPTZ, (val) => dayjs(val));
types.setTypeParser(builtins.DATE, (val) => dayjs(val).format('YYYY-MM-DD'));
types.setTypeParser(BOX_TYPE, (val) => {
  const match = val.match(BOX_RE);
  return [match[1], match[2], match[3], match[4]].map(parseFloat);
});

let db;
const setupDb = () => {
  let connection;
  if (getSecret('PG_CONNECTION_STRING') !== undefined) {
    connection = getSecret('PG_CONNECTION_STRING');
  } else {
    throw new Error('No PG_CONNECTION_STRING specified');
  }
  db = knex({
    client: 'pg',
    connection,
    pool: { min: 0, max: 5 },
  });
};

const getDb = () => {
  return db;
};

module.exports = { getDb, setupDb };
