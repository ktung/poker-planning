export const tableData = [
  {
    pointValue: 0,
    complexity: 'No idea',
    effort: 'No idea',
    uncertainty: 'No idea'
  },
  {
    pointValue: 0.5,
    complexity: 'Single straightforward task',
    effort: '< 2h',
    uncertainty: 'Clear requirements & solution'
  },
  {
    pointValue: 1,
    complexity: 'Simple task with known solution',
    effort: '2h-4h',
    uncertainty: 'Minor clarifications needed'
  },
  {
    pointValue: 2,
    complexity: 'Multiple simple tasks',
    effort: '4-8 hours',
    uncertainty: 'Some unknowns exist'
  },
  {
    pointValue: 3,
    complexity: 'Multiple interconnected tasks',
    effort: '1-2 days',
    uncertainty: 'Several unknowns'
  },
  {
    pointValue: 5,
    complexity: 'Complex problem, clear approach',
    effort: '2-3 days',
    uncertainty: 'Significant unknowns'
  },
  {
    pointValue: 8,
    complexity: 'Complex problem, multiple approaches',
    effort: '2h-4h',
    uncertainty: 'Many dependencies'
  },
  {
    pointValue: 13,
    complexity: 'System-wide changes needed',
    effort: '3-5 days',
    uncertainty: 'Technical feasibility unclear'
  },
  {
    pointValue: 20,
    complexity: 'Multiple system interactions',
    effort: '1-2 weeks',
    uncertainty: 'High risk areas identified'
  },
  {
    pointValue: 40,
    complexity: 'Architectural changes required',
    effort: '3-4 weeks',
    uncertainty: 'Major unknown dependencies'
  },
  {
    pointValue: 100,
    complexity: 'Too complex to estimate',
    effort: '> 1 month',
    uncertainty: 'Cannot estimate confidently'
  }
];

export const pointsValues = tableData.map((item) => item.pointValue).sort((a, b) => a - b);
