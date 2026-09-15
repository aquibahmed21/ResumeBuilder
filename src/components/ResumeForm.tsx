import React, { useState, useEffect, useRef } from 'react';
import '../styles/App.css';
import '../styles/Resume.css';

// --- Types ---
interface EducationEntry { date: string; institution: string; degree: string; highlights: string; }
interface ExperienceEntry { date: string; position: string; company: string; location: string; highlights: string; }
interface SkillEntry { name: string; items: string; }
interface ProjectEntry { name: string; description: string; highlights: string; }
interface AwardEntry { name: string; date: string; organization: string; credentials: string; description: string; }
interface ReferenceEntry { name: string; contact: string; }
interface LanguageEntry { name: string; proficiency: string; }

interface ResumeData {
  contact: {
    name: string;
    location: string;
    email: string;
    phone: string;
    website: string;
    linkedin: string;
    github: string;
  };
  sections: {
    summary: string;
    education: EducationEntry[];
    experience: ExperienceEntry[];
    skills: SkillEntry[];
    projects: ProjectEntry[];
    awards: AwardEntry[];
    references: ReferenceEntry[];
    languages: LanguageEntry[];
    interests: string;
  };
}

// A named, timestamped snapshot of a full resume — lets someone keep several
// tailored copies (e.g. one per job application) side by side in the browser.
interface ResumeVersion {
  id: string;
  title: string;
  savedAt: number;
  data: ResumeData;
}

const VERSIONS_STORAGE_KEY = 'resumeVersions';

const loadVersionsFromStorage = (): ResumeVersion[] => {
  try {
    const raw = localStorage.getItem(VERSIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatSavedAt = (timestamp: number): string =>
  new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

// --- Job Matching Helpers ---
// Generic filler words that show up in almost any job post; excluding them
// keeps the extracted keyword list focused on actual skills/requirements.
const JD_STOPWORDS = new Set([
  'the', 'and', 'a', 'an', 'to', 'of', 'in', 'for', 'on', 'with', 'as', 'is', 'are', 'be',
  'or', 'that', 'this', 'will', 'you', 'your', 'we', 'our', 'us', 'their', 'they', 'it', 'its',
  'at', 'by', 'from', 'into', 'than', 'then', 'but', 'not', 'have', 'has', 'had', 'can', 'may',
  'must', 'should', 'would', 'could', 'also', 'etc', 'including', 'include', 'includes',
  'strong', 'ability', 'abilities', 'years', 'year', 'experience', 'experienced', 'role', 'job',
  'work', 'working', 'team', 'teams', 'company', 'looking', 'required', 'requirement',
  'requirements', 'responsibilities', 'responsible', 'preferred', 'plus', 'across', 'within',
  'using', 'use', 'used', 'other', 'all', 'any', 'who', 'what', 'when', 'where', 'how', 'new',
  // Common filler that shows up in scraped/footer text around a pasted job
  // post, rather than in the actual requirements.
  'more', 'check', 'out', 'want', 'let', 'know', 'writing', 'template', 'customized',
  'applying', 'tips', 'posting', 'need', 'if', 'get', 'here', 'about', 'like', 'such',
  'make', 'take', 'ensure', 'help', 'both', 'each', 'per', 'up', 'down', 'over', 'under',
  'read', 'more', 'learn', 'apply', 'today', 'best', 'good', 'great',
]);

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Pulls a de-duplicated list of candidate skill/requirement keywords out of a
// pasted job description, keeping tokens like "c++", "c#" and "node.js" intact.
// URLs and citation markers are stripped first (job posts pasted from the web
// often carry footer links), and the result is capped to the most-repeated
// terms so one long posting doesn't produce an unusably huge keyword list.
const MAX_KEYWORDS = 40;

function extractKeywords(jobDescriptionText: string): string[] {
  if (!jobDescriptionText.trim()) return [];
  const cleaned = jobDescriptionText
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\[\d+\]/g, ' ');
  const counts = new Map<string, number>();
  cleaned
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .map((w) => w.replace(/^\.+|\.+$/g, ''))
    .filter((w) => w.length > 2 && !/^\d+$/.test(w) && !JD_STOPWORDS.has(w))
    .forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_KEYWORDS)
    .map(([word]) => word);
}

// Wraps whole-word matches of any keyword in <mark> so they're visibly
// highlighted in the rendered resume (never hidden/invisible).
function highlightKeywords(text: string, keywords: string[]): string {
  if (!text || keywords.length === 0) return text;
  const pattern = new RegExp(
    `\\b(${[...keywords].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|')})\\b`,
    'gi'
  );
  return text.replace(pattern, '<mark class="jd-match">$1</mark>');
}

// Compares the target keywords against the resume's actual content and
// reports what genuinely matches vs. what's missing, plus a % score.
function computeJobMatch(data: ResumeData, keywords: string[]): { matched: string[]; missing: string[]; score: number } {
  const haystack = [
    data.sections.summary,
    ...data.sections.experience.flatMap((e) => [e.position, e.company, e.highlights]),
    ...data.sections.skills.flatMap((s) => [s.name, s.items]),
    ...data.sections.projects.flatMap((p) => [p.name, p.description, p.highlights]),
    ...data.sections.awards.flatMap((a) => [a.name, a.description]),
    ...data.sections.education.flatMap((ed) => [ed.degree, ed.highlights]),
    data.sections.interests,
  ]
    .join(' ')
    .toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];
  keywords.forEach((k) => {
    const re = new RegExp(`\\b${escapeRegExp(k)}\\b`, 'i');
    (re.test(haystack) ? matched : missing).push(k);
  });
  const score = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
  return { matched, missing, score };
}

