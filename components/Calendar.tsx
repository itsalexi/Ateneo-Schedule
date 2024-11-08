/* eslint-disable @typescript-eslint/no-unused-vars */
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { isTimeInRange, parseTimeRange } from '@/lib/helper';

import CourseSearch from './CourseSearch';
import { Button } from './ui/button';

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
  const [selectedCourse, setSelectedCourse] = useState<ScheduleBlock | null>(
    null
  );
  console.log(selectedCourse);
  const colorCodes: { [key: string]: string } = {
    ACCT: '#d0e3c1',
    ANTH: '#bdb0e8',
    ARTM: '#eca79f',
    ARTS: '#d4e6c4',
    ATMOS: '#d3c8ba',
    ArtAp: '#eb8b88',
    BIO: '#b5f5f4',
    CEPP: '#eff88f',
    CHEM: '#c3ffb4',
    CHEMED: '#c2b298',
    COMM: '#b7d3ff',
    CPA: '#bbbef9',
    CRWR: '#efdade',
    CSCI: '#f6829c',
    CSP: '#e5e2f4',
    DECSC: '#95d9b9',
    DECSCI: '#b1f0f3',
    DEV: '#dff6ef',
    DIRR: '#bdd2fe',
    DLQ: '#e1dbe5',
    ECON: '#c799ed',
    EDUC: '#cec2e5',
    ELM: '#f2c8d2',
    ENE: '#b2fdd5',
    ENGG: '#dfe6c2',
    ENGL: '#d0cfec',
    ENLIT: '#f5f6a7',
    ENVI: '#8ab2f4',
    EURO: '#fdb5f6',
    FIL: '#fcf8f3',
    FILI: '#e185b4',
    FINN: '#c08af0',
    FRE: '#bdc18c',
    GDEV: '#99c881',
    GER: '#8bed8b',
    HISTO: '#bcc891',
    HSCI: '#e09587',
    HUMAN: '#d1b5b3',
    IDES: '#82c5e9',
    IDS: '#a1bcdd',
    INTACT: '#b38e97',
    ISCS: '#c7c6cd',
    ITA: '#bea4fb',
    ITENT: '#b3c383',
    ITMGT: '#cf8589',
    JPN: '#b98787',
    KOR: '#84f0b2',
    KRN: '#b2f7f2',
    LAS: '#f8fad4',
    LEAD: '#ecd1d8',
    LLAW: '#e6ede0',
    MATH: '#b2ab8c',
    MATSE: '#80a0b9',
    MEM: '#8bbfd4',
    MKTG: '#edb4aa',
    MSYS: '#f080f5',
    MTHED: '#dd8888',
    NSTP: '#a7e3a6',
    OPMAN: '#9db8ec',
    PEPC: '#b2f9ca',
    PHILO: '#9c9fe4',
    PHYED: '#d5fc7f',
    PHYS: '#e6b6fb',
    PHYSE: '#e8a9e8',
    PNTKN: '#b4cbfc',
    POLSC: '#a9f6b0',
    PORT: '#a29d7f',
    PSYC: '#8fa1b4',
    QUANT: '#81e4a2',
    RE: '#d6fb94',
    RELED: '#f1a9c0',
    RUSS: '#9ec7f7',
    SCIED: '#b1c3d0',
    SEAS: '#c6efe8',
    SOAN: '#afc2bd',
    SOCDV: '#eaa2bb',
    SOCIO: '#fceaf0',
    SOMGT: '#e2a9bc',
    SPA: '#d4a48e',
    STS: '#e58592',
    SocSc: '#efde84',
    THEO: '#fe9994',
    THTR: '#a3f0fa',
  };

  function calculateTimeSlots(startTime: number, endTime: number): number {
    const toMinutes = (time: number) => {
      const hours = Math.floor(time / 100);
      const minutes = time % 100;
      return hours * 60 + minutes;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    const duration = endMinutes - startMinutes;

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
        const overlapDays = scheduledDays?.has(day);
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
          const noOverlap = !isOverlapping(course, dayIndex);
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
                      style={{
                        backgroundColor: scheduleBlock
                          ? colorCodes[
                              scheduleBlock.course.catNo.split(
                                ' '
                              )[0] as keyof typeof colorCodes
                            ]
                          : '',
                      }}
                      onClick={() => {
                        if (scheduleBlock) {
                          setSelectedCourse(scheduleBlock);
                        } else {
                          setSelectedCourse(null);
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
          <DialogContent
            className={`${
              selectedCourse === null ? 'min-w-[90vw]' : 'w-full'
            } max-h-[90vh] overflow-y-auto`}
          >
            {selectedCourse === null ? (
              <CourseSearch
                toggleCourse={toggleCourse}
                courses={eligibleCourses}
                setDialog={setIsDialogOpen}
                setFilter={setFilter}
              />
            ) : (
              <div>
                <DialogHeader>
                  <DialogTitle>
                    {selectedCourse.course.catNo} ({selectedCourse.course.time})
                  </DialogTitle>
                </DialogHeader>
                <p></p>
                <div>{selectedCourse.course.courseTitle}</div>
                <br />

                <div>
                  <strong>Instructor</strong>:{' '}
                  {selectedCourse.course.instructor}
                </div>
                <div>
                  <strong>Remarks</strong>: {selectedCourse.course.remarks}
                </div>

                <Button
                  onClick={() => {
                    toggleCourse(selectedCourse.course);
                    setIsDialogOpen(false);
                  }}
                >
                  Remove Class
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CardContent>
  );
}
