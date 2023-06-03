const { processNewLocation } = require("../new-location");

const _getUserIdFromTopic = (topic) => {
  return (
    topic.split("/").filter((component) => component != "owntracks")[0] ?? null
  );
};

const _handleOwnTracksNewLocation = async (req, res, next) => {
  const userId = await _getUserIdFromTopic(req.body.topic);
  if (userId === null) {
    throw new Error(`Unrecognized user (topic ${req.body.topic})`);
  }
  try {
    await processNewLocation(userId, req.body.tst, req.body.lat, req.body.lon);
    res.json([]);
    res.end();
  } catch (e) {
    next(e);
  }
};

const handleOwnTracks = async (req, res, next) => {
  if (req.body._type === "location") {
    _handleOwnTracksNewLocation(req, res, next);
  } else {
    // No other message types supported
    res.json([]);
    res.end();
  }
};

module.exports = { handleOwnTracks };
