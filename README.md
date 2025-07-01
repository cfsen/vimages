# vimages

**vimages** is a keyboard-first image browser designed with **Vim-style navigation**, targeting power users who want lightning-fast image browsing without ever touching a mouse.

---

## ✨ Features

- 📁 **File system navigation**: Browse local image folders with full directory support  
- 🎯 **Vim-like cursor logic**: Applied to an intuitive image grid layout  
- ⚡ **Instant navigation**: Zero mouse dependency — pure keyboard efficiency  
- 🖼️ **High-performance image rendering**: Fast thumbnail generation with caching
- 📦 **Cross-platform desktop app** powered by Tauri  

---

## 🛠 Tech Stack

- **[Tauri](https://tauri.app/)** - Rust-powered desktop framework
- **[Vite](https://vite.dev/)**
- **[React](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Rust](https://www.rust-lang.org/)**
- **[Axum](https://docs.rs/axum/latest/axum/)**

---

## 🚧 Current Status

**Version 0.1.0** - Early development release with core functionality implemented.

### ✅ What's Working
- **Image Display**: Performant binary delivery with fullscreen viewing
- **Thumbnail System**: Thumbnail generation and caching
- **File System**: Full directory browsing capabilities
- **Keyboard Navigation**:
  - **Normal Mode**: 
    - Movement: `hjkl` with repeat count support
    - Word navigation: `w`, `b` with repeat support
    - Jump commands: `gg` (start), `G` (end), `_` (line start), `$` (line end)
  - **Command Mode**:
    - `:q` - Quit application
    - `:e [path]` - Open directory
    - `:set imgscale [number]` - Set thumbnail scale in grid view

### ⚠️ Known Limitations
- Basic UI/UX (improvements planned for v0.2.0)
- Limited error handling and user feedback
- No persistent configuration yet

---

## 🗺️ Roadmap

- **✅ v0.1.0**: MVP/POC - Basic functionality, performant pipelines, extensible architecture
- **👉 v0.2.0**: UX/UI improvements, persistent config, thumbnail cache management, expanded command mode
- **🔮 v0.3.0**: File management operations (move, copy, delete, rename)

---

## 🧪 Getting Started

> **⚠️ Development Warning**: vimages is in early development. Features may be incomplete or unstable.

### Prerequisites
- Node.js
- Rust and Cargo
- Platform-specific dependencies for Tauri ([see Tauri docs](https://v2.tauri.app/start/prerequisites/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cfsen/vimages
   cd vimages
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

4. **Optional: Install Tauri CLI globally**
   ```bash
   cargo install tauri-cli
   ```

---

## 🎯 Quick Start Guide

Once running:
1. Use `:e /path/to/images` to navigate to an image directory
2. Navigate with `hjkl` or arrow keys
3. Swap between the image grid and directory browser with `Tab`
4. Press `Enter` to view images fullscreen
5. Use `gg` to jump to first image, `G` for last
6. Type `:q` to quit


