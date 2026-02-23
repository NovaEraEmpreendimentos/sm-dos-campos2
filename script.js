const taxas = {
    1: 7.00, 2: 8.00, 3: 9.00, 4: 10.00, 5: 10.30, 6: 10.90,
    7: 11.00, 8: 12.00, 9: 12.30, 10: 14.00, 11: 16.00, 12: 17.00,
    13: 18.00, 14: 19.00, 15: 20.00, 16: 20.30, 17: 20.90, 18: 21.00,
    19: 23.00, 20: 24.00, 21: 25.00
};

const loanAmountInput = document.getElementById('loanAmount');
const installmentsSelect = document.getElementById('installments');
const generatePrintBtn = document.getElementById('generatePrint');
const tableBody = document.getElementById('tableBody');
const printModal = document.getElementById('printModal');
const printContent = document.getElementById('printContent');
const downloadPrintBtn = document.getElementById('downloadPrint');

let currentSimulation = null;

document.addEventListener('DOMContentLoaded', () => {
    initInstallments();
    updateTable();
    setupEventListeners();
});

function initInstallments() {
    installmentsSelect.innerHTML = '';
    Object.keys(taxas).forEach(num => {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = `${num}x`;
        installmentsSelect.appendChild(option);
    });
}

function setupEventListeners() {
    loanAmountInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') { e.target.value = ''; updateTable(); return; }
        value = (value / 100).toFixed(2);
        e.target.value = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value);
        updateTable();
    });

    generatePrintBtn.addEventListener('click', showPrintModal);
    document.querySelector('.close').onclick = () => printModal.style.display = 'none';
    document.getElementById('closePrint').onclick = () => printModal.style.display = 'none';
    downloadPrintBtn.addEventListener('click', generatePDF);
}

function getRawValue(value) {
    return value ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : 0;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function updateTable() {
    const amount = getRawValue(loanAmountInput.value) || 0;
    tableBody.innerHTML = '';
    Object.keys(taxas).forEach(num => {
        const rate = taxas[num];
        const valorCobrar = amount / (1 - (rate / 100));
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${num}x</td><td>${rate.toFixed(2)}%</td>
            <td>${formatCurrency(amount)}</td><td>${formatCurrency(amount/num)}</td>
            <td class="highlight">${formatCurrency(valorCobrar)}</td>
            <td class="highlight">${formatCurrency(valorCobrar/num)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function showPrintModal() {
    const amount = getRawValue(loanAmountInput.value);
    if (!amount || amount <= 0) { alert('Por favor, insira um valor.'); return; }

    const num = installmentsSelect.value;
    const rate = taxas[num];
    const valorCobrar = amount / (1 - (rate / 100));
    const parcela = valorCobrar / num;

    currentSimulation = { amount, num, valorCobrar, parcela, date: new Date().toLocaleDateString('pt-BR') };

    // Comprovante com texto em PRETO e NEGRITO
    printContent.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; font-weight: bold; color: #000;">
            <div style="font-size: 24px;">Gilliard Cred</div>
            <div style="font-size: 14px;">( serviços e soluções financeiras )</div>
        </div>
        <div style="padding: 20px 0; font-weight: bold; line-height: 1.8; color: #000;">
            <p>DATA: ${currentSimulation.date}</p>
            <p>VALOR SOLICITADO: ${formatCurrency(amount)}</p>
            <p>PLANO: ${num} PARCELAS</p>
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #000;">
                <p>VALOR DA PARCELA: ${formatCurrency(parcela)}</p>
                <p>VALOR TOTAL A PAGAR: ${formatCurrency(valorCobrar)}</p>
            </div>
        </div>
        <div style="text-align: center; margin-top: 10px; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; font-weight: bold; color: #000;">
            <p>INSTAGRAM: @GILLIARDFINANCEIRA</p>
            <p>TELEFONE: (82) 9 9330-1661</p>
            <p>R. DR. RÔMULO DE ALMEIDA 02, PRÓX AOS CORREIOS</p>
            <p>SÃO MIGUEL DOS CAMPOS</p>
        </div>
    `;
    printModal.style.display = 'block';
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0); // Texto Preto no PDF
    doc.text("Gilliard Cred", 105, 30, { align: "center" });
    doc.setFontSize(12);
    doc.text("( serviços e soluções financeiras )", 105, 38, { align: "center" });
    doc.line(20, 45, 190, 45);
    doc.text(`VALOR SOLICITADO: ${formatCurrency(currentSimulation.amount)}`, 20, 60);
    doc.text(`PLANO: ${currentSimulation.num} PARCELAS`, 20, 70);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 80, 170, 25, 'F');
    doc.text(`VALOR DA PARCELA: ${formatCurrency(currentSimulation.parcela)}`, 105, 90, { align: "center" });
    doc.text(`TOTAL A PAGAR: ${formatCurrency(currentSimulation.valorCobrar)}`, 105, 100, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("INSTAGRAM: @GILLIARDFINANCEIRA | WHATSAPP: (82) 9 9330-1661", 105, 130, { align: "center" });
    doc.text("R. DR. RÔMULO DE ALMEIDA 02, SÃO MIGUEL DOS CAMPOS", 105, 136, { align: "center" });
    
    doc.save(`Simulacao_GilliardCred.pdf`);
}
