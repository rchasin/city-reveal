CREATE TABLE IF NOT EXISTS visits (
    user_id text not null,
    lat float not null,
    lon float not null,
    geohash text not null,
    bounding_box box not null,
    "time" timestamptz not null
);
CREATE INDEX IF NOT EXISTS vists_idx ON visits (user_id, geohash, time);

CREATE TABLE IF NOT EXISTS summarized_visits (
    user_id text not null,
    geohash text not null,
    bounding_box box not null,
    day_count integer not null,
    first_date date not null,
    last_date date not null,
    PRIMARY KEY (user_id, geohash)
);

CREATE EXTENSION btree_gist;
CREATE INDEX IF NOT EXISTS visits_bb_idx ON visits USING GIST (user_id, bounding_box, time);
CREATE INDEX IF NOT EXISTS summarized_visits_bb_idx ON summarized_visits USING GIST (user_id, bounding_box);
