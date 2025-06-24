const manualInputBtn = document.getElementById('manualInputBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const uploadCsvBtn = document.getElementById('uploadCsvBtn');
const csvFileInput = document.getElementById('csvFileInput');
const manualSection = document.getElementById('manualInput');
const dashboardSection = document.getElementById('dashboard');
const csvSection = document.getElementById('csvData');
const csvTable = document.getElementById('csvTable');

manualInputBtn.addEventListener('click', () => {
    const isHidden = manualSection.style.display === 'none';
    manualSection.style.display = isHidden ? 'block' : 'none';
    dashboardSection.style.display = 'none';
});

dashboardBtn.addEventListener('click', () => {
    const isHidden = dashboardSection.style.display === 'none';
    dashboardSection.style.display = isHidden ? 'block' : 'none';
    manualSection.style.display = 'none';
    csvSection.style.display = 'none';
});

uploadCsvBtn.addEventListener('click', () => {
    csvFileInput.click();
});

csvFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                renderCsvTable(results.data);
            }
        });
    }
});

function renderCsvTable(data) {
    csvTable.innerHTML = '';

    const headers = ['Mese', 'Severity 1 case', 'ProM Critical Alert', 'ProM Warning Alert', 'System Outage'];
    const headerRow = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });
    csvTable.appendChild(headerRow);

    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const td = document.createElement('td');
            td.textContent = row[h] || '';
            tr.appendChild(td);
        });
        csvTable.appendChild(tr);
    });

    csvSection.style.display = 'block';
    manualSection.style.display = 'none';
    dashboardSection.style.display = 'none';
}
