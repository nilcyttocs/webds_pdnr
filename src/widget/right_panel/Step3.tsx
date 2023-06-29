import React, { useContext, useEffect, useRef, useState } from 'react';

import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { TouchcommADCReport } from '@webds/service';
import {
  ALERT_MESSAGE_DISABLE_REPORT,
  ALERT_MESSAGE_ENABLE_REPORT,
  ALERT_MESSAGE_LOAD_COLLECTION,
  ALERT_MESSAGE_WRITE_DYNAMIC_CONFIG,
  ClipData,
  MF_DATA_FILE_NAME,
  REPORT_CLIP,
  REPORT_RAW,
  SSE_CLOSED
} from '../constants';
import {
  ConfigContext,
  ConfigContextData,
  requestAPI,
  webdsService
} from '../local_exports';
import {
  DownloadButton,
  ResetButton,
  UploadButton
} from '../mui_extensions/Buttons';
import { retrieveDataFileContent } from '../PDNRComponent';

const NOISE_MODE = 6;

const CLIP_DATA_FRAMES = 50;

let numGears: number;
let gears: number[] = [];

const clipData: ClipData = { transcap: [], abs: [] };
let collectedData: TouchcommADCReport[][] = [];

let transMin: number;
let transMax: number;

let eventSource: EventSource | undefined;
let eventData: TouchcommADCReport;

