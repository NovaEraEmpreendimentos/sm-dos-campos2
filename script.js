// Tabelas de taxas
const taxasMasterVisa = {
    1: 5.50, 2: 6.30, 3: 7.05, 4: 7.64, 5: 8.23, 6: 8.81,
    7: 9.62, 8: 10.21, 9: 10.69, 10: 11.40, 11: 11.97, 12: 12.55,
    13: 14.34, 14: 14.93, 15: 15.51, 16: 16.09, 17: 16.66, 18: 17.60
};

const taxasOutros = {
    1: 6.30, 2: 6.45, 3: 7.20, 4: 8.00, 5: 8.80, 6: 9.50,
    7: 10.00, 8: 10.80, 9: 11.50, 10: 12.30, 11: 12.96, 12: 13.00,
    13: 15.00, 14: 15.65, 15: 16.25, 16: 16.90, 17: 17.50, 18: 18.30
};

// Elementos DOM
const loanAmountInput = document.getElementById('loanAmount');
const installmentsSelect = document.getElementById('installments');
const generatePrintBtn = document.getElementById('generatePrint');
const tableBody = document.getElementById('tableBody');
const printModal = document.getElementById('printModal');
const printContent = document.getElementById('printContent');
const downloadPrintBtn = document.getElementById('downloadPrint');
const closePrintBtn = document.getElementById('closePrint');
const closeModal = document.querySelector('.close');

// Variáveis globais
let currentSimulation = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    updateTable();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    loanAmountInput.addEventListener('input', updateTable);
    installmentsSelect.addEventListener('change', updateTable);
    const cardBrandSelect = document.getElementById('cardBrand');
    if (cardBrandSelect) {
        cardBrandSelect.addEventListener('change', updateTable);
    }

    generatePrintBtn.addEventListener('click', generatePrint);
    downloadPrintBtn.addEventListener('click', downloadPrint);
    closePrintBtn.addEventListener('click', closePrintModal);
    closeModal.addEventListener('click', closePrintModal);

    // Fechar modal clicando fora
    window.addEventListener('click', function (event) {
        if (event.target === printModal) {
            closePrintModal();
        }
    });
}

// Calcular valores
function calculateValues(loanAmount, parcelas, taxa) {
    // Valor a Receber = Valor do empréstimo - taxa
    const valorReceber = loanAmount - (loanAmount * taxa / 100);

    // Parcela a Receber = Valor do empréstimo / parcelas
    const parcelaReceber = loanAmount / parcelas;

    // Valor a Cobrar = Valor que o cliente precisa pagar para receber o valor desejado
    const valorCobrar = loanAmount / (1 - taxa / 100);

    // Parcela a Cobrar = Valor a Cobrar / parcelas
    const parcelaCobrar = valorCobrar / parcelas;

    return {
        valorReceber: valorReceber,
        parcelaReceber: parcelaReceber,
        valorCobrar: valorCobrar,
        parcelaCobrar: parcelaCobrar
    };
}

// Formatar valor em Real
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Formatar porcentagem
function formatPercentage(value) {
    return value.toFixed(2) + '%';
}

// Atualizar tabela
function updateTable() {
    const loanAmount = parseFloat(loanAmountInput.value) || 0;
    const selectedInstallments = installmentsSelect.value;

    // Detectar taxa baseada na bandeira
    const cardBrand = document.getElementById('cardBrand') ? document.getElementById('cardBrand').value : 'master_visa';
    const taxas = cardBrand === 'master_visa' ? taxasMasterVisa : taxasOutros;

    tableBody.innerHTML = '';

    for (let parcelas = 1; parcelas <= 18; parcelas++) {
        const taxa = taxas[parcelas];
        const row = document.createElement('tr');

        // Destacar linha selecionada
        if (selectedInstallments && parseInt(selectedInstallments) === parcelas) {
            row.classList.add('selected-row');
            // Mantive a cor de seleção um pouco amarelada/dourada para contrastar com a tabela vermelha
            row.style.background = 'rgba(245, 158, 11, 0.3)';
            row.style.border = '1px solid rgba(245, 158, 11, 0.6)';
        }

        if (loanAmount > 0) {
            const valores = calculateValues(loanAmount, parcelas, taxa);

            row.innerHTML = `
                <td><strong>${parcelas}x</strong></td>
                <td class="highlight-rate">${formatPercentage(taxa)}</td>
                <td class="highlight-value">${formatCurrency(valores.valorCobrar)}</td>
                <td>${formatCurrency(valores.parcelaCobrar)}</td>
            `;
        } else {
            row.innerHTML = `
                <td><strong>${parcelas}x</strong></td>
                <td class="highlight-rate">${formatPercentage(taxa)}</td>
                <td>-</td>
                <td>-</td>
            `;
        }

        tableBody.appendChild(row);
    }
}

