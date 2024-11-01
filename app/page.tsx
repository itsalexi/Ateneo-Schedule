'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

import Calendar from '@/components/Calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { parseTimeRange, isTimeInRange } from '@/lib/helper';
import ProgramSelector from '@/components/ProgramSelector';
import CourseFilterPanel from '@/components/CourseFilterPanel';

export default function Home() {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [use24Hour, setUse24Hour] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    time: string;
  } | null>(null);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<Curriculum | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const data = (await fetch(`/api/courses`)).json();
      setCourses(await data);
    };
    fetchCourses();
  }, []);

  const toggleCourseSelection = (course: Course) => {
    setSelectedCourses((prev) =>
      prev.some((c) => c.catNo === course.catNo)
        ? prev.filter((c) => c.catNo !== course.catNo)
        : [...prev, course]
    );
  };

  const eligibleCourses = useMemo(() => {
    if (!selectedSlot) return [];

    const isOverlapping = (course: Course) => {
      const { days, startTime, endTime } = parseTimeRange(course.time);
      return selectedCourses.some((scheduledCourse) => {
        const {
          days: scheduledDays,
          startTime: scheduledStartTime,
          endTime: scheduledEndTime,
        } = parseTimeRange(scheduledCourse.time);
        const overlapDays = days.some((day) => scheduledDays.includes(day));
        const overlapTimes =
          startTime < scheduledEndTime && endTime > scheduledStartTime;
        return overlapDays && overlapTimes;
      });
    };

    return courses.filter((course) => {
      const { days, startTime, endTime } = parseTimeRange(course.time);
      const matchesSlot =
        days.includes(selectedSlot.day) &&
        isTimeInRange(selectedSlot.time, startTime, endTime);
      const matchesFilter = selectedFilter
        ? course.catNo.toLowerCase().includes(selectedFilter.toLowerCase())
        : true;
      const noOverlap = !isOverlapping(course);
      return matchesSlot && matchesFilter && noOverlap;
    });
  }, [selectedSlot, selectedFilter, courses, selectedCourses]);

  return (
    <div className="p-4 flex">
      <div className="p-4 flex flex-col gap-5">
        <ProgramSelector
          className="flex flex-col gap-5"
          setCurriculum={setSelectedCurriculum}
        />
        <CourseFilterPanel
          courses={selectedCurriculum?.courses || []}
          scheduledCourses={selectedCourses}
          setScheduledCourses={setSelectedCourses}
          setFilter={setSelectedFilter}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h1 className="text-2xl font-bold mb-4">Course Scheduler</h1>
        <div className="space-y-4">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Weekly Schedule (7am-8pm)</CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  id="time-format"
                  checked={use24Hour}
                  onCheckedChange={setUse24Hour}
                />
                <Label htmlFor="time-format">24-hour time</Label>
              </div>
            </CardHeader>
            <Calendar
              use24Hour={use24Hour}
              selectedCourses={selectedCourses}
              setSelectedSlot={setSelectedSlot}
              eligibleCourses={eligibleCourses}
              toggleCourse={toggleCourseSelection}
              setFilter={setSelectedFilter}
              allCourses={courses}
              filter={selectedFilter || ''}
            ></Calendar>
          </Card>
        </div>
      </div>
    </div>
  );
}
