# LaTeXtoHTML

A lightweight web-based tool that converts LaTeX documents to HTML format, making LaTeX content more accessible through web browsers.

## Features

- Browser-based LaTeX to HTML conversion
- Real-time preview
- Keyboard shortcuts support
- Export to HTML functionality
- Offline usage support

## Why HTML?

- Enhanced accessibility for screen readers
- No LaTeX installation required for viewing
- Easy to share and integrate with web platforms
- Better reading experience on modern browsers

## Getting Started

### Online Usage

1. Visit [LaTeXtoHTML](https://hichipli.github.io/latextohtml)
2. Enter your LaTeX code in the left panel
3. Click "Compile" or use `Ctrl/Cmd + S` to see the preview
4. Export to HTML if needed

### Offline Usage

1. Download or clone this repository
2. All required resources are included in the `lib` directory
3. Open `index.html` in your web browser
4. No internet connection required for basic functionality

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Compile
- `Ctrl/Cmd + /`: Toggle Comment
- `Ctrl/Cmd + F`: Find
- `Alt + P`: Open Preview

## Current Limitations

- Basic implementation supporting only common LaTeX elements
- Limited mobile device support (desktop use recommended)
- Complex LaTeX documents may not render correctly
- Exported HTML may require additional styling for optimal mobile viewing

This is a basic implementation that supports common LaTeX elements. Complex LaTeX documents or advanced features may not render correctly. For full LaTeX functionality, consider 
using [Overleaf](https://www.overleaf.com).

## Development

### Dependencies (Included in lib/)

- CodeMirror for the editor
- MathJax for math rendering
- Font Awesome for icons

### Project Structure

```
latextohtml/
├── css/
│   └── style.css
├── js/
│   ├── latex-parser.js
│   └── main.js
├── lib/
│   ├── css/
│   │   ├── codemirror.min.css
│   │   └── nord.min.css
│   └── js/
│       ├── codemirror.min.js
│       ├── mathjax.js
│       └── stex.min.js
└── index.html
```

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- LaTeX community for their continuous support
- Open source projects that made this tool possible