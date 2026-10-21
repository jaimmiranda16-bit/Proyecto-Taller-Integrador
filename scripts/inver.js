// URL base del servidor Node-RED en la red local del taller
const API_URL = "http://10.10.10.3:3000/api";

let chartTemp = null;
let chartHum = null;
let chartSuelo = null;

// Inicializar gráficos de Chart.js
function inicializarGraficos() {
    if (typeof Chart === 'undefined') {
        console.error("Chart.js no se ha cargado correctamente.");
        return;
    }

    const opcionesComunes = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { 
                grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                ticks: { color: '#94a3b8', font: { size: 10 } } 
            },
            y: { 
                grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                ticks: { color: '#94a3b8', font: { size: 10 } } 
            }
        },
        plugins: { legend: { display: false } },
        animation: false
    };

    // 1. Gráfico Temperatura
    const ctxTemp = document.getElementById('grafico-temperatura');
    if (ctxTemp && !chartTemp) {
        chartTemp = new Chart(ctxTemp.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{ data: [], borderColor: '#ff4757', backgroundColor: 'rgba(255, 71, 87, 0.15)', borderWidth: 2, fill: true, tension: 0.3 }]
            },
            options: opcionesComunes
        });
    }

    // 2. Gráfico Humedad Relativa
    const ctxHum = document.getElementById('grafico-humedad');
    if (ctxHum && !chartHum) {
        chartHum = new Chart(ctxHum.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{ data: [], borderColor: '#55ACEE', backgroundColor: 'rgba(85, 172, 238, 0.15)', borderWidth: 2, fill: true, tension: 0.3 }]
            },
            options: opcionesComunes
        });
    }

    // 3. Gráfico Humedad del Suelo
    const ctxSuelo = document.getElementById('grafico-suelo');
    if (ctxSuelo && !chartSuelo) {
        chartSuelo = new Chart(ctxSuelo.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{ data: [], borderColor: '#2ed573', backgroundColor: 'rgba(46, 213, 115, 0.15)', borderWidth: 2, fill: true, tension: 0.3 }]
            },
            options: opcionesComunes
        });
    }
}

// Agregar punto a los gráficos
function agregarDatoGrafico(chart, etiqueta, valor) {
    if (!chart) return;
    if (chart.data.labels.length > 8) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(etiqueta);
    chart.data.datasets[0].data.push(valor);
    chart.update();
}

// Actualizar valores en KPIs y Gráficos
function actualizarUI(temperatura, humedadAmbiente, humedadSuelo) {
    const horaActual = new Date().toLocaleTimeString();

    // KPI Temperatura
    const elTemp = document.getElementById('val-temp');
    if (elTemp) elTemp.innerText = temperatura.toFixed(1);
    
    const footerTemp = document.querySelector('.kpi-card:nth-child(1) .kpi-footer');
    if (footerTemp) {
        if (temperatura >= 18 && temperatura <= 26) {
            footerTemp.className = "kpi-footer verde";
            footerTemp.innerHTML = "✔️ Rango Óptimo (18 - 26°C)";
        } else {
            footerTemp.className = "kpi-footer amarillo";
            footerTemp.innerHTML = "⚠️ Fuera de rango óptimo";
        }
    }
    agregarDatoGrafico(chartTemp, horaActual, temperatura);

    // KPI Humedad Ambiente
    const elHum = document.getElementById('val-hum');
    if (elHum) elHum.innerText = Math.round(humedadAmbiente);
    agregarDatoGrafico(chartHum, horaActual, humedadAmbiente);

    // KPI Humedad del Suelo
    const elSuelo = document.getElementById('val-suelo');
    if (elSuelo) elSuelo.innerText = Math.round(humedadSuelo);
    
    const footerSuelo = document.querySelector('.kpi-card:nth-child(3) .kpi-footer');
    if (footerSuelo) {
        if (humedadSuelo < 50) {
            footerSuelo.className = "kpi-footer amarillo";
            footerSuelo.innerHTML = "⚠️ Ligera resequedad - Riego sugerido";
        } else {
            footerSuelo.className = "kpi-footer verde";
            footerSuelo.innerHTML = "✔️ Humedad de suelo adecuada";
        }
    }
    agregarDatoGrafico(chartSuelo, horaActual, humedadSuelo);
}

// Petición a la API con respaldo de simulación local
function consultarDatosInvernadero() {
    Promise.all([
        fetch(`${API_URL}/temperatura`).then(res => res.json()).catch(() => null),
        fetch(`${API_URL}/humedad_a`).then(res => res.json()).catch(() => null),
        fetch(`${API_URL}/humedad_s`).then(res => res.json()).catch(() => null)
    ])
    .then(([resTemp, resHumA, resHumS]) => {
        if (resTemp && resHumA && resHumS) {
            actualizarUI(resTemp.valor, resHumA.valor, resHumS.valor);
        } else {
            // Modo simulación local para desarrollo en casa
            const tempSim = 20 + Math.random() * 8;
            const humASim = 50 + Math.random() * 15;
            const humSSim = 40 + Math.random() * 20;
            actualizarUI(tempSim, humASim, humSSim);
        }
    });
}

// Inicializar al cargar la página
window.addEventListener('load', () => {
    inicializarGraficos();
    consultarDatosInvernadero();
    setInterval(consultarDatosInvernadero, 2000); // Actualización cada 2 segundos
});