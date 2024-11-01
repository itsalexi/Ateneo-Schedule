'use client';

import React, { useMemo, useState } from 'react';
import { CardContent } from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import { isTimeInRange, parseTimeRange } from '@/lib/helper';

import CourseSearch from './CourseSearch';

const timeSlots = Array.from({ length: 29 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function formatTime(time: string, use24Hour: boolean): string {
  const [startHours, startMinutes] = time.split(':').map(Number);
  let endHours = startHours;
  let endMinutes = startMinutes + 30;

  if (endMinutes >= 60) {
    endMinutes -= 60;
    endHours += 1;
  }

  const format = (hours: number, minutes: number) => {
    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const adjustedHours = hours % 12 || 12;
      return `${adjustedHours}:${minutes
        .toString()
        .padStart(2, '0')} ${period}`;
    }
  };

  const startTimeFormatted = format(startHours, startMinutes);
  const endTimeFormatted = format(endHours, endMinutes);

  return `${startTimeFormatted}-${endTimeFormatted}`;
}

export default function Calendar({
  selectedCourses,
  use24Hour,
  setSelectedSlot,
  eligibleCourses,
  allCourses,
  toggleCourse,
  setFilter,
  filter,
}: {
  selectedCourses: Course[];
  eligibleCourses: Course[];
  allCourses: Course[];
  use24Hour: boolean;
  setSelectedSlot: ({ day, time }: { day: number; time: string }) => void;
  toggleCourse: (course: Course) => void;
  setFilter: (course: string) => void;
  filter: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ScheduleBlock>([]);

  function calculateTimeSlots(startTime: number, endTime: number): number {
    const toMinutes = (time: number) => {
      const hours = Math.floor(time / 100);
      const minutes = time % 100;
      return hours * 60 + minutes;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    const duration = endMinutes - startMinutes;

    console.log(duration);
    return Math.ceil(duration / 30);
  }

  const schedule = useMemo(() => {
    const scheduleMap = new Map<number, Map<string, ScheduleBlock>>();

    selectedCourses.forEach((course) => {
      const { days, startTime, endTime } = parseTimeRange(course.time);
      const timeSlotCount = calculateTimeSlots(startTime, endTime);
      days.forEach((day) => {
        if (!scheduleMap.has(day)) {
          scheduleMap.set(day, new Map());
        }
        const daySchedule = scheduleMap.get(day)!;

        let time = startTime;
        let isFirst = true;
        while (time < endTime) {
          const hour = Math.floor(time / 100);
          const minute = time % 100;
          const formattedTime = `${String(hour).padStart(2, '0')}:${String(
            minute
          ).padStart(2, '0')}`;

          if (isFirst) {
            daySchedule.set(formattedTime, {
              course,
              rowspan: timeSlotCount,
              isStart: true,
            });
            isFirst = false;
          } else {
            daySchedule.set(formattedTime, {
              course,
              rowspan: timeSlotCount,
              isStart: false,
            });
          }

          time += 30;
          if (minute + 30 >= 60) {
            time = (hour + 1) * 100 + (minute + 30 - 60);
          }
        }
      });
    });

    return scheduleMap;
  }, [selectedCourses]);

  const coursesPerSlot = useMemo(() => {
    if (filter === '') return new Map<string, ScheduleBlock[]>();

    const precomputedCourses = allCourses.map((course) => {
      const { days, startTime, endTime } = parseTimeRange(course.time);
      return {
        ...course,
        daysSet: new Set(days),
        startTime,
        endTime,
      };
    });

    const isOverlapping = (
      course: { startTime: number; endTime: number },
      day: number
    ) => {
      const { startTime, endTime } = course;
      return selectedCourses.some((scheduledCourse) => {
        const {
          daysSet: scheduledDays,
          startTime: scheduledStartTime,
          endTime: scheduledEndTime,
        } = scheduledCourse as Course & {
          daysSet: Set<number>;
          startTime: number;
          endTime: number;
        };
        const overlapDays = scheduledDays.has(day);
        const overlapTimes =
          startTime < scheduledEndTime && endTime > scheduledStartTime;
        return overlapDays && overlapTimes;
      });
    };

    const slots = new Map<string, Course[]>();

    days.forEach((day, dayIndex) => {
      timeSlots.forEach((time) => {
        const slotKey = `${dayIndex}-${time}`;
        const coursesInSlot = precomputedCourses.filter((course) => {
          const { daysSet, startTime, endTime } = course;
          const matchesSlot =
            daysSet.has(dayIndex) && isTimeInRange(time, startTime, endTime);
          const matchesFilter = filter
            ? course.catNo.toLowerCase().includes(filter.toLowerCase())
            : true;
          const noOverlap = !isOverlapping(course, dayIndex, time);
          return matchesSlot && matchesFilter && noOverlap;
        });
        slots.set(slotKey, coursesInSlot);
      });
    });

    return slots;
  }, [allCourses, filter, selectedCourses]);
  return (
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 bg-muted">Time</TableHead>
              {days.map((day) => (
                <TableHead key={day} className="text-center bg-muted">
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((time) => (
              <TableRow key={time} className="h-12">
                <TableCell className="font-medium bg-muted">
                  {formatTime(time, use24Hour)}
                </TableCell>
                {days.map((day, index) => {
                  const scheduleBlock = schedule.get(index)?.get(time);

                  if (scheduleBlock && !scheduleBlock.isStart) {
                    return null;
                  }

                  return (
                    <TableCell
                      key={`${day}-${time}`}
                      className={`p-0 relative cursor-pointer hover:bg-accent transition-colors ${
                        scheduleBlock ? 'bg-primary/10' : ''
                      }`}
                      rowSpan={scheduleBlock?.rowspan}
                      onClick={() => {
                        if (scheduleBlock) {
                          setSelectedCourse(scheduleBlock);
                        }
                        setIsDialogOpen(true);
                        setSelectedSlot({ day: index, time });
                      }}
                    >
                      {!scheduleBlock &&
                        filter &&
                        (coursesPerSlot.get(`${index}-${time}`)?.length ?? 0) >
                          0 && (
                          <div className="absolute inset-0 flex items-center justify-center p-1 bg-green-400"></div>
                        )}
                      {!scheduleBlock &&
                        filter &&
                        (coursesPerSlot.get(`${index}-${time}`)?.length ??
                          0) === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center p-1 bg-gray-200"></div>
                        )}
                      {scheduleBlock && (
                        <div className="absolute inset-0 border-l-4 border-primary flex flex-col items-center justify-center p-1">
                          <span className="text-xs font-semibold text-primary">
                            {scheduleBlock.course.catNo}
                          </span>
                          <span className="text-xs text-primary/80">
                            {scheduleBlock.course.time}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <CourseSearch
            toggleCourse={toggleCourse}
            courses={eligibleCourses}
            setDialog={setIsDialogOpen}
            setFilter={setFilter}
          />
        </Dialog>
      </div>
    </CardContent>
  );
}
