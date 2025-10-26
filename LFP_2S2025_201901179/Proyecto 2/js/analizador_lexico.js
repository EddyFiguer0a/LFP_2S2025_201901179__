
class Token {
    constructor(tipo, lexema, linea, columna) {
        this.tipo = tipo;      // Tipo de token (PALABRA_RESERVADA, IDENTIFICADOR, etc.)
        this.lexema = lexema;  // El texto exacto del token
        this.linea = linea;    // Línea donde aparece
        this.columna = columna; // Columna donde aparece
    }
}


class ErrorLexico {
    constructor(descripcion, lexema, linea, columna) {
        this.tipo = 'Error Léxico';
        this.descripcion = descripcion;
        this.lexema = lexema;
        this.linea = linea;
        this.columna = columna;
    }
}

/**
 * Clase Lexer: Analizador Léxico
 * IGUAL QUE TU PROYECTO ANTERIOR, pero con más estados y tokens
 */
class Lexer {
    constructor() {
        this.listaTokens = [];  // Lista de tokens encontrados
        this.listaErrores = []; // Lista de errores léxicos
        

        this.palabrasReservadas = {
            'public': 'PALABRA_RESERVADA',
            'class': 'PALABRA_RESERVADA',
            'static': 'PALABRA_RESERVADA',
            'void': 'PALABRA_RESERVADA',
            'main': 'PALABRA_RESERVADA',
            'String': 'PALABRA_RESERVADA',
            'args': 'PALABRA_RESERVADA',
            'int': 'PALABRA_RESERVADA',
            'double': 'PALABRA_RESERVADA',
            'char': 'PALABRA_RESERVADA',
            'boolean': 'PALABRA_RESERVADA',
            'true': 'LITERAL_BOOLEANO',
            'false': 'LITERAL_BOOLEANO',
            'if': 'PALABRA_RESERVADA',
            'else': 'PALABRA_RESERVADA',
            'for': 'PALABRA_RESERVADA',
            'while': 'PALABRA_RESERVADA',
            'System': 'PALABRA_RESERVADA',
            'out': 'PALABRA_RESERVADA',
            'println': 'PALABRA_RESERVADA'
        };
    }
    
    // ========================================================================
    // FUNCIONES AUXILIARES (IGUAL QUE EN TU PROYECTO ANTERIOR)
    // ========================================================================
    
    /**
     * Verifica si un carácter es una letra (a-z, A-Z, _)
     * IGUAL que tu código anterior
     */
    esLetra(char) {
        if (!char) return false;
        return /[A-Za-z_]/.test(char);
    }
    
    /**
     * Verifica si un carácter es un dígito (0-9)
     * IGUAL que tu código anterior
     */
    esDigito(char) {
        if (!char) return false;
        return /[0-9]/.test(char);
    }
    
    /**
     * Verifica si es un espacio en blanco
     * IGUAL que tu código anterior
     */
    esEspacio(char) {
        return /[ \t\n\r]/.test(char);
    }
    
    /**
     * Verifica si es un símbolo (ADAPTADO para Java)
     * CAMBIO: Agregaste más símbolos
     */
    esSimbolo(char) {
        return '{}()[];,.'.includes(char);
    }
    
    /**
     * Verifica si es un operador (NUEVO)
     * Tu proyecto anterior no tenía operadores
     */
    esOperador(char) {
        return '+-*/<>=!'.includes(char);
    }
    
    // ========================================================================
    // FUNCIÓN PRINCIPAL DE ANÁLISIS
    // ========================================================================
    
