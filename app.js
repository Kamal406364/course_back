const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./auth");
const dashboardRoutes=require("./router");

app.use("/api/auth", authRoutes);
app.use("/api",dashboardRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});