const taxas = {
    1: 10.50, 2: 11.16, 3: 11.63, 4: 12.19, 5: 12.75, 6: 13.22,
    7: 13.97, 8: 14.44, 9: 14.72, 10: 15.25, 11: 16.03, 12: 16.58,
    13: 19.40, 14: 19.87, 15: 20.34, 16: 20.81, 17: 21.28, 18: 21.75,
    19: 23.00, 20: 24.00, 21: 25.00
};

const loanAmountInput = document.getElementById('loanAmount');
const installmentsSelect = document.getElementById('installments');
const generatePrintBtn = document.getElementById('generatePrint');
const tableBody = document.getElementById('tableBody');
const printModal = document.getElementById('printModal');
const printContent = document.getElementById('printContent');
const downloadPrintBtn = document.getElementById('downloadPrint');
const closePrintBtn = document.getElementById('closePrint');
const closeModalSpan = document.querySelector('.close');

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
    loanAmountInput.addEventListener('input', updateTable);
    installmentsSelect.addEventListener('change', updateTable);
    generatePrintBtn.addEventListener('click', showPrintModal);
    downloadPrintBtn.addEventListener('click', generatePDF);
    [closePrintBtn, closeModalSpan].forEach(btn => {
        btn.addEventListener('click', () => printModal.style.display = 'none');
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function updateTable() {
    const amount = parseFloat(loanAmountInput.value) || 0;
    tableBody.innerHTML = '';
    Object.keys(taxas).forEach(i => {
        const taxa = taxas[i];
        const valorReceber = amount * (1 - taxa / 100);
        const valorCobrar = amount / (1 - taxa / 100);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}x</td>
            <td>${taxa.toFixed(2)}%</td>
            <td class="highlight">${formatCurrency(valorReceber)}</td>
            <td>${formatCurrency(amount / i)}</td>
            <td class="highlight">${formatCurrency(valorCobrar)}</td>
            <td>${formatCurrency(valorCobrar / i)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function showPrintModal() {
    const amount = parseFloat(loanAmountInput.value) || 0;
    const num = parseInt(installmentsSelect.value);
    const taxa = taxas[num];
    const valorReceber = amount * (1 - taxa / 100);
    const valorCobrar = amount / (1 - taxa / 100);

    printContent.innerHTML = `
        <div id="pdf-area" style="padding: 20px; border: 2px solid #ff0000; border-radius: 10px; background: #fff; color: #000;">
            <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="margin: 0; color: #ff0000;">Gilliard Cred</h2>
                <p style="font-size: 12px;">( serviços e soluções financeiras )</p>
            </div>
            
            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; margin-bottom: 10px; background: #fff5f5;">
                <p style="font-size: 12px; font-weight: bold; color: #ff0000;">OPÇÃO: SE VOCÊ PASSAR O VALOR</p>
                <p style="margin: 5px 0;">Valor na Máquina: <strong>${formatCurrency(amount)}</strong></p>
                <p style="margin: 5px 0;">Você Recebe: <strong style="color: #059669;">${formatCurrency(valorReceber)}</strong></p>
                <p style="margin: 5px 0;">Parcelas: ${num}x de ${formatCurrency(amount/num)}</p>
            </div>

            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; margin-bottom: 15px; background: #fff5f5;">
                <p style="font-size: 12px; font-weight: bold; color: #ff0000;">OPÇÃO: SE VOCÊ QUER RECEBER LÍQUIDO</p>
                <p style="margin: 5px 0;">Valor Desejado: <strong>${formatCurrency(amount)}</strong></p>
                <p style="margin: 5px 0;">Passar na Máquina: <strong style="color: #ff0000;">${formatCurrency(valorCobrar)}</strong></p>
                <p style="margin: 5px 0;">Parcelas: ${num}x de ${formatCurrency(valorCobrar/num)}</p>
            </div>

            <div style="text-align: center; border-top: 1px solid #eee; padding-top: 10px; font-size: 11px; line-height: 1.5;">
                <p><strong>Telefone:</strong> (82) 9 9330-1661</p>
                <p><strong>Instagram:</strong> gilliardfinanceira</p>
                <p><strong>Endereço:</strong> R. Dr. Rômulo de almeida 02, Próx aos Correios</p>
                <p>São Miguel dos Campos - AL</p>
            </div>
        </div>
    `;
    printModal.style.display = 'block';
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const area = document.getElementById('pdf-area');
    
    const canvas = await html2canvas(area, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const imgWidth = width - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('Simulacao_GilliardCred.pdf');
}
