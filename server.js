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

const ADMIN_EMAIL =
  (process.env.ADMIN_EMAIL || "admin@goodnewsshopping.com").toLowerCase();

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "ChangeMe123!";

const DB =
  process.env.DB_FILE || path.join(__dirname, "data.json");

const PEXELS_API_KEY =
  process.env.PEXELS_API_KEY || "";

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
    console.log("Could not read data.json. Starting fresh.");
  }
}

function save() {
  fs.writeFileSync(DB, JSON.stringify(db, null, 2));
}

/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORY_SEED = [
  { name: "Phones & Tablets", icon: "📱" },
  { name: "Computing", icon: "💻" },
  { name: "Electronics", icon: "🎧" },
  { name: "TV & Audio", icon: "📺" },
  { name: "Fashion", icon: "👕" },
  { name: "Shoes", icon: "👟" },
  { name: "Beauty", icon: "✨" },
  { name: "Home", icon: "🏠" },
  { name: "Appliances", icon: "🧺" },
  { name: "Groceries", icon: "🛒" },
  { name: "Gaming", icon: "🎮" },
  { name: "Accessories", icon: "⌚" },
  { name: "Baby", icon: "🍼" },
  { name: "Sports", icon: "⚽" },
  { name: "Books", icon: "📚" },
  { name: "Office", icon: "🖨️" },
  { name: "Tools & Hardware", icon: "🛠️" },
  { name: "Automotive", icon: "🚗" },
  { name: "Travel", icon: "🧳" },
  { name: "Smart Home", icon: "🏠" },
  { name: "Pets", icon: "🐾" },
  { name: "Music", icon: "🎵" }
];

/* =========================================================
   400 PRODUCTS
========================================================= */

