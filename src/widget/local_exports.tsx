import React from 'react';

import { TouchcommADCReport } from '@webds/service';

export { requestAPI, webdsService } from '../local_exports';
export { ConfigContext, ConfigContextData } from './PDNRComponent';

export const ADCDataContext = React.createContext([] as TouchcommADCReport[]);
