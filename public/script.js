const CONFIG = {
  apiBase: "/api",

  // Nigerian WhatsApp number in international format.
  whatsappNumber: "2349138194324"
};

const S = {
  user: JSON.parse(localStorage.getItem("gn_user") || "null"),
  token: localStorage.getItem("gn_token") || "",

  cart: JSON.parse(localStorage.getItem("gn_cart") || "[]"),
  wish: JSON.parse(localStorage.getItem("gn_wish") || "[]"),

  products: [],
  categories: [],

  view: "home",

  shopCategory: "",
  searchQuery: "",
  sort: "default"
};

const $ = selector => document.querySelector(selector);

const money = number =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(number) || 0);

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));

/* =========================
   TOAST
========================= */

function toast(message) {
  const element = $("#toast");

  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, 2800);
}

/* =========================
   SAVE LOCAL DATA
========================= */

function save() {
  localStorage.setItem(
    "gn_cart",
    JSON.stringify(S.cart)
  );

  localStorage.setItem(
    "gn_wish",
    JSON.stringify(S.wish)
  );
}

/* =========================
   API
========================= */

async function api(path, options = {}) {

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (S.token) {
    headers.Authorization = `Bearer ${S.token}`;
  }

  const response = await fetch(
    CONFIG.apiBase + path,
    {
      ...options,
      headers
    }
  );

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {

    const error = new Error(
      data.message || "Request failed"
    );

    error.status = response.status;

    throw error;
  }

  return data;
}

/* =========================
   IMAGE
========================= */

function pic(url) {
  return (
    url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85"
  );
}

/* =========================
   PRODUCT HELPERS
========================= */

function product(id) {
  return S.products.find(
    p => String(p.id) === String(id)
  );
}

function total() {
  return S.cart.reduce(
    (amount, item) =>
      amount + Number(item.price || 0) * Number(item.qty || 0),
    0
  );
}

/* =========================
   LOAD CATALOGUE
========================= */

async function catalog() {

  const data = await api("/products");

  S.products = Array.isArray(data.products)
    ? data.products
    : [];

  S.categories = Array.isArray(data.categories)
    ? data.categories
    : [];

  render();
}

/* =========================
   PRODUCT SEARCH TEXT
========================= */

