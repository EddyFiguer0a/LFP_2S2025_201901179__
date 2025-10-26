
class GeneradorReportes {

    static generarReporteTokens(tokens) {
        const ventana = window.open('', '_blank', 'width=1000,height=700');
        
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Tokens - JavaTraductor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --color-primary: #2c3e50;
            --color-secondary: #34495e;
            --color-accent: #3498db;
            --color-bg: #ecf0f1;
            --color-white: #ffffff;
            --color-text: #2c3e50;
            --color-border: #bdc3c7;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background-color: var(--color-bg);
            padding: 30px;
            color: var(--color-text);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--color-white);
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: var(--color-primary);
            color: var(--color-white);
            padding: 30px;
            border-bottom: 3px solid var(--color-accent);
        }
        
        .header h1 {
            font-size: 1.8rem;
            font-weight: 300;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 0.9rem;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            padding: 30px;
            background: var(--color-bg);
        }
        
        .stat-card {
            background: var(--color-white);
            padding: 20px;
            border-radius: 4px;
            border-left: 3px solid var(--color-accent);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            font-size: 2em;
            color: var(--color-accent);
            margin-bottom: 5px;
            font-weight: 300;
        }
        
        .stat-card p {
            font-size: 0.85rem;
            color: var(--color-text);
            font-weight: 400;
        }
        
        .content {
            padding: 30px;
        }
        
        h2 {
            font-size: 1.3rem;
            font-weight: 400;
            color: var(--color-primary);
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--color-border);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        thead {
            background: var(--color-primary);
            color: var(--color-white);
        }
        
        th {
            padding: 12px;
            text-align: left;
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--color-border);
            font-size: 0.85rem;
        }
        
        tbody tr:hover {
            background-color: var(--color-bg);
        }
        
        tbody tr:nth-child(even) {
            background-color: #fafafa;
        }
        
        .actions {
            padding: 30px;
            background: var(--color-bg);
            text-align: center;
            border-top: 1px solid var(--color-border);
        }
        
        button {
            background: var(--color-primary);
            color: var(--color-white);
            border: none;
            padding: 12px 30px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            margin: 0 10px;
            transition: all 0.2s ease;
            font-weight: 400;
        }
        
        button:hover {
            background: var(--color-secondary);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .actions {
                display: none;
            }
            
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reporte de Tokens</h1>
            <p>JavaTraductor - Traductor Java a Python</p>
            <p>Generado: ${new Date().toLocaleString('es-GT')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>${tokens.length}</h3>
                <p>Total de Tokens</p>
            </div>
            <div class="stat-card">
                <h3>${new Set(tokens.map(t => t.tipo)).size}</h3>
                <p>Tipos Diferentes</p>
            </div>
            <div class="stat-card">
                <h3>${Math.max(...tokens.map(t => t.linea))}</h3>
                <p>Líneas Analizadas</p>
            </div>
        </div>
        
        <div class="content">
            <h2>REPORTE DE TOKENS:</h2>
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
                    ${tokens.map((token, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td><strong>${this.escaparHTML(token.lexema)}</strong></td>
                            <td>${token.tipo}</td>
                            <td>${token.linea}</td>
                            <td>${token.columna}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="actions">
            <button onclick="descargarHTML()">Descargar HTML</button>
            <button onclick="window.close()">Cerrar</button>
        </div>
    </div>
    
    <script>
        function descargarHTML() {
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_tokens_${new Date().getTime()}.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
        `;
        
        ventana.document.write(html);
        ventana.document.close();
    }
    
    /**
     * REPORTE DE ERRORES
     * Genera tabla HTML con errores léxicos y sintácticos
     */
    static generarReporteErrores(erroresLexicos = [], erroresSintacticos = []) {
        const totalErrores = erroresLexicos.length + erroresSintacticos.length;
        
        if (totalErrores === 0) {
            alert('No hay errores para reportar');
            return;
        }
        
        const ventana = window.open('', '_blank', 'width=1000,height=700');
        
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Errores - JavaTraductor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --color-primary: #e74c3c;
            --color-secondary: #c0392b;
            --color-accent: #e74c3c;
            --color-bg: #ecf0f1;
            --color-white: #ffffff;
            --color-text: #2c3e50;
            --color-border: #bdc3c7;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background-color: var(--color-bg);
            padding: 30px;
            color: var(--color-text);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--color-white);
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: var(--color-primary);
            color: var(--color-white);
            padding: 30px;
            border-bottom: 3px solid var(--color-secondary);
        }
        
        .header h1 {
            font-size: 1.8rem;
            font-weight: 300;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 0.9rem;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            padding: 30px;
            background: var(--color-bg);
        }
        
        .stat-card {
            background: var(--color-white);
            padding: 20px;
            border-radius: 4px;
            border-left: 3px solid var(--color-accent);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            font-size: 2em;
            color: var(--color-accent);
            margin-bottom: 5px;
            font-weight: 300;
        }
        
        .stat-card p {
            font-size: 0.85rem;
            color: var(--color-text);
            font-weight: 400;
        }
        
        .content {
            padding: 30px;
        }
        
        h2 {
            font-size: 1.3rem;
            font-weight: 400;
            color: var(--color-primary);
            margin-bottom: 20px;
            margin-top: 30px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--color-border);
        }
        
        h2:first-of-type {
            margin-top: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        thead {
            background: var(--color-primary);
            color: var(--color-white);
        }
        
        th {
            padding: 12px;
            text-align: left;
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--color-border);
            font-size: 0.85rem;
        }
        
        tbody tr:hover {
            background-color: #fff3f3;
        }
        
        .actions {
            padding: 30px;
            background: var(--color-bg);
            text-align: center;
            border-top: 1px solid var(--color-border);
        }
        
        button {
            background: var(--color-primary);
            color: var(--color-white);
            border: none;
            padding: 12px 30px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            margin: 0 10px;
            transition: all 0.2s ease;
            font-weight: 400;
        }
        
        button:hover {
            background: var(--color-secondary);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .actions {
                display: none;
            }
            
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1> Reporte de Errores</h1>
            <p>JavaTraductor - Traductor Java a Python</p>
            <p>Generado: ${new Date().toLocaleString('es-GT')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>${totalErrores}</h3>
                <p>Total de Errores</p>
            </div>
            <div class="stat-card">
                <h3>${erroresLexicos.length}</h3>
                <p>Errores Léxicos</p>
            </div>
            <div class="stat-card">
                <h3>${erroresSintacticos.length}</h3>
                <p>Errores Sintácticos</p>
            </div>
        </div>
        
        <div class="content">
            ${erroresLexicos.length > 0 ? `
                <h2>REPORTE DE ERRORES LÉXICOS:</h2>
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
                        ${erroresLexicos.map((error, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${this.escaparHTML(error.lexema)}</strong></td>
                                <td>${error.descripcion}</td>
                                <td>${error.linea}</td>
                                <td>${error.columna}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : ''}
            
            ${erroresSintacticos.length > 0 ? `
                <h2>REPORTE DE ERRORES SINTÁCTICOS:</h2>
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
                        ${erroresSintacticos.map((error, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${this.escaparHTML(error.encontrado)}</strong></td>
                                <td>${error.descripcion}</td>
                                <td>${error.linea}</td>
                                <td>${error.columna}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : ''}
        </div>
        
        <div class="actions">
            <button onclick="descargarHTML()">Descargar HTML</button>
            <button onclick="window.close()">Cerrar</button>
        </div>
    </div>
    
    <script>
        function descargarHTML() {
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_errores_${new Date().getTime()}.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
        `;
        
        ventana.document.write(html);
        ventana.document.close();
    }
    
    /**
     * Escapa caracteres HTML para evitar inyección
     */
    static escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
}