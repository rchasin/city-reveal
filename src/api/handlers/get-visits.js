const { getSummarizedVisits } = require("../db/location-dao");

const getSummarizedVisitsInBoundingBox = async (req, res, next) => {
  if (req.query.startDate != null && req.query.endDate != null) {
    if (req.query.endDate < req.query.startDate) {
      next(new Error("endDate must not be before startDate"));
    }
  }
  try {
    const summarizedVisits = await getSummarizedVisits(
      req.query.userId,
      req.query.boundingBox.split(","),
      req.query.startDate,
      req.query.endDate
    );
    res.json(summarizedVisits);
  } catch (e) {
    next(e);
  }
};

module.exports = { getSummarizedVisitsInBoundingBox };
