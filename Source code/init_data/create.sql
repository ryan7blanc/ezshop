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
    product_id SERIAL PRIMARY KEY NOT NULL
);

DROP TABLE IF EXISTS cart CASCADE;
CREATE TABLE cart(
    user_id INT,
    CONSTRAINT fk_userid
    user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    product_id FOREIGN KEY (product_id) REFERENCES products (product_id) ON DELETE CASCADE,
    cartid SERIAL PRIMARY KEY NOT NULL
    -- FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE,
    -- product Integer[99],
    -- FOREIGN KEY (EACH ELEMENT OF )
);
