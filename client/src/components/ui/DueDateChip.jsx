import React from 'react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar } from 'lucide-react';

const DueDateChip = ({ date, completed }) => {
  if (!date) return null;
  const d = new Date(date);
  const overdue = isPast(d) && !completed;
  const today = isToday(d);
  const tomorrow = isTomorrow(d);

  let label = format(d, 'MMM d');
  if (today) label = 'Today';
  if (tomorrow) label = 'Tomorrow';

  return (
    <span className={`due-chip ${overdue ? 'overdue' : today ? 'today' : ''}`}>
      <Calendar size={11} />
      {label}
    </span>
  );
};

export default DueDateChip;
