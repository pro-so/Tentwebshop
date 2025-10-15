var express = require("express");
var router = express.Router();

var Database = require("better-sqlite3");
const e = require("express");

const path = require("path");
const db = new Database(path.join(__dirname, "../data/products-manager.db"));

try {
  const test = db.prepare("SELECT COUNT(*) FROM products").get();
  console.log("✅ Database is connected and 'products' table is accessible");
  console.log("Number of products:", test["COUNT(*)"]);
} catch (error) {
  console.error("❌ Failed to access 'products' table:", error.message);
}

router.get("/", (req, res) => {
  const sql = "SELECT * FROM products ";
  const stmt = db.prepare(sql);
  const allProducts = stmt.all();
  res.render("index", { products_routerIndex: allProducts, message: [] });
});

router.get("/search", function (req, res) {
  const searchTerm = req.query.q || "";

  const sql = `
    SELECT * FROM products 
    WHERE productstName = ?
  `;

  const stmt = db.prepare(sql);
  const products = stmt.all(searchTerm); // exact match

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
  // res.render("index", { products_routerIndex: products, message: [] });
});

router.get("/checkout", (req, res) => {
  res.render("checkout"); // assumes views/checkout.ejs exists
});

// router.get("/product-detalis.ejs", (req, res) => {
//   res.render("product-detalis"); // assumes views/checkout.ejs exists
// });
router.get("/products/:slug", (req, res) => {
  const slug = req.params.slug;

  const productDetails = db
    .prepare("SELECT * FROM products WHERE slug = ?")
    .get(slug);

 

  const similarProducts = db
    .prepare(
      `SELECT * FROM products 
     WHERE id != ? AND productsCategory = ?
     LIMIT 9`
    )
    .all(productDetails.id, productDetails.productsCategory);



  res.render("product-details", {
    productsDetails_routerIndex: [productDetails],
    productsDetailsSlice_routerIndex: similarProducts,
  });
});
router.post("/cart", (req, res) => {
   
  const { Cart_productBody_id, Cart_quantityBody } = req.body;
  let Cart_sessionIndex_id  = req.sessionID;
  const existingItem = db.prepare(`
    SELECT * FROM cart WHERE Cart_product_id = ? AND Cart_session_id = ?
  `).get(Cart_productBody_id, Cart_sessionIndex_id);

  if (existingItem) {
    existingItem_update = db.prepare(`
      UPDATE cart SET Cart_quantity = Cart_quantity + ? 
      WHERE Cart_product_id = ? AND Cart_session_id = ?
    `).run(Cart_quantityBody, Cart_productBody_id, Cart_sessionIndex_id);
  } else {
    db.prepare(`
      INSERT INTO cart (Cart_product_id, Cart_quantity, Cart_session_id) 
      VALUES (?, ?, ?)
    `).run(Cart_productBody_id, Cart_quantityBody, Cart_sessionIndex_id);
  }

  res.redirect("/cart");
});

router.get("/cart", (req, res) => {
  const Cart_sessionIndex_id = req.sessionID;

  const cartItems = db.prepare(`
    SELECT cart.Cart_id, products.productstName, products.productImage, products.productsprice, cart_quantity 
    FROM cart 
    JOIN products ON Cart_product_id = products.id 
    WHERE Cart_session_id = ?
  `).all(Cart_sessionIndex_id);


  res.render("cart", { cartItems });
});

/* GET home page. */
// router.get('/', function(req, res, next) {

//   const sql = "SELECT * FROM products";

//   const select = db.prepare(sql);

//   const students = select.all();

//   res.render('index', {
//     title: 'products',
//     products: products
//   });
// });

// router.post('/', function(req, res, next) {
//   const { firstName, lastName, email, phone } = req.body;
//   const sql = "INSERT INTO students (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)";
//   const insert = db.prepare(sql);
//   const info = insert.run(firstName, lastName, email, phone);
//   res.redirect('/');
// });

// router.post('/delete', function(req, res, next) {
//   const { id } = req.body;

//   const sql = "DELETE FROM students WHERE id = ?";
//   const deleteStudent = db.prepare(sql);
//   const info = deleteStudent.run(id);

//   res.redirect('/');
// });

module.exports = router;
