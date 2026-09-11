require("dotenv").config();

const express = require("express"),
  path = require("path"),
  fs = require("fs"),
  bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  crypto = require("crypto");

const app = express();

app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "change-me";
const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@goodnewsshopping.com"
).toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const DB =
  process.env.DB_FILE || path.join(__dirname, "data.json");

let db = {
  users: [],
  products: [],
  orders: [],
  categories: []
};

if (fs.existsSync(DB)) {
  try {
    db = JSON.parse(fs.readFileSync(DB));
  } catch {}
}

function save() {
  fs.writeFileSync(DB, JSON.stringify(db, null, 2));
}

/* =========================
   PRODUCT CATALOGUE
   ========================= */

const pics = {
  phone:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=90",

  laptop:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=90",

  audio:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=90",

  tv:
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=90",

  fashion:
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90",

  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90",

  home:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=90",

  watch:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=90"
};

const catalogueCategories = [
  ["Phones & Tablets", "📱", "phone", 25000, 750000],
  ["Computing", "💻", "laptop", 45000, 1500000],
  ["Electronics", "🎧", "audio", 8000, 450000],
  ["TV & Audio", "📺", "tv", 25000, 1800000],
  ["Fashion", "👕", "fashion", 5000, 250000],
  ["Shoes", "👟", "shoes", 7000, 300000],
  ["Beauty", "✨", "fashion", 3000, 180000],
  ["Home", "🏠", "home", 10000, 1200000],
  ["Appliances", "🧺", "home", 15000, 900000],
  ["Groceries", "🛒", "home", 1000, 100000],
  ["Gaming", "🎮", "audio", 10000, 900000],
  ["Accessories", "⌚", "watch", 3000, 250000],
  ["Baby", "🍼", "fashion", 3000, 180000],
  ["Sports", "⚽", "shoes", 5000, 350000],
  ["Books", "📚", "home", 2000, 90000],
  ["Office", "🖨️", "laptop", 3000, 500000]
];

const productTypes = [
  "Classic",
  "Premium",
  "Smart",
  "Advanced",
  "Portable",
  "Wireless",
  "Digital",
  "Modern",
  "Pro",
  "Ultra",
  "Essential",
  "Deluxe",
  "Compact",
  "Professional",
  "Everyday",
  "Power",
  "Max",
  "Plus",
  "Elite",
  "Comfort",
  "Performance",
  "Standard",
  "Executive",
  "Signature",
  "Ultimate"
];

const productNames = [
  "Series",
  "Model",
  "Edition",
  "Set",
  "Kit",
  "Pack",
  "Collection",
  "Device",
  "System",
  "Unit",
  "Bundle",
  "Choice",
  "Select",
  "Line",
  "Range",
  "Solution",
  "Gear",
  "Essentials",
  "Station",
  "Hub",
  "Center",
  "Box",
  "Mate",
  "Plus",
  "Pro"
];

function makePrice(min, max, index) {
  const range = max - min;
  const raw = min + ((index * 7919) % Math.max(range, 1));
  return Math.max(
    1000,
    Math.round(raw / 1000) * 1000
  );
}

function makeOldPrice(price, index) {
  if (index % 3 === 0) {
    return Math.round((price * 1.18) / 1000) * 1000;
  }

  if (index % 3 === 1) {
    return Math.round((price * 1.12) / 1000) * 1000;
  }

  return 0;
}

/*
  Make sure database arrays exist.
*/
if (!Array.isArray(db.products)) db.products = [];
if (!Array.isArray(db.categories)) db.categories = [];

/*
  Add all store categories without deleting existing ones.
*/
for (const [name, icon] of catalogueCategories) {
  if (!db.categories.some(c => c.name === name)) {
    db.categories.push({
      name,
      icon
    });
  }
}

/*
  Create exactly 500 catalogue IDs:
  P1 ... P500

  Existing products are NOT deleted.
  If P1-P9 already exist from your old store,
  the missing products are simply added.
*/
const existingIds = new Set(
  db.products.map(p => p.id)
);

const generatedProducts = [];

