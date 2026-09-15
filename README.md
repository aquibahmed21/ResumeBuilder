# Resume Builder

A modern, ATS-aware Resume Builder built with React and TypeScript.
Fill in your details once, tailor them to a specific job, and export a polished, screener-friendly resume — entirely in your browser, with no backend and no account.

**Live app:** https://aquibahmed21.github.io/ResumeBuilder

## Features

- **Dynamic Sections:** Add, edit, or remove Education, Experience, Skills, Projects, Awards, References, Languages, and Interests.
- **7 Layouts, including 2 built for ATS:** Classic Two-Column, Timeline, Minimalist, Card-Based, and Compact, plus **ATS Simple** and **ATS Chronological** — single-column, distraction-free layouts designed to parse cleanly through applicant tracking systems. ATS Simple is the default.
- **Job Description Matching:** Paste a job posting or a list of required skills and the app extracts real keywords from it, visibly highlights the ones your resume already covers, and shows a match score plus what's missing — so you can see (and honestly close) the gap before you apply. No hidden or invisible text is ever added; everything stays visible to you and to any reviewer.
- **AI Enhancement Prompt:** One click builds a ready-to-paste prompt — your current resume data, your target job description, and the exact JSON format to reply in — for any AI chat tool (ChatGPT, Claude, etc.). Paste its JSON reply straight back into the app to apply the tailored result. The prompt explicitly instructs the AI to improve wording and emphasis only, never to invent employers, titles, dates, or credentials.
- **Import / Export JSON:** Download your resume data as a `.json` file, re-import it later, or paste JSON directly (handy for bringing an AI's reply back in).
- **Named Version History:** Save multiple timestamped, titled snapshots of your resume (e.g. one per job application) in your browser, browse them, and reload any one into the editor and live preview.
- **Live Preview:** See your resume update instantly as you type, in whichever layout you've picked.
- **PDF Export:** Download a print-ready PDF via your browser's print dialog.
- **Light / Dark Theme:** A toggle in the header switches the app's theme and remembers your choice; the resume preview itself always stays print-accurate (dark text on white), regardless of theme.
- **Autosave:** Your data is saved in your browser's `localStorage` — nothing is sent to a server.
- **Responsive Design:** A focused single-panel view with Edit/Preview tabs on mobile and tablet, and a live side-by-side split view on desktop.

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
2. (Optional) Paste a job description under **Target Job Description**, then click **Compare to Resume** to see your match score, or **Get AI Enhancement Prompt** to have an AI tailor your wording for you.
3. Pick a layout — an ATS-friendly one if you're applying through an online portal, or a more visual one if a person reviews applications first.
4. Click **Update Resume Preview** to render it, then **Download PDF** to export.
5. Use **Save as New Version** to keep a named snapshot for this application, or **Export JSON File** to back up your data outside the browser.

## Folder Structure

```
src/
  components/
    ResumeForm.tsx   # nearly all app logic: form, layouts, matching, import/export, theme
  styles/
    index.css         # reset + design tokens (light/dark palettes)
    App.css            # app chrome: header, panels, form fields, buttons
    Resume.css           # the generated resume itself: layouts, print rules
  images/
  App.tsx
  main.tsx
```

## Customization

- **Layouts:** Add or edit layouts in `renderResume()` in `ResumeForm.tsx`, with matching styles in `src/styles/Resume.css`.
- **Theme colors:** Edit the CSS custom properties in `src/styles/index.css` (`:root` for light, `:root[data-theme="dark"]` for dark) to reskin the app chrome. The resume preview itself is intentionally kept print-accurate and doesn't follow the app theme.

## Privacy

Everything — your resume data, saved versions, and the job descriptions you paste — stays in your browser's local storage on your own device. Nothing is sent to a server by this app. Data only leaves your device if you explicitly export a file, copy JSON to your clipboard, or paste it into a third-party AI tool yourself.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

**Made with ❤️ by [Aquib Ahmed](https://github.com/aquibahmed21)**