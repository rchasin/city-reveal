import { Table, TableBody, TableCell, TableRow } from '@mui/material';

export default function SummarizedVisitsPopupContents({ popupFeature }) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>Geohash</TableCell>
          <TableCell>{popupFeature.properties.geohash}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Days visited</TableCell>
          <TableCell>{popupFeature.properties.dayCount}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>First visited</TableCell>
          <TableCell>{popupFeature.properties.firstDate}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Last visited</TableCell>
          <TableCell>{popupFeature.properties.lastDate}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