for (let c = 0; c < catalogueCategories.length; c++) {
  const [
    category,
    icon,
    picture,
    minPrice,
    maxPrice
  ] = catalogueCategories[c];

  for (let i = 0; i < productTypes.length; i++) {
    const number =
      c * productTypes.length + i + 1;

    if (number > 400) continue;

    const type = productTypes[i];
    const item = productNames[i];

    const id = "P" + number;

    const name =
      type +
      " " +
      category.replace(" & ", " ") +
      " " +
      item;

    const price = makePrice(
      minPrice,
      maxPrice,
      number
    );

    const oldPrice = makeOldPrice(
      price,
      number
    );

    generatedProducts.push({
      id,
      name,
      category,
      price,
      oldPrice,
      image: pics[picture],
      rating: Number(
        (4.2 + ((number % 8) / 10)).toFixed(1)
      ),
      stock: 10 + (number % 41),
      deal: number <= 80 || number % 7 === 0,
      description:
        "Quality " +
        category.toLowerCase() +
        " product from Good News Shopping."
    });
  }
}

/*
  Add another 100 products to reach 500.
*/
for (let i = 0; i < 100; i++) {
  const source =
    generatedProducts[i % generatedProducts.length];

  const number = 401 + i;
  const id = "P" + number;

  generatedProducts.push({
    id,
    name: source.name + " Plus",
    category: source.category,
    price: Math.max(
      1000,
      Math.round(
        (source.price * (1.05 + (i % 5) / 100)) / 1000
      ) * 1000
    ),
    oldPrice:
      i % 2 === 0
        ? Math.round(
            (source.price * 1.18) / 1000
          ) * 1000
        : 0,
    image: source.image,
    rating: Number(
      (4.3 + ((number % 7) / 10)).toFixed(1)
    ),
    stock: 15 + (i % 35),
    deal: i % 4 === 0,
    description:
      "Quality " +
      source.category.toLowerCase() +
      " product from Good News Shopping."
  });
}

/*
  Add only products that do not already exist.
*/
let productsAdded = 0;

for (const product of generatedProducts) {
  if (!existingIds.has(product.id)) {
    db.products.push(product);
    productsAdded++;
  }
}

if (productsAdded > 0) {
  save();
  console.log(
    `Good News Shopping catalogue: added ${productsAdded} products. Total: ${db.products.length}`
  );
}

if (!db.categories.length) {
  db.categories = catalogueCategories.map(x => ({
    name: x[0],
    icon: x[1]
  }));

  save();
}

/* =========================
   AUTH / HELPERS
   ========================= */

function uid(p) {
  return (
    p +
    "-" +
    crypto
      .randomBytes(5)
      .toString("hex")
      .toUpperCase()
  );
}

function safe(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  };
}

function tok(u) {
  return jwt.sign(
    {
      id: u.id,
      email: u.email,
      role: u.role
    },
    SECRET,
    {
      expiresIn: "7d"
    }
  );
}

function auth(req, res, next) {
  const h = req.headers.authorization || "";

  try {
    req.user = jwt.verify(
      h.replace("Bearer ", ""),
      SECRET
    );

    next();
  } catch {
    res
      .status(401)
      .json({
        message: "Please sign in."
      });
  }
}

function admin(req, res, next) {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({
        message: "Admin only."
      });
  }

  next();
}

function cleanProduct(
  body,
  existing = {}
) {
  return {
    name: String(
      body.name ??
        existing.name ??
        ""
    ).trim(),

    category: String(
      body.category ??
        existing.category ??
        ""
    ).trim(),

    price: Number(
      body.price ??
        existing.price ??
        0
    ),

    oldPrice: Number(
      body.oldPrice ??
        existing.oldPrice ??
        0
    ),

    image: String(
      body.image ??
        existing.image ??
        ""
    ).trim(),

    stock: Math.max(
      0,
      Math.floor(
        Number(
          body.stock ??
            existing.stock ??
            0
        )
      )
    ),

    rating:
      Number(
        body.rating ??
          existing.rating ??
          4.5
      ) || 4.5,

    deal: Boolean(
      body.deal ??
        existing.deal ??
        false
    ),

    description: String(
      body.description ??
        existing.description ??
        ""
    ).trim()
  };
}

/* =========================
   STATIC WEBSITE
   ========================= */

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

/* =========================
   PRODUCTS
   ========================= */

app.get(
  "/api/products",
  (q, r) =>
    r.json({
      products: db.products,
      categories: db.categories
    })
);

