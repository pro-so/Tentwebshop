const express = require("express");
const router = express.Router();

const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "../data/products-manager.db"));


// GET: Visa varukorgen
router.get("/kassa", (req, res) => {
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
    console.log("🛒 Cart is empty.");
  } else {
    console.log("✅ Cart items retrieved successfully.");
  }

  res.render("kassa", { cartItems , message: ""});
});

// POST: Ta bort vara från varukorgen
router.post('/kassa/delete', (req, res) => {
  const { Cart_productBody_id } = req.body;
  const Cart_sessionIndex_id = req.sessionID;

  const deleteCartItem = db.prepare(`
    DELETE FROM cart 
    WHERE Cart_product_id = ? AND Cart_session_id = ?
  `).run(Cart_productBody_id, Cart_sessionIndex_id);

  res.redirect('/kassa');
});

// POST: Checkout (skapa order och töm varukorgen)
router.post('/kassa/checkout', (req, res) => {
  const Cart_sessionIndex_id = req.sessionID;
  const { firstname, lastname, email, street, postalCode, city, newsletter } = req.body;

  const cartItems = db.prepare(`
    SELECT 
      cart.Cart_product_id,
      cart.Cart_quantity,
      cart.Cart_productName,
      products.productsprice
    FROM cart
    JOIN products ON Cart_product_id = products.id
    WHERE Cart_session_id = ?
  `).all(Cart_sessionIndex_id);

  if (!cartItems.length) {
    console.log("🛒 Cart is empty. Cannot proceed to checkout.");
    return res.redirect('/kassa');
  }
 console.log(cartItems);
  // Skapa order (utan att skicka med ordersid — SQLite hanterar det med AUTOINCREMENT)
  const insertOrder = db.prepare(`
    INSERT INTO customers (
      customerFirstname,
      customerLastname,
      customerEmail,
      customerStreet,
      customerpostalCode,
      customercity,
      customernewsletter,
      customerCreated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const orderResult = insertOrder.run(
    firstname,
    lastname,
    email,
    street,
    postalCode,
    city,
    newsletter ? 1 : 0,
    new Date().toISOString()
  );

  // Hämta det nyligen skapade order-ID:t
  const newOrderId = db.prepare(`SELECT last_insert_rowid() AS customerId`).get().customerId;
  console.log(`✅ id för ny order: ${newOrderId}`);
 
  // Spara varje rad i order_items
  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (orderid, orderProduct_id,orderproductName,orderPrice,orderQuantity)
    VALUES (?, ?, ?, ?, ?)
  `);
cartItems.forEach(item => {
   insertOrderItem.run(newOrderId, item.Cart_product_id, item.Cart_productName, item.productsprice, item.Cart_quantity);
});

  // Töm kundvagnen
  db.prepare(`DELETE FROM cart WHERE Cart_session_id = ?`).run(Cart_sessionIndex_id);

  console.log(`✅ Order complete (ID: ${newOrderId}) and cart cleared for session ${Cart_sessionIndex_id}.`);
res.redirect(`/order-confirmation/${newOrderId}`);
});
router.get('/order-confirmation/:id', (req, res) => {
  const newOrderId = req.params.id;

  const order_confirmation = db.prepare(`
    SELECT 
      order_items.orderproductName,
      order_items.orderPrice,
      order_items.orderQuantity,
      customers.customerFirstname,
      customers.customerLastname,
      customers.customerEmail,
      customers.customerStreet,
      customers.customerpostalCode,
      customers.customercity
    FROM order_items
    JOIN customers ON customers.customerId = order_items.orderid
    WHERE order_items.orderid = ?
  `).all(newOrderId);
console.log(order_confirmation);
  res.render("order-confirmation", { order_confirmation });
});

module.exports = router;
