import { supabase } from './supabase-config.js';
import { checkAdmin, logout } from './auth.js';

checkAdmin();

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    fetchOrders(userId);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
});

async function fetchOrders(userId = null) {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center"><div class="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div></td></tr>';

    let query = supabase
        .from('orders')
        .select(`
            *,
            profiles(username),
            services(name)
        `)
        .order('created_at', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
        document.getElementById('pageTitle').textContent = 'User Orders';
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching orders:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-red-500">Failed to load orders.</td></tr>';
        return;
    }

    renderOrders(data);
}

function renderOrders(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-500">No orders found.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition-all';
        
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-700',
            processing: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };

        tr.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-slate-800">#${order.id}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${order.profiles?.username || 'Unknown'}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${order.services?.name || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${order.quantity}</td>
            <td class="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]" title="${order.link}">${order.link}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-slate-100'} uppercase">
                    ${order.status}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <select onchange="updateOrderStatus(${order.id}, this.value)" class="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

window.updateOrderStatus = async (orderId, newStatus) => {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) throw error;
        
        // No alert needed, just visual feedback (re-render or just update the row)
        // For simplicity, re-fetch
        const urlParams = new URLSearchParams(window.location.search);
        fetchOrders(urlParams.get('userId'));
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update status: ' + error.message);
    }
};
