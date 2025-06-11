# vimages

**vimages** is a keyboard-first image browser designed with **Vim-style navigation** in mind. Built using [Tauri](https://tauri.app/), [Vite](https://vite.dev/), [React](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/), it emphasizes speed, minimal UI, and efficient workflows for power users.

---

### ✨ Features

- 📁 **File system navigation**: Browse local image folders natively with full directory support  
- **Vim-like cursor logic**: Applied to an image grid layout  
- ⌨️ **Vim-inspired keybindings**:  
  - `hjkl` for directional movement  
  - `gg` / `G` to jump to start/end  
  - `{count}` modifiers for fast movement  
  - `_`, `$` equivalents (`BOL`, `EOL`)  
- ⚡ **Instant navigation**: No mouse required — ever  
- 📦 Cross-platform desktop app powered by Tauri  

---

### 🛠 Tech Stack

- **Tauri**
- **Vite**
- **React**
- **TypeScript**

---

### 🚧 Status

Currently in **early development**:  
- Core keyboard navigation is implemented  
- File browsing and image grid layout are functional  
- UI/UX polish and additional features in progress  

---

### 🧪 Getting Started

1. **Clone the repo**

    ```bash
    git clone https://github.com/yourname/vimages
    cd vimages
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Run the app (development mode)**

    ```bash
    npm run tauri dev
    ```

4. **(Optional) Install the Tauri CLI if you haven’t already**

    ```bash
    cargo install tauri-cli
    ```
