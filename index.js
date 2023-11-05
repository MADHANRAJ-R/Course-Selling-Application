const express = require("express");
const app = express();
app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: "Admin Authentication Failed" });
  }
};

const userAuthentication = (req, res, next) => {
  const {username,password} = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(403).json({ message: "User Authentication Failed" });
  }
};

//admin routes

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const existingAdmin = ADMINS.find((a) => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    ADMINS.push(admin);
    res.json({ message: "Admin created successfully" });
  }
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  res.json({ message: "Logged in successfully" });
});

app.post("/admin/course", adminAuthentication, (req, res) => {
  const course = req.body;
  course.id = Date.now();
  COURSES.push(course);
  res.json({ message: "course created successfully", courseId: course.id });
});

app.put("/admin/course/:courseId", adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);

    res.json({ message: "course updated successfully" });
  } else {
    res.status(403).json({ message: "course not found" });
  }
});

app.get("/admin/course", adminAuthentication, (req, res) => {
  res.json({ courses: COURSES });
});

//user routes

app.post("/user/signup", (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    purchasedCourses: [],
  };
  const existingUser = USERS.find(a => a.username === user.username);
  if (existingUser) {
    res.status(403).json({ message: "User already exist" });
  } else {
    USERS.push(user);
    res.status(200).json({ message: "New User created successfully" });
  }
});

app.post("/user/login", userAuthentication, (req, res) => {
  res.status(200).json({ message: "Logged in successfully" });
});

app.get("/user/courses", userAuthentication, (req, res) => {
  let filteredCourses = [];
  for (let i = 0; i < COURSES.length; i++) {
    if (COURSES[i].published) {
      filteredCourses.push(COURSES[i]);
    }
  }
  res.json({ courses: filteredCourses });
});

app.post("/user/courses/:courseId", userAuthentication, (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId && c.published);
  if (course) {
    req.user.purchasedCourses.push(courseId);
    res.json({ message: "Course purchased successfully" });
  } else {
    res.status(403).json({ message: "Course not found or not available" });
  }
});

app.get("/user/purchasedCourses", userAuthentication, (req, res) => {
  const purchasedCourses =  COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
  res.json({ purchasedCourses });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