// Gerar print
function generatePrint() {
    const loanAmount = parseFloat(loanAmountInput.value);
    const installments = installmentsSelect.value;

    if (!loanAmount || !installments) {
        alert('Por favor, preencha o valor do empréstimo e selecione o número de parcelas.');
        return;
    }

    // Detectar taxa baseada na bandeira
    const cardBrand = document.getElementById('cardBrand').value;
    const taxas = cardBrand === 'master_visa' ? taxasMasterVisa : taxasOutros;

    const taxa = taxas[parseInt(installments)];
    const valores = calculateValues(loanAmount, parseInt(installments), taxa);

    const cardBrandText = cardBrand === 'master_visa' ? 'Master/Visa' : 'Outros';

    currentSimulation = {
        loanAmount,
        installments: parseInt(installments),
        taxa,
        valores,
        cardBrandText
    };

    generatePrintContent();
    printModal.style.display = 'block';
}

// Gerar conteúdo do print
function generatePrintContent() {
    const sim = currentSimulation;

    printContent.innerHTML = `
        <div class="print-header">
            <div class="print-title">Gilliard Cred</div>
            <div class="print-subtitle" style="margin-top: 5px; font-weight: 500;">( serviços e soluções financeiras )</div>
            <div class="print-subtitle" style="margin-top: 5px; font-size: 0.9rem;">Cartão: ${sim.cardBrandText}</div>
        </div>
        
        <div class="print-section-title">
            <h2>Simulador</h2>
        </div>
        
        <div class="print-section print-highlight">
            <h3>Se você quer receber ${formatCurrency(sim.loanAmount)}</h3>
            <div class="print-info">
                <div class="print-item">
                    <span class="print-label">Você passa:</span>
                    <span class="print-value">${formatCurrency(sim.valores.valorCobrar)}</span>
                </div>
                <div class="print-item">
                    <span class="print-label">Parcela a Pagar:</span>
                    <span class="print-value">${sim.installments}x ${formatCurrency(sim.valores.parcelaCobrar)}</span>
                </div>
            </div>
        </div>

        <div class="print-contact">
            <p><strong>Telefone:</strong> (82) 9 9330-1661 | <strong>Instagram:</strong> @gilliardfinanceira</p>
            <p>Endereço: R. Dr. Rômulo de almeida 02, Próx aos Correios<br>São Miguel dos Campos - AL</p>
        </div>
    `;
}

// Download do print
function downloadPrint() {
    const printElement = printContent;

    html2canvas(printElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: printElement.scrollWidth,
        height: printElement.scrollHeight
    }).then(canvas => {
        // Converter para JPG
        const link = document.createElement('a');
        link.download = `simulacao-emprestimo-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    }).catch(error => {
        console.error('Erro ao gerar imagem:', error);
        alert('Erro ao gerar a imagem. Tente novamente.');
    });
}

// Fechar modal
function closePrintModal() {
    printModal.style.display = 'none';
}

// Adicionar animações e efeitos
document.addEventListener('DOMContentLoaded', function () {
    // Animação de entrada dos cards
    const cards = document.querySelectorAll('.simulator-card, .table-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Efeito de digitação no título
    const title = document.querySelector('.header h1');
    if (title) {
        const text = title.textContent;
        title.textContent = '';
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        setTimeout(typeWriter, 500);
    }
});

// Validação de entrada
loanAmountInput.addEventListener('input', function () {
    let value = this.value.replace(/[^\d.,]/g, '');
    value = value.replace(',', '.');
    this.value = value;
});

// Adicionar tooltips informativos
function addTooltips() {
    const tooltips = {
        'loanAmount': 'Digite o valor que você deseja emprestar ou receber',
        'loanType': 'Selecione a faixa de valor para aplicar as taxas corretas',
        'installments': 'Escolha em quantas parcelas deseja dividir o pagamento'
    };

    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[id];
        }
    });
}

// Inicializar tooltips
document.addEventListener('DOMContentLoaded', addTooltips);