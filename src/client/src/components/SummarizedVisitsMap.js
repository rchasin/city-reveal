import { useState } from 'react';
import Map, { Layer, Popup, Source } from 'react-map-gl';

import { boundingBoxToGeoJSONPolygon } from '../utils';
import SummarizedVisitsPopupContents from './SummarizedVisitsPopupContents';

// TODO: regenerate 2 tokens, one for local dev, one for prod (in secretsmanager)
const MAPBOX_TOKEN =
  'pk.eyJ1IjoicmNoYXNpbiIsImEiOiJjbGpvZmFjOW0wMXgxM2tta2x0NW84YTF4In0.6Fp_APiW1f_OxLJ8TVA-6A';

const makeGeoJson = (data) => {
  // Super naively just return each geohash's box.
  const features = data.map((geohashSummary) => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [boundingBoxToGeoJSONPolygon(geohashSummary.bounding_box)],
      },
      properties: {
        geohash: geohashSummary.geohash,
        dayCount: geohashSummary.day_count,
        firstDate: geohashSummary.first_date,
        lastDate: geohashSummary.last_date,
      },
    };
  });
  return {
    type: 'FeatureCollection',
    features: features,
  };
};

const getPolygonCenter = (polygon) => {
  const numCoords = polygon.coordinates.flatMap((coords) => coords).length;
  const latSum = polygon.coordinates
    .flatMap((coords) => coords)
    .map((coord) => coord[1])
    .reduce((a, b) => a + b, 0);
  const lngSum = polygon.coordinates
    .flatMap((coords) => coords)
    .map((coord) => coord[0])
    .reduce((a, b) => a + b, 0);
  return [latSum / numCoords, lngSum / numCoords];
};

export default function SummarizedVisitsMap({
  mapRef,
  data,
  userLocation,
  handleMapMoveEnd,
}) {
  const [viewState, setViewState] = useState({});
  const [popupFeature, setPopupFeature] = useState(null);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ ...userLocation, zoom: 13 }}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: 800, height: 600 }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      interactiveLayerIds={['summarized-visits']}
      onClick={(evt) => setPopupFeature(evt.features[0] || null)}
      onLoad={handleMapMoveEnd}
      onMove={(evt) => setViewState(evt.viewState)}
      onMoveEnd={handleMapMoveEnd}
      {...viewState}
    >
      <Source
        id="summarized-visits"
        type="geojson"
        data={makeGeoJson(data ?? [])}
      >
        <Layer
          id="summarized-visits"
          type="fill"
          paint={{ 'fill-color': '#0080ff', 'fill-opacity': 0.5 }}
        />
      </Source>
      {popupFeature && (
        <Popup
          closeOnClick={false}
          latitude={getPolygonCenter(popupFeature.geometry)[0]}
          longitude={getPolygonCenter(popupFeature.geometry)[1]}
          onClose={() => setPopupFeature(null)}
        >
          <SummarizedVisitsPopupContents
            popupFeature={popupFeature}
          ></SummarizedVisitsPopupContents>
        </Popup>
      )}
    </Map>
  );
}
