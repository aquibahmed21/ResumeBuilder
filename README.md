# Resume Builder

A modern, customizable Resume Builder built with React and TypeScript.  
Easily create, edit, and export professional resumes with multiple layouts and instant preview.

## Features

- **Dynamic Sections:** Add, edit, or remove Education, Experience, Skills, Projects, Awards, References, Languages, and Interests.
- **Live Preview:** Instantly see your resume in multiple layouts (Classic, Timeline, Minimalist, Cards, Compact).
- **PDF Export:** Download your resume as a print-ready PDF.
- **Autosave:** Your data is saved in your browser (localStorage).
- **Responsive Design:** Works on desktop and mobile devices.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
git clone https://github.com/aquibahmed21/ResumeBuilder.git
cd ResumeBuilder
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Usage

1. Fill in your contact information and all relevant sections.
2. Add or remove entries in each section as needed.
3. Choose your preferred resume layout from the controls at the bottom.
4. Click **Download PDF** to export your resume.

## Folder Structure

```
src/
  components/
    ResumeForm.tsx
  styles/
    App.css
    Resume.css
  main.tsx
  ...
```

## Customization

- **Layouts:** Easily switch between different resume layouts.
- **Styling:** Modify `src/styles/App.css` and `src/styles/Resume.css` for custom themes.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

**Made with ❤️ by [Aquib Ahmed](https://github.com/aquibahmed21)**