
class ErrorSintactico {
    constructor(descripcion, esperado, encontrado, linea, columna) {
        this.tipo = 'Error Sintáctico';
        this.descripcion = descripcion;
        this.esperado = esperado;
        this.encontrado = encontrado;
        this.linea = linea;
        this.columna = columna;
    }
}


class NodoAST {
    constructor(tipo, valor = null, hijos = []) {
        this.tipo = tipo;          // Tipo de nodo (CLASE, METODO, DECLARACION, etc.)
        this.valor = valor;        // Valor asociado (nombre de variable, operador, etc.)
        this.hijos = hijos;        // Nodos hijos
        this.linea = null;         // Línea donde aparece
        this.columna = null;       // Columna donde aparece
    }
    
    agregarHijo(hijo) {
        this.hijos.push(hijo);
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;           // Lista de tokens del Lexer
        this.index = 0;                 // Posición actual en la lista de tokens
        this.errores = [];              // Lista de errores sintácticos
        this.arbolSintactico = null;    // AST resultante
    }
    
  
    tokenActual() {
        if (this.index < this.tokens.length) {
            return this.tokens[this.index];
        }
        return null;
    }
    
    avanzar() {
        this.index++;
    }
    
 
    match(tipoEsperado, lexemaEsperado = null) {
        const token = this.tokenActual();
        
        if (!token) {
            this.errores.push(new ErrorSintactico(
                'Fin inesperado del archivo',
                tipoEsperado,
                'EOF',
                -1, -1
            ));
            return false;
        }
        
        // Verificar tipo de token
        if (token.tipo !== tipoEsperado) {
            this.errores.push(new ErrorSintactico(
                `Se esperaba ${tipoEsperado}`,
                tipoEsperado,
                token.tipo + ' (' + token.lexema + ')',
                token.linea,
                token.columna
            ));
            return false;
        }
        
        // Verificar lexema específico (si se proporcionó)
        if (lexemaEsperado !== null && token.lexema !== lexemaEsperado) {
            this.errores.push(new ErrorSintactico(
                `Se esperaba '${lexemaEsperado}'`,
                lexemaEsperado,
                token.lexema,
                token.linea,
                token.columna
            ));
            return false;
        }
        
        this.avanzar();
        return true;
    }
    
    verificar(tipo, lexema = null) {
        const token = this.tokenActual();
        if (!token) return false;
        
        if (lexema) {
            return token.tipo === tipo && token.lexema === lexema;
        }
        return token.tipo === tipo;
    }
    

    analizar() {
        this.errores = [];
        this.index = 0;
        
        try {
            this.arbolSintactico = this.parsearPrograma();
            
            return {
                ast: this.arbolSintactico,
                errores: this.errores,
                exito: this.errores.length === 0
            };
        } catch (error) {
            this.errores.push(new ErrorSintactico(
                'Error crítico en el análisis',
                'estructura válida',
                error.message,
                -1, -1
            ));
            
            return {
                ast: null,
                errores: this.errores,
                exito: false
            };
        }
    }
    

    parsearPrograma() {
        const raiz = new NodoAST('PROGRAMA');
        
        // Parsear clase
        const clase = this.parsearClase();
        if (clase) {
            raiz.agregarHijo(clase);
        }
        
        // Verificar que no haya tokens extra al final
        const tokenActual = this.tokenActual();
        if (tokenActual && tokenActual.tipo !== 'FIN') {
            this.errores.push(new ErrorSintactico(
                'Contenido inesperado después del cierre de la clase',
                'fin del archivo',
                tokenActual.lexema,
                tokenActual.linea,
                tokenActual.columna
            ));
        }
        
        return raiz;
    }
    
