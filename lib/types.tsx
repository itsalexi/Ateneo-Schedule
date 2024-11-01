/* eslint-disable @typescript-eslint/no-unused-vars */
interface ScheduleBlock {
  course: Course;
  rowspan: number;
  isStart: boolean;
}

interface Course {
  catNo: string;
  section: string;
  courseTitle: string;
  units: string;
  time: string;
  room: string;
  instructor: string;
  remarks: string;
}

interface Curriculum {
  courses: CourseData[];
}

type CourseData = {
  id: string;
  catNo: string;
  courseTitle: string;
};

type Semester = {
  name: string;
  courses: CourseData[];
};

type Year = {
  year: string;
  semesters: Semester[];
};

type Program = {
  program_info: string;
  years: Year[];
};

type ProgramListInfo = {
  program_info: string;
  id: string;
};

interface YearOption {
  year: string;
  label: string;
  index: number;
}

interface SemesterOption {
  label: string;
  index: number;
}

interface ProgramData {
  years: { year: string; semesters: Array<Semester> }[];
}
