'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CourseFilterPanel({
  courses,
  scheduledCourses,
  setScheduledCourses,
  setFilter,
  filter,
}: {
  courses: CourseData[];
  scheduledCourses: Course[];
  filter: string;
  setScheduledCourses: (courses: Course[]) => void;
  setFilter: (course: string) => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const scheduledCourseIds = scheduledCourses.map((course) => course.catNo);
  const availableCourses = courses?.filter(
    (course) => !scheduledCourseIds.includes(course.catNo)
  );

  useEffect(() => {
    if (selectedCourse !== null) {
      setFilter(selectedCourse);
    } else {
      setFilter('');
    }
  }, [selectedCourse, setFilter]);

  const handleCourseClick = (courseId: string) => {
    setSelectedCourse((prevSelected) =>
      prevSelected === courseId ? null : courseId
    );
  };

  const removeScheduledCourse = (courseId: string) => {
    setScheduledCourses(
      scheduledCourses.filter((course: Course) => course.catNo !== courseId)
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Course List</h3>

            <ScrollArea className="h-full w-full rounded-md border">
              <div className="p-4">
                {availableCourses?.map((course) => (
                  <Button
                    key={course.id}
                    variant={
                      selectedCourse === course.catNo ? 'secondary' : 'ghost'
                    }
                    className="w-full justify-start text-left mb-2"
                    onClick={() => handleCourseClick(course.catNo)}
                  >
                    <span className="font-medium mr-2">{course.catNo}</span>
                    {course.courseTitle}
                  </Button>
                ))}
                {availableCourses.length === 0 && (
                  <span>No program selected.</span>
                )}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Current Filter</h3>
            {filter !== '' ? (
              <Badge variant="secondary" className="text-sm py-1 px-2">
                {courses.find((c) => c.catNo === selectedCourse)?.catNo || ''}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSelectedCourse(null)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Clear filter</span>
                </Button>
              </Badge>
            ) : (
              <p className="text-sm text-muted-foreground">
                No course selected
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Scheduled Courses</h3>
            {scheduledCourses.length > 0 ? (
              <div className="space-y-2">
                {scheduledCourses.map((course) => (
                  <Badge
                    key={course.catNo}
                    variant="outline"
                    className="text-sm py-1 px-2 mr-2"
                  >
                    {course.catNo}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeScheduledCourse(course.catNo)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {course.catNo}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No courses scheduled
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
