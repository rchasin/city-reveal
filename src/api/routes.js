const express = require("express");
const { handleNewLocation } = require("./handlers/new-location");
const { handleOwnTracks } = require("./handlers/owntracks");
const { getSummarizedVisitsInBoundingBox } = require("./handlers/get-visits");

const router = express.Router();

router.post("/location", handleNewLocation);
router.post("/ownTracks", handleOwnTracks);
router.get("/overallVisits", getSummarizedVisitsInBoundingBox);

module.exports = router;
