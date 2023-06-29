import React, { useContext, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { postRequest, retrieveDataFileContent } from './PDNRComponent';
import {
  ALERT_MESSAGE_TUNING_CANCEL,
  ALERT_MESSAGE_TUNING_RESULTS,
  ALERT_MESSAGE_WRITE_TO_FLASH,
  ALERT_MESSAGE_WRITE_TO_RAM,
  CONTENT_HEIGHT,
  DataFile,
  EVENT_NAME,
  MF_CONFIG_PREFIX,
  QF_CONFIG_PREFIX,
  SSE_CLOSED,
  STEPPER_STEPS,
  SelectDataResults,
  TuneDataResults
} from './constants';
import {
  ConfigContext,
  ConfigContextData,
  webdsService
} from './local_exports';
import {
  BackButton,
  NextButton,
  ProgressButton
} from './mui_extensions/Buttons';
import { Canvas } from './mui_extensions/Canvas';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';
import { VerticalStepper } from './mui_extensions/Navigation';
import {
  CANVAS_ATTRS,
  ContentAttrs,
  getContentAttrs
} from './mui_extensions/constants';
import Step1 from './right_panel/Step1';
import Step2 from './right_panel/Step2';
import Step3 from './right_panel/Step3';
import Step4 from './right_panel/Step4';
import Step5 from './right_panel/Step5';

const contentAttrs: ContentAttrs = getContentAttrs(960);

let eventSource: EventSource | undefined = undefined;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const Landing = (props: any): JSX.Element => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [qfValid, setQFValid] = useState<boolean>();
  const [mfValid, setMFValid] = useState<boolean>();

  const theme = useTheme();

  const configContext: ConfigContextData = useContext(ConfigContext);

  const processing = progress !== undefined && progress < 100;

  const rearrangeResults = (results: SelectDataResults) => {
    const rearrange = (inputArray: any[]) => {
      const entries = Math.max(...inputArray.map(subArray => subArray.length));
      const outputArray: any[] = [];
      for (let i = 0; i < entries; i++) {
        outputArray.push([]);
        inputArray.forEach(input =>
          outputArray[i].push(input[i] !== undefined ? input[i] : '')
        );
      }
      return outputArray;
    };
    const selectionContent = results.results.selection[1];
    const metricContent = results.results.metric[1];
    results.results.selection[1] = rearrange(selectionContent);
    results.results.metric[1] = rearrange(metricContent);
    results.results.metric[0].unshift('');
    results.results.metric[1][0].unshift('Initial');
    results.results.metric[1][1].unshift('Final');
    return;
  };

  const eventHandler = async (event: any) => {
    const data = JSON.parse(event.data);
    if (data.state === 'running') {
      if (data.progress === 100) {
        setProgress(99.9);
        await sleep(500);
      } else {
        setProgress(data.progress);
      }
    } else if (data.state === 'completed') {
      eventSource!.removeEventListener(EVENT_NAME, eventHandler, false);
      eventSource!.close();
      eventSource = undefined;
      try {
        const results = await postRequest('getResults');
        if ('selection' in results.results) {
          rearrangeResults(results);
        }
        if (activeStep === 2) {
          props.setQFResults(results as TuneDataResults | SelectDataResults);
        } else if (activeStep === 4) {
          props.setMFResults(results as TuneDataResults | SelectDataResults);
        }
      } catch (error) {
        console.error(error);
        props.setAlert(ALERT_MESSAGE_TUNING_RESULTS);
      } finally {
        setProgress(100);
      }
    }
  };

  const removeEvent = () => {
    if (eventSource && eventSource.readyState !== SSE_CLOSED) {
      eventSource.removeEventListener(EVENT_NAME, eventHandler, false);
      eventSource.close();
      eventSource = undefined;
    }
  };

  const errorHandler = (error: any) => {
    removeEvent();
    console.error(`Error - GET /webds/tutor/event\n${error}`);
  };

  const addEvent = () => {
    if (eventSource) {
      return;
    }
    eventSource = new window.EventSource('/webds/tutor/event');
    eventSource.addEventListener(EVENT_NAME, eventHandler, false);
    eventSource.addEventListener('error', errorHandler, false);
  };

  const handleNextButtonClick = () => {
    setActiveStep(prevActiveStep => {
      setProgress(undefined);
      return prevActiveStep + 1;
    });
  };

  const handleBackButtonClick = () => {
    setActiveStep(prevActiveStep => {
      setProgress(undefined);
      return prevActiveStep - 1;
    });
  };

  const handleQFModeStartClick = async () => {
    const dataSet = [];
    for (let i = 0; i < props.qfSettings.dataFiles.length; i++) {
      const dataFile: DataFile = props.qfSettings.dataFiles[i];
      try {
        const fileContent = await retrieveDataFileContent(dataFile.file);
        fileContent.filename = dataFile.file.name;
        dataSet.push(fileContent);
      } catch (error) {
        props.setAlert(error);
      }
    }
    const args: any[] = [dataSet];
    if (props.qfSettings.strategy === 'selectData') {
      const subframes: string[] = Object.keys(
        props.qfSettings.subframes
      ).filter(subframe => props.qfSettings.subframes[subframe]);
      args.push(subframes);
      if (props.qfSettings.stride !== undefined) {
        args.push(props.qfSettings.stride);
      }
    }
    try {
      setProgress(0);
      addEvent();
      await postRequest(props.qfSettings.strategy, args);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to perform QF mode PDNR tuning');
      removeEvent();
      setProgress(undefined);
    }
  };

  const handleMFModeStartClick = async () => {
    const dataSet = [];
    for (let i = 0; i < props.mfSettings.dataFiles.length; i++) {
      const dataFile: DataFile = props.mfSettings.dataFiles[i];
      try {
        const fileContent = await retrieveDataFileContent(dataFile.file);
        fileContent.filename = dataFile.file.name;
        dataSet.push(fileContent);
      } catch (error) {
        props.setAlert(error);
      }
    }
    const args: any[] = [dataSet];
    if (props.mfSettings.strategy === 'selectData') {
      const subframes: string[] = Object.keys(
        props.mfSettings.subframes
      ).filter(subframe => props.mfSettings.subframes[subframe]);
      args.push(subframes);
      if (props.mfSettings.stride !== undefined) {
        args.push(props.mfSettings.stride);
      }
    }
    try {
      setProgress(0);
      addEvent();
      await postRequest(props.mfSettings.strategy, args);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to perform MF mode PDNR tuning');
      removeEvent();
      setProgress(undefined);
    }
  };

  const handleDoneButtonClick = () => {
    handleNextButtonClick();
  };

  const handleCancelButtonClick = async () => {
    setCancelling(true);
    try {
      await postRequest('cancel');
      eventSource!.removeEventListener(EVENT_NAME, eventHandler, false);
      eventSource!.close();
      eventSource = undefined;
    } catch (error) {
      console.error(error);
      props.setAlert(ALERT_MESSAGE_TUNING_CANCEL);
    }
    setCancelling(false);
    setProgress(undefined);
  };

  const handleWriteConfigButtonClick = async (commit: boolean) => {
    const entries: any = {};
    Object.entries(props.qfResults.params).forEach(([key, value]) => {
      const entry = QF_CONFIG_PREFIX + key;
      if (entry in configContext.staticConfig) {
        if (Array.isArray(value) && value.every(Array.isArray)) {
          value = value.reduce((prev, curr) => prev.concat(curr), []);
        }
        if (key === 'basisVectorsAbsTx' && Array.isArray(value)) {
          if (value.length < 80) {
            value = value.concat(Array(80 - value.length).fill(0));
          }
        }
        entries[entry] = value;
      }
    });
    Object.entries(props.mfResults.params).forEach(([key, value]) => {
      const entry = MF_CONFIG_PREFIX + key;
      if (entry in configContext.staticConfig) {
        if (Array.isArray(value) && value.every(Array.isArray)) {
          value = value.reduce((prev, curr) => prev.concat(curr), []);
        }
        if (key === 'basisVectorsAbsTx' && Array.isArray(value)) {
          value = value.concat(Array(8).fill(0));
        }
        entries[entry] = value;
      }
    });
    try {
      await webdsService.touchcomm.writeStaticConfig(entries, commit);
    } catch (error) {
      console.error(error);
      props.setAlert(
        commit ? ALERT_MESSAGE_WRITE_TO_FLASH : ALERT_MESSAGE_WRITE_TO_RAM
      );
    }
  };

  const rightPanel: (JSX.Element | null)[] = [
    <Step1 setAlert={props.setAlert} />,
    <Step2
      setAlert={props.setAlert}
      tuningSettings={props.qfSettings}
      setTuningSettings={props.setQFSettings}
      results={props.qfResults}
      setResults={props.setQFResults}
    />,
    <Step3 setAlert={props.setAlert} />,
    <Step4
      setAlert={props.setAlert}
      tuningSettings={props.mfSettings}
      setTuningSettings={props.setMFSettings}
      results={props.mfResults}
      setResults={props.setMFResults}
    />,
    <Step5
      setAlert={props.setAlert}
      qfResults={props.qfResults}
      mfResults={props.mfResults}
    />
  ];

  const steps = [
    {
      label: STEPPER_STEPS['1'].label,
      content: (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2">{STEPPER_STEPS['1'].content}</Typography>
        </div>
      )
    },
    {
      label: STEPPER_STEPS['2'].label,
      content: (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: qfValid
                ? theme.palette.text.primary
                : theme.palette.text.disabled
            }}
          >
            {STEPPER_STEPS['2'].content}
          </Typography>
          <ProgressButton
            progress={progress}
            disabled={!qfValid || cancelling}
            onClick={() => {
              handleQFModeStartClick();
            }}
            onDoneClick={() => {
              handleDoneButtonClick();
            }}
            onResetClick={() => {
              setProgress(undefined);
            }}
            onCancelClick={() => {
              handleCancelButtonClick();
            }}
            sx={{ margin: '16px 0px' }}
          >
            Start
          </ProgressButton>
          {props.qfSettings.dataFiles.length === 0 ? (
            <Typography variant="body2" color="red">
              {STEPPER_STEPS['2'].alertFile}
            </Typography>
          ) : (
            !qfValid && (
              <Typography variant="body2" color="red">
                {STEPPER_STEPS['2'].alertSubframe}
              </Typography>
            )
          )}
        </div>
      )
    },
    {
      label: STEPPER_STEPS['3'].label,
      content: (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2">{STEPPER_STEPS['3'].content}</Typography>
        </div>
      )
    },
    {
      label: STEPPER_STEPS['4'].label,
      content: (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: mfValid
                ? theme.palette.text.primary
                : theme.palette.text.disabled
            }}
          >
            {STEPPER_STEPS['4'].content}
          </Typography>
          <ProgressButton
            progress={progress}
            disabled={!mfValid || cancelling}
            onClick={() => {
              handleMFModeStartClick();
            }}
            onDoneClick={() => {
              handleDoneButtonClick();
            }}
            onResetClick={() => {
              setProgress(undefined);
            }}
            onCancelClick={() => {
              handleCancelButtonClick();
            }}
            sx={{ margin: '16px 0px' }}
          >
            Start
          </ProgressButton>
          {props.mfSettings.dataFiles.length === 0 ? (
            <Typography variant="body2" color="red">
              {STEPPER_STEPS['4'].alertFile}
            </Typography>
          ) : (
            !mfValid && (
              <Typography variant="body2" color="red">
                {STEPPER_STEPS['4'].alertSubframe}
              </Typography>
            )
          )}
        </div>
      )
    },
    {
      label: STEPPER_STEPS['5'].label,
      content: (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color:
                props.qfResults === undefined || props.mfResults === undefined
                  ? theme.palette.text.disabled
                  : theme.palette.text.primary
            }}
          >
            {STEPPER_STEPS['5'].content}
          </Typography>
          <div
            style={{
              margin: '16px 0px',
              display: 'flex',
              flexDirection: 'row',
              gap: '16px'
            }}
          >
            <Button
              disabled={
                props.qfResults === undefined || props.mfResults === undefined
              }
              onClick={() => handleWriteConfigButtonClick(false)}
              sx={{ width: '125px' }}
            >
              Write to RAM
            </Button>
            <Button
              disabled={
                props.qfResults === undefined || props.mfResults === undefined
              }
              onClick={() => handleWriteConfigButtonClick(true)}
              sx={{ width: '125px' }}
            >
              Write to Flash
            </Button>
          </div>
          {(props.qfResults === undefined || props.mfResults === undefined) && (
            <Typography variant="body2" color="red">
              {STEPPER_STEPS['5'].alert}
            </Typography>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    setQFValid(
      !(
        props.qfSettings.dataFiles.length === 0 ||
        (props.qfSettings.strategy === 'selectData' &&
          Object.entries(props.qfSettings.subframes).every(
            ([subframe, selected]) => !selected
          ))
      )
    );
    setMFValid(
      !(
        props.mfSettings.dataFiles.length === 0 ||
        (props.mfSettings.strategy === 'selectData' &&
          Object.entries(props.mfSettings.subframes).every(
            ([subframe, selected]) => !selected
          ))
      )
    );
  }, [props.qfSettings, props.mfSettings]);

  useEffect(() => {
    return () => {
      removeEvent();
    };
  }, []);

  return (
    <Canvas title="PDNR" sx={{ width: '960px' }}>
      <Content sx={{ minHeight: CONTENT_HEIGHT + 'px' }}>
        <Stack
          spacing={contentAttrs.PANEL_SPACING}
          direction="row"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                height: CONTENT_HEIGHT - CANVAS_ATTRS.PADDING * 2 + 'px'
              }}
            />
          }
        >
          <div
            style={{
              width: contentAttrs.PANEL_WIDTH + 'px',
              height: CONTENT_HEIGHT - CANVAS_ATTRS.PADDING * 2 + 'px',
              position: 'relative'
            }}
          >
            <VerticalStepper
              steps={steps}
              strict={processing}
              activeStep={activeStep}
              onStepClick={clickedStep => {
                setProgress(undefined);
                setActiveStep(clickedStep);
              }}
            />
          </div>
          <div
            style={{
              width: contentAttrs.PANEL_WIDTH + 'px',
              height: CONTENT_HEIGHT - CANVAS_ATTRS.PADDING * 2 + 'px',
              position: 'relative'
            }}
          >
            {rightPanel[activeStep - 1]}
          </div>
        </Stack>
      </Content>
      <Controls
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <BackButton
          disabled={activeStep === 1 || processing}
          onClick={() => handleBackButtonClick()}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '24px',
            transform: 'translate(0%, -50%)'
          }}
        />
        <NextButton
          disabled={activeStep === steps.length || processing}
          onClick={() => handleNextButtonClick()}
          sx={{
            position: 'absolute',
            top: '50%',
            right: '24px',
            transform: 'translate(0%, -50%)'
          }}
        />
      </Controls>
    </Canvas>
  );
};

export default Landing;
