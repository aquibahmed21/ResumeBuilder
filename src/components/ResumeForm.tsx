import React, { useState } from 'react';

interface EducationEntry {
  date: string;
  institution: string;
  degree: string;
  highlights: string;
}
interface ExperienceEntry {
  date: string;
  position: string;
  company: string;
  location: string;
  highlights: string;
}
interface SkillEntry {
  name: string;
  items: string;
}
interface ProjectEntry {
  name: string;
  description: string;
  highlights: string;
}
interface AwardEntry {
  name: string;
  date: string;
  organization: string;
  credentials: string;
  description: string;
}
interface ReferenceEntry {
  name: string;
  contact: string;
}
interface LanguageEntry {
  name: string;
  proficiency: string;
}

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

const ResumeForm: React.FC = () => {
  // Contact Information
  const [contact, setContact] = useState({
    name: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
  });

  // Other Sections
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [awards, setAwards] = useState<AwardEntry[]>([]);
  const [references, setReferences] = useState<ReferenceEntry[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [interests, setInterests] = useState('');

  // Helper functions for dynamic sections
  const addEducation = () => {
    setEducation([...education, { date: '', institution: '', degree: '', highlights: '' }]);
  };
  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const addExperience = () => {
    setExperience([...experience, { date: '', position: '', company: '', location: '', highlights: '' }]);
  };
  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const addSkill = () => {
    setSkills([...skills, { name: '', items: '' }]);
  };
  const updateSkill = (index: number, field: keyof SkillEntry, value: string) => {
    const newSkills = [...skills];
    newSkills[index][field] = value;
    setSkills(newSkills);
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '', highlights: '' }]);
  };
  const updateProject = (index: number, field: keyof ProjectEntry, value: string) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const addAward = () => {
    setAwards([...awards, { name: '', date: '', organization: '', credentials: '', description: '' }]);
  };
  const updateAward = (index: number, field: keyof AwardEntry, value: string) => {
    const newAwards = [...awards];
    newAwards[index][field] = value;
    setAwards(newAwards);
  };

  const addReference = () => {
    setReferences([...references, { name: '', contact: '' }]);
  };
  const updateReference = (index: number, field: keyof ReferenceEntry, value: string) => {
    const newReferences = [...references];
    newReferences[index][field] = value;
    setReferences(newReferences);
  };

  const addLanguage = () => {
    setLanguages([...languages, { name: '', proficiency: '' }]);
  };
  const updateLanguage = (index: number, field: keyof LanguageEntry, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index][field] = value;
    setLanguages(newLanguages);
  };

  // Handle form submission: generate JSON and store in localStorage
  const handleSubmit = (e: React.FormEvent) => {
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
    alert('Resume data saved to local storage!');
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Resume Builder</h2>

        {/* Contact Information */}
        <section className="contact-section">
          <h3>Contact Information</h3>
          <div className="contact-section-group">
          <div className="form-group w-100p">
            <label>Name</label>
            <input
              type="text"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder='John Doe'
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={contact.location}
              onChange={(e) => setContact({ ...contact, location: e.target.value })}
              placeholder='Bangalore, KA'
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder='example@domain.com'
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder='123-456-7890'
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="text"
              value={contact.website}
              onChange={(e) => setContact({ ...contact, website: e.target.value })}
              placeholder='yourwebsite.com'
            />
          </div>
          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="text"
              value={contact.linkedin}
              onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
              placeholder='linkedin.com/in/johndoe'
            />
          </div>
          <div className="form-group">
            <label>GitHub</label>
            <input
              type="text"
              value={contact.github}
              onChange={(e) => setContact({ ...contact, github: e.target.value })}
              placeholder='github.com/johndoe'
            />
          </div>
          </div>
        </section>

        {/* Summary */}
        <section className="summary-section">
          <h3>Summary</h3>
          <div className="form-group">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter a brief summary"
              rows={3}
              required
            ></textarea>
          </div>
        </section>

        {/* Education */}
        <section className="education-section">
          <h3>Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="dynamic-section contact-section-group">
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  required
                  placeholder='BS in Computer Science'
                />
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  required
                  placeholder='University of Pennsylvania'
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="text"
                  value={edu.date}
                  onChange={(e) => updateEducation(index, 'date', e.target.value)}
                  required
                  placeholder='Sept 2000 – May 2005'
                />
              </div>
              <div className="form-group w-100p">
                <label>Highlights (comma separated)</label>
                <input
                  type="text"
                  value={edu.highlights}
                  onChange={(e) => updateEducation(index, 'highlights', e.target.value)}
                  placeholder='GPA: 3.9/4.0, Coursework: Computer Architecture, Comparison of Learning Algorithms, Computational Theory'
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addEducation}>Add Education</button>
        </section>

        {/* Experience */}
        <section className="experience-section">
          <h3>Experience</h3>
          {experience.map((exp, index) => (
            <div key={index} className="dynamic-section contact-section-group">
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  required
                  placeholder='Software Engineer'
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  required
                  placeholder='Google'
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  placeholder='Mountain View, CA'
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="text"
                  value={exp.date}
                  onChange={(e) => updateExperience(index, 'date', e.target.value)}
                  required
                  placeholder='Sept 2000 – May 2005'
                />
              </div>
              <div className="form-group w-100p">
                <label>Highlights (comma separated)</label>
                <input
                  type="text"
                  value={exp.highlights}
                  onChange={(e) => updateExperience(index, 'highlights', e.target.value)}
                  placeholder='Worked on project X, Contributed to team Y, Developed feature Z'
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addExperience}>Add Experience</button>
        </section>

        {/* Skills */}
        <section className="skills-section">
          <h3>Skills</h3>
          {skills.map((skill, index) => (
            <div key={index} className="dynamic-section contact-section-group">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                  placeholder='Languages'
                />
              </div>
              <div className="form-group">
                <label>Items (comma separated)</label>
                <input
                  type="text"
                  value={skill.items}
                  onChange={(e) => updateSkill(index, 'items', e.target.value)}
                  placeholder='Java, Python, C++'
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addSkill}>Add Skill</button>
        </section>

        {/* Projects */}
        <section className="projects-section">
          <h3>Projects</h3>
          {projects.map((proj, index) => (
            <div key={index} className="dynamic-section contact-section-group">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  placeholder='Project X'
                />
              </div>
              <div className="form-group">
                <label>Highlights (comma separated)</label>
                <input
                  type="text"
                  value={proj.highlights}
                  onChange={(e) => updateProject(index, 'highlights', e.target.value)}
                  placeholder='Worked on project X, Contributed to team Y, Developed feature Z'
                />
              </div>
              <div className="form-group w-100p">
                <label>Description</label>
                <textarea
                  value={proj.description}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder='Description of project X'
                ></textarea>
              </div>
            </div>
          ))}
          <button type="button" onClick={addProject}>Add Project</button>
        </section>

        {/* Awards, Achievements & Certifications */}
        <section className="awards-section">
          <h3>Awards, Achievements & Certifications</h3>
          {awards.map((award, index) => (
            <div key={index} className="dynamic-section contact-section-group">
              <div className="form-group">
                <label>Award / Achievements / Certificate Name</label>
                <input
                  type="text"
                  value={award.name}
                  onChange={(e) => updateAward(index, 'name', e.target.value)}
                  placeholder='Award X'
                />
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input
                  type="text"
                  value={award.organization}
                  onChange={(e) => updateAward(index, 'organization', e.target.value)}
                  placeholder='Organization X'
                />
              </div>
              <div className="form-group">
                <label>Credentials</label>
                <input
                  type="text"
                  value={award.credentials}
                  onChange={(e) => updateAward(index, 'credentials', e.target.value)}
                  placeholder='Credentials URL'
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="text"
                  value={award.date}
                  onChange={(e) => updateAward(index, 'date', e.target.value)}
                  placeholder='YYYY-MM-DD'
                />
              </div>
              <div className="form-group w-100p">
                <label>Description</label>
                <textarea
                  value={award.description}
                  onChange={(e) => updateAward(index, 'description', e.target.value)}
                  placeholder='Description of Award X'
                ></textarea>
              </div>
            </div>
          ))}
          <button type="button" onClick={addAward}>Add Award</button>
        </section>

        {/* References */}
        <section className="references-section">
          <h3>References</h3>
          {references.map((ref, index) => (
            <div key={index} className="dynamic-section contact-section-group">
              <div className="form-group">
                <label>Reference Name</label>
                <input
                  type="text"
                  value={ref.name}
                  onChange={(e) => updateReference(index, 'name', e.target.value)}
                  placeholder='Reference X'
                />
              </div>
              <div className="form-group">
                <label>Contact Details</label>
                <input
                  type="text"
                  value={ref.contact}
                  onChange={(e) => updateReference(index, 'contact', e.target.value)}
                  placeholder='Contact details of Reference X'
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addReference}>Add Reference</button>
        </section>

        {/* Languages */}
        <section className="languages-section">
          <h3>Languages</h3>
          {languages.map((lang, index) => (
            <div key={index} className="dynamic-section contact-section-group">
              <div className="form-group">
                <label>Language Name</label>
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                  placeholder='Language X'
                />
              </div>
              <div className="form-group">
                <label>Proficiency</label>
                <input
                  type="text"
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                  placeholder='e.g., Beginner, Intermediate, Fluent'
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addLanguage}>Add Language</button>
        </section>

        {/* Interests */}
        <section className="interests-section">
          <h3>Interests</h3>
          <div className="form-group">
            <label>Interests (comma separated)</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder='e.g., Hiking, Reading, Photography, etc.'
            />
          </div>
        </section>

        <button type="submit" className="submit-button">
          Generate Resume JSON
        </button>
      </form>

      {/* Inline CSS styling for a responsive, smooth-animated form */}
      <style>{`
        .form-container {
          max-width: 90%;
          margin: 20px auto;
          background: rgba(255, 255, 255, 0.85);
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          animation: fadeIn 1s ease-out;
        }
        .contact-section-group{
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .w-100p{
          width: 100%;
        }
        section {
          padding-bottom: 20px;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          display: flex;
          flex-direction: column;
        }
        h2,
        h3 {
          text-align: center;
          margin-bottom: 15px;
          color: #333;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
          transition: transform 0.3s ease;
        }
        .form-group label {
          margin-bottom: 5px;
          color: #666;
        }
        .form-group input,
        .form-group textarea {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 1rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          resize: none;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #1c92d2;
          box-shadow: 0 0 5px rgba(28, 146, 210, 0.5);
          outline: none;
        }
        button {
          padding: 10px 15px;
          border: none;
          border-radius: 5px;
          background: #1c92d2;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease, transform 0.2s ease;
          margin: 5px 0;
          width: max-content;
          margin-left: auto;
        }
        button:hover {
          background: #0d6fbd;
          transform: scale(1.02);
        }
        .dynamic-section {
          // margin-bottom: 20px;
          // border: 1px solid #eee;
          // padding: 10px;
          // border-radius: 5px;
          // background: rgba(255, 255, 255, 0.9);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 420px) {
          .form-group {
            width: 100%;
          }
          button {
            width: 100%;
          }
          .form-container {
            max-width: calc(100% - 10px);
          }
        }
        @media (max-width: 600px) {
          .form-container {
            margin: 10px;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeForm;