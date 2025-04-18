import { m } from '$lib/paraglide/messages';

export const tableData = [
  {
    pointValue: 0,
    complexity: m['dcom.complexity0'](),
    effort: m['dcom.effort0'](),
    uncertainty: m['dcom.uncertainty0']()
  },
  {
    pointValue: 0.5,
    complexity: m['dcom.complexity05'](),
    effort: m['dcom.effort05'](),
    uncertainty: m['dcom.uncertainty05']()
  },
  {
    pointValue: 1,
    complexity: m['dcom.complexity1'](),
    effort: m['dcom.effort1'](),
    uncertainty: m['dcom.uncertainty1']()
  },
  {
    pointValue: 2,
    complexity: m['dcom.complexity2'](),
    effort: m['dcom.effort2'](),
    uncertainty: m['dcom.uncertainty2']()
  },
  {
    pointValue: 3,
    complexity: m['dcom.complexity3'](),
    effort: m['dcom.effort3'](),
    uncertainty: m['dcom.uncertainty3']()
  },
  {
    pointValue: 5,
    complexity: m['dcom.complexity5'](),
    effort: m['dcom.effort5'](),
    uncertainty: m['dcom.uncertainty5']()
  },
  {
    pointValue: 8,
    complexity: m['dcom.complexity8'](),
    effort: m['dcom.effort8'](),
    uncertainty: m['dcom.uncertainty8']()
  },
  {
    pointValue: 13,
    complexity: m['dcom.complexity13'](),
    effort: m['dcom.effort13'](),
    uncertainty: m['dcom.uncertainty13']()
  },
  {
    pointValue: 20,
    complexity: m['dcom.complexity20'](),
    effort: m['dcom.effort20'](),
    uncertainty: m['dcom.uncertainty20']()
  },
  {
    pointValue: 40,
    complexity: m['dcom.complexity40'](),
    effort: m['dcom.effort40'](),
    uncertainty: m['dcom.uncertainty40']()
  },
  {
    pointValue: 100,
    complexity: m['dcom.complexity100'](),
    effort: m['dcom.effort100'](),
    uncertainty: m['dcom.uncertainty100']()
  }
];

export const pointsValues = tableData.map((item) => item.pointValue).sort((a, b) => a - b);