const PRODUCT_GROUPS = [

  {
    query: "smartphone product photography",
    category: "Phones & Tablets",
    names: [
      "iPhone Style 5G Smartphone",
      "Android Pro 256GB Smartphone",
      "Budget Android Smartphone",
      "Foldable Smartphone",
      "Gaming Smartphone",
      "Camera Phone 200MP",
      "Compact Mini Smartphone",
      "Rugged Outdoor Smartphone",
      "Business Smartphone",
      "Selfie Camera Smartphone"
    ]
  },

  {
    query: "tablet product photography",
    category: "Phones & Tablets",
    names: [
      "10-inch Android Tablet",
      "11-inch Pro Tablet",
      "Kids Learning Tablet",
      "Drawing Tablet",
      "Student Tablet 128GB",
      "Compact 8-inch Tablet",
      "Keyboard Tablet Bundle",
      "4G LTE Tablet",
      "Premium OLED Tablet",
      "Budget Tablet"
    ]
  },

  {
    query: "laptop computer product photography",
    category: "Computing",
    names: [
      "15-inch Core Laptop",
      "14-inch Student Laptop",
      "13-inch Ultrabook",
      "Business Laptop 16GB RAM",
      "Gaming Laptop RTX",
      "Slim Office Laptop",
      "2-in-1 Touchscreen Laptop",
      "Creator Laptop",
      "Budget Windows Laptop",
      "Premium Work Laptop"
    ]
  },

  {
    query: "computer monitor product photography",
    category: "Computing",
    names: [
      "24-inch Full HD Monitor",
      "27-inch IPS Monitor",
      "32-inch Curved Monitor",
      "Gaming Monitor 165Hz",
      "Ultrawide Monitor",
      "4K Professional Monitor",
      "Portable USB Monitor",
      "24-inch Office Monitor",
      "27-inch Gaming Monitor",
      "Vertical Monitor"
    ]
  },

  {
    query: "computer accessories product photography",
    category: "Computing",
    names: [
      "Wireless Keyboard",
      "Mechanical Gaming Keyboard",
      "Wireless Mouse",
      "Ergonomic Mouse",
      "USB-C Hub",
      "Laptop Stand",
      "Webcam Full HD",
      "USB Flash Drive 128GB",
      "External SSD 1TB",
      "Laptop Cooling Pad"
    ]
  },

  {
    query: "headphones earbuds product photography",
    category: "Electronics",
    names: [
      "Wireless Noise Cancelling Headphones",
      "Bluetooth Over-Ear Headphones",
      "Sport Bluetooth Earbuds",
      "True Wireless Earbuds",
      "Gaming Headset",
      "Studio Monitor Headphones",
      "Kids Wireless Headphones",
      "USB-C Earphones",
      "Bass Boost Headphones",
      "Premium Bluetooth Headphones"
    ]
  },

  {
    query: "speakers audio product photography",
    category: "Electronics",
    names: [
      "Portable Bluetooth Speaker",
      "Smart Home Speaker",
      "Party Bluetooth Speaker",
      "Mini Wireless Speaker",
      "Soundbar Speaker",
      "Bookshelf Speakers",
      "Waterproof Outdoor Speaker",
      "Computer Speaker Set",
      "Bass Bluetooth Speaker",
      "Home Audio Speaker"
    ]
  },

  {
    query: "television product photography",
    category: "TV & Audio",
    names: [
      "32-inch Smart TV",
      "43-inch 4K Smart TV",
      "50-inch 4K TV",
      "55-inch OLED TV",
      "65-inch Smart TV",
      "75-inch 4K TV",
      "32-inch LED TV",
      "43-inch Android TV",
      "55-inch QLED TV",
      "Projector Home Cinema"
    ]
  },

  {
    query: "men clothing product photography",
    category: "Fashion",
    names: [
      "Men's Polo Shirt",
      "Men's Casual T-Shirt",
      "Men's Long Sleeve Shirt",
      "Men's Formal Shirt",
      "Men's Denim Shirt",
      "Men's Hoodie",
      "Men's Sweatshirt",
      "Men's Chinos",
      "Men's Cargo Trousers",
      "Men's Formal Trousers"
    ]
  },

  {
    query: "women clothing product photography",
    category: "Fashion",
    names: [
      "Women's Blouse",
      "Women's Casual T-Shirt",
      "Women's Maxi Dress",
      "Women's Summer Dress",
      "Women's Office Dress",
      "Women's Jeans",
      "Women's Palazzo Trousers",
      "Women's Skirt",
      "Women's Hoodie",
      "Women's Cardigan"
    ]
  },

  {
    query: "fashion dresses clothing product photography",
    category: "Fashion",
    names: [
      "Floral Midi Dress",
      "Elegant Evening Dress",
      "Cocktail Dress",
      "Denim Dress",
      "Wrap Dress",
      "Pleated Dress",
      "Long Sleeve Dress",
      "Casual Shirt Dress",
      "Satin Dress",
      "Knit Dress"
    ]
  },

  {
    query: "shoes sneakers product photography",
    category: "Shoes",
    names: [
      "Men's Running Sneakers",
      "Women's Running Sneakers",
      "Classic White Sneakers",
      "Black Casual Sneakers",
      "High Top Sneakers",
      "Training Shoes",
      "Walking Shoes",
      "Canvas Sneakers",
      "Lightweight Sport Shoes",
      "Premium Leather Sneakers"
    ]
  },

  {
    query: "sandals slippers footwear product photography",
    category: "Shoes",
    names: [
      "Men's Leather Sandals",
      "Women's Flat Sandals",
      "Beach Slippers",
      "Home Slippers",
      "Slides Sandals",
      "Sport Slides",
      "Women's Heeled Sandals",
      "Men's Casual Slides",
      "Comfort Sandals",
      "Kids Sandals"
    ]
  },

  {
    query: "handbag backpack accessories product photography",
    category: "Accessories",
    names: [
      "Women's Handbag",
      "Leather Tote Bag",
      "Crossbody Bag",
      "Shoulder Bag",
      "Mini Handbag",
      "Travel Backpack",
      "School Backpack",
      "Laptop Backpack",
      "Sports Backpack",
      "Fashion Backpack"
    ]
  },

  {
    query: "watches jewelry accessories product photography",
    category: "Accessories",
    names: [
      "Men's Wrist Watch",
      "Women's Wrist Watch",
      "Digital Sports Watch",
      "Smart Watch",
      "Classic Leather Watch",
      "Stainless Steel Watch",
      "Fashion Necklace",
      "Pendant Necklace",
      "Bracelet",
      "Fashion Earrings"
    ]
  },

  {
    query: "beauty skincare product photography",
    category: "Beauty",
    names: [
      "Face Moisturizer",
      "Hydrating Face Cream",
      "Facial Cleanser",
      "Sunscreen Lotion",
      "Body Lotion",
      "Lip Balm",
      "Face Serum",
      "Body Scrub",
      "Hand Cream",
      "Aloe Vera Gel"
    ]
  },

  {
    query: "beauty makeup product photography",
    category: "Beauty",
    names: [
      "Foundation Makeup",
      "Compact Powder",
      "Lipstick",
      "Lip Gloss",
      "Mascara",
      "Eyeliner",
      "Eyeshadow Palette",
      "Makeup Brush Set",
      "Makeup Sponge Set",
      "Blush Makeup"
    ]
  },

  {
    query: "hair beauty product photography",
    category: "Beauty",
    names: [
      "Shampoo",
      "Conditioner",
      "Hair Oil",
      "Hair Cream",
      "Hair Gel",
      "Hair Brush",
      "Hair Dryer",
      "Hair Straightener",
      "Curling Iron",
      "Electric Hair Clipper"
    ]
  },

  {
    query: "home furniture product photography",
    category: "Home",
    names: [
      "Modern Sofa",
      "Two-Seater Sofa",
      "Accent Chair",
      "Coffee Table",
      "Dining Table",
      "Dining Chair",
      "Bedside Table",
      "Bookshelf",
      "TV Stand",
      "Office Desk"
    ]
  },

  {
    query: "bedroom bedding product photography",
    category: "Home",
    names: [
      "Queen Bed Frame",
      "King Bed Frame",
      "Memory Foam Mattress",
      "Pillow Set",
      "Bedsheet Set",
      "Duvet Set",
      "Comforter",
      "Wardrobe",
      "Bedroom Mirror",
      "Bedside Lamp"
    ]
  },

  {
    query: "kitchen cookware product photography",
    category: "Home",
    names: [
      "Nonstick Frying Pan",
      "Stainless Steel Pot Set",
      "Saucepan",
      "Cooking Utensil Set",
      "Knife Set",
      "Cutting Board",
      "Mixing Bowl Set",
      "Food Storage Containers",
      "Electric Kettle",
      "Kitchen Scale"
    ]
  },

  {
    query: "kitchen appliances product photography",
    category: "Appliances",
    names: [
      "Microwave Oven",
      "Air Fryer",
      "Blender",
      "Food Processor",
      "Toaster",
      "Rice Cooker",
      "Electric Stove",
      "Sandwich Maker",
      "Coffee Maker",
      "Juicer"
    ]
  },

  {
    query: "home appliances product photography",
    category: "Appliances",
    names: [
      "Standing Fan",
      "Rechargeable Fan",
      "Air Conditioner",
      "Washing Machine",
      "Refrigerator",
      "Vacuum Cleaner",
      "Steam Iron",
      "Electric Iron",
      "Water Dispenser",
      "Dehumidifier"
    ]
  },

  {
    query: "lighting home product photography",
    category: "Home",
    names: [
      "LED Desk Lamp",
      "Table Lamp",
      "Floor Lamp",
      "Ceiling Light",
      "Smart LED Bulb",
      "Decorative Lamp",
      "Bedside Reading Lamp",
      "Rechargeable Lantern",
      "Outdoor Wall Light",
      "LED Strip Light"
    ]
  },

  {
    query: "groceries packaged food product photography",
    category: "Groceries",
    names: [
      "Breakfast Cereal",
      "Oatmeal Pack",
      "Spaghetti Pack",
      "Macaroni Pack",
      "Instant Noodles",
      "Pasta Sauce",
      "Peanut Butter",
      "Chocolate Spread",
      "Biscuits Pack",
      "Corn Flakes"
    ]
  },

  {
    query: "groceries drinks product photography",
    category: "Groceries",
    names: [
      "Bottled Water",
      "Fruit Juice",
      "Orange Drink",
      "Apple Juice",
      "Malt Drink",
      "Soft Drink Bottle",
      "Energy Drink",
      "Iced Tea",
      "Milk Carton",
      "Chocolate Drink"
    ]
  },

  {
    query: "gaming console product photography",
    category: "Gaming",
    names: [
      "PlayStation Console",
      "Xbox Console",
      "Nintendo Switch",
      "Gaming Controller",
      "Wireless Gamepad",
      "Gaming Steering Wheel",
      "VR Headset",
      "Gaming Keyboard",
      "Gaming Mouse",
      "Gaming Chair"
    ]
  },

  {
    query: "baby products product photography",
    category: "Baby",
    names: [
      "Baby Stroller",
      "Baby High Chair",
      "Baby Car Seat",
      "Baby Cot",
      "Baby Blanket",
      "Baby Bottle Set",
      "Baby Feeding Set",
      "Baby Diaper Bag",
      "Baby Bath Tub",
      "Baby Carrier"
    ]
  },

  {
    query: "sports equipment product photography",
    category: "Sports",
    names: [
      "Football",
      "Basketball",
      "Volleyball",
      "Tennis Racket",
      "Badminton Racket",
      "Boxing Gloves",
      "Skipping Rope",
      "Yoga Mat",
      "Dumbbell Set",
      "Sports Water Bottle"
    ]
  },

  {
    query: "office stationery product photography",
    category: "Office",
    names: [
      "Ballpoint Pen Set",
      "Notebook",
      "A4 Writing Pad",
      "Marker Set",
      "Stapler",
      "Paper Punch",
      "Desk Organizer",
      "Calculator",
      "Printer",
      "Document Scanner"
    ]
  },

  {
    query: "books reading product photography",
    category: "Books",
    names: [
      "Business Book",
      "English Dictionary",
      "Study Textbook",
      "Notebook Journal",
      "Motivational Book",
      "Novel Book",
      "Cookbook",
      "Children's Story Book",
      "Law Textbook",
      "Exam Preparation Book"
    ]
  },

  {
    query: "tools hardware product photography",
    category: "Tools & Hardware",
    names: [
      "Screwdriver Set",
      "Hammer",
      "Wrench Set",
      "Cordless Drill",
      "Tape Measure",
      "Pliers Set",
      "Toolbox",
      "Utility Knife",
      "Spirit Level",
      "Hand Saw"
    ]
  },

  {
    query: "car accessories product photography",
    category: "Automotive",
    names: [
      "Car Phone Holder",
      "Car Charger",
      "Car Vacuum Cleaner",
      "Car Air Freshener",
      "Car Seat Cushion",
      "Jump Starter",
      "Tyre Inflator",
      "Dashboard Camera",
      "Car Bluetooth Adapter",
      "Emergency Car Kit"
    ]
  },

  {
    query: "travel luggage product photography",
    category: "Travel",
    names: [
      "Large Travel Suitcase",
      "Carry-On Suitcase",
      "Travel Duffel Bag",
      "Passport Holder",
      "Travel Neck Pillow",
      "Packing Cubes",
      "Toiletry Bag",
      "Travel Organizer",
      "Cabin Backpack",
      "Luggage Scale"
    ]
  },

  {
    query: "smart home gadgets product photography",
    category: "Smart Home",
    names: [
      "Smart Doorbell",
      "Smart Plug",
      "Smart Light",
      "Security Camera",
      "Smart Door Lock",
      "WiFi Router",
      "Smart Alarm Clock",
      "Smart Sensor",
      "Video Doorbell",
      "Home Automation Hub"
    ]
  },

  {
    query: "phones accessories product photography",
    category: "Phones & Tablets",
    names: [
      "Phone Case",
      "Fast USB-C Charger",
      "Wireless Charging Pad",
      "Power Bank",
      "Tempered Glass Screen Protector",
      "USB-C Cable",
      "Lightning Cable",
      "Phone Tripod",
      "Selfie Stick",
      "Car Phone Mount"
    ]
  },

  {
    query: "fashion accessories product photography",
    category: "Accessories",
    names: [
      "Leather Belt",
      "Baseball Cap",
      "Sun Hat",
      "Fashion Sunglasses",
      "Reading Glasses",
      "Silk Scarf",
      "Wallet",
      "Card Holder",
      "Travel Wallet",
      "Key Holder"
    ]
  },

  {
    query: "home decor product photography",
    category: "Home",
    names: [
      "Wall Clock",
      "Decorative Vase",
      "Picture Frame",
      "Artificial Plant",
      "Scented Candle",
      "Throw Pillow",
      "Decorative Basket",
      "Wall Mirror",
      "Table Decor",
      "Curtain Set"
    ]
  },

  {
    query: "pet supplies product photography",
    category: "Pets",
    names: [
      "Pet Bed",
      "Pet Food Bowl",
      "Pet Leash",
      "Pet Collar",
      "Pet Carrier",
      "Pet Grooming Brush",
      "Pet Toy Ball",
      "Pet Water Bottle",
      "Pet Training Pad",
      "Pet Storage Container"
    ]
  },

  {
    query: "music instruments product photography",
    category: "Music",
    names: [
      "Acoustic Guitar",
      "Electric Guitar",
      "Keyboard Piano",
      "Digital Piano",
      "Ukulele",
      "Drum Set",
      "Violin",
      "Microphone",
      "Guitar Stand",
      "Music Headphones"
    ]
  }

];

