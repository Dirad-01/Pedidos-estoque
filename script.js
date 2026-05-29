document.addEventListener('DOMContentLoaded', () => {

    const searchBar = document.getElementById('searchBar');

    const resultList = document.getElementById('resultList');

    const addedList = document.getElementById('addedList');

    const generateDataButton =
        document.getElementById('generateData');

    const copyButton =
        document.getElementById('copyButton');

    const dataModal =
        document.getElementById('dataModal');

    const closeModal =
        document.getElementById('closeModal');

    const dataContainer =
        document.getElementById('dataContainer');

    const itemCounter =
        document.getElementById('itemCounter');

    const resultsCount =
        document.getElementById('resultsCount');

    const clearListButton =
        document.getElementById('clearList');

    const loading =
        document.getElementById('loading');

    const lastGenerated =
        document.getElementById('lastGenerated');

    const toastContainer =
        document.getElementById('toastContainer');

    const scrollTopBtn =
        document.getElementById('scrollTopBtn');

    let materials = [];

    let addedMaterials = [];

    /* TOAST */

    function showToast(message) {

        const toast =
            document.createElement('div');

        toast.className = 'toast';

        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {

            toast.remove();

        }, 3000);
    }

    /* FETCH */

    async function fetchMaterials() {

        try {

            const response = await fetch(
                'https://raw.githubusercontent.com/Dirad-01/Pedidos-estoque/main/materials.json'
            );

            materials = await response.json();

            loading.style.display = 'none';

        } catch (error) {

            loading.innerHTML =
                'Erro ao carregar materiais.';
        }
    }

    fetchMaterials();

    /* NORMALIZE */

    function normalizeString(str) {

        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/gi, '')
            .toLowerCase();
    }

    /* SAVE */

    function saveLocal() {

        localStorage.setItem(
            'materials',
            JSON.stringify(addedMaterials)
        );
    }

    /* LOAD */

    function loadLocal() {

        const saved =
            localStorage.getItem('materials');

        if (saved) {

            addedMaterials = JSON.parse(saved);

            renderAddedItems();
        }
    }

    /* COUNTER */

    function updateCounter() {

        itemCounter.textContent =
            addedMaterials.length;
    }

    /* RENDER */

    function renderAddedItems() {

        addedList.innerHTML = '';

        addedMaterials.forEach(item => {

            const li =
                document.createElement('li');

            li.className = 'added-item';

            li.innerHTML = `
                <span>
                    <strong>${item.quantity}x</strong>
                    ${item.material}
                </span>

                <button class="delete-button">
                    Excluir
                </button>
            `;

            li.querySelector('.delete-button')
                .addEventListener('click', () => {

                    addedMaterials =
                        addedMaterials.filter(
                            i => i.material !== item.material
                        );

                    renderAddedItems();

                    saveLocal();

                    updateCounter();

                    showToast('Item removido');
                });

            addedList.appendChild(li);
        });

        updateCounter();
    }

    loadLocal();

    /* SEARCH */

    let debounceTimer;

    searchBar.addEventListener('input', () => {

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {

            const query =
                normalizeString(searchBar.value);

            resultList.innerHTML = '';

            if (!query.trim()) {

                resultsCount.textContent =
                    '0 resultados';

                return;
            }

            const filtered =
                materials.filter(material =>
                    normalizeString(material)
                    .includes(query)
                );

            resultsCount.textContent =
                `${filtered.length} resultados`;

            if (!filtered.length) {

                resultList.innerHTML = `
                    <li class="result-item">
                        Nenhum material encontrado.
                    </li>
                `;

                return;
            }

            filtered.slice(0, 15).forEach(material => {

                const li =
                    document.createElement('li');

                li.className = 'result-item';

                li.innerHTML = `
                    <span class="material-name">
                        ${material}
                    </span>

                    <input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        class="quantity-input"
                    >

                    <button class="add-button">
                        Adicionar
                    </button>
                `;

                const input =
                    li.querySelector('.quantity-input');

                const addButton =
                    li.querySelector('.add-button');

                function addMaterial() {

                    const quantity =
                        parseInt(input.value);

                    if (!quantity || quantity <= 0) {

                        showToast(
                            'Digite uma quantidade válida.'
                        );

                        return;
                    }

                    const existing =
                        addedMaterials.find(
                            item => item.material === material
                        );

                    if (existing) {

                        existing.quantity += quantity;

                    } else {

                        addedMaterials.push({
                            material,
                            quantity
                        });
                    }

                    renderAddedItems();

                    saveLocal();

                    updateCounter();

                    input.value = '';

                    showToast('Material adicionado');
                }

                addButton.addEventListener(
                    'click',
                    addMaterial
                );

                input.addEventListener(
                    'keydown',
                    e => {

                        if (e.key === 'Enter') {

                            addMaterial();
                        }
                    }
                );

                resultList.appendChild(li);
            });

        }, 250);
    });

    /* CLEAR */

    clearListButton.addEventListener('click', () => {

        addedMaterials = [];

        renderAddedItems();

        saveLocal();

        showToast('Lista limpa');
    });

    /* GENERATE */

    generateDataButton.addEventListener('click', () => {

        if (!addedMaterials.length) {

            showToast(
                'Adicione pelo menos um item.'
            );

            return;
        }

        let html = `
            <table>
                <tr>
                    <th>Quantidade</th>
                    <th>Material</th>
                </tr>
        `;

        addedMaterials.forEach(item => {

            html += `
                <tr>
                    <td>${item.quantity}</td>
                    <td>${item.material}</td>
                </tr>
            `;
        });

        html += '</table>';

        dataContainer.innerHTML = html;

        dataModal.style.display = 'flex';

        /* BLOQUEIA O SCROLL DO FUNDO */

        document.body.style.overflow = 'hidden';

        const now = new Date();

        lastGenerated.textContent =
            now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
    });

    /* COPY */

    copyButton.addEventListener('click', async () => {

        let text = '';

        addedMaterials.forEach(item => {

            text += `${item.quantity}\t${item.material}\n`;
        });

        await navigator.clipboard.writeText(text);

        showToast('Dados copiados');
    });

    /* FECHAR MODAL */

    function closeModalFunction() {

        dataModal.style.display = 'none';

        /* LIBERA O SCROLL DO FUNDO */

        document.body.style.overflow = 'auto';
    }

    closeModal.addEventListener('click', () => {

        closeModalFunction();
    });

    window.addEventListener('click', e => {

        if (e.target === dataModal) {

            closeModalFunction();
        }
    });

    /* ESC FECHA MODAL */

    document.addEventListener('keydown', e => {

        if (e.key === 'Escape' &&
            dataModal.style.display === 'flex') {

            closeModalFunction();
        }
    });

    /* SCROLL */

    window.addEventListener('scroll', () => {

        scrollTopBtn.style.display =
            window.scrollY > 200
                ? 'block'
                : 'none';
    });

    scrollTopBtn.addEventListener('click', () => {

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
