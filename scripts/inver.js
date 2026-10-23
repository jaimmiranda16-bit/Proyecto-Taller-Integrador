// URL de la estación meteorológica del profesor (cambiar la IP si la OLED muestra otra, ej: http://192.168.4.1/)
const API_URL = "http://192.168.4.1/";

let chartTemp = null;
let chartHum = null;
let chartLuminosidad = null;

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

    // 3. Gráfico Luminosidad
    const ctxLuminosidad = document.getElementById('grafico-luminosidad');
    if (ctxLuminosidad && !chartLuminosidad) {
        chartLuminosidad = new Chart(ctxLuminosidad.getContext('2d'), {
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
        badgeEstado.className = "badge badge-critico";
        badgeEstado.innerText = "CRÍTICO";
        if (tarjeta) tarjeta.style.borderLeftColor = "#f87171";
        mensajeEstado.innerHTML = `⚠️ <strong>¡Atención crítica!</strong> La temperatura está ${tempActual > tempOptima ? 'demasiado alta' : 'demasiado baja'} para la planta.`;
    } else if (diferencia >= tolAtencion) {
        badgeEstado.className = "badge badge-atencion";
        badgeEstado.innerText = "NECESITA ATENCIÓN";
        if (tarjeta) tarjeta.style.borderLeftColor = "#fbbf24";
        mensajeEstado.innerHTML = `⚡ <strong>Advertencia:</strong> La temperatura se está alejando del rango ideal.`;
    } else {
        badgeEstado.className = "badge badge-normal";
        badgeEstado.innerText = "NORMAL";
        if (tarjeta) tarjeta.style.borderLeftColor = "#4ade80";
        mensajeEstado.innerText = `✔️ El ambiente se encuentra dentro de las condiciones ideales para el desarrollo de la planta.`;
    }
}

// Actualizar valores en KPIs, Alerta de Planta y Gráficos
function actualizarUI(temperatura, humedadAmbiente, luminosidad) {
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

    // KPI Luminosidad
    const elLuminosidad = document.getElementById('val-luminosidad');
    if (elLuminosidad) elLuminosidad.innerText = Math.round(luminosidad);

    const footerLuminosidad = document.querySelector('.kpi-card:nth-child(3) .kpi-footer');
    if (footerLuminosidad) {
        if (luminosidad < 50) {
            footerLuminosidad.className = "kpi-footer amarillo";
            footerLuminosidad.innerHTML = "⚠️ Luminosidad baja";
        } else {
            footerLuminosidad.className = "kpi-footer verde";
            footerLuminosidad.innerHTML = "✔️ Luminosidad adecuada";
        }
    }
    agregarDatorGraficoSeguro = agregarDatoGrafico(chartLuminosidad, horaActual, luminosidad);
}

// Petición a la API de la ESP32 (con respaldo de simulación si estás en tu casa sin la placa)
function consultarDatosInvernadero() {
    fetch(API_URL)
        .then(res => res.json())
        .then(datos => {
            // Suponiendo que la placa responde con: { temperatura: 25.5, humedad: 60, luz: 300 }
            // (Ajustá los nombres de las propiedades de 'datos' si el profe usa otros, ej: datos.luz o datos.luminosidad)
            const temp = datos.temperatura !== undefined ? datos.temperatura : datos.temp;
            const hum = datos.humedad !== undefined ? datos.humedad : datos.hum;
            const luz = datos.luz !== undefined ? datos.luz : datos.luminosidad;

            actualizarUI(temp, hum, luz);
        })
        .catch(error => {
            console.warn("No se pudo conectar con la estación ESP32, activando simulación local:", error);
            
            // Modo simulación local por si probás en tu casa sin conexión a la red del taller
            const tempSim = 20 + Math.random() * 8;
            const humASim = 50 + Math.random() * 15;
            const luzSim = 40 + Math.random() * 20;
            actualizarUI(tempSim, humASim, luzSim);
        });
}

// Inicializar al cargar la página
window.addEventListener('load', () => {
    inicializarGraficos();
    consultarDatosInvernadero();
    setInterval(consultarDatosInvernadero, 3000); // Cada 3 segundos como pidió el profe

    // Listener para actualizar en tiempo real si el usuario cambia los campos del formulario de la planta
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