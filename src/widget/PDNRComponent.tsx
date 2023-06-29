import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';

import Landing from './Landing';
import {
  ALERT_MESSAGE_READ_DYNAMIC_CONFIG,
  ALERT_MESSAGE_READ_STATIC_CONFIG,
  SelectDataResults,
  TuneDataResults,
  TuningSettings
} from './constants';
import { requestAPI, webdsService } from './local_exports';

let staticConfig: any;
let dynamicConfig: any;

export type ConfigContextData = {
  staticConfig: any;
  dynamicConfig: any;
};

export const ConfigContext = React.createContext({} as ConfigContextData);

const reader = new FileReader();

export const retrieveDataFileContent = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    reader.onload = function (event) {
      if (event.target !== null) {
        const result = event.target.result as string;
        let fileContent: any;
        try {
          fileContent = JSON.parse(result);
          if (
            !fileContent.metadata ||
            !fileContent.collections ||
            fileContent.collections.length === 0
          ) {
            reject('Invalid JSON data content.');
          }
        } catch (error) {
          console.error(error);
          reject('Invalid file content.');
        }
        resolve(fileContent);
      }
    };
    reader.onerror = function (event) {
      if (event.target !== null) {
        console.error(event.target.error);
        reject('Failed to read file content.');
      }
    };
    reader.readAsText(file);
  });
};

export const postRequest = async (request: string, args?: any[]) => {
  const dataToSend: any = {
    request
  };
  if (args) {
    dataToSend['arguments'] = args;
  }
  try {
    const response = await requestAPI<any>('tutor/PDNR', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const PDNRComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const [qfSettings, setQFSettings] = useState<TuningSettings>({
    strategy: 'tuneData',
    subframes: {
      trans: true,
      absRx: true,
      absTx: true
    },
    stride: 1,
    dataFiles: []
  });
  const [qfResults, setQFResults] = useState<
    TuneDataResults | SelectDataResults
  >();
  const [mfSettings, setMFSettings] = useState<TuningSettings>({
    strategy: 'tuneData',
    subframes: {
      trans: true,
      absRx: true,
      absTx: true
    },
    stride: 1,
    dataFiles: []
  });
  const [mfResults, setMFResults] = useState<
    TuneDataResults | SelectDataResults
  >();

  const webdsTheme = webdsService.ui.getWebDSTheme();

  useEffect(() => {
    const initialize = async () => {
      try {
        staticConfig = await webdsService.touchcomm.readStaticConfig();
      } catch (error) {
        console.error(error);
        setAlert(ALERT_MESSAGE_READ_STATIC_CONFIG);
      }
      try {
        dynamicConfig = await webdsService.touchcomm.readDynamicConfig();
      } catch (error) {
        console.error(error);
        setAlert(ALERT_MESSAGE_READ_DYNAMIC_CONFIG);
      }
      setInitialized(true);
    };
    initialize();
  }, []);

  return (
    <>
      <ThemeProvider theme={webdsTheme}>
        <div className="jp-webds-widget-body">
          {alert !== undefined && (
            <Alert
              severity="error"
              onClose={() => setAlert(undefined)}
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {alert}
            </Alert>
          )}
          {initialized && (
            <ConfigContext.Provider
              value={{
                staticConfig: staticConfig,
                dynamicConfig: dynamicConfig
              }}
            >
              <Landing
                setAlert={setAlert}
                qfSettings={qfSettings}
                setQFSettings={setQFSettings}
                qfResults={qfResults}
                setQFResults={setQFResults}
                mfSettings={mfSettings}
                setMFSettings={setMFSettings}
                mfResults={mfResults}
                setMFResults={setMFResults}
              />
            </ConfigContext.Provider>
          )}
        </div>
        {!initialized && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CircularProgress color="primary" />
          </div>
        )}
      </ThemeProvider>
    </>
  );
};

export default PDNRComponent;
