const API_BASE = '/api/municipios';
let currentPage = 1;
let currentSearchType = 'todos';

const elements = {
    apiKey: document.getElementById('apiKey'),
    searchType: document.getElementById('searchType'),
    searchInput: document.getElementById('searchInput'),
    btnSearch: document.getElementById('btnSearch'),
    resultsGrid: document.getElementById('resultsGrid'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    pageInfo: document.getElementById('pageInfo')
};

// Event Listeners
elements.searchType.addEventListener('change', (e) => {
    currentSearchType = e.target.value;
    elements.searchInput.disabled = currentSearchType === 'todos';
    elements.searchInput.value = '';
    if (currentSearchType === 'todos') {
        currentPage = 1;
        loadData();
    }
});

elements.btnSearch.addEventListener('click', () => {
    currentPage = 1;
    loadData();
});

elements.prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadData();
    }
});

elements.nextPage.addEventListener('click', () => {
    currentPage++;
    loadData();
});

// Main function to load data
async function loadData() {
    showLoading(true);
    showError(null);
    elements.resultsGrid.innerHTML = '';

    const apiKey = elements.apiKey.value;
    if (!apiKey) {
        showError('Por favor, insira a API Key.');
        showLoading(false);
        return;
    }

    try {
        let url = API_BASE;
        const searchTerm = elements.searchInput.value.trim();

        // Construct URL based on search type
        if (currentSearchType === 'todos') {
            url += `?page=${currentPage}&limit=12`;
        } else if (searchTerm) {
            if (currentSearchType === 'nome') {
                url += `/nome/${encodeURIComponent(searchTerm)}`;
            } else if (currentSearchType === 'codigo') {
                url += `/codigo/${encodeURIComponent(searchTerm)}`;
            } else if (currentSearchType === 'distrito') {
                url += `/distrito/${encodeURIComponent(searchTerm)}`;
            }
        } else {
            // If search type is selected but input is empty, default to all
            url += `?page=${currentPage}&limit=12`;
        }

        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            }
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error('Nenhum município encontrado.');
            if (response.status === 401) throw new Error('API Key inválida.');
            throw new Error('Erro ao buscar dados.');
        }

        const data = await response.json();
        renderData(data);

    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

function renderData(data) {
    let items = [];
    
    // Handle different response structures
    if (data.data && Array.isArray(data.data)) {
        // Paginated response
        items = data.data;
        updatePagination(data.page, data.totalPages);
    } else if (Array.isArray(data)) {
        // Array response (distrito)
        items = data;
        updatePagination(1, 1); // No pagination for filtered lists usually
    } else {
        // Single object response
        items = [data];
        updatePagination(1, 1);
    }

    if (items.length === 0) {
        showError('Nenhum resultado encontrado.');
        return;
    }

    elements.resultsGrid.innerHTML = items.map(municipio => `
        <div class="card">
            <span class="badge">${municipio.distrito}</span>
            <h2>${municipio.nome}</h2>
            <div class="card-info">
                <p><strong>Código:</strong> ${municipio.codigo}</p>
                <p><strong>População (2025):</strong> ${municipio.populacao2025?.toLocaleString() || 'N/A'}</p>
                <p><strong>Densidade:</strong> ${municipio.densidade?.toFixed(1) || 'N/A'} hab/km²</p>
                <p><strong>Coordenadas:</strong> ${municipio.coordenadas?.latitude}, ${municipio.coordenadas?.longitude}</p>
            </div>
        </div>
    `).join('');
}

function updatePagination(page, totalPages) {
    if (!totalPages) {
        elements.prevPage.disabled = true;
        elements.nextPage.disabled = true;
        elements.pageInfo.textContent = '';
        return;
    }
    
    currentPage = page;
    elements.pageInfo.textContent = `Página ${page} de ${totalPages}`;
    elements.prevPage.disabled = page <= 1;
    elements.nextPage.disabled = page >= totalPages;
}

function showLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
}

function showError(message) {
    if (message) {
        elements.error.textContent = message;
        elements.error.classList.remove('hidden');
    } else {
        elements.error.classList.add('hidden');
    }
}

// Initial load
loadData();
