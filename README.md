# LaTeXtoHTML

A lightweight web-based tool for converting LaTeX documents to HTML format, focusing on basic LaTeX elements and providing real-time preview functionality.

## Features

- Browser-based LaTeX preview without installation
- Real-time compilation and preview
- Enhanced accessibility through HTML output
- Responsive design for all devices
- Keyboard shortcuts for common operations
- Export to HTML functionality

## Getting Started

### Usage

1. Visit [LaTeXtoHTML](https://hichipli.github.io/latextohtml)
2. Enter your LaTeX code in the left panel
3. Click "Compile" or use `Ctrl/Cmd + S` to see the preview
4. Export to HTML if needed

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Compile
- `Ctrl/Cmd + /`: Toggle Comment
- `Ctrl/Cmd + F`: Find
- `Alt + P`: Open Preview

## Limitations

This is a basic implementation that supports common LaTeX elements. Complex LaTeX documents or advanced features may not render correctly. For full LaTeX functionality, consider using [Overleaf](https://www.overleaf.com).

## Development

### Project Structure

latextohtml/
├── css/
│ └── style.css
├── js/
│ ├── latex-parser.js
│ └── main.js
└── index.html

### Dependencies

- CodeMirror for the editor
- MathJax for math rendering
- Font Awesome for icons

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- LaTeX community for their continuous support
- Open source projects that made this tool possible