const setReportTypes = async (
  enable: number[],
  disable: number[]
): Promise<void> => {
  const dataToSend = { enable, disable };
  try {
    await requestAPI<any>('report', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
  } catch (error) {
    console.error(`Error - POST /webds/report\n${error}`);
    return Promise.reject('Failed to enable/disable report types');
  }
  return Promise.resolve();
};

const enableReport = async (enable: boolean, report: number) => {
  try {
    await setReportTypes(enable ? [report] : [], enable ? [] : [report]);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const Step3 = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [clipMargin, setClipMargin] = useState<number>(5);
  const [clipChecking, setClipChecking] = useState<boolean>();
  const [collecting, setCollecting] = useState<number | undefined>();
  const [collected, setCollected] = useState<number[]>(
    collectedData.map(collection => collection.length)
  );

  const theme = useTheme();

  const configContext: ConfigContextData = useContext(ConfigContext);

  const clipCheckingRef = useRef(clipChecking);
  const collectingRef = useRef(collecting);

  const checkClipping = () => {
    console.log(transMin, transMax);
    const noClipping = clipData.transcap.every(frame => {
      const mappedFrame = frame[1].map((value, index) => {
        if (index % 2 === 0) {
          const nextValue = frame[1][index + 1] || 0;
          return value + nextValue * 256;
        }
        return value;
      });
      const filteredFrame = mappedFrame.filter(
        (value, index) => index % 2 === 0
      );
      console.log(filteredFrame);
      return filteredFrame.every((node, index) => {
        return node >= transMin && node <= transMax;
      });
    });
    console.log(noClipping);
  };

  const eventHandler = (event: any) => {
    const data = JSON.parse(event.data);
    if (
      !data ||
      !data.report ||
      (data.report[0] !== 'raw' && data.report[0] !== 31)
    ) {
      return;
    }
    eventData = data.report;
    if (clipCheckingRef.current) {
      if (
        data.report[0] === 31 &&
        clipData.transcap.length < CLIP_DATA_FRAMES
      ) {
        clipData.transcap.push(data.report);
      } else if (clipData.abs.length < CLIP_DATA_FRAMES) {
        clipData.abs.push(eventData);
      }
      if (
        clipData.abs.length === CLIP_DATA_FRAMES &&
        clipData.transcap.length === CLIP_DATA_FRAMES
      ) {
        enableReport(false, REPORT_RAW);
        enableReport(false, REPORT_CLIP);
        setClipChecking(false);
        checkClipping();
      }
    } else if (collectingRef.current !== undefined) {
      collectedData[collectingRef.current].push(eventData);
      setCollected(collectedData.map(collection => collection.length));
    }
  };

  const errorHandler = (error: any) => {
    console.error(`Error - GET /webds/report\n${error}`);
  };

  const removeEvent = () => {
    if (eventSource && eventSource.readyState !== SSE_CLOSED) {
      eventSource.removeEventListener('report', eventHandler, false);
      eventSource.removeEventListener('error', errorHandler, false);
      eventSource.close();
      eventSource = undefined;
    }
  };

  const addEvent = () => {
    if (eventSource) {
      return;
    }
    eventSource = new window.EventSource('/webds/report');
    eventSource.addEventListener('report', eventHandler, false);
    eventSource.addEventListener('error', errorHandler, false);
  };

  const resetCollectedData = () => {
    gears = [];
    collectedData = [];
    for (let i = 0; i < numGears; i++) {
      gears.push(i);
      collectedData.push([]);
    }
    setCollected(collectedData.map(collection => collection.length));
  };

  const handleClipMarginChange = (margin: string) => {
    if (margin !== '' && isNaN(Number(margin))) {
      return;
    }
    if (margin === '') {
      setClipMargin(-1);
    } else {
      const num = parseInt(margin, 10);
      if (num < 0) {
        setClipMargin(-1);
      } else if (num <= 100) {
        setClipMargin(num);
      }
    }
  };

  const handleClipCheckButtonClick = async () => {
    const clipMarginTrans =
      Math.floor((4095 * clipMargin) / 100) *
      configContext.staticConfig.imageBurstsPerClusterMF;
    transMin = clipMarginTrans;
    transMax =
      4095 * configContext.staticConfig.imageBurstsPerClusterMF -
      clipMarginTrans;
    clipData.abs = [];
    clipData.transcap = [];
    await enableReport(true, REPORT_RAW);
    await enableReport(true, REPORT_CLIP);
    addEvent();
    setClipChecking(true);
  };

  const handleCollectButtonClick = async (index: number) => {
    try {
      await webdsService.touchcomm.writeDynamicConfig({
        requestedFrequency: index,
        requestedFrequencyAbs: index
      });
    } catch (error) {
      console.error(error);
      props.setAlert(ALERT_MESSAGE_WRITE_DYNAMIC_CONFIG);
      return;
    }
    try {
      await enableReport(collecting === undefined, REPORT_RAW);
      if (collecting === undefined) {
        addEvent();
      } else {
        removeEvent();
      }
      setCollecting(prev => {
        if (prev === undefined) {
          addEvent();
        } else {
          removeEvent();
        }
        return prev === undefined ? index : undefined;
      });
    } catch (error) {
      console.error(error);
      props.setAlert(
        collecting === undefined
          ? ALERT_MESSAGE_ENABLE_REPORT
          : ALERT_MESSAGE_DISABLE_REPORT
      );
    }
  };

  const handleSaveButtonClick = async () => {
    if (collectedData.every(collection => collection.length === 0)) {
      return;
    }
    let blob = new Blob(
      [
        JSON.stringify({
          metadata: configContext.staticConfig,
          collections: collectedData
        })
      ],
      { type: 'application/json' }
    );
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = MF_DATA_FILE_NAME;
    window.addEventListener('focus', function () {
      resetCollectedData();
    });
    link.click();
  };

  const handleLoadButtonClick = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files === null) {
      return;
    }
    try {
      const fileContent = await retrieveDataFileContent(event.target.files[0]);
      if (fileContent.collections.length !== collectedData.length) {
        throw ALERT_MESSAGE_LOAD_COLLECTION;
      }
      collectedData = fileContent.collections;
      setCollected(collectedData.map(collection => collection.length));
    } catch (error) {
      props.setAlert(error);
    }
  };

  const generateCollectionList = (): JSX.Element[] => {
    return gears.map((gear, index) => {
      return (
        <ListItem
          key={index}
          divider
          secondaryAction={
            <div style={{ position: 'relative' }}>
              {collecting === index && (
                <LinearProgress
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    '& .MuiLinearProgress-barColorPrimary': {
                      backgroundColor: 'custom.progress'
                    }
                  }}
                />
              )}
              <Button
                disabled={
                  clipChecking ||
                  (collecting !== undefined && collecting !== index)
                }
                onClick={() => handleCollectButtonClick(index)}
                sx={{
                  width: '125px',
                  height: '24px',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor:
                    collecting === index
                      ? theme.palette.primary.main
                      : 'rgba(0, 0, 0, 0)',
                  color: collecting === index ? 'black' : null,
                  backgroundColor: collecting === index ? 'transparent' : null,

                  '&:hover': {
                    backgroundColor: collecting === index ? 'transparent' : null
                  }
                }}
              >
                {collecting === index ? 'Stop' : 'Collect'}
              </Button>
            </div>
          }
          sx={{ position: 'relative' }}
        >
          <Typography component="span">{`Gear ${gear}`}</Typography>
          <Typography
            component="span"
            sx={{ position: 'absolute', left: '120px' }}
          >
            {`${collected[index]} frame${
              collected[index] > 1 ? 's' : ''
            } collected`}
          </Typography>
        </ListItem>
      );
    });
  };

  useEffect(() => {
    clipCheckingRef.current = clipChecking;
    if (clipChecking === false) {
      console.log(clipData);
      removeEvent();
    }
  }, [clipChecking]);

  useEffect(() => {
    collectingRef.current = collecting;
  }, [collecting]);

  useEffect(() => {
    const initialize = async () => {
      if (
        configContext.staticConfig === undefined ||
        configContext.dynamicConfig === undefined
      ) {
        return;
      }
      numGears = configContext.staticConfig['freqTable[2].disableFreq'].length;
      resetCollectedData();
      try {
        await webdsService.touchcomm.writeDynamicConfig({
          disableNoiseMitigation: 1,
          requestedNoiseMode: NOISE_MODE,
          inhibitFrequencyShift: 1,
          noLowPower: 1
        });
      } catch (error) {
        console.error(error);
        props.setAlert(ALERT_MESSAGE_WRITE_DYNAMIC_CONFIG);
        return;
      }
      setInitialized(true);
    };
    initialize();
    return () => {
      if (configContext.dynamicConfig !== undefined) {
        try {
          webdsService.touchcomm.writeDynamicConfig({
            ...configContext.dynamicConfig
          });
        } catch (error) {
          console.error(error);
          props.setAlert(ALERT_MESSAGE_WRITE_DYNAMIC_CONFIG);
        }
      }
      if (collecting !== undefined) {
        enableReport(false, REPORT_RAW);
        enableReport(false, REPORT_CLIP);
        removeEvent();
      }
    };
  }, []);

  return (
    <>
      {initialized && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              padding: '0px 16px',
              display: 'none',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Typography>Clip Margin:</Typography>
            <TextField
              variant="standard"
              value={clipMargin < 0 ? '' : clipMargin}
              inputProps={{ style: { textAlign: 'center' } }}
              onChange={event => {
                handleClipMarginChange(event.target.value);
              }}
              sx={{ width: '80px', marginLeft: '8px' }}
            />
            <Typography>&nbsp;%</Typography>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
              <div style={{ position: 'relative' }}>
                {clipChecking && (
                  <LinearProgress
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 0, 0, 0.12)',
                      '& .MuiLinearProgress-barColorPrimary': {
                        backgroundColor: 'custom.progress'
                      }
                    }}
                  />
                )}
                <Button
                  disabled={collecting !== undefined}
                  onClick={() => {
                    handleClipCheckButtonClick();
                  }}
                  sx={{
                    width: '125px',
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: clipChecking
                      ? theme.palette.primary.main
                      : 'rgba(0, 0, 0, 0)',
                    color: clipChecking ? 'black' : null,
                    backgroundColor: clipChecking ? 'transparent' : null,

                    '&:hover': {
                      backgroundColor: clipChecking ? 'transparent' : null
                    }
                  }}
                >
                  {clipChecking ? 'Checking...' : 'Clip Check'}
                </Button>
              </div>
            </div>
          </div>
          <List sx={{ marginTop: '0px', padding: '0px' }}>
            {generateCollectionList()}
          </List>
          <div
            style={{
              marginTop: '32px',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}
          >
            <DownloadButton
              tooltip={'Save Collection'}
              disabled={clipChecking || collecting !== undefined}
              onClick={() => handleSaveButtonClick()}
            />
            <UploadButton
              tooltip={'Load Collection'}
              disabled={clipChecking || collecting !== undefined}
              input={
                <input
                  hidden
                  type="file"
                  accept=".json"
                  onChange={handleLoadButtonClick}
                />
              }
            />
            <ResetButton
              tooltip={'Reset Collection'}
              disabled={clipChecking || collecting !== undefined}
              onClick={() => resetCollectedData()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Step3;