    /**
     * CLASE → public class IDENTIFICADOR { METODO_MAIN }
     */
    parsearClase() {
        const nodoClase = new NodoAST('CLASE');
        
        // public
        if (!this.match('PALABRA_RESERVADA', 'public')) {
            return null;
        }
        
        // class
        if (!this.match('PALABRA_RESERVADA', 'class')) {
            return null;
        }
        
        // IDENTIFICADOR (nombre de la clase)
        const tokenNombre = this.tokenActual();
        if (!this.match('IDENTIFICADOR')) {
            return null;
        }
        nodoClase.valor = tokenNombre.lexema;
        
        // {
        if (!this.match('LLAVE_ABRE')) {
            return null;
        }
        
        // MÉTODO MAIN
        const main = this.parsearMain();
        if (main) {
            nodoClase.agregarHijo(main);
        }
        
        // }
        if (!this.match('LLAVE_CIERRA')) {
            this.errores.push(new ErrorSintactico(
                'Falta llave de cierre de la clase',
                '}',
                this.tokenActual() ? this.tokenActual().lexema : 'EOF',
                this.tokenActual() ? this.tokenActual().linea : -1,
                this.tokenActual() ? this.tokenActual().columna : -1
            ));
        }
        
        return nodoClase;
    }
    
    /**
     * METODO_MAIN → public static void main ( String[] args ) { SENTENCIAS }
     */
    parsearMain() {
    const nodoMain = new NodoAST('METODO_MAIN');
    
    // public
    if (!this.match('PALABRA_RESERVADA', 'public')) {
        return null;
    }
    
    // static
    if (!this.match('PALABRA_RESERVADA', 'static')) {
        return null;
    }
    
    // void
    if (!this.match('PALABRA_RESERVADA', 'void')) {
        return null;
    }
    
    // main
    if (!this.match('PALABRA_RESERVADA', 'main')) {
        return null;
    }
    
    // (
    if (!this.match('PARENTESIS_ABRE')) {
        return null;
    }
    
    // String
    if (!this.match('PALABRA_RESERVADA', 'String')) {
        return null;
    }
    
    // [
    if (!this.match('CORCHETE_ABRE')) {
        return null;
    }
    
    // ]
    if (!this.match('CORCHETE_CIERRA')) {
        return null;
    }
    
    // args (ACEPTA TANTO IDENTIFICADOR COMO PALABRA_RESERVADA)
    const tokenArgs = this.tokenActual();
    if (!tokenArgs || tokenArgs.lexema !== 'args') {
        this.errores.push(new ErrorSintactico(
            'Se esperaba "args" como parámetro del método main',
            'args',
            tokenArgs ? tokenArgs.lexema : 'EOF',
            tokenArgs ? tokenArgs.linea : -1,
            tokenArgs ? tokenArgs.columna : -1
        ));
        return null;
    }

    this.avanzar();
    
    // )
    if (!this.match('PARENTESIS_CIERRA')) {
        return null;
    }
    
    // {
    if (!this.match('LLAVE_ABRE')) {
        return null;
    }
    
    // SENTENCIAS
    while (this.tokenActual() && !this.verificar('LLAVE_CIERRA')) {
        const sentencia = this.parsearSentencia();
        if (sentencia) {
            nodoMain.agregarHijo(sentencia);
        } else {
            this.avanzar();
        }
    }
    
    // }
    if (!this.match('LLAVE_CIERRA')) {
        this.errores.push(new ErrorSintactico(
            'Falta llave de cierre del método main',
            '}',
            this.tokenActual() ? this.tokenActual().lexema : 'EOF',
            this.tokenActual() ? this.tokenActual().linea : -1,
            this.tokenActual() ? this.tokenActual().columna : -1
        ));
    }
    
    return nodoMain;
}
    
    /**
     * SENTENCIA → DECLARACION | ASIGNACION | IMPRESION | IF | FOR | WHILE
     */
    parsearSentencia() {
        const token = this.tokenActual();
        
        if (!token) return null;
        
        // Declaración de variable (int, double, String, char, boolean)
        if (token.tipo === 'PALABRA_RESERVADA' && 
            ['int', 'double', 'String', 'char', 'boolean'].includes(token.lexema)) {
            return this.parsearDeclaracion();
        }
        
        // Asignación (identificador = ...)
        if (token.tipo === 'IDENTIFICADOR') {
            return this.parsearAsignacion();
        }
        
        // System.out.println
        if (token.tipo === 'PALABRA_RESERVADA' && token.lexema === 'System') {
            return this.parsearImpresion();
        }
        
        // if
        if (token.tipo === 'PALABRA_RESERVADA' && token.lexema === 'if') {
            return this.parsearIf();
        }
        
        // for
        if (token.tipo === 'PALABRA_RESERVADA' && token.lexema === 'for') {
            return this.parsearFor();
        }
        
        // while
        if (token.tipo === 'PALABRA_RESERVADA' && token.lexema === 'while') {
            return this.parsearWhile();
        }
        
        // Token no reconocido como inicio de sentencia
        this.errores.push(new ErrorSintactico(
            'Sentencia no reconocida',
            'declaración, asignación o estructura de control',
            token.lexema,
            token.linea,
            token.columna
        ));
        
        return null;
    }
    
