const { processNewLocation } = require("../new-location");

const handleNewLocation = async (req, res, next) => {
  try {
    await processNewLocation(
      req.query.userId,
      req.body.ts,
      req.body.lat,
      req.body.lon
    );
    res.end();
  } catch (e) {
    next(e);
  }
};

module.exports = { handleNewLocation };
