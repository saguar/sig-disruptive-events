const manualInputBtn = document.getElementById('manualInputBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const manualSection = document.getElementById('manualInput');
const dashboardSection = document.getElementById('dashboard');

manualInputBtn.addEventListener('click', () => {
    const isHidden = manualSection.style.display === 'none';
    manualSection.style.display = isHidden ? 'block' : 'none';
    dashboardSection.style.display = 'none';
});

dashboardBtn.addEventListener('click', () => {
    const isHidden = dashboardSection.style.display === 'none';
    dashboardSection.style.display = isHidden ? 'block' : 'none';
    manualSection.style.display = 'none';
});