    /**
     * DECLARACION → TIPO IDENTIFICADOR = EXPRESION ;
     */
    parsearDeclaracion() {
        const nodoDeclaracion = new NodoAST('DECLARACION');
        
        // TIPO
        const tokenTipo = this.tokenActual();
        this.avanzar();
        const nodoTipo = new NodoAST('TIPO', tokenTipo.lexema);
        nodoDeclaracion.agregarHijo(nodoTipo);
        
        // IDENTIFICADOR
        const tokenId = this.tokenActual();
        if (!this.match('IDENTIFICADOR')) {
            return null;
        }
        const nodoId = new NodoAST('IDENTIFICADOR', tokenId.lexema);
        nodoDeclaracion.agregarHijo(nodoId);
        
        // =
        if (!this.match('OPERADOR', '=')) {
            return null;
        }
        
        // EXPRESION
        const expresion = this.parsearExpresion();
        if (expresion) {
            nodoDeclaracion.agregarHijo(expresion);
        }
        
        // ;
        if (!this.match('PUNTO_COMA')) {
            this.errores.push(new ErrorSintactico(
                'Falta punto y coma al final de la declaración',
                ';',
                this.tokenActual() ? this.tokenActual().lexema : 'EOF',
                tokenId.linea,
                tokenId.columna
            ));
        }
        
        return nodoDeclaracion;
    }
    
    /**
     * ASIGNACION → IDENTIFICADOR = EXPRESION ;
     */
    parsearAsignacion() {
        const nodoAsignacion = new NodoAST('ASIGNACION');
        
        // IDENTIFICADOR
        const tokenId = this.tokenActual();
        this.avanzar();
        const nodoId = new NodoAST('IDENTIFICADOR', tokenId.lexema);
        nodoAsignacion.agregarHijo(nodoId);
        
        // =
        if (!this.match('OPERADOR', '=')) {
            return null;
        }
        
        // EXPRESION
        const expresion = this.parsearExpresion();
        if (expresion) {
            nodoAsignacion.agregarHijo(expresion);
        }
        
        // ;
        if (!this.match('PUNTO_COMA')) {
            this.errores.push(new ErrorSintactico(
                'Falta punto y coma al final de la asignación',
                ';',
                this.tokenActual() ? this.tokenActual().lexema : 'EOF',
                tokenId.linea,
                tokenId.columna
            ));
        }
        
        return nodoAsignacion;
    }
    
    /**
     * IMPRESION → System.out.println ( EXPRESION ) ;
     */
    parsearImpresion() {
        const nodoImpresion = new NodoAST('IMPRESION');
        
        // System
        if (!this.match('PALABRA_RESERVADA', 'System')) {
            return null;
        }
        
        // .
        if (!this.match('PUNTO')) {
            return null;
        }
        
        // out
        if (!this.match('PALABRA_RESERVADA', 'out')) {
            return null;
        }
        
        // .
        if (!this.match('PUNTO')) {
            return null;
        }
        
        // println
        if (!this.match('PALABRA_RESERVADA', 'println')) {
            return null;
        }
        
        // (
        if (!this.match('PARENTESIS_ABRE')) {
            return null;
        }
        
        // EXPRESION
        const expresion = this.parsearExpresion();
        if (expresion) {
            nodoImpresion.agregarHijo(expresion);
        }
        
        // )
        if (!this.match('PARENTESIS_CIERRA')) {
            return null;
        }
        
        // ;
        if (!this.match('PUNTO_COMA')) {
            this.errores.push(new ErrorSintactico(
                'Falta punto y coma al final de println',
                ';',
                this.tokenActual() ? this.tokenActual().lexema : 'EOF',
                -1, -1
            ));
        }
        
        return nodoImpresion;
    }
    
