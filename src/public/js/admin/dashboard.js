document.addEventListener('DOMContentLoaded', () => {
    const dataBridge = document.getElementById('dashboardData');
    if (!dataBridge) return;

    const majorLabels = JSON.parse(dataBridge.dataset.majorLabels);
    const majorValues = JSON.parse(dataBridge.dataset.majorValues);

    // Hàm tính toán phần trăm dựa trên giá trị cao nhất (Max = 100%)
    const getPercentData = (values) => {
        const max = Math.max(...values, 1); // Tránh chia cho 0
        return values.map(v => parseFloat(((v / max) * 100).toFixed(1)));
    };

    // 1. Sinh viên theo Chuyên ngành (Bar Chart)
    const majorCtx = document.getElementById('majorChart').getContext('2d');
    const majorPercents = getPercentData(majorValues);

    new Chart(majorCtx, {
        type: 'bar',
        data: {
            labels: majorLabels,
            datasets: [{
                label: 'Tỷ lệ so với chuyên ngành cao nhất (%)',
                data: majorPercents,
                absoluteData: majorValues, // Lưu trữ số thực để hiện tooltip
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderRadius: 12,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (item) => {
                            const val = item.dataset.absoluteData[item.dataIndex];
                            return ` Số lượng: ${val} SV (${item.raw}%)`;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100, // Cố định mốc 100
                    ticks: { callback: v => v + '%' },
                    grid: { color: '#f1f5f9' } 
                },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Phổ điểm Đồ án (Bar Chart)
    const scoreDataRaw = JSON.parse(dataBridge.dataset.scoreDist);
    const scoreLabels = ['0-4', '4-6', '6-8', '8-10'];
    const scoreValues = scoreLabels.map(l => scoreDataRaw[l]);
    const scorePercents = getPercentData(scoreValues);
    const scoreCtx = document.getElementById('scoreChart').getContext('2d');

    new Chart(scoreCtx, {
        type: 'bar',
        data: {
            labels: scoreLabels,
            datasets: [{
                label: 'Tỷ lệ (%)',
                data: scorePercents,
                absoluteData: scoreValues,
                backgroundColor: 'rgba(244, 63, 94, 0.8)',
                borderRadius: 12,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (item) => ` Số lượng: ${item.dataset.absoluteData[item.dataIndex]} đồ án (${item.raw}%)`
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 3. Top Giảng viên Hướng dẫn (Horizontal Bar Chart)
    const advisorLabels = JSON.parse(dataBridge.dataset.advisorLabels);
    const advisorValues = JSON.parse(dataBridge.dataset.advisorValues);
    const advisorPercents = getPercentData(advisorValues);
    const advisorCtx = document.getElementById('advisorChart').getContext('2d');

    new Chart(advisorCtx, {
        type: 'bar',
        data: {
            labels: advisorLabels,
            datasets: [{
                label: 'Tỷ lệ công việc (%)',
                data: advisorPercents,
                absoluteData: advisorValues,
                backgroundColor: 'rgba(251, 191, 36, 0.8)',
                borderRadius: 12,
                barThickness: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (item) => ` Đang hướng dẫn: ${item.dataset.absoluteData[item.dataIndex]} đồ án (${item.raw}%)`
                    }
                }
            },
            scales: {
                x: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } },
                y: { grid: { display: false } }
            }
        }
    });
});
