// Global variables
let products = [];
let salesLog = [];
let installments = [];
let nextProductId = 1;
let nextSaleId = 1;
let nextInstallmentId = 1;
let selectedProducts = [];
let currentSalesPage = 1;
const itemsPerPage = 10;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  initializeApp();
  setupEventListeners();
});

function setupEventListeners() {
  const today = new Date().toISOString().split('T')[0];
  const purchaseDateEl = document.getElementById('purchaseDate');
  if (purchaseDateEl) {
    purchaseDateEl.value = today;
  }
}

function initializeApp() {
  updateDashboard();
  updateProductsDisplay();
  updateSalesDisplay();
  updateInstallmentsDisplay();
}

function loadFromLocalStorage() {
  const savedProducts = localStorage.getItem('products');
  const savedSales = localStorage.getItem('salesLog');
  const savedInstallments = localStorage.getItem('installments');
  const savedIds = localStorage.getItem('ids');

  if (savedProducts) products = JSON.parse(savedProducts);
  if (savedSales) salesLog = JSON.parse(savedSales);
  if (savedInstallments) installments = JSON.parse(savedInstallments);
  
  if (savedIds) {
    const ids = JSON.parse(savedIds);
    nextProductId = ids.productId || 1;
    nextSaleId = ids.saleId || 1;
    nextInstallmentId = ids.installmentId || 1;
  }
}

function saveToLocalStorage() {
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('salesLog', JSON.stringify(salesLog));
  localStorage.setItem('installments', JSON.stringify(installments));
  localStorage.setItem('ids', JSON.stringify({
    productId: nextProductId,
    saleId: nextSaleId,
    installmentId: nextInstallmentId
  }));
}

