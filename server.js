require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = express();

app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;

const SECRET =
  process.env.JWT_SECRET || "change-me";

const ADMIN_EMAIL =
  (
    process.env.ADMIN_EMAIL ||
    "admin@goodnewsshopping.com"
  ).toLowerCase();

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  "ChangeMe123!";

const DB =
  process.env.DB_FILE ||
  path.join(__dirname, "data.json");

let db = {
  users: [],
  products: [],
  orders: [],
  categories: []
};

if (fs.existsSync(DB)) {
  try {
    db = JSON.parse(
      fs.readFileSync(DB, "utf8")
    );
  } catch {
    console.log("Could not read database.");
  }
}

if (!Array.isArray(db.users)) {
  db.users = [];
}

if (!Array.isArray(db.products)) {
  db.products = [];
}

if (!Array.isArray(db.orders)) {
  db.orders = [];
}

if (!Array.isArray(db.categories)) {
  db.categories = [];
}

function save() {
  fs.writeFileSync(
    DB,
    JSON.stringify(db, null, 2)
  );
}

/* =====================================================
   GOOD NEWS SHOPPING - LARGE PRODUCT CATALOGUE
   ===================================================== */

const catalogue = [
  {
    category: "Phones & Tablets",
    icon: "📱",
    search: "smartphone,tablet",
    items: [
      "Smartphone 128GB",
      "Smartphone 256GB",
      "Android Smartphone",
      "5G Smartphone",
      "Budget Smartphone",
      "Camera Smartphone",
      "Gaming Smartphone",
      "Foldable Smartphone",
      "Mini Smartphone",
      "Premium Smartphone",
      "Tablet 8-inch",
      "Tablet 10-inch",
      "Tablet 11-inch",
      "Android Tablet",
      "Kids Tablet",
      "Drawing Tablet",
      "Study Tablet",
      "Wi-Fi Tablet",
      "Tablet Keyboard",
      "Tablet Case",
      "Fast Phone Charger",
      "Wireless Phone Charger",
      "Phone Power Bank",
      "USB-C Cable",
      "Phone Stand"
    ]
  },

  {
    category: "Computing",
    icon: "💻",
    search: "laptop,computer",
    items: [
      "Student Laptop",
      "Business Laptop",
      "Gaming Laptop",
      "Slim Laptop",
      "15-inch Laptop",
      "14-inch Laptop",
      "2-in-1 Laptop",
      "Professional Laptop",
      "Budget Laptop",
      "Premium Laptop",
      "Desktop Computer",
      "Mini Desktop PC",
      "All-in-One Computer",
      "Computer Monitor",
      "27-inch Monitor",
      "24-inch Monitor",
      "Mechanical Keyboard",
      "Wireless Keyboard",
      "Gaming Mouse",
      "Wireless Mouse",
      "Laptop Stand",
      "Laptop Backpack",
      "USB Hub",
      "External SSD",
      "Webcam"
    ]
  },

  {
    category: "Electronics",
    icon: "🎧",
    search: "electronics,gadget",
    items: [
      "Bluetooth Speaker",
      "Portable Speaker",
      "Wireless Earbuds",
      "Noise Cancelling Headphones",
      "Over-Ear Headphones",
      "Neckband Earphones",
      "Digital Camera",
      "Action Camera",
      "Ring Light",
      "LED Desk Light",
      "Smart Plug",
      "Power Strip",
      "Extension Box",
      "Rechargeable Fan",
      "Electric Kettle",
      "Hair Dryer",
      "Electric Shaver",
      "Body Massager",
      "Portable Projector",
      "Voice Recorder",
      "Wireless Microphone",
      "FM Radio",
      "Digital Alarm Clock",
      "Power Bank",
      "USB Fan"
    ]
  },

  {
    category: "TV & Audio",
    icon: "📺",
    search: "television,tv",
    items: [
      "32-inch Smart TV",
      "40-inch Smart TV",
      "43-inch Smart TV",
      "50-inch Smart TV",
      "55-inch Smart TV",
      "65-inch Smart TV",
      "75-inch Smart TV",
      "4K LED TV",
      "4K QLED TV",
      "OLED Smart TV",
      "Android TV Box",
      "Streaming Stick",
      "Home Theatre System",
      "Soundbar System",
      "Bluetooth Sound System",
      "Subwoofer",
      "Digital Decoder",
      "TV Wall Mount",
      "TV Stand",
      "HDMI Cable",
      "Optical Audio Cable",
      "Satellite Receiver",
      "Mini Projector",
      "Projector Screen",
      "Portable TV"
    ]
  },

  {
    category: "Fashion",
    icon: "👕",
    search: "clothing,fashion",
    items: [
      "Men's T-Shirt",
      "Women's T-Shirt",
      "Men's Shirt",
      "Women's Blouse",
      "Men's Trousers",
      "Women's Trousers",
      "Men's Jeans",
      "Women's Jeans",
      "Men's Hoodie",
      "Women's Hoodie",
      "Men's Jacket",
      "Women's Jacket",
      "Men's Shorts",
      "Women's Shorts",
      "Men's Suit",
      "Women's Dress",
      "Maxi Dress",
      "Skirt",
      "Polo Shirt",
      "Sports Jersey",
      "Traditional Outfit",
      "Cardigan",
      "Sweater",
      "Nightwear Set",
      "Clothing Pack"
    ]
  },

  {
    category: "Shoes",
    icon: "👟",
    search: "shoes,footwear",
    items: [
      "Men's Sneakers",
      "Women's Sneakers",
      "Running Shoes",
      "Football Boots",
      "Basketball Shoes",
      "Canvas Shoes",
      "Casual Shoes",
      "Formal Shoes",
      "Loafers",
      "Slippers",
      "Slides",
      "Sandals",
      "High Heels",
      "Flat Shoes",
      "School Shoes",
      "Safety Boots",
      "Hiking Shoes",
      "Tennis Shoes",
      "Training Shoes",
      "Walking Shoes",
      "Children's Sneakers",
      "Children's Sandals",
      "Leather Shoes",
      "Sports Slides",
      "Fashion Boots"
    ]
  },

  {
    category: "Beauty",
    icon: "✨",
    search: "beauty,cosmetics",
    items: [
      "Face Cleanser",
      "Face Cream",
      "Body Lotion",
      "Body Wash",
      "Shampoo",
      "Conditioner",
      "Hair Oil",
      "Hair Gel",
      "Hair Brush",
      "Hair Dryer Brush",
      "Perfume",
      "Body Spray",
      "Deodorant",
      "Lip Gloss",
      "Lipstick",
      "Makeup Kit",
      "Foundation",
      "Face Powder",
      "Mascara",
      "Eyeliner",
      "Nail Polish",
      "Nail Care Set",
      "Sunscreen",
      "Beauty Mirror",
      "Makeup Brush Set"
    ]
  },

  {
    category: "Home",
    icon: "🏠",
    search: "home,furniture",
    items: [
      "Modern Sofa",
      "Office Chair",
      "Dining Table",
      "Dining Chair",
      "Bed Frame",
      "Mattress",
      "Bedside Table",
      "Wardrobe",
      "Bookshelf",
      "TV Stand",
      "Coffee Table",
      "Study Desk",
      "Curtains",
      "Floor Rug",
      "Wall Mirror",
      "Storage Box",
      "Shoe Rack",
      "Laundry Basket",
      "Pillow Set",
      "Bedsheet Set",
      "Blanket",
      "Duvet",
      "Table Lamp",
      "Floor Lamp",
      "Wall Clock"
    ]
  },

  {
    category: "Appliances",
    icon: "🧺",
    search: "home,appliance",
    items: [
      "Refrigerator",
      "Washing Machine",
      "Microwave Oven",
      "Blender",
      "Air Fryer",
      "Electric Cooker",
      "Gas Cooker",
      "Rice Cooker",
      "Toaster",
      "Sandwich Maker",
      "Electric Iron",
      "Standing Fan",
      "Table Fan",
      "Air Conditioner",
      "Water Dispenser",
      "Dishwasher",
      "Freezer",
      "Food Processor",
      "Juicer",
      "Coffee Maker",
      "Electric Grill",
      "Slow Cooker",
      "Vacuum Cleaner",
      "Steam Mop",
      "Hand Mixer"
    ]
  },

  {
    category: "Groceries",
    icon: "🛒",
    search: "groceries,food",
    items: [
      "Rice 5kg",
      "Rice 10kg",
      "Beans 1kg",
      "Spaghetti Pack",
      "Macaroni Pack",
      "Instant Noodles",
      "Cooking Oil 1L",
      "Cooking Oil 2L",
      "Chocolate Drink",
      "Corn Flakes",
      "Sugar 1kg",
      "Salt 1kg",
      "Tomato Paste",
      "Biscuit Pack",
      "Tea Pack",
      "Milk Powder",
      "Oats Pack",
      "Peanut Butter",
      "Mayonnaise",
      "Ketchup",
      "Breakfast Cereal",
      "Bottled Water",
      "Fruit Juice",
      "Chocolate Bar",
      "Canned Sardines"
    ]
  },

  {
    category: "Gaming",
    icon: "🎮",
    search: "gaming,video-game",
    items: [
      "Gaming Console",
      "Game Controller",
      "Wireless Controller",
      "Gaming Headset",
      "Gaming Keyboard",
      "Gaming Mouse",
      "Gaming Monitor",
      "Gaming Chair",
      "Console Charging Dock",
      "Console Carry Case",
      "Racing Wheel",
      "Gaming Microphone",
      "VR Headset",
      "Game Storage Drive",
      "Controller Grip",
      "Gaming Desk",
      "Gaming Mouse Pad",
      "RGB Light Strip",
      "Game Capture Card",
      "Portable Gaming Device",
      "Gamepad Holder",
      "Console Cooling Fan",
      "Gaming Speakers",
      "Arcade Stick",
      "Gaming Cable"
    ]
  },

  {
    category: "Accessories",
    icon: "⌚",
    search: "fashion,accessories",
    items: [
      "Wrist Watch",
      "Smart Watch",
      "Leather Watch",
      "Digital Watch",
      "Necklace",
      "Pendant Necklace",
      "Bracelet",
      "Bangle",
      "Earrings",
      "Fashion Ring",
      "Sunglasses",
      "Reading Glasses",
      "Handbag",
      "Shoulder Bag",
      "Crossbody Bag",
      "Backpack",
      "School Bag",
      "Travel Backpack",
      "Wallet",
      "Card Holder",
      "Leather Belt",
      "Baseball Cap",
      "Fashion Hat",
      "Scarf",
      "Travel Bag"
    ]
  },

  {
    category: "Baby",
    icon: "🍼",
    search: "baby,children",
    items: [
      "Baby Stroller",
      "Baby Carrier",
      "Baby Feeding Bottle",
      "Baby Clothes Set",
      "Baby Shoes",
      "Baby Blanket",
      "Baby Bath Set",
      "Baby Diapers",
      "Baby Wipes",
      "Baby Shampoo",
      "Baby Lotion",
      "Baby Powder",
      "Baby Bib",
      "Baby Feeding Set",
      "Baby Monitor",
      "Baby Walker",
      "Baby Rocking Chair",
      "Baby Changing Mat",
      "Baby Pillow",
      "Baby Sleeping Bag",
      "Baby Toy Set",
      "Baby Bath Tub",
      "Baby Safety Gate",
      "Baby Bottle Warmer",
      "Baby Backpack"
    ]
  },

  {
    category: "Sports",
    icon: "⚽",
    search: "sports,fitness",
    items: [
      "Football",
      "Basketball",
      "Tennis Racket",
      "Badminton Racket",
      "Volleyball",
      "Football Jersey",
      "Sports Shorts",
      "Running Shirt",
      "Sports Trousers",
      "Gym Gloves",
      "Yoga Mat",
      "Skipping Rope",
      "Dumbbell Set",
      "Resistance Bands",
      "Exercise Bike",
      "Treadmill",
      "Punching Bag",
      "Boxing Gloves",
      "Sports Water Bottle",
      "Sports Bag",
      "Football Boots",
      "Training Cones",
      "Goal Net",
      "Tennis Balls",
      "Sports Watch"
    ]
  },

  {
    category: "Books",
    icon: "📚",
    search: "books,book",
    items: [
      "Novel Book",
      "Business Book",
      "Law Book",
      "History Book",
      "Science Book",
      "Mathematics Book",
      "English Grammar Book",
      "Dictionary",
      "Study Guide",
      "Exam Practice Book",
      "Children's Story Book",
      "Cookbook",
      "Biography Book",
      "Self Development Book",
      "Leadership Book",
      "Finance Book",
      "Technology Book",
      "Computer Science Book",
      "Programming Book",
      "Christian Book",
      "Poetry Book",
      "Notebook Journal",
      "Sketch Book",
      "Activity Book",
      "Workbook"
    ]
  },

  {
    category: "Office",
    icon: "🖨️",
    search: "office,stationery",
    items: [
      "Laser Printer",
      "Inkjet Printer",
      "Printer Ink",
      "Printer Paper",
      "A4 Paper Pack",
      "Stapler",
      "Staple Pins",
      "Office Scissors",
      "Desk Organizer",
      "File Folder",
      "Document Folder",
      "Calculator",
      "Whiteboard",
      "Whiteboard Marker",
      "Office Desk",
      "Office Chair",
      "Desk Lamp",
      "Paper Shredder",
      "Laminator",
      "Paper Cutter",
      "Sticky Notes",
      "Envelope Pack",
      "Pen Set",
      "Pencil Set",
      "USB Flash Drive"
    ]
  }
];