    /**
     * IF → if ( CONDICION ) { SENTENCIAS } [else { SENTENCIAS }]
     */
    parsearIf() {
        const nodoIf = new NodoAST('IF');
        
        // if
        this.avanzar();
        
        // (
        if (!this.match('PARENTESIS_ABRE')) {
            return null;
        }
        
        // CONDICION (expresión)
        const condicion = this.parsearExpresion();
        if (condicion) {
            nodoIf.agregarHijo(condicion);
        }
        
        // )
        if (!this.match('PARENTESIS_CIERRA')) {
            return null;
        }
        
        // {
        if (!this.match('LLAVE_ABRE')) {
            return null;
        }
        
        // SENTENCIAS del if
        const bloqueIf = new NodoAST('BLOQUE_IF');
        while (this.tokenActual() && !this.verificar('LLAVE_CIERRA')) {
            const sentencia = this.parsearSentencia();
            if (sentencia) {
                bloqueIf.agregarHijo(sentencia);
            } else {
                this.avanzar();
            }
        }
        nodoIf.agregarHijo(bloqueIf);
        
        // }
        if (!this.match('LLAVE_CIERRA')) {
            return null;
        }
        
        // else (opcional)
        if (this.verificar('PALABRA_RESERVADA', 'else')) {
            this.avanzar();
            
            // {
            if (!this.match('LLAVE_ABRE')) {
                return null;
            }
            
            // SENTENCIAS del else
            const bloqueElse = new NodoAST('BLOQUE_ELSE');
            while (this.tokenActual() && !this.verificar('LLAVE_CIERRA')) {
                const sentencia = this.parsearSentencia();
                if (sentencia) {
                    bloqueElse.agregarHijo(sentencia);
                } else {
                    this.avanzar();
                }
            }
            nodoIf.agregarHijo(bloqueElse);
            
            // }
            if (!this.match('LLAVE_CIERRA')) {
                return null;
            }
        }
        
        return nodoIf;
    }
    
    /**
     * FOR → for ( INICIALIZACION ; CONDICION ; INCREMENTO ) { SENTENCIAS }
     */
    parsearFor() {
        const nodoFor = new NodoAST('FOR');
        
        // for
        this.avanzar();
        
        // (
        if (!this.match('PARENTESIS_ABRE')) {
            return null;
        }
        
        // INICIALIZACION (int i = 0)
        const inicializacion = this.parsearDeclaracion();
        if (inicializacion) {
            // Remover el nodo hijo PUNTO_COMA de la declaración
            // porque en for ya está el ;
            nodoFor.agregarHijo(inicializacion);
        }
        
        // CONDICION (i < 10)
        const condicion = this.parsearExpresion();
        if (condicion) {
            nodoFor.agregarHijo(condicion);
        }
        
        // ;
        if (!this.match('PUNTO_COMA')) {
            return null;
        }
        
        // INCREMENTO (i++)
        const incremento = this.parsearExpresion();
        if (incremento) {
            nodoFor.agregarHijo(incremento);
        }
        
        // )
        if (!this.match('PARENTESIS_CIERRA')) {
            return null;
        }
        
        // {
        if (!this.match('LLAVE_ABRE')) {
            return null;
        }
        
        // SENTENCIAS
        const bloqueFor = new NodoAST('BLOQUE_FOR');
        while (this.tokenActual() && !this.verificar('LLAVE_CIERRA')) {
            const sentencia = this.parsearSentencia();
            if (sentencia) {
                bloqueFor.agregarHijo(sentencia);
            } else {
                this.avanzar();
            }
        }
        nodoFor.agregarHijo(bloqueFor);
        
        // }
        if (!this.match('LLAVE_CIERRA')) {
            return null;
        }
        
        return nodoFor;
    }
    
    /**
     * WHILE → while ( CONDICION ) { SENTENCIAS }
     */
    parsearWhile() {
        const nodoWhile = new NodoAST('WHILE');
        
        // while
        this.avanzar();
        
        // (
        if (!this.match('PARENTESIS_ABRE')) {
            return null;
        }
        
        // CONDICION
        const condicion = this.parsearExpresion();
        if (condicion) {
            nodoWhile.agregarHijo(condicion);
        }
        
        // )
        if (!this.match('PARENTESIS_CIERRA')) {
            return null;
        }
        
        // {
        if (!this.match('LLAVE_ABRE')) {
            return null;
        }
        
        // SENTENCIAS
        const bloqueWhile = new NodoAST('BLOQUE_WHILE');
        while (this.tokenActual() && !this.verificar('LLAVE_CIERRA')) {
            const sentencia = this.parsearSentencia();
            if (sentencia) {
                bloqueWhile.agregarHijo(sentencia);
            } else {
                this.avanzar();
            }
        }
        nodoWhile.agregarHijo(bloqueWhile);
        
        // }
        if (!this.match('LLAVE_CIERRA')) {
            return null;
        }
        
        return nodoWhile;
    }
    
