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
    db = JSON.parse(fs.readFileSync(DB, "utf8"));
  } catch (e) {
    console.log("Could not read database. Creating a new one.");
  }
}

if (!Array.isArray(db.users)) db.users = [];
if (!Array.isArray(db.products)) db.products = [];
if (!Array.isArray(db.orders)) db.orders = [];
if (!Array.isArray(db.categories)) db.categories = [];

function save() {
  fs.writeFileSync(DB, JSON.stringify(db, null, 2));
}

function uid(prefix) {
  return (
    prefix +
    "-" +
    crypto.randomBytes(5).toString("hex").toUpperCase()
  );
}

function safeUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  };
}

function makeToken(u) {
  return jwt.sign(
    {
      id: u.id,
      email: u.email,
      role: u.role
    },
    SECRET,
    { expiresIn: "7d" }
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";

  try {
    const token = header.replace("Bearer ", "");
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({
      message: "Please sign in."
    });
  }
}

function admin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin only."
    });
  }

  next();
}

/* =========================================================
   CATEGORIES
========================================================= */

const categoryList = [
  ["Phones & Tablets", "📱"],
  ["Computing", "💻"],
  ["Electronics", "🎧"],
  ["TV & Audio", "📺"],
  ["Fashion", "👕"],
  ["Shoes", "👟"],
  ["Beauty", "✨"],
  ["Home", "🏠"],
  ["Appliances", "🧺"],
  ["Groceries", "🛒"],
  ["Gaming", "🎮"],
  ["Accessories", "⌚"],
  ["Baby", "🍼"],
  ["Sports", "⚽"],
  ["Books", "📚"],
  ["Office", "🖨️"]
];

db.categories = categoryList.map(x => ({
  name: x[0],
  icon: x[1]
}));

/* =========================================================
   PRODUCT NAMES
========================================================= */

