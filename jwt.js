const jwt = require('jsonwebtoken');

const SECRET_KEY = "my_secret_key_123"; // move to env in real projects

const generateToken = (student) => {
  return jwt.sign(
    {
      studentId: student.studentId,
      studentName: student.studentName,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const token=authHeader.split(" ")[1];
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = { generateToken, verifyToken };