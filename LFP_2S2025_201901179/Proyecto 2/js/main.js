let javaEditor; 
let pythonEditor;
let consoleDiv;          // Guardará referencia a la consola de mensajes
let currentJavaFile = null;    // Nombre del archivo Java actual
let currentPythonFile = null;
let ultimoResultadoLexico = null;
let ultimoResultadoSintactico = null;


document.addEventListener('DOMContentLoaded', function() {
    // PASO 1: Obtener referencias a elementos HTML
    javaEditor = document.getElementById('java-editor');     // El textarea izquierdo
    pythonEditor = document.getElementById('python-editor'); // El textarea derecho
    consoleDiv = document.getElementById('console');         // El área de mensajes

    // PASO 2: Configurar event listeners (escuchadores)
    setupMenuListeners();

    // PASO 3: Escuchar cuando el usuario escribe en los editores
    // 'input' = evento que se dispara cada vez que cambia el contenido
    javaEditor.addEventListener('input', () => updateLineCount('java'));
    pythonEditor.addEventListener('input', () => updateLineCount('python'));

    // PASO 4: Mostrar mensaje de bienvenida
    addConsoleMessage('Sistema iniciado correctamente', 'info');
});

function setupMenuListeners() {
    // ------ MENÚ ARCHIVO ------
    // addEventListener('click', función) = "Cuando hagan clic, ejecuta esta función"
    document.getElementById('btn-nuevo').addEventListener('click', nuevoArchivo);
    document.getElementById('btn-abrir').addEventListener('click', abrirArchivo);
    document.getElementById('btn-guardar').addEventListener('click', guardarArchivo);
    document.getElementById('btn-guardar-python').addEventListener('click', guardarPython);
    document.getElementById('btn-salir').addEventListener('click', salir);

    // ------ MENÚ TRADUCIR ------
    document.getElementById('btn-generar-traduccion').addEventListener('click', generarTraduccion);
    document.getElementById('btn-ver-tokens').addEventListener('click', verTokens);
    document.getElementById('btn-ver-errores').addEventListener('click', mostrarReporteErrores);

    // ------ MENÚ AYUDA ------
    document.getElementById('btn-acerca-de').addEventListener('click', acercaDe);

    // ------ BOTÓN LIMPIAR CONSOLA ------
    document.getElementById('btn-limpiar-consola').addEventListener('click', limpiarConsola);

    // ------ MODAL (VENTANA EMERGENTE) ------
    const modal = document.getElementById('modal-reporte');
    const closeBtn = document.querySelector('.close');
    
    // Cerrar modal al hacer clic en la X
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ------ INPUT FILE (carga de archivos) ------
    document.getElementById('file-input').addEventListener('change', function(e) {
        const file = e.target.files[0]; // Obtener primer archivo seleccionado
        
        if (file) {
            const reader = new FileReader(); // Objeto para leer archivos
            
            // Función que se ejecuta cuando termina de leer
            reader.onload = function(event) {
                javaEditor.value = event.target.result; // Poner contenido en editor
                document.getElementById('java-filename').textContent = file.name;
                currentJavaFile = file.name;
                updateLineCount('java');
                addConsoleMessage('Archivo cargado: ' + file.name, 'success');
            };
            
            // Iniciar lectura del archivo
            reader.readAsText(file);
        }
    });
}


function nuevoArchivo(e) {
    e.preventDefault(); // Evita que el enlace recargue la página, da una notificación al navegador
 
    if (confirm('¿Deseas crear un nuevo archivo? Los cambios no guardados se perderán.')) {
        javaEditor.value = '';
        pythonEditor.value = '';

        document.getElementById('java-filename').textContent = 'Sin título.java';
        document.getElementById('python-filename').textContent = 'Sin título.py';
        
        // Resetear variables globales
        currentJavaFile = null;
        currentPythonFile = null;
        ultimoResultadoLexico = null;
        ultimoResultadoSintactico = null;
 
        limpiarConsola();
        addConsoleMessage('Nuevo archivo creado', 'info');
    }
}