/* =====================================================
   PRICE RANGES
   ===================================================== */

const priceRanges = {
  "Phones & Tablets": [25000, 750000],
  "Computing": [45000, 1500000],
  "Electronics": [5000, 450000],
  "TV & Audio": [20000, 1800000],
  "Fashion": [5000, 250000],
  "Shoes": [7000, 300000],
  "Beauty": [3000, 180000],
  "Home": [10000, 1200000],
  "Appliances": [15000, 900000],
  "Groceries": [1000, 100000],
  "Gaming": [10000, 900000],
  "Accessories": [3000, 250000],
  "Baby": [3000, 180000],
  "Sports": [5000, 350000],
  "Books": [2000, 90000],
  "Office": [3000, 500000]
};

/* =====================================================
   IMAGE GENERATOR
   ===================================================== */

function productImage(
  search,
  productName,
  number
) {
  const keywords =
    encodeURIComponent(
      `${search},${productName}`
    );

  return (
    `https://loremflickr.com/1200/900/${keywords}` +
    `?lock=${number}`
  );
}

/* =====================================================
   PRICE GENERATOR
   ===================================================== */

function productPrice(
  category,
  number
) {
  const range =
    priceRanges[category] ||
    [5000, 500000];

  const min = range[0];
  const max = range[1];

  const value =
    min +
    ((number * 7919) %
      (max - min));

  return Math.max(
    1000,
    Math.round(value / 1000) * 1000
  );
}

