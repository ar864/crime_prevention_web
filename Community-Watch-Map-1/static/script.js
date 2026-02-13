function initMap() {
    // Initialize map centered on a default location (e.g., New York or user's location)
    const map = L.map('map').setView([40.7128, -74.0060], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Try to center on user's location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            map.setView([position.coords.latitude, position.coords.longitude], 13);
        });
    }

    // Fetch reports and plot markers
    fetch('/api/reports')
        .then(response => response.json())
        .then(reports => {
            plotReports(map, reports);
        })
        .catch(error => console.error('Error fetching reports:', error));
}

function plotReports(map, reports) {
    // Simple clustering logic
    // Group reports by proximity (rounding coordinates to 3 decimal places, approx 110m)
    const clusters = {};

    reports.forEach(report => {
        const key = `${report.latitude.toFixed(3)},${report.longitude.toFixed(3)}`;
        if (!clusters[key]) {
            clusters[key] = {
                lat: report.latitude,
                lng: report.longitude,
                count: 0,
                reports: []
            };
        }
        clusters[key].count++;
        clusters[key].reports.push(report);
    });

    // Plot circles based on count
    Object.values(clusters).forEach(cluster => {
        let color = '#2a9d8f'; // Green (1 report)
        let radius = 100;

        if (cluster.count >= 3) {
            color = '#e76f51'; // Red (3+ reports)
            radius = 200;
        } else if (cluster.count === 2) {
            color = '#e9c46a'; // Yellow (2 reports)
            radius = 150;
        }

        const circle = L.circle([cluster.lat, cluster.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
            radius: radius
        }).addTo(map);

        // Popup content
        let popupContent = `<strong>${cluster.count} Report(s) here</strong><br>`;
        cluster.reports.forEach(r => {
            popupContent += `<small>${r.timestamp}: ${r.description}</small><br>`;
        });

        circle.bindPopup(popupContent);
    });
}