    /**
     * EXPRESION → Parsea expresiones aritméticas y lógicas
     * Maneja: números, cadenas, identificadores, operaciones
     */
    parsearExpresion() {
        return this.parsearExpresionLogica();
    }
    
    /**
     * EXPRESION_LOGICA → EXPRESION_COMPARACION [OPERADOR_LOGICO EXPRESION_COMPARACION]*
     */
    parsearExpresionLogica() {
        let izquierda = this.parsearExpresionComparacion();
        
        while (this.tokenActual() && 
               this.tokenActual().tipo === 'OPERADOR' &&
               ['&&', '||'].includes(this.tokenActual().lexema)) {
            
            const operador = this.tokenActual().lexema;
            this.avanzar();
            
            const derecha = this.parsearExpresionComparacion();
            
            const nodoOperacion = new NodoAST('OPERACION_LOGICA', operador);
            nodoOperacion.agregarHijo(izquierda);
            nodoOperacion.agregarHijo(derecha);
            
            izquierda = nodoOperacion;
        }
        
        return izquierda;
    }
    
    /**
     * EXPRESION_COMPARACION → EXPRESION_ARITMETICA [OPERADOR_COMPARACION EXPRESION_ARITMETICA]
     */
    parsearExpresionComparacion() {
        let izquierda = this.parsearExpresionAritmetica();
        
        if (this.tokenActual() && 
            this.tokenActual().tipo === 'OPERADOR' &&
            ['==', '!=', '<', '>', '<=', '>='].includes(this.tokenActual().lexema)) {
            
            const operador = this.tokenActual().lexema;
            this.avanzar();
            
            const derecha = this.parsearExpresionAritmetica();
            
            const nodoComparacion = new NodoAST('COMPARACION', operador);
            nodoComparacion.agregarHijo(izquierda);
            nodoComparacion.agregarHijo(derecha);
            
            return nodoComparacion;
        }
        
        return izquierda;
    }
    
    /**
     * EXPRESION_ARITMETICA → TERMINO [OPERADOR_SUMA TERMINO]*
     */
    parsearExpresionAritmetica() {
        let izquierda = this.parsearTermino();
        
        while (this.tokenActual() && 
               this.tokenActual().tipo === 'OPERADOR' &&
               ['+', '-'].includes(this.tokenActual().lexema)) {
            
            const operador = this.tokenActual().lexema;
            this.avanzar();
            
            const derecha = this.parsearTermino();
            
            const nodoOperacion = new NodoAST('OPERACION_ARITMETICA', operador);
            nodoOperacion.agregarHijo(izquierda);
            nodoOperacion.agregarHijo(derecha);
            
            izquierda = nodoOperacion;
        }
        
        return izquierda;
    }
    
    /**
     * TERMINO → FACTOR [OPERADOR_MULTIPLICACION FACTOR]*
     */
    parsearTermino() {
        let izquierda = this.parsearFactor();
        
        while (this.tokenActual() && 
               this.tokenActual().tipo === 'OPERADOR' &&
               ['*', '/', '%'].includes(this.tokenActual().lexema)) {
            
            const operador = this.tokenActual().lexema;
            this.avanzar();
            
            const derecha = this.parsearFactor();
            
            const nodoOperacion = new NodoAST('OPERACION_ARITMETICA', operador);
            nodoOperacion.agregarHijo(izquierda);
            nodoOperacion.agregarHijo(derecha);
            
            izquierda = nodoOperacion;
        }
        
        return izquierda;
    }
    
