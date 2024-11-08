'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search } from 'lucide-react';

export default function CourseSearch({
  courses,
  toggleCourse,
  setDialog,
  setFilter,
}: {
  courses: Course[];
  toggleCourse: (course: Course) => void;
  setDialog: (open: boolean) => void;
  setFilter: (filter: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 9;

  const filteredCourses = courses.filter((course) =>
    Object.values(course).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>Course List</DialogTitle>
      </DialogHeader>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-grow"
        />
        <Button size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedCourses.map((course, index) => (
          <Card className="flex flex-col" key={index}>
            <CardHeader>
              <CardTitle>{course.courseTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div>
                  <p>
                    <strong>Cat No:</strong> {course.catNo}
                  </p>
                  <p>
                    <strong>Section:</strong> {course.section}
                  </p>
                  <p>
                    <strong>Units:</strong> {course.units}
                  </p>
                  <p>
                    <strong>Time:</strong> {course.time}
                  </p>
                  <p>
                    <strong>Room:</strong> {course.room}
                  </p>
                  <p>
                    <strong>Instructor:</strong> {course.instructor}
                  </p>
                  <p>
                    <strong>Remarks:</strong> {course.remarks}
                  </p>
                </div>
                <Button
                  className="self-end"
                  onClick={() => {
                    setDialog(false);
                    setFilter('');
                    toggleCourse(course);
                  }}
                >
                  Add to Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredCourses.length > itemsPerPage && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
