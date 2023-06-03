const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const { getDb } = require("./db");

const VISITS = "visits";
const SUMMARIZED_VISITS = "summarized_visits";

const _convertBoundingBoxForPostgres = (boundingBox) => {
  return `((${boundingBox[0]},${boundingBox[1]}),(${boundingBox[2]},${boundingBox[3]}))`;
};

const _makeInsertVisitQuery = (userId, lat, lon, geohash, boundingBox, dt) => {
  return getDb()
    .table(VISITS)
    .insert({
      user_id: userId,
      lat: lat,
      lon: lon,
      geohash: geohash,
      bounding_box: `${_convertBoundingBoxForPostgres(boundingBox)}`,
      time: dt.toISOString(),
    });
};

const _makeInsertSummarizedVisitQuery = (
  userId,
  geohash,
  boundingBox,
  dayCount,
  dateStr
) => {
  return getDb()
    .table(SUMMARIZED_VISITS)
    .insert({
      user_id: userId,
      geohash: geohash,
      bounding_box: `${_convertBoundingBoxForPostgres(boundingBox)}`,
      day_count: dayCount,
      first_date: dateStr,
      last_date: dateStr,
    });
};

const _makeUpdateSummarizedVisitQuery = (
  userId,
  geohash,
  dayCount,
  dateStr
) => {
  return getDb()
    .table(SUMMARIZED_VISITS)
    .where("user_id", userId)
    .where("geohash", geohash)
    .update({
      day_count: dayCount,
      last_date: dateStr,
    });
};

const addVisit = async (
  userId,
  tz,
  lat,
  lon,
  geohash,
  boundingBox,
  epochTime
) => {
  await getDb().transaction(async (trx) => {
    const dt = dayjs.unix(epochTime).tz(tz);
    const dateStr = dt.format("YYYY-MM-DD");
    const existingSummarizedVisit = await getDb()
      .table(SUMMARIZED_VISITS)
      .select("*")
      .where("user_id", userId)
      .where("geohash", geohash)
      .first()
      .transacting(trx);
    await _makeInsertVisitQuery(
      userId,
      lat,
      lon,
      geohash,
      boundingBox,
      dt
    ).transacting(trx);
    if (
      existingSummarizedVisit !== undefined &&
      existingSummarizedVisit.last_date < dateStr
    ) {
      await _makeUpdateSummarizedVisitQuery(
        userId,
        geohash,
        existingSummarizedVisit.day_count + 1,
        dateStr
      ).transacting(trx);
    } else if (existingSummarizedVisit === undefined) {
      await _makeInsertSummarizedVisitQuery(
        userId,
        geohash,
        boundingBox,
        1,
        dateStr,
        dateStr
      ).transacting(trx);
    }
  });
};

const getSummarizedVisits = async (userId, boundingBox, startDateStr, endDateStr) => {
  let query = getDb()
    .table(SUMMARIZED_VISITS)
    .select("*")
    .where("user_id", userId)
    .where(
      getDb().raw("?? && ?::box", [
        "bounding_box",
        _convertBoundingBoxForPostgres(boundingBox),
      ])
    );
  if (typeof startDateStr === "string") {
    query = query.where("last_date", ">=", startDateStr);
  }
  if (typeof endDateStr === "string") {
    query = query.where("first_date", "<=", endDateStr);
  }
  return await query;
};

module.exports = { addVisit, getSummarizedVisits };
