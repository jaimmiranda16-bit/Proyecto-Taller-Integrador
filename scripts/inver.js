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

// --- FRASES AUTOMÁTICAS Y TÉCNICAS PARA LAS PLANTAS DIVIDIDAS EN 3 PARTES ---

function obtenerTextoTemperaturaPlanta(val) {
    if (val < 18) {
        return { texto: "la temperatura está baja y frena el crecimiento del cultivo", nivel: "advertencia" };
    } else if (val <= 26) {
        return { texto: "la temperatura está excelente para que las plantas anden joya", nivel: "ok" };
    } else {
        return { texto: "la temperatura está muy alta y estresa a la vegetación", nivel: "peligro" };
    }
}

function obtenerTextoHumedadPlanta(val) {
    if (val < 40) {
        return { texto: "a la humedad le falta muchísimo y las hojas se van a deshidratar", nivel: "advertencia" };
    } else if (val <= 70) {
        return { texto: "la humedad relativa acompaña perfecto el desarrollo radicular", nivel: "ok" };
    } else {
        return { texto: "hay exceso de humedad ambiental con riesgo de hongos en el follaje", nivel: "advertencia" };
    }
}

function obtenerTextoLuminosidadPlanta(val) {
    if (val < 40) {
        return { texto: "y se nota que falta iluminación para una buena fotosíntesis.", nivel: "advertencia" };
    } else if (val <= 80) {
        return { texto: "y la luminosidad está ideal para este tipo de plantas.", nivel: "ok" };
    } else {
        return { texto: "y el nivel de luz solar pega tan fuerte que puede quemar las hojas.", nivel: "advertencia" };
    }
}

function actualizarBarraAlertasAutomatica(temp, hum, luz) {
    const barraAlertas = document.getElementById("barra-alertas");
    const alertasIcono = document.getElementById("alertas-icono");
    const alertasTitulo = document.getElementById("alertas-titulo");
    const alertasMensaje = document.getElementById("alertas-mensaje");
    const alertasEstado = document.getElementById("alertas-estado");

    if (!barraAlertas) return;

    const pTemp = obtenerTextoTemperaturaPlanta(temp);
    const pHum = obtenerTextoHumedadPlanta(hum);
    const pLuz = obtenerTextoLuminosidadPlanta(luz);

    // Unir las 3 partes de forma automática y fluida
    let mensajeCompleto = `Estado actual: Se detecta que ${pTemp.texto}, acompañando con que ${pHum.texto} ${pLuz.texto}`;

    // Determinar nivel general de alerta visual
    let estadoGeneral = "ok";
    let icono = "🌱";
    let titulo = "Monitoreo Automático del Invernadero";

    const niveles = [pTemp.nivel, pHum.nivel, pLuz.nivel];
    if (niveles.includes("peligro")) {
        estadoGeneral = "peligro";
        icono = "🚨";
        titulo = "¡Alerta Crítica en el Cultivo!";
    } else if (niveles.includes("advertencia")) {
        estadoGeneral = "advertencia";
        icono = "⚠️";
        titulo = "Atención: El cultivo requiere ajustes";
    }

    barraAlertas.className = `alertas-container estado-${estadoGeneral}`;
    alertasIcono.textContent = icono;
    alertasEstado.textContent = estadoGeneral.toUpperCase();
    alertasTitulo.textContent = titulo;
    alertasMensaje.textContent = mensajeCompleto;
}
// --------------------------------------------------------------------------

// Evaluar y actualizar el estado de alerta personalizado de la planta (Configuración inferior)
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
    elRangoOptimo.innerText = `${(tempOptima - tolAtencion).toFixed(1)} a ${(tempOptima + tolAtencion).toFixed(1)} °C`;

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

// Actualizar valores en KPIs, Alerta de Planta, Gráficos y Barra de Alertas Automática
function actualizarUI(temperatura, humedadAmbiente, luminosidad) {
    const horaActual = new Date().toLocaleTimeString();

    // Evaluar la alerta inferior de la planta
    evaluarEstadoPlanta(temperatura);

    // Actualizar la barra superior automática con las 3 partes combinadas para plantas
    actualizarBarraAlertasAutomatica(temperatura, humedadAmbiente, luminosidad);

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
    agregarDatoGrafico(chartLuminosidad, horaActual, luminosidad);
}

// Petición a la ESP32 (con respaldo de simulación)
function consultarDatosInvernadero() {
    fetch(API_URL)
        .then(res => res.json())
        .then(datos => {
            const temp = datos.temperatura !== undefined ? datos.temperatura : datos.temp;
            const hum = datos.humedad !== undefined ? datos.humedad : datos.hum;
            const luz = datos.luz !== undefined ? datos.luz : datos.luminosidad;

            actualizarUI(temp, hum, luz);
        })
        .catch(error => {
            console.warn("No se pudo conectar con la estación ESP32, activando simulación local:", error);
            
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
    setInterval(consultarDatosInvernadero, 3000); // Cada 3 segundos

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
