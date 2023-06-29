import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { SelectDataMetricContent, TuneDataContent } from '../constants';
import { FlexiPanel } from '../mui_extensions/Surfaces';
import ExpandableTree from './ExpandableTree';

export const STEP5_1 = (props: any): JSX.Element => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [qfParamsOpen, setQFParamsOpen] = useState<boolean>(false);
  const [mfParamsOpen, setMFParamsOpen] = useState<boolean>(false);

  const handleFlexiPanelChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleQFParamsOpen = () => {
    setQFParamsOpen(true);
  };

  const handleQFParamsClose = () => {
    setQFParamsOpen(false);
  };

  const handleMFParamsOpen = () => {
    setMFParamsOpen(true);
  };

  const handleMFParamsClose = () => {
    setMFParamsOpen(false);
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        <FlexiPanel
          scrollable={props.qfResults !== undefined}
          summary={
            <>
              <Typography sx={{ width: '50%', flexShrink: 0 }}>
                QF Mode Results
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {!('selection' in props.qfResults.results)
                  ? 'Tune Data'
                  : 'Select Data'}
              </Typography>
            </>
          }
          details={
            props.qfResults !== undefined ? (
              !('selection' in props.qfResults.results) ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {props.qfResults.results[0].map(
                            (header: string, index: number) => (
                              <TableCell key={index}>
                                <Typography variant="body2">
                                  {header.charAt(0).toUpperCase() +
                                    header.slice(1)}
                                </Typography>
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {props.qfResults.results
                          .slice(1)
                          .map((row: TuneDataContent, rowIndex: number) => (
                            <TableRow key={rowIndex}>
                              {row.map((item, colIndex) => (
                                <TableCell key={colIndex}>
                                  <Typography variant="body2">
                                    {typeof item === 'number'
                                      ? item.toFixed(2)
                                      : item}
                                  </Typography>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      onClick={() => {
                        handleQFParamsOpen();
                      }}
                      sx={{
                        width: '125px',
                        marginTop: '32px',
                        textAlign: 'center'
                      }}
                    >
                      Config Params
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {props.qfResults.results.metric[0].map(
                            (header: string, index: number) => (
                              <TableCell key={index}>
                                <Typography variant="body2">
                                  {header.charAt(0).toUpperCase() +
                                    header.slice(1)}
                                </Typography>
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {props.qfResults.results.metric[1].map(
                          (row: SelectDataMetricContent, rowIndex: number) => (
                            <TableRow key={rowIndex}>
                              {row.map((item, colIndex) => (
                                <TableCell key={colIndex}>
                                  <Typography variant="body2">
                                    {typeof item === 'number'
                                      ? item.toFixed(2)
                                      : item}
                                  </Typography>
                                </TableCell>
                              ))}
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <Button
                      onClick={() => {
                        handleQFParamsOpen();
                      }}
                      sx={{
                        width: '125px',
                        marginTop: '32px',
                        textAlign: 'center'
                      }}
                    >
                      Config Params
                    </Button>
                  </div>
                </>
              )
            ) : (
              <></>
            )
          }
          expanded={expanded === 'panel1'}
          onChange={handleFlexiPanelChange('panel1')}
        />
        <FlexiPanel
          scrollable={props.mfResults !== undefined}
          summary={
            <>
              <Typography sx={{ width: '50%', flexShrink: 0 }}>
                MF Mode Results
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {!('selection' in props.mfResults.results)
                  ? 'Tune Data'
                  : 'Select Data'}
              </Typography>
            </>
          }
          details={
            props.mfResults !== undefined ? (
              !('selection' in props.mfResults.results) ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {props.mfResults.results[0].map(
                            (header: string, index: number) => (
                              <TableCell key={index}>
                                <Typography variant="body2">
                                  {header.charAt(0).toUpperCase() +
                                    header.slice(1)}
                                </Typography>
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {props.mfResults.results
                          .slice(1)
                          .map((row: TuneDataContent, rowIndex: number) => (
                            <TableRow key={rowIndex}>
                              {row.map((item, colIndex) => (
                                <TableCell key={colIndex}>
                                  <Typography variant="body2">
                                    {typeof item === 'number'
                                      ? item.toFixed(2)
                                      : item}
                                  </Typography>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      onClick={() => {
                        handleMFParamsOpen();
                      }}
                      sx={{
                        width: '125px',
                        marginTop: '32px',
                        textAlign: 'center'
                      }}
                    >
                      Config Params
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {props.mfResults.results.metric[0].map(
                            (header: string, index: number) => (
                              <TableCell key={index}>
                                <Typography variant="body2">
                                  {header.charAt(0).toUpperCase() +
                                    header.slice(1)}
                                </Typography>
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {props.mfResults.results.metric[1].map(
                          (row: SelectDataMetricContent, rowIndex: number) => (
                            <TableRow key={rowIndex}>
                              {row.map((item, colIndex) => (
                                <TableCell key={colIndex}>
                                  <Typography variant="body2">
                                    {typeof item === 'number'
                                      ? item.toFixed(2)
                                      : item}
                                  </Typography>
                                </TableCell>
                              ))}
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <Button
                      onClick={() => {
                        handleMFParamsOpen();
                      }}
                      sx={{
                        width: '125px',
                        marginTop: '32px',
                        textAlign: 'center'
                      }}
                    >
                      Config Params
                    </Button>
                  </div>
                </>
              )
            ) : (
              <></>
            )
          }
          expanded={expanded === 'panel2'}
          onChange={handleFlexiPanelChange('panel2')}
          sx={{ marginTop: '8px' }}
        />
      </div>
      <Dialog open={qfParamsOpen} onClose={handleQFParamsClose} fullWidth>
        <DialogContent>
          {props.qfResults !== undefined &&
            'params' in props.qfResults &&
            ExpandableTree(props.qfResults.params)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQFParamsClose} sx={{ width: '100px' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={mfParamsOpen} onClose={handleMFParamsClose} fullWidth>
        <DialogContent>
          {props.mfResults !== undefined &&
            'params' in props.mfResults &&
            ExpandableTree(props.mfResults.params)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMFParamsClose} sx={{ width: '100px' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default STEP5_1;