    /**
     * FACTOR → NUMERO | CADENA | IDENTIFICADOR | ( EXPRESION ) | ++IDENTIFICADOR | IDENTIFICADOR++
     */
    parsearFactor() {
        const token = this.tokenActual();
        
        if (!token) return null;
        
        // Número entero
        if (token.tipo === 'LITERAL_ENTERO') {
            this.avanzar();
            return new NodoAST('LITERAL_ENTERO', token.lexema);
        }
        
        // Número decimal
        if (token.tipo === 'LITERAL_DECIMAL') {
            this.avanzar();
            return new NodoAST('LITERAL_DECIMAL', token.lexema);
        }
        
        // Cadena
        if (token.tipo === 'LITERAL_CADENA') {
            this.avanzar();
            return new NodoAST('LITERAL_CADENA', token.lexema);
        }
        
        // Carácter
        if (token.tipo === 'LITERAL_CARACTER') {
            this.avanzar();
            return new NodoAST('LITERAL_CARACTER', token.lexema);
        }
        
        // Booleano
        if (token.tipo === 'LITERAL_BOOLEANO') {
            this.avanzar();
            return new NodoAST('LITERAL_BOOLEANO', token.lexema);
        }
        
        // Identificador
        if (token.tipo === 'IDENTIFICADOR') {
            this.avanzar();
            const nodoId = new NodoAST('IDENTIFICADOR', token.lexema);
            
            // Verificar si es un incremento/decremento postfijo (i++)
            if (this.tokenActual() && 
                this.tokenActual().tipo === 'OPERADOR' &&
                ['++', '--'].includes(this.tokenActual().lexema)) {
                
                const operador = this.tokenActual().lexema;
                this.avanzar();
                
                const nodoIncremento = new NodoAST('INCREMENTO_POSTFIJO', operador);
                nodoIncremento.agregarHijo(nodoId);
                return nodoIncremento;
            }
            
            return nodoId;
        }
        
        // Incremento/decremento prefijo (++i)
        if (token.tipo === 'OPERADOR' && ['++', '--'].includes(token.lexema)) {
            const operador = token.lexema;
            this.avanzar();
            
            const tokenId = this.tokenActual();
            if (!this.match('IDENTIFICADOR')) {
                return null;
            }
            
            const nodoIncremento = new NodoAST('INCREMENTO_PREFIJO', operador);
            nodoIncremento.agregarHijo(new NodoAST('IDENTIFICADOR', tokenId.lexema));
            return nodoIncremento;
        }
        
        // Expresión entre paréntesis
        if (token.tipo === 'PARENTESIS_ABRE') {
            this.avanzar();
            
            const expresion = this.parsearExpresion();
            
            if (!this.match('PARENTESIS_CIERRA')) {
                return null;
            }
            
            return expresion;
        }
        
        // Token no reconocido como factor
        this.errores.push(new ErrorSintactico(
            'Expresión inválida',
            'número, cadena, identificador o expresión entre paréntesis',
            token.lexema,
            token.linea,
            token.columna
        ));
        
        return null;
    }
    
    // ========================================================================
    // GENERACIÓN DE REPORTES
    // ========================================================================
    
    /**
     * Genera reporte HTML de errores sintácticos
     */
    generarReporteErrores() {
        if (this.errores.length === 0) {
            return '<h2>No se encontraron errores sintácticos</h2>';
        }
        
        let html = `
            <h2>Reporte de Errores Sintácticos</h2>
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Descripción</th>
                        <th>Esperado</th>
                        <th>Encontrado</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.errores.forEach((error, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${error.descripcion}</td>
                    <td>${error.esperado}</td>
                    <td>${error.encontrado}</td>
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
    
    /**
     * Genera representación visual del AST
     */
    generarReporteAST() {
        if (!this.arbolSintactico) {
            return '<h2>No se pudo generar el árbol sintáctico</h2>';
        }
        
        let html = `
            <h2>Árbol de Sintaxis Abstracta (AST)</h2>
            <div class="ast-container">
                <pre>${this.generarTextoAST(this.arbolSintactico, 0)}</pre>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Genera representación en texto del AST
     */
    generarTextoAST(nodo, nivel) {
        if (!nodo) return '';
        
        const indentacion = '  '.repeat(nivel);
        let texto = `${indentacion}${nodo.tipo}`;
        
        if (nodo.valor) {
            texto += `: ${nodo.valor}`;
        }
        
        texto += '\n';
        
        nodo.hijos.forEach(hijo => {
            texto += this.generarTextoAST(hijo, nivel + 1);
        });
        
        return texto;
    }
}