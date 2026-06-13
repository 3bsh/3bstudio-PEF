import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import logo3B from './assets/logo.svg';
import {
  ChevronRight, ChevronLeft, Check, Send,
  Sparkles, Building, Target, Users,
  Palette, Compass, CheckCircle2, FileText, Mail
} from 'lucide-react';

const EMAILJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const DELIVERABLE_LABELS = {
  logo: 'Logo System', brandGuidelines: 'Brand Guidelines',
  businessCard: 'Business Cards', letterhead: 'Letterhead',
  envelope: 'Envelopes', socialMedia: 'Social Media Kits',
  patches: 'Patches & Merch', website: 'Web Design',
  packaging: 'Packaging Design', signage: 'Signage & Spatials'
};

function buildBriefText(fd) {
  const delivs = Object.entries(fd.deliverables)
    .filter(([k, v]) => v && k !== 'other')
    .map(([k]) => `  ✓ ${DELIVERABLE_LABELS[k] || k}`)
    .join('\n') || '  No core deliverables selected';

  return `
BRAND BRIEF - 3B STUDIO
═══════════════════════════════════════

1. BASIC INFORMATION
────────────────────────
Company Name: ${fd.companyName || 'N/A'}
Industry: ${fd.industry || 'N/A'}
Description: ${fd.description || 'N/A'}

Contact Information:
Name: ${fd.contactName || 'N/A'}
Email: ${fd.contactEmail || 'N/A'}
Phone: ${fd.contactPhone || 'N/A'}

2. VISION, MISSION & VALUES
────────────────────────
Vision: ${fd.vision || 'N/A'}
Mission: ${fd.mission || 'N/A'}
Core Values:
${fd.coreValues.filter(v => v).map((v, i) => `  ${i + 1}. ${v}`).join('\n') || '  No values defined'}

3. TARGET AUDIENCE
────────────────────────
Age Range: ${fd.targetAge || 'N/A'}
Gender Focus: ${fd.targetGender || 'N/A'}
Location: ${fd.targetLocation || 'N/A'}
Income Level: ${fd.targetIncome || 'N/A'}
Interests & Behaviors: ${fd.targetInterests || 'N/A'}
Pain Points: ${fd.painPoints || 'N/A'}

4. COMPETITION ANALYSIS
────────────────────────
Main Competitors:
${fd.competitors.filter(c => c).map((c, i) => `  ${i + 1}. ${c}`).join('\n') || '  No competitors listed'}
Competitor Strengths: ${fd.competitorStrengths || 'N/A'}
Competitor Weaknesses: ${fd.competitorWeaknesses || 'N/A'}
Unique Selling Proposition: ${fd.uniqueness || 'N/A'}

5. IDENTITY & PERSONALITY
────────────────────────
Brand Personality: ${fd.personality || 'N/A'}
Brand Voice: ${fd.voiceTone || 'N/A'}
Brand Traits:
${fd.traits.filter(t => t).map((t, i) => `  ${i + 1}. ${t}`).join('\n') || '  No traits defined'}

6. VISUAL REQUIREMENTS
────────────────────────
Preferred Colors: ${fd.preferredColors || 'N/A'}
Colors to Avoid: ${fd.avoidedColors || 'N/A'}
Preferred Style: ${fd.preferredStyle || 'N/A'}
Inspiration Brands: ${fd.inspirationBrands || 'N/A'}
Brands to Avoid: ${fd.dislikedBrands || 'N/A'}

7. DELIVERABLES
────────────────────────
${delivs}
${fd.deliverables.other ? `  ✓ Other: ${fd.deliverables.other}` : ''}

8. GOALS & EXPECTATIONS
────────────────────────
Project Goals: ${fd.goals || 'N/A'}
Timeline: ${fd.timeline || 'N/A'}
Budget: ${fd.budget || 'N/A'}
Additional Notes: ${fd.additionalNotes || 'N/A'}

────────────────────────
Building brands as systems
3B Studio | 3bsssh@gmail.com | +964 785 080 0280
  `.trim();
}

