const ngeohash = require("ngeohash");
const { addVisit } = require("./db/location-dao");

const GEOHASH_PRECISION = 7;
const TZ = "America/New_York";

const processNewLocation = async (userId, ts, lat, lon) => {
  const geohash = ngeohash.encode(lat, lon, GEOHASH_PRECISION);
  const boundingBox = ngeohash.decode_bbox(geohash);
  await addVisit(userId, TZ, lat, lon, geohash, boundingBox, ts);
};

module.exports = { processNewLocation };
