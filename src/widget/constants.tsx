import { TouchcommADCReport } from '@webds/service';

export const ALERT_MESSAGE_READ_STATIC_CONFIG =
  'Failed to read static config from device.';

export const ALERT_MESSAGE_READ_DYNAMIC_CONFIG =
  'Failed to read dynamic config from device.';

export const ALERT_MESSAGE_WRITE_DYNAMIC_CONFIG =
  'Failed to write dynamic config to device.';

export const ALERT_MESSAGE_WRITE_TO_RAM =
  'Failed to write config params to RAM';

export const ALERT_MESSAGE_WRITE_TO_FLASH =
  'Failed to write config params to flash';

export const ALERT_MESSAGE_LOAD_COLLECTION =
  'Failed to load collection (mismatching number of gears).';

export const ALERT_MESSAGE_ENABLE_REPORT =
  'Failed to enable raw report for data collection.';

export const ALERT_MESSAGE_DISABLE_REPORT = 'Failed to disable raw report.';

export const ALERT_MESSAGE_TUNING_RESULTS = 'Failed to obtain tuning results.';

export const ALERT_MESSAGE_TUNING_CANCEL = ' Failed to cancel tuning process.';

export const STEPPER_STEPS = {
  1: {
    label: 'QF Mode Data Collection',
    content: `Use right panel to collect QF mode data. It is recommended to cycle through different display patterns at each frequency while collecting data.`
  },
  2: {
    label: 'QF Mode Tuning',
    content: `Click "Start" button to perform QF mode PDNR tuning using settings provided in right panel.`,
    alertFile: `Please select at least one data file in right panel to use for PDNR tuning.`,
    alertSubframe: `Please select at least one subframe type to use for PDNR tuning.`
  },
  3: {
    label: 'MF Mode Data Collection',
    content: `Use right panel to collect MF mode data. It is recommended to cycle through different display patterns at each frequency while collecting data.`
  },
  4: {
    label: 'MF Mode Tuning',
    content: `Click "Start" button to perform MF mode PDNR tuning using settings provided in right panel.`,
    alertFile: `Please select at least one data file in right panel to use for PDNR tuning.`,
    alertSubframe: `Please select at least one subframe type to use for PDNR tuning.`
  },
  5: {
    label: 'Apply Changes',
    content: `Use right panel to verify tuning results. Write config params to RAM for temporary usage or flash for persistent usage.`,
    alert: `Please carry out both QF mode and MF mode tuning steps to complete tuning first.`
  }
};

export type ClipData = {
  abs: TouchcommADCReport[];
  transcap: [number, number[]][];
};

export type Subframes = {
  trans: boolean;
  absRx: boolean;
  absTx: boolean;
};

export type DataFile = {
  id: string;
  file: File;
  gears: number;
  frames: number;
};

export type TuningSettings = {
  strategy: string;
  subframes: Subframes;
  stride: number | undefined;
  dataFiles: DataFile[];
};

export type TuneDataLabels = string[];
export type TuneDataContent = [string, string, ...number[]];
export type TuneDataResults = {
  results: [TuneDataLabels, ...TuneDataContent[]];
};

export type SelectDataLabels = string[];
export type SelectDataSelectionContent = [...string[]];
export type SelectDataMetricContent = [...(string | number)[]];
export type SelectDataResults = {
  results: {
    selection: [SelectDataLabels, [...SelectDataSelectionContent[]]];
    metric: [SelectDataLabels, [...SelectDataMetricContent[]]];
  };
};

export const SSE_CLOSED = 2;
export const REPORT_RAW = 19;
export const REPORT_CLIP = 31;
export const EVENT_NAME = 'PDNR';

export const CONTENT_HEIGHT = 560;

export const FILE_NAME_WIDTH = 224;
export const GEARS_FRAMES_WIDTH = 56;

export const QF_DATA_FILE_NAME = 'QF_data.json';
export const MF_DATA_FILE_NAME = 'MF_data.json';

export const QF_CONFIG_PREFIX = 'ifpConfig.pdnrConfigs[0].';
export const MF_CONFIG_PREFIX = 'ifpConfig.pdnrConfigs[1].';