function saveSubmission(fd, text) {
  const list = JSON.parse(localStorage.getItem('brandBriefSubmissions_3b') || '[]');
  list.unshift({
    id: Date.now().toString(),
    submittedAt: new Date().toISOString(),
    companyName: fd.companyName || 'Unnamed',
    contactEmail: fd.contactEmail || '',
    data: fd,
    formatted: text,
    viewed: false,
  });
  localStorage.setItem('brandBriefSubmissions_3b', JSON.stringify(list));
}

export default function BriefForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [toastState, setToastState] = useState({ show: false, type: 'success', msg: '' });
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '', industry: '', description: '',
    contactName: '', contactEmail: '', contactPhone: '',
    vision: '', mission: '', coreValues: ['', '', '', ''],
    targetAge: '', targetGender: '', targetLocation: '', targetIncome: '',
    targetInterests: '', painPoints: '',
    competitors: ['', '', ''], competitorStrengths: '', competitorWeaknesses: '', uniqueness: '',
    personality: '', voiceTone: '', traits: ['', '', '', '', ''],
    preferredColors: '', avoidedColors: '', preferredStyle: '',
    inspirationBrands: '', dislikedBrands: '',
    deliverables: {
      logo: false, brandGuidelines: false, businessCard: false,
      letterhead: false, envelope: false, socialMedia: false,
      patches: false, website: false, packaging: false, signage: false, other: ''
    },
    goals: '', timeline: '', budget: '', additionalNotes: ''
  });

  const steps = [
    { title: 'Basic Info',   icon: <Building    size={16} /> },
    { title: 'Vision',       icon: <Compass     size={16} /> },
    { title: 'Audience',     icon: <Users       size={16} /> },
    { title: 'Competition',  icon: <Target      size={16} /> },
    { title: 'Identity',     icon: <Sparkles    size={16} /> },
    { title: 'Visuals',      icon: <Palette     size={16} /> },
    { title: 'Deliverables', icon: <CheckCircle2 size={16} /> },
    { title: 'Goals',        icon: <FileText    size={16} /> },
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('brandBriefData_3b_v2');
      if (saved) setFormData(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('brandBriefData_3b_v2', JSON.stringify(formData));
  }, [formData]);

  const updateField      = (f, v)    => setFormData(p => ({ ...p, [f]: v }));
  const updateArrayField = (f, i, v) => setFormData(p => ({ ...p, [f]: p[f].map((x, j) => j === i ? v : x) }));
  const updateDeliverables = (k, v)  => setFormData(p => ({ ...p, deliverables: { ...p.deliverables, [k]: v } }));

  const nextStep = () => { if (currentStep < steps.length - 1) { setCurrentStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const prevStep = () => { if (currentStep > 0) { setCurrentStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

  const showToast = (type, msg) => {
    setToastState({ show: true, type, msg });
    setTimeout(() => setToastState(t => ({ ...t, show: false })), 5000);
  };

  const handleSubmit = async () => {
    setSending(true);
    const text = buildBriefText(formData);

    // 1. Save locally
    saveSubmission(formData, text);

    // 2. Copy to clipboard
    try { await navigator.clipboard.writeText(text); } catch {}

    // 3. Download .txt
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `brand_brief_${(formData.companyName || 'form').replace(/\s+/g, '_')}_3bstudio.txt`;
    a.click();
    URL.revokeObjectURL(url);

    // 4. Send email via EmailJS
    if (EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_KEY) {
      try {
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          company_name:  formData.companyName || 'New Client',
          client_name:   formData.contactName  || '—',
          client_email:  formData.contactEmail || '—',
          client_phone:  formData.contactPhone || '—',
          brief_content: text,
          reply_to:      formData.contactEmail || '3bsssh@gmail.com',
        }, EMAILJS_KEY);
        showToast('success', 'Brief sent to 3B Studio & downloaded!');
      } catch {
        showToast('warn', 'Downloaded locally — email delivery failed.');
      }
    } else {
      showToast('success', 'Brief copied & downloaded!');
    }

    // 5. Reset draft
    localStorage.removeItem('brandBriefData_3b_v2');
    setSending(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (
        <div className="step-content">
          <div className="step-header">
            <div className="step-number">01</div>
            <h2>Basic Information</h2>
            <p className="step-description">Tell us about your company and key contact points</p>
          </div>
          <div className="form-group">
            <label>Company / Project Name *</label>
            <input type="text" value={formData.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="Enter your company name" />
          </div>
          <div className="form-group">
            <label>Industry / Sector *</label>
            <input type="text" value={formData.industry} onChange={e => updateField('industry', e.target.value)} placeholder="e.g., Technology, F&B, Healthcare, Fashion" />
          </div>
          <div className="form-group">
            <label>Brief Description *</label>
            <textarea value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Describe what your brand does and what makes it unique..." rows="4" />
          </div>
          <div className="section-divider" />
          <h3 className="section-subtitle">Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={formData.contactName} onChange={e => updateField('contactName', e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" value={formData.contactEmail} onChange={e => updateField('contactEmail', e.target.value)} placeholder="you@company.com" />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={formData.contactPhone} onChange={e => updateField('contactPhone', e.target.value)} placeholder="+964 XXX XXX XXXX" />
          </div>
        </div>
      );

      case 1: return (
        <div className="step-content">
          <div className="step-header">
            <div className="step-number">02</div>
            <h2>Vision, Mission & Values</h2>
            <p className="step-description">Define your brand's purpose and long-term aspirational goals</p>
          </div>
          <div className="form-group">
            <label>Vision</label>
            <p className="helper-text">Where do you see your brand in the future?</p>
            <textarea value={formData.vision} onChange={e => updateField('vision', e.target.value)} placeholder="Our dream and direction is to become..." rows="3" />
          </div>
          <div className="form-group">
            <label>Mission</label>
            <p className="helper-text">What is your brand's core purpose today?</p>
            <textarea value={formData.mission} onChange={e => updateField('mission', e.target.value)} placeholder="The immediate problem we solve and premium value we create is..." rows="3" />
          </div>
          <div className="form-group">
            <label>Core Values</label>
            <p className="helper-text">The main principles guiding your actions and systems</p>
            <div className="values-grid">
              {formData.coreValues.map((v, i) => (
                <input key={i} type="text" value={v} onChange={e => updateArrayField('coreValues', i, e.target.value)} placeholder={`Core Value ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      );

      case 2: return (
        <div className="step-content">
          <div className="step-header">
            <div className="step-number">03</div>
            <h2>Target Audience</h2>
            <p className="step-description">Who are the ideal users or consumers you are building for?</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Age Range</label>
              <input type="text" value={formData.targetAge} onChange={e => updateField('targetAge', e.target.value)} placeholder="e.g., 20–40" />
            </div>
            <div className="form-group">
              <label>Gender Focus</label>
              <input type="text" value={formData.targetGender} onChange={e => updateField('targetGender', e.target.value)} placeholder="e.g., Unisex, Female focus" />
            </div>
          </div>
          <div className="form-group">
            <label>Geographic Location</label>
            <input type="text" value={formData.targetLocation} onChange={e => updateField('targetLocation', e.target.value)} placeholder="City, Country, or Region" />
          </div>
          <div className="form-group">
            <label>Income / Purchasing Power Level</label>
            <input type="text" value={formData.targetIncome} onChange={e => updateField('targetIncome', e.target.value)} placeholder="e.g., Premium/High-end, Mid-level" />
          </div>
          <div className="form-group">
            <label>Interests & Behaviors</label>
            <textarea value={formData.targetInterests} onChange={e => updateField('targetInterests', e.target.value)} placeholder="What motivates them? Habits, hobbies, and digital preferences?" rows="3" />
          </div>
          <div className="form-group">
            <label>User Pain Points</label>
            <p className="helper-text">What problems or challenges does your brand solve for them?</p>
            <textarea value={formData.painPoints} onChange={e => updateField('painPoints', e.target.value)} placeholder="e.g., Lack of premium options, slow delivery, bad support..." rows="3" />
          </div>
        </div>
      );

      case 3: return (
        <div className="step-content">
          <div className="step-header">
            <div className="step-number">04</div>
            <h2>Competition Analysis</h2>
            <p className="step-description">Understand your competitors to build a distinct brand identity</p>
          </div>
          <div className="form-group">
            <label>Main Competitors</label>
            <p className="helper-text">List 3 key competitors in your market space</p>
            <div className="values-grid">
              {formData.competitors.map((c, i) => (
                <input key={i} type="text" value={c} onChange={e => updateArrayField('competitors', i, e.target.value)} placeholder={`Competitor Brand ${i + 1}`} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Competitor Strengths</label>
            <textarea value={formData.competitorStrengths} onChange={e => updateField('competitorStrengths', e.target.value)} placeholder="What do they excel at?" rows="3" />
          </div>
          <div className="form-group">
            <label>Competitor Weaknesses</label>
            <textarea value={formData.competitorWeaknesses} onChange={e => updateField('competitorWeaknesses', e.target.value)} placeholder="Where do they struggle?" rows="3" />
          </div>
          <div className="form-group">
            <label>Your Unique Advantage (USP)</label>
            <p className="helper-text">What is your superpower? What makes you irreplaceable?</p>
            <textarea value={formData.uniqueness} onChange={e => updateField('uniqueness', e.target.value)} placeholder="We are the only ones who offer..." rows="3" />
          </div>
        </div>
      );

      case 4: return (
        <div className="step-content">
          <div className="step-header">
            <div className="step-number">05</div>
            <h2>Brand Identity & Voice</h2>
            <p className="step-description">Define the human attributes and communication style of your brand</p>
          </div>
          <div className="form-group">
            <label>Brand Personality</label>
            <p className="helper-text">If your brand was a person, who would they be?</p>
            <textarea value={formData.personality} onChange={e => updateField('personality', e.target.value)} placeholder="e.g., A bold visionary, an elegant specialist..." rows="3" />
          </div>
          <div className="form-group">
            <label>Brand Voice & Tone</label>
            <p className="helper-text">How does your brand write and speak?</p>
            <textarea value={formData.voiceTone} onChange={e => updateField('voiceTone', e.target.value)} placeholder="e.g., Confident, premium, clear, empathetic..." rows="3" />
          </div>
          <div className="form-group">
            <label>Key Brand Traits</label>
            <p className="helper-text">5 main adjectives defining the brand essence</p>
            <div className="traits-grid">
              {formData.traits.map((t, i) => (
                <input key={i} type="text" value={t} onChange={e => updateArrayField('traits', i, e.target.value)} placeholder={`Trait ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      );

      case 5: return (
        <div className="step-content">
          <div className="step-header">
            <div className="step-number">06</div>
            <h2>Visual Direction</h2>
            <p className="step-description">Set visual guards, likes, and boundaries for designers</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Preferred Colors</label>
              <input type="text" value={formData.preferredColors} onChange={e => updateField('preferredColors', e.target.value)} placeholder="e.g., Deep emerald green, champagne gold" />
            </div>
            <div className="form-group">
              <label>Colors to Avoid</label>
              <input type="text" value={formData.avoidedColors} onChange={e => updateField('avoidedColors', e.target.value)} placeholder="e.g., Neon colors, pure primary red" />
            </div>
          </div>
          <div className="form-group">
            <label>Visual Style</label>
            <input type="text" value={formData.preferredStyle} onChange={e => updateField('preferredStyle', e.target.value)} placeholder="e.g., Minimal, Neo-brutalist, Elegant Classic" />
          </div>
          <div className="form-group">
            <label>Inspirational Brands</label>
            <p className="helper-text">Brands you admire visually or strategically</p>
            <textarea value={formData.inspirationBrands} onChange={e => updateField('inspirationBrands', e.target.value)} placeholder="e.g., Apple for simplicity, Nike for storytelling..." rows="3" />
          </div>
          <div className="form-group">
            <label>What to Avoid</label>
            <p className="helper-text">Visual tropes or brand directions that do not resonate</p>
            <textarea value={formData.dislikedBrands} onChange={e => updateField('dislikedBrands', e.target.value)} placeholder="e.g., No generic icon grids, avoid cluttered layouts..." rows="3" />
          </div>
        </div>
      );

      case 6: return (
        <div className="step-content">
          <div className="step-header">
            <div className="step-number">07</div>
            <h2>Deliverables</h2>
            <p className="step-description">Choose the design assets you expect us to create as systems</p>
          </div>
          <div className="deliverables-grid">
            {[
              { key: 'logo',            title: 'Logo System',       desc: 'Master mark, lockups & wordmarks' },
              { key: 'brandGuidelines', title: 'Brand Guidelines',  desc: 'Rules, grid, layouts & typography' },
              { key: 'businessCard',    title: 'Business Cards',    desc: 'Tactile & modern card layouts' },
              { key: 'letterhead',      title: 'Letterhead',        desc: 'Corporate printed layouts' },
              { key: 'envelope',        title: 'Envelopes',         desc: 'Bespoke envelope systems' },
              { key: 'socialMedia',     title: 'Social Media Kits', desc: 'Editable layout templates' },
              { key: 'patches',         title: 'Patches & Merch',   desc: 'Stickers, uniforms or pins' },
              { key: 'website',         title: 'Web Design',        desc: 'UI components & structure' },
              { key: 'packaging',       title: 'Packaging Design',  desc: '3D shapes & structural textures' },
              { key: 'signage',         title: 'Signage & Spatials',desc: 'Exhibition & physical prints' },
            ].map(({ key, title, desc }) => (
              <label key={key} className="deliverable-card">
                <input type="checkbox" checked={formData.deliverables[key]} onChange={e => updateDeliverables(key, e.target.checked)} />
                <div className="card-content">
                  <div className="card-title">{title}</div>
                  <div className="card-desc">{desc}</div>
                </div>
                <div className="card-check">{formData.deliverables[key] && <Check size={14} />}</div>
              </label>
            ))}
          </div>
          <div className="form-group">
            <label>Other Deliverable Requirements</label>
            <input type="text" value={formData.deliverables.other} onChange={e => updateDeliverables('other', e.target.value)} placeholder="List any extra requirements (e.g., dynamic motion templates)" />
          </div>
        </div>
      );

      case 7: return (
        <div className="step-content">
          <div className="step-header">
            <div className="step-number">08</div>
            <h2>Goals & Milestones</h2>
            <p className="step-description">Establish practical deadlines and define project success parameters</p>
          </div>
          <div className="form-group">
            <label>Project Goals</label>
            <textarea value={formData.goals} onChange={e => updateField('goals', e.target.value)} placeholder="What does success look like once we launch?" rows="4" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Expected Timeline</label>
              <input type="text" value={formData.timeline} onChange={e => updateField('timeline', e.target.value)} placeholder="e.g., 4–6 Weeks, Urgent" />
            </div>
            <div className="form-group">
              <label>Allocated Budget Range</label>
              <input type="text" value={formData.budget} onChange={e => updateField('budget', e.target.value)} placeholder="Your budget range" />
            </div>
          </div>
          <div className="form-group">
            <label>Additional Notes / Creative Context</label>
            <textarea value={formData.additionalNotes} onChange={e => updateField('additionalNotes', e.target.value)} placeholder="Is there anything else we should take into account before designing?" rows="4" />
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="brand-brief-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow-x: hidden; }

        .brand-brief-container {
          min-height: 100vh;
          background: #0D0820;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #EDE9FF;
          position: relative;
          overflow: hidden;
        }
        .brand-brief-container::before {
          content: ''; position: fixed; top: -10%; left: -10%;
          width: 55vw; height: 55vw;
          background-image: radial-gradient(circle, rgba(168,156,255,0.13) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .brand-brief-container::after {
          content: ''; position: fixed; bottom: -10%; right: -10%;
          width: 60vw; height: 60vw;
          background-image: radial-gradient(circle, rgba(67,33,150,0.25) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .header {
          position: relative; z-index: 10;
          padding: 40px 24px 30px; text-align: center;
          background: rgba(13,8,32,0.85); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(168,156,255,0.08);
        }
        .logo-wrapper { display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .logo-img { width: 180px; height: auto; display: block; filter: drop-shadow(0 4px 28px rgba(168,156,255,0.4)); }
        .form-title-main { font-size: 28px; font-weight: 800; color: #FFFFFF; margin-top: 16px; margin-bottom: 8px; letter-spacing: -0.5px; }
        .form-subtitle-main { font-size: 15px; color: #9B8FCC; max-width: 600px; margin: 0 auto; }

        .ribbon-container {
          display: flex; justify-content: space-between; align-items: center;
          max-width: 850px; margin: 25px auto 0; gap: 10px;
          overflow-x: auto; padding: 5px 10px 15px; scrollbar-width: none;
        }
        .ribbon-container::-webkit-scrollbar { display: none; }
        .ribbon-item {
          display: flex; flex-direction: column; align-items: center;
          min-width: 80px; opacity: 0.35; transition: all 0.3s ease; cursor: pointer;
        }
        .ribbon-item.active { opacity: 1; }
        .ribbon-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(168,156,255,0.06);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(168,156,255,0.12); color: #C4B8FF;
          margin-bottom: 6px; transition: all 0.3s ease;
        }
        .ribbon-item.active .ribbon-icon {
          background: #432196; border-color: #A89CFF; color: #FFF;
          box-shadow: 0 0 18px rgba(168,156,255,0.35);
        }
        .ribbon-title { font-size: 10px; font-weight: 600; color: #9B8FCC; text-align: center; white-space: nowrap; }
        .ribbon-item.active .ribbon-title { color: #FFFFFF; }

        .progress-container {
          width: 100%; max-width: 800px; margin: 15px auto 0;
          background: rgba(168,156,255,0.08); height: 4px; border-radius: 2px; overflow: hidden;
        }
        .progress-bar {
          height: 100%; background: linear-gradient(90deg, #432196, #A89CFF);
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
        }

        .main-content {
          max-width: 800px; margin: 40px auto 120px;
          background: rgba(24,14,68,0.45);
          border: 1px solid rgba(168,156,255,0.08);
          padding: 48px; border-radius: 24px;
          backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          position: relative; z-index: 10;
        }
        .step-header { margin-bottom: 40px; }
        .step-number { font-size: 12px; font-weight: 800; color: #A89CFF; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
        .step-header h2 { font-size: 26px; color: #FFFFFF; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
        .step-description { color: #9B8FCC; font-size: 14px; line-height: 1.6; }

        .form-group { margin-bottom: 28px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        label { display: block; font-size: 13px; font-weight: 700; color: #EDE9FF; margin-bottom: 8px; letter-spacing: 0.3px; }
        .helper-text { font-size: 12px; color: #9B8FCC; margin-bottom: 10px; margin-top: -2px; }

        input[type="text"], input[type="email"], input[type="tel"], textarea {
          width: 100%; padding: 14px 18px;
          border: 1px solid rgba(168,156,255,0.1); border-radius: 12px;
          font-family: inherit; font-size: 14px; color: #FFFFFF;
          background: rgba(168,156,255,0.04); transition: all 0.25s ease;
        }
        input::placeholder, textarea::placeholder { color: #6B5FA0; }
        input:focus, textarea:focus {
          outline: none; border-color: #A89CFF;
          background: rgba(24,14,68,0.7);
          box-shadow: 0 0 0 4px rgba(168,156,255,0.12);
        }
        textarea { resize: vertical; }

        .values-grid, .traits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .section-divider { height: 1px; background: rgba(168,156,255,0.08); margin: 40px 0; }
        .section-subtitle { font-size: 16px; font-weight: 700; margin-bottom: 24px; color: #FFFFFF; letter-spacing: -0.3px; }

        .deliverables-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; }
        .deliverable-card {
          border: 1px solid rgba(168,156,255,0.08); border-radius: 14px; padding: 18px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; background: rgba(168,156,255,0.03);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1); position: relative;
        }
        .deliverable-card input[type="checkbox"] { position: absolute; opacity: 0; cursor: pointer; }
        .card-content { padding-right: 15px; }
        .card-title { font-size: 14px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px; }
        .card-desc { font-size: 12px; color: #9B8FCC; }
        .card-check {
          width: 20px; height: 20px; border-radius: 6px;
          border: 2px solid rgba(168,156,255,0.2);
          display: flex; align-items: center; justify-content: center;
          color: white; transition: all 0.2s ease; flex-shrink: 0;
        }
        .deliverable-card:hover { background: rgba(168,156,255,0.07); border-color: rgba(168,156,255,0.18); transform: translateY(-1px); }
        .deliverable-card:has(input:checked) { border-color: #A89CFF; background: rgba(67,33,150,0.18); box-shadow: 0 4px 20px rgba(168,156,255,0.12); }
        .deliverable-card:has(input:checked) .card-check { background: #432196; border-color: #A89CFF; }

        .form-actions {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 50px; padding-top: 30px;
          border-top: 1px solid rgba(168,156,255,0.08);
        }
        .btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          border: none; font-family: inherit;
        }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        .btn-secondary { background: rgba(168,156,255,0.06); color: #9B8FCC; border: 1px solid rgba(168,156,255,0.1); }
        .btn-secondary:hover { color: #FFFFFF; background: rgba(168,156,255,0.12); }
        .btn-primary { background: linear-gradient(135deg, #432196 0%, #5B35B8 100%); color: white; margin-left: auto; box-shadow: 0 4px 20px rgba(67,33,150,0.4); }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(67,33,150,0.55); }
        .btn-submit { background: linear-gradient(135deg, #A89CFF 0%, #432196 100%); color: white; margin-left: auto; box-shadow: 0 4px 20px rgba(168,156,255,0.3); }
        .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(168,156,255,0.45); }

        .toast {
          position: fixed; bottom: 40px; right: 40px;
          background: #180E44; border: 1px solid #A89CFF;
          padding: 16px 24px; border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 18px rgba(168,156,255,0.2);
          display: flex; align-items: center; gap: 12px;
          z-index: 1000; color: #FFFFFF; font-weight: 600; font-size: 14px;
          transform: translateY(100px); opacity: 0;
          transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .toast.visible { transform: translateY(0); opacity: 1; }
        .toast.warn { border-color: #f59e0b; }
        .toast-icon {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .toast-icon.success { color: #A89CFF; background: rgba(168,156,255,0.12); }
        .toast-icon.warn    { color: #f59e0b; background: rgba(245,158,11,0.12); }

        @media (max-width: 768px) {
          .main-content { padding: 30px 20px; margin: 30px 15px; }
          .form-row, .deliverables-grid, .values-grid, .traits-grid { grid-template-columns: 1fr; }
          .btn { padding: 12px 20px; width: 100%; justify-content: center; }
          .form-actions { flex-direction: column-reverse; gap: 12px; }
          .btn-primary, .btn-submit { margin-left: 0; }
          .toast { bottom: 20px; right: 16px; left: 16px; }
        }
      `}</style>

      <div className="header">
        <div className="logo-wrapper">
          <img src={logo3B} alt="3B Studio" className="logo-img" />
        </div>
        <h1 className="form-title-main">Brand Identity Design Brief</h1>
        <p className="form-subtitle-main">Let's craft your identity into a consistent creative system. Progress systematically.</p>

        <div className="ribbon-container">
          {steps.map((step, idx) => (
            <div key={idx} className={`ribbon-item ${currentStep === idx ? 'active' : ''}`} onClick={() => setCurrentStep(idx)}>
              <div className="ribbon-icon">{step.icon}</div>
              <span className="ribbon-title">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="main-content">
        {renderStep()}
        <div className="form-actions">
          {currentStep > 0 && (
            <button type="button" className="btn btn-secondary" onClick={prevStep}>
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" className="btn btn-submit" onClick={handleSubmit} disabled={sending}>
              {sending ? (
                <><Mail size={16} /> Sending...</>
              ) : (
                <><Send size={16} /> Submit Brief</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className={`toast ${toastState.show ? 'visible' : ''} ${toastState.type === 'warn' ? 'warn' : ''}`}>
        <div className={`toast-icon ${toastState.type}`}>
          {toastState.type === 'success' ? <Check size={14} /> : <Mail size={14} />}
        </div>
        <div>
          <p style={{ margin: 0 }}>{toastState.msg}</p>
          <span style={{ fontSize: '11px', color: '#9B8FCC', fontWeight: '400' }}>3B Studio received your brief</span>
        </div>
      </div>
    </div>
  );
}
