import { m } from '$lib/paraglide/messages';

const context = {
  context: 'dcom'
};

export const tableData = [
  {
    pointValue: 0,
    complexity: m.complexity0(context),
    effort: m['dcom.effort0'](),
    uncertainty: m['dcom.uncertainty0']()
  },
  {
    pointValue: 0.5,
    complexity: m.complexity05(context),
    effort: m['dcom.effort05'](),
    uncertainty: m['dcom.uncertainty05']()
  },
  {
    pointValue: 1,
    complexity: m.complexity1(context),
    effort: m['dcom.effort1'](),
    uncertainty: m['dcom.uncertainty1']()
  },
  {
    pointValue: 2,
    complexity: m.complexity2(context),
    effort: m['dcom.effort2'](),
    uncertainty: m['dcom.uncertainty2']()
  },
  {
    pointValue: 3,
    complexity: m.complexity3(context),
    effort: m['dcom.effort3'](),
    uncertainty: m['dcom.uncertainty3']()
  },
  {
    pointValue: 5,
    complexity: m.complexity5(context),
    effort: m['dcom.effort5'](),
    uncertainty: m['dcom.uncertainty5']()
  },
  {
    pointValue: 8,
    complexity: m.complexity8(context),
    effort: m['dcom.effort8'](),
    uncertainty: m['dcom.uncertainty8']()
  },
  {
    pointValue: 13,
    complexity: m.complexity13(context),
    effort: m['dcom.effort13'](),
    uncertainty: m['dcom.uncertainty13']()
  },
  {
    pointValue: 20,
    complexity: m.complexity20(context),
    effort: m['dcom.effort20'](),
    uncertainty: m['dcom.uncertainty20']()
  },
  {
    pointValue: 40,
    complexity: m.complexity40(context),
    effort: m['dcom.effort40'](),
    uncertainty: m['dcom.uncertainty40']()
  },
  {
    pointValue: 100,
    complexity: m.complexity100(context),
    effort: m['dcom.effort100'](),
    uncertainty: m['dcom.uncertainty100']()
  }
];

export const pointsValues: number[] = tableData.map((item) => item.pointValue).sort((a, b) => a - b);