function abrirArchivo(e) {
    e.preventDefault();
    // Esto abre el diálogo de "Seleccionar archivo" del sistema operativo
    document.getElementById('file-input').click();
}

/**
 * GUARDAR ARCHIVO JAVA
 * ¿Qué hace? Descarga el contenido del editor Java como archivo .java
 */
function guardarArchivo(e) {
    e.preventDefault();
    const content = javaEditor.value;
    
    if (!content.trim()) {
        addConsoleMessage('No hay contenido para guardar', 'error');
        return;
    }
    
    const filename = prompt('Nombre del archivo:', currentJavaFile || 'MiPrograma.java');
    
    if (filename) {
        descargarArchivo(content, filename);
        currentJavaFile = filename;
        document.getElementById('java-filename').textContent = filename;
        addConsoleMessage('Archivo guardado: ' + filename, 'success');
    }
}

/**
 * GUARDAR ARCHIVO PYTHON
 * ¿Qué hace? Descarga el código Python traducido
 */
function guardarPython(e) {
    e.preventDefault();
    const content = pythonEditor.value;
    
    if (!content.trim()) {
        addConsoleMessage('No hay código Python para guardar. Primero genera la traducción.', 'error');
        return;
    }
    
    const filename = prompt('Nombre del archivo Python:', currentPythonFile || 'programa.py');
    
    if (filename) {
        descargarArchivo(content, filename);
        currentPythonFile = filename;
        document.getElementById('python-filename').textContent = filename;
        addConsoleMessage('Archivo Python guardado: ' + filename, 'success');
    }
}

/**
 * SALIR
 * ¿Qué hace? Cierra la pestaña del navegador
 */
function salir(e) {
    e.preventDefault();
    if (confirm('¿Seguro que deseas salir?')) {
        window.close(); // Intenta cerrar la ventana
    }
}

/**
 * GENERAR TRADUCCIÓN
 * ¿Qué hace? Inicia el proceso de análisis y traducción
 * NOTA: Aquí conectaremos el Lexer y Parser en fases posteriores
 */
function generarTraduccion(e) {
    e.preventDefault();
    const javaCode = javaEditor.value.trim();
    
    if (!javaCode) {
        addConsoleMessage('Por favor, ingresa código Java primero', 'error');
        return;
    }
    
    addConsoleMessage('Iniciando análisis léxico...', 'info');
    
    try {
        // FASE 2: ANÁLISIS LÉXICO
        const lexer = new Lexer();
        ultimoResultadoLexico = lexer.analizar(javaCode); // ✅ CAMBIO AQUÍ
        
        addConsoleMessage(`Tokens encontrados: ${ultimoResultadoLexico.tokens.length}`, 'success');
        
        if (ultimoResultadoLexico.errores.length > 0) {
            addConsoleMessage(`Errores léxicos: ${ultimoResultadoLexico.errores.length}`, 'error');
            ultimoResultadoLexico.errores.slice(0, 3).forEach(error => {
                addConsoleMessage(`  Línea ${error.linea}: ${error.descripcion} - "${error.lexema}"`, 'error');
            });
            return;
        }
        
        addConsoleMessage('Análisis léxico completado exitosamente', 'success');
        
        // FASE 3: ANÁLISIS SINTÁCTICO
        addConsoleMessage('Iniciando análisis sintáctico...', 'info');
        
        const parser = new Parser(ultimoResultadoLexico.tokens);
        ultimoResultadoSintactico = parser.analizar(); // ✅ CAMBIO AQUÍ
        
        if (!ultimoResultadoSintactico.exito) {
            addConsoleMessage(`Errores sintácticos: ${ultimoResultadoSintactico.errores.length}`, 'error');
            ultimoResultadoSintactico.errores.slice(0, 3).forEach(error => {
                addConsoleMessage(`  Línea ${error.linea}: ${error.descripcion}`, 'error');
            });
            return;
        }
        
        addConsoleMessage('Análisis sintáctico completado exitosamente', 'success');
        
        // FASE 4: TRADUCCIÓN
        addConsoleMessage('Iniciando traducción a Python...', 'info');
        
        const traductor = new Traductor(ultimoResultadoSintactico.ast);
        const codigoPython = traductor.traducir();
        
        // Mostrar código Python en el editor
        pythonEditor.value = codigoPython;
        updateLineCount('python');
        
        addConsoleMessage('Traducción completada exitosamente ✓', 'success');
        addConsoleMessage('Código Python generado', 'success');
        
    } catch (error) {
        addConsoleMessage('Error inesperado: ' + error.message, 'error');
        console.error(error);
    }
}