/* =========================================================
   CREATE 400 PRODUCTS
========================================================= */

function build400Products() {

  const products = [];

  let id = 1;

  const basePrices = {

    "Phones & Tablets": 150000,
    "Computing": 180000,
    "Electronics": 35000,
    "TV & Audio": 180000,
    "Fashion": 18000,
    "Shoes": 22000,
    "Beauty": 8000,
    "Home": 25000,
    "Appliances": 45000,
    "Groceries": 3500,
    "Gaming": 35000,
    "Accessories": 12000,
    "Baby": 12000,
    "Sports": 9000,
    "Office": 4500,
    "Books": 3500,
    "Tools & Hardware": 7000,
    "Automotive": 9000,
    "Travel": 12000,
    "Smart Home": 18000,
    "Pets": 5000,
    "Music": 18000

  };

  for (const group of PRODUCT_GROUPS) {

    for (const name of group.names) {

      const base =
        basePrices[group.category] || 10000;

      const price =
        Math.round(
          (
            base +
            ((id * 137) %
              Math.max(
                1000,
                Math.round(base * 0.8)
              ))
          ) / 100
        ) * 100;

      const oldPrice =
        Math.round(
          price *
          (1.08 + ((id % 6) * 0.025)) *
          100
        ) / 100;

      products.push({

        id: "P" + id,

        name: name,

        category: group.category,

        image: "",

        imageQuery: group.query,

        pexelsPhotoId: null,

        photographer: "",

        photographerUrl: "",

        pexelsUrl: "",

        price: price,

        oldPrice: oldPrice,

        rating: Number(
          (
            4.3 +
            ((id * 7) % 7) / 10
          ).toFixed(1)
        ),

        stock: 25 + (id % 56),

        deal: id % 7 === 0,

        sold: 50 + ((id * 31) % 950),

        description:
          "Quality product from Good News Shopping."

      });

      id++;

    }

  }

  return products;
}

