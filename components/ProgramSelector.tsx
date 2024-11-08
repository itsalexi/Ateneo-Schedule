import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

export default function ProgramSelector({
  setCurriculum,
  className,
  setFilter,
}: {
  setCurriculum: (curriculum: { courses: CourseData[] }) => void;
  setFilter: (course: string) => void;
  className: string;
}) {
  const [programLabels, setProgramLabels] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [programData, setProgramData] = useState<ProgramData[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );

  useEffect(() => {
    const fetchProgramList = async () => {
      const data = await fetch('/api/programs');
      const list = await data.json();
      const options = list.map((program: ProgramListInfo) => ({
        label: program.program_info,
        id: program.id,
      }));
      setProgramLabels(options);
    };
    fetchProgramList();
  }, []);

  useEffect(() => {
    setFilter('');
    setProgramData(null);
    const fetchProgramData = async (program: string) => {
      const data = (await fetch(`/api/programs/?id=${program}`)).json();
      setProgramData(await data);
      console.log(await data);
    };
    if (selectedProgram) {
      fetchProgramData(selectedProgram);
      setSelectedYear(null);
      setSelectedSemester(null);
    }
  }, [selectedProgram]);

  useEffect(() => {
    setCurriculum({ courses: selectedSemester?.courses || [] });
  }, [selectedSemester, setCurriculum]);

  return (
    <div className={className}>
      <Autocomplete
        getOptionLabel={(option: { label: string; id: string }) => option.label}
        options={programLabels}
        onChange={(e, value) => {
          setSelectedProgram(value ? value.id : null);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Program of Study" />
        )}
      ></Autocomplete>

      {programData && programData.length > 0 && (
        <Autocomplete
          options={
            programData?.length > 0
              ? programData[0].years.map((yearObj, index) => ({
                  year: yearObj.year,
                  label: `${yearObj.year} Year`,
                  index,
                }))
              : []
          }
          getOptionLabel={(option: YearOption) => option.label}
          onChange={(e, value) => {
            if (value) {
              setSelectedYear(null);
              setTimeout(() => {
                setSelectedYear(programData[0].years[value.index]);
              }, 0);
            }
          }}
          renderInput={(params) => <TextField {...params} label="Year" />}
        />
      )}

      {programData && selectedYear && (
        <Autocomplete
          options={
            selectedYear !== null
              ? selectedYear.semesters.map((semesterObj, index) => ({
                  label: `${semesterObj.name}`,
                  index,
                }))
              : []
          }
          getOptionLabel={(option: SemesterOption) => option.label}
          onChange={(e, value) => {
            if (value) {
              setSelectedSemester(selectedYear.semesters[value.index]);
            }
          }}
          renderInput={(params) => <TextField {...params} label="Semester" />}
        />
      )}
    </div>
  );
}