    /**
     * Analiza el código Java y genera tokens
     * SIMILAR a tu código anterior, pero con más estados
     */
    analizar(entrada) {
        // Reiniciar listas
        this.listaTokens = [];
        this.listaErrores = [];
        
        let buffer = '';           // Almacena caracteres mientras construimos un token
        const centinela = '#';     // Marca el fin del archivo (IGUAL que tu código)
        entrada += centinela;
        
        let linea = 1;             // Contador de líneas
        let columna = 1;           // Contador de columnas
        let estado = 0;            // Estado del autómata
        let index = 0;             // Posición actual en la entrada
        
        // CICLO PRINCIPAL (IGUAL QUE TU CÓDIGO ANTERIOR)
        while (index < entrada.length) {
            const char = entrada[index];
            
            // ================================================================
            // ESTADO 0: INICIAL (esperando inicio de token)
            // ================================================================
            if (estado === 0) {
                
                // ---- SÍMBOLOS (SIMILAR a tu código anterior) ----
                if (char === '{') {
                    this.listaTokens.push(new Token('LLAVE_ABRE', char, linea, columna));
                    columna++;
                }
                else if (char === '}') {
                    this.listaTokens.push(new Token('LLAVE_CIERRA', char, linea, columna));
                    columna++;
                }
                else if (char === '(') {
                    this.listaTokens.push(new Token('PARENTESIS_ABRE', char, linea, columna));
                    columna++;
                }
                else if (char === ')') {
                    this.listaTokens.push(new Token('PARENTESIS_CIERRA', char, linea, columna));
                    columna++;
                }
                else if (char === '[') {
                    this.listaTokens.push(new Token('CORCHETE_ABRE', char, linea, columna));
                    columna++;
                }
                else if (char === ']') {
                    this.listaTokens.push(new Token('CORCHETE_CIERRA', char, linea, columna));
                    columna++;
                }
                else if (char === ';') {
                    this.listaTokens.push(new Token('PUNTO_COMA', char, linea, columna));
                    columna++;
                }
                else if (char === ',') {
                    this.listaTokens.push(new Token('COMA', char, linea, columna));
                    columna++;
                }
                else if (char === '.') {
                    this.listaTokens.push(new Token('PUNTO', char, linea, columna));
                    columna++;
                }
                
                // ---- CADENAS (IGUAL que tu código anterior) ----
                else if (char === '"') {
                    buffer = '"';
                    columna++;
                    estado = 1; // Estado: leyendo cadena
                }
                
                // ---- CARACTERES (NUEVO - Java usa comillas simples) ----
                else if (char === "'") {
                    buffer = "'";
                    columna++;
                    estado = 5; // Estado: leyendo carácter
                }
                
                // ---- IDENTIFICADORES (IGUAL que tu código anterior) ----
                else if (this.esLetra(char)) {
                    buffer = char;
                    columna++;
                    estado = 2; // Estado: leyendo identificador
                }
                
                // ---- NÚMEROS (IGUAL que tu código anterior) ----
                else if (this.esDigito(char)) {
                    buffer = char;
                    columna++;
                    estado = 3; // Estado: leyendo número
                }
                
                // ---- OPERADORES (NUEVO) ----
                else if (this.esOperador(char)) {
                    buffer = char;
                    columna++;
                    estado = 4; // Estado: leyendo operador
                }
                
                // ---- ESPACIOS (IGUAL que tu código anterior) ----
                else if (this.esEspacio(char)) {
                    if (char === '\t') columna += 4;
                    else if (char === ' ') columna++;
                    else if (char === '\n') {
                        linea++;
                        columna = 1;
                    }
                }
                
                // ---- CENTINELA (IGUAL que tu código anterior) ----
                else if (char === '#') {
                    this.listaTokens.push(new Token('FIN', char, linea, columna));
                    break;
                }
                
                // ---- ERROR LÉXICO (IGUAL que tu código anterior) ----
                else {
                    this.listaErrores.push(
                        new ErrorLexico('Carácter no reconocido', char, linea, columna)
                    );
                    columna++;
                }
            }
            
            // ================================================================
            // ESTADO 1: LEYENDO CADENA (IGUAL que tu código anterior)
            // ================================================================
            else if (estado === 1) {
                if (char === '"') {
                    buffer += '"';
                    columna++;
                    this.listaTokens.push(new Token('LITERAL_CADENA', buffer, linea, columna));
                    buffer = '';
                    estado = 0;
                }
                else if (char === '\n') {
                    // ERROR: Cadena sin cerrar
                    this.listaErrores.push(
                        new ErrorLexico('Cadena sin cerrar', buffer, linea, columna)
                    );
                    buffer = '';
                    linea++;
                    columna = 1;
                    estado = 0;
                }
                else {
                    buffer += char;
                    columna++;
                }
            }
            
            // ================================================================
            // ESTADO 2: LEYENDO IDENTIFICADOR (IGUAL que tu código anterior)
            // ================================================================
            else if (estado === 2) {
                if (this.esLetra(char) || this.esDigito(char)) {
                    buffer += char;
                    columna++;
                }
                else {
                    // Fin del identificador
                    // Verificar si es palabra reservada
                    const tipoPalabra = this.palabrasReservadas[buffer];
                    
                    if (tipoPalabra) {
                        this.listaTokens.push(new Token(tipoPalabra, buffer, linea, columna));
                    } else {
                        this.listaTokens.push(new Token('IDENTIFICADOR', buffer, linea, columna));
                    }
                    
                    buffer = '';
                    estado = 0;
                    index--; // Retroceder para procesar el carácter actual
                }
            }
            
            // ================================================================
            // ESTADO 3: LEYENDO NÚMERO (MEJORADO - ahora soporta decimales)
            // ================================================================
            else if (estado === 3) {
                if (this.esDigito(char)) {
                    buffer += char;
                    columna++;
                }
                else if (char === '.' && !buffer.includes('.')) {
                    // Puede ser un decimal
                    buffer += char;
                    columna++;
                    estado = 6; // Estado: verificando decimal
                }
                else {
                    // Fin del número entero
                    this.listaTokens.push(new Token('LITERAL_ENTERO', buffer, linea, columna));
                    buffer = '';
                    estado = 0;
                    index--;
                }
            }
            
            // ================================================================
            // ESTADO 4: LEYENDO OPERADOR (NUEVO)
            // ================================================================
            else if (estado === 4) {
                const operadorDoble = buffer + char;
                
                // Verificar operadores de dos caracteres (==, !=, <=, >=, ++, --)
                if (['==', '!=', '<=', '>=', '++', '--'].includes(operadorDoble)) {
                    this.listaTokens.push(new Token('OPERADOR', operadorDoble, linea, columna));
                    columna++;
                    buffer = '';
                    estado = 0;
                }
                else if (buffer === '/' && char === '/') {
                    // Comentario de línea
                    buffer = '';
                    estado = 7; // Estado: comentario de línea
                    columna++;
                }
                else if (buffer === '/' && char === '*') {
                    // Comentario de bloque
                    buffer = '';
                    estado = 8; // Estado: comentario de bloque
                    columna++;
                }
                else {
                    // Operador de un solo carácter
                    this.listaTokens.push(new Token('OPERADOR', buffer, linea, columna));
                    buffer = '';
                    estado = 0;
                    index--;
                }
            }
            
            // ================================================================
            // ESTADO 5: LEYENDO CARÁCTER (NUEVO)
            // ================================================================
            else if (estado === 5) {
                if (buffer.length === 1 && char !== "'") {
                    // Primer carácter después de '
                    buffer += char;
                    columna++;
                }
                else if (buffer.length === 2 && char === "'") {
                    // Carácter válido: 'a'
                    buffer += "'";
                    columna++;
                    this.listaTokens.push(new Token('LITERAL_CARACTER', buffer, linea, columna));
                    buffer = '';
                    estado = 0;
                }
                else if (char === '\n' || buffer.length > 2) {
                    // ERROR: Carácter mal formado
                    this.listaErrores.push(
                        new ErrorLexico('Carácter mal formado', buffer, linea, columna)
                    );
                    buffer = '';
                    if (char === '\n') {
                        linea++;
                        columna = 1;
                    }
                    estado = 0;
                }
                else {
                    buffer += char;
                    columna++;
                }
            }
            
            // ================================================================
            // ESTADO 6: VERIFICANDO DECIMAL (NUEVO)
            // ================================================================
            else if (estado === 6) {
                if (this.esDigito(char)) {
                    buffer += char;
                    columna++;
                    estado = 3; // Volver a leer más dígitos
                }
                else {
                    // ERROR: Número decimal inválido (ej: 12.)
                    this.listaErrores.push(
                        new ErrorLexico('Número decimal inválido', buffer, linea, columna)
                    );
                    buffer = '';
                    estado = 0;
                    index--;
                }
            }
            
            // ================================================================
            // ESTADO 7: COMENTARIO DE LÍNEA (NUEVO)
            // ================================================================
            else if (estado === 7) {
                if (char === '\n') {
                    linea++;
                    columna = 1;
                    estado = 0;
                } else {
                    columna++;
                }
                // Los comentarios se ignoran, no se generan tokens
            }
            
            // ================================================================
            // ESTADO 8: COMENTARIO DE BLOQUE (NUEVO)
            // ================================================================
            else if (estado === 8) {
                if (char === '*' && entrada[index + 1] === '/') {
                    index++; // Saltar el '/'
                    columna += 2;
                    estado = 0;
                }
                else if (char === '\n') {
                    linea++;
                    columna = 1;
                }
                else {
                    columna++;
                }
            }
            
            index++;
        }
        
        // ====================================================================
        // PROCESAR BUFFER FINAL (IGUAL que tu código anterior)
        // ====================================================================
        if (buffer && estado !== 0) {
            if (estado === 1 || estado === 5) {
                this.listaErrores.push(
                    new ErrorLexico('Cadena/Carácter sin cerrar', buffer, linea, columna)
                );
            }
            else if (estado === 2) {
                const tipoPalabra = this.palabrasReservadas[buffer];
                if (tipoPalabra) {
                    this.listaTokens.push(new Token(tipoPalabra, buffer, linea, columna));
                } else {
                    this.listaTokens.push(new Token('IDENTIFICADOR', buffer, linea, columna));
                }
            }
            else if (estado === 3) {
                this.listaTokens.push(new Token('LITERAL_ENTERO', buffer, linea, columna));
            }
        }
        
        return {
            tokens: this.listaTokens,
            errores: this.listaErrores
        };
    }
    
    // ========================================================================
    // MÉTODOS DE REPORTE (NUEVOS - para generar HTML)
    // ========================================================================
    
    /**
     * Genera reporte HTML de tokens
     */
    generarReporteTokens() {
        let html = `
            <h2>Reporte de Tokens</h2>
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Lexema</th>
                        <th>Tipo</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.listaTokens.forEach((token, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${token.lexema}</td>
                    <td>${token.tipo}</td>
                    <td>${token.linea}</td>
                    <td>${token.columna}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        return html;
    }
    
    /**
     * Genera reporte HTML de errores léxicos
     */
    generarReporteErrores() {
        if (this.listaErrores.length === 0) {
            return '<h2>No se encontraron errores léxicos</h2>';
        }
        
        let html = `
            <h2>Reporte de Errores Léxicos</h2>
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Error</th>
                        <th>Descripción</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.listaErrores.forEach((error, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${error.lexema}</td>
                    <td>${error.descripcion}</td>
                    <td>${error.linea}</td>
                    <td>${error.columna}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        return html;
    }
}