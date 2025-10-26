
class Traductor {
    constructor(ast) {
        this.ast = ast;
        this.codigoPython = '';
        this.indentacion = 0;
        this.tablaSimbolos = new Map(); // Guarda tipos de variables
    }
    
    // Inicia la traducción
    traducir() {
        if (!this.ast) {
            return '# Error: No hay árbol sintáctico para traducir';
        }
        
        this.codigoPython = '# Traducido de Java a Python\n\n';
        this.traducirNodo(this.ast);
        
        return this.codigoPython.trim();
    }
    
    // Traduce un nodo según su tipo
    traducirNodo(nodo) {
        if (!nodo) return;
        
        switch(nodo.tipo) {
            case 'PROGRAMA':
                this.traducirPrograma(nodo);
                break;
            case 'CLASE':
                this.traducirClase(nodo);
                break;
            case 'METODO_MAIN':
                this.traducirMain(nodo);
                break;
            case 'DECLARACION':
                this.traducirDeclaracion(nodo);
                break;
            case 'ASIGNACION':
                this.traducirAsignacion(nodo);
                break;
            case 'IMPRESION':
                this.traducirImpresion(nodo);
                break;
            case 'IF':
                this.traducirIf(nodo);
                break;
            case 'FOR':
                this.traducirFor(nodo);
                break;
            case 'WHILE':
                this.traducirWhile(nodo);
                break;
            case 'BLOQUE_IF':
            case 'BLOQUE_ELSE':
            case 'BLOQUE_FOR':
            case 'BLOQUE_WHILE':
                this.traducirBloque(nodo);
                break;
        }
    }
    
    // PROGRAMA → Traduce todo el programa
    traducirPrograma(nodo) {
        nodo.hijos.forEach(hijo => this.traducirNodo(hijo));
    }
    
    // CLASE → En Python no se necesita clase para el main
    traducirClase(nodo) {
        // Comentario con el nombre de la clase original
        this.agregarLinea(`# Clase: ${nodo.valor}`);
        nodo.hijos.forEach(hijo => this.traducirNodo(hijo));
    }
    
    // METODO_MAIN → En Python no se necesita main
    traducirMain(nodo) {
        nodo.hijos.forEach(hijo => this.traducirNodo(hijo));
    }
    
    // DECLARACION → int x = 5; → x = 5
    traducirDeclaracion(nodo) {
        const tipo = nodo.hijos[0].valor; // int, double, String, etc.
        const identificador = nodo.hijos[1].valor;
        const expresion = this.traducirExpresion(nodo.hijos[2]);
        
        // Guardar tipo en tabla de símbolos
        this.tablaSimbolos.set(identificador, tipo);
        
        this.agregarLinea(`${identificador} = ${expresion}`);
    }
    
    // ASIGNACION → x = 10; → x = 10
    traducirAsignacion(nodo) {
        const identificador = nodo.hijos[0].valor;
        const expresion = this.traducirExpresion(nodo.hijos[1]);
        
        this.agregarLinea(`${identificador} = ${expresion}`);
    }
    
    // IMPRESION → System.out.println(...) → print(...)
    traducirImpresion(nodo) {
        const expresion = this.traducirExpresion(nodo.hijos[0]);
        this.agregarLinea(`print(${expresion})`);
    }
    
    // IF → if (cond) { } else { }
    traducirIf(nodo) {
        const condicion = this.traducirExpresion(nodo.hijos[0]);
        
        this.agregarLinea(`if ${condicion}:`);
        this.indentacion++;
        
        // Bloque if
        if (nodo.hijos[1]) {
            this.traducirNodo(nodo.hijos[1]);
        } else {
            this.agregarLinea('pass');
        }
        
        this.indentacion--;
        
        // Bloque else (si existe)
        if (nodo.hijos[2]) {
            this.agregarLinea('else:');
            this.indentacion++;
            this.traducirNodo(nodo.hijos[2]);
            this.indentacion--;
        }
    }
    
