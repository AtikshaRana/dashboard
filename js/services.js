import { supabase } from './supabase-config.js';
import { checkAdmin, logout } from './auth.js';

checkAdmin();

document.addEventListener('DOMContentLoaded', () => {
    fetchServices();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout());

    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceSubmit);
    }
});

let allServices = [];
let editingServiceId = null;

async function fetchServices() {
    const tableBody = document.getElementById('servicesTableBody');
    tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center"><div class="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div></td></tr>';

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching services:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500">Failed to load services.</td></tr>';
        return;
    }

    allServices = data;
    renderServices(data);
}

function renderServices(services) {
    const tableBody = document.getElementById('servicesTableBody');
    tableBody.innerHTML = '';

    services.forEach(service => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition-all';
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-slate-800">${service.name}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${service.category}</td>
            <td class="px-6 py-4 text-sm font-bold text-slate-800">$${service.price}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${service.min_qty} / ${service.max_qty}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="editService(${service.id})" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm mr-4">Edit</button>
                <button onclick="deleteService(${service.id})" class="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

async function handleServiceSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const serviceData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        min_qty: parseInt(formData.get('min_qty')),
        max_qty: parseInt(formData.get('max_qty')),
        description: formData.get('description')
    };

    try {
        if (editingServiceId) {
            const { error } = await supabase
                .from('services')
                .update(serviceData)
                .eq('id', editingServiceId);
            if (error) throw error;
            alert('Service updated successfully!');
        } else {
            const { error } = await supabase
                .from('services')
                .insert(serviceData);
            if (error) throw error;
            alert('Service created successfully!');
        }
        
        closeModal();
        fetchServices();
    } catch (error) {
        console.error('Error saving service:', error);
        alert('Error: ' + error.message);
    }
}

window.editService = (id) => {
    const service = allServices.find(s => s.id === id);
    if (!service) return;

    editingServiceId = id;
    document.getElementById('modalTitle').textContent = 'Edit Service';
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceCategory').value = service.category;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceMin').value = service.min_qty;
    document.getElementById('serviceMax').value = service.max_qty;
    document.getElementById('serviceDesc').value = service.description || '';
    
    document.getElementById('serviceModal').classList.remove('hidden');
    document.getElementById('serviceModal').classList.add('flex');
};

window.deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);
        if (error) throw error;
        alert('Service deleted!');
        fetchServices();
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error deleting: ' + error.message);
    }
};

window.openCreateModal = () => {
    editingServiceId = null;
    document.getElementById('modalTitle').textContent = 'Create New Service';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceModal').classList.remove('hidden');
    document.getElementById('serviceModal').classList.add('flex');
};

window.closeModal = () => {
    document.getElementById('serviceModal').classList.add('hidden');
    document.getElementById('serviceModal').classList.remove('flex');
};
