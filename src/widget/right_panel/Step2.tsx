import React, { useEffect, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { TouchcommADCReport } from '@webds/service';
import { retrieveDataFileContent } from '../PDNRComponent';
import {
  DataFile,
  FILE_NAME_WIDTH,
  GEARS_FRAMES_WIDTH,
  SelectDataMetricContent,
  SelectDataSelectionContent,
  Subframes,
  TuneDataContent,
  TuningSettings
} from '../constants';
import { FlexiPanel } from '../mui_extensions/Surfaces';
import ExpandableTree from './ExpandableTree';

export const Step2 = (props: any): JSX.Element => {
  const [showContent, setShowContent] = useState(false);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [paramsOpen, setParamsOpen] = useState<boolean>(false);
  const [selectionsOpen, setSelectionsOpen] = useState<boolean>(false);

  const handleFlexiPanelChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleTuningStrategyChange = (strategy: string) => {
    props.setTuningSettings((prev: TuningSettings) => {
      const current = { ...prev };
      current.strategy = strategy;
      return current;
    });
  };

  const handleSubframesChange = (subframe: string) => {
    props.setTuningSettings((prev: TuningSettings) => {
      const current = { ...prev };
      current.subframes[subframe as keyof Subframes] = !current.subframes[
        subframe as keyof Subframes
      ];
      return current;
    });
  };

  const handleStrideChange = (stride: string) => {
    props.setTuningSettings((prev: TuningSettings) => {
      const current = { ...prev };
      if (stride !== '' && isNaN(Number(stride))) {
        return current;
      }
      if (stride === '') {
        current.stride = undefined;
      } else {
        const num = parseInt(stride, 10);
        if (num < 1) {
          current.stride = undefined;
        } else if (num <= 1000) {
          current.stride = num;
        }
      }
      return current;
    });
  };

  const handleAddButtonClick = async (fileList: FileList | null) => {
    if (fileList === null) {
      return;
    }
    const newFiles: DataFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      try {
        const fileContent = await retrieveDataFileContent(fileList[i]);
        fileContent.collections = fileContent.collections.filter(
          (collection: TouchcommADCReport[]) => collection.length !== 0
        );
        const gears = fileContent.collections.length;
        const frames = fileContent.collections.reduce(
          (accumulator: any, currentValue: any) =>
            accumulator + currentValue.length,
          0
        );
        newFiles.push({
          id: uuidv4(),
          file: fileList[i],
          gears: gears,
          frames: frames
        });
      } catch (error) {
        props.setAlert(error);
      }
    }
    props.setTuningSettings((prev: TuningSettings) => {
      const current = { ...prev };
      current.dataFiles = current.dataFiles.concat(newFiles);
      return current;
    });
  };

  const handleDeleteButtonClick = (id: string) => {
    props.setTuningSettings((prev: TuningSettings) => {
      const current = { ...prev };
      const filteredDataFiles = current.dataFiles.filter(
        (dataFile: DataFile) => dataFile && dataFile.id !== id
      );
      current.dataFiles = filteredDataFiles;
      return current;
    });
  };

  const handleParamsOpen = () => {
    setParamsOpen(true);
  };

  const handleParamsClose = () => {
    setParamsOpen(false);
  };

  const handleSelectionsOpen = () => {
    setSelectionsOpen(true);
  };

  const handleSelectionsClose = () => {
    setSelectionsOpen(false);
  };

  const generateFileList = (): JSX.Element[] => {
    const titleRow = (
      <ListItem key={0} divider>
        <div style={{ display: 'flex' }}>
          <ListItemText
            primary="File Name"
            primaryTypographyProps={{
              variant: 'body2',
              style: { fontWeight: 'bold' }
            }}
            sx={{ width: FILE_NAME_WIDTH + 'px' }}
          />
          <ListItemText
            primary="Gears"
            primaryTypographyProps={{
              variant: 'body2',
              textAlign: 'center',
              style: { fontWeight: 'bold' }
            }}
            sx={{ width: GEARS_FRAMES_WIDTH + 'px' }}
          />
          <ListItemText
            primary="Frames"
            primaryTypographyProps={{
              variant: 'body2',
              textAlign: 'center',
              style: { fontWeight: 'bold' }
            }}
            sx={{ width: GEARS_FRAMES_WIDTH + 'px' }}
          />
        </div>
      </ListItem>
    );
    const fileItems = props.tuningSettings.dataFiles.map(
      (dataFile: DataFile) => {
        return (
          <ListItem
            key={dataFile.id}
            divider
            secondaryAction={
              <IconButton
                color="error"
                edge="end"
                onClick={() => handleDeleteButtonClick(dataFile.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <div style={{ display: 'flex' }}>
              <ListItemText
                primary={dataFile.file.name.replace(/.json$/, '')}
                primaryTypographyProps={{
                  variant: 'body2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                sx={{ width: FILE_NAME_WIDTH + 'px' }}
              />
              <ListItemText
                primary={dataFile.gears.toString()}
                primaryTypographyProps={{
                  variant: 'body2',
                  textAlign: 'center'
                }}
                sx={{ width: GEARS_FRAMES_WIDTH + 'px' }}
              />
              <ListItemText
                primary={dataFile.frames.toString()}
                primaryTypographyProps={{
                  variant: 'body2',
                  textAlign: 'center'
                }}
                sx={{ width: GEARS_FRAMES_WIDTH + 'px' }}
              />
            </div>
          </ListItem>
        );
      }
    );
    return [titleRow, ...fileItems];
  };

  useEffect(() => {
    if (props.results !== undefined) {
      setExpanded('panel3');
    }
  }, [props.results]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showContent && (
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
              summary={
                <>
                  <Typography sx={{ width: '50%', flexShrink: 0 }}>
                    Tuning Strategy
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {props.tuningSettings.strategy === 'tuneData'
                      ? 'Tune Data'
                      : 'Select Data'}
                  </Typography>
                </>
              }
              details={
                <>
                  <RadioGroup
                    row
                    value={props.tuningSettings.strategy}
                    onChange={event =>
                      handleTuningStrategyChange(event.target.value)
                    }
                  >
                    <FormControlLabel
                      control={<Radio />}
                      label={<Typography variant="body2">Tune Data</Typography>}
                      value="tuneData"
                    />
                    <FormControlLabel
                      control={<Radio />}
                      label={
                        <Typography variant="body2">Select Data</Typography>
                      }
                      value="selectData"
                      sx={{ marginLeft: '24px' }}
                    />
                  </RadioGroup>
                  {props.tuningSettings.strategy === 'selectData' && (
                    <>
                      <Typography variant="body2" sx={{ marginTop: '16px' }}>
                        Subframes
                      </Typography>
                      <FormGroup
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between'
                        }}
                      >
                        <FormControlLabel
                          control={<Checkbox />}
                          label={<Typography variant="body2">Trans</Typography>}
                          checked={props.tuningSettings.subframes.trans}
                          onChange={() => handleSubframesChange('trans')}
                        />
                        <FormControlLabel
                          control={<Checkbox />}
                          label={<Typography variant="body2">AbsRx</Typography>}
                          checked={props.tuningSettings.subframes.absRx}
                          onChange={() => handleSubframesChange('absRx')}
                        />
                        <FormControlLabel
                          control={<Checkbox />}
                          label={<Typography variant="body2">AbsTx</Typography>}
                          checked={props.tuningSettings.subframes.absTx}
                          onChange={() => handleSubframesChange('absTx')}
                        />
                      </FormGroup>
                      <div
                        style={{
                          marginTop: '16px',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="body2">
                          Stride (1 - 1000):
                        </Typography>
                        <TextField
                          variant="standard"
                          value={
                            props.tuningSettings.stride === undefined
                              ? ''
                              : props.tuningSettings.stride
                          }
                          inputProps={{
                            style: { textAlign: 'center', fontSize: '0.875rem' }
                          }}
                          onChange={event =>
                            handleStrideChange(event.target.value)
                          }
                          sx={{ marginLeft: '8px', flex: 1 }}
                        />
                      </div>
                    </>
                  )}
                </>
              }
              expanded={expanded === 'panel1'}
              onChange={handleFlexiPanelChange('panel1')}
            />
            <FlexiPanel
              scrollable={props.tuningSettings.dataFiles.length}
              summary={
                <>
                  <Typography sx={{ width: '50%', flexShrink: 0 }}>
                    Data Files
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {props.tuningSettings.dataFiles.length +
                      ' File' +
                      (props.tuningSettings.dataFiles.length > 1 ? 's' : '') +
                      ' Selected'}
                  </Typography>
                </>
              }
              details={
                <>
                  <List sx={{ padding: '0px' }}>{generateFileList()}</List>
                  <Stack justifyContent="center" direction="row">
                    <div>
                      <IconButton
                        color="primary"
                        component="label"
                        sx={{ marginTop: '8px' }}
                      >
                        <input
                          hidden
                          multiple
                          type="file"
                          accept=".json"
                          onChange={event =>
                            handleAddButtonClick(event.target.files)
                          }
                        />
                        <AddBoxIcon />
                      </IconButton>
                    </div>
                  </Stack>
                </>
              }
              expanded={expanded === 'panel2'}
              onChange={handleFlexiPanelChange('panel2')}
              sx={{ marginTop: '8px' }}
            />
            <FlexiPanel
              scrollable={props.results !== undefined}
              summary={
                <>
                  <Typography sx={{ width: '50%', flexShrink: 0 }}>
                    Results
                  </Typography>
                </>
              }
              details={
                props.results !== undefined ? (
                  !('selection' in props.results.results) ? (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              {props.results.results[0].map(
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
                            {props.results.results
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
                      <div
                        style={{ display: 'flex', justifyContent: 'center' }}
                      >
                        <Button
                          onClick={() => {
                            handleParamsOpen();
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
                              {props.results.results.metric[0].map(
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
                            {props.results.results.metric[1].map(
                              (
                                row: SelectDataMetricContent,
                                rowIndex: number
                              ) => (
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
                          justifyContent: 'center',
                          gap: '24px'
                        }}
                      >
                        <Button
                          onClick={() => {
                            handleParamsOpen();
                          }}
                          sx={{
                            width: '125px',
                            marginTop: '32px',
                            textAlign: 'center'
                          }}
                        >
                          Config Params
                        </Button>
                        <Button
                          onClick={() => {
                            handleSelectionsOpen();
                          }}
                          sx={{
                            width: '125px',
                            marginTop: '32px',
                            textAlign: 'center'
                          }}
                        >
                          Data Selections
                        </Button>
                      </div>
                    </>
                  )
                ) : (
                  <></>
                )
              }
              expanded={expanded === 'panel3'}
              onChange={handleFlexiPanelChange('panel3')}
              sx={{ marginTop: '8px' }}
            />
          </div>
          <Dialog open={paramsOpen} onClose={handleParamsClose} fullWidth>
            <DialogContent>
              {props.results !== undefined &&
                'params' in props.results &&
                ExpandableTree(props.results.params)}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleParamsClose} sx={{ width: '100px' }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog open={selectionsOpen} onClose={handleSelectionsClose}>
            <DialogContent>
              {props.results !== undefined &&
                'selection' in props.results.results && (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {props.results?.results.selection[0].map(
                            (header: string, index: number) => (
                              <TableCell key={index}>
                                {header.charAt(0).toUpperCase() +
                                  header.slice(1)}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {props.results?.results.selection[1].map(
                          (
                            row: SelectDataSelectionContent,
                            rowIndex: number
                          ) => (
                            <TableRow key={rowIndex}>
                              {row.map((item, colIndex) => (
                                <TableCell key={colIndex}>{item}</TableCell>
                              ))}
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSelectionsClose} sx={{ width: '100px' }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default Step2;