function oldPrice(
  price,
  number
) {
  if (number % 3 === 0) {
    return (
      Math.round(
        (price * 1.18) / 1000
      ) * 1000
    );
  }

  if (number % 3 === 1) {
    return (
      Math.round(
        (price * 1.12) / 1000
      ) * 1000
    );
  }

  return 0;
}

/* =====================================================
   CREATE 500 PRODUCTS
   ===================================================== */

const generatedProducts = [];

let productNumber = 1;

for (
  const category of catalogue
) {
  for (
    const name of category.items
  ) {
    if (productNumber > 400) {
      break;
    }

    const price =
      productPrice(
        category.category,
        productNumber
      );

    generatedProducts.push({
      id:
        "P" +
        productNumber,

      name,

      category:
        category.category,

      price,

      oldPrice:
        oldPrice(
          price,
          productNumber
        ),

      image:
        productImage(
          category.search,
          name,
          productNumber
        ),

      rating:
        Number(
          (
            4.2 +
            ((productNumber % 8) /
              10)
          ).toFixed(1)
        ),

      stock:
        10 +
        (productNumber % 41),

      deal:
        productNumber <= 80 ||
        productNumber % 7 === 0,

      description:
        `Quality ${name.toLowerCase()} from Good News Shopping.`
    });

    productNumber++;
  }
}

