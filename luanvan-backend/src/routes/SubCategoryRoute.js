const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subCategoryController.js");
const { authMiddleware } = require("../config/middleware/authMiddleware");

router.post("/create", subCategoryController.createSubCategory);
router.post("/create/info", subCategoryController.createInfoSubCate);
router.put("/update/option", subCategoryController.updateOption); //slug: name subCate
router.put("/update/:slug", subCategoryController.updateSubCategory); //slug: name subCate
router.delete("/delete/:slug", subCategoryController.deleteSubCategory);
router.delete("/delete-info/:slug/:nameInfo", subCategoryController.deleteInfo);
router.get("/getAll", subCategoryController.getAllSubCategory);
router.get("/details/:slug", subCategoryController.detailSubCategory);
router.get("/getOption/:slug", subCategoryController.getOptionSubCategory);

module.exports = router;