function searchableProductText(p) {

  const values = [
    p.id,
    p.name,
    p.category,
    p.description,
    p.brand,
    p.sku,
    p.tags,
    p.keywords,
    p.search
  ];

  return values
    .flat(Infinity)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/* =========================
   SEARCH PRODUCTS
========================= */

function searchProducts(products) {

  const query =
    String(S.searchQuery || "")
      .trim()
      .toLowerCase();

  if (!query) {
    return products;
  }

  const words =
    query
      .split(/\s+/)
      .filter(Boolean);

  return products.filter(p => {

    const text =
      searchableProductText(p);

    /*
      Every word entered must be found
      somewhere in the product information.
    */

    return words.every(
      word => text.includes(word)
    );
  });
}

/* =========================
   PRODUCT CARD
========================= */

function card(p) {

  const wished =
    S.wish.includes(p.id);

  return `
    <article class="card">

      <button
        class="heart"
        data-wish="${esc(p.id)}"
        title="Wishlist"
      >
        ${wished ? "♥" : "♡"}
      </button>

      <img
        src="${pic(p.image)}"
        alt="${esc(p.name)}"
        loading="lazy"
      >

      <div class="card-body">

        <small>
          ★★★★★ ${p.rating || 4.7}
        </small>

        <h3>
          ${esc(p.name)}
        </h3>

        <div class="price">

          ${money(p.price)}

          ${
            p.oldPrice
              ? `
                <span class="old">
                  ${money(p.oldPrice)}
                </span>
              `
              : ""
          }

        </div>

        <div class="card-actions">

          <button
            class="btn primary"
            data-add="${esc(p.id)}"
          >
            Add to cart
          </button>

          <button
            class="btn"
            style="border:1px solid #ddd"
            data-buy="${esc(p.id)}"
          >
            Buy
          </button>

        </div>

      </div>

    </article>
  `;
}

/* =========================
   MAIN RENDER
========================= */

function render() {

  if (!S.user || !S.token) {

    $("#auth")?.classList.remove("hidden");
    $("#app")?.classList.add("hidden");

    return;
  }

  $("#auth")?.classList.add("hidden");
  $("#app")?.classList.remove("hidden");

  if ($("#cartCount")) {

    $("#cartCount").textContent =
      S.cart.reduce(
        (amount, item) =>
          amount + Number(item.qty || 0),
        0
      );
  }

  if ($("#wishCount")) {
    $("#wishCount").textContent =
      S.wish.length;
  }

  if ($("#avatar")) {

    $("#avatar").textContent =
      (S.user.name || "G")
        .charAt(0)
        .toUpperCase();
  }

  const main = $("#main");

  if (!main) return;

  if (S.view === "home") {
    home(main);
  }

  else if (S.view === "shop") {
    shop(main);
  }

  else if (S.view === "categories") {
    cats(main);
  }

  else if (S.view === "deals") {
    deals(main);
  }

  else if (S.view === "cart") {
    cart(main);
  }

  else if (S.view === "checkout") {
    checkout(main);
  }

  else if (S.view === "orders") {
    orders(main);
  }

  else if (S.view === "account") {
    account(main);
  }

  else if (S.view === "wishlist") {
    wish(main);
  }

  else {
    home(main);
  }
}

/* =========================
   HOME
========================= */

function home(main) {

  main.innerHTML = `

    <section class="hero">

      <div>

        <p class="eyebrow">
          GOOD NEWS SHOPPING
        </p>

        <h1>
          Shop smarter.<br>
          <em>Live better.</em>
        </h1>

        <p>
          Quality products, secure checkout
          and real order tracking.
        </p>

        <button
          class="btn primary"
          data-view="shop"
        >
          Shop now →
        </button>

      </div>

      <img
        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
        alt="Shopping"
      >

    </section>

    <div class="section">

      <h2>
        Popular products
      </h2>

      <button data-view="shop">
        See all →
      </button>

    </div>

    <div class="grid">
      ${S.products
        .slice(0, 8)
        .map(card)
        .join("")}
    </div>

    <div class="section">
      <h2>Categories</h2>
    </div>

    <div class="categories">
      ${S.categories
        .slice(0, 8)
        .map(categoryButton)
        .join("")}
    </div>
  `;
}

/* =========================
   CATEGORY BUTTON
========================= */

function categoryButton(category) {

  return `
    <button
      class="cat"
      data-cat="${esc(category.name)}"
    >

      <span>
        ${esc(category.icon || "🛍️")}
      </span>

      ${esc(category.name)}

    </button>
  `;
}

/* =========================
   SHOP
========================= */

function shop(main) {

  let products =
    [...S.products];

  /* CATEGORY */

  if (S.shopCategory) {

    products =
      products.filter(
        p =>
          String(p.category || "")
            .toLowerCase() ===
          String(S.shopCategory)
            .toLowerCase()
      );
  }

  /* SEARCH */

  products =
    searchProducts(products);

  /* SORT */

  if (S.sort === "price-low") {

    products.sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    );
  }

  else if (S.sort === "price-high") {

    products.sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    );
  }

  else if (S.sort === "name") {

    products.sort(
      (a, b) =>
        String(a.name || "")
          .localeCompare(
            String(b.name || "")
          )
    );
  }

  else if (S.sort === "rating") {

    products.sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    );
  }

  main.innerHTML = `

    <div class="section">

      <div>

        <h2>
          Shop
        </h2>

        <span>
          ${products.length}
          product${products.length === 1 ? "" : "s"}
        </span>

      </div>

    </div>

    <div
      style="
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin-bottom:20px;
      "
    >

      <input
        id="catalogSearch"
        type="search"
        placeholder="Search any product..."
        value="${esc(S.searchQuery)}"
        style="
          flex:1;
          min-width:200px;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
        "
      >

      <select
        id="sortProducts"
        style="
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
        "
      >

        <option value="default"
          ${S.sort === "default" ? "selected" : ""}>
          Sort by
        </option>

        <option value="price-low"
          ${S.sort === "price-low" ? "selected" : ""}>
          Price: Low to High
        </option>

        <option value="price-high"
          ${S.sort === "price-high" ? "selected" : ""}>
          Price: High to Low
        </option>

        <option value="name"
          ${S.sort === "name" ? "selected" : ""}>
          Name: A-Z
        </option>

        <option value="rating"
          ${S.sort === "rating" ? "selected" : ""}>
          Highest Rated
        </option>

      </select>

      ${
        S.shopCategory || S.searchQuery
          ? `
            <button
              class="btn"
              id="clearFilters"
            >
              Clear
            </button>
          `
          : ""
      }

    </div>

    ${
      S.shopCategory
        ? `
          <div
            style="
              margin-bottom:15px;
              font-weight:600;
            "
          >
            Category:
            ${esc(S.shopCategory)}
          </div>
        `
        : ""
    }

    ${
      products.length

        ? `
          <div class="grid">
            ${products
              .map(card)
              .join("")}
          </div>
        `

        : `
          <div class="summary">

            <h3>
              No products found.
            </h3>

            <p>
              Try another product name,
              category or keyword.
            </p>

            <button
              class="btn primary"
              id="clearFilters"
            >
              Show all products
            </button>

          </div>
        `
    }
  `;

  setupShopControls();
}