/* =========================================================
   PEXELS
========================================================= */

async function pexelsPhotos(query, page) {

  const url =
    "https://api.pexels.com/v1/search?query=" +
    encodeURIComponent(query) +
    "&per_page=80&page=" +
    page;

  const response =
    await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(
      "Pexels API " +
      response.status +
      ": " +
      text.slice(0, 200)
    );

  }

  return response.json();
}

/* =========================================================
   COLLECT UNIQUE PHOTOS
========================================================= */

async function collectPhotos(
  query,
  needed,
  usedIds
) {

  const picked = [];

  for (
    let page = 1;
    page <= 3 &&
    picked.length < needed;
    page++
  ) {

    const data =
      await pexelsPhotos(query, page);

    for (
      const photo of
      (data.photos || [])
    ) {

      if (
        !photo.id ||
        usedIds.has(photo.id)
      ) {
        continue;
      }

      const src =
        photo.src || {};

      /*
        LARGE IMAGE:
        This deliberately uses a large Pexels
        image instead of a tiny thumbnail.
      */

      const image =
        src.large2x ||
        src.large ||
        src.medium ||
        src.original;

      if (!image) {
        continue;
      }

      usedIds.add(photo.id);

      picked.push({

        id: photo.id,

        image: image,

        photographer:
          photo.photographer || "",

        photographerUrl:
          photo.photographer_url || "",

        pexelsUrl:
          photo.url || ""

      });

      if (
        picked.length >= needed
      ) {
        break;
      }

    }

    if (!data.next_page) {
      break;
    }

  }

  return picked;
}


