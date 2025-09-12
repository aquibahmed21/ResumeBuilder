import React, { useState, useEffect } from 'react';
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

  // --- Load from localStorage ---
  useEffect(() => {
    const storedData = localStorage.getItem('resumeData');
    if (storedData) {
      try {
        const parsed: ResumeData = JSON.parse(storedData);
        setContact(parsed.contact);
        setSummary(parsed.sections.summary);
        setEducation(parsed.sections.education);
        setExperience(parsed.sections.experience);
        setSkills(parsed.sections.skills);
        setProjects(parsed.sections.projects);
        setAwards(parsed.sections.awards);
        setReferences(parsed.sections.references);
        setLanguages(parsed.sections.languages);
        setInterests(parsed.sections.interests);
      } catch (error) {
        console.error('Failed to parse stored resume data', error);
      }
    }
  }, []);

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

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resumeData: ResumeData = {
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
    };
    localStorage.setItem('resumeData', JSON.stringify(resumeData, null, 2));
    navigator.clipboard.writeText(resumeData ? JSON.stringify(resumeData, null, 2) : '');
    renderResume(resumeData);
  };

  function renderResume(data: any): void {
    const resume = document.getElementById("resume")!;
    const layout = (document.querySelector("input[name=layout]:checked") as HTMLInputElement)!.value;
    let html = "";

    // Header common
    const header = `
        <header>
          <h1>${data.contact.name}</h1>
          <p>${data.contact.location}</p>
          <p>Email: ${data.contact.email} | Phone: ${data.contact.phone}</p>
          <p>Website: ${data.contact.website} | LinkedIn: ${data.contact.linkedin} | GitHub: ${data.contact.github}</p>
        </header>
      `;

    // Sections
    const summary = `<section><h2>Summary</h2><p>${data.sections.summary}</p></section>`;

    const education = `<section><h2>Education</h2>${data.sections.education.map((e: EducationEntry) => `
        <article><h3>${e.degree}</h3><p>${e.institution} (${e.date})</p><p>${e.highlights}</p></article>
      `).join("")}</section>`;

    const experience = `<section><h2>Experience</h2>${data.sections.experience.map((  exp: ExperienceEntry) => `
        <article><h3>${exp.position}</h3><p>${exp.company}, ${exp.location} (${exp.date})</p><p>${exp.highlights}</p></article>
      `).join("")}</section>`;

    const skills = `<section><h2>Skills</h2><ul>${data.sections.skills.map((  s: SkillEntry) => `
        <li><strong>${s.name}:</strong> ${s.items}</li>`).join("")}</ul></section>`;

    const projects = `<section><h2>Projects</h2>${data.sections.projects.map((p: ProjectEntry) => `
        <article><h3>${p.name}</h3><p>${p.description}</p><p>${p.highlights}</p></article>
      `).join("")}</section>`;

    const awards = `<section><h2>Awards</h2>${data.sections.awards.map((a: AwardEntry) => `
        <article><h3>${a.name}</h3><p>${a.organization} (${a.date})</p><p>${a.description}</p></article>
      `).join("")}</section>`;

    const languages = `<section><h2>Languages</h2><ul>${data.sections.languages.map(( l: LanguageEntry) => `<li>${l.name} - ${l.proficiency}</li>`).join("")}</ul></section>`;

    const interests = `<section><h2>Interests</h2><p>${data.sections.interests}</p></section>`;

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

    if (resume)
      resume.innerHTML = html;
  }

  function handleLayoutChange(event: React.FormEvent<HTMLDivElement>): void {
    const target = event.target as HTMLInputElement;
    if (target && target.name === "layout") {
      // You can store the selected layout in state if needed
      // For now, just log the selected layout value
      console.log("Selected layout:", target.value);
      // Example: setLayout(target.value); // if you add a layout state
    }
  }
  // --- Render ---
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Resume Builder</h2>

        {/* Contact Information */}
        <Section title="Contact Information">
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
        <Section title="Summary">
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

        {/* Education */}
        <Section title="Education">
          {education.map((edu, idx) => (
            <div key={idx} className="dynamic-section contact-section-group">
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
              <button
                type="button"
                className="remove-button"
                onClick={() => removeEntry(idx, education, setEducation)}
              >
                Remove
              </button>
            </div>
          ))}
          <AddButton onClick={() => addEntry(setEducation, { date: '', institution: '', degree: '', highlights: '' })} label="Add" />
        </Section>

        {/* Experience */}
        <Section title="Experience">
          {experience.map((exp, idx) => (
            <div key={idx} className="dynamic-section contact-section-group">
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
              <button type="button" onClick={() => removeEntry(idx, experience, setExperience)} className="remove-button">Remove</button>
            </div>
          ))}
          <AddButton onClick={() => addEntry(setExperience, { date: '', position: '', company: '', location: '', highlights: '' })} label="Add" />
        </Section>

        {/* Skills */}
        <Section title="Skills">
          {skills.map((skill, idx) => (
            <div key={idx} className="dynamic-section contact-section-group">
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
              <button type="button" onClick={() => removeEntry(idx, skills, setSkills)} className="remove-button">Remove</button>
            </div>
          ))}
          <AddButton onClick={() => addEntry(setSkills, { name: '', items: '' })} label="Add" />
        </Section>

        {/* Projects */}
        <Section title="Projects">
          {projects.map((proj, idx) => (
            <div key={idx} className="dynamic-section contact-section-group">
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
              <button type="button" onClick={() => removeEntry(idx, projects, setProjects)} className="remove-button">Remove</button>
            </div>
          ))}
          <AddButton onClick={() => addEntry(setProjects, { name: '', description: '', highlights: '' })} label="Add" />
        </Section>

        {/* Awards */}
        <Section title="Awards, Achievements & Certifications">
          {awards.map((award, idx) => (
            <div key={idx} className="dynamic-section contact-section-group">
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
              <button type="button" onClick={() => removeEntry(idx, awards, setAwards)} className="remove-button">Remove</button>
            </div>
          ))}
          <AddButton onClick={() => addEntry(setAwards, { name: '', date: '', organization: '', credentials: '', description: '' })} label="Add" />
        </Section>

        {/* References */}
        <Section title="References">
          {references.map((ref, idx) => (
            <div key={idx} className="dynamic-section contact-section-group">
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
              <button type="button" onClick={() => removeEntry(idx, references, setReferences)} className="remove-button">Remove</button>
            </div>
          ))}
          <AddButton onClick={() => addEntry(setReferences, { name: '', contact: '' })} label="Add" />
        </Section>

        {/* Languages */}
        <Section title="Languages">
          {languages.map((lang, idx) => (
            <div key={idx} className="dynamic-section contact-section-group">
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
              <button type="button" onClick={() => removeEntry(idx, languages, setLanguages)} className="remove-button">Remove</button>
            </div>
          ))}
          <AddButton onClick={() => addEntry(setLanguages, { name: '', proficiency: '' })} label="Add" />
        </Section>

        {/* Interests */}
        <Section title="Interests">
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

        <button type="submit" className="submit-button">
          Generate Resume JSON
        </button>
      </form>

      <Section title="Resume Generator Controls">
        <div className="w-100p">
          <div className="toolbar">
            <div className="radio-group" onChange={handleLayoutChange}>
              <label>
                <input type="radio" name="layout" value="layout1" checked/>
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

          </div>
          <div id="resume" className="resume"></div>
          <button className="print-btn" onClick={() => window.print()}>Download PDF</button>
        </div>
      </Section>

    </div>
  );
};

// --- Helper Components ---
const Section: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
  <section>
    <h3>{title}</h3>
    {children}
  </section>
);

const AddButton: React.FC<{ onClick: () => void; label: string; }> = ({ onClick, label }) => (
  <button type="button" onClick={onClick}>{label}</button>
);

export default ResumeForm;