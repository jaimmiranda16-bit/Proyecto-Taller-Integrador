// ==========================================
// CANVAS: LÍNEAS DE ZONAS, CALOR Y VIENTO
// ==========================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function ajustarCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

// Generar partículas de viento
let particulas = [];
for (let i = 0; i < 35; i++) {
    particulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        velocidad: Math.random() * 1.5 + 0.5,
        largo: Math.random() * 25 + 10
    });
}

function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar líneas verticales que dividen las zonas del invernadero (como en tu captura)
    ctx.strokeStyle = "rgba(48, 54, 61, 0.6)";
    ctx.lineWidth = 1;
    let columnas = 5;
    let anchoColumna = canvas.width / columnas;
    
    for (let i = 1; i < columnas; i++) {
        ctx.beginPath();
        ctx.moveTo(i * anchoColumna, 0);
        ctx.lineTo(i * anchoColumna, canvas.height - 55); // Deja espacio para el timeline
        ctx.stroke();
    }

    // Dibujar partículas de viento si el checkbox está activo
    const checkboxViento = document.getElementById("checkParticulas");
    if (!checkboxViento || checkboxViento.checked) {
        ctx.strokeStyle = "rgba(0, 184, 148, 0.35)";
        ctx.lineWidth = 2;

        particulas.forEach(p => {
            p.x += p.velocidad;
            if (p.x > canvas.width) {
                p.x = -30;
                p.y = Math.random() * (canvas.height - 60);
            }

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.largo, p.y);
            ctx.stroke();
        });
    }

    requestAnimationFrame(animar);
}

animar();