# Studio Light 💡

**Studio Light** is a professional virtual lighting application for your desktop. It turns your screen into a customizable softbox, gradient light, or ring light, perfect for video calls, streaming, or photography.

Updated to **Next.js 14 + TypeScript** for performance, scalability, and ease of deployment.

![Studio Light Preview](/studio-light-preview.png)

## ✨ Features

- **Solid Light:** Adjustable color temperature (Kelvin 1000K-40000K) or custom RGB colors.
- **Gradient Light:** Smoothly blend two colors with adjustable angles and blend amounts.
- **Ring Light:** Simulates a physical ring light with controls for size, thickness, and softness.
- **Quick Presets:** Instant access to standard lighting setups (Warm, Daylight, Cool, Magenta, Green).
- **Wake Lock:** Automatically prevents your screen from sleeping while the light is active.
- **Keyboard Shortcuts:** Professional hotkeys for quick control during streams.
- **Fullscreen Mode:** Immersive lighting experience.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Directory)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** CSS Modules / Global CSS (Custom Design System)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/YOUR_USER/studio-light.git
    cd studio-light
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `F` | Toggle Fullscreen |
| `H` | Hide/Show Control Panel |
| `Space` | Lock/Unlock Controls |
| `1` | Switch to **Solid** Mode |
| `2` | Switch to **Gradient** Mode |
| `3` | Switch to **Ring** Mode |
| `W` | Preset: Warm (3200K) |
| `D` | Preset: Daylight (5600K) |
| `C` | Preset: Cool (6500K) |
| `Arrows` | Move Ring Light |
| `Shift + Arrows` | Move Ring Light (Fast) |

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Vercel will detect the Next.js build settings automatically.
4.  Click **Deploy**.

## 📄 License

MIT License.
