function convertLatexToHtml(latex) {
    // create a basic HTML template
    const template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LaTeX Preview</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
            <style>
                body {
                    max-width: 800px;
                    margin: 2rem auto;
                    padding: 0 1rem;
                    font-family: 'Times New Roman', Times, serif;
                    line-height: 1.6;
                }
                .math {
                    margin: 1rem 0;
                }
            </style>
        </head>
        <body>
            ${parseLatex(latex)}
        </body>
        </html>
    `;
    return template;
}

function parseLatex(latex) {
    // remove comments first
    latex = latex
        .replace(/%.*/g, '')
        .replace(/^\s*[\r\n]/gm, '');

    // handle journal related commands
    let metadata = {
        volume: '',
        year: '',
        workshop: ''
    };

    // extract metadata
    latex = latex.replace(/\\jmlrvolume\{(.*?)\}/g, (_, vol) => {
        metadata.volume = vol;
        return '';
    });
    latex = latex.replace(/\\jmlryear\{(.*?)\}/g, (_, year) => {
        metadata.year = year;
        return '';
    });
    latex = latex.replace(/\\jmlrworkshop\{(.*?)\}/g, (_, workshop) => {
        metadata.workshop = workshop;
        return '';
    });

    // basic LaTeX to HTML conversion
    let html = latex
        // remove unnecessary commands
        .replace(/\\documentclass(\[.*?\])?\{.*?\}/g, '')
        .replace(/\\usepackage(\[.*?\])?\{.*?\}/g, '')
        .replace(/\\newcommand\{.*?\}(\[.*?\])?\{.*?\}/g, '')
        .replace(/\\theorembodyfont\{.*?\}/g, '')
        .replace(/\\theoremheaderfont\{.*?\}/g, '')
        .replace(/\\theorempostheader\{.*?\}/g, '')
        .replace(/\\theoremsep\{.*?\}/g, '')
        .replace(/\\newtheorem\*?\{.*?\}\{.*?\}/g, '')
        .replace(/\\bibliography\{.*?\}/g, '')
        
        // handle document environment
        .replace(/\\begin\{document\}|\\\end\{document\}/g, '')
        
        // remove \maketitle command
        .replace(/\\maketitle/g, '')
        
        // handle title
        .replace(/\\title\[(.*?)\]\{(.*?)\}/g, '<h1 class="document-title">$2</h1>')
        .replace(/\\title\{(.*?)\}/g, '<h1 class="document-title">$1</h1>')
        
        // handle abstract and keywords
        .replace(/\\begin\{abstract\}(.*?)\\end\{abstract\}/gs, 
            '<div class="abstract"><h3>Abstract</h3><p>$1</p></div>')
        .replace(/\\begin\{keywords\}(.*?)\\end\{keywords\}/gs, 
            '<div class="keywords"><h3>Keywords</h3><p>$1</p></div>')
        
        // handle authors and institutions
        .replace(/\\author\{(.*?)\}/g, (match, content) => {
            // handle line breaks, keep format
            let cleanContent = content
                .split('\\\\')
                .map(line => line.trim())
                .filter(line => line)
                .join('<br>');

            return `
                <div class="author">
                    ${cleanContent}
                </div>`;
        })
        .replace(/\\date\{\\today\}/g, () => {
            const date = new Date();
            const options = { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            return `<div class="date">${date.toLocaleDateString('en-US', options)}</div>`;
        })
        .replace(/\\addr\s+(.*?)(?=\\|$)/g, '<div class="institution">$1</div>')
        .replace(/\\AND/g, '')
        
        // handle citations
        .replace(/\\citet\{([^}]+)\}/g, '<span class="author-citation">$1</span>')
        .replace(/\\citep?\{([^}]+)\}/g, '[<span class="citation">$1</span>]')
        .replace(/\\ref\{([^}]+)\}/g, '<span class="reference">$1</span>')
        .replace(/\\label\{([^}]+)\}/g, '<span class="label" id="$1"></span>')
        
        // handle sections
        .replace(/\\section\*?\{(.*?)\}/g, (match, title) => {
            // end previous paragraph before new section, start new paragraph after new section
            return `</p><h2>${title}</h2><p>`;
        })
        .replace(/\\subsection\*?\{(.*?)\}/g, (match, title) => {
            return `</p><h3>${title}</h3><p>`;
        })
        
        // handle paragraphs and special paragraphs
        .replace(/\\par\{\\textbf\{(.*?)\}\}/g, '</p><p class="section-heading"><strong>$1</strong></p><p>')
        .replace(/\\par\{(.*?)\}/g, '</p><p>$1</p>')
        
        // handle math formulas
        .replace(/\$\$(.*?)\$\$/g, '\\[$1\\]')
        .replace(/\$(.*?)\$/g, '\\($1\\)')
        
        // handle emphasis
        .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
        
        // handle lists
        .replace(/\\begin\{itemize\}(.*?)\\end\{itemize\}/gs, (match, content) => {
            return '</p><ul>' + content.replace(/\\item\s+(.*?)(?=\\item|$)/gs, '<li>$1</li>') + '</ul><p>';
        })
        .replace(/\\begin\{enumerate\}(.*?)\\end\{enumerate\}/gs, (match, content) => {
            return '</p><ol>' + content.replace(/\\item\s+(.*?)(?=\\item|$)/gs, '<li>$1</li>') + '</ol><p>';
        })
        
        // handle acknowledgments
        .replace(/\\acks\{(.*?)\}/g, '</p><div class="acknowledgments"><h3>Acknowledgments</h3><p>$1</p></div><p>');

    // handle paragraph separation
    html = html
        .replace(/\n\n+/g, '</p><p>')
        .replace(/<p>\s*<\/p>/g, '')  // remove empty paragraphs
        .replace(/^<\/p>|<p>$/g, '')  // remove extra tags at the beginning and end
        .trim();

    // add metadata to document header
    const metadataHtml = metadata.workshop ? `
        <div class="paper-metadata">
            <div class="workshop">${metadata.workshop}</div>
            <div class="volume-info">Volume ${metadata.volume}, ${metadata.year}</div>
        </div>
    ` : '';

    // add table styles
    const styledHtml = `
        <div class="latex-document">
            <style>
                .latex-document {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                    font-family: 'Times New Roman', Times, serif;
                    line-height: 1.6;
                }
                .paper-metadata {
                    text-align: center;
                    margin-bottom: 2rem;
                    color: #666;
                }
                .workshop {
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                .abstract, .keywords {
                    margin: 2rem 0;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
                .abstract h3, .keywords h3 {
                    margin-top: 0;
                    color: #444;
                }
                .acknowledgments {
                    margin-top: 3rem;
                    border-top: 1px solid #eee;
                    padding-top: 1rem;
                }
                .author-citation {
                    color: #2196F3;
                }
                .author {
                    text-align: center;
                    margin: 1.5rem 0;
                    font-size: 1em;
                    line-height: 1.6;
                    color: #333;
                }
                .author br {
                    display: block;
                    content: "";
                    margin: 0.5em 0;
                }
                .date {
                    text-align: center;
                    color: #666;
                    font-size: 0.95em;
                    margin: 1.5rem 0 2.5rem;
                }
                .document-title {
                    text-align: center;
                    font-size: 1.8em;
                    margin: 2rem 0 1.5rem;
                    color: #2c3e50;
                }
                .email {
                    color: #666;
                    font-size: 0.9em;
                }
                .institution {
                    text-align: center;
                    color: #666;
                    margin-bottom: 2rem;
                }
                .section-heading {
                    margin-top: 2rem;
                    font-size: 1.2em;
                }
                .citation, .reference {
                    color: #2196F3;
                }
                h1, h2, h3, h4 {
                    color: #333;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                p {
                    margin: 1em 0;
                    text-align: justify;
                }
                ul, ol {
                    margin: 1rem 0;
                    padding-left: 2em;
                }
                .latex-figure {
                    margin: 2rem 0;
                    text-align: center;
                }
                table {
                    border-collapse: collapse;
                    margin: 1rem auto;
                    background: white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                caption {
                    margin-bottom: 0.5rem;
                    font-style: italic;
                    color: #666;
                }
                th, td {
                    padding: 0.5rem 1rem;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background: #f5f5f5;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background: #f9f9f9;
                }
            </style>
            ${metadataHtml}
            ${html}
        </div>
    `;

    return styledHtml;
}

// helper function: parse table content
function parseTableContent(content) {
    // handle minipage environment
    return content.replace(/\\begin\{minipage\}\{[^}]*\}(.*?)\\end\{minipage\}/gs, '$1');
}

// helper function: create HTML table
function createTable(format, content) {
    // clean content
    content = content.trim();
    
    // create table structure
    let table = '<table><tbody>';
    
    // replace LaTeX table markers
    content = content
        .replace(/\\toprule/g, '<tr class="header">')
        .replace(/\\midrule/g, '<tr class="divider">')
        .replace(/\\bottomrule/g, '</tr>')
        .replace(/\\\\(?!\})/g, '</td></tr><tr><td>')
        .replace(/&/g, '</td><td>')
        .replace(/\\small\s+/g, '')
        .replace(/\\\s+/g, ' ');
    
    table += '<tr><td>' + content + '</td></tr></tbody></table>';
    
    return table;
} 