// --- Main Component ---
const ResumeForm: React.FC = () => {
  // --- State ---
  const [contact, setContact] = useState({
    name: '', location: '', email: '', phone: '', website: '', linkedin: '', github: '',
  });
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [awards, setAwards] = useState<AwardEntry[]>([]);
  const [references, setReferences] = useState<ReferenceEntry[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [interests, setInterests] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobMatch, setJobMatch] = useState<{ matched: string[]; missing: string[]; score: number } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  // Import / export / local-cache state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pasteJsonText, setPasteJsonText] = useState('');

  // Named, timestamped resume versions (e.g. one per job application)
  const [versionTitle, setVersionTitle] = useState('');
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // Controls which panel is visible on mobile/tablet, where editor and
  // preview can't comfortably sit side by side.
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  // Light/dark theme for the app chrome — the resume preview itself always
  // stays paper-white since that's what gets printed/exported. Defaults to
  // the OS preference, then remembers whatever the user picks.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // localStorage unavailable — fall through to system preference
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore — theme just won't persist across reloads
    }
  }, [theme]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);
  const feedbackTimer = useRef<number | null>(null);

  const showFeedback = (type: 'success' | 'info', message: string) => {
    setFeedback({ type, message });
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 3500);
  };

  const [resumeData, setResumeData] = useState<ResumeData>({
    contact,
    sections: {
      summary,
      education,
      experience,
      skills,
      projects,
      awards,
      references,
      languages,
      interests,
    },
  });

  // --- Load from localStorage ---
  useEffect(() => {
    // const storedData = localStorage.getItem('resumeData');
    const storedData = JSON.stringify({
      "contact": {
        "name": "Rahul Sharma",
        "location": "Bangalore, Karnataka, India",
        "email": "rahul.sharma21@gmail.com",
        "phone": "+91 98765 43210",
        "website": "www.rahulsharma.dev",
        "linkedin": "linkedin.com/in/rahulsharma",
        "github": "github.com/rahulsharma21"
      },
      "sections": {
        "summary": "Senior Software Engineer with 10+ years of experience designing and building scalable web applications. Skilled in both frontend and backend development, passionate about clean code, cloud computing, and mentoring junior engineers.",
        "education": [
          { "date": "Sept 2000 - May 2003", "institution": "Bangalore University", "degree": "B.C.A.", "highlights": "Bachelor of Computer Applications with distinction" },
          { "date": "July 2003 - May 2005", "institution": "Christ University, Bangalore", "degree": "M.C.A.", "highlights": "Master of Computer Applications with focus on Distributed Systems" }
        ],
        "experience": [
          { "date": "Sept 2015 - Present", "position": "Senior Software Engineer", "company": "Facebook (Meta)", "location": "Menlo Park, CA", "highlights": "Led development of scalable React-based web applications; collaborated with cross-functional teams; mentored junior developers; optimized system performance by 30%." },
          { "date": "Jun 2010 - Aug 2015", "position": "Software Engineer", "company": "Infosys", "location": "Bangalore, India", "highlights": "Developed enterprise-level applications in Java and Node.js; implemented RESTful APIs; enhanced database performance using SQL optimization techniques." }
        ],
        "skills": [
          { "name": "Frontend", "items": "HTML5, CSS3, JavaScript, React.js, Angular" },
          { "name": "Backend", "items": "Node.js, Express.js, Python, Java, REST APIs" },
          { "name": "Databases", "items": "MySQL, MongoDB, PostgreSQL" },
          { "name": "Cloud & DevOps", "items": "AWS, Docker, Kubernetes, Git, CI/CD" }
        ],
        "projects": [
          { "name": "Smart Expense Tracker", "description": "A full-stack web app for managing personal finances with real-time analytics and cloud sync.", "highlights": "Implemented authentication, data visualization using D3.js, and deployed on AWS." },
          { "name": "E-commerce Platform", "description": "Scalable e-commerce site supporting 100k+ concurrent users.", "highlights": "Built with Node.js and React; integrated payment gateways and inventory management." }
        ],
        "awards": [
          { "name": "Employee of the Year", "date": "2019", "organization": "Facebook", "description": "Recognized for outstanding leadership and contributions to the Ads Engineering team.", "credentials": "Certificate of Appreciation" },
          { "name": "Best Innovation Award", "date": "2013", "organization": "Infosys", "description": "Awarded for creating an internal automation tool reducing manual QA efforts by 40%.", "credentials": "Certificate of Appreciation" }
        ],
        "references": [
          { "name": "John Doe", "contact": "john.doe@email.com" },
          { "name": "Jane Smith", "contact": "jane.smith@email.com" }
        ],
        "languages": [
          { "name": "English", "proficiency": "Native" },
          { "name": "Hindi", "proficiency": "Fluent" },
          { "name": "Kannada", "proficiency": "Intermediate" }
        ],
        "interests": "Hiking, Reading Tech Blogs, Open-source Contribution"
      }
    });
    if (storedData) {
      try {
        const normalized = normalizeResumeData(JSON.parse(storedData));
        applyResumeData(normalized);
        renderResume(normalized);
      } catch (error) {
        console.error('Failed to parse stored resume data', error);
      }
    }
  }, []);

  // Fills in sane defaults for any missing field, so a slightly-off AI
  // response, hand-edited file, or older export doesn't crash the app.
  const normalizeResumeData = (parsed: any): ResumeData => {
    const c = parsed?.contact ?? {};
    const s = parsed?.sections ?? {};
    return {
      contact: {
        name: c.name ?? '',
        location: c.location ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        website: c.website ?? '',
        linkedin: c.linkedin ?? '',
        github: c.github ?? '',
      },
      sections: {
        summary: s.summary ?? '',
        education: Array.isArray(s.education) ? s.education : [],
        experience: Array.isArray(s.experience) ? s.experience : [],
        skills: Array.isArray(s.skills) ? s.skills : [],
        projects: Array.isArray(s.projects) ? s.projects : [],
        awards: Array.isArray(s.awards) ? s.awards : [],
        references: Array.isArray(s.references) ? s.references : [],
        languages: Array.isArray(s.languages) ? s.languages : [],
        interests: s.interests ?? '',
      },
    };
  };

  const applyResumeData = (data: ResumeData) => {
    setContact(data.contact);
    setSummary(data.sections.summary);
    setEducation(data.sections.education);
    setExperience(data.sections.experience);
    setSkills(data.sections.skills);
    setProjects(data.sections.projects);
    setAwards(data.sections.awards);
    setReferences(data.sections.references);
    setLanguages(data.sections.languages);
    setInterests(data.sections.interests);
    setResumeData(data);
  };

  // --- Section Helpers ---
  const addEntry = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, entry: T) =>
    setter((prev) => [...prev, entry]);
  const updateEntry = <T,>(
    index: number,
    field: keyof T,
    value: string,
    entries: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const updated = [...entries];
    updated[index][field] = value as T[keyof T];
    setter(updated);
  };
  const removeEntry = <T,>(
    index: number,
    entries: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const updated = entries.filter((_, i) => i !== index);
    setter(updated);
  };

  const buildResumeData = (): ResumeData => ({
    contact,
    sections: {
      summary,
      education,
      experience,
      skills,
      projects,
      awards,
      references,
      languages,
      interests,
    },
  });

  // --- Form Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = buildResumeData();
    setResumeData(data);
    localStorage.setItem('resumeData', JSON.stringify(data, null, 2));
    renderResume(data);
    showFeedback('success', 'Resume preview updated.');
    setMobileView('preview');
  };

  const handleCheckMatch = () => {
    const keywords = extractKeywords(jobDescription);
    if (keywords.length === 0) {
      showFeedback('info', 'Paste a job description or a few required skills first.');
      setJobMatch(null);
      return;
    }
    const data = buildResumeData();
    setJobMatch(computeJobMatch(data, keywords));
  };

  const handleCopyJson = async () => {
    const data = buildResumeData();
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      showFeedback('success', 'Resume JSON copied to clipboard.');
    } catch {
      showFeedback('info', 'Could not access the clipboard — please copy manually.');
    }
  };

  // Parses resume JSON from any source (file, paste, cache), loads it into
  // the form, and refreshes the preview immediately.
  const importJsonText = (text: string, sourceLabel: string): boolean => {
    try {
      const normalized = normalizeResumeData(JSON.parse(text));
      applyResumeData(normalized);
      renderResume(normalized);
      showFeedback('success', `Loaded resume data from ${sourceLabel}.`);
      setMobileView('preview');
      return true;
    } catch {
      showFeedback('info', `That doesn't look like valid resume JSON.`);
      return false;
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importJsonText(String(reader.result ?? ''), `"${file.name}"`);
    reader.onerror = () => showFeedback('info', 'Could not read that file.');
    reader.readAsText(file);
    e.target.value = ''; // allow re-selecting the same file later
  };

  const handleApplyPastedJson = () => {
    if (!pasteJsonText.trim()) {
      showFeedback('info', 'Paste some resume JSON first.');
      return;
    }
    if (importJsonText(pasteJsonText, 'the pasted JSON')) {
      setPasteJsonText('');
    }
  };

  const handleExportJson = () => {
    const data = buildResumeData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (contact.name || 'resume').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    a.href = url;
    a.download = `${safeName || 'resume'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback('success', 'Resume JSON downloaded.');
  };

  const handleToggleVersions = () => {
    if (!showVersions) setVersions(loadVersionsFromStorage());
    setShowVersions((v) => !v);
  };

  const handleSaveVersion = () => {
    const data = buildResumeData();
    // The saved-at date is already shown separately below the title, so the
    // default (when no title is given) doesn't need to repeat it.
    const title = versionTitle.trim() || contact.name.trim() || 'Untitled Resume';
    const entry: ResumeVersion = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      savedAt: Date.now(),
      data,
    };
    const updated = [entry, ...loadVersionsFromStorage()];
    try {
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(updated));
      setVersions(updated);
      setShowVersions(true);
      setVersionTitle('');
      showFeedback('success', `Saved as "${title}".`);
    } catch {
      showFeedback('info', 'Could not save — your browser storage may be full.');
    }
  };

  const handleLoadVersion = (version: ResumeVersion) => {
    const normalized = normalizeResumeData(version.data);
    applyResumeData(normalized);
    renderResume(normalized);
    showFeedback('success', `Loaded "${version.title}".`);
    setMobileView('preview');
  };

  const handleDeleteVersion = (id: string, title: string) => {
    const updated = versions.filter((v) => v.id !== id);
    try {
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore — worst case the deleted entry reappears on next load
    }
    setVersions(updated);
    showFeedback('info', `Deleted "${title}".`);
  };

  // Builds a copy-pasteable prompt for any AI chat tool: the current resume
  // data, the target job (if any), and the exact JSON shape to reply in, so
  // the response can be pasted straight back in via "Apply pasted JSON".
  const buildAiPrompt = (): string => {
    const data = buildResumeData();
    const schema = `{
  "contact": { "name": "", "location": "", "email": "", "phone": "", "website": "", "linkedin": "", "github": "" },
  "sections": {
    "summary": "",
    "education": [{ "date": "", "institution": "", "degree": "", "highlights": "" }],
    "experience": [{ "date": "", "position": "", "company": "", "location": "", "highlights": "" }],
    "skills": [{ "name": "", "items": "" }],
    "projects": [{ "name": "", "description": "", "highlights": "" }],
    "awards": [{ "name": "", "date": "", "organization": "", "credentials": "", "description": "" }],
    "references": [{ "name": "", "contact": "" }],
    "languages": [{ "name": "", "proficiency": "" }],
    "interests": ""
  }
}`;
    return [
      'You are an expert resume writer. Improve and tailor the resume data below.',
      '',
      jobDescription.trim()
        ? `Target job description / required skills:\n"""\n${jobDescription.trim()}\n"""\n`
        : '(No specific job description was given — improve the resume generally.)\n',
      'Instructions:',
      '- Rewrite "summary" and each "highlights" field to be more specific, quantified, and impactful, naturally emphasizing skills/experience that genuinely match the target job.',
      '- You may reorder or regroup existing skills, tighten wording, and add closely related synonyms for tools the person already demonstrably knows.',
      "- Do NOT invent employers, job titles, dates, degrees, certifications, or achievements that aren't supported by the data given — only rephrase, reorganize, and elaborate on what is already true.",
      '- Keep every field present in the output, even if empty ("" or []), with the exact same keys and nesting.',
      '- Reply with ONLY raw JSON in exactly this structure — no markdown code fences, no explanation before or after it:',
      schema,
      '',
      'Current resume data to improve:',
      JSON.stringify(data, null, 2),
    ].join('\n');
  };

  const handleGenerateAiPrompt = async () => {
    const prompt = buildAiPrompt();
    setAiPrompt(prompt);
    try {
      await navigator.clipboard.writeText(prompt);
      showFeedback('success', 'AI prompt copied — paste it into any AI chat, then bring its JSON reply back here.');
    } catch {
      showFeedback('info', 'Prompt ready below — copy it manually.');
    }
  };

  function renderResume(data: any): void {
    const resume = document.getElementById("resume")!;
    const checkbox = (document.querySelector("input[name=layout]:checked") as HTMLInputElement)! || (document.querySelector("input[name=layout]:first-child") as HTMLInputElement)!;
    if (!checkbox.checked)
      checkbox.checked = true;
    const layout = checkbox.value;
    let html = "";

    // --- Job description matching (visible highlighting only) ---
    const keywords = extractKeywords(jobDescription);
    const hl = (text: string) => highlightKeywords(text, keywords);

    // Header common
    const header = `
        <header>
          <h1>${data.contact.name}</h1>
          <p>${data.contact.location}</p>
          <p>
            Email: <a href="mailto:${data.contact.email}">${data.contact.email}</a> |
            Phone: <a href="tel:${data.contact.phone}">${data.contact.phone}</a>
          </p>
          <p>
            Website: <a href="${data.contact.website}" target="_blank">${data.contact.website}</a> |
            LinkedIn: <a href="${data.contact.linkedin}" target="_blank">${data.contact.linkedin}</a> |
            GitHub: <a href="${data.contact.github}" target="_blank">${data.contact.github}</a>
          </p>
        </header>
      `;

    // Sections
    const summary = `<section><h2>Summary</h2><p>${hl(data.sections.summary)}</p></section>`;

    const education = `<section><h2>Education</h2>${data.sections.education.map((e: EducationEntry) => `
        <article><h3>${e.degree}</h3><p>${e.institution} (${e.date})</p><p>${hl(e.highlights)}</p></article>
      `).join("")}</section>`;

    const experience = `<section><h2>Experience</h2>${data.sections.experience.map((exp: ExperienceEntry) => `
        <article><h3>${exp.position}</h3><p>${exp.company}, ${exp.location} (${exp.date})</p><p>${hl(exp.highlights)}</p></article>
      `).join("")}</section>`;

    const skills = `<section><h2>Skills</h2><ul>${data.sections.skills.map((s: SkillEntry) => `
        <li><strong>${s.name}:</strong> ${hl(s.items)}</li>`).join("")}</ul></section>`;

    const projects = `<section><h2>Projects</h2>${data.sections.projects.map((p: ProjectEntry) => `
        <article><h3>${p.name}</h3><p>${hl(p.description)}</p><p>${hl(p.highlights)}</p></article>
      `).join("")}</section>`;

    const awards = `<section><h2>Awards</h2>${data.sections.awards.map((a: AwardEntry) => `
        <article><h3>${a.name}</h3><p>${a.organization} (${a.date})</p><p>${hl(a.description)}</p></article>
      `).join("")}</section>`;

    const languages = `<section><h2>Languages</h2><ul>${data.sections.languages.map((l: LanguageEntry) => `<li>${l.name} - ${l.proficiency}</li>`).join("")}</ul></section>`;

    const interests = `<section><h2>Interests</h2><p>${hl(data.sections.interests)}</p></section>`;

    // Visible job-match summary: an honest score plus which real keywords
    // matched vs. are missing, so you can decide what to genuinely add.
    let matchPanel = "";
    if (keywords.length > 0) {
      const { matched, missing, score } = computeJobMatch(data, keywords);
      const chips = (list: string[], cls: string) =>
        list.map((k) => `<span class="jd-chip ${cls}">${k}</span>`).join("");
      matchPanel = `
        <section class="jd-match-panel">
          <h2>Job Match: ${score}%</h2>
          ${matched.length ? `<p class="jd-chip-group-label"><strong>Matched in your resume:</strong></p><div class="jd-chip-scroll">${chips(matched, "jd-chip-hit")}</div>` : ""}
          ${missing.length ? `<p class="jd-chip-group-label"><strong>Not found — consider adding if genuinely true:</strong></p><div class="jd-chip-scroll">${chips(missing, "jd-chip-miss")}</div>` : ""}
        </section>
      `;
    }

    // Layouts
    if (layout === "layout1") {
      html = `<div class="layout1"><div class="left">${header}${skills}${languages}${interests}</div><div class="right">${summary}${experience}${education}${projects}${awards}</div></div>`;
    }
    else if (layout === "timeline") {
      html = `${header}${summary}<div class="timeline">${experience}${education}</div>${skills}${projects}${awards}${languages}${interests}`;
    }
    else if (layout === "minimalist") {
      html = `<div class="minimalist">${header}${summary}${experience}${education}${skills}${projects}${awards}${languages}${interests}</div>`;
    }
    else if (layout === "cards") {
      html = `<div class="cards">${header}${summary}${experience}${education}${skills}${projects}${awards}${languages}${interests}</div>`;
    }
    else if (layout === "compact") {
      html = `<div class="compact">${header}${summary}${experience}${skills}${projects}${education}${languages}</div>`;
    }
    else if (layout === "ats-simple") {
      html = `<div class="ats-simple">${header}${summary}${experience}${education}${skills}${projects}${awards}${languages}${interests}</div>`;
    }
    else if (layout === "ats-chronological") {
      html = `<div class="ats-chronological">${header}${summary}${experience}${education}${skills}${projects}${awards}${languages}${interests}</div>`;
    }

    html = matchPanel + html;

    if (resume)
      resume.innerHTML = html;
  }

  function handleLayoutChange(event: React.FormEvent<HTMLDivElement>): void {
    const target = event.target as HTMLInputElement;
    if (target && target.name === "layout") {
      renderResume(resumeData);
      setMobileView('preview');
    }
  }

  function PrintLayout():
    void {
    const resume = document.getElementById("resume")!;

    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Get iframe document
    const iframeDoc = iframe.contentWindow!.document;

    // Copy styles from parent
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');

    // Clone the element (preserves rich content)
    const clone = resume.cloneNode(true);

    // Write content into iframe
    iframeDoc.open();
    iframeDoc.write(`
        <html>
          <head>
            <title>Print</title>
            ${styles}
          </head>
          <body></body>
        </html>
      `);
    iframeDoc.body.appendChild(clone);
    // iframeDoc.close();

    // Wait a moment for images/fonts, then print
    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();

    // Cleanup
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }

  // --- Render ---
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">📄</span>
          <div>
            <h1>Resume Builder</h1>
            <p>Fill in your details, tailor them to a job, and export a polished resume.</p>
          </div>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <div className="view-switch" role="tablist" aria-label="Editor view">
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === 'edit'}
          className={`view-switch-btn${mobileView === 'edit' ? ' is-active' : ''}`}
          onClick={() => setMobileView('edit')}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === 'preview'}
          className={`view-switch-btn${mobileView === 'preview' ? ' is-active' : ''}`}
          onClick={() => setMobileView('preview')}
        >
          👁️ Preview
        </button>
      </div>

      <main className="workspace">
        <div className={`panel panel-edit${mobileView === 'edit' ? ' is-active' : ''}`}>
          <form onSubmit={handleSubmit} className="resume-form">
            {/* Import / Export / Local Cache */}
            <Section title="Your Resume Data" icon="💾" defaultOpen>
              <p className="section-hint">
                Save your details as a JSON file, reload them later, or check what's currently saved
                in this browser.
              </p>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  ⬆️ Import JSON File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileImport}
                  hidden
                />
                <button type="button" className="btn btn-secondary" onClick={handleExportJson}>
                  ⬇️ Export JSON File
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCopyJson}>
                  📋 Copy as JSON
                </button>
              </div>

              <div className="form-group w-100p">
                <label>Or paste JSON directly (e.g. an AI's reply)</label>
                <textarea
                  value={pasteJsonText}
                  onChange={e => setPasteJsonText(e.target.value)}
                  placeholder="Paste resume JSON here…"
                  rows={4}
                />
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-outline" onClick={handleApplyPastedJson}>
                  ✅ Apply Pasted JSON
                </button>
              </div>

              <hr className="data-divider" />

              <div className="form-group w-100p">
                <label>Save current details as a named version</label>
                <div className="version-save-row">
                  <input
                    type="text"
                    value={versionTitle}
                    onChange={e => setVersionTitle(e.target.value)}
                    placeholder='e.g. "Google SWE Application" (optional)'
                  />
                  <button type="button" className="btn btn-primary" onClick={handleSaveVersion}>
                    💾 Save as New Version
                  </button>
                </div>
              </div>

              <div className="btn-row">
                <button type="button" className="btn btn-secondary" onClick={handleToggleVersions}>
                  {showVersions ? '🙈 Hide Saved Versions' : `📚 Saved Versions${versions.length ? ` (${versions.length})` : ''}`}
                </button>
              </div>
              {showVersions && (
                <div className="version-list">
                  {versions.length === 0 ? (
                    <p className="section-hint">
                      No saved versions yet — give it a title above and click "Save as New Version".
                    </p>
                  ) : (
                    versions.map((v) => (
                      <div key={v.id} className="version-row">
                        <div className="version-info">
                          <span className="version-title">{v.title}</span>
                          <span className="version-date">{formatSavedAt(v.savedAt)}</span>
                        </div>
                        <div className="version-actions">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => handleLoadVersion(v)}>
                            👁️ Load &amp; Preview
                          </button>
                          <button
                            type="button"
                            className="btn-delete-version"
                            onClick={() => handleDeleteVersion(v.id, v.title)}
                            aria-label={`Delete version "${v.title}"`}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Section>

            {/* Contact Information */}
            <Section title="Contact Information" icon="🧑" defaultOpen>
              <div className="contact-section-group">
                {[
                  { label: 'Name', value: contact.name, key: 'name', type: 'text', required: true, placeholder: 'John Doe' },
                  { label: 'Location', value: contact.location, key: 'location', type: 'text', required: true, placeholder: 'Bangalore, KA' },
                  { label: 'Email', value: contact.email, key: 'email', type: 'email', required: true, placeholder: 'example@domain.com' },
                  { label: 'Phone', value: contact.phone, key: 'phone', type: 'text', required: false, placeholder: '123-456-7890' },
                  { label: 'Website', value: contact.website, key: 'website', type: 'text', required: false, placeholder: 'yourwebsite.com' },
                  { label: 'LinkedIn', value: contact.linkedin, key: 'linkedin', type: 'text', required: false, placeholder: 'linkedin.com/in/johndoe' },
                  { label: 'GitHub', value: contact.github, key: 'github', type: 'text', required: false, placeholder: 'github.com/johndoe' },
                ].map(({ label, value, key, type, required, placeholder }) => (
                  <div className={`form-group${key === 'name' ? ' w-100p' : ''}`} key={key}>
                    <label>{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={e => setContact({ ...contact, [key]: e.target.value })}
                      placeholder={placeholder}
                      required={required}
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* Summary */}
            <Section title="Summary" icon="📝" defaultOpen>
              <div className="form-group">
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Enter a brief summary"
                  rows={3}
                  required
                />
              </div>
            </Section>

            {/* Job Description Matching */}
            <Section title="Target Job Description" icon="🎯" defaultOpen>
              <p className="section-hint">
                Paste a job posting or key required skills. Matching skills and keywords already in your
                resume are visibly highlighted in the preview, with a match score — so you can see the fit
                and honestly fill any gaps before you apply.
              </p>
              <div className="form-group w-100p jd-field">
                <label>Job description or required skills</label>
                <div className="jd-textarea-wrap">
                  <textarea
                    value={jobDescription}
                    onChange={e => { setJobDescription(e.target.value); setJobMatch(null); }}
                    placeholder="Paste the job posting here…"
                    rows={5}
                  />
                  {jobDescription && (
                    <button
                      type="button"
                      className="btn-clear-field"
                      onClick={() => { setJobDescription(''); setJobMatch(null); }}
                      aria-label="Clear job description"
                      title="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="jd-actions">
                <button type="button" className="btn btn-outline" onClick={handleCheckMatch}>
                  🔍 Compare to Resume
                </button>
                <button type="button" className="btn btn-outline" onClick={handleGenerateAiPrompt}>
                  🧠 Get AI Enhancement Prompt
                </button>
              </div>

              {aiPrompt && (
                <div className="ai-prompt-box">
                  <p className="section-hint">
                    Copied to your clipboard. Paste it into ChatGPT, Claude, or any AI chat — then bring its
                    JSON reply back here using "Apply Pasted JSON" above.
                  </p>
                  <textarea value={aiPrompt} readOnly rows={8} onFocus={e => e.target.select()} />
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(aiPrompt);
                          showFeedback('success', 'AI prompt copied to clipboard.');
                        } catch {
                          showFeedback('info', 'Could not access the clipboard — please copy manually.');
                        }
                      }}
                    >
                      📋 Copy Prompt
                    </button>
                  </div>
                </div>
              )}

              {jobMatch && (
                <div className="jd-match-result">
                  <div className="jd-match-score">
                    <span className="jd-score-value">{jobMatch.score}%</span>
                    <span className="jd-score-label">match with your resume</span>
                  </div>
                  {jobMatch.matched.length > 0 && (
                    <div className="jd-chip-group">
                      <p className="jd-chip-group-label">✅ Already in your resume</p>
                      <div className="jd-chip-scroll">
                        {jobMatch.matched.map((k) => (
                          <span key={k} className="jd-chip jd-chip-hit">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {jobMatch.missing.length > 0 && (
                    <div className="jd-chip-group">
                      <p className="jd-chip-group-label">⚠️ Not found — add if genuinely true</p>
                      <div className="jd-chip-scroll">
                        {jobMatch.missing.map((k) => (
                          <span key={k} className="jd-chip jd-chip-miss">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* Education */}
            <Section title="Education" icon="🎓" count={education.length} defaultOpen>
              {education.map((edu, idx) => (
                <div key={idx} className="dynamic-section contact-section-group">
                  <button
                    type="button"
                    className="btn-remove-entry"
                    onClick={() => removeEntry(idx, education, setEducation)}
                    aria-label="Remove education entry"
                    title="Remove"
                  >
                    ✕
                  </button>
                  {[
                    { label: 'Degree', field: 'degree', value: edu.degree, required: true, placeholder: 'BS in Computer Science' },
                    { label: 'Institution', field: 'institution', value: edu.institution, required: true, placeholder: 'University of Pennsylvania' },
                    { label: 'Date', field: 'date', value: edu.date, required: true, placeholder: 'Sept 2000 – May 2005' },
                    { label: 'Highlights (comma separated)', field: 'highlights', value: edu.highlights, required: false, placeholder: 'GPA: 3.9/4.0, Coursework: ...', className: 'w-100p' },
                  ].map(({ label, field, value, required, placeholder, className }) => (
                    <div className={`form-group${className ? ` ${className}` : ''}`} key={field}>
                      <label>{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={e => updateEntry(idx, field as keyof EducationEntry, e.target.value, education, setEducation)}
                        required={required}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              ))}
              <AddButton onClick={() => addEntry(setEducation, { date: '', institution: '', degree: '', highlights: '' })} label="Add Education" />
            </Section>

            {/* Experience */}
            <Section title="Experience" icon="💼" count={experience.length} defaultOpen>
              {experience.map((exp, idx) => (
                <div key={idx} className="dynamic-section contact-section-group">
                  <button
                    type="button"
                    className="btn-remove-entry"
                    onClick={() => removeEntry(idx, experience, setExperience)}
                    aria-label="Remove experience entry"
                    title="Remove"
                  >
                    ✕
                  </button>
                  {[
                    { label: 'Position', field: 'position', value: exp.position, required: true, placeholder: 'Software Engineer' },
                    { label: 'Company', field: 'company', value: exp.company, required: true, placeholder: 'Google' },
                    { label: 'Location', field: 'location', value: exp.location, required: false, placeholder: 'Mountain View, CA' },
                    { label: 'Date', field: 'date', value: exp.date, required: true, placeholder: 'Sept 2000 – May 2005' },
                    { label: 'Highlights (comma separated)', field: 'highlights', value: exp.highlights, required: false, placeholder: 'Worked on project X, ...', className: 'w-100p' },
                  ].map(({ label, field, value, required, placeholder, className }) => (
                    <div className={`form-group${className ? ` ${className}` : ''}`} key={field}>
                      <label>{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={e => updateEntry(idx, field as keyof ExperienceEntry, e.target.value, experience, setExperience)}
                        required={required}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              ))}
              <AddButton onClick={() => addEntry(setExperience, { date: '', position: '', company: '', location: '', highlights: '' })} label="Add Experience" />
            </Section>

            {/* Skills */}
            <Section title="Skills" icon="🛠️" count={skills.length} defaultOpen>
              {skills.map((skill, idx) => (
                <div key={idx} className="dynamic-section contact-section-group">
                  <button
                    type="button"
                    className="btn-remove-entry"
                    onClick={() => removeEntry(idx, skills, setSkills)}
                    aria-label="Remove skill category"
                    title="Remove"
                  >
                    ✕
                  </button>
                  {[
                    { label: 'Category Name', field: 'name', value: skill.name, placeholder: 'Languages' },
                    { label: 'Items (comma separated)', field: 'items', value: skill.items, placeholder: 'Java, Python, C++' },
                  ].map(({ label, field, value, placeholder }) => (
                    <div className="form-group" key={field}>
                      <label>{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={e => updateEntry(idx, field as keyof SkillEntry, e.target.value, skills, setSkills)}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              ))}
              <AddButton onClick={() => addEntry(setSkills, { name: '', items: '' })} label="Add Skill Category" />
            </Section>

            {/* Projects */}
            <Section title="Projects" icon="🚀" count={projects.length} defaultOpen>
              {projects.map((proj, idx) => (
                <div key={idx} className="dynamic-section contact-section-group">
                  <button
                    type="button"
                    className="btn-remove-entry"
                    onClick={() => removeEntry(idx, projects, setProjects)}
                    aria-label="Remove project"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={e => updateEntry(idx, 'name', e.target.value, projects, setProjects)}
                      placeholder="Project X"
                    />
                  </div>
                  <div className="form-group">
                    <label>Highlights (comma separated)</label>
                    <input
                      type="text"
                      value={proj.highlights}
                      onChange={e => updateEntry(idx, 'highlights', e.target.value, projects, setProjects)}
                      placeholder="Worked on project X, ..."
                    />
                  </div>
                  <div className="form-group w-100p">
                    <label>Description</label>
                    <textarea
                      value={proj.description}
                      onChange={e => updateEntry(idx, 'description', e.target.value, projects, setProjects)}
                      placeholder="Description of project X"
                    />
                  </div>
                </div>
              ))}
              <AddButton onClick={() => addEntry(setProjects, { name: '', description: '', highlights: '' })} label="Add Project" />
            </Section>

            {/* Awards */}
            <Section title="Awards, Achievements & Certifications" icon="🏆" count={awards.length} defaultOpen>
              {awards.map((award, idx) => (
                <div key={idx} className="dynamic-section contact-section-group">
                  <button
                    type="button"
                    className="btn-remove-entry"
                    onClick={() => removeEntry(idx, awards, setAwards)}
                    aria-label="Remove award"
                    title="Remove"
                  >
                    ✕
                  </button>
                  {[
                    { label: 'Award / Achievements / Certificate Name', field: 'name', value: award.name, placeholder: 'Award X' },
                    { label: 'Organization', field: 'organization', value: award.organization, placeholder: 'Organization X' },
                    { label: 'Credentials', field: 'credentials', value: award.credentials, placeholder: 'Credentials URL' },
                    { label: 'Date', field: 'date', value: award.date, placeholder: 'YYYY-MM-DD' },
                  ].map(({ label, field, value, placeholder }) => (
                    <div className="form-group" key={field}>
                      <label>{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={e => updateEntry(idx, field as keyof AwardEntry, e.target.value, awards, setAwards)}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <div className="form-group w-100p">
                    <label>Description</label>
                    <textarea
                      value={award.description}
                      onChange={e => updateEntry(idx, 'description', e.target.value, awards, setAwards)}
                      placeholder="Description of Award X"
                    />
                  </div>
                </div>
              ))}
              <AddButton onClick={() => addEntry(setAwards, { name: '', date: '', organization: '', credentials: '', description: '' })} label="Add Award / Certification" />
            </Section>

            {/* References */}
            <Section title="References" icon="🤝" count={references.length} defaultOpen>
              {references.map((ref, idx) => (
                <div key={idx} className="dynamic-section contact-section-group">
                  <button
                    type="button"
                    className="btn-remove-entry"
                    onClick={() => removeEntry(idx, references, setReferences)}
                    aria-label="Remove reference"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <div className="form-group">
                    <label>Reference Name</label>
                    <input
                      type="text"
                      value={ref.name}
                      onChange={e => updateEntry(idx, 'name', e.target.value, references, setReferences)}
                      placeholder="Reference X"
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Details</label>
                    <input
                      type="text"
                      value={ref.contact}
                      onChange={e => updateEntry(idx, 'contact', e.target.value, references, setReferences)}
                      placeholder="Contact details of Reference X"
                    />
                  </div>
                </div>
              ))}
              <AddButton onClick={() => addEntry(setReferences, { name: '', contact: '' })} label="Add Reference" />
            </Section>

            {/* Languages */}
            <Section title="Languages" icon="🌐" count={languages.length} defaultOpen>
              {languages.map((lang, idx) => (
                <div key={idx} className="dynamic-section contact-section-group">
                  <button
                    type="button"
                    className="btn-remove-entry"
                    onClick={() => removeEntry(idx, languages, setLanguages)}
                    aria-label="Remove language"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <div className="form-group">
                    <label>Language Name</label>
                    <input
                      type="text"
                      value={lang.name}
                      onChange={e => updateEntry(idx, 'name', e.target.value, languages, setLanguages)}
                      placeholder="Language X"
                    />
                  </div>
                  <div className="form-group">
                    <label>Proficiency</label>
                    <input
                      type="text"
                      value={lang.proficiency}
                      onChange={e => updateEntry(idx, 'proficiency', e.target.value, languages, setLanguages)}
                      placeholder="e.g., Beginner, Intermediate, Fluent"
                    />
                  </div>
                </div>
              ))}
              <AddButton onClick={() => addEntry(setLanguages, { name: '', proficiency: '' })} label="Add Language" />
            </Section>

            {/* Interests */}
            <Section title="Interests" icon="🎨" defaultOpen>
              <div className="form-group">
                <label>Interests (comma separated)</label>
                <input
                  type="text"
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                  placeholder="e.g., Hiking, Reading, Photography, etc."
                />
              </div>
            </Section>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-block">
                ✨ Update Resume Preview
              </button>
              <button type="button" className="btn btn-secondary btn-block" onClick={handleCopyJson}>
                📋 Copy as JSON
              </button>
              {feedback && (
                <p className={`form-feedback form-feedback-${feedback.type}`} role="status">
                  {feedback.message}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className={`panel panel-preview${mobileView === 'preview' ? ' is-active' : ''}`}>
          <div className="preview-header">
            <h2>Live Preview</h2>
            <p className="preview-hint">Pick a layout, then export when it looks right.</p>
            <p className="section-hint">
              ✅ ATS Simple, ATS Chronological, Timeline, Minimalist, and Compact are single-column and
              read cleanly by automated resume screeners. Classic Two-Column and Card-Based look more
              distinctive but some ATS parsers can jumble multi-column text — use those when you know a
              human reviews applications first.
            </p>
          </div>
          <div className="container">
            <div className="toolbar">
              <div className="radio-group" onChange={handleLayoutChange}>
                <label>
                  <input type="radio" name="layout" value="ats-simple" />
                  ✅ ATS Simple
                </label>
                <label>
                  <input type="radio" name="layout" value="ats-chronological" />
                  ✅ ATS Chronological
                </label>
                <label>
                  <input type="radio" name="layout" value="layout1" />
                  Classic Two-Column
                </label>
                <label>
                  <input type="radio" name="layout" value="timeline" />
                  Timeline Style
                </label>
                <label>
                  <input type="radio" name="layout" value="minimalist" />
                  Minimalist
                </label>
                <label>
                  <input type="radio" name="layout" value="cards" />
                  Card-Based
                </label>
                <label>
                  <input type="radio" name="layout" value="compact" />
                  Compact One-Page
                </label>
              </div>
              <button type="button" className="btn btn-outline print-btn" onClick={() => { PrintLayout(); }}>
                ⬇️ Download PDF
              </button>
            </div>
            <div id="resume" className="resume"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---
const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  icon?: string;
  count?: number;
  defaultOpen?: boolean;
}> = ({ title, children, icon, count, defaultOpen = false }) => (
  <details className="section" open={defaultOpen}>
    <summary className="section-summary">
      <span className="section-summary-title">
        {icon && <span className="section-icon" aria-hidden="true">{icon}</span>}
        {title}
        {typeof count === 'number' && <span className="section-count">{count}</span>}
      </span>
      <span className="section-chevron" aria-hidden="true">⌄</span>
    </summary>
    <div className="section-body">{children}</div>
  </details>
);

const AddButton: React.FC<{ onClick: () => void; label: string; }> = ({ onClick, label }) => (
  <button type="button" className="btn btn-add" onClick={onClick}>➕ {label}</button>
);

export default ResumeForm;
