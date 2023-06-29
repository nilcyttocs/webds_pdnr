import React, { useState } from 'react';

import { CarousalNavigation } from '../mui_extensions/Navigation';
import STEP5_1 from './STEP5_1';
import STEP5_2 from './STEP5_2';

export const Step5 = (props: any): JSX.Element => {
  const [step, setStep] = useState(1);

  const showStep = (): JSX.Element | null => {
    if (props.qfResults === undefined || props.mfResults === undefined) {
      return null;
    }
    switch (step) {
      case 1:
        return (
          <STEP5_1 qfResults={props.qfResults} mfResults={props.mfResults} />
        );
      case 2:
        return <STEP5_2 />;

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100% - 48px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {showStep()}
      <CarousalNavigation
        steps={2}
        disabled={
          props.qfResults === undefined || props.mfResults === undefined
        }
        onStepClick={(step: number) => setStep(step)}
        sx={{ position: 'absolute', bottom: 0 }}
      />
    </div>
  );
};

export default Step5;
