import { rawData } from "../data/rawData.js";

function normalizeDirectory(rawData) {
  const departmentsById = {};
  const programsById = {};
  const instructorsById = {};
  const instructorsByEmail = {};

  const departmentEntries = Object.entries(rawData)
  for(let i = 0; i< departmentEntries.length; i++) {
    // array destructuring
    const [departmentName, departmentData] = departmentEntries[i];
    const departmentId = departmentData.Dept_code || `dept-${i + 1}`;
    departmentsById[departmentId] = {
      id: departmentId,
      code:departmentData.Dept_code,
      name: departmentName,
      programIds: []
    }
    for(let j = 0; j < departmentData.programs.length; j++) {
      const program = departmentData.programs[j];
      programsById[program.id] ={
        ...program,
        departmentId 
      }
      // creating a two way relationship so that department can look up its department id's
      departmentsById[departmentId].programIds.push(program.id);
      // adding instructors array
      for(let k = 0; k < program.instructors.length; k++) {
        const instructor = program.instructors[k];
        instructorsById[instructor.id] = {
          ...instructor,
          programId: program.id,
          departmentId
        }
        // safe call for an instructor without an email
        if(instructor.email) {
           instructorsByEmail[instructor.email] = instructor.id;
        }
      }
    }
  }
  return {
    departmentsById,
    programsById,
    instructorsById,
    instructorsByEmail
  }
};
const normalizedData = normalizeDirectory(rawData);

function getInstructorByEmail(email, normalizedData) {
  const instructorId = normalizedData.instructorsByEmail[email];
  // adding a guarding clause
  if(!instructorId) {
    return "Instructor not found"
  }
  const instructor = normalizedData.instructorsById[instructorId];
  const department = normalizedData.departmentsById[instructor.departmentId];
  console.log(department)
   return {
    name:instructor.name ?? "Unknown Instructor",
    officeHours: instructor.officeHours ?? "Not Available",
    department: department.name ?? "Unknown Department"
  };
}
function listRoomsByBuilding(buildingCode, normalizedData) {
  // we need to search through programs hence we need them as an array
  const programValues = Object.values(normalizedData.programsById);
  const rooms = [];
  for(let i = 0; i < programValues.length; i++) {
    
  const program = programValues[i] ;
  const department = normalizedData.departmentsById[program.departmentId]
  if(department.code === buildingCode && program.room != null) {
      rooms.push(program.room)
    } 
  }
  return rooms.sort()
}
function renderDirectorySummary(normalizedData) {
const departments = Object.keys(normalizedData.departmentsById).length;
const programs = Object.keys(normalizedData.programsById).length;
const instructors = Object.keys(normalizedData.instructorsById).length;

  const instructorValues = Object.values(normalizedData.instructorsById);
  let missingOfficeHours = 0;

  for(let i  = 0; i < instructorValues.length; i++) {
        if(instructorValues[i].officeHours == null) {
      missingOfficeHours++;
    }
  }
  const programValues = Object.values(normalizedData.programsById);
let programsWithoutRooms = 0;  
for (let i = 0; i < programValues.length; i++) {
     if(programValues[i].room === null) {
      programsWithoutRooms++;
    } 
  }
  return`
Campus Directory Summary
------------------------
Departments: ${departments}
Programs: ${programs}
Instructors: ${instructors}
Missing Office Hours: ${missingOfficeHours}
Programs Without Rooms: ${programsWithoutRooms}
`
}
console.log(renderDirectorySummary(normalizedData))
// The below code is difficuilt to maintain since it uses nested for loops
// function getInstructorByEmail(email) {
//   for(const dept in rawData) {
//     const programs = rawData[dept].programs;
//     for(const program of programs) {
//       for(const instructor of program["instructors"]) {
//         if(instructor.email === email) {
//           return instructor.name;
//         }
//       }
//     }
//   }
//   return null;
// }

