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

// Evaluar y actualizar el estado de alerta personalizado de la planta
function evaluarEstadoPlanta(tempActual) {
    const nombre = document.getElementById('nombre-planta').value || "Planta";
    const tempOptima = parseFloat(document.getElementById('temp-optima').value) || 22;
    const tolAtencion = parseFloat(document.getElementById('tolerancia-alerta').value) || 3;
    const tolCritica = parseFloat(document.getElementById('tolerancia-critica').value) || 6;

    const displayNombre = document.getElementById('display-nombre-planta');
    const badgeEstado = document.getElementById('badge-estado');
    const mensajeEstado = document.getElementById('mensaje-estado');
    const tarjeta = document.getElementById('tarjeta-estado-planta');
    const elTempActual = document.getElementById('planta-temp-actual');
    const elRangoOptimo = document.getElementById('planta-rango-optimo');

    displayNombre.innerText = nombre;
    elTempActual.innerText = `${tempActual.toFixed(1)} °C`;
    elRangoOptimo.innerText = `${(tempOptima - tolAtencion).toFixed(1)} - ${(tempOptima + tolAtencion).toFixed(1)} °C`;

    const diferencia = Math.abs(tempActual - tempOptima);

    if (diferencia >= tolCritica) {
        // Estado CRÍTICO
        badgeEstado.className = "badge badge-critico";
        badgeEstado.innerText = "CRÍTICO";
        tarjeta.style.borderLeftColor = "#f87171";
        mensajeEstado.innerHTML = `⚠️ <strong>¡Atención crítica!</strong> La temperatura está ${tempActual > tempOptima ? 'demasiado alta' : 'demasiado baja'} para la planta.`;
    } else if (diferencia >= tolAtencion) {
        // Estado NECESITA ATENCIÓN
        badgeEstado.className = "badge badge-atencion";
        badgeEstado.innerText = "NECESITA ATENCIÓN";
        tarjeta.style.borderLeftColor = "#fbbf24";
        mensajeEstado.innerHTML = `⚡ <strong>Advertencia:</strong> La temperatura se está alejando del rango ideal.`;
    } else {
        // Estado NORMAL
        badgeEstado.className = "badge badge-normal";
        badgeEstado.innerText = "NORMAL";
        tarjeta.style.borderLeftColor = "#4ade80";
        mensajeEstado.innerText = `✔️ El ambiente se encuentra dentro de las condiciones ideales para el desarrollo de la planta.`;
    }
}

// Actualizar valores en KPIs, Alerta de Planta y Gráficos
function actualizarUI(temperatura, humedadAmbiente, humedadSuelo) {
    const horaActual = new Date().toLocaleTimeString();

    // Evaluar la alerta de la planta en tiempo real
    evaluarEstadoPlanta(temperatura);

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

// Listener para actualizar en tiempo real si el usuario cambia los campos del formulario
window.addEventListener('load', () => {
    inicializarGraficos();
    consultarDatosInvernadero();
    setInterval(consultarDatosInvernadero, 2000);

    const inputsConfig = ['nombre-planta', 'temp-optima', 'tolerancia-alerta', 'tolerancia-critica'];
    inputsConfig.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                const tempActual = parseFloat(document.getElementById('val-temp').innerText) || 22;
                evaluarEstadoPlanta(tempActual);
            });
        }
    });
});

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