/* =========================
   SHOP CONTROLS
========================= */

function setupShopControls() {

  const search =
    $("#catalogSearch");

  if (search) {

    search.addEventListener(
      "input",
      event => {

        S.searchQuery =
          event.target.value;

        shop($("#main"));
      }
    );
  }

  const sort =
    $("#sortProducts");

  if (sort) {

    sort.addEventListener(
      "change",
      event => {

        S.sort =
          event.target.value;

        shop($("#main"));
      }
    );
  }

  const clear =
    $("#clearFilters");

  if (clear) {

    clear.addEventListener(
      "click",
      () => {

        S.searchQuery = "";
        S.shopCategory = "";
        S.sort = "default";

        shop($("#main"));
      }
    );
  }
}

/* =========================
   CATEGORIES
========================= */

function cats(main) {

  main.innerHTML = `

    <div class="section">
      <h2>Categories</h2>
    </div>

    <div class="categories">
      ${S.categories
        .map(categoryButton)
        .join("")}
    </div>
  `;
}

/* =========================
   DEALS
========================= */

function deals(main) {

  const products =
    S.products.filter(
      p =>
        Number(p.oldPrice || 0) >
        Number(p.price || 0)
    );

  main.innerHTML = `

    <div class="section">

      <h2>
        Today's Deals
      </h2>

      <span>
        ${products.length} deals
      </span>

    </div>

    ${
      products.length

        ? `
          <div class="grid">
            ${products
              .map(card)
              .join("")}
          </div>
        `

        : `
          <div class="summary">
            No deals available right now.
          </div>
        `
    }
  `;
}

/* =========================
   CART
========================= */

function cart(main) {

  if (!S.cart.length) {

    main.innerHTML = `

      <div class="section">
        <h2>Your cart</h2>
      </div>

      <div class="summary">

        <h3>
          Cart is empty.
        </h3>

        <button
          class="btn primary"
          data-view="shop"
        >
          Shop now
        </button>

      </div>
    `;

    return;
  }

  const subtotal = total();

  const delivery =
    subtotal > 500000
      ? 0
      : 2500;

  const grandTotal =
    subtotal + delivery;

  main.innerHTML = `

    <div class="section">

      <h2>Your cart</h2>

      <span>
        ${S.cart.length} item type(s)
      </span>

    </div>

    ${S.cart.map(item => {

      const p =
        product(item.id);

      if (!p) return "";

      return `
        <div class="cart-row">

          <img
            src="${pic(p.image)}"
            alt="${esc(p.name)}"
          >

          <div>

            <b>
              ${esc(p.name)}
            </b>

            <div>
              ${money(item.price)}
            </div>

          </div>

          <div class="qty">

            <button
              data-minus="${esc(item.id)}"
            >
              −
            </button>

            ${item.qty}

            <button
              data-plus="${esc(item.id)}"
            >
              +
            </button>

          </div>

          <button
            data-remove="${esc(item.id)}"
          >
            Remove
          </button>

        </div>
      `;

    }).join("")}

    <div
      class="summary"
      style="margin-top:18px"
    >

      <p>
        Subtotal:
        ${money(subtotal)}
      </p>

      <p>
        Delivery:
        ${
          delivery === 0
            ? "FREE"
            : money(delivery)
        }
      </p>

      <hr>

      <h3>
        Total:
        ${money(grandTotal)}
      </h3>

      <button
        class="btn primary"
        data-view="checkout"
      >
        Proceed to checkout
      </button>

    </div>
  `;
}

/* =========================
   CHECKOUT
========================= */

