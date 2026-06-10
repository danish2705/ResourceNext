export interface TimelineMonth {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

export const timelineMonths: TimelineMonth[] = [
  {
    key: '2027-01',
    label: 'Jan 2027',
    start: new Date('2027-01-01'),
    end: new Date('2027-01-31'),
  },
  {
    key: '2027-02',
    label: 'Feb 2027',
    start: new Date('2027-02-01'),
    end: new Date('2027-02-28'),
  },
  {
    key: '2027-03',
    label: 'Mar 2027',
    start: new Date('2027-03-01'),
    end: new Date('2027-03-31'),
  },
  {
    key: '2027-04',
    label: 'Apr 2027',
    start: new Date('2027-04-01'),
    end: new Date('2027-04-30'),
  },
  {
    key: '2027-05',
    label: 'May 2027',
    start: new Date('2027-05-01'),
    end: new Date('2027-05-31'),
  },
  {
    key: '2027-06',
    label: 'Jun 2027',
    start: new Date('2027-06-01'),
    end: new Date('2027-06-30'),
  },
];

export const isAllocationActiveInMonth = (
  allocationStart: string,
  allocationEnd: string,
  monthStart: Date,
  monthEnd: Date
) => {
  const start = new Date(allocationStart);
  const end = new Date(allocationEnd);

  return start <= monthEnd && end >= monthStart;
};

export const getMonthlyAllocation = (
  allocationStart: string,
  allocationEnd: string,
  allocationPercent: number,
  monthStart: Date,
  monthEnd: Date
) => {
  const isActive = isAllocationActiveInMonth(
    allocationStart,
    allocationEnd,
    monthStart,
    monthEnd
  );

  return isActive ? allocationPercent : 0;
};