const productsByCategory = {

  "Phones & Tablets": [
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
  ],

  "Computing": [
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
  ],

  "Electronics": [
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
  ],

  "TV & Audio": [
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
  ],

  "Fashion": [
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
  ],

  "Shoes": [
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
  ],

  "Beauty": [
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
  ],

  "Home": [
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
  ],

  "Appliances": [
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
  ],

  "Groceries": [
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
  ],

  "Gaming": [
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
  ],

  "Accessories": [
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
  ],

  "Baby": [
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
  ],

  "Sports": [
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
  ],

  "Books": [
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
  ],

  "Office": [
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
};

/* =========================================================
   PRODUCT VISUALS
   Each product type gets a different illustration.
========================================================= */

function visualFor(name, category) {
  const n = name.toLowerCase();

  if (n.includes("trouser") || n.includes("jeans") || n.includes("shorts")) return "👖";
  if (n.includes("t-shirt") || n.includes("shirt") || n.includes("blouse") || n.includes("jersey")) return "👕";
  if (n.includes("dress")) return "👗";
  if (n.includes("skirt")) return "👚";
  if (n.includes("hoodie")) return "🧥";
  if (n.includes("jacket")) return "🧥";
  if (n.includes("suit")) return "🤵";
  if (n.includes("sweater") || n.includes("cardigan")) return "🧶";
  if (n.includes("nightwear")) return "🛌";

  if (n.includes("sneaker") || n.includes("shoe")) return "👟";
  if (n.includes("boot")) return "🥾";
  if (n.includes("heel")) return "👠";
  if (n.includes("slipper") || n.includes("slide")) return "🩴";
  if (n.includes("sandal")) return "👡";

  if (n.includes("handbag") || n.includes("shoulder bag")) return "👜";
  if (n.includes("school bag")) return "🎒";
  if (n.includes("backpack")) return "🎒";
  if (n.includes("wallet")) return "👛";
  if (n.includes("necklace") || n.includes("pendant")) return "📿";
  if (n.includes("bracelet") || n.includes("bangle")) return "📿";
  if (n.includes("earring")) return "💎";
  if (n.includes("ring")) return "💍";
  if (n.includes("watch")) return "⌚";
  if (n.includes("sunglasses") || n.includes("glasses")) return "🕶️";
  if (n.includes("belt")) return "👔";
  if (n.includes("cap") || n.includes("hat")) return "🧢";
  if (n.includes("scarf")) return "🧣";

  if (n.includes("phone") || n.includes("smartphone")) return "📱";
  if (n.includes("tablet")) return "📲";
  if (n.includes("charger")) return "🔌";
  if (n.includes("power bank")) return "🔋";
  if (n.includes("usb-c") || n.includes("cable")) return "🔗";
  if (n.includes("stand")) return "🗜️";

  if (n.includes("laptop")) return "💻";
  if (n.includes("computer") || n.includes("desktop")) return "🖥️";
  if (n.includes("monitor")) return "🖥️";
  if (n.includes("keyboard")) return "⌨️";
  if (n.includes("mouse")) return "🖱️";
  if (n.includes("webcam")) return "📷";
  if (n.includes("ssd") || n.includes("storage drive")) return "💾";
  if (n.includes("hub")) return "🔌";

  if (n.includes("headphone") || n.includes("earbud") || n.includes("earphone")) return "🎧";
  if (n.includes("speaker") || n.includes("soundbar")) return "🔊";
  if (n.includes("camera")) return "📷";
  if (n.includes("microphone")) return "🎙️";
  if (n.includes("radio")) return "📻";
  if (n.includes("clock")) return "⏰";
  if (n.includes("fan")) return "🌀";
  if (n.includes("kettle")) return "🫖";
  if (n.includes("dryer")) return "💨";
  if (n.includes("shaver")) return "🪒";
  if (n.includes("projector")) return "📽️";
  if (n.includes("ring light") || n.includes("light")) return "💡";
  if (n.includes("recorder")) return "🎙️";
  if (n.includes("plug") || n.includes("extension") || n.includes("power strip")) return "🔌";

  if (n.includes("tv")) return "📺";
  if (n.includes("decoder") || n.includes("receiver") || n.includes("tv box")) return "📡";
  if (n.includes("hdmi") || n.includes("optical audio")) return "🔗";
  if (n.includes("subwoofer")) return "🔊";
  if (n.includes("theatre")) return "🎬";

  if (n.includes("sofa")) return "🛋️";
  if (n.includes("chair")) return "🪑";
  if (n.includes("table") || n.includes("desk")) return "🪵";
  if (n.includes("bed")) return "🛏️";
  if (n.includes("mattress")) return "🛏️";
  if (n.includes("wardrobe")) return "🚪";
  if (n.includes("bookshelf")) return "📚";
  if (n.includes("curtain")) return "🪟";
  if (n.includes("rug")) return "🧶";
  if (n.includes("mirror")) return "🪞";
  if (n.includes("basket")) return "🧺";
  if (n.includes("pillow")) return "🛏️";
  if (n.includes("blanket") || n.includes("duvet") || n.includes("bedsheet")) return "🛌";
  if (n.includes("lamp")) return "💡";

  if (n.includes("refrigerator") || n.includes("freezer")) return "🧊";
  if (n.includes("washing machine")) return "🧺";
  if (n.includes("microwave")) return "♨️";
  if (n.includes("blender")) return "🥤";
  if (n.includes("air fryer")) return "🍟";
  if (n.includes("cooker")) return "🍳";
  if (n.includes("rice cooker")) return "🍚";
  if (n.includes("toaster")) return "🍞";
  if (n.includes("iron")) return "👔";
  if (n.includes("air conditioner")) return "❄️";
  if (n.includes("water dispenser")) return "🚰";
  if (n.includes("dishwasher")) return "🫧";
  if (n.includes("juicer")) return "🧃";
  if (n.includes("coffee")) return "☕";
  if (n.includes("grill")) return "🍖";
  if (n.includes("vacuum")) return "🧹";
  if (n.includes("mop")) return "🧽";
  if (n.includes("mixer")) return "🥣";

  if (n.includes("rice")) return "🍚";
  if (n.includes("beans")) return "🫘";
  if (n.includes("spaghetti") || n.includes("macaroni")) return "🍝";
  if (n.includes("noodle")) return "🍜";
  if (n.includes("oil")) return "🫗";
  if (n.includes("chocolate")) return "🍫";
  if (n.includes("cereal") || n.includes("corn flakes") || n.includes("oats")) return "🥣";
  if (n.includes("sugar")) return "🍬";
  if (n.includes("salt")) return "🧂";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("biscuit")) return "🍪";
  if (n.includes("tea")) return "🍵";
  if (n.includes("milk")) return "🥛";
  if (n.includes("peanut")) return "🥜";
  if (n.includes("mayonnaise") || n.includes("ketchup")) return "🫙";
  if (n.includes("water")) return "💧";
  if (n.includes("juice")) return "🧃";
  if (n.includes("sardine")) return "🥫";

  if (n.includes("console")) return "🎮";
  if (n.includes("controller")) return "🎮";
  if (n.includes("gaming")) return "🕹️";
  if (n.includes("racing wheel")) return "🏎️";
  if (n.includes("vr headset")) return "🥽";
  if (n.includes("arcade")) return "🕹️";

  if (n.includes("baby")) return "👶";
  if (n.includes("diaper")) return "🧷";
  if (n.includes("stroller")) return "👶";
  if (n.includes("bottle")) return "🍼";
  if (n.includes("toy")) return "🧸";
  if (n.includes("bib")) return "👶";

  if (n.includes("football")) return "⚽";
  if (n.includes("basketball")) return "🏀";
  if (n.includes("tennis")) return "🎾";
  if (n.includes("badminton")) return "🏸";
  if (n.includes("volleyball")) return "🏐";
  if (n.includes("yoga")) return "🧘";
  if (n.includes("dumbbell")) return "🏋️";
  if (n.includes("treadmill") || n.includes("bike")) return "🏃";
  if (n.includes("boxing") || n.includes("punching")) return "🥊";
  if (n.includes("water bottle")) return "🥤";

  if (n.includes("book") || n.includes("dictionary") || n.includes("workbook")) return "📚";
  if (n.includes("notebook") || n.includes("journal")) return "📓";
  if (n.includes("sketch")) return "🎨";
  if (n.includes("pen")) return "🖊️";
  if (n.includes("pencil")) return "✏️";

  if (n.includes("printer")) return "🖨️";
  if (n.includes("paper")) return "📄";
  if (n.includes("stapler")) return "📎";
  if (n.includes("scissors")) return "✂️";
  if (n.includes("folder")) return "📁";
  if (n.includes("calculator")) return "🧮";
  if (n.includes("whiteboard")) return "📝";
  if (n.includes("shredder")) return "🗑️";
  if (n.includes("sticky notes")) return "🗒️";
  if (n.includes("flash drive")) return "💾";

  return "🛍️";
}

/* =========================================================
   FAST LOCAL PRODUCT IMAGE
   No LoremFlickr.
   No external image server.
   No repeated remote photos.
========================================================= */

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hashNumber(text) {
  let h = 0;

  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }

  return h;
}

function productSvg(product) {
  const seed = hashNumber(
    String(product.id) +
    product.name +
    product.category
  );

  const backgrounds = [
    "#FFF7ED",
    "#EFF6FF",
    "#F0FDFA",
    "#FDF2F8",
    "#F5F3FF",
    "#F7FEE7",
    "#FFF1F2",
    "#ECFEFF",
    "#FEFCE8",
    "#F8FAFC"
  ];

  const accents = [
    "#f97316",
    "#2563eb",
    "#14b8a6",
    "#db2777",
    "#7c3aed",
    "#65a30d",
    "#e11d48",
    "#0891b2",
    "#ca8a04",
    "#475569"
  ];

  const bg =
    backgrounds[seed % backgrounds.length];

  const accent =
    accents[seed % accents.length];

  const rotation =
    (seed % 11) - 5;

  const emoji = visualFor(
    product.name,
    product.category
  );

  const safeName = escapeXml(product.name);

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="600"
     height="600"
     viewBox="0 0 600 600">

  <defs>
    <linearGradient id="g${seed}"
      x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>

    <filter id="shadow${seed}">
      <feDropShadow
        dx="0"
        dy="14"
        stdDeviation="16"
        flood-opacity=".14"/>
    </filter>
  </defs>

  <rect
    width="600"
    height="600"
    rx="42"
    fill="url(#g${seed})"/>

  <circle
    cx="${90 + seed % 80}"
    cy="${80 + seed % 70}"
    r="52"
    fill="${accent}"
    opacity=".10"/>

  <circle
    cx="${500 - seed % 70}"
    cy="${470 - seed % 60}"
    r="75"
    fill="${accent}"
    opacity=".08"/>

  <g transform="rotate(${rotation} 300 290)"
     filter="url(#shadow${seed})">

    <rect
      x="105"
      y="105"
      width="390"
      height="360"
      rx="38"
      fill="#ffffff"/>

    <rect
      x="120"
      y="120"
      width="360"
      height="330"
      rx="30"
      fill="${accent}"
      opacity=".07"/>

    <text
      x="300"
      y="310"
      text-anchor="middle"
      font-size="145"
      font-family="Arial, sans-serif">
      ${emoji}
    </text>
  </g>

  <rect
    x="70"
    y="495"
    width="460"
    height="58"
    rx="29"
    fill="${accent}"
    opacity=".10"/>

  <text
    x="300"
    y="532"
    text-anchor="middle"
    font-size="23"
    font-weight="700"
    font-family="Arial, sans-serif"
    fill="#172033">
    ${safeName.length > 31
      ? escapeXml(safeName.slice(0, 31)) + "…"
      : safeName}
  </text>

</svg>`;
}

/* =========================================================
   CREATE 500 PRODUCTS
========================================================= */

const priceRanges = {
  "Phones & Tablets": [25000, 550000],
  "Computing": [15000, 1200000],
  "Electronics": [8000, 250000],
  "TV & Audio": [15000, 1500000],
  "Fashion": [8000, 180000],
  "Shoes": [7000, 180000],
  "Beauty": [3000, 120000],
  "Home": [5000, 900000],
  "Appliances": [8000, 1000000],
  "Groceries": [1000, 50000],
  "Gaming": [8000, 800000],
  "Accessories": [3000, 250000],
  "Baby": [3000, 300000],
  "Sports": [3000, 700000],
  "Books": [1500, 60000],
  "Office": [1000, 400000]
};

function generatedPrice(category, index) {
  const range =
    priceRanges[category] || [1000, 100000];

  const min = range[0];
  const max = range[1];

  const value =
    min +
    ((index * 7919) % Math.max(1, max - min));

  return Math.round(value / 500) * 500;
}

function makeGeneratedProducts() {
  const result = [];
  let id = 1;

  for (const category of Object.keys(productsByCategory)) {
    const names = productsByCategory[category];

    names.forEach((name, index) => {
      const price = generatedPrice(
        category,
        index + id
      );

      const hasOldPrice =
        (index + id) % 3 !== 0;

      const oldPrice = hasOldPrice
        ? Math.round((price * 1.12) / 500) * 500
        : null;

      const product = {
        id: "P" + id,
        name,
        category,
        price,
        oldPrice,
        rating: Number(
          (4.1 + ((index + id) % 10) / 10).toFixed(1)
        ),
        stock: 15 + ((index * 7 + id) % 85),
        sold: 50 + ((index * 113 + id * 7) % 5000),
        image: `/product-image/P${id}`,
        emoji: visualFor(name, category)
      };

      result.push(product);
      id++;
    });
  }

  /*
    16 categories × 25 products = 400.
    Add 100 extra products to make 500.
  */

  const extras = [
    ["Phone Accessories Bundle", "Phones & Tablets"],
    ["Premium Phone Bundle", "Phones & Tablets"],
    ["Tablet Study Bundle", "Phones & Tablets"],
    ["Fast Charging Bundle", "Phones & Tablets"],
    ["Student Laptop Bundle", "Computing"],
    ["Laptop Work Bundle", "Computing"],
    ["Computer Starter Bundle", "Computing"],
    ["Wireless Office Bundle", "Computing"],
    ["Bluetooth Music Bundle", "Electronics"],
    ["Home Electronics Bundle", "Electronics"],
    ["Portable Gadget Bundle", "Electronics"],
    ["Smart Home Bundle", "Electronics"],
    ["Smart TV Bundle", "TV & Audio"],
    ["Home Cinema Bundle", "TV & Audio"],
    ["Audio Entertainment Bundle", "TV & Audio"],
    ["Men's Fashion Bundle", "Fashion"],
    ["Women's Fashion Bundle", "Fashion"],
    ["Casual Clothing Bundle", "Fashion"],
    ["Weekend Fashion Bundle", "Fashion"],
    ["School Shoe Bundle", "Shoes"],
    ["Sports Shoe Bundle", "Shoes"],
    ["Casual Shoe Bundle", "Shoes"],
    ["Beauty Starter Bundle", "Beauty"],
    ["Hair Care Bundle", "Beauty"],
    ["Makeup Bundle", "Beauty"],
    ["Skin Care Bundle", "Beauty"],
    ["Living Room Bundle", "Home"],
    ["Bedroom Bundle", "Home"],
    ["Office Furniture Bundle", "Home"],
    ["Home Storage Bundle", "Home"],
    ["Kitchen Appliance Bundle", "Appliances"],
    ["Laundry Appliance Bundle", "Appliances"],
    ["Cooking Appliance Bundle", "Appliances"],
    ["Cleaning Appliance Bundle", "Appliances"],
    ["Breakfast Grocery Bundle", "Groceries"],
    ["Kitchen Grocery Bundle", "Groceries"],
    ["Snack Grocery Bundle", "Groceries"],
    ["Family Grocery Bundle", "Groceries"],
    ["Gaming Starter Bundle", "Gaming"],
    ["Console Gaming Bundle", "Gaming"],
    ["PC Gaming Bundle", "Gaming"],
    ["Gamer Accessories Bundle", "Gaming"],
    ["Fashion Accessories Bundle", "Accessories"],
    ["Jewellery Bundle", "Accessories"],
    ["Travel Accessories Bundle", "Accessories"],
    ["School Accessories Bundle", "Accessories"],
    ["Baby Care Bundle", "Baby"],
    ["Baby Feeding Bundle", "Baby"],
    ["Baby Travel Bundle", "Baby"],
    ["Baby Clothing Bundle", "Baby"],
    ["Football Training Bundle", "Sports"],
    ["Fitness Starter Bundle", "Sports"],
    ["Gym Equipment Bundle", "Sports"],
    ["Outdoor Sports Bundle", "Sports"],
    ["Law Student Book Bundle", "Books"],
    ["School Book Bundle", "Books"],
    ["Self Development Book Bundle", "Books"],
    ["Technology Book Bundle", "Books"],
    ["Office Starter Bundle", "Office"],
    ["School Office Bundle", "Office"],
    ["Printer Bundle", "Office"],
    ["Desk Essentials Bundle", "Office"],
    ["Smartphone Gift Pack", "Phones & Tablets"],
    ["Tablet Gift Pack", "Phones & Tablets"],
    ["Laptop Gift Pack", "Computing"],
    ["Headphone Gift Pack", "Electronics"],
    ["TV Entertainment Pack", "TV & Audio"],
    ["Fashion Gift Pack", "Fashion"],
    ["Shoe Gift Pack", "Shoes"],
    ["Beauty Gift Pack", "Beauty"],
    ["Home Gift Pack", "Home"],
    ["Kitchen Gift Pack", "Appliances"],
    ["Food Gift Pack", "Groceries"],
    ["Gaming Gift Pack", "Gaming"],
    ["Accessory Gift Pack", "Accessories"],
    ["Baby Gift Pack", "Baby"],
    ["Sports Gift Pack", "Sports"],
    ["Book Gift Pack", "Books"],
    ["Office Gift Pack", "Office"],
    ["Premium Shopping Pack", "Accessories"],
    ["Everyday Essentials Pack", "Home"],
    ["Student Essentials Pack", "Office"],
    ["Family Essentials Pack", "Groceries"],
    ["Travel Essentials Pack", "Accessories"],
    ["Weekend Essentials Pack", "Fashion"],
    ["Home Entertainment Pack", "TV & Audio"],
    ["Tech Essentials Pack", "Electronics"],
    ["Mobile Essentials Pack", "Phones & Tablets"],
    ["Computer Essentials Pack", "Computing"],
    ["Fitness Essentials Pack", "Sports"],
    ["Baby Essentials Pack", "Baby"],
    ["Beauty Essentials Pack", "Beauty"],
    ["Kitchen Essentials Pack", "Appliances"],
    ["Shoe Essentials Pack", "Shoes"],
    ["Gaming Essentials Pack", "Gaming"],
    ["Reading Essentials Pack", "Books"],
    ["Work Essentials Pack", "Office"],
    ["Complete Shopping Pack", "Home"],
    ["Good News Mega Pack", "Accessories"]
  ];

  extras.forEach((x, index) => {
    if (result.length >= 500) return;

    const category = x[1];
    const name = x[0];

    const productNumber = result.length + 1;

    const price = generatedPrice(
      category,
      productNumber + index + 100
    );

    result.push({
      id: "P" + productNumber,
      name,
      category,
      price,
      oldPrice:
        productNumber % 2 === 0
          ? Math.round((price * 1.15) / 500) * 500
          : null,
      rating: Number(
        (4.2 + (productNumber % 8) / 10).toFixed(1)
      ),
      stock: 20 + (productNumber % 70),
      sold: 100 + ((productNumber * 37) % 4500),
      image: `/product-image/P${productNumber}`,
      emoji: visualFor(name, category)
    });
  });

  return result.slice(0, 500);
}

const generatedProducts = makeGeneratedProducts();

/*
  Replace the old automatically generated P1-P500 products.
  Keep products created manually by the admin.
*/

db.products = db.products.filter(
  product => !/^P\d+$/.test(String(product.id))
);

db.products = [
  ...generatedProducts,
  ...db.products
];

save();

console.log(
  `Good News Shopping loaded ${generatedProducts.length} products.`
);

/* =========================================================
   LOCAL IMAGE ROUTE
   This is the important new part.
========================================================= */

app.get("/product-image/:id", (req, res) => {
  const product = db.products.find(
    p => String(p.id) === String(req.params.id)
  );

  if (!product) {
    return res.status(404).send("Image not found");
  }

  const svg = productSvg(product);

  res.setHeader(
    "Content-Type",
    "image/svg+xml; charset=utf-8"
  );

  /*
    Cache the image so the browser doesn't keep asking
    for the same product picture.
  */
  res.setHeader(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );

  res.send(svg);
});

/* =========================================================
   PRODUCTS API
========================================================= */

app.get("/api/products", (req, res) => {
  res.json({
    products: db.products,
    categories: db.categories
  });
});

/* =========================================================
   AUTH REGISTER
========================================================= */

app.post("/api/auth/register", async (req, res) => {
  const {
    name,
    email,
    password
  } = req.body || {};

  const e = String(email || "")
    .trim()
    .toLowerCase();

  if (!name || !e || !password) {
    return res.status(400).json({
      message: "All fields are required."
    });
  }

  if (String(password).length < 6) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters."
    });
  }

  if (db.users.some(u => u.email === e)) {
    return res.status(409).json({
      message: "Email already registered."
    });
  }

  const user = {
    id: uid("USR"),
    name: String(name).trim(),
    email: e,
    passwordHash: await bcrypt.hash(
      String(password),
      12
    ),
    role: "customer",
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  save();

  res.json({
    user: safeUser(user),
    token: makeToken(user)
  });
});

/* =========================================================
   AUTH LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  const {
    email,
    password
  } = req.body || {};

  const e = String(email || "")
    .trim()
    .toLowerCase();

  let user = db.users.find(
    u => u.email === e
  );

  /*
    Admin login
  */

  if (
    !user &&
    e === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  ) {
    user = {
      id: "ADMIN",
      name: "Good News Admin",
      email: ADMIN_EMAIL,
      role: "admin",
      createdAt: new Date().toISOString()
    };
  }

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password."
    });
  }

  if (user.role !== "admin") {
    const valid = await bcrypt.compare(
      String(password || ""),
      user.passwordHash
    );

    if (!valid) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }
  }

  res.json({
    user: safeUser(user),
    token: makeToken(user)
  });
});

/* =========================================================
   MY ORDERS
========================================================= */

app.get("/api/orders/my", auth, (req, res) => {
  const orders = db.orders
    .filter(o => o.userId === req.user.id)
    .reverse();

  res.json({
    orders
  });
});

/* =========================================================
   WHATSAPP NOTIFICATION
========================================================= */

async function notify(order) {
  const token =
    process.env.WHATSAPP_ACCESS_TOKEN;

  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  const adminWhatsApp =
    process.env.ADMIN_WHATSAPP;

  if (
    !token ||
    !phoneNumberId ||
    !adminWhatsApp
  ) {
    console.log(
      "WhatsApp Cloud API not configured."
    );
    return;
  }

  const body =
    `New Good News Shopping order\n\n` +
    `Order: ${order.orderNumber}\n` +
    `Customer: ${order.customer.name}\n` +
    `Phone: ${order.customer.phone}\n` +
    `Total: ₦${order.total.toLocaleString()}`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminWhatsApp,
          type: "text",
          text: {
            body
          }
        })
      }
    );

    console.log(
      "WhatsApp response:",
      await response.json()
    );
  } catch (error) {
    console.error(
      "WhatsApp error:",
      error.message
    );
  }
}

/* =========================================================
   CREATE ORDER
========================================================= */

app.post("/api/orders", auth, async (req, res) => {
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
    !Array.isArray(items) ||
    !items.length
  ) {
    return res.status(400).json({
      message:
        "Complete checkout first."
    });
  }

  let subtotal = 0;
  const outputItems = [];

  for (const item of items) {
    const product = db.products.find(
      p => String(p.id) === String(item.productId)
    );

    const quantity = Math.max(
      1,
      Number(item.qty) || 1
    );

    if (!product) {
      return res.status(400).json({
        message: "Product not found."
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message:
          `${product.name} is out of stock.`
      });
    }

    product.stock -= quantity;

    subtotal +=
      product.price * quantity;

    outputItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: product.image
    });
  }

  const delivery =
    subtotal > 500000 ? 0 : 2500;

  const order = {
    id: uid("ORD"),

    orderNumber:
      "GN-" +
      Math.floor(
        10000000 +
        Math.random() * 89999999
      ),

    userId: req.user.id,

    customer: {
      name,
      phone,
      state,
      city,
      address
    },

    paymentMethod,

    items: outputItems,

    subtotal,

    delivery,

    total: subtotal + delivery,

    status: "placed",

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };

  db.orders.push(order);

  save();

  notify(order);

  res.status(201).json({
    order
  });
});

/* =========================================================
   ADMIN ORDERS
========================================================= */

app.get(
  "/api/admin/orders",
  auth,
  admin,
  (req, res) => {
    res.json({
      orders: [...db.orders].reverse()
    });
  }
);

/* =========================================================
   ADMIN UPDATE ORDER
========================================================= */

app.patch(
  "/api/admin/orders/:id",
  auth,
  admin,
  (req, res) => {
    const order = db.orders.find(
      o => o.id === req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    order.status =
      req.body.status ||
      order.status;

    order.updatedAt =
      new Date().toISOString();

    save();

    res.json({
      order
    });
  }
);

/* =========================================================
   ADMIN PRODUCT LIST
========================================================= */

app.get(
  "/api/admin/products",
  auth,
  admin,
  (req, res) => {
    res.json({
      products: db.products
    });
  }
);

/* =========================================================
   ADMIN ADD PRODUCT
========================================================= */

app.post(
  "/api/admin/products",
  auth,
  admin,
  (req, res) => {
    const {
      name,
      category,
      price,
      oldPrice,
      stock
    } = req.body || {};

    if (
      !name ||
      !category ||
      !Number(price)
    ) {
      return res.status(400).json({
        message:
          "Name, category and price are required."
      });
    }

    const product = {
      id: uid("P"),

      name: String(name).trim(),

      category: String(category).trim(),

      price: Number(price),

      oldPrice:
        oldPrice
          ? Number(oldPrice)
          : null,

      rating: 4.5,

      stock:
        Number(stock) || 10,

      sold: 0,

      image: null,

      emoji: visualFor(
        String(name),
        String(category)
      )
    };

    /*
      Admin-created products also get a
      fast local image automatically.
    */

    product.image =
      `/product-image/${product.id}`;

    db.products.unshift(product);

    save();

    res.status(201).json({
      product
    });
  }
);

/* =========================================================
   ADMIN EDIT PRODUCT
========================================================= */

app.patch(
  "/api/admin/products/:id",
  auth,
  admin,
  (req, res) => {
    const product = db.products.find(
      p => String(p.id) === String(req.params.id)
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    if (req.body.name !== undefined) {
      product.name =
        String(req.body.name).trim();
    }

    if (req.body.category !== undefined) {
      product.category =
        String(req.body.category).trim();
    }

    if (req.body.price !== undefined) {
      product.price =
        Number(req.body.price);
    }

    if (req.body.oldPrice !== undefined) {
      product.oldPrice =
        req.body.oldPrice
          ? Number(req.body.oldPrice)
          : null;
    }

    if (req.body.stock !== undefined) {
      product.stock =
        Number(req.body.stock);
    }

    product.emoji =
      visualFor(
        product.name,
        product.category
      );

    product.image =
      `/product-image/${product.id}`;

    save();

    res.json({
      product
    });
  }
);

/* =========================================================
   ADMIN DELETE PRODUCT
========================================================= */

app.delete(
  "/api/admin/products/:id",
  auth,
  admin,
  (req, res) => {
    const before =
      db.products.length;

    db.products =
      db.products.filter(
        p =>
          String(p.id) !==
          String(req.params.id)
      );

    if (
      db.products.length === before
    ) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    save();

    res.json({
      message: "Product deleted."
    });
  }
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    products: db.products.length,
    message:
      "Good News Shopping is running."
  });
});

/* =========================================================
   STATIC WEBSITE
========================================================= */

app.use(
  express.static(
    path.join(__dirname, "public"),
    {
      maxAge: "1d"
    }
  )
);

/* =========================================================
   ADMIN PAGE
========================================================= */

app.get("/admin", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "admin",
      "index.html"
    )
  );
});

/* =========================================================
   WEBSITE FALLBACK
========================================================= */

app.get("*", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `Good News Shopping running on port ${PORT}`
  );

  console.log(
    `Products available: ${db.products.length}`
  );
});
