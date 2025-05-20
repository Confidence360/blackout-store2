let products = [];
let selected = new Set();
let isDark = true;
let csvURL = "products.csv";

// Load products on startup
window.addEventListener("DOMContentLoaded", () => {
  loadCSV();
});

// Load CSV file
async function loadCSV() {
  try {
    const res = await fetch(csvURL);
    const csv = await res.text();
    parseCSV(csv);
    document.getElementById("csvEditor").value = csv;
    showToast("Loaded CSV from server");
  } catch (e) {
    console.error("CSV fetch failed:", e);
    showToast("Using cached CSV");
  }
}

// Parse CSV into products array
function parseCSV(csv) {
  const rows = csv.trim().split("\n").slice(1);
  products = rows.map(row => {
    const [name, price, category, image] = row.split(",");
    return {
      name: name.trim(),
      price: parseFloat(price.trim()),
      category: category.trim(),
      image: image.trim() || "images/placeholder.jpg"
    };
  });
  renderProducts();
}

// Display product cards
function renderProducts() {
  const container = document.getElementById("product-list");
  const query = document.getElementById("search").value.toLowerCase();
  const min = parseFloat(document.getElementById("minPrice").value) || 0;
  const max = parseFloat(document.getElementById("maxPrice").value) || Infinity;

  container.innerHTML = "";
  products.forEach((p, i) => {
    if (
      p.name.toLowerCase().includes(query) &&
      p.price >= min &&
      p.price <= max
    ) {
      const card = document.createElement("div");
      card.className = "card";
      card.onclick = () => toggleSelect(i);
      card.classList.toggle("selected", selected.has(i));
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" />
        <div class="info">
          <h4>${p.name}</h4>
          <p>$${p.price.toFixed(2)}</p>
          <small>${p.category}</small>
        </div>`;
      container.appendChild(card);
    }
  });
  updateSummary();
}

// Toggle product selection
function toggleSelect(i) {
  if (selected.has(i)) {
    selected.delete(i);
  } else {
    selected.add(i);
  }
  renderProducts();
}

// Update total price and names
function updateSummary() {
  const total = [...selected].reduce((sum, i) => sum + products[i].price, 0);
  const names = [...selected].map(i => products[i].name).join(", ") || "None";
  document.getElementById("total-price").textContent = `$${total.toFixed(2)}`;
  document.getElementById("selected-names").textContent = "Selected: " + names;
}

// Clear selection
function clearSelection() {
  selected.clear();
  renderProducts();
}

// Toggle dark/light theme
function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle("light", !isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Apply changes from CSV editor
function applyCSVChanges() {
  const newCSV = document.getElementById("csvEditor").value;
  parseCSV(newCSV);
  showToast("CSV updated");
}

// Reload CSV file
function refreshCSV() {
  loadCSV();
}

// Show toast message
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}
