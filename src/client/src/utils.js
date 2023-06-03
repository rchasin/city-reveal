export const boundingBoxToGeoJSONPolygon = (boundingBox) => {
  const [minLat, minLng, maxLat, maxLng] = boundingBox;
  return [
    [minLng, minLat],
    [minLng, maxLat],
    [maxLng, maxLat],
    [maxLng, minLat],
    [minLng, minLat],
  ];
};
