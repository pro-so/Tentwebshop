var express = require("express");
var router = express.Router();
var Database = require("better-sqlite3");
const e = require("express");

const path = require("path");
const db = new Database(path.join(__dirname, "../data/products-manager.db"));

router.get("/products", (req, res) => {
  const adminProducts = db.prepare("SELECT * FROM products").all(); 
  console.log(adminProducts);
  res.render("admin/products/index", { adminProducts });
});

router.post('/products/delete', (req, res) => {
  const { productBody_id } = req.body;

  const deleteProductItem = db.prepare(`
    DELETE FROM products 
    WHERE id = ?`).run(productBody_id);

  if (deleteProductItem.changes === 0) {
    console.log("⚠️ No rows deleted. Item may not exist in cart.");
  } else {
    console.log("✅ Cart item deleted successfully.");
  }

  res.redirect('/admin/products');
});

module.exports = router;