/**
 * VER TOKENS
 * Muestra reporte de tokens en modal
 */
function verTokens(e) {
    e.preventDefault();
    
    if (!ultimoResultadoLexico || ultimoResultadoLexico.tokens.length === 0) {
        addConsoleMessage('Primero genera la traducción para ver los tokens', 'error');
        return;
    }
    
    GeneradorReportes.generarReporteTokens(ultimoResultadoLexico.tokens);
    addConsoleMessage('Reporte de tokens generado en nueva ventana', 'success');
}

function mostrarReporteErrores(e) {
    e.preventDefault();
    
    const erroresLexicos = ultimoResultadoLexico ? ultimoResultadoLexico.errores : [];
    const erroresSintacticos = ultimoResultadoSintactico ? ultimoResultadoSintactico.errores : [];
    
    GeneradorReportes.generarReporteErrores(erroresLexicos, erroresSintacticos);
    addConsoleMessage('Reporte de errores generado en nueva ventana', 'success');
}

function acercaDe(e) {
    e.preventDefault();
    const modalBody = document.getElementById('modal-body');
    
    // Insertar HTML con información del proyecto
    modalBody.innerHTML = `
        <h2>JavaBridge</h2>
        
        <hr>
        <p><strong>Proyecto:</strong> Lenguajes Formales y de Programación</p>
        <p><strong>Desarrollador:</strong> Eddy Alvarado</p>
        <p><strong>Carné:</strong> 201901179</p>

    `;
    
    // Mostrar el modal
    document.getElementById('modal-reporte').style.display = 'block';
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * ACTUALIZAR CONTADOR DE LÍNEAS
 * ¿Qué hace? Cuenta cuántas líneas tiene el código y lo muestra
 * 
 * @param {string} editor - 'java' o 'python'
 */
function updateLineCount(editor) {
    const textarea = editor === 'java' ? javaEditor : pythonEditor;
    const counter = document.getElementById(editor + '-lines');
    
    // Dividir el texto por saltos de línea y contar
    const lines = textarea.value.split('\n').length;
    counter.textContent = lines;
}

/**
 * AGREGAR MENSAJE A LA CONSOLA
 * ¿Qué hace? Muestra mensajes en la consola con colores según el tipo
 * 
 * @param {string} message - El texto del mensaje
 * @param {string} type - Tipo: 'info', 'success', 'error', 'warning'
 */
function addConsoleMessage(message, type = 'info') {
    const p = document.createElement('p'); // Crear elemento <p>
    p.className = 'console-' + type;       // Asignar clase CSS
    
    // Obtener hora actual
    const timestamp = new Date().toLocaleTimeString();
    
    // Asignar texto al párrafo
    p.textContent = '[' + timestamp + '] ' + message;
    
    // Agregar el párrafo a la consola
    consoleDiv.appendChild(p);
    
    // Scroll automático hacia abajo
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function limpiarConsola() {
    consoleDiv.innerHTML = '<p class="console-info">Consola limpiada</p>';
}

/**
 * DESCARGAR ARCHIVO
 * ¿Qué hace? Crea un archivo temporal y lo descarga
 * 
 * @param {string} contenido - El texto del archivo
 * @param {string} nombreArchivo - Nombre con el que se descargará
 */
function descargarArchivo(contenido, nombreArchivo) {
    // Crear un Blob (objeto binario) con el contenido
    const blob = new Blob([contenido], { type: 'text/plain' });
    
    // Crear URL temporal del blob
    const url = URL.createObjectURL(blob);
    
    // Crear enlace <a> invisible
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}