/* =========================================================
   BUILD PRODUCT CATALOGUE
========================================================= */

async function ensureCatalog() {

  const target = build400Products();

  /*
    IMPORTANT:
    P1 - P400 are the permanent original catalogue.

    Any product added later through the admin system
    has a different ID, so it will be preserved.
  */

  const originalIds = new Set(
    target.map(p => p.id)
  );

  const existingProducts = Array.isArray(db.products)
    ? db.products
    : [];

  /*
    Keep every product that is NOT one of the
    original P1-P400 products.

    These are products added later by the admin.
  */

  const customProducts = existingProducts.filter(
    p => !originalIds.has(String(p.id))
  );

  /*
    Rebuild/update P1-P400 while preserving their
    saved Pexels images and other saved information.
  */

  db.products = target.map(fresh => {

    const old = existingProducts.find(
      p => String(p.id) === String(fresh.id)
    );

    if (!old) {
      return fresh;
    }

    return {
      ...fresh,
      ...old,

      /*
        These fields always remain controlled by
        the permanent catalogue.
      */

      id: fresh.id,
      name: fresh.name,
      category: fresh.category,
      imageQuery: fresh.imageQuery
    };

  }).concat(customProducts);

  /*
    Keep the original categories AND any categories
    created later through the admin system.
  */

  const oldCategories = Array.isArray(db.categories)
    ? db.categories
    : [];

  const categoryMap = new Map();

  CATEGORY_SEED.forEach(c => {
    categoryMap.set(c.name, c);
  });

  oldCategories.forEach(c => {
    if (c && c.name) {
      categoryMap.set(c.name, c);
    }
  });

  db.categories = Array.from(categoryMap.values());

  /*
    Check whether all original 400 products already
    have their Pexels images saved.
  */

  const generated = db.products.filter(
    p => originalIds.has(String(p.id))
  );

  const complete =
    generated.length === 400 &&
    generated.every(
      p =>
        p.pexelsPhotoId &&
        p.image
    );

  if (complete) {

    save();

    console.log(
      "Good News Shopping: 400 permanent products are ready."
    );

    console.log(
      "Additional products saved:",
      customProducts.length
    );

    return;
  }

  /*
    If the Pexels key is missing, don't crash the
    entire website.
  */

  if (!PEXELS_API_KEY) {

    save();

    console.error(
      "PEXELS_API_KEY is missing. Add it in Render Environment Variables."
    );

    return;
  }

  console.log(
    "Starting Pexels image setup for 400 products..."
  );

  /*
    Remember every Pexels photo already being used.
    This prevents duplicate photographs.
  */

  const usedIds = new Set();

  for (const p of generated) {

    if (p.pexelsPhotoId) {
      usedIds.add(
        p.pexelsPhotoId
      );
    }

  }

  let count = generated.filter(
    p =>
      p.image &&
      p.pexelsPhotoId
  ).length;

  /*
    Process each product group.
  */

  for (const group of PRODUCT_GROUPS) {

    const list = generated.filter(
      p =>
        p.imageQuery === group.query
    );

    const missing = list.filter(
      p =>
        !p.image ||
        !p.pexelsPhotoId
    );

    if (!missing.length) {
      continue;
    }

    console.log(
      "Searching Pexels for:",
      group.query
    );

    const photos = await collectPhotos(
      group.query,
      missing.length,
      usedIds
    );

    if (
      photos.length <
      missing.length
    ) {

      console.error(
        "Could not find enough unique photos for:",
        group.query
      );

      /*
        Don't destroy the catalogue if one
        Pexels search has a problem.
      */

      save();

      continue;
    }

    missing.forEach(
      (product, index) => {

        const photo =
          photos[index];

        product.image =
          photo.image;

        product.pexelsPhotoId =
          photo.id;

        product.photographer =
          photo.photographer;

        product.photographerUrl =
          photo.photographerUrl;

        product.pexelsUrl =
          photo.pexelsUrl;

        count++;

      }
    );

    /*
      Save after every group.

      This is important because if Render restarts
      during image setup, already completed images
      won't need to be downloaded again.
    */

    save();

    console.log(
      "Real images ready: " +
      count +
      "/400"
    );

  }

  save();

  console.log(
    "DONE: Original 400-product catalogue is ready."
  );

  console.log(
    "Permanent additional products:",
    customProducts.length
  );
}

