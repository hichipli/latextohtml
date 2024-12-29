let editor;
let previewWindow = null;
let isCompiling = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    setupEventListeners();
    setupShortcuts();
    setupScrollSync();
});

function initializeEditor() {
    editor = CodeMirror(document.getElementById('latex-editor'), {
        mode: 'stex',
        theme: 'nord',
        lineNumbers: true,
        lineWrapping: true,
        autofocus: true,
        indentUnit: 2,
        tabSize: 2,
        matchBrackets: true,
        autoCloseBrackets: true,
        value: `\\documentclass{article}
\\usepackage{amsmath}

\\title{Sample LaTeX Document}
\\author{John Smith \\\\
Department of Computer Science \\\\
University of Example}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This is a sample document demonstrating basic LaTeX formatting and mathematical equations.
\\end{abstract}

\\section{Introduction}
LaTeX is a document preparation system widely used in academia for technical and scientific documentation.

\\section{Mathematical Examples}
Here's a simple equation:
\\[
    E = mc^2
\\]

And a more complex one:
\\begin{equation}
    \\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
\\end{equation}

\\section{Conclusion}
This example shows basic LaTeX formatting including sections, equations, and abstracts.

% \\section*{Acknowledgments}
% We would like to thank the LaTeX community for their continuous support and contributions.

\\acks{We would like to thank the LaTeX community for their continuous support and contributions.}

\\end{document}`
    });
}

function setupEventListeners() {
    document.getElementById('compile-btn').addEventListener('click', () => {
        compileLatex();
        updateNewWindow();
    });
    document.getElementById('new-window-btn').addEventListener('click', openInNewWindow);
    
    // add about dialog event handler
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeBtn = aboutModal.querySelector('.close-btn');
    
    aboutBtn.addEventListener('click', () => {
        aboutModal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });
}

function setupShortcuts() {
    // compile shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            compileLatex();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleComment();
        }
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            openInNewWindow();
        }
    });

    // show shortcuts panel
    const shortcutsBtn = document.getElementById('shortcuts-btn');
    const shortcutsPanel = document.querySelector('.shortcuts-panel');
    
    shortcutsBtn.addEventListener('click', () => {
        shortcutsPanel.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!shortcutsBtn.contains(e.target) && !shortcutsPanel.contains(e.target)) {
            shortcutsPanel.classList.remove('show');
        }
    });
}

function setupScrollSync() {
    const previewContainer = document.querySelector('.preview-container');
    const editorContainer = document.querySelector('.editor-container');
    
    // add line numbers to elements in preview area
    function addLineNumbersToElements() {
        const preview = document.getElementById('preview-content');
        const elements = preview.querySelectorAll('h1, h2, h3, h4, p, .section-heading');
        elements.forEach(el => {
            const text = el.textContent;
            const line = findCorrespondingLine(text);
            if (line !== -1) {
                el.dataset.line = line;
            }
        });
    }

    // find corresponding line number in LaTeX source code
    function findCorrespondingLine(text) {
        const content = editor.getValue();
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(text.trim())) {
                return i;
            }
        }
        return -1;
    }

    // scroll editor when clicking on preview area
    previewContainer.addEventListener('click', (e) => {
        let target = e.target;
        while (target && !target.dataset.line) {
            target = target.parentElement;
        }
        if (target && target.dataset.line) {
            const line = parseInt(target.dataset.line);
            editor.scrollIntoView({line: line, ch: 0}, 100);
        }
    });

    // add line numbers after compiling
    const originalCompileLatex = compileLatex;
    compileLatex = async function() {
        await originalCompileLatex.apply(this, arguments);
        addLineNumbersToElements();
    };
}

function toggleComment() {
    const doc = editor.getDoc();
    const selections = doc.listSelections();
    
    editor.operation(() => {
        for (let sel of selections) {
            const from = sel.from();
            const to = sel.to();
            const lines = [];
            
            for (let i = from.line; i <= to.line; i++) {
                const line = doc.getLine(i);
                lines.push(line.startsWith('%') ? line.substring(1) : '%' + line);
            }
            
            doc.replaceRange(lines.join('\n'), 
                { line: from.line, ch: 0 }, 
                { line: to.line, ch: doc.getLine(to.line).length });
        }
    });
}

