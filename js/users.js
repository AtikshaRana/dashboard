import { supabase } from './supabase-config.js';
import { checkAdmin, logout } from './auth.js';

checkAdmin();

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
    
    // Search functionality
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterUsers(e.target.value);
        });
    }
});

let allUsers = [];

async function fetchUsers() {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center"><div class="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div></td></tr>';

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500">Failed to load users.</td></tr>';
        return;
    }

    allUsers = data;
    renderUsers(data);
}

function renderUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-500">No users found.</td></tr>';
        return;
    }

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition-all';
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-slate-800">${user.username || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${user.id.substring(0, 8)}...</td>
            <td class="px-6 py-4 text-sm font-bold text-green-600">$${parseFloat(user.balance).toFixed(2)}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${new Date(user.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="openAddBalanceModal('${user.id}', '${user.username}')" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm mr-4">Add Balance</button>
                <button onclick="viewUserOrders('${user.id}')" class="text-slate-600 hover:text-slate-800 font-medium text-sm">Orders</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function filterUsers(query) {
    const filtered = allUsers.filter(user => 
        (user.username && user.username.toLowerCase().includes(query.toLowerCase())) ||
        user.id.toLowerCase().includes(query.toLowerCase())
    );
    renderUsers(filtered);
}

// Attach to window for onclick attributes
window.openAddBalanceModal = (userId, username) => {
    const amount = prompt(`Enter amount to add to ${username}:`);
    if (amount && !isNaN(amount)) {
        addBalance(userId, parseFloat(amount));
    }
};

async function addBalance(userId, amount) {
    try {
        // 1. Get current balance
        const { data: profile, error: getError } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', userId)
            .single();
        
        if (getError) throw getError;

        const newBalance = parseFloat(profile.balance) + amount;

        // 2. Update balance
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', userId);

        if (updateError) throw updateError;

        // 3. Log transaction
        const { error: transError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                amount: amount,
                type: 'deposit',
                description: 'Admin deposit'
            });

        if (transError) throw transError;

        alert('Balance added successfully!');
        fetchUsers();
    } catch (error) {
        console.error('Error adding balance:', error);
        alert('Failed to add balance: ' + error.message);
    }
}

window.viewUserOrders = async (userId) => {
    // For now, redirect to orders page with filter or show alert
    // Better: redirect to orders.html?userId=...
    window.location.href = `orders.html?userId=${userId}`;
};
