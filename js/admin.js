import { supabase } from './supabase-config.js';
import { checkAdmin, logout } from './auth.js';

// Protect the page
checkAdmin();

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    
    // Logout listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

async function initDashboard() {
    try {
        // Fetch stats in parallel
        const [usersCount, ordersCount, servicesCount, revenueSum] = await Promise.all([
            fetchUsersCount(),
            fetchOrdersCount(),
            fetchServicesCount(),
            fetchTotalRevenue()
        ]);

        // Update UI
        document.getElementById('totalUsers').textContent = usersCount || 0;
        document.getElementById('totalOrders').textContent = ordersCount || 0;
        document.getElementById('totalServices').textContent = servicesCount || 0;
        document.getElementById('totalRevenue').textContent = `$${(revenueSum || 0).toLocaleString()}`;
        
        // Hide loaders
        document.querySelectorAll('.stat-loader').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.stat-value').forEach(el => el.classList.remove('hidden'));

    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

async function fetchUsersCount() {
    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
}

async function fetchOrdersCount() {
    const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
}

async function fetchServicesCount() {
    const { count, error } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
}

async function fetchTotalRevenue() {
    // Assuming revenue is sum of all transactions of type 'deposit'
    // Or you might want to sum order amounts if you have a cost column in orders.
    // Based on the SQL, transactions has 'amount' and 'type'.
    const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit');
    
    if (error) throw error;
    
    return data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
}