async function compileLatex() {
    if (isCompiling) return;
    
    const compileBtn = document.getElementById('compile-btn');
    compileBtn.classList.add('compiling');
    isCompiling = true;

    try {
        const latex = editor.getValue();
        const html = parseLatex(latex);
        await updatePreview(html);
        updateNewWindow();
        
        // show success indicator
        compileBtn.classList.add('compile-success');
        setTimeout(() => {
            compileBtn.classList.remove('compile-success');
        }, 1000);
    } catch (error) {
        console.error('Compilation error:', error);
        showError(error.message);
    } finally {
        compileBtn.classList.remove('compiling');
        isCompiling = false;
    }
}

function updatePreview(html) {
    const preview = document.getElementById('preview-content');
    preview.innerHTML = html;
    if (window.MathJax) {
        MathJax.typesetPromise([preview]).catch(console.error);
    }
}

function openInNewWindow() {
    const latex = editor.getValue();
    const html = parseLatex(latex);
    
    // create full HTML document
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>LaTeX Preview</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="../lib/js/mathjax.js"></script>
            <style>
                :root {
                    --primary: #1a73e8;
                    --text: #202124;
                    --background: #ffffff;
                }
                body {
                    margin: 0;
                    padding: 40px;
                    font-family: 'Times New Roman', Times, serif;
                    line-height: 1.6;
                    color: var(--text);
                    background: var(--background);
                }
                #content-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    border-radius: 8px;
                }
                h1, h2, h3, h4 {
                    color: var(--primary);
                    margin-top: 2em;
                }
                .abstract {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 4px;
                    margin: 2em 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 2em 0;
                }
                th, td {
                    padding: 12px;
                    border: 1px solid #e0e0e0;
                    text-align: left;
                }
                thead {
                    background: #f8f9fa;
                }
                figure {
                    margin: 2em 0;
                    text-align: center;
                }
                .citation {
                    color: var(--primary);
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    #content-container {
                        box-shadow: none;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div id="content-container">${html}</div>
        </body>
        </html>
    `;

    // create URL using Blob
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    previewWindow = window.open(url, '_blank');
}

function updateNewWindow() {
    if (previewWindow && !previewWindow.closed) {
        const latex = editor.getValue();
        const html = parseLatex(latex);
        
        // using document.write will clear all event listeners, so we use innerHTML instead
        if (previewWindow.document.body) {
            const container = previewWindow.document.getElementById('content-container');
            if (container) {
                container.innerHTML = html;
                // re-render math formulas
                if (previewWindow.MathJax) {
                    previewWindow.MathJax.typesetPromise([container]).catch(console.error);
                }
            }
        }
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// add preview panel toggle functionality
function togglePreview() {
    const previewContainer = document.querySelector('.preview-container');
    const editorContainer = document.querySelector('.editor-container');
    
    if (previewContainer.style.display === 'none') {
        previewContainer.style.display = 'block';
        editorContainer.style.flex = '1';
    } else {
        previewContainer.style.display = 'none';
        editorContainer.style.flex = '2';
    }
}

function downloadHTML() {
    const latex = editor.getValue();
    const html = parseLatex(latex);
    const fullHtml = generateFullHTML(html);
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'latex-preview.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateFullHTML(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>LaTeX Preview</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="LaTeX document converted to HTML format using LaTeXtoHTML converter. Optimized for academic papers and mathematical content.">
    <meta name="keywords" content="LaTeX, HTML, academic paper, mathematics, equations, scientific document">
    <meta name="generator" content="LaTeXtoHTML Converter">
    <meta name="robots" content="noindex, follow">
    <title>LaTeX Document | Converted with LaTeXtoHTML</title>
    <script src="../lib/js/mathjax.js"></script>
    <style>
        :root {
            --primary: #1a73e8;
            --text: #202124;
            --background: #ffffff;
        }
        body {
            margin: 0;
            padding: 40px;
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.6;
            color: var(--text);
            background: var(--background);
        }
        #content-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        h1, h2, h3, h4 {
            color: var(--primary);
            margin-top: 2em;
        }
        .abstract {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            margin: 2em 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 2em 0;
        }
        th, td {
            padding: 12px;
            border: 1px solid #e0e0e0;
            text-align: left;
        }
        thead {
            background: #f8f9fa;
        }
        figure {
            margin: 2em 0;
            text-align: center;
        }
        .citation {
            color: var(--primary);
        }
        @media print {
            body {
                padding: 0;
            }
            #content-container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div id="content-container">${content}</div>
    <script>
        // 等待MathJax加载完成后重新渲染数学公式
        window.addEventListener('load', function() {
            if (window.MathJax) {
                MathJax.typesetPromise([document.body]).catch(console.error);
            }
        });
    </script>
</body>
</html>`;
} 