/* =========================
   AUTH
   ========================= */

app.post(
  "/api/auth/register",
  async (q, r) => {
    const {
      name,
      email,
      password
    } = q.body || {};

    const e = String(
      email || ""
    )
      .trim()
      .toLowerCase();

    if (
      !name ||
      !e ||
      !password
    ) {
      return r
        .status(400)
        .json({
          message:
            "All fields are required."
        });
    }

    if (password.length < 6) {
      return r
        .status(400)
        .json({
          message:
            "Password must be at least 6 characters."
        });
    }

    if (
      db.users.some(
        u => u.email === e
      )
    ) {
      return r
        .status(409)
        .json({
          message:
            "Email already registered."
        });
    }

    const u = {
      id: uid("USR"),
      name: String(name).trim(),
      email: e,
      passwordHash:
        await bcrypt.hash(
          password,
          12
        ),
      role: "customer",
      createdAt:
        new Date().toISOString()
    };

    db.users.push(u);
    save();

    r.json({
      user: safe(u),
      token: tok(u)
    });
  }
);

app.post(
  "/api/auth/login",
  async (q, r) => {
    const {
      email,
      password
    } = q.body || {};

    const e = String(
      email || ""
    )
      .trim()
      .toLowerCase();

    let u = db.users.find(
      x => x.email === e
    );

    if (
      !u &&
      e === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {
      u = {
        id: "ADMIN",
        name: "Good News Admin",
        email: ADMIN_EMAIL,
        role: "admin",
        createdAt:
          new Date().toISOString()
      };
    }

    if (!u) {
      return r
        .status(401)
        .json({
          message:
            "Invalid email or password."
        });
    }

    if (
      u.role !== "admin" &&
      !(await bcrypt.compare(
        password,
        u.passwordHash
      ))
    ) {
      return r
        .status(401)
        .json({
          message:
            "Invalid email or password."
        });
    }

    r.json({
      user: safe(u),
      token: tok(u)
    });
  }
);

/* =========================
   CUSTOMER ORDERS
   ========================= */

app.get(
  "/api/orders/my",
  auth,
  (q, r) =>
    r.json({
      orders: db.orders
        .filter(
          o =>
            o.userId ===
            q.user.id
        )
        .reverse()
    })
);

/* =========================
   WHATSAPP NOTIFICATION
   ========================= */

async function notify(o) {
  const token =
    process.env.WHATSAPP_ACCESS_TOKEN;

  const id =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  const to =
    process.env.ADMIN_WHATSAPP;

  if (!token || !id || !to) {
    console.log(
      "WhatsApp Cloud API not configured for",
      o.orderNumber
    );

    return;
  }

  const body =
    `New order ${o.orderNumber}\n` +
    `Customer: ${o.customer.name}\n` +
    `Phone: ${o.customer.phone}\n` +
    `Total: ₦${o.total.toLocaleString()}`;

  try {
    const x = await fetch(
      `https://graph.facebook.com/v23.0/${id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${token}`,
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          messaging_product:
            "whatsapp",
          to,
          type: "text",
          text: {
            body
          }
        })
      }
    );

    console.log(
      await x.json()
    );
  } catch (e) {
    console.error(
      e.message
    );
  }
}

/* =========================
   CREATE ORDER
   ========================= */

app.post(
  "/api/orders",
  auth,
  async (q, r) => {
    const {
      name,
      phone,
      state,
      city,
      address,
      paymentMethod,
      items
    } = q.body || {};

    if (
      !name ||
      !phone ||
      !state ||
      !city ||
      !address ||
      !items?.length
    ) {
      return r
        .status(400)
        .json({
          message:
            "Complete checkout first."
        });
    }

    let total = 0;
    const out = [];

    for (const i of items) {
      const p =
        db.products.find(
          x =>
            x.id ===
            i.productId
        );

      const qty = Math.max(
        1,
        Number(i.qty)
      );

      if (
        !p ||
        p.stock < qty
      ) {
        return r
          .status(400)
          .json({
            message:
              "Product unavailable or out of stock."
          });
      }

      p.stock -= qty;

      total +=
        p.price * qty;

      out.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        qty,
        image: p.image
      });
    }

    const delivery =
      total > 500000
        ? 0
        : 2500;

    const o = {
      id: uid("ORD"),

      orderNumber:
        "GN-" +
        Math.floor(
          10000000 +
            Math.random() *
              89999999
        ),

      userId:
        q.user.id,

      customer: {
        name,
        phone,
        state,
        city,
        address
      },

      paymentMethod,

      items: out,

      subtotal: total,

      delivery,

      total:
        total + delivery,

      status: "placed",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    };

    db.orders.push(o);

    save();

    notify(o);

    r.status(201).json({
      order: o
    });
  }
);

