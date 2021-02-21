const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  getProduct,
  photo,
  deleteProduct,
  getAllProducts,
  updateProduct,
  getAllUniqueCategories,
} = require("../controllers/product");
const { isSignedIn, isAdmin, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
const router = express.Router();

// all of params
router.param("userId", getUserById);
router.param("productId", getProductById);

// all of actual routes
router.get("/products", getAllProducts);
router.get("/product/:productId", getProduct);
router.get("/product/photo/:productId", photo);
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

//delete route
router.delete(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);

//update route
router.put(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
);

router.get("/products/categories", getAllUniqueCategories);

module.exports = router;