   // FOR → Traducir a WHILE en Python (no a for...in range)
traducirFor(nodo) {
    const inicializacion = nodo.hijos[0]; // int i = 0
    const condicion = nodo.hijos[1];      // i < 10
    const incremento = nodo.hijos[2];     // i++
    
    // PASO 1: Declarar variable fuera del while
    const variable = inicializacion.hijos[1].valor;
    const valorInicial = this.traducirExpresion(inicializacion.hijos[2]);
    
    this.agregarLinea(`${variable} = ${valorInicial}`);
    
    // PASO 2: while con la condición
    const condicionTexto = this.traducirExpresion(condicion);
    this.agregarLinea(`while ${condicionTexto}:`);
    
    this.indentacion++;
    
    // Bloque for (sentencias)
    if (nodo.hijos[3] && nodo.hijos[3].hijos.length > 0) {
        this.traducirNodo(nodo.hijos[3]);
    } else {
        this.agregarLinea('pass');
    }
    
    // PASO 3: Incremento/Decremento al final del bloque
    const textoIncremento = this.traducirIncrementoFor(incremento);
    this.agregarLinea(textoIncremento);
    
    this.indentacion--;
}

// Traduce el incremento/decremento del for
traducirIncrementoFor(nodo) {
    if (!nodo) return '';
    
    // Caso 1: i++ o i--
    if (nodo.tipo === 'INCREMENTO_POSTFIJO' || nodo.tipo === 'INCREMENTO_PREFIJO') {
        const variable = nodo.hijos[0].valor;
        return nodo.valor === '++' ? `${variable} += 1` : `${variable} -= 1`;
    }
    
    // Caso 2: i = i + 1 o i = i - 1
    if (nodo.tipo === 'ASIGNACION') {
        const variable = nodo.hijos[0].valor;
        const expresion = this.traducirExpresion(nodo.hijos[1]);
        return `${variable} = ${expresion}`;
    }
    
    // Caso 3: Expresión directa (i += 1)
    if (nodo.tipo === 'OPERACION_ARITMETICA') {
        const variable = nodo.hijos[0].valor;
        const operador = nodo.valor;
        const valor = this.traducirExpresion(nodo.hijos[1]);
        
        // i + 1 → i += 1
        if (operador === '+') {
            return `${variable} += ${valor}`;
        } else if (operador === '-') {
            return `${variable} -= ${valor}`;
        }
    }
    
    return '';
}
    // WHILE → while (cond) { } → while cond:
    traducirWhile(nodo) {
        const condicion = this.traducirExpresion(nodo.hijos[0]);
        
        this.agregarLinea(`while ${condicion}:`);
        this.indentacion++;
        
        // Bloque while
        if (nodo.hijos[1]) {
            this.traducirNodo(nodo.hijos[1]);
        } else {
            this.agregarLinea('pass');
        }
        
        this.indentacion--;
    }
    
    // BLOQUE → Traduce bloque de sentencias
    traducirBloque(nodo) {
        if (nodo.hijos.length === 0) {
            this.agregarLinea('pass');
            return;
        }
        
        nodo.hijos.forEach(hijo => this.traducirNodo(hijo));
    }
    
    // EXPRESION → Traduce expresiones (operaciones, literales, etc.)
    traducirExpresion(nodo) {
        if (!nodo) return '';
        
        switch(nodo.tipo) {
            case 'LITERAL_ENTERO':
                return nodo.valor;
                
            case 'LITERAL_DECIMAL':
                return nodo.valor;
                
            case 'LITERAL_CADENA':
                return nodo.valor;
                
            case 'LITERAL_CARACTER':
                return nodo.valor;
                
            case 'LITERAL_BOOLEANO':
                // true → True, false → False
                return nodo.valor === 'true' ? 'True' : 'False';
                
            case 'IDENTIFICADOR':
                return nodo.valor;
                
            case 'OPERACION_ARITMETICA':
                const izq = this.traducirExpresion(nodo.hijos[0]);
                const der = this.traducirExpresion(nodo.hijos[1]);
                return `${izq} ${nodo.valor} ${der}`;
                
            case 'COMPARACION':
                const izqComp = this.traducirExpresion(nodo.hijos[0]);
                const derComp = this.traducirExpresion(nodo.hijos[1]);
                return `${izqComp} ${nodo.valor} ${derComp}`;
                
            case 'OPERACION_LOGICA':
                const izqLog = this.traducirExpresion(nodo.hijos[0]);
                const derLog = this.traducirExpresion(nodo.hijos[1]);
                const operadorPython = nodo.valor === '&&' ? 'and' : 'or';
                return `${izqLog} ${operadorPython} ${derLog}`;
                
            case 'INCREMENTO_POSTFIJO':
            case 'INCREMENTO_PREFIJO':
                const varIncr = nodo.hijos[0].valor;
                const operador = nodo.valor === '++' ? '+= 1' : '-= 1';
                return `${varIncr} ${operador}`;
                
            default:
                return '';
        }
    }
    
    // Agrega una línea con la indentación correcta
    agregarLinea(codigo) {
        const espacios = '    '.repeat(this.indentacion);
        this.codigoPython += espacios + codigo + '\n';
    }
    
    // Genera reporte de la tabla de símbolos
    generarReporteSimbolos() {
        let html = `
            <h2>Tabla de Símbolos</h2>
            <table>
                <thead>
                    <tr>
                        <th>Variable</th>
                        <th>Tipo Java</th>
                        <th>Tipo Python</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.tablaSimbolos.forEach((tipo, variable) => {
            const tipoPython = this.mapearTipoPython(tipo);
            html += `
                <tr>
                    <td>${variable}</td>
                    <td>${tipo}</td>
                    <td>${tipoPython}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        return html;
    }
    
    // Mapea tipos de Java a Python
    mapearTipoPython(tipoJava) {
        const mapa = {
            'int': 'int',
            'double': 'float',
            'String': 'str',
            'char': 'str',
            'boolean': 'bool'
        };
        return mapa[tipoJava] || 'object';
    }
}