/* =====================================================
   100 EXTRA PRODUCTS
   ===================================================== */

const extraNames = [
  "Premium Phone Bundle",
  "Premium Tablet Bundle",
  "Premium Laptop Bundle",
  "Premium Speaker Bundle",
  "Premium Headphone Bundle",
  "Premium TV Bundle",
  "Premium Fashion Bundle",
  "Premium Shoe Bundle",
  "Premium Beauty Bundle",
  "Premium Home Bundle",
  "Premium Appliance Bundle",
  "Premium Grocery Bundle",
  "Premium Gaming Bundle",
  "Premium Watch Bundle",
  "Premium Baby Bundle",
  "Premium Sports Bundle",
  "Premium Book Bundle",
  "Premium Office Bundle",
  "Family Shopping Bundle",
  "Student Shopping Bundle",
  "Business Shopping Bundle",
  "Travel Shopping Bundle",
  "Home Starter Bundle",
  "Office Starter Bundle",
  "Gaming Starter Bundle"
];

const extraCategories = [
  "Phones & Tablets",
  "Computing",
  "Electronics",
  "TV & Audio",
  "Fashion",
  "Shoes",
  "Beauty",
  "Home",
  "Appliances",
  "Groceries",
  "Gaming",
  "Accessories",
  "Baby",
  "Sports",
  "Books",
  "Office"
];

