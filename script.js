document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const resultList = document.getElementById('resultList');
    const addedList = document.getElementById('addedList');
    const generateDataButton = document.getElementById('generateData');
    const copyButton = document.getElementById('copyButton');
    const dataModal = document.getElementById('dataModal');
    const closeModal = document.getElementById('closeModal');
    const dataContainer = document.getElementById('dataContainer');

    let materials = [];

    // Função para buscar o arquivo JSON do GitHub
    function fetchMaterials() {
        fetch('https://raw.githubusercontent.com/Dirad-01/Pedidos-estoque/main/materials.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                materials = data;
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    // Inicializa a busca de materiais
    fetchMaterials();

    // Função para normalizar a string removendo acentos e pontuação
    function normalizeString(str) {
        return str
            .normalize('NFD') // Normaliza para decompor os caracteres com acentos
            .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
            .replace(/[^\w\s]/gi, '') // Remove pontuação
            .toLowerCase(); // Transforma em minúsculas
    }

    let debounceTimer;
    searchBar.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = normalizeString(searchBar.value);
        debounceTimer = setTimeout(() => {
            resultList.innerHTML = '';
            if (query.trim() === '') return;

            materials.forEach(material => {
                const normalizedMaterial = normalizeString(material);

                if (normalizedMaterial.includes(query)) {
                    const li = document.createElement('li');
                    li.className = 'result-item';
                    li.innerHTML = `
                        <span class="material-name">${material}</span>
                        <input type="number" min="1" placeholder="Quantidade" class="quantity-input">
                        <button class="add-button">Adicionar</button>
                    `;
                    li.querySelector('.add-button').addEventListener('click', function() {
                        const quantity = li.querySelector('.quantity-input').value;
                        if (quantity && quantity > 0) {
                            const addedItem = document.createElement('li');
                            addedItem.className = 'added-item';
                            addedItem.innerHTML = `
                                ${quantity} ${material}
                                <button class="delete-button">Excluir</button>
                            `;
                            addedItem.querySelector('.delete-button').addEventListener('click', function() {
                                addedItem.remove();
                            });
                            addedList.appendChild(addedItem);
                            li.querySelector('.quantity-input').value = '';
                        } else {
                            alert("Por favor, insira uma quantidade válida.");
                        }
                    });
                    resultList.appendChild(li);
                }
            });
        }, 300); // 300ms de delay para busca
    });

    generateDataButton.addEventListener('click', function() {
        const addedItems = document.querySelectorAll('#addedList .added-item');
        if (addedItems.length === 0) {
            alert("Adicione pelo menos um item para gerar os dados.");
            return;
        }

        let html = '<table><tr><th>Quantidade</th><th>Material</th></tr>';
        addedItems.forEach(item => {
            const textContent = item.textContent.trim();
            const spaceIndex = textContent.indexOf(' ');
            const quantity = textContent.substring(0, spaceIndex);
            const material = textContent.substring(spaceIndex + 1).replace('Excluir', '').trim();

            html += `<tr><td>${quantity}</td><td>${material}</td></tr>`;
        });
        html += '</table>';
        dataContainer.innerHTML = html;
        dataModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        dataModal.style.display = 'none';
    });

    copyButton.addEventListener('click', function() {
        const addedItems = document.querySelectorAll('#addedList .added-item');
        let text = '';
        addedItems.forEach(item => {
            const textContent = item.textContent.trim();
            const spaceIndex = textContent.indexOf(' ');
            const quantity = textContent.substring(0, spaceIndex);
            const material = textContent.substring(spaceIndex + 1).replace('Excluir', '').trim();
            text += `${quantity}\t${material}\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
            alert('Dados copiados com sucesso!');
        }).catch(err => {
            console.error('Erro ao copiar os dados: ', err);
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === dataModal) {
            dataModal.style.display = 'none';
        }
    });
});
