const express = require("express");
const router = express.Router();

const Database = require("better-sqlite3");
const multer = require("multer");
const path = require("path");

const db = new Database(path.join(__dirname, "../data/products-manager.db"));

//  Slugify function
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

//  Ensure slug is unique
function generateUniqueSlug(name, db) {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  while (db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}

//  Multer 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

//  GET route
router.get("/products/newProduct", (req, res) => {
  const adminProducts = db.prepare("SELECT * FROM products").all();
  res.render("admin/products/newProduct", { adminProducts });
});

//  POST route
router.post("/products/newProduct", upload.single('admin_productBody_ImageFile'), (req, res) => {
  const {
    admin_productBody_Name,
    admin_productBody_Price,
    admin_productBody_Type,
    admin_productBody_Description,
    admin_productBody_Short_description,
    admin_productBody_Discount,
    admin_productBody_IsSpots,
    admin_productBody_IsHero,
    admin_productBody_DisplayedAt,
    admin_productBody_HotNews,
    admin_productBody_Category,
    admin_productBody_SKU
  } = req.body;

  const productImage = req.file ? '/images/' + req.file.filename : null;
  if (!productImage) {
    return res.status(400).send("Ingen bild valdes.");
  }

  //  Generate SKU if not provided
  let sku = admin_productBody_SKU;
  if (!sku || sku.trim() === "") {
    const now = Date.now();
    const short = now.toString().slice(-5);
    sku = `${admin_productBody_Name.toUpperCase().slice(0, 3)}-${short}`;
  }

  //  Check for existing SKU
  const existingSKU = db
    .prepare("SELECT * FROM products WHERE productsSku = ?")
    .get(sku);
  if (existingSKU) {
    return res.status(400).send("Det angivna SKU används redan. Vänligen välj ett annat.");
  }

  //  Generate unique slug
  const slug = generateUniqueSlug(admin_productBody_Name, db);

  //  Insert into DB
  db.prepare(`
    INSERT INTO products (
      productstName,
      productsprice,
      productstype,
      productImage,
      productsDescription,
      productsShort_Description,
      productsDiscount,
      products_is_spots,
      products_is_hero,
      products_displayed_at,
      HotNewsInfo,
      slug,
      productsCategory,
      productsSku
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    admin_productBody_Name,
    admin_productBody_Price,
    admin_productBody_Type,
    productImage,
    admin_productBody_Description,
    admin_productBody_Short_description,
    admin_productBody_Discount,
    admin_productBody_IsSpots,
    admin_productBody_IsHero,
    admin_productBody_DisplayedAt,
    admin_productBody_HotNews,
    slug,
    admin_productBody_Category,
    sku
  );

  res.redirect("/admin/products/newProduct");
});

module.exports = router;
