const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const assignamentController = require("../controllers/assignamentsController");

router.use(authController.isAuthenticated);
router.use(authController.authorizeRoles("PROPIETARIO"));

router.get("/", assignamentController.showUserAssignament);

module.exports = router;
