let products = [], selection = {};

function showToast(message) {
  alert(message); // simple fallback
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const values = line.split(",");
    let entry = {};
    headers.forEach((h, i) => {
      entry[h.trim()] = h.toLowerCase() === "price" ? parseFloat(values[i]) : values[i];
    });
    return entry;
  });
}

function renderProducts() {
  const list = document.getElementById("product-list");
  const search = document.getElementById("search").value.toLowerCase();
  const min = parseFloat(document.getElementById("minPrice").value) || 0;
  const max = parseFloat(document.getElementById("maxPrice").value) || Infinity;
  list.innerHTML = "";

  for (let p of products) {
    if (!p.name.toLowerCase().includes(search) || p.price < min || p.price > max) continue;

    let div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='images/fallback.jpg'" />
      <div class="product-name">${p.name}</div>
      <div class="product-price">$${p.price}</div>
      <div class="product-controls">
        <button onclick="adjustSelection('${p.name}', -1)">−</button>
        <span>${selection[p.name] || 0}</span>
        <button onclick="adjustSelection('${p.name}', 1)">+</button>
      </div>
    `;
    list.appendChild(div);
  }
}

function adjustSelection(name, delta) {
  selection[name] = (selection[name] || 0) + delta;
  if (selection[name] < 0) selection[name] = 0;
  updateSidebar();
  renderProducts();
}

function updateSidebar() {
  let total = 0;
  let list = [];

  for (let [name, qty] of Object.entries(selection)) {
    if (qty > 0) {
      const item = products.find(p => p.name === name);
      total += item.price * qty;
      list.push(`${name} (${qty})`);
    }
  }

  document.getElementById("total-price").textContent = `$${total.toFixed(2)}`;
  document.getElementById("selected-names").textContent = list.length ? `Selected: ${list.join(", ")}` : "Selected: None";
}

function clearSelection() {
  selection = {};
  updateSidebar();
  renderProducts();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

async function loadCSV() {
  try {
    const res = await fetch("products.csv");
    const text = await res.text();
    products = parseCSV(text);
    renderProducts();
  } catch (e) {
    alert("Failed to load products.");
    console.error(e);
  }
}

loadCSV();
