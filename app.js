// Data Storage
let inventory = [];
let categories = [];
let currentEditId = null;

// Initialize app with sample data
function initApp() {
    // Load data from localStorage if exists
    loadData();

    // If no data, add sample data
    if (categories.length === 0) {
        addSampleData();
    }

    // Render everything
    renderDashboard();
    renderInventory();
    renderCategories();
    renderReports();
    updateCategorySelects();
}

// Add sample data for demonstration
function addSampleData() {
    categories = [
        { id: 1, name: 'Elektronik', icon: '📱', description: 'Perangkat elektronik dan aksesori' },
        { id: 2, name: 'Furnitur', icon: '🪑', description: 'Mebel dan furniture kantor' },
        { id: 3, name: 'Alat Tulis', icon: '✏️', description: 'Perlengkapan tulis dan kantor' },
        { id: 4, name: 'Makanan', icon: '🍔', description: 'Produk makanan dan minuman' }
    ];

    inventory = [
        {
            id: 1,
            code: 'ELK001',
            name: 'Laptop Dell XPS 13',
            category: 'Elektronik',
            stock: 15,
            minStock: 5,
            price: 15000000,
            description: 'Laptop premium untuk bisnis'
        },
        {
            id: 2,
            code: 'FRN001',
            name: 'Kursi Kantor Ergonomis',
            category: 'Furnitur',
            stock: 25,
            minStock: 10,
            price: 2500000,
            description: 'Kursi dengan sandaran punggung adjustable'
        },
        {
            id: 3,
            code: 'ATK001',
            name: 'Pulpen Pilot',
            category: 'Alat Tulis',
            stock: 3,
            minStock: 20,
            price: 5000,
            description: 'Pulpen tinta biru 0.7mm'
        },
        {
            id: 4,
            code: 'ELK002',
            name: 'Mouse Wireless Logitech',
            category: 'Elektronik',
            stock: 45,
            minStock: 15,
            price: 250000,
            description: 'Mouse wireless dengan baterai tahan lama'
        },
        {
            id: 5,
            code: 'MKN001',
            name: 'Kopi Arabica Premium',
            category: 'Makanan',
            stock: 100,
            minStock: 30,
            price: 150000,
            description: 'Kopi arabica asli dari pegunungan'
        }
    ];

    saveData();
}

// LocalStorage functions
function saveData() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('categories', JSON.stringify(categories));
}

function loadData() {
    const savedInventory = localStorage.getItem('inventory');
    const savedCategories = localStorage.getItem('categories');

    if (savedInventory) inventory = JSON.parse(savedInventory);
    if (savedCategories) categories = JSON.parse(savedCategories);
}

// Page Navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Show selected page
    document.getElementById(pageName + '-page').style.display = 'block';

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.nav-btn').classList.add('active');
}

// Dashboard
function renderDashboard() {
    const totalItems = inventory.length;
    const totalCategories = categories.length;
    const lowStock = inventory.filter(item => item.stock <= item.minStock).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-categories').textContent = totalCategories;
    document.getElementById('low-stock').textContent = lowStock;
    document.getElementById('total-value').textContent = formatCurrency(totalValue);

    // Recent items (last 5)
    const recentItems = inventory.slice(-5).reverse();
    const tableBody = document.getElementById('recent-items-table');

    if (recentItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-icon">📦</div>
                    <p>Belum ada barang. Tambahkan barang pertama Anda!</p>
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = recentItems.map(item => `
            <tr>
                <td data-label="Kode">${item.code}</td>
                <td data-label="Nama Barang">${item.name}</td>
                <td data-label="Kategori">${item.category}</td>
                <td data-label="Stok">${item.stock}</td>
                <td data-label="Status">${getStockBadge(item)}</td>
            </tr>
        `).join('');
    }
}

