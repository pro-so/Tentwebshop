-- database: c:\projects\pattzor\ECEducation\Backend\student-manager\data\student-manager.db

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productstName TEXT NOT NULL,
  productsprice TEXT NOT NULL,
  productstype TEXT
);

INSERT INTO products (firstName, lastName, email, phone) VALUES
('John', 'Doe', 'john@doe.com', '070-1234567'),
('Jane', 'Doe', 'jane@doe.com', '070-2345678'),
('Jim', 'Doe', 'jim@doe.com', '070-3456789'),
('Jessica', 'Doe', 'jessica@doe.com', '070-2457382');

UPDATE students SET phone = '111-222-333' WHERE id = 2;
