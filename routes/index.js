var express = require("express");
var router = express.Router();

var Database = require("better-sqlite3");


const path = require("path");
const db = new Database(path.join(__dirname, "../data/products-manager.db"));


try {
  const test = db.prepare("SELECT COUNT(*) FROM products").get();
  console.log(" Database is connected and 'products' table is accessible");
  console.log("Number of products:", test["COUNT(*)"]);
} catch (error) {
  console.error(" Failed to access 'products' table:", error.message);
}
router.use((req, res, next) => {
  res.locals.message = '';
  res.locals.messageType = '';
  next();
});
router.get("/", (req, res) => {
  const sql = "SELECT * FROM products";
  const stmt = db.prepare(sql);
  const allProducts = stmt.all();

  return res.render("index", { products_routerIndex: allProducts });


});

router.get("/search", function (req, res) {
  const searchTerm = req.query.q || "";

  const sql = `
    SELECT * FROM products 
    WHERE productstName = ?
  `;

  const stmt = db.prepare(sql);
  const products = stmt.all(searchTerm); 

  if (products.length === 0) {
 
    const sql = "SELECT * FROM products";
    const stmt = db.prepare(sql);
    const allProducts = stmt.all();

    return res.render("index", {
      products_routerIndex: allProducts,
      products: [],
     
      message: "Inga produkter hittades",
      messageType: "warning",
    });
    
  } else {
  
    return res.render("index", {
      products_routerIndex: products,
      message: " Hittade " + products.length + " produkter",
      messageType: "success",
    });
  }
});



router.get("/products/:slug", (req, res) => {
  const slug = req.params.slug;

  const productDetails = db
    .prepare("SELECT * FROM products WHERE slug = ?")
    .get(slug);
//console.log("Product Details:", productDetails);
 
 

  const similarProducts = db
    .prepare(
      `SELECT * FROM products 
     WHERE id != ? AND productsCategory = ?
     LIMIT 9`
    )
    .all(productDetails.id, productDetails.productsCategory);



 return res.render("product-details", {
  
    productsDetails_routerIndex: [productDetails],
    productsDetailsSlice_routerIndex: similarProducts,
    
  });
});

module.exports = router;
