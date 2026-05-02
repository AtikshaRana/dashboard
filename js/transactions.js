import { supabase } from './supabase-config.js';
import { checkAdmin, logout } from './auth.js';

checkAdmin();

document.addEventListener('DOMContentLoaded', () => {
    fetchTransactions();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
});

async function fetchTransactions() {
    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center"><div class="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div></td></tr>';

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            profiles(username)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500">Failed to load transactions.</td></tr>';
        return;
    }

    renderTransactions(data);
}

function renderTransactions(transactions) {
    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.innerHTML = '';

    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-500">No transactions found.</td></tr>';
        return;
    }

    transactions.forEach(tx => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition-all';
        
        const typeColors = {
            deposit: 'text-green-600',
            withdrawal: 'text-red-600',
            refund: 'text-blue-600'
        };

        tr.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-slate-800">#${tx.id}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${tx.profiles?.username || 'Unknown'}</td>
            <td class="px-6 py-4 text-sm font-bold ${typeColors[tx.type] || 'text-slate-800'}">
                ${tx.type === 'deposit' ? '+' : '-'}$${parseFloat(tx.amount).toFixed(2)}
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">${tx.description || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${new Date(tx.created_at).toLocaleString()}</td>
        `;
        tableBody.appendChild(tr);
    });
}
