const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { signup, signin, signout, isSignedIn } = require("../controllers/auth");
const expressJwt = require("express-jwt");

router.post(
  "/signup",
  [
    check("name", "name should be at least 3 char").isLength({ min: 3 }),
    check("email", "email is required").isEmail(),
    check("password", "password should be at least 3 char").isLength({
      min: 3,
    }),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "email is required").isEmail(),
    check("password", "password field is required").isLength({ min: 1 }),
  ],
  signin
);

router.get("/signout", signout);

// protected routes
router.get("/test", isSignedIn, (req, res) => {
  res.json({ message: "Hello" });
  console.log(res);
});

// middlewares

module.exports = router;