/* =========================================================
   AUTH HELPERS
========================================================= */

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

function auth(req, res, next) {

  const header =
    req.headers.authorization || "";

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

    res.status(401).json({
      message:
        "Please sign in."
    });

  }

}

function admin(req, res, next) {

  if (
    req.user.role !== "admin"
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

/* =========================================================
   PRODUCT CLEANER
========================================================= */

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

/* =========================================================
   STATIC WEBSITE
========================================================= */

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);

/* =========================================================
   PRODUCTS API
========================================================= */

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

/* =========================================================
   REGISTER
========================================================= */

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
      password.length < 6
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
        u => u.email === e
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
        String(name).trim(),

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

    db.users.push(user);

    save();

    res.json({

      user:
        safe(user),

      token:
        tok(user)

    });

  }
);

/* =========================================================
   LOGIN
========================================================= */

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
        x => x.email === e
      );

    if (
      !user &&
      e === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
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
      user.role !== "admin" &&
      !await bcrypt.compare(
        password,
        user.passwordHash
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

/* =========================================================
   MY ORDERS
========================================================= */

app.get(
  "/api/orders/my",
  auth,
  (req, res) => {

    res.json({

      orders:
        db.orders
          .filter(
            o =>
              o.userId ===
              req.user.id
          )
          .reverse()

    });

  }
);

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
      "WhatsApp Cloud API not configured for",
      order.orderNumber
    );

    return;
  }

  const message =
    `New order ${order.orderNumber}
Customer: ${order.customer.name}
Phone: ${order.customer.phone}
Total: ₦${order.total.toLocaleString()}`;

  try {

    const response =
      await fetch(
        `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
        {

          method: "POST",

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

              to:
                adminWhatsApp,

              type:
                "text",

              text: {
                body:
                  message
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

/* =========================================================
   CREATE ORDER
========================================================= */

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
      !items ||
      !items.length
    ) {

      return res
        .status(400)
        .json({
          message:
            "Complete checkout first."
        });

    }

    let total = 0;

    const orderItems = [];

    for (
      const item of items
    ) {

      const product =
        db.products.find(
          p =>
            p.id ===
            item.productId
        );

      const qty =
        Math.max(
          1,
          Number(item.qty)
        );

      if (
        !product ||
        product.stock < qty
      ) {

        return res
          .status(400)
          .json({
            message:
              "Product unavailable or out of stock."
          });

      }

      product.stock -= qty;

      total +=
        product.price *
        qty;

      orderItems.push({

        productId:
          product.id,

        name:
          product.name,

        price:
          product.price,

        qty:
          qty,

        image:
          product.image

      });

    }

    const delivery =
      total > 500000
        ? 0
        : 2500;

    const order = {

      id:
        uid("ORD"),

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
        orderItems,

      subtotal:
        total,

      delivery:
        delivery,

      total:
        total + delivery,

      status:
        "placed",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };

    db.orders.push(order);

    save();

    notify(order);

    res
      .status(201)
      .json({
        order
      });

  }
);

/* =========================================================
   ADMIN PRODUCTS
========================================================= */

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

/* =========================================================
   ADD PRODUCT
========================================================= */

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

      id:
        uid("P"),

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

/* =========================================================
   UPDATE PRODUCT
========================================================= */

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

/* =========================================================
   DELETE PRODUCT
========================================================= */

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

/* =========================================================
   ADMIN ORDERS
========================================================= */

app.get(
  "/api/admin/orders",
  auth,
  admin,
  (req, res) => {

    res.json({

      orders:
        [...db.orders]
          .reverse()

    });

  }
);

/* =========================================================
   UPDATE ORDER
========================================================= */

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

/* =========================================================
   HEALTH CHECK
========================================================= */

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

/* =========================================================
   ADMIN PAGE
========================================================= */

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

/* =========================================================
   SPA FALLBACK
========================================================= */

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

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  () => {

    console.log(
      `Good News Shopping running on port ${PORT}`
    );

    ensureCatalog()
      .catch(
        error =>
          console.error(
            "Catalog image setup failed:",
            error.message
          )
      );

  }
);
