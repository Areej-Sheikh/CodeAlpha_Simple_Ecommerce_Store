const port = 3000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

// require.env
require("dotenv").config();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
//mongodb+srv://areejfatimasheikh25:AreejMongoDB!P@ssw0rd@cluster0.iundj.mongodb.net/

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((error) => console.error("MongoDB connection error:", error));

const storage = multer.diskStorage({
  destination: "./uploads/images/",
  filename: function (req, file, cb) {
    return cb(
      null`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
//schema for creating products
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avaliable: {
    type: Boolean,
    default: true,
  },
});
app.post("/addproduct", async function (req, res) {
  const product = new Product({
    id: req.body.id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  try {
    await product.save();
    console.log("Product saved:", product);
    res.json({
      success: true,
      message: "Product saved successfully",
      name: req.body.name,
    });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ success: false, message: "Error saving product" });
  }
});
app.post("/removeproduct", async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ id: req.body.id });

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
      name: deletedProduct.name,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
});
app.get("/allproducts", async (req, res) => {
  try {
    let products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
});
const upload = multer({ storage: storage });
app.use("/images", express.static("./uploads/images"));
app.post("/upload", upload.single("product"), function (req, res) {
  res.json({
    success: true,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
  console.log(req.file);
});
app.get("/", function (req, res) {
  res.send("Hello World!");
});
app.listen(port, (error) => {
  if (error) {
    console.log("Error in connecting to database", error);
  } else {
    console.log("Server is running on port : ", port);
  }
});