for (let i = 0; i < 100; i++) {
  const number =
    401 + i;

  const category =
    extraCategories[
      i %
        extraCategories.length
    ];

  const name =
    extraNames[
      i %
        extraNames.length
    ] +
    " " +
    (Math.floor(i / 25) + 1);

  const price =
    productPrice(
      category,
      number
    );

  generatedProducts.push({
    id:
      "P" +
      number,

    name,

    category,

    price,

    oldPrice:
      oldPrice(
        price,
        number
      ),

    image:
      productImage(
        catalogue.find(
          x =>
            x.category ===
            category
        ).search,
        name,
        number
      ),

    rating:
      Number(
        (
          4.3 +
          ((number % 7) /
            10)
        ).toFixed(1)
      ),

    stock:
      15 +
      (i % 35),

    deal:
      i % 4 === 0,

    description:
      `Quality ${name.toLowerCase()} from Good News Shopping.`
  });
}

/* =====================================================
   ADD CATEGORIES
   ===================================================== */

for (
  const category of catalogue
) {
  if (
    !db.categories.some(
      c =>
        c.name ===
        category.category
    )
  ) {
    db.categories.push({
      name:
        category.category,
      icon:
        category.icon
    });
  }
}

/* =====================================================
   REPLACE OLD GENERATED P1-P500
   ===================================================== */

/*
   Products created by the old catalogue used IDs
   such as P1, P2, P3 ... P500.

   Remove only those generated products.

   Admin-created products have IDs such as
   P-ABC123 and are NOT removed.
*/

db.products =
  db.products.filter(
    product =>
      !/^P\d+$/.test(
        String(product.id)
      )
  );

/*
   Put the new 500 products into the database.
*/

db.products = [
  ...generatedProducts,
  ...db.products
];

save();

console.log(
  `Good News Shopping now has ${db.products.length} products.`
);

/* =====================================================
   HELPERS
   ===================================================== */

function uid(prefix) {
  return (
    prefix +
    "-" +
    crypto
      .randomBytes(5)
      .toString("hex")
      .toUpperCase()
  );
}

function safe(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt:
      user.createdAt
  };
}

function tok(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    SECRET,
    {
      expiresIn: "7d"
    }
  );
}

function auth(
  req,
  res,
  next
) {
  const header =
    req.headers.authorization ||
    "";

  try {
    req.user =
      jwt.verify(
        header.replace(
          "Bearer ",
          ""
        ),
        SECRET
      );

    next();
  } catch {
    res
      .status(401)
      .json({
        message:
          "Please sign in."
      });
  }
}

