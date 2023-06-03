import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useEffect, useRef, useState } from 'react';

import SummarizedVisitsMap from './components/SummarizedVisitsMap';

const _unused_getBounds = (data) => {
  return data
    .map(({ bounding_box }) => bounding_box)
    .reduce(
      (acc, [bbMinLat, bbMinLng, bbMaxLat, bbMaxLng]) => {
        return [
          Math.min(acc[0], bbMinLat),
          Math.min(acc[1], bbMinLng),
          Math.max(acc[2], bbMaxLat),
          Math.max(acc[3], bbMaxLng),
        ];
      },
      [10000, 10000, -10000, -1000]
    );
};

const bboxContains = (bbox1, bbox2) => {
  return (
    bbox1[0] <= bbox2[0] &&
    bbox1[1] <= bbox2[1] &&
    bbox1[2] >= bbox2[2] &&
    bbox1[3] >= bbox2[3]
  );
};

export default function App() {
  const mapRef = useRef();
  const [fetchedData, setFetchedData] = useState();

  const fetchData = async (newBbox, newDateRange) => {
    const bbox = newBbox != null ? newBbox : fetchedData?.bbox;
    if (
      newBbox != null &&
      fetchedData != null &&
      bboxContains(fetchedData.bbox, bbox)
    ) {
      return;
    }
    const dateRange =
      newDateRange != null ? newDateRange : [startDate, endDate];
    console.log('Fetching data for bbox and date range', bbox, dateRange);
    const base = `${process.env.REACT_APP_API_BASE}/api/overallVisits`;
    const url = new URL(base);
    url.searchParams.append('userId', process.env.REACT_APP_USER_ID);
    url.searchParams.append('boundingBox', bbox.join(','));
    if (dateRange[0] != null) {
      url.searchParams.append('startDate', dateRange[0].format('YYYY-MM-DD'));
    }
    if (dateRange[1] != null) {
      url.searchParams.append('endDate', dateRange[1].format('YYYY-MM-DD'));
    }
    const resp = await fetch(url, { method: 'GET' });
    const data = await resp.json();
    setFetchedData({
      bbox: bbox,
      data: data,
    });
  };

  const handleDateRangeChange = (value, isStart) => {
    if (isStart) {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    if (fetchedData != null) {
      fetchData(null, [isStart ? value : startDate, isStart ? endDate : value]);
    }
  };

  const handleMapMoveEnd = (evt) => {
    const bounds = evt.target.getBounds();
    const bbox = [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast(),
    ];
    fetchData(bbox, null);
  };

  const [userLocation, setUserLocation] = useState(null);
  if (userLocation === null) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setUserLocation({ latitude: 0, longitude: 0 });
      }
    );
  }

  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <span>
          <DatePicker
            value={startDate}
            onChange={(newValue) => handleDateRangeChange(newValue, true)}
          />
          <DatePicker
            value={endDate}
            onChange={(newValue) => handleDateRangeChange(newValue, false)}
          />
        </span>
        {userLocation && (
          <SummarizedVisitsMap
            mapRef={mapRef}
            data={fetchedData?.data}
            userLocation={userLocation}
            handleMapMoveEnd={handleMapMoveEnd}
          ></SummarizedVisitsMap>
        )}
      </div>
    </LocalizationProvider>
  );
}
