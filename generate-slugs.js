const Database = require("better-sqlite3");
const db = new Database(__dirname + "/data/products-manager.db", {
  verbose: console.log,
});

// 1. Add `slug` column if it doesn't exist
try {
  db.prepare(`ALTER TABLE products ADD COLUMN slug TEXT`).run();
  console.log("🟢 'slug' column added.");
} catch (err) {
  if (err.message.includes("duplicate column name")) {
    console.log("🔵 'slug' column already exists.");
  } else {
    console.error("❌ Error adding slug column:", err.message);
    process.exit(1);
  }
}

// 2. Slugify function
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-") // spaces & non-word chars to dash
    .replace(/^-+|-+$/g, ""); // remove leading/trailing dashes
}

// 3. Fetch products and update slugs
const products = db.prepare("SELECT id, productstName FROM products").all();
const update = db.prepare("UPDATE products SET slug = ? WHERE id = ?");

products.forEach((product) => {
  const slug = slugify(product.productstName);
  update.run(slug, product.id);
  console.log(`✅ Updated product ID ${product.id} with slug: ${slug}`);
});

console.log("🎉 Slugs generated for all products.");