function admin(
  req,
  res,
  next
) {
  if (
    req.user.role !==
    "admin"
  ) {
    return res
      .status(403)
      .json({
        message:
          "Admin only."
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

    description:
      String(
        body.description ??
          existing.description ??
          ""
      ).trim()
  };
}

/* =====================================================
   WEBSITE
   ===================================================== */

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);

/* =====================================================
   PRODUCTS API
   ===================================================== */

app.get(
  "/api/products",
  (req, res) => {
    res.json({
      products:
        db.products,
      categories:
        db.categories
    });
  }
);

/* =====================================================
   REGISTER
   ===================================================== */

app.post(
  "/api/auth/register",
  async (req, res) => {
    const {
      name,
      email,
      password
    } = req.body || {};

    const e =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();

    if (
      !name ||
      !e ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "All fields are required."
        });
    }

    if (
      password.length <
      6
    ) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 6 characters."
        });
    }

    if (
      db.users.some(
        u =>
          u.email === e
      )
    ) {
      return res
        .status(409)
        .json({
          message:
            "Email already registered."
        });
    }

    const user = {
      id: uid("USR"),
      name:
        String(
          name
        ).trim(),
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

    db.users.push(
      user
    );

    save();

    res.json({
      user:
        safe(user),
      token:
        tok(user)
    });
  }
);

/* =====================================================
   LOGIN
   ===================================================== */

app.post(
  "/api/auth/login",
  async (req, res) => {
    const {
      email,
      password
    } = req.body || {};

    const e =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();

    let user =
      db.users.find(
        x =>
          x.email === e
      );

    if (
      !user &&
      e ===
        ADMIN_EMAIL &&
      password ===
        ADMIN_PASSWORD
    ) {
      user = {
        id: "ADMIN",
        name:
          "Good News Admin",
        email:
          ADMIN_EMAIL,
        role: "admin",
        createdAt:
          new Date().toISOString()
      };
    }

    if (!user) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password."
        });
    }

    if (
      user.role !==
        "admin" &&
      !(
        await bcrypt.compare(
          password,
          user.passwordHash
        )
      )
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password."
        });
    }

    res.json({
      user:
        safe(user),
      token:
        tok(user)
    });
  }
);

/* =====================================================
   MY ORDERS
   ===================================================== */

app.get(
  "/api/orders/my",
  auth,
  (req, res) => {
    res.json({
      orders:
        db.orders
          .filter(
            order =>
              order.userId ===
              req.user.id
          )
          .reverse()
    });
  }
);

/* =====================================================
   WHATSAPP
   ===================================================== */

async function notify(order) {
  const token =
    process.env
      .WHATSAPP_ACCESS_TOKEN;

  const id =
    process.env
      .WHATSAPP_PHONE_NUMBER_ID;

  const to =
    process.env
      .ADMIN_WHATSAPP;

  if (
    !token ||
    !id ||
    !to
  ) {
    console.log(
      "WhatsApp Cloud API not configured for",
      order.orderNumber
    );

    return;
  }

  const body =
    `New order ${order.orderNumber}\n` +
    `Customer: ${order.customer.name}\n` +
    `Phone: ${order.customer.phone}\n` +
    `Total: ₦${order.total.toLocaleString()}`;

  try {
    const response =
      await fetch(
        `https://graph.facebook.com/v23.0/${id}/messages`,
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              messaging_product:
                "whatsapp",

              to,

              type:
                "text",

              text: {
                body
              }
            })
        }
      );

    console.log(
      await response.json()
    );
  } catch (error) {
    console.error(
      error.message
    );
  }
}

/* =====================================================
   CREATE ORDER
   ===================================================== */

app.post(
  "/api/orders",
  auth,
  async (req, res) => {
    const {
      name,
      phone,
      state,
      city,
      address,
      paymentMethod,
      items
    } = req.body || {};

    if (
      !name ||
      !phone ||
      !state ||
      !city ||
      !address ||
      !items?.length
    ) {
      return res
        .status(400)
        .json({
          message:
            "Complete checkout first."
        });
    }

    let total = 0;

    const outputItems = [];

    for (
      const item of items
    ) {
      const product =
        db.products.find(
          p =>
            p.id ===
            item.productId
        );

      const quantity =
        Math.max(
          1,
          Number(
            item.qty
          )
        );

      if (
        !product ||
        product.stock <
          quantity
      ) {
        return res
          .status(400)
          .json({
            message:
              "Product unavailable or out of stock."
          });
      }

      product.stock -=
        quantity;

      total +=
        product.price *
        quantity;

      outputItems.push({
        productId:
          product.id,

        name:
          product.name,

        price:
          product.price,

        qty:
          quantity,

        image:
          product.image
      });
    }

    const delivery =
      total > 500000
        ? 0
        : 2500;

    const order = {
      id: uid("ORD"),

      orderNumber:
        "GN-" +
        Math.floor(
          10000000 +
            Math.random() *
              89999999
        ),

      userId:
        req.user.id,

      customer: {
        name,
        phone,
        state,
        city,
        address
      },

      paymentMethod,

      items:
        outputItems,

      subtotal:
        total,

      delivery,

      total:
        total +
        delivery,

      status:
        "placed",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    };

    db.orders.push(
      order
    );

    save();

    notify(order);

    res
      .status(201)
      .json({
        order
      });
  }
);

