const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found in DB",
        });
      }
      req.product = product;
      next();
    });
};

exports.getProducts = (req, res) => {
  Product.find()
    .select("name price stock")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ error: "Products not found" });
      }
      return res.status(400).json(products);
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({ error: "Problem with image" });
    }

    const { name, description, price, category, stock } = fields;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // restrictions on field
    let product = new Product(fields);

    // handle file here
    if (file.photo) {
      if (file.photo.size > 1024 * 1024 * 3) {
        return res.status(400).json({ error: "File size too large" });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // save to db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({ error: "Saving product failed in DB" });
      }
      return res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

// middleware
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

// delete controllers
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product",
      });
    }
    res.json({
      message: "Deletion was a success",
      deletedProduct,
    });
  });
};

// update product
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({ error: "Problem with image" });
    }

    // update product
    let product = req.product;
    product = _.extend(product, fields);

    // handle file here
    if (file.photo) {
      if (file.photo.size > 1024 * 1024 * 3) {
        return res.status(400).json({ error: "File size too large" });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // save to db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({ error: "Saving product failed in DB" });
      }
      return res.json(product);
    });
  });
};

// listing all products
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .populate("category")
    .limit(limit)
    .sort([[sortBy, "asc"]])
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No product found",
        });
      }
      return res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "No category found",
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((product) => {
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operation failed",
      });
    }
    next();
  });
};
