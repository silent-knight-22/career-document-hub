import React from 'react';
import RedFlagsAndRisks from './insights/RedFlagsAndRisks';
import ObligationsAndRules from './insights/ObligationsAndRules';
import DatesAndFinances from './insights/DatesAndFinances';

export default function InsightsTab({ analysis }) {
  return (
    <div className="ai-tab-content">
      <RedFlagsAndRisks analysis={analysis} />
      <ObligationsAndRules analysis={analysis} />
      <DatesAndFinances analysis={analysis} />
    </div>
  );
}