// Inventory
function renderInventory() {
    const tableBody = document.getElementById('inventory-table');

    if (inventory.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-icon">📦</div>
                    <p>Belum ada barang dalam inventaris</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = inventory.map(item => `
        <tr>
            <td data-label="Kode">${item.code}</td>
            <td data-label="Nama Barang">${item.name}</td>
            <td data-label="Kategori">${item.category}</td>
            <td data-label="Stok">${item.stock}</td>
            <td data-label="Harga">${formatCurrency(item.price)}</td>
            <td data-label="Status">${getStockBadge(item)}</td>
            <td data-label="Aksi">
                <div class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="editItem(${item.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteItem(${item.id})" title="Hapus">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterInventory() {
    const searchTerm = document.getElementById('search-inventory').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;

    const filtered = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
            item.code.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const tableBody = document.getElementById('inventory-table');

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>Tidak ada barang yang sesuai dengan pencarian</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(item => `
        <tr>
            <td data-label="Kode">${item.code}</td>
            <td data-label="Nama Barang">${item.name}</td>
            <td data-label="Kategori">${item.category}</td>
            <td data-label="Stok">${item.stock}</td>
            <td data-label="Harga">${formatCurrency(item.price)}</td>
            <td data-label="Status">${getStockBadge(item)}</td>
            <td data-label="Aksi">
                <div class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="editItem(${item.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteItem(${item.id})" title="Hapus">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Categories
function renderCategories() {
    const grid = document.getElementById('categories-grid');

    if (categories.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏷️</div>
                <p>Belum ada kategori</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = categories.map(category => {
        const itemCount = inventory.filter(item => item.category === category.name).length;
        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${category.icon}</div>
                        <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${category.name}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                            ${category.description || 'Tidak ada deskripsi'}
                        </p>
                        <span class="badge badge-info">${itemCount} barang</span>
                    </div>
                    <button class="btn btn-sm btn-secondary btn-icon" onclick="deleteCategory(${category.id})" title="Hapus">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
// Reports
function renderReports() {
    // Calculate statistics
    const categoryStats = {};
    inventory.forEach(item => {
        if (!categoryStats[item.category]) {
            categoryStats[item.category] = {
                count: 0,
                totalStock: 0,
                totalValue: 0
            };
        }
        categoryStats[item.category].count++;
        categoryStats[item.category].totalStock += item.stock;
        categoryStats[item.category].totalValue += item.stock * item.price;
    });

    // Top item (lowest stock)
    const topItem = inventory.length > 0
        ? inventory.reduce((min, item) => item.stock < min.stock ? item : min, inventory[0])
        : null;
    document.getElementById('top-item').textContent = topItem ? topItem.name : '-';

    // Top category (most items)
    let topCategory = null;
    let maxCount = 0;
    for (const [category, stats] of Object.entries(categoryStats)) {
        if (stats.count > maxCount) {
            maxCount = stats.count;
            topCategory = category;
        }
    }
    document.getElementById('top-category').textContent = topCategory || '-';

    // Total stock (calculate first to avoid redeclaration)
    const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
    document.getElementById('total-stock').textContent = totalStock;

    // Average price (Weighted Average)
    const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);
    const avgPrice = totalStock > 0 ? totalValue / totalStock : 0;
    document.getElementById('avg-price').textContent = formatCurrency(avgPrice);

    // Report table
    const tableBody = document.getElementById('report-table');
    const reportData = Object.entries(categoryStats);

    if (reportData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-icon">📊</div>
                    <p>Belum ada data untuk laporan</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = reportData.map(([category, stats]) => {
        const avgPrice = stats.totalStock > 0 ? stats.totalValue / stats.totalStock : 0;
        return `
        <tr>
            <td data-label="Kategori">${category}</td>
            <td data-label="Jumlah Barang">${stats.count}</td>
            <td data-label="Total Stok">${stats.totalStock}</td>
            <td data-label="Rata-rata Harga">${formatCurrency(avgPrice)}</td>
            <td data-label="Total Nilai">${formatCurrency(stats.totalValue)}</td>
        </tr>
        `;
    }).join('');
}

// Item CRUD
function showAddItemModal() {
    currentEditId = null;
    document.getElementById('item-modal-title').textContent = 'Tambah Barang';
    document.getElementById('item-form').reset();
    document.getElementById('item-id').value = '';
    openModal('item-modal');
}

function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    currentEditId = id;
    document.getElementById('item-modal-title').textContent = 'Edit Barang';
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-code').value = item.code;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-stock').value = item.stock;
    document.getElementById('item-min-stock').value = item.minStock;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-description').value = item.description || '';

    openModal('item-modal');
}

function saveItem(event) {
    event.preventDefault();

    const itemData = {
        code: document.getElementById('item-code').value,
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        stock: parseInt(document.getElementById('item-stock').value),
        minStock: parseInt(document.getElementById('item-min-stock').value),
        price: parseInt(document.getElementById('item-price').value),
        description: document.getElementById('item-description').value
    };

    if (currentEditId) {
        // Edit existing
        const index = inventory.findIndex(i => i.id === currentEditId);
        inventory[index] = { ...inventory[index], ...itemData };
    } else {
        // Add new
        const newId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
        inventory.push({ id: newId, ...itemData });
    }

    saveData();
    renderDashboard();
    renderInventory();
    renderReports();
    closeModal('item-modal');

    // Show success notification
    if (currentEditId) {
        showToast('Berhasil!', 'Barang berhasil diperbarui', 'success');
    } else {
        showToast('Berhasil!', 'Barang baru berhasil ditambahkan', 'success');
    }
}

async function deleteItem(id) {
    const item = inventory.find(i => i.id === id);
    const itemName = item ? item.name : 'Barang';

    const confirmed = await showConfirm(
        'Hapus Barang?',
        `Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini tidak dapat dibatalkan.`,
        'Ya, Hapus',
        'Batal'
    );

    if (confirmed) {
        inventory = inventory.filter(i => i.id !== id);
        saveData();
        renderDashboard();
        renderInventory();
        renderReports();

        showToast('Terhapus!', `${itemName} berhasil dihapus`, 'success');
    }
}

// Category CRUD
function showAddCategoryModal() {
    document.getElementById('category-form').reset();
    openModal('category-modal');
}

function saveCategory(event) {
    event.preventDefault();

    const categoryData = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name: document.getElementById('category-name').value,
        icon: document.getElementById('category-icon').value || '📦',
        description: document.getElementById('category-description').value
    };

    categories.push(categoryData);
    saveData();
    renderCategories();
    renderReports();
    updateCategorySelects();
    closeModal('category-modal');

    showToast('Berhasil!', 'Kategori baru berhasil ditambahkan', 'success');
}

async function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    const hasItems = inventory.some(item => item.category === category.name);

    if (hasItems) {
        showToast('Tidak Bisa Dihapus', 'Kategori masih memiliki barang!', 'error', 4000);
        return;
    }

    const categoryName = category ? category.name : 'Kategori';
    const confirmed = await showConfirm(
        'Hapus Kategori?',
        `Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`,
        'Ya, Hapus',
        'Batal'
    );

    if (confirmed) {
        categories = categories.filter(c => c.id !== id);
        saveData();
        renderCategories();
        updateCategorySelects();

        showToast('Terhapus!', `${categoryName} berhasil dihapus`, 'success');
    }
}


// Helper functions
function updateCategorySelects() {
    const selects = [
        document.getElementById('item-category'),
        document.getElementById('filter-category')
    ];

    selects.forEach(select => {
        const currentValue = select.value;
        const isFilter = select.id === 'filter-category';

        select.innerHTML = isFilter
            ? '<option value="">Semua Kategori</option>'
            : '<option value="">Pilih Kategori</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `${category.icon} ${category.name}`;
            select.appendChild(option);
        });

        select.value = currentValue;
    });
}

function getStockBadge(item) {
    if (item.stock === 0) {
        return '<span class="badge badge-danger">Habis</span>';
    } else if (item.stock <= item.minStock) {
        return '<span class="badge badge-warning">Stok Rendah</span>';
    } else {
        return '<span class="badge badge-success">Tersedia</span>';
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});



// Custom Confirm Dialog
function showConfirm(title, message, okText = 'Ya, Hapus', cancelText = 'Batal') {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');

        // Set content
        titleEl.textContent = title;
        messageEl.textContent = message;
        okBtn.textContent = okText;
        cancelBtn.textContent = cancelText;

        // Show modal
        modal.classList.add('active');

        // Handle OK
        const handleOk = () => {
            modal.classList.remove('active');
            cleanup();
            resolve(true);
        };

        // Handle Cancel
        const handleCancel = () => {
            modal.classList.remove('active');
            cleanup();
            resolve(false);
        };

        // Cleanup listeners
        const cleanup = () => {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        // Add listeners
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}
// Toast Notification System
function showToast(title, message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');

    body.classList.toggle('light-theme');

    // Update icon
    if (body.classList.contains('light-theme')) {
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
}

// Load theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navContent = document.querySelector('.nav-content');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuIcon = document.getElementById('menu-icon');

    navContent.classList.toggle('active');
    menuBtn.classList.toggle('active');

    if (navContent.classList.contains('active')) {
        menuIcon.textContent = '✕';
    } else {
        menuIcon.textContent = '☰';
    }
}

// Close mobile menu when clicking nav item
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-btn')) {
        const navContent = document.querySelector('.nav-content');
        const menuBtn = document.getElementById('mobile-menu-btn');
        const menuIcon = document.getElementById('menu-icon');

        if (window.innerWidth <= 768 && navContent.classList.contains('active')) {
            navContent.classList.remove('active');
            menuBtn.classList.remove('active');
            menuIcon.textContent = '☰';
        }
    }
});

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    initApp();
});


