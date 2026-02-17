const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbzlrlLrkkNI4h4VK4yANIo5ejppUjPYGPkOurTPbKkOB7pYdSVU5YzNlwKjUTiiO2PN/exec";

// CONFIGURACIÓN DE CIERRES
const CIERRES_GRUPOS = {
    "Grupo A": new Date(2026, 5, 11, 15, 0),
    "Grupo B": new Date(2026, 5, 12, 12, 0)
};

const banderas = {
    // CONCACAF (Anfitriones y clasificados)
    "México": "mx",
    "Estados Unidos": "us",
    "Canadá": "ca",
    "Panamá": "pa",
    "Costa Rica": "cr",
    "Jamaica": "jm",
    "Honduras": "hn",
    "El Salvador": "sv",
    "Guatemala": "gt",

    // CONMEBOL
    "Argentina": "ar",
    "Brasil": "br",
    "Uruguay": "uy",
    "Colombia": "co",
    "Ecuador": "ec",
    "Paraguay": "py",
    "Chile": "cl",
    "Venezuela": "ve",
    "Perú": "pe",
    "Bolivia": "bo",

    // UEFA (Europa)
    "España": "es",
    "Francia": "fr",
    "Inglaterra": "gb-eng",
    "Alemania": "de",
    "Italia": "it",
    "Portugal": "pt",
    "Países Bajos": "nl",
    "Bélgica": "be",
    "Croacia": "hr",
    "Suiza": "ch",
    "Dinamarca": "dk",
    "Polonia": "pl",
    "Escocia": "gb-sct",

    // AFC (Asia)
    "Japón": "jp",
    "Corea del Sur": "kr",
    "Australia": "au",
    "Irán": "ir",
    "Arabia Saudita": "sa",
    "Qatar": "qa",
    "Irak": "iq",
    "Emiratos Árabes": "ae",

    // CAF (África)
    "Marruecos": "ma",
    "Senegal": "sn",
    "Túnez": "tn",
    "Argelia": "dz",
    "Egipto": "eg",
    "Nigeria": "ng",
    "Camerún": "cm",
    "Ghana": "gh",
    "Costa de Marfil": "ci",
    "Sudáfrica": "za",

    // OFC (Oceanía)
    "Nueva Zelanda": "nz",

    // Otros / Comodines
    "Clasificatorio A": "un",
    "Clasificatorio B": "un",
    "Repechaje": "un"
};

let predicciones = {};
let totalPartidos = 0;
const ahora = new Date();

async function cargarFixture() {
    try {
        const res = await fetch(URL_GOOGLE_SCRIPT);
        const partidos = await res.json();
        const contenedor = document.getElementById("contenedor-partidos");
        contenedor.innerHTML = "";
        
        totalPartidos = partidos.length;
        document.getElementById("total-partidos").innerText = totalPartidos;

        const grupos = {};
        partidos.forEach(p => {
            if (!grupos[p.fase]) grupos[p.fase] = [];
            grupos[p.fase].push(p);
        });

        for (const nombreGrupo in grupos) {
            const fechaLimite = CIERRES_GRUPOS[nombreGrupo];
            const estaCerrado = fechaLimite && ahora > fechaLimite;

            const seccion = document.createElement("div");
            seccion.innerHTML = `<h3 style="color:var(--dorado); padding:10px;">${nombreGrupo} ${estaCerrado ? '🔒' : ''}</h3>`;
            
            const grid = document.createElement("div");
            grid.className = "grid-tres-columnas";

            grupos[nombreGrupo].forEach(p => {
                const card = document.createElement("div");
                card.className = `partido-card ${estaCerrado ? 'card-bloqueada' : ''}`;
                card.innerHTML = `
                    <div class="fila-horizontal-prode">
                        <div class="bloque-equipo">
                            <img src="https://flagcdn.com/w80/${banderas[p.equipoL] || 'un'}.png" class="bandera">
                            <span>${p.equipoL}</span>
                        </div>
                        <div class="opciones-prode">
                            <button class="btn-prode" id="btnL-${p.id}" ${estaCerrado ? 'disabled' : `onclick="seleccionar('${p.id}','L')"`}>L</button>
                            <button class="btn-prode" id="btnE-${p.id}" ${estaCerrado ? 'disabled' : `onclick="seleccionar('${p.id}','E')"`}>E</button>
                            <button class="btn-prode" id="btnV-${p.id}" ${estaCerrado ? 'disabled' : `onclick="seleccionar('${p.id}','V')"`}>V</button>
                        </div>
                        <div class="bloque-equipo">
                            <img src="https://flagcdn.com/w80/${banderas[p.equipoV] || 'un'}.png" class="bandera">
                            <span>${p.equipoV}</span>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
            seccion.appendChild(grid);
            contenedor.appendChild(seccion);
        }
    } catch (e) { console.error(e); }
}

function seleccionar(id, valor) {
    document.getElementById(`btnL-${id}`).classList.remove("activo");
    document.getElementById(`btnE-${id}`).classList.remove("activo");
    document.getElementById(`btnV-${id}`).classList.remove("activo");
    document.getElementById(`btn${valor}-${id}`).classList.add("activo");
    
    predicciones[id] = valor;
    const progreso = (Object.keys(predicciones).length / totalPartidos) * 100;
    document.getElementById("barra-progreso-relleno").style.width = progreso + "%";
    document.getElementById("completados").innerText = Object.keys(predicciones).length;
}

async function enviarPronosticos() {
    const usuario = document.getElementById("nombre-usuario").value.trim();
    if (!usuario) return alert("Ingresa tu nombre arriba");

    const btn = document.getElementById("btn-enviar");
    btn.disabled = true;
    btn.innerText = "Enviando...";

    try {
        await fetch(URL_GOOGLE_SCRIPT, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({ usuario, predicciones })
        });
        alert("✅ ¡Enviado!");
    } catch (e) { alert("Error"); }
    btn.disabled = false;
    btn.innerText = "Guardar mis Predicciones";
}

// FUNCIONES RANKING
async function verRanking() {
    document.getElementById("modal-ranking").style.display = "block";
    const cuerpo = document.getElementById("cuerpo-ranking");
    cuerpo.innerHTML = "Cargando...";
    try {
        const res = await fetch(URL_GOOGLE_SCRIPT + "?accion=ranking");
        const data = await res.json();
        cuerpo.innerHTML = data.map((u, i) => `<tr><td>${i+1}</td><td>${u.nombre}</td><td>${u.puntos}</td></tr>`).join("");
    } catch (e) { cuerpo.innerHTML = "Error"; }
}

function cerrarRanking() { document.getElementById("modal-ranking").style.display = "none"; }

cargarFixture();