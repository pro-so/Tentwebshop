const express = require("express");
const router = express.Router();

const Database = require("better-sqlite3");
const db = new Database(__dirname + "/../data/products-manager.db");


router.post("/cart", (req, res) => {
  const { Cart_productBody_id, Cart_quantityBody ,Cart_productBody_productstName,Cart_productBody_productstPrice} = req.body;
  const Cart_sessionIndex_id = req.sessionID;

  const existingItem = db.prepare(`
    SELECT * FROM cart WHERE Cart_product_id = ? AND Cart_session_id = ?
  `).get(Cart_productBody_id, Cart_sessionIndex_id);

  if (existingItem) {
    db.prepare(`
      UPDATE cart 
      SET Cart_quantity = Cart_quantity + ? 
      WHERE Cart_product_id = ? AND Cart_session_id = ? AND Cart_productName = ?
    `).run(Cart_quantityBody, Cart_productBody_id, Cart_sessionIndex_id,Cart_productBody_productstName);
  } else {
    db.prepare(`
      INSERT INTO cart (Cart_product_id,Cart_productName,Cart_productPrice,Cart_quantity, Cart_session_id, created_at) 
      VALUES (?, ?, ?, ?, ?,?)
    `).run(Cart_productBody_id,Cart_productBody_productstName,Cart_productBody_productstPrice,Cart_quantityBody, Cart_sessionIndex_id, new Date().toISOString());
  }

  return res.redirect("/");
});


router.get("/cart", (req, res) => {
  const Cart_sessionIndex_id = req.sessionID;

  const cartItems = db.prepare(`
    SELECT 
      cart.Cart_id,
      cart.Cart_product_id,
      products.productstName,
      products.productImage,
      products.productsprice,
      cart.Cart_quantity
    FROM cart 
    JOIN products ON Cart_product_id = products.id
    WHERE Cart_session_id = ?
  `).all(Cart_sessionIndex_id);

  if (cartItems.length === 0) {
    //console.log("🛒 Cart is empty.");
  } else {
   
   
  }

  return res.render("cart", { cartItems });
});


router.post('/cart/update', (req, res) => {
  const { Cart_productBody_id, Cart_quantityBody } = req.body;
  const Cart_sessionIndex_id = req.sessionID;

  const updateCart = db.prepare(`
    UPDATE cart 
    SET Cart_quantity = ? 
    WHERE Cart_product_id = ? AND Cart_session_id = ?
  `).run(Cart_quantityBody, Cart_productBody_id, Cart_sessionIndex_id);

  if (updateCart.changes === 0) {
    //console.log("⚠️ No rows updated. Item may not exist in cart.");
  } else {
   // console.log("✅ Cart updated successfully.");
  }

  return res.redirect('/cart');
});


router.post('/cart/delete', (req, res) => {
  const { Cart_productBody_id } = req.body;
  const Cart_sessionIndex_id = req.sessionID;

  const deleteCartItem = db.prepare(`
    DELETE FROM cart 
    WHERE Cart_product_id = ? AND Cart_session_id = ?
  `).run(Cart_productBody_id, Cart_sessionIndex_id);

  //if (deleteCartItem.changes === 0) {
    //console.log("⚠️ No rows deleted. Item may not exist in cart.");
  //} else {
   // console.log("✅ Cart item deleted successfully.");
 // }

  return res.redirect('/cart');
});

// delete items from cart that are older than 15 minutes
setInterval(() => {
  const TimeAgoDeleteCart = new Date(Date.now() - 1000 * 60 * 15).toISOString();

  const stmt = db.prepare(`
    DELETE FROM cart WHERE created_at < ?
  `);

  const result = stmt.run(TimeAgoDeleteCart);

  //if (result.changes > 0) {
    //console.log(`${result.changes} setInterval have been deleted automatically from the cart.`);
  //}
  //else {
   // console.log("No items older than 30 minutes found in the cart.");
 // }
}, 1000 * 60 * 15); // every 15 minutes
// Middleware to clear cart items older than 15 minutes on server start

module.exports = router;