function checkout(main) {

  if (!S.cart.length) {

    S.view = "cart";

    render();

    return;
  }

  const orderTotal =
    total() +
    (total() > 500000 ? 0 : 2500);

  main.innerHTML = `

    <div class="section">
      <h2>Checkout</h2>
    </div>

    <div class="checkout-layout">

      <form
        id="checkoutForm"
        class="summary checkout"
      >

        <h3>
          Delivery details
        </h3>

        <label>
          Full name
        </label>

        <input
          id="cName"
          value="${esc(S.user.name)}"
          required
        >

        <label>
          Phone
        </label>

        <input
          id="cPhone"
          placeholder="080..."
          required
        >

        <label>
          State
        </label>

        <select
          id="cState"
          required
        >

          <option value="">
            Select state
          </option>

          <option>Lagos</option>
          <option>Abuja FCT</option>
          <option>Rivers</option>
          <option>Oyo</option>
          <option>Kano</option>
          <option>Enugu</option>
          <option>Other</option>

        </select>

        <label>
          City
        </label>

        <input
          id="cCity"
          required
        >

        <label>
          Address
        </label>

        <textarea
          id="cAddress"
          rows="4"
          required
        ></textarea>

        <label>
          Payment
        </label>

        <select id="cPayment">

          <option value="cash">
            Cash on delivery
          </option>

          <option value="transfer">
            Bank transfer
          </option>

          <option value="card">
            Card
          </option>

        </select>

        <button
          class="btn primary full"
          type="submit"
        >
          Place order
        </button>

      </form>

      <aside class="summary">

        <h3>
          Order summary
        </h3>

        ${S.cart.map(item => {

          const p =
            product(item.id);

          if (!p) return "";

          return `
            <p>
              ${item.qty} ×
              ${esc(p.name)}
              —
              ${money(
                item.price * item.qty
              )}
            </p>
          `;

        }).join("")}

        <hr>

        <h2>
          ${money(orderTotal)}
        </h2>

      </aside>

    </div>
  `;
}

/* =========================
   ORDERS
========================= */

async function orders(main) {

  main.innerHTML = `

    <div class="section">
      <h2>My Orders</h2>
    </div>

    <div id="ordersBox">
      Loading...
    </div>
  `;

  try {

    const data =
      await api("/orders/my");

    const box =
      $("#ordersBox");

    if (
      !data.orders ||
      !data.orders.length
    ) {

      box.innerHTML = `
        <div class="summary">
          No orders yet.
        </div>
      `;

      return;
    }

    const statuses = [
      "placed",
      "confirmed",
      "shipped",
      "delivered"
    ];

    box.innerHTML =
      data.orders.map(order => {

        const current =
          statuses.indexOf(
            order.status
          );

        return `
          <div class="order">

            <b>
              ${esc(order.orderNumber)}
            </b>

            <span
              class="status"
              style="float:right"
            >
              ${esc(order.status)}
            </span>

            <p>
              ${new Date(
                order.createdAt
              ).toLocaleString()}
            </p>

            <p>
              ${order.items.length}
              item(s)
              ·
              <b>
                ${money(order.total)}
              </b>
            </p>

            <div class="steps">

              ${statuses.map(
                (status, index) => `
                  <div
                    class="step ${
                      current >= index
                        ? "on"
                        : ""
                    }"
                  ></div>
                `
              ).join("")}

            </div>

          </div>
        `;

      }).join("");

  } catch (error) {

    /*
      IMPORTANT:
      Do NOT sign the customer out just because
      loading orders failed.
    */

    $("#ordersBox").innerHTML = `
      <div class="summary">

        <h3>
          Could not load your orders.
        </h3>

        <p>
          ${esc(error.message)}
        </p>

        <button
          class="btn primary"
          id="retryOrders"
        >
          Try again
        </button>

      </div>
    `;

    $("#retryOrders")?.addEventListener(
      "click",
      () => orders($("#main"))
    );
  }
}

/* =========================
   ACCOUNT
========================= */

function account(main) {

  main.innerHTML = `

    <div class="section">
      <h2>My account</h2>
    </div>

    <div class="summary">

      <h3>
        ${esc(S.user.name)}
      </h3>

      <p>
        ${esc(S.user.email)}
      </p>

      <button
        id="logout2"
        class="btn"
      >
        Sign out
      </button>

    </div>
  `;

  $("#logout2")?.addEventListener(
    "click",
    logout
  );
}

/* =========================
   WISHLIST
========================= */

function wish(main) {

  const products =
    S.products.filter(
      p => S.wish.includes(p.id)
    );

  main.innerHTML = `

    <div class="section">

      <h2>
        Wishlist
      </h2>

      <span>
        ${products.length} saved
      </span>

    </div>

    ${
      products.length

        ? `
          <div class="grid">
            ${products
              .map(card)
              .join("")}
          </div>
        `

        : `
          <div class="summary">

            <h3>
              Wishlist is empty.
            </h3>

            <button
              class="btn primary"
              data-view="shop"
            >
              Browse products
            </button>

          </div>
        `
    }
  `;
}

