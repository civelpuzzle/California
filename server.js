const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = 'california_secret_key_2026';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'pages')));   // /catalog.html
app.use(express.static(path.join(__dirname, 'assets')));  // /logoNoFone.png, но тогда в HTML нужно писать /logoNoFone.png

// ---------- SQLite ----------
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // Products
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    oldPrice INTEGER,
    image TEXT,
    description TEXT,
    category TEXT,
    badge TEXT,
    popular INTEGER DEFAULT 0
  )`);

  // Promotions
  db.run(`CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text TEXT,
    image TEXT,
    date TEXT,
    models TEXT
  )`);

  // Carts
  db.run(`CREATE TABLE IF NOT EXISTS carts (
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (userId, productId)
  )`);

  // Orders
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    items TEXT NOT NULL,
    total INTEGER NOT NULL
  )`);

  // Seed products if empty
  db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
    if (row.count === 0) {
      const defaultProducts = [
        { name: "iPhone 15 Pro Max 256GB", price: 149990, oldPrice: 169990, image: "../assets/iphone15promax.jpg", description: "6.7″ Super Retina XDR, титановый корпус, чип A17 Pro, 48MP главная камера с 5-кратным зумом, до 29 часов видео.", category: "smartphones", badge: "hit", popular: 98 },
        { name: "iPhone 15 Pro 128GB", price: 119990, oldPrice: 134990, image: "../assets/iphone15pro.jpg", description: "6.1″ Super Retina XDR, титан, A17 Pro, 48MP камера с 3-кратным зумом, USB-C 3.0, Action button.", category: "smartphones", badge: "hit", popular: 95 },
        { name: "iPhone 15 Plus 128GB", price: 99990, oldPrice: 112990, image: "../assets/iphone15plus.jpg", description: "6.7″ Super Retina XDR, алюминий, A16 Bionic, 48MP основная камера, Dynamic Island, отличное время работы.", category: "smartphones", badge: "sale", popular: 88 },
        { name: "iPhone 14 128GB", price: 74990, oldPrice: 89990, image: "../assets/iphone14.jpg", description: "6.1″ Super Retina XDR, A15 Bionic, улучшенная фронтальная камера, режим действия при съёмке видео.", category: "smartphones", badge: "sale", popular: 86 },
        { name: "MacBook Air M3 13″", price: 129990, oldPrice: null, image: "../assets/macbookairm313.jpg", description: "13.6″ Liquid Retina, чип M3 (8‑ядерный CPU, 10‑ядерный GPU), до 18 часов работы, безвентиляторный дизайн.", category: "laptops", badge: "new", popular: 96 },
        { name: "MacBook Pro 14″ M3 Pro", price: 199990, oldPrice: 229990, image: "../assets/macbookprom314.jpg", description: "14.2″ Liquid Retina XDR, M3 Pro (12‑ядерный CPU, 18‑ядерный GPU), до 17 часов, HDMI, слот SDXC.", category: "laptops", badge: "hit", popular: 92 },
        { name: "iPad Pro 11″ M4", price: 109990, oldPrice: null, image: "../assets/ipadm4pro.jpg", description: "11″ Ultra Retina XDR, чип M4, поддержка Apple Pencil Pro, Face ID, Thunderbolt / USB 4.", category: "tablets", badge: "new", popular: 89 },
        { name: "iPad Air M2 10.9″", price: 79990, oldPrice: 89990, image: "../assets/ipadm4pro.jpg", description: "10.9″ Liquid Retina, M2, поддержка Apple Pencil USB-C, Touch ID, до 10 часов работы.", category: "tablets", badge: "sale", popular: 82 },
        { name: "Apple Watch Ultra 2", price: 79990, oldPrice: 89990, image: "../assets/aplvat.png", description: "49 мм титановый корпус, дисплей 3000 нит, S9 SiP, двойной тап, до 36 часов автономности.", category: "wearables", badge: "sale", popular: 94 },
        { name: "Apple Watch Series 9", price: 44990, oldPrice: 49990, image: "../assets/aplvat.png", description: "41 или 45 мм, S9 SiP, яркий дисплей, жест двойного касания, отслеживание здоровья.", category: "wearables", badge: "sale", popular: 88 },
        { name: "AirPods Pro 2 USB-C", price: 24990, oldPrice: 29990, image: "../assets/airpods.png", description: "Активное шумоподавление, адаптивный звук, чип H2, кейс с динамиком и поддержкой Find My.", category: "audio", badge: "hit", popular: 99 },
        { name: "AirPods Max", price: 54990, oldPrice: 62990, image: "../assets/airpods.png", description: "Накладные наушники с активным шумоподавлением, пространственным аудио, алюминиевая конструкция.", category: "audio", badge: "sale", popular: 85 }
      ];
      const stmt = db.prepare(`INSERT INTO products (name, price, oldPrice, image, description, category, badge, popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      defaultProducts.forEach(p => {
        stmt.run(p.name, p.price, p.oldPrice, p.image, p.description, p.category, p.badge, p.popular);
      });
      stmt.finalize();
    }
  });

  // Seed promotions if empty
  db.get(`SELECT COUNT(*) as count FROM promotions`, (err, row) => {
    if (row.count === 0) {
      const defaultPromotions = [
        { title: "Скидка 15% на два iPhone", text: "Купите два iPhone любых моделей и получите скидку 15% на весь заказ.", image: "../assets/iphone15promax.jpg", date: "01.04 – 30.04", models: "iPhone 15, 15 Plus, 15 Pro, 15 Pro Max" },
        { title: "MacBook Air M3 — бесплатная доставка", text: "Закажите MacBook Air на чипе M3 и получите бесплатную экспресс-доставку + подарочный чехол.", image: "../assets/macbookairm313.jpg", date: "10.04 – 25.04", models: "MacBook Air 13″ M3, MacBook Air 15″ M3" },
        { title: "AirPods Pro 2 — кэшбэк 5000 ₽", text: "При покупке AirPods Pro 2 вы получаете кэшбэк 5000 ₽ на бонусную карту.", image: "../assets/airpods.png", date: "01.04 – 30.04", models: "AirPods Pro 2 (USB-C)" },
        { title: "Apple Watch Ultra 2 — трейд-ин", text: "Сдайте старые часы и получите скидку до 15 000 ₽ на Apple Watch Ultra 2.", image: "../assets/aplvat.png", date: "05.04 – 20.04", models: "Apple Watch Ultra 2" }
      ];
      const stmt = db.prepare(`INSERT INTO promotions (title, text, image, date, models) VALUES (?, ?, ?, ?, ?)`);
      defaultPromotions.forEach(p => {
        stmt.run(p.title, p.text, p.image, p.date, p.models);
      });
      stmt.finalize();
    }
  });
});

// ---------- Middlewares ----------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Необходима авторизация' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Требуется авторизация' });
  const base64 = authHeader.split(' ')[1];
  const [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Неверные данные администратора' });
  }
};

// ---------- API Routes ----------
// Auth
app.post('/api/auth/register', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: 'Логин и пароль обязательны' });
  const hashedPassword = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (login, password) VALUES (?, ?)`, [login, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Пользователь уже существует' });
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    const token = jwt.sign({ id: this.lastID, login }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, user: { login } });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: 'Логин и пароль обязательны' });
  db.get(`SELECT * FROM users WHERE login = ?`, [login], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Неверный логин или пароль' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Неверный логин или пароль' });
    const token = jwt.sign({ id: user.id, login }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, user: { login: user.login } });
  });
});

