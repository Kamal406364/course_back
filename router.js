const express = require("express");
const router = express.Router();
const db = require("./db");
const { verifyToken } = require("./jwt");

// Home Route
router.get("/", (req, res) => {
  res.send("Backend server successfully running");
});

// Get All Courses
router.get("/getAllCourse", verifyToken, (req, res) => {
  const sql = "SELECT courseId, courseName FROM course";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: "Error fetching courses",
      });
    }

    res.json(result);
  });
});

// Get Registered Courses of Logged-in Student
router.get("/getRegisteredCourse", verifyToken, (req, res) => {
  const studentId = req.user.studentId;

  const sql = `
    SELECT c.courseId, c.courseName
    FROM course_registration cr
    JOIN course c ON cr.courseId = c.courseId
    WHERE cr.studentId = ?
  `;

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: "Error fetching registered courses",
      });
    }

    res.json(result);
  });
});

// Register Course
router.post("/registerCourse", verifyToken, (req, res) => {
  const studentId = req.user.studentId;
  const { courseId } = req.body;

  const checkSql =
    "SELECT * FROM course_registration WHERE studentId = ? AND courseId = ?";

  db.query(checkSql, [studentId, courseId], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: "Error checking registration",
      });
    }

    if (result.length > 0) {
      return res.status(400).json({
        message: "Course already registered",
      });
    }

    const insertSql =
      "INSERT INTO course_registration(studentId, courseId) VALUES (?, ?)";

    db.query(insertSql, [studentId, courseId], (err) => {
      if (err) {
        return res.status(500).json({
          error: "Error registering course",
        });
      }

      res.status(201).json({
        message: "Course registered successfully",
      });
    });
  });
});

// Unregister Course
router.post("/unregisterCourse", verifyToken, (req, res) => {
  const studentId = req.user.studentId;
  const { courseId } = req.body;

  const sql =
    "DELETE FROM course_registration WHERE studentId = ? AND courseId = ?";

  db.query(sql, [studentId, courseId], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: "Error unregistering course",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Course registration not found",
      });
    }

    res.json({
      message: "Course unregistered successfully",
    });
  });
});

// Get All Student-Course Registrations
router.get("/getAllStudentsCourseRegisteration", (req, res) => {
  const sql = `
    SELECT
      s.studentId,
      s.studentName,
      c.courseId,
      c.courseName
    FROM student s
    JOIN course_registration cr
      ON s.studentId = cr.studentId
    JOIN course c
      ON cr.courseId = c.courseId
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: "Error fetching registrations",
      });
    }

    res.json(result);
  });
});

module.exports = router;