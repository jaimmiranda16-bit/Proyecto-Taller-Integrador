// =====================================================
// INICIALIZACIÓN DEL MAPA REAL (LEAFLET)
// =====================================================

const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([-26.8083, -65.2176], 6); // Centrado en el norte argentino / Tucumán

// Capa de mapa oscuro profesional (Esri Dark Canvas)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    attribution: 'Tiles &copy; Esri'
}).addTo(map);

// =====================================================
// CANVAS Y ANIMACIÓN PROFESIONAL
// =====================================================

const canvas = document.getElementById("canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

let ancho = 0;
let alto = 0;

let particulas = [];
const cantidadParticulas = 700;

let mostrarParticulas = true;
let mostrarLluvia = true;
let reproduciendo = false;

// Zonas de precipitación basadas en coordenadas geográficas reales (Latitud, Longitud)
const zonasLluviaReal = [
    { lat: -24.85, lon: -65.42, radioBase: 90, intensidad: 0.8 }, // Zona Noroeste
    { lat: -26.80, lon: -65.20, radioBase: 60, intensidad: 0.6 }, // Tucumán y alredeores
    { lat: -28.46, lon: -65.77, radioBase: 75, intensidad: 0.5 }, // Catamarca
    { lat: -31.42, lon: -64.18, radioBase: 110, intensidad: 0.9 } // Córdoba
];

const datosViento = {
    velocidad: 2,
    direccion: Math.PI / 4 // Dirección diagonal hacia el sudeste
};

// Ajustar dimensiones del canvas para que coincida perfectamente con el mapa
function ajustarCanvas() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ancho = rect.width;
    alto = rect.height;
}

// Crear partículas de viento fluidas
function crearParticulas() {
    particulas = [];
    for (let i = 0; i < cantidadParticulas; i++) {
        particulas.push({
            x: Math.random() * ancho,
            y: Math.random() * alto,
            velocidad: Math.random() * 1.8 + 0.8,
            longitud: Math.random() * 15 + 5,
            vida: Math.random() * 120,
            opacidad: Math.random() * 0.5 + 0.2
        });
    }
}

// Dibujar precipitaciones ancladas al mapa geográfico (efecto radar profesional)
function dibujarLluviaGeografica() {
    if (!mostrarLluvia || !ctx) return;

    // Obtener el nivel de zoom actual para escalar el radio de la lluvia dinámicamente
    const zoomActual = map.getZoom();
    const factorZoom = Math.pow(2, zoomActual - 6); // Escala según el zoom del mapa

    zonasLluviaReal.forEach(zona => {
        // Convertir latitud y longitud del radar a píxeles de la pantalla actual
        const puntoPantalla = map.latLngToContainerPoint([zona.lat, zona.lon]);
        const x = puntoPantalla.x;
        const y = puntoPantalla.y;
        const radioActual = zona.radioBase * factorZoom;

        // Evitar renderizar si está muy fuera de la pantalla para optimizar rendimiento
        if (x + radioActual < 0 || x - radioActual > ancho || y + radioActual < 0 || y - radioActual > alto) {
            return;
        }

        const gradiente = ctx.createRadialGradient(x, y, 0, x, y, radioActual);
        gradiente.addColorStop(0, `rgba(0, 140, 255, ${zona.intensidad * 0.7})`);
        gradiente.addColorStop(0.4, `rgba(0, 200, 255, ${zona.intensidad * 0.4})`);
        gradiente.addColorStop(0.8, `rgba(50, 150, 255, 0.15)`);
        gradiente.addColorStop(1, "rgba(0, 150, 255, 0)");

        ctx.fillStyle = gradiente;
        ctx.beginPath();
        ctx.arc(x, y, radioActual, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Actualizar y mover partículas de viento simulando corrientes meteorológicas
function actualizarParticulas() {
    for (let i = 0; i < particulas.length; i++) {
        const p = particulas[i];

        p.x += Math.cos(datosViento.direccion) * p.velocidad * datosViento.velocidad;
        p.y += Math.sin(datosViento.direccion) * p.velocidad;
        p.y += Math.sin(p.vida * 0.03) * 0.2; // Ondulación natural del viento
        p.vida++;

        // Reubicar partículas al salir de la pantalla
        if (p.x > ancho + 50) { p.x = -50; p.y = Math.random() * alto; }
        if (p.x < -50) { p.x = ancho + 50; }
        if (p.y > alto + 50) { p.y = -50; }
        if (p.y < -50) { p.y = alto + 50; }
    }
}

// Dibujar trazos de viento en pantalla
function dibujarParticulas() {
    if (!mostrarParticulas || !ctx) return;

    for (let i = 0; i < particulas.length; i++) {
        const p = particulas[i];
        const largo = p.longitud * (p.velocidad * 0.7);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(
            p.x - Math.cos(datosViento.direccion) * largo,
            p.y - Math.sin(datosViento.direccion) * largo
        );

        ctx.strokeStyle = `rgba(135, 206, 250, ${p.opacidad})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
    }
}

// Bucle general de renderizado
function animar() {
    if (ctx) {
        ctx.clearRect(0, 0, ancho, alto);
        dibujarLluviaGeografica();
        actualizarParticulas();
        dibujarParticulas();
    }
    requestAnimationFrame(animar);
}

// =====================================================
// SINCRONIZACIÓN CON MOVIMIENTOS DEL MAPA
// =====================================================

map.on('move', () => {
    // Redibujar instantáneamente al arrastrar el mapa
    if (ctx) {
        ctx.clearRect(0, 0, ancho, alto);
        dibujarLluviaGeografica();
        dibujarParticulas();
    }
});

map.on('zoomend', () => {
    // Actualizar al terminar de hacer zoom
    ajustarCanvas();
});

// =====================================================
// EVENTOS DE CONTROL (CHECKBOXES Y BOTONES)
// =====================================================

const checkParticulas = document.getElementById("particulas");
if (checkParticulas) {
    checkParticulas.addEventListener("change", function () {
        mostrarParticulas = this.checked;
    });
}

const checkLluvia = document.getElementById("lluvia");
if (checkLluvia) {
    checkLluvia.addEventListener("change", function () {
        mostrarLluvia = this.checked;
    });
}

const botonPlay = document.getElementById("play");
if (botonPlay) {
    botonPlay.addEventListener("click", function () {
        reproduciendo = !reproduciendo;
        botonPlay.textContent = reproduciendo ? "❚❚" : "▶";
    });
}

// =====================================================
// INICIO Y REDIMENSIONAMIENTO
// =====================================================

function iniciar() {
    ajustarCanvas();
    crearParticulas();
    animar();

    setTimeout(() => {
        map.invalidateSize();
    }, 200);
}

window.addEventListener("load", iniciar);
window.addEventListener("resize", () => {
    ajustarCanvas();
    map.invalidateSize();
});