function formatCLP(amount) {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function toggleCustomCategory() {
  const select = document.getElementById('productCategory');
  const input = document.getElementById('customCategoryInput');
  
  if (input.style.display === 'none') {
    input.style.display = 'block';
    select.style.display = 'none';
  } else {
    input.style.display = 'none';
    select.style.display = 'block';
  }
}

function addProduct() {
  const name = document.getElementById('productName').value;
  const quantity = parseInt(document.getElementById('productQuantity').value);
  const buyPrice = parseInt(document.getElementById('productBuyPrice').value);
  const sellPrice = parseInt(document.getElementById('productSellPrice').value);
  const purchaseDate = document.getElementById('purchaseDate').value;
  
  const categorySelect = document.getElementById('productCategory');
  const categoryInput = document.getElementById('customCategoryInput');
  let category = categorySelect.value;
  
  if (categoryInput.style.display !== 'none' && categoryInput.value) {
    category = categoryInput.value;
  }

  if (!name || !quantity || !buyPrice || !sellPrice || !purchaseDate || !category) {
    alert('Por favor completa todos los campos');
    return;
  }

  const product = {
    productId: nextProductId++,
    name,
    quantity,
    buyPrice,
    sellPrice,
    purchaseDate,
    category,
    totalCost: buyPrice * quantity
  };

  products.push(product);
  saveToLocalStorage();
  updateProductsDisplay();
  updateDashboard();

  // Reset form
  document.getElementById('addProductForm').reset();
  categoryInput.style.display = 'none';
  categorySelect.style.display = 'block';
  
  const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
  modal.hide();
}

function updateProductsDisplay() {
  const container = document.getElementById('productsTable');
  let totalSpent = 0;

  const html = products.map(product => {
    totalSpent += product.totalCost;
    return `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-title text-primary">${product.name}</h6>
            <small class="text-muted d-block mb-2">Categoría: ${product.category}</small>
            <p class="mb-2"><strong>Cantidad:</strong> ${product.quantity}</p>
            <p class="mb-2"><strong>Precio Compra:</strong> $${formatCLP(product.buyPrice)}</p>
            <p class="mb-2"><strong>Precio Venta:</strong> $${formatCLP(product.sellPrice)}</p>
            <p class="mb-2"><strong>Total Gastado:</strong> $${formatCLP(product.totalCost)}</p>
            <small class="text-muted">Fecha: ${product.purchaseDate}</small>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
  document.getElementById('totalProductsCount').textContent = products.length;
  document.getElementById('totalMoneySpent').textContent = `$${formatCLP(totalSpent)}`;
}

function openSellModal() {
  const modal = new bootstrap.Modal(document.getElementById('sellProductModal'));
  modal.show();
  updateProductSelection();
}

function updateProductSelection() {
  const container = document.getElementById('productsSelectionContainer');
  
  const html = products.map((product, index) => `
    <div class="mb-2 p-2 bg-white rounded">
      <small>${product.name} - Stock: ${product.quantity}</small>
    </div>
  `).join('');

  container.innerHTML = html;
}

function addProductRow() {
  const table = document.getElementById('selectedProductsTable');
  const row = document.createElement('tr');
  
  const productSelect = products.map(p => `<option value="${p.productId}">${p.name}</option>`).join('');
  
  row.innerHTML = `
    <td>
      <select class="form-select form-select-sm" onchange="updateSaleTotal()">
        <option value="">Seleccionar...</option>
        ${productSelect}
      </select>
    </td>
    <td><input type="number" class="form-control form-control-sm" min="1" value="1" onchange="updateSaleTotal()" oninput="updateSaleTotal()"></td>
    <td><input type="number" class="form-control form-control-sm" min="1" value="0" onchange="updateSaleTotal()" oninput="updateSaleTotal()"></td>
    <td><span>$0</span></td>
    <td><button class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove(); updateSaleTotal()">X</button></td>
  `;
  
  table.appendChild(row);
}

function updateSaleTotal() {
  const rows = document.querySelectorAll('#selectedProductsTable tr');
  let totalRevenue = 0;
  let totalCost = 0;

  rows.forEach(row => {
    const select = row.querySelector('select');
    const quantityInput = row.querySelectorAll('input')[0];
    const priceInput = row.querySelectorAll('input')[1];
    const subtotalCell = row.querySelector('span');

    if (select.value && quantityInput.value && priceInput.value) {
      const product = products.find(p => p.productId == select.value);
      const quantity = parseInt(quantityInput.value);
      const price = parseInt(priceInput.value);
      const subtotal = price * quantity;

      subtotalCell.textContent = `$${formatCLP(subtotal)}`;
      totalRevenue += subtotal;
      totalCost += (product.buyPrice * quantity);
    }
  });

  const profit = totalRevenue - totalCost;
  document.getElementById('saleRevenue').textContent = formatCLP(totalRevenue);
  document.getElementById('saleProfit').textContent = formatCLP(profit);

  const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
  if (paymentType === 'installments') {
    const numInstallments = parseInt(document.getElementById('numberOfInstallments').value);
    const installmentAmount = Math.floor(totalRevenue / numInstallments);
    document.getElementById('installmentAmount').textContent = formatCLP(installmentAmount);
    document.getElementById('totalInstallmentCount').textContent = numInstallments;
  }
}

function toggleInstallments() {
  const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
  document.getElementById('installmentDetails').style.display = paymentType === 'installments' ? 'block' : 'none';
  document.getElementById('directSalesClientName').style.display = paymentType === 'full' ? 'block' : 'none';
  document.getElementById('installmentInfo').style.display = paymentType === 'installments' ? 'block' : 'none';
}

function sellProducts() {
  const rows = document.querySelectorAll('#selectedProductsTable tr');
  const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
  
  let clientName = '';
  let totalRevenue = 0;
  let totalCost = 0;
  const saleProducts = [];

  if (paymentType === 'full') {
    clientName = document.getElementById('directClientName').value;
  } else {
    clientName = document.getElementById('clientName').value;
  }

  if (!clientName) {
    alert('Ingresa el nombre del cliente');
    return;
  }

  rows.forEach(row => {
    const select = row.querySelector('select');
    const quantityInput = row.querySelectorAll('input')[0];
    const priceInput = row.querySelectorAll('input')[1];

    if (select.value && quantityInput.value && priceInput.value) {
      const product = products.find(p => p.productId == select.value);
      const quantity = parseInt(quantityInput.value);
      const price = parseInt(priceInput.value);
      const subtotal = price * quantity;

      saleProducts.push({
        productId: product.productId,
        name: product.name,
        quantity,
        sellPrice: price,
        subtotal
      });

      totalRevenue += subtotal;
      totalCost += (product.buyPrice * quantity);
      product.quantity -= quantity;
    }
  });

  if (saleProducts.length === 0) {
    alert('Selecciona al menos un producto');
    return;
  }

  const saleId = nextSaleId++;
  const now = new Date();

  if (paymentType === 'full') {
    const sale = {
      saleId,
      clientName,
      products: saleProducts,
      revenue: totalRevenue,
      cost: totalCost,
      profit: totalRevenue - totalCost,
      paymentType: 'full',
      status: 'Pagada',
      soldAt: now.toISOString(),
      fecha: now.toLocaleString('es-CL')
    };

    salesLog.push(sale);
  } else {
    const numInstallments = parseInt(document.getElementById('numberOfInstallments').value);
    const installmentAmount = Math.floor(totalRevenue / numInstallments);
    const installmentId = nextInstallmentId++;

    const installment = {
      installmentId,
      saleId,
      clientName,
      products: saleProducts,
      totalAmount: totalRevenue,
      numberOfInstallments: numInstallments,
      installmentAmount,
      totalPaid: 0,
      paidInstallments: 0,
      status: 'Pendiente',
      createdAt: now.toISOString()
    };

    installments.push(installment);

    for (let i = 0; i < numInstallments; i++) {
      const sale = {
        saleId,
        installmentId,
        clientName,
        products: saleProducts,
        revenue: i === 0 ? totalRevenue : 0,
        cost: i === 0 ? totalCost : 0,
        profit: i === 0 ? totalRevenue - totalCost : 0,
        paymentType: 'installments',
        status: 'Pendiente',
        soldAt: now.toISOString(),
        fecha: now.toLocaleString('es-CL')
      };

      salesLog.push(sale);
    }
  }

  saveToLocalStorage();
  updateDashboard();
  updateProductsDisplay();
  updateSalesDisplay();
  updateInstallmentsDisplay();

  // Reset form
  document.getElementById('selectedProductsTable').innerHTML = '';
  document.getElementById('directClientName').value = '';
  document.getElementById('clientName').value = '';
  document.getElementById('saleRevenue').textContent = '0';
  document.getElementById('saleProfit').textContent = '0';

  const modal = bootstrap.Modal.getInstance(document.getElementById('sellProductModal'));
  modal.hide();

  alert('Venta registrada exitosamente');
}

function updateDashboard() {
  let totalRevenue = 0;
  let totalCost = 0;
  let totalProductsSold = 0;

  salesLog.forEach(sale => {
    if (sale.revenue > 0) {
      totalRevenue += sale.revenue;
      totalCost += sale.cost;
    }
    totalProductsSold += sale.products.reduce((sum, p) => sum + p.quantity, 0);
  });

  const totalProfit = totalRevenue - totalCost;
  const totalProductsCost = products.reduce((sum, p) => sum + p.totalCost, 0);

  document.getElementById('totalProducts').textContent = products.length;
  document.getElementById('totalSalesAmount').textContent = `$${formatCLP(totalRevenue)}`;
  document.getElementById('totalProfit').textContent = `$${formatCLP(totalProfit)}`;
  document.getElementById('productsSold').textContent = totalProductsSold;
  document.getElementById('totalRevenue').textContent = `$${formatCLP(totalRevenue)}`;
  document.getElementById('totalCost').textContent = `$${formatCLP(totalProductsCost)}`;
  document.getElementById('totalProfitSales').textContent = `$${formatCLP(totalProfit)}`;
  document.getElementById('totalProductsSoldSales').textContent = totalProductsSold;
}

function updateSalesDisplay() {
  const container = document.getElementById('salesContainer');
  
  const uniqueSales = [];
  const seen = new Set();

  salesLog.forEach(sale => {
    const key = `${sale.saleId}_${sale.clientName}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSales.push(sale);
    }
  });

  const totalPages = Math.ceil(uniqueSales.length / itemsPerPage);
  const startIdx = (currentSalesPage - 1) * itemsPerPage;
  const pageData = uniqueSales.slice(startIdx, startIdx + itemsPerPage);

  const html = pageData.map((sale, idx) => {
    let statusColor = 'warning';
    let statusText = sale.status;

    if (sale.paymentType === 'full') {
      statusColor = 'success';
      statusText = 'Pagada';
    } else if (sale.status === 'Pendiente') {
      statusColor = 'warning';
    }

    const productsHTML = sale.products.map(p => `
      <div class="d-flex align-items-center mb-2">
        <span class="badge bg-primary me-2">x${p.quantity}</span>
        <span>${p.name}</span>
      </div>
    `).join('');

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h6 class="card-title text-primary mb-2">
              <i class="fas fa-user"></i> ${sale.clientName}
            </h6>
            <div class="mb-3">
              <small class="text-muted d-block mb-2">Productos:</small>
              ${productsHTML}
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <small class="text-muted">Ingresos</small>
                <p class="mb-0 fw-bold text-success">$${formatCLP(sale.revenue)}</p>
              </div>
              <div class="col-6">
                <small class="text-muted">Tipo</small>
                <p class="mb-0"><span class="badge ${sale.paymentType === 'installments' ? 'bg-info' : 'bg-success'}">${sale.paymentType === 'full' ? 'Completo' : 'Cuotas'}</span></p>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-${statusColor}">${statusText}</span>
              <button class="btn btn-sm btn-outline-primary" onclick="viewSaleDetail(${startIdx + pageData.indexOf(sale)})">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
  updateSalesPagination(totalPages);
}

function updateSalesPagination(totalPages) {
  const pagination = document.getElementById('salesPagination');
  pagination.innerHTML = '';

  if (currentSalesPage > 1) {
    pagination.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToSalesPage(${currentSalesPage - 1})">Anterior</a></li>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    const active = i === currentSalesPage ? 'active' : '';
    pagination.innerHTML += `<li class="page-item ${active}"><a class="page-link" href="#" onclick="goToSalesPage(${i})">${i}</a></li>`;
  }

  if (currentSalesPage < totalPages) {
    pagination.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToSalesPage(${currentSalesPage + 1})">Siguiente</a></li>`;
  }
}

function goToSalesPage(page) {
  currentSalesPage = page;
  updateSalesDisplay();
}

function viewSaleDetail(saleIndex) {
  const uniqueSales = [];
  const seen = new Set();

  salesLog.forEach(sale => {
    const key = `${sale.saleId}_${sale.clientName}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSales.push(sale);
    }
  });

  const sale = uniqueSales[saleIndex];
  if (!sale) return;

  document.getElementById('detailSaleId').textContent = sale.saleId;
  document.getElementById('detailClientName').textContent = sale.clientName;
  document.getElementById('detailRevenue').textContent = formatCLP(sale.revenue);
  document.getElementById('detailDate').textContent = sale.fecha;

  const paymentBadge = document.getElementById('detailPaymentType');
  paymentBadge.textContent = sale.paymentType === 'full' ? 'Completo' : 'Cuotas';
  paymentBadge.className = `badge ${sale.paymentType === 'full' ? 'bg-success' : 'bg-info'}`;

  const statusBadge = document.getElementById('detailStatus');
  statusBadge.textContent = sale.status;
  statusBadge.className = `badge ${sale.paymentType === 'full' ? 'bg-success' : 'bg-warning'}`;

  const productsContainer = document.getElementById('detailProducts');
  const productsHTML = sale.products.map(p => `
    <div class="mb-3 pb-2 border-bottom">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <small class="d-block fw-bold">${p.name}</small>
          <small class="text-muted">Cantidad: ${p.quantity}</small>
        </div>
        <div class="text-end">
          <small class="d-block text-muted">$${formatCLP(p.sellPrice)} c/u</small>
          <small class="fw-bold text-success">$${formatCLP(p.subtotal)}</small>
        </div>
      </div>
    </div>
  `).join('');

  productsContainer.innerHTML = productsHTML;

  const modal = new bootstrap.Modal(document.getElementById('saleDetailModal'));
  modal.show();
}

function updateInstallmentsDisplay() {
  const container = document.getElementById('installmentsContainer');

  let totalPaid = 0;
  let totalPending = 0;

  const html = installments.map(inst => {
    const paid = inst.totalPaid;
    const pending = inst.totalAmount - inst.totalPaid;
    totalPaid += paid;
    totalPending += pending;

    const percentage = Math.round((paid / inst.totalAmount) * 100);

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-title text-primary mb-2">#${inst.installmentId} - ${inst.clientName}</h6>
            <p class="mb-2"><strong>Total:</strong> $${formatCLP(inst.totalAmount)}</p>
            <p class="mb-2"><strong>Cuotas:</strong> ${inst.numberOfInstallments}</p>
            <p class="mb-2"><strong>Monto/Cuota:</strong> $${formatCLP(inst.installmentAmount)}</p>
            <p class="mb-2"><strong>Pagado:</strong> $${formatCLP(paid)}</p>
            <p class="mb-2"><strong>Por Pagar:</strong> $${formatCLP(pending)}</p>
            <div class="progress mb-2">
              <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
            </div>
            <button class="btn btn-sm btn-primary w-100" onclick="recordPayment(${inst.installmentId})">
              Registrar Pago
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;

  document.getElementById('totalInstallments').textContent = installments.length;
  document.getElementById('totalPaid').textContent = `$${formatCLP(totalPaid)}`;
  document.getElementById('totalPending').textContent = `$${formatCLP(totalPending)}`;

  const totalAmount = totalPaid + totalPending;
  const percentage = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
  document.getElementById('percentagePaid').textContent = `${percentage}%`;
}

function recordPayment(installmentId) {
  const installment = installments.find(i => i.installmentId === installmentId);
  if (!installment) return;

  const amount = prompt(`Ingresa monto a pagar (Máximo: $${formatCLP(installment.totalAmount - installment.totalPaid)})`);
  if (!amount) return;

  const paymentAmount = parseInt(amount);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    alert('Monto inválido');
    return;
  }

  if (paymentAmount > installment.totalAmount - installment.totalPaid) {
    alert('El monto excede lo pendiente');
    return;
  }

  installment.totalPaid += paymentAmount;
  installment.paidInstallments = Math.ceil(installment.totalPaid / installment.installmentAmount);

  if (installment.totalPaid >= installment.totalAmount) {
    installment.status = 'Completo';
  }

  saveToLocalStorage();
  updateInstallmentsDisplay();
  updateDashboard();
}

function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.style.display = 'none');

  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = 'block';
  }

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  event.target.closest('.nav-link').classList.add('active');

  if (sectionId === 'analytics') {
    updateAnalytics();
  }
}

function updateAnalytics() {
  if (!salesLog || salesLog.length === 0) {
    document.getElementById('analyticsTable').innerHTML = '<tr><td colspan="7" class="text-center text-muted">Sin ventas</td></tr>';
    return;
  }

  const uniqueSales = [];
  const seen = new Set();

  salesLog.forEach(sale => {
    const key = `${sale.saleId}_${sale.clientName}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSales.push(sale);
    }
  });

  const tableRows = uniqueSales.map(sale => {
    const revenue = sale.revenue || 0;
    const amount40 = Math.floor(revenue * 0.40);
    const amount30 = Math.floor(revenue * 0.30);
    const amount20 = Math.floor(revenue * 0.20);
    const amount10 = Math.floor(revenue * 0.10);

    return `
      <tr>
        <td><strong>${sale.clientName}</strong></td>
        <td>$${formatCLP(revenue)}</td>
        <td class="text-primary">$${formatCLP(amount40)}</td>
        <td class="text-danger">$${formatCLP(amount30)}</td>
        <td class="text-info">$${formatCLP(amount20)}</td>
        <td class="text-success">$${formatCLP(amount10)}</td>
        <td><small>${sale.fecha}</small></td>
      </tr>
    `;
  }).join('');

  document.getElementById('analyticsTable').innerHTML = tableRows;
}
