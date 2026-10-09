const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

// The JSON file will be created in the same folder as this app.js file.
const DATA_FILE = path.join(__dirname, "courses.json");

// These are the only valid course statuses.
const VALID_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed"
];

// Allows Express to read JSON request bodies.
app.use(cors());
app.use(express.json());

/*
  Helper function that creates courses.json if it does not already exist.
*/
async function ensureDataFileExists() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // ENOENT means that the file does not exist.
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
      console.log("Created courses.json");
    } else {
      throw error;
    }
  }
}

/*
  Reads courses from courses.json and converts the JSON text
  into a JavaScript array.
*/
async function readCourses() {
  try {
    await ensureDataFileExists();

    const fileContents = await fs.readFile(DATA_FILE, "utf8");

    // If the file is empty, treat it as an empty course list.
    if (!fileContents.trim()) {
      return [];
    }

    const courses = JSON.parse(fileContents);

    // Make sure the JSON file contains an array.
    if (!Array.isArray(courses)) {
      throw new Error("courses.json must contain a JSON array");
    }

    return courses;
  } catch (error) {
    console.error("Error reading courses.json:", error.message);
    throw new Error("Unable to read course data");
  }
}

/*
  Converts the courses array to formatted JSON and saves it
  back to courses.json.
*/
async function writeCourses(courses) {
  try {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(courses, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Error writing courses.json:", error.message);
    throw new Error("Unable to save course data");
  }
}

/*
  Checks whether a date has the exact YYYY-MM-DD format
  and represents a real calendar date.
*/
function isValidDateFormat(dateString) {
  if (typeof dateString !== "string") {
    return false;
  }

  // First check the exact format.
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateFormat.test(dateString)) {
    return false;
  }

  // Then check that the date is actually valid.
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/*
  Validates the fields required to create or replace a course.
  Returns an error message when validation fails.
  Returns null when the data is valid.
*/
function validateCourse(courseData) {
  const requiredFields = [
    "name",
    "description",
    "target_date",
    "status"
  ];

  // Check for missing or empty fields.
  for (const field of requiredFields) {
    if (
      courseData[field] === undefined ||
      courseData[field] === null ||
      String(courseData[field]).trim() === ""
    ) {
      return `${field} is required`;
    }
  }

  // Check that status is one of the allowed values.
  if (!VALID_STATUSES.includes(courseData.status)) {
    return `status must be one of: ${VALID_STATUSES.join(", ")}`;
  }

  // Check the target date.
  if (!isValidDateFormat(courseData.target_date)) {
    return "target_date must use the YYYY-MM-DD format and be a valid date";
  }

  return null;
}

/*
  POST /api/courses
  Creates a new course.
*/
app.post("/api/courses", async (req, res) => {
  try {
    const validationError = validateCourse(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const courses = await readCourses();

    /*
      Generate the next ID.

      IDs start at 1. Finding the largest existing ID also
      prevents duplicate IDs if a course has been deleted.
    */
    const largestId = courses.reduce((maximum, course) => {
      return Math.max(maximum, Number(course.id) || 0);
    }, 0);

    const newCourse = {
      id: largestId + 1,
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);
    await writeCourses(courses);

    return res.status(201).json(newCourse);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to create course"
    });
  }
});

/*
  GET /api/courses
  Returns all courses.
*/
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await readCourses();

    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to retrieve courses"
    });
  }
});

/*
  GET /api/courses/:id
  Returns one course by its numeric ID.

  Example:
  GET /api/courses/1
*/
app.get("/api/courses/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);

    const courses = await readCourses();

    const course = courses.find((item) => item.id === courseId);

    if (!course) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to retrieve course"
    });
  }
});

/*
  PUT /api/courses/:id
  Replaces the editable data for an existing course.

  The id and created_at values are preserved automatically.
*/
app.put("/api/courses/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);

    const validationError = validateCourse(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const courses = await readCourses();

    const courseIndex = courses.findIndex(
      (course) => course.id === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    const existingCourse = courses[courseIndex];

    const updatedCourse = {
      id: existingCourse.id,
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: existingCourse.created_at
    };

    courses[courseIndex] = updatedCourse;

    await writeCourses(courses);

    return res.status(200).json(updatedCourse);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to update course"
    });
  }
});

/*
  DELETE /api/courses/:id
  Deletes a course by its ID.

  Example:
  DELETE /api/courses/1
*/
app.delete("/api/courses/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);

    const courses = await readCourses();

    const courseIndex = courses.findIndex(
      (course) => course.id === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    // Remove one item from the array.
    const deletedCourse = courses.splice(courseIndex, 1)[0];

    await writeCourses(courses);

    return res.status(200).json({
      message: "Course deleted successfully",
      course: deletedCourse
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to delete course"
    });
  }
});

/*
  This handles requests to routes that do not exist.
*/
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/*
  This error handler catches malformed JSON.

  For example, it handles a request body such as:
  { "name": "Incomplete JSON"
*/
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      error: "Request body contains invalid JSON"
    });
  }

  return res.status(500).json({
    error: "An unexpected server error occurred"
  });
});

/*
  Make sure courses.json exists before starting the server.
*/
async function startServer() {
  try {
    await ensureDataFileExists();

    app.listen(PORT, () => {
      console.log(`CodeCraftHub API is running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start the server:", error.message);
    process.exit(1);
  }
}

startServer();