/* =========================
   ADD TO CART
========================= */

function add(id) {

  const p =
    product(id);

  if (!p) {

    toast(
      "Product not found"
    );

    return;
  }

  const existing =
    S.cart.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (existing) {

    existing.qty++;

  } else {

    S.cart.push({
      id: p.id,
      qty: 1,
      price: p.price
    });
  }

  save();

  render();

  toast(
    "Added to cart"
  );
}

/* =========================
   LOGOUT
========================= */

function logout() {

  S.user = null;
  S.token = "";

  localStorage.removeItem(
    "gn_user"
  );

  localStorage.removeItem(
    "gn_token"
  );

  render();
}

/* =========================
   LOGIN
========================= */

$("#loginForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    try {

      const data =
        await api(
          "/auth/login",
          {
            method: "POST",

            body: JSON.stringify({
              email:
                $("#loginEmail").value,

              password:
                $("#loginPassword").value
            })
          }
        );

      S.user = data.user;
      S.token = data.token;

      localStorage.setItem(
        "gn_user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "gn_token",
        data.token
      );

      await catalog();

    } catch (error) {

      toast(
        error.message
      );
    }
  }
);

/* =========================
   REGISTER
========================= */

$("#registerForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    try {

      const data =
        await api(
          "/auth/register",
          {
            method: "POST",

            body: JSON.stringify({
              name:
                $("#regName").value,

              email:
                $("#regEmail").value,

              password:
                $("#regPassword").value
            })
          }
        );

      S.user = data.user;
      S.token = data.token;

      localStorage.setItem(
        "gn_user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "gn_token",
        data.token
      );

      await catalog();

    } catch (error) {

      toast(
        error.message
      );
    }
  }
);

/* =========================
   SHOW LOGIN / REGISTER
========================= */

$("#showRegister")?.addEventListener(
  "click",
  () => {

    $("#loginBox")
      ?.classList
      .add("hidden");

    $("#registerBox")
      ?.classList
      .remove("hidden");
  }
);

$("#showLogin")?.addEventListener(
  "click",
  () => {

    $("#registerBox")
      ?.classList
      .add("hidden");

    $("#loginBox")
      ?.classList
      .remove("hidden");
  }
);

/* =========================
   CLICK EVENTS
========================= */

document.addEventListener(
  "click",
  event => {

    /* VIEW */

    const viewButton =
      event.target.closest(
        "[data-view]"
      );

    if (viewButton) {

      S.view =
        viewButton.dataset.view;

      if (
        S.view === "shop"
      ) {

        S.shopCategory = "";
        S.searchQuery = "";
        S.sort = "default";
      }

      render();

      return;
    }

    /* ADD */

    const addButton =
      event.target.closest(
        "[data-add]"
      );

    if (addButton) {

      add(
        addButton.dataset.add
      );

      return;
    }

    /* BUY */

    const buyButton =
      event.target.closest(
        "[data-buy]"
      );

    if (buyButton) {

      const id =
        buyButton.dataset.buy;

      add(id);

      S.view =
        "checkout";

      render();

      return;
    }

    /* WISHLIST */

    const wishButton =
      event.target.closest(
        "[data-wish]"
      );

    if (wishButton) {

      const id =
        wishButton.dataset.wish;

      if (
        S.wish.includes(id)
      ) {

        S.wish =
          S.wish.filter(
            x => x !== id
          );

        toast(
          "Removed from wishlist"
        );

      } else {

        S.wish.push(id);

        toast(
          "Added to wishlist"
        );
      }

      save();

      render();

      return;
    }

    /* CATEGORY */

    const category =
      event.target.closest(
        "[data-cat]"
      );

    if (category) {

      S.view = "shop";

      S.shopCategory =
        category.dataset.cat;

      S.searchQuery = "";
      S.sort = "default";

      shop($("#main"));

      return;
    }

    /* PLUS */

    const plus =
      event.target.closest(
        "[data-plus]"
      );

    if (plus) {

      const item =
        S.cart.find(
          x =>
            String(x.id) ===
            String(
              plus.dataset.plus
            )
        );

      if (item) {
        item.qty++;
      }

      save();
      render();

      return;
    }

    /* MINUS */

    const minus =
      event.target.closest(
        "[data-minus]"
      );

    if (minus) {

      const id =
        minus.dataset.minus;

      const item =
        S.cart.find(
          x =>
            String(x.id) ===
            String(id)
        );

      if (item) {

        item.qty--;

        if (item.qty < 1) {

          S.cart =
            S.cart.filter(
              x =>
                String(x.id) !==
                String(id)
            );
        }
      }

      save();
      render();

      return;
    }

    /* REMOVE */

    const remove =
      event.target.closest(
        "[data-remove]"
      );

    if (remove) {

      const id =
        remove.dataset.remove;

      S.cart =
        S.cart.filter(
          x =>
            String(x.id) !==
            String(id)
        );

      save();
      render();

      toast(
        "Removed from cart"
      );

      return;
    }
  }
);

