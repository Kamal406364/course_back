const express = require("express");
const router = express.Router();
const db = require("./db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("./jwt");

// Register
router.post("/register", async (req, res) => {
    try {
        const { studentName, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql =
            "INSERT INTO student (studentName, password) VALUES (?, ?)";

        db.query(
            sql,
            [studentName, hashedPassword],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        error: "Error registering student",
                    });
                }

                res.status(201).json({
                    message: "Student registered successfully",
                });
            }
        );
    } catch (err) {
        res.status(500).json({
            error: "Server error",
        });
    }
});

// Login
router.post("/login", (req, res) => {
    const { studentId, password } = req.body;

    const sql = "SELECT * FROM student WHERE studentId = ?";

    db.query(sql, [studentId], async (err, result) => {
        if (err) {
            return res.status(500).json({
                error: "Error logging in",
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                error: "Student not found",
            });
        }

        const student = result[0];

        const isMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid password",
            });
        }

        const token = generateToken(student);

        res.json({
            message: "Login successful",
            token,
            student: {
                studentId: student.studentId,
                studentName: student.studentName,
            },
        });
    });
});

module.exports = router;