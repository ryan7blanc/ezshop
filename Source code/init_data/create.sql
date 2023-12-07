DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) NOT NULL,
    password CHAR(60) NOT NULL,
    user_id SERIAL PRIMARY KEY
);

DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products(
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    price INT NOT NULL,
    review INT NOT NULL,
    product_id SERIAL PRIMARY KEY NOT NULL,
    image_url VARCHAR(300) 
);

DROP TABLE IF EXISTS cart CASCADE;
CREATE TABLE cart(
    cart_id SERIAL PRIMARY KEY NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS items CASCADE;
CREATE TABLE items(
    item_id SERIAL PRIMARY KEY NOT NULL,
    cart_id INT NOT NULL,
    product_id INT NOT NULL, 
    amount INT NOT NULL,
    image_url VARCHAR(300) ,
    FOREIGN KEY (product_id) REFERENCES products (product_id) ON DELETE CASCADE,
    FOREIGN KEY (cart_id) REFERENCES cart (cart_id) ON DELETE CASCADE
    
);