/* =========================
   LOGOUT BUTTON
========================= */

$("#logout")?.addEventListener(
  "click",
  logout
);

/* =========================
   MOBILE MENU
========================= */

$("#menu")?.addEventListener(
  "click",
  () => {

    $("#mobileNav")
      ?.classList
      .toggle("open");
  }
);

/* =========================
   WHATSAPP
========================= */

$("#whatsapp")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    const message =
      encodeURIComponent(
        "Hello Good News Shopping, I need help."
      );

    const url =
      `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;

    /*
      Use a normal browser navigation so WhatsApp
      can open correctly on Android.
    */

    window.location.href = url;
  }
);

/* =========================
   TOP SEARCH
========================= */

function performTopSearch() {

  const input =
    $("#search");

  if (!input) return;

  S.searchQuery =
    input.value.trim();

  S.shopCategory = "";
  S.sort = "default";
  S.view = "shop";

  render();
}

$("#searchBtn")?.addEventListener(
  "click",
  performTopSearch
);

$("#search")?.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      event.preventDefault();

      performTopSearch();
    }
  }
);

/* =========================
   CHECKOUT / PLACE ORDER
========================= */

document.addEventListener(
  "submit",
  async event => {

    if (
      event.target.id !==
      "checkoutForm"
    ) {
      return;
    }

    event.preventDefault();

    if (!S.token) {

      toast(
        "Please sign in before placing your order."
      );

      return;
    }

    const submitButton =
      event.target.querySelector(
        'button[type="submit"]'
      );

    if (submitButton) {

      submitButton.disabled = true;
      submitButton.textContent =
        "Placing order...";
    }

    try {

      const data =
        await api(
          "/orders",
          {
            method: "POST",

            body: JSON.stringify({

              name:
                $("#cName").value,

              phone:
                $("#cPhone").value,

              state:
                $("#cState").value,

              city:
                $("#cCity").value,

              address:
                $("#cAddress").value,

              paymentMethod:
                $("#cPayment").value,

              items:
                S.cart.map(item => ({
                  productId: item.id,
                  qty: item.qty
                }))
            })
          }
        );

      /*
        Only clear the cart AFTER the server
        confirms that the order was created.
      */

      S.cart = [];

      save();

      toast(
        "Order " +
        data.order.orderNumber +
        " placed successfully"
      );

      S.view =
        "orders";

      render();

    } catch (error) {

      /*
        IMPORTANT:
        Never automatically log the customer out here.
        If the server has a real authentication problem,
        tell the customer instead.
      */

      if (
        error.status === 401 ||
        error.status === 403
      ) {

        toast(
          "Your login session needs to be refreshed. Please sign in again."
        );

      } else {

        toast(
          error.message ||
          "Could not place order. Please try again."
        );
      }

      if (submitButton) {

        submitButton.disabled = false;

        submitButton.textContent =
          "Place order";
      }
    }
  }
);

/* =========================
   YEAR
========================= */

if ($("#year")) {

  $("#year").textContent =
    new Date().getFullYear();
}

/* =========================
   START APPLICATION
========================= */

(async () => {

  /*
    If a login session exists, try loading
    the catalogue.

    IMPORTANT:
    A temporary catalogue/network error
    should NOT automatically delete the
    customer's saved login.
  */

  if (
    S.user &&
    S.token
  ) {

    try {

      await catalog();

    } catch (error) {

      console.error(
        "Catalogue loading error:",
        error
      );

      /*
        Keep the login session.
        Show the app rather than forcing
        the customer to sign in again.
      */

      $("#auth")
        ?.classList
        .add("hidden");

      $("#app")
        ?.classList
        .remove("hidden");

      toast(
        "Could not load products. Please refresh and try again."
      );
    }

  } else {

    render();
  }

})();