/* =====================================================
   ADMIN PRODUCTS
   ===================================================== */

app.get(
  "/api/admin/products",
  auth,
  admin,
  (req, res) => {
    res.json({
      products:
        db.products,

      categories:
        db.categories
    });
  }
);

app.post(
  "/api/admin/products",
  auth,
  admin,
  (req, res) => {
    const product =
      cleanProduct(
        req.body || {}
      );

    if (
      !product.name ||
      !product.category ||
      !product.price ||
      !product.image
    ) {
      return res
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
          product.category
      )
    ) {
      db.categories.push({
        name:
          product.category,
        icon:
          "🛍️"
      });
    }

    const newProduct = {
      id: uid("P"),
      ...product
    };

    db.products.unshift(
      newProduct
    );

    save();

    res
      .status(201)
      .json({
        product:
          newProduct
      });
  }
);

app.patch(
  "/api/admin/products/:id",
  auth,
  admin,
  (req, res) => {
    const index =
      db.products.findIndex(
        p =>
          p.id ===
          req.params.id
      );

    if (index < 0) {
      return res
        .status(404)
        .json({
          message:
            "Product not found."
        });
    }

    const product =
      cleanProduct(
        req.body || {},
        db.products[index]
      );

    if (
      !product.name ||
      !product.category ||
      !product.price ||
      !product.image
    ) {
      return res
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
          product.category
      )
    ) {
      db.categories.push({
        name:
          product.category,
        icon:
          "🛍️"
      });
    }

    db.products[index] = {
      ...db.products[index],
      ...product
    };

    save();

    res.json({
      product:
        db.products[index]
    });
  }
);

app.delete(
  "/api/admin/products/:id",
  auth,
  admin,
  (req, res) => {
    const index =
      db.products.findIndex(
        p =>
          p.id ===
          req.params.id
      );

    if (index < 0) {
      return res
        .status(404)
        .json({
          message:
            "Product not found."
        });
    }

    const removed =
      db.products.splice(
        index,
        1
      )[0];

    save();

    res.json({
      product:
        removed
    });
  }
);

/* =====================================================
   ADMIN ORDERS
   ===================================================== */

app.get(
  "/api/admin/orders",
  auth,
  admin,
  (req, res) => {
    res.json({
      orders: [
        ...db.orders
      ].reverse()
    });
  }
);

app.patch(
  "/api/admin/orders/:id",
  auth,
  admin,
  (req, res) => {
    const order =
      db.orders.find(
        o =>
          o.id ===
          req.params.id
      );

    if (!order) {
      return res
        .status(404)
        .json({
          message:
            "Order not found."
        });
    }

    order.status =
      req.body.status;

    order.updatedAt =
      new Date().toISOString();

    save();

    res.json({
      order
    });
  }
);

/* =====================================================
   HEALTH CHECK
   ===================================================== */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      ok: true,
      products:
        db.products.length
    });
  }
);

/* =====================================================
   ADMIN PAGE
   ===================================================== */

app.get(
  "/admin",
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "public",
        "admin",
        "index.html"
      )
    );
  }
);

/* =====================================================
   WEBSITE FALLBACK
   ===================================================== */

app.get(
  "*",
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );
  }
);

/* =====================================================
   START SERVER
   ===================================================== */

app.listen(
  PORT,
  () => {
    console.log(
      `Good News Shopping running on port ${PORT}`
    );
  }
);
