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
    manualSection.style.display = 'none';
    csvSection.style.display = 'none';
    if (isHidden) {
        const sampleData = [10, 8, 12, 9, 11, 7, 6, 5, 9, 10, 8, 7];
        drawCharts(sampleData);
    } else {
        dashboardSection.style.display = 'none';
    }
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

function drawCharts(monthlyTotals, workingDays = 252) {
    const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: months.slice(0, monthlyTotals.length),
            datasets: [{
                label: 'Totale ponderato',
                data: monthlyTotals,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const totalEvents = monthlyTotals.reduce((sum, v) => sum + v, 0);
    const disruptiveDays = Math.min(totalEvents, workingDays);
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Giorni con eventi disruptive', 'Giorni senza eventi'],
            datasets: [{
                data: [disruptiveDays, workingDays - disruptiveDays],
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(201, 203, 207, 0.6)']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    manualSection.style.display = 'none';
    csvSection.style.display = 'none';
    dashboardSection.style.display = 'block';
}

window.drawCharts = drawCharts;