// Products
app.get('/api/products', (req, res) => {
  let { category, sort, search, page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 8;
  let sql = `SELECT * FROM products WHERE 1=1`;
  const params = [];
  if (category && category !== 'all') {
    sql += ` AND category = ?`;
    params.push(category);
  }
  if (search) {
    sql += ` AND name LIKE ?`;
    params.push(`%${search}%`);
  }
  if (sort === 'price-asc') sql += ` ORDER BY price ASC`;
  else if (sort === 'price-desc') sql += ` ORDER BY price DESC`;
  else if (sort === 'name-asc') sql += ` ORDER BY name ASC`;
  else if (sort === 'popular') sql += ` ORDER BY popular DESC`;
  else sql += ` ORDER BY id ASC`;
  
  db.all(sql, params, (err, products) => {
    if (err) return res.status(500).json({ error: 'Ошибка базы данных' });
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = products.slice((page-1)*limit, page*limit);
    res.json({ products: paginated, totalPages, currentPage: page, total });
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get(`SELECT * FROM products WHERE id = ?`, [req.params.id], (err, product) => {
    if (err || !product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  });
});

// Promotions
app.get('/api/promotions', (req, res) => {
  db.all(`SELECT * FROM promotions`, [], (err, promotions) => {
    if (err) return res.status(500).json({ error: 'Ошибка' });
    res.json(promotions);
  });
});

// Cart
app.get('/api/cart', authenticateToken, (req, res) => {
  db.all(`SELECT productId, qty FROM carts WHERE userId = ?`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка' });
    if (rows.length === 0) return res.json({ items: [] });
    const productIds = rows.map(r => r.productId);
    const placeholders = productIds.map(() => '?').join(',');
    db.all(`SELECT * FROM products WHERE id IN (${placeholders})`, productIds, (err, products) => {
      if (err) return res.status(500).json({ error: 'Ошибка' });
      const items = rows.map(row => {
        const product = products.find(p => p.id === row.productId);
        return { id: product.id, name: product.name, price: product.price, image: product.image, qty: row.qty };
      });
      res.json({ items });
    });
  });
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || qty === undefined) return res.status(400).json({ error: 'Необходимы productId и qty' });
  if (qty <= 0) {
    db.run(`DELETE FROM carts WHERE userId = ? AND productId = ?`, [req.user.id, productId], err => {
      if (err) return res.status(500).json({ error: 'Ошибка' });
      res.json({ success: true });
    });
  } else {
    db.run(`INSERT OR REPLACE INTO carts (userId, productId, qty) VALUES (?, ?, ?)`, [req.user.id, productId, qty], err => {
      if (err) return res.status(500).json({ error: 'Ошибка' });
      res.json({ success: true });
    });
  }
});

app.delete('/api/cart/:productId', authenticateToken, (req, res) => {
  db.run(`DELETE FROM carts WHERE userId = ? AND productId = ?`, [req.user.id, req.params.productId], err => {
    if (err) return res.status(500).json({ error: 'Ошибка' });
    res.json({ success: true });
  });
});

// Orders
app.post('/api/orders', authenticateToken, (req, res) => {
  const { name, phone, email, address, items, total } = req.body;
  if (!name || !phone || !email || !address || !items || !total) {
    return res.status(400).json({ error: 'Не все поля заполнены' });
  }
  const date = new Date().toLocaleString();
  const itemsJson = JSON.stringify(items);
  db.run(`INSERT INTO orders (userId, date, name, phone, email, address, items, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, date, name, phone, email, address, itemsJson, total], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка сохранения заказа' });
      db.run(`DELETE FROM carts WHERE userId = ?`, [req.user.id], () => {
        res.json({ success: true, orderId: this.lastID });
      });
    });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM orders WHERE userId = ? ORDER BY id DESC`, [req.user.id], (err, orders) => {
    if (err) return res.status(500).json({ error: 'Ошибка' });
    orders = orders.map(o => ({ ...o, items: JSON.parse(o.items) }));
    res.json(orders);
  });
});

// Profile
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ login: req.user.login });
});

app.delete('/api/profile', authenticateToken, (req, res) => {
  db.run(`DELETE FROM users WHERE id = ?`, [req.user.id], err => {
    if (err) return res.status(500).json({ error: 'Ошибка' });
    db.run(`DELETE FROM carts WHERE userId = ?`, [req.user.id]);
    db.run(`DELETE FROM orders WHERE userId = ?`, [req.user.id]);
    res.json({ success: true });
  });
});

// ---------- Admin API ----------
app.get('/api/admin/products', authenticateAdmin, (req, res) => {
  db.all(`SELECT * FROM products ORDER BY id ASC`, [], (err, products) => {
    if (err) return res.status(500).json({ error: 'Ошибка' });
    res.json(products);
  });
});

app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  const { id, name, price, oldPrice, image, description, category, badge, popular } = req.body;
  if (!name || !price || !category) return res.status(400).json({ error: 'Название, цена и категория обязательны' });
  if (id) {
    db.run(`UPDATE products SET name=?, price=?, oldPrice=?, image=?, description=?, category=?, badge=?, popular=? WHERE id=?`,
      [name, price, oldPrice || null, image, description, category, badge, popular || 0, id], function(err) {
        if (err) return res.status(500).json({ error: 'Ошибка обновления' });
        res.json({ success: true, id });
      });
  } else {
    db.run(`INSERT INTO products (name, price, oldPrice, image, description, category, badge, popular) VALUES (?,?,?,?,?,?,?,?)`,
      [name, price, oldPrice || null, image, description, category, badge, popular || 0], function(err) {
        if (err) return res.status(500).json({ error: 'Ошибка добавления' });
        res.json({ success: true, id: this.lastID });
      });
  }
});

app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], err => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ success: true });
  });
});

app.get('/api/admin/promotions', authenticateAdmin, (req, res) => {
  db.all(`SELECT * FROM promotions ORDER BY id ASC`, [], (err, promotions) => {
    if (err) return res.status(500).json({ error: 'Ошибка' });
    res.json(promotions);
  });
});

app.post('/api/admin/promotions', authenticateAdmin, (req, res) => {
  const { id, title, text, image, date, models } = req.body;
  if (!title) return res.status(400).json({ error: 'Название акции обязательно' });
  if (id) {
    db.run(`UPDATE promotions SET title=?, text=?, image=?, date=?, models=? WHERE id=?`,
      [title, text, image, date, models, id], err => {
        if (err) return res.status(500).json({ error: 'Ошибка обновления' });
        res.json({ success: true, id });
      });
  } else {
    db.run(`INSERT INTO promotions (title, text, image, date, models) VALUES (?,?,?,?,?)`,
      [title, text, image, date, models], function(err) {
        if (err) return res.status(500).json({ error: 'Ошибка добавления' });
        res.json({ success: true, id: this.lastID });
      });
  }
});

app.delete('/api/admin/promotions/:id', authenticateAdmin, (req, res) => {
  db.run(`DELETE FROM promotions WHERE id = ?`, [req.params.id], err => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ success: true });
  });
});

// Serve admin HTML
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin (login: admin, password: admin123)`);
});