// =====================================================
// 1. INICIALIZAR MAPA REAL (LEAFLET)
// =====================================================

// Centrado en Cutral Có / Neuquén con nivel de zoom inicial
const map = L.map('map', {
    zoomControl: true
}).setView([-38.9338, -69.2305], 8); 

// Capa de mapa real 100% gratuita y pública (sin API Key ni marca de agua)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// =====================================================
// 2. CANVAS Y PARTÍCULAS SUPERPUESTAS
// =====================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let ancho = 0;
let alto = 0;

let particulas = [];
const cantidadParticulas = 600;

let mostrarParticulas = true;
let mostrarLluvia = true;

// Datos de simulación de lluvia proyectados en coordenadas reales (Latitud, Longitud)
const zonasLluvia = [
    { lat: -38.9338, lng: -69.2305, radioKm: 40 }, // Cutral Có
    { lat: -38.9516, lng: -68.0591, radioKm: 30 }, // Neuquén Cap.
    { lat: -38.8828, lng: -70.0545, radioKm: 50 }  // Zapala
];

const viento = { velocidad: 2, direccion: 0.3 }; // Dirección en radianes

// Ajustar tamaño del canvas al contenedor
function ajustarCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ancho = rect.width;
    alto = rect.height;
}

// Crear partículas de viento
function crearParticulas() {
    particulas = [];
    for (let i = 0; i < cantidadParticulas; i++) {
        particulas.push({
            x: Math.random() * ancho,
            y: Math.random() * alto,
            velocidad: Math.random() * 1.5 + 0.5,
            longitud: Math.random() * 12 + 6,
            vida: Math.random() * 100,
            opacidad: Math.random() * 0.5 + 0.3
        });
    }
}

// =====================================================
// 3. DIBUJAR RADARES DE LLUVIA EN COORDENADAS REALES
// =====================================================

function dibujarLluvia() {
    if (!mostrarLluvia) return;

    zonasLluvia.forEach(zona => {
        // Convertir coordenadas geográficas a píxeles del Canvas
        const punto = map.latLngToContainerPoint([zona.lat, zona.lng]);
        
        // Calcular radio en píxeles según el nivel de zoom del mapa
        const puntoBorde = map.latLngToContainerPoint([zona.lat, zona.lng + (zona.radioKm / 111)]);
        const radioPx = Math.abs(puntoBorde.x - punto.x);

        const gradiente = ctx.createRadialGradient(punto.x, punto.y, 0, punto.x, punto.y, radioPx);
        gradiente.addColorStop(0, "rgba(0, 120, 255, 0.55)");
        gradiente.addColorStop(0.5, "rgba(0, 180, 255, 0.35)");
        gradiente.addColorStop(1, "rgba(0, 200, 255, 0)");

        ctx.fillStyle = gradiente;
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, radioPx, 0, Math.PI * 2);
        ctx.fill();
    });
}

// =====================================================
// 4. DIBUJAR PARTÍCULAS DE VIENTO
// =====================================================

function actualizarYDibujarParticulas() {
    if (!mostrarParticulas) return;

    for (let p of particulas) {
        p.x += Math.cos(viento.direccion) * p.velocidad * viento.velocidad;
        p.y += Math.sin(viento.direccion) * p.velocidad * viento.velocidad;
        p.y += Math.sin(p.vida * 0.05) * 0.2;
        p.vida++;

        // Reaparecer partículas fuera de pantalla
        if (p.x > ancho + 20) p.x = -20;
        if (p.x < -20) p.x = ancho + 20;
        if (p.y > alto + 20) p.y = -20;
        if (p.y < -20) p.y = alto + 20;

        const largo = p.longitud * p.velocidad;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(
            p.x - Math.cos(viento.direccion) * largo,
            p.y - Math.sin(viento.direccion) * largo
        );
        ctx.strokeStyle = `rgba(50, 65, 85, ${p.opacidad})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
    }
}

// =====================================================
// 5. BUCLE DE ANIMACIÓN
// =====================================================

function animar() {
    ctx.clearRect(0, 0, ancho, alto);

    dibujarLluvia();
    actualizarYDibujarParticulas();

    requestAnimationFrame(animar);
}

// =====================================================
// 6. EVENTOS DE UI Y MAPA
// =====================================================

// Redimensionar canvas cuando se mueve el mapa o cambia el tamaño
map.on('move resize zoom', ajustarCanvas);

document.getElementById("particulas").addEventListener("change", function () {
    mostrarParticulas = this.checked;
});

document.getElementById("lluvia").addEventListener("change", function () {
    mostrarLluvia = this.checked;
});

// =====================================================
// 7. CONTROL DE LA BARRA DE HORAS Y REPRODUCCIÓN
// =====================================================

const horas = ["16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00","00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00"];
let horaIndex = 10; // Empieza en 02:00
let reproduciendo = false;

const botonPlay = document.getElementById("play");
const spansHoras = document.querySelectorAll(".horas span");

if (botonPlay) {
    botonPlay.addEventListener("click", () => {
        reproduciendo = !reproduciendo;
        botonPlay.textContent = reproduciendo ? "❚❚" : "▶";
    });
}

setInterval(() => {
    if (!reproduciendo || spansHoras.length === 0) return;
    
    // Quitar marca activa previa
    spansHoras.forEach(s => s.classList.remove("hora-activa"));

    horaIndex = (horaIndex + 1) % horas.length;

    // Marcar la hora actual
    if (spansHoras[horaIndex]) {
        spansHoras[horaIndex].classList.add("hora-activa");
    }
}, 1000);

// Inicialización general al cargar página
window.addEventListener("load", () => {
    ajustarCanvas();
    crearParticulas();
    animar();
});