/* =========================
   ADMIN PRODUCTS
   ========================= */

app.get(
  "/api/admin/products",
  auth,
  admin,
  (q, r) =>
    r.json({
      products: db.products,
      categories:
        db.categories
    })
);

app.post(
  "/api/admin/products",
  auth,
  admin,
  (q, r) => {
    const p =
      cleanProduct(
        q.body || {}
      );

    if (
      !p.name ||
      !p.category ||
      !p.price ||
      !p.image
    ) {
      return r
        .status(400)
        .json({
          message:
            "Name, category, price and image are required."
        });
    }

    if (
      !db.categories.some(
        c =>
          c.name ===
          p.category
      )
    ) {
      db.categories.push({
        name: p.category,
        icon: "🛍️"
      });
    }

    const product = {
      id: uid("P"),
      ...p
    };

    db.products.unshift(
      product
    );

    save();

    r.status(201).json({
      product
    });
  }
);

app.patch(
  "/api/admin/products/:id",
  auth,
  admin,
  (q, r) => {
    const i =
      db.products.findIndex(
        x =>
          x.id ===
          q.params.id
      );

    if (i < 0) {
      return r
        .status(404)
        .json({
          message:
            "Product not found."
        });
    }

    const p =
      cleanProduct(
        q.body || {},
        db.products[i]
      );

    if (
      !p.name ||
      !p.category ||
      !p.price ||
      !p.image
    ) {
      return r
        .status(400)
        .json({
          message:
            "Name, category, price and image are required."
        });
    }

    if (
      !db.categories.some(
        c =>
          c.name ===
          p.category
      )
    ) {
      db.categories.push({
        name: p.category,
        icon: "🛍️"
      });
    }

    db.products[i] = {
      ...db.products[i],
      ...p
    };

    save();

    r.json({
      product:
        db.products[i]
    });
  }
);

app.delete(
  "/api/admin/products/:id",
  auth,
  admin,
  (q, r) => {
    const i =
      db.products.findIndex(
        x =>
          x.id ===
          q.params.id
      );

    if (i < 0) {
      return r
        .status(404)
        .json({
          message:
            "Product not found."
        });
    }

    const [removed] =
      db.products.splice(
        i,
        1
      );

    save();

    r.json({
      product: removed
    });
  }
);

/* =========================
   ADMIN ORDERS
   ========================= */

app.get(
  "/api/admin/orders",
  auth,
  admin,
  (q, r) =>
    r.json({
      orders: [
        ...db.orders
      ].reverse()
    })
);

app.patch(
  "/api/admin/orders/:id",
  auth,
  admin,
  (q, r) => {
    const o =
      db.orders.find(
        x =>
          x.id ===
          q.params.id
      );

    if (!o) {
      return r
        .status(404)
        .json({
          message:
            "Order not found."
        });
    }

    o.status =
      q.body.status;

    o.updatedAt =
      new Date().toISOString();

    save();

    r.json({
      order: o
    });
  }
);

/* =========================
   HEALTH CHECK
   ========================= */

app.get(
  "/api/health",
  (q, r) =>
    r.json({
      ok: true
    })
);

/* =========================
   ADMIN PAGE
   ========================= */

app.get(
  "/admin",
  (q, r) =>
    r.sendFile(
      path.join(
        __dirname,
        "public/admin/index.html"
      )
    )
);

/* =========================
   WEBSITE FALLBACK
   ========================= */

app.get(
  "*",
  (q, r) =>
    r.sendFile(
      path.join(
        __dirname,
        "public/index.html"
      )
    )
);

/* =========================
   START SERVER
   ========================= */

app.listen(
  PORT,
  () =>
    console.log(
      `Good News Shopping: http://localhost:${PORT}`
    )
);
