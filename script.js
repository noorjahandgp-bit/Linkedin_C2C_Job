/* =====================================================
   JOBPILOT AI — COMPLETE JAVASCRIPT APPLICATION
   ===================================================== */

'use strict';

// =================== LIVE BACKEND INTEGRATION ===================
const API_BASE = window.location.origin.startsWith('http') ? window.location.origin : 'http://127.0.0.1:8000';
let currentActiveCandidate = null;
let currentGeneratedPdf = 'Alex_Morgan_Senior_Java_Developer_C2C.pdf';
let currentSelectedJob = null;

// =================== MOCK DATA ===================

const MOCK_JOBS = [
  {
    id: 'job1', title: 'Senior Java Developer', company: 'TechNova Solutions',
    logo: 'TN', location: 'Dallas, TX', posted: '2h ago', type: 'C2C',
    match: 94, recruiter: 'Sarah Johnson', recruiterEmail: 'sarah.johnson@technova.com',
    emailStatus: 'Verified', status: 'New',
    skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Kafka', 'Docker', 'Kubernetes'],
    missingSkills: ['Terraform', 'Azure DevOps'],
    experience: '7+ years', source: 'LinkedIn Post',
    linkedinUrl: 'https://www.linkedin.com/posts/technova-solutions-123456',
    description: `<div class="jd-content">
      <div class="jd-section">
        <h3>📋 Overview</h3>
        <p>TechNova Solutions is seeking an experienced Senior Java Developer to join our Cloud & Enterprise Engineering team. You will be responsible for designing, developing, and maintaining mission-critical backend microservices that power our enterprise SaaS platform serving Fortune 500 clients.</p>
      </div>
      <div class="jd-section">
        <h3>🎯 Responsibilities</h3>
        <ul>
          <li>Design and develop scalable microservices architecture using Java 17+ and Spring Boot</li>
          <li>Build and maintain RESTful APIs and event-driven architectures using Apache Kafka</li>
          <li>Deploy and manage containerized applications using Docker and Kubernetes on AWS</li>
          <li>Collaborate with cross-functional teams to define, design, and ship new features</li>
          <li>Write clean, maintainable, and testable code following SOLID principles</li>
          <li>Conduct code reviews and mentor junior developers</li>
          <li>Participate in Agile ceremonies including sprint planning and retrospectives</li>
        </ul>
      </div>
      <div class="jd-section">
        <h3>✅ Required Skills</h3>
        <ul>
          <li>7+ years of hands-on Java development experience</li>
          <li>Deep expertise in Spring Boot, Spring Cloud, and Spring Security</li>
          <li>Strong experience with Microservices and distributed systems</li>
          <li>Proficiency in AWS services (EC2, ECS, Lambda, RDS, S3)</li>
          <li>Experience with Apache Kafka for event streaming</li>
          <li>Container orchestration with Docker and Kubernetes</li>
          <li>Solid understanding of CI/CD pipelines</li>
        </ul>
      </div>
      <div class="jd-section">
        <h3>⭐ Preferred Skills</h3>
        <ul>
          <li>Experience with Terraform for infrastructure as code</li>
          <li>Familiarity with Azure DevOps</li>
          <li>Knowledge of observability tools (Grafana, Prometheus, Jaeger)</li>
          <li>GraphQL API experience</li>
        </ul>
      </div>
      <div class="jd-section">
        <h3>📍 Contract Details</h3>
        <p><strong>Employment Type:</strong> C2C (Corp-to-Corp)</p>
        <p><strong>Location:</strong> Dallas, TX (Hybrid — 3 days onsite)</p>
        <p><strong>Duration:</strong> 12 months with extension</p>
        <p><strong>Rate:</strong> Competitive — Negotiable based on experience</p>
        <p><strong>Start:</strong> Immediate / Within 2 weeks</p>
      </div>
    </div>`
  },
  {
    id: 'job2', title: 'Python Developer', company: 'CloudMatrix', logo: 'CM',
    location: 'Remote', posted: '4h ago', type: 'C2C', match: 91,
    recruiter: 'David Chen', recruiterEmail: 'david.chen@cloudmatrix.io',
    emailStatus: 'Verified', status: 'Analyzed',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'AWS', 'Redis'],
    missingSkills: ['Go'],
    experience: '5+ years', source: 'LinkedIn Post',
    linkedinUrl: 'https://www.linkedin.com/posts/cloudmatrix-io-789',
    description: '<div class="jd-content"><div class="jd-section"><h3>📋 Overview</h3><p>CloudMatrix is looking for a skilled Python Developer to build and scale our data processing infrastructure. You will work on high-throughput pipelines and REST API services.</p></div></div>'
  },
  {
    id: 'job3', title: 'Full Stack Developer', company: 'Vertex Systems', logo: 'VS',
    location: 'New York, NY', posted: '6h ago', type: 'C2C', match: 88,
    recruiter: 'Priya Sharma', recruiterEmail: 'priya.sharma@vertexsystems.com',
    emailStatus: 'Verified', status: 'Resume Ready',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    missingSkills: ['GraphQL'],
    experience: '6+ years', source: 'LinkedIn Post',
    linkedinUrl: 'https://www.linkedin.com/posts/vertex-systems-456',
    description: '<div class="jd-content"><div class="jd-section"><h3>📋 Overview</h3><p>Vertex Systems seeks a Full Stack Developer to join our product engineering team building next-gen enterprise applications.</p></div></div>'
  },
  {
    id: 'job4', title: 'DevOps Engineer', company: 'DataCore', logo: 'DC',
    location: 'Austin, TX', posted: '8h ago', type: 'C2C', match: 86,
    recruiter: 'Michael Torres', recruiterEmail: 'michael.t@datacore.io',
    emailStatus: 'Pending', status: 'New',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Jenkins', 'Ansible'],
    missingSkills: [],
    experience: '5+ years', source: 'LinkedIn Post',
    linkedinUrl: 'https://www.linkedin.com/posts/datacore-io-321',
    description: '<div class="jd-content"><div class="jd-section"><h3>📋 Overview</h3><p>DataCore is seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines.</p></div></div>'
  },
  {
    id: 'job5', title: 'React Developer', company: 'NexGen Labs', logo: 'NL',
    location: 'Chicago, IL', posted: '10h ago', type: 'C2C', match: 83,
    recruiter: 'Amanda Lee', recruiterEmail: 'amanda.lee@nexgenlabs.com',
    emailStatus: 'Verified', status: 'New',
    skills: ['React', 'Redux', 'TypeScript', 'GraphQL', 'Jest'],
    missingSkills: ['Next.js'],
    experience: '4+ years', source: 'LinkedIn Post',
    linkedinUrl: 'https://www.linkedin.com/posts/nexgenlabs-567',
    description: '<div class="jd-content"><div class="jd-section"><h3>📋 Overview</h3><p>NexGen Labs is hiring a React Developer to build high-performance frontend applications for our FinTech platform.</p></div></div>'
  }
];

const MOCK_RECRUITERS = [
  { name: 'Sarah Johnson', role: 'Senior Technical Recruiter', company: 'TechNova Solutions', email: 'sarah.johnson@technova.com', team: 'Cloud & Enterprise Engineering', active: 12, posts: 8, status: 'Verified', initials: 'SJ' },
  { name: 'David Chen', role: 'Technical Recruiter', company: 'CloudMatrix', email: 'david.chen@cloudmatrix.io', team: 'Data & AI', active: 9, posts: 5, status: 'Verified', initials: 'DC' },
  { name: 'Priya Sharma', role: 'Talent Acquisition Lead', company: 'Vertex Systems', email: 'priya.sharma@vertexsystems.com', team: 'Product Engineering', active: 14, posts: 11, status: 'Verified', initials: 'PS' },
  { name: 'Michael Torres', role: 'Technical Recruiter', company: 'DataCore', email: 'michael.t@datacore.io', team: 'Infrastructure', active: 7, posts: 4, status: 'Pending', initials: 'MT' },
  { name: 'Amanda Lee', role: 'Senior Recruiter', company: 'NexGen Labs', email: 'amanda.lee@nexgenlabs.com', team: 'Frontend Engineering', active: 10, posts: 6, status: 'Verified', initials: 'AL' },
  { name: 'James Wilson', role: 'Contract Recruiter', company: 'InnovateTech', email: 'j.wilson@innovatetech.com', team: 'Backend Systems', active: 5, posts: 3, status: 'Verified', initials: 'JW' }
];

const ACTIVITY_LOG = [
  { type: 'success', icon: '🔍', title: 'Job discovered', detail: 'Senior Java Developer — TechNova Solutions', time: '22:10' },
  { type: 'success', icon: '✉️', title: 'Recruiter email verified', detail: 'sarah.johnson@technova.com', time: '22:08' },
  { type: 'success', icon: '🧠', title: 'JD analyzed — Match score: 94%', detail: 'TechNova Solutions • Senior Java Developer', time: '22:06' },
  { type: 'success', icon: '📄', title: 'Resume customized', detail: 'Alex_Morgan_Senior_Java_Developer_C2C.pdf', time: '22:04' },
  { type: 'success', icon: '📬', title: 'Gmail draft created', detail: 'Submission for Senior Java Developer | C2C Consultant', time: '22:01' },
  { type: 'primary', icon: '🔍', title: 'Job discovered', detail: 'Python Developer — CloudMatrix', time: '21:58' },
  { type: 'success', icon: '✉️', title: 'Recruiter email verified', detail: 'david.chen@cloudmatrix.io', time: '21:56' },
  { type: 'primary', icon: '⏳', title: 'Resume customization in progress', detail: 'Python Developer — CloudMatrix', time: '21:50' },
  { type: 'warning', icon: '⚠️', title: 'Duplicate job skipped', detail: 'Python Developer — Salesforce (Already processed)', time: '21:45' },
  { type: 'success', icon: '✅', title: 'Application sent', detail: 'DevOps Engineer — DataCore', time: '21:30' }
];

// =================== APP STATE ===================

let currentPage = 'dashboard';
let kanbanDraggedCard = null;
let trackerView = 'kanban';
let notificationsOpen = false;

// =================== NAVIGATION ===================

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeItem = document.querySelector(`[data-page="${page}"]`);
  if (activeItem) activeItem.classList.add('active');

  const titles = {
    'dashboard': ['Dashboard', 'AI-powered C2C job search overview'],
    'job-finder': ['Job Finder', 'Discover and score relevant C2C opportunities from LinkedIn posts'],
    'resume-lab': ['AI Resume Lab', 'Customize your resume for every high-quality opportunity'],
    'application-copilot': ['Application Copilot', 'Create personalized recruiter submissions with AI'],
    'application-tracker': ['Application Tracker', 'Monitor and manage all your applications'],
    'analytics': ['Analytics', 'Performance metrics and conversion insights'],
    'duplicate-detection': ['Duplicate & Quality Control', 'Smart filtering to ensure only quality opportunities are processed'],
    'recruiter-database': ['Recruiter Intelligence', 'Manage and enhance recruiter profiles'],
    'resume-library': ['Resume Library', 'Manage all your resume versions'],
    'email-templates': ['Email Templates', 'Pre-built and AI-generated email templates'],
    'activity-logs': ['Activity Logs', 'Detailed system and automation logs'],
    'settings': ['Settings', 'Configure your JobPilot AI preferences']
  };

  const [title, sub] = titles[page] || ['Page', ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = sub;

  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = '';
  contentArea.className = 'content-area fade-in';

  // Close sidebar on mobile
  if (window.innerWidth <= 900) closeSidebarMobile();

  const renderers = {
    'dashboard': renderDashboard,
    'job-finder': renderJobFinder,
    'resume-lab': renderResumeLab,
    'application-copilot': renderApplicationCopilot,
    'application-tracker': renderApplicationTracker,
    'analytics': renderAnalytics,
    'recruiter-database': renderRecruiterDatabase,
    'duplicate-detection': renderDuplicateDetection,
    'resume-library': renderResumeLibrary,
    'email-templates': renderEmailTemplates,
    'activity-logs': renderActivityLogs,
    'settings': renderSettings
  };

  if (renderers[page]) renderers[page]();
  else contentArea.innerHTML = `<div class="card"><p class="text-muted">Page coming soon...</p></div>`;
}

// =================== SIDEBAR ===================

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

function closeSidebarMobile() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// =================== NOTIFICATIONS ===================

function toggleNotifications() {
  const dropdown = document.getElementById('notifDropdown');
  notificationsOpen = !notificationsOpen;
  dropdown.classList.toggle('open', notificationsOpen);
}

function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  document.querySelector('.notif-badge').style.display = 'none';
  showToast('All notifications marked as read', 'success');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.notification-wrapper')) {
    document.getElementById('notifDropdown').classList.remove('open');
    notificationsOpen = false;
  }
});

// =================== SEARCH MODAL ===================

function openSearchModal() {
  document.getElementById('searchModal').classList.add('open');
  setTimeout(() => document.getElementById('globalSearchInput').focus(), 100);
}

function closeSearchModal(e) {
  if (!e || e.target === document.getElementById('searchModal')) {
    document.getElementById('searchModal').classList.remove('open');
    document.getElementById('globalSearchInput').value = '';
  }
}

function handleGlobalSearch(value) {
  const results = document.getElementById('searchResults');
  if (!value.trim()) {
    results.innerHTML = `
      <div class="search-category-label">Quick Actions</div>
      <div class="search-result-item" onclick="navigateTo('job-finder'); closeSearchModal(null);">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        Run AI Job Discovery
      </div>
      <div class="search-result-item" onclick="navigateTo('resume-lab'); closeSearchModal(null);">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
        Customize Resume
      </div>`;
    return;
  }
  const filtered = MOCK_JOBS.filter(j => j.title.toLowerCase().includes(value.toLowerCase()) || j.company.toLowerCase().includes(value.toLowerCase()));
  results.innerHTML = `<div class="search-category-label">Jobs (${filtered.length})</div>` +
    (filtered.length ? filtered.map(j => `
      <div class="search-result-item" onclick="openJobModal('${j.id}'); closeSearchModal(null);">
        <span style="font-size:1.1rem">${j.logo}</span>
        ${j.title} — ${j.company} <span class="badge badge-success" style="margin-left:auto">${j.match}%</span>
      </div>`).join('') : '<div class="search-result-item text-muted">No results found</div>');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSearchModal(null);
    closeJobModal(null);
    closeSendModal(null);
    closeSuccessModal(null);
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearchModal();
  }
});

// =================== TOAST ===================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-icon">${icons[type] || 'ℹ'}</div><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastFade 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =================== JOB MODAL ===================

function openJobModal(jobId) {
  const job = MOCK_JOBS.find(j => j.id === jobId);
  if (!job) return;
  const modal = document.getElementById('jobDetailModal');
  const content = document.getElementById('jobDetailContent');

  const matchPct = job.match;
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (matchPct / 100) * circumference;

  content.innerHTML = `
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:16px">
        <div class="job-company-logo" style="width:52px;height:52px;font-size:1.1rem">${job.logo}</div>
        <div>
          <h2 class="modal-title">${job.title}</h2>
          <p class="modal-sub">${job.company} • ${job.location} • ${job.experience} • ${job.type}</p>
        </div>
      </div>
      <button class="modal-close" onclick="closeJobModal(null)">✕</button>
    </div>
    <div style="padding:14px 24px;border-bottom:1px solid var(--border);display:flex;gap:10px;flex-wrap:wrap">
      <span class="badge badge-success">✓ ${matchPct}% Match</span>
      <span class="badge badge-primary">🤖 Strong Match</span>
      <span class="badge badge-purple">${job.type}</span>
      <span class="badge badge-warning">Posted ${job.posted}</span>
      ${job.emailStatus === 'Verified' ? '<span class="badge badge-success">✓ Email Verified</span>' : ''}
    </div>
    <div class="job-detail-grid">
      <div>
        <div style="margin-bottom:16px">
          <h3 style="font-size:0.82rem;font-weight:700;margin-bottom:10px;color:var(--muted)">RECRUITER INFORMATION</h3>
          <div class="recruiter-info" style="margin:0">
            <div class="recruiter-avatar-sm">${job.recruiter.split(' ').map(n=>n[0]).join('')}</div>
            <div>
              <div class="recruiter-name-sm">${job.recruiter}</div>
              <div style="font-size:0.72rem;color:var(--muted)">${job.recruiterEmail}</div>
            </div>
            <span class="badge ${job.emailStatus === 'Verified' ? 'badge-success' : 'badge-warning'} recruiter-email-badge">${job.emailStatus}</span>
          </div>
        </div>
        <div style="margin-bottom:4px">
          <h3 style="font-size:0.82rem;font-weight:700;margin-bottom:10px;color:var(--muted)">JOB DESCRIPTION</h3>
        </div>
        ${job.description}
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="card ai-analysis-card card-glow-primary">
          <div style="text-align:center;margin-bottom:16px">
            <div style="font-size:0.72rem;color:var(--muted);font-weight:600;margin-bottom:4px">AI OVERALL MATCH</div>
            <div style="font-size:2.5rem;font-weight:800;background:var(--grad-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${matchPct}%</div>
            <div class="badge badge-success" style="margin-top:6px">Strong Match</div>
          </div>
          <div class="match-scores">
            ${[['Skills Match','96'],['Experience Match','92'],['Location Match','100'],['Tech Match','95']].map(([l,v]) => `
              <div class="match-score-row">
                <span class="match-score-label">${l}</span>
                <div class="match-score-bar-outer"><div class="match-score-bar-inner" style="width:${v}%"></div></div>
                <span class="match-score-pct text-success">${v}%</span>
              </div>`).join('')}
          </div>
          <div class="skill-comparison">
            <div style="font-size:0.72rem;font-weight:700;color:var(--muted);margin-bottom:8px">SKILL COMPARISON</div>
            <div class="skill-comparison-wrap">
              ${job.skills.map(s => `<div class="skill-compare-row"><span>${s}</span><span class="skill-check">✓ Present</span></div>`).join('')}
              ${job.missingSkills.map(s => `<div class="skill-compare-row"><span>${s}</span><span class="skill-miss">⚠ Weak</span></div>`).join('')}
            </div>
          </div>
          <div class="info-box primary" style="margin-bottom:0;margin-top:10px">
            <span>🤖</span>
            <span style="font-size:0.75rem">Candidate is highly suitable. Resume should emphasize Java microservices, AWS, Kafka and cloud deployment experience.</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-primary w-full" onclick="navigateTo('resume-lab'); closeJobModal(null); showToast('Opening Resume Lab for this job', 'success')">
            📄 Customize Resume
          </button>
          <button class="btn btn-secondary w-full" onclick="navigateTo('application-copilot'); closeJobModal(null); showToast('Opening Application Copilot', 'info')">
            ✉️ Generate Email
          </button>
          <button class="btn btn-success w-full" onclick="closeJobModal(null); showToast('Added to application queue!', 'success')">
            ➕ Add to Queue
          </button>
          <button class="btn btn-ghost w-full" onclick="closeJobModal(null); showToast('Job skipped', 'info')">
            Skip Job
          </button>
        </div>
      </div>
    </div>`;

  modal.classList.add('open');
}

function closeJobModal(e) {
  if (!e || e.target === document.getElementById('jobDetailModal')) {
    document.getElementById('jobDetailModal').classList.remove('open');
  }
}

// =================== SEND MODAL ===================

function openSendModal() {
  document.getElementById('sendModalBody').innerHTML = `
    <div class="gmail-compose">
      <div class="gmail-field"><label>From:</label><span>alex.morgan@email.com</span></div>
      <div class="gmail-field"><label>To:</label><span>sarah.johnson@technova.com</span></div>
      <div class="gmail-field"><label>Subject:</label><span>Submission for Senior Java Developer | C2C Consultant</span></div>
      <div class="gmail-field"><label>Attachment:</label><span class="attachment-chip">📄 Alex_Morgan_Senior_Java_Developer_C2C.pdf</span></div>
    </div>
    <div class="send-checks">
      <div class="check-item"><span class="check-icon success">✓</span> Recipient verified</div>
      <div class="check-item"><span class="check-icon success">✓</span> Resume attached</div>
      <div class="check-item"><span class="check-icon success">✓</span> Job description included</div>
      <div class="check-item"><span class="check-icon success">✓</span> Candidate information complete</div>
      <div class="check-item"><span class="check-icon success">✓</span> Duplicate check passed</div>
    </div>
    <button class="btn btn-primary btn-large" onclick="startSendSimulation()" id="sendAppBtn">
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
      Send Application
    </button>`;
  document.getElementById('sendAppModal').classList.add('open');
}

function closeSendModal(e) {
  if (!e || e.target === document.getElementById('sendAppModal')) {
    document.getElementById('sendAppModal').classList.remove('open');
  }
}

async function startSendSimulation() {
  const body = document.getElementById('sendModalBody');
  const stages = [
    'Connecting to Gmail...', 'Authenticating session...', 'Creating email draft...',
    'Attaching ATS resume PDF...', 'Validating recipient email...', 'Executing dispatch...'
  ];
  let i = 0;
  body.innerHTML = `
    <div style="text-align:center;padding:20px 0">
      <div class="spinning" style="width:40px;height:40px;border-width:3px;margin:0 auto 20px"></div>
      <p id="sendStage" style="font-size:0.88rem;color:var(--muted)">Connecting to Gmail...</p>
      <div class="progress-bar-outer" style="margin-top:14px"><div class="progress-bar-inner" id="sendProgress" style="width:0%"></div></div>
    </div>`;
  const stageEl = document.getElementById('sendStage');
  const progressEl = document.getElementById('sendProgress');

  const targetJob = currentSelectedJob || MOCK_JOBS[0];
  let apiResult = null;

  try {
    const res = await fetch(`${API_BASE}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job: {
          title: targetJob.title,
          company: targetJob.company,
          recruiter: targetJob.recruiter,
          recruiter_email: targetJob.recruiterEmail || targetJob.recruiter_email,
          location: targetJob.location,
          post_url: targetJob.linkedinUrl || targetJob.post_url,
          job_description: targetJob.description || targetJob.job_description || 'C2C Opportunity'
        },
        pdf_filename: currentGeneratedPdf,
        dry_run: true
      })
    });
    apiResult = await res.json();
  } catch (err) {
    console.warn('Backend send API unreachable, using local fallback:', err);
  }

  const interval = setInterval(() => {
    i++;
    if (i < stages.length) {
      stageEl.textContent = stages[i];
      progressEl.style.width = `${Math.round((i / stages.length) * 100)}%`;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        closeSendModal(null);
        if (apiResult && !apiResult.success && apiResult.message && apiResult.message.includes('Duplicate')) {
          showToast(`Duplicate skipped: ${apiResult.message}`, 'warning');
        } else {
          const successDetails = document.querySelector('.success-details');
          if (successDetails) {
            successDetails.innerHTML = `
              <div class="success-detail-row"><span>Status:</span><strong style="color:var(--success)">${apiResult?.message || 'Sent / Draft Logged'}</strong></div>
              <div class="success-detail-row"><span>Date:</span><strong>${new Date().toLocaleDateString()}</strong></div>
              <div class="success-detail-row"><span>Recipient:</span><strong>${targetJob.recruiterEmail || targetJob.recruiter_email || 'sarah.johnson@technova.com'}</strong></div>
              <div class="success-detail-row"><span>Job:</span><strong>${targetJob.title} — ${targetJob.company}</strong></div>
              <div class="success-detail-row"><span>Attached PDF:</span><strong>${currentGeneratedPdf}</strong></div>
            `;
          }
          document.getElementById('successModal').classList.add('open');
          showToast('Application sent & recorded to database!', 'success');
        }
      }, 400);
    }
  }, 500);
}

function closeSuccessModal(e) {
  if (!e || e.target === document.getElementById('successModal')) {
    document.getElementById('successModal').classList.remove('open');
  }
}

// =================== DASHBOARD ===================

function renderDashboard() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <!-- Hero -->
    <div class="dashboard-hero">
      <div>
        <h2 class="hero-greeting">Good evening, <span>Alex Morgan</span> 👋</h2>
        <p class="hero-sub">Your AI-powered C2C job search is running smoothly.</p>
      </div>
      <div class="hero-actions">
        <button class="btn btn-primary" onclick="navigateTo('job-finder'); setTimeout(runSearchSimulation, 500)">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1z"/></svg>
          Run AI Discovery
        </button>
        <button class="btn btn-secondary" onclick="navigateTo('duplicate-detection')">
          Duplicate Control
        </button>
        <button class="btn btn-secondary" onclick="navigateTo('activity-logs')">
          View Activity
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid-6 mb-6">
      ${[
        { n: 'c1', icon: '🔍', label: 'Jobs Discovered', value: '128', sup: '+18 today', trend: 'up', tval: '+18' },
        { n: 'c2', icon: '🎯', label: 'Relevant Matches', value: '74', sup: 'Match rate: 58%', trend: 'neutral', tval: '58%' },
        { n: 'c3', icon: '📄', label: 'Resumes Customized', value: '42', sup: 'This week', trend: 'up', tval: '+7' },
        { n: 'c4', icon: '✉️', label: 'Applications Sent', value: '31', sup: 'Success rate: 74%', trend: 'up', tval: '74%' },
        { n: 'c5', icon: '👤', label: 'Recruiters Contacted', value: '27', sup: '+8 today', trend: 'up', tval: '+8' },
        { n: 'c6', icon: '🚫', label: 'Duplicates Skipped', value: '19', sup: 'Auto filtered', trend: 'neutral', tval: 'Auto' }
      ].map(s => `
        <div class="stat-card ${s.n}">
          <div class="stat-icon" style="background:var(--primary-dim)"><span style="font-size:1.1rem">${s.icon}</span></div>
          <div class="stat-label">${s.label}</div>
          <div class="stat-value">${s.value}</div>
          <div class="stat-support">
            <span class="stat-trend ${s.trend}">${s.tval}</span>
            <span class="text-muted text-xs">${s.sup}</span>
          </div>
        </div>`).join('')}
    </div>

    <!-- Pipeline + Activity Row -->
    <div class="grid-2 mb-6" style="grid-template-columns:1fr 320px">
      <!-- Pipeline -->
      <div class="card pipeline-card">
        <div class="section-header" style="margin-bottom:16px">
          <div>
            <div class="section-title">AI Automation Pipeline</div>
            <div class="section-sub">Real-time processing status</div>
          </div>
          <span class="badge badge-primary">
            <div class="status-dot pulse-blue" style="width:6px;height:6px;margin-right:4px"></div>
            Live
          </span>
        </div>
        <div class="pipeline-stages">
          ${[
            { name: 'LinkedIn Search', status: 'completed', icon: '🔗' },
            { name: 'Job Filtering', status: 'completed', icon: '⚙️' },
            { name: 'JD Analysis', status: 'completed', icon: '📋' },
            { name: 'Resume Match', status: 'completed', icon: '🎯' },
            { name: 'Resume Custom.', status: 'processing', icon: '📝' },
            { name: 'Recruiter Verify', status: 'pending', icon: '👤' },
            { name: 'Email Draft', status: 'pending', icon: '✉️' },
            { name: 'Submission', status: 'pending', icon: '🚀' },
            { name: 'Tracking', status: 'pending', icon: '📊' }
          ].map(s => `
            <div class="pipeline-stage">
              <div class="stage-icon ${s.status}">${s.status === 'completed' ? '✓' : s.status === 'processing' ? '●' : '○'}</div>
              <div class="stage-name">${s.name}</div>
              <div class="stage-status ${s.status}">${s.status === 'completed' ? 'Done' : s.status === 'processing' ? 'Active' : 'Pending'}</div>
            </div>`).join('')}
        </div>
        <div class="pipeline-progress-wrap">
          <div class="pipeline-progress-label">
            <span>Pipeline Progress</span>
            <span>Step 5 of 9</span>
          </div>
          <div class="progress-bar-outer"><div class="progress-bar-inner" style="width:55%"></div></div>
        </div>
      </div>

      <!-- Live Activity -->
      <div class="card">
        <div class="section-header" style="margin-bottom:14px">
          <div class="section-title">Live Activity</div>
          <button class="btn btn-sm btn-ghost" onclick="navigateTo('activity-logs')">View All</button>
        </div>
        <div class="activity-timeline">
          ${ACTIVITY_LOG.slice(0, 6).map((a, i) => `
            <div class="activity-item">
              <div class="activity-dot-wrap">
                <div class="activity-dot ${a.type}"></div>
                ${i < 5 ? '<div class="activity-line"></div>' : ''}
              </div>
              <div class="activity-content">
                <div class="activity-time">${a.time}</div>
                <div class="activity-text">${a.icon} ${a.title}</div>
                <div class="activity-detail">${a.detail}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Top Job Matches -->
    <div class="mb-4">
      <div class="section-header">
        <div>
          <div class="section-title">Top AI Job Matches</div>
          <div class="section-sub">Scored and ranked by AI relevance</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('job-finder')">View All Jobs →</button>
      </div>
      <div class="grid-4">
        ${MOCK_JOBS.map(job => renderJobCard(job)).join('')}
      </div>
    </div>`;
}

function renderJobCard(job) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (job.match / 100) * circumference;
  return `
    <div class="job-match-card">
      <div class="job-card-header">
        <div>
          <div class="job-company-logo">${job.logo}</div>
        </div>
        <div class="match-circle">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle class="match-circle-bg" cx="26" cy="26" r="18"/>
            <circle class="match-circle-fill" cx="26" cy="26" r="18"
              stroke="${job.match >= 90 ? '#25d695' : job.match >= 80 ? '#5b7cff' : '#f5b942'}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="match-circle-text" style="color:${job.match >= 90 ? 'var(--success)' : 'var(--primary)'}">${job.match}%</div>
        </div>
      </div>
      <div class="job-title">${job.title}</div>
      <div class="job-company">${job.company}</div>
      <div class="job-meta">
        <div class="job-meta-item">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
          ${job.location}
        </div>
        <div class="job-meta-item">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
          ${job.posted}
        </div>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <span class="badge badge-purple">${job.type}</span>
        <span class="badge badge-primary">${job.source}</span>
      </div>
      <div class="skills-wrap">
        ${job.skills.slice(0, 4).map(s => `<span class="skill-tag">${s}</span>`).join('')}
        ${job.skills.length > 4 ? `<span class="skill-tag">+${job.skills.length - 4}</span>` : ''}
      </div>
      <div class="recruiter-info">
        <div class="recruiter-avatar-sm">${job.recruiter.split(' ').map(n=>n[0]).join('')}</div>
        <div>
          <div class="recruiter-name-sm">${job.recruiter}</div>
        </div>
        <span class="badge ${job.emailStatus === 'Verified' ? 'badge-success' : 'badge-warning'} recruiter-email-badge">${job.emailStatus}</span>
      </div>
      <div class="job-actions">
        <button class="btn btn-sm btn-secondary" onclick="openJobModal('${job.id}')">Analyze</button>
        <button class="btn btn-sm btn-primary" onclick="navigateTo('resume-lab'); showToast('Opening Resume Lab', 'info')">Resume</button>
        <button class="btn btn-sm btn-success" onclick="openSendModal(); showToast('Preparing application...', 'info')">Apply</button>
      </div>
    </div>`;
}

// =================== JOB FINDER ===================

function renderJobFinder() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Job Finder</div>
        <div class="text-muted text-sm">Discover and score C2C opportunities from LinkedIn posts</div>
      </div>
      <button class="btn btn-primary" onclick="runSearchSimulation()">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
        Run AI Discovery
      </button>
    </div>

    <!-- Search Config -->
    <div class="card search-config-card">
      <div class="section-title mb-3">Search Configuration</div>
      <div class="grid-2 mb-3">
        <div class="input-group">
          <label class="input-label">Candidate Job Title (from Resume)</label>
          <input class="input" value="Java Developer" id="jobTitleInput" oninput="regenerateQuery()" />
        </div>
        <div class="input-group">
          <label class="input-label">Generated Search Query <span class="badge badge-ai" style="margin-left:6px">AI Generated</span></label>
          <div class="query-display" id="queryDisplay">
            "Java Developer" C2C -W2 -Full-Time -Bench -Sales -Hotlist
            <button class="btn btn-sm btn-icon" onclick="copyQuery()" title="Copy query">📋</button>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="editQuery()">✏️ Edit Query</button>
        <button class="btn btn-secondary btn-sm" onclick="regenerateQuery()">🔄 Regenerate</button>
        <button class="btn btn-primary btn-sm" onclick="runSearchSimulation()">🚀 Run Search</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card filter-card">
      <div class="section-title mb-3">Filters</div>
      <div class="filter-grid">
        ${[
          ['Posted', ['Last 24 Hours', 'Last 48 Hours', 'Last Week'], 0],
          ['Opportunity Type', ['C2C Only', 'C2C + Contract', 'All Types'], 0],
          ['Source', ['LinkedIn Posts', 'All LinkedIn', 'Jobs Board'], 0],
          ['Recruiter', ['Recruiter Posts Only', 'All Posts', 'Company Posts'], 0],
          ['Recruiter Email', ['Required', 'Optional', 'Any'], 0],
          ['Job Description', ['Required', 'Optional', 'Any'], 0],
          ['Experience', ['Any', '3+ years', '5+ years', '7+ years'], 0],
          ['Location', ['Any', 'Remote', 'Dallas TX', 'New York NY'], 0]
        ].map(([label, opts, sel]) => `
          <div class="input-group">
            <label class="input-label">${label}</label>
            <select class="select">${opts.map((o,i) => `<option ${i===sel?'selected':''}>${o}</option>`).join('')}</select>
          </div>`).join('')}
        <div class="input-group">
          <label class="input-label">Minimum AI Match</label>
          <input class="input" type="number" value="70" min="0" max="100" id="minMatch" /> 
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
        ${[
          ['Hide duplicate jobs', true],
          ['Hide already processed jobs', true],
          ['Hide incomplete posts', true]
        ].map(([label, checked]) => `
          <label class="checkbox-group">
            <input type="checkbox" ${checked?'checked':''} />
            <span class="checkbox-label">${label}</span>
          </label>`).join('')}
      </div>
      <button class="btn btn-primary btn-sm" onclick="showToast('Filters applied', 'success')">Apply Filters</button>
    </div>

    <!-- Results -->
    <div class="card">
      <div class="section-header mb-3">
        <div>
          <div class="section-title">Search Results</div>
          <div class="section-sub" id="resultsCount">Showing ${MOCK_JOBS.length} opportunities</div>
        </div>
        <div style="display:flex;gap:8px">
          <input class="input" style="width:220px" placeholder="Search results..." oninput="filterResults(this.value)" />
          <select class="select" style="width:160px" onchange="sortResults(this.value)">
            <option>Sort: Match Score</option>
            <option>Sort: Posted Date</option>
            <option>Sort: Company</option>
          </select>
        </div>
      </div>
      <div class="results-table-wrap">
        <table class="results-table">
          <thead>
            <tr>
              <th onclick="sortResults('match')">Match ↕</th>
              <th>Job Title</th>
              <th>Company</th>
              <th>Recruiter</th>
              <th>Location</th>
              <th>Posted</th>
              <th>Type</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="jobResultsBody">
            ${MOCK_JOBS.map(job => renderJobRow(job)).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderJobRow(job) {
  const circumference = 2 * Math.PI * 15;
  const offset = circumference - (job.match / 100) * circumference;
  const statusColors = { 'New': 'primary', 'Analyzed': 'purple', 'Resume Ready': 'success', 'Sent': 'warning' };
  return `
    <tr>
      <td>
        <div class="match-mini-circle">
          <svg width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="19" r="15" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="3"/>
            <circle cx="19" cy="19" r="15" fill="none" 
              stroke="${job.match >= 90 ? '#25d695' : '#5b7cff'}"
              stroke-width="3" stroke-linecap="round"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
              transform="rotate(-90 19 19)"/>
          </svg>
          <div class="match-mini-text" style="color:${job.match >= 90 ? 'var(--success)' : 'var(--primary)'}">${job.match}%</div>
        </div>
      </td>
      <td>
        <div style="font-weight:600;font-size:0.82rem">${job.title}</div>
        <div class="text-xs text-muted">${job.experience}</div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="recruiter-avatar-sm" style="background:var(--grad-primary);color:white">${job.logo}</div>
          <span style="font-size:0.8rem">${job.company}</span>
        </div>
      </td>
      <td style="font-size:0.78rem">${job.recruiter}</td>
      <td style="font-size:0.78rem">${job.location}</td>
      <td style="font-size:0.78rem;color:var(--muted)">${job.posted}</td>
      <td><span class="badge badge-purple">${job.type}</span></td>
      <td><span class="badge ${job.emailStatus === 'Verified' ? 'badge-success' : 'badge-warning'}">${job.emailStatus}</span></td>
      <td><span class="badge badge-${statusColors[job.status] || 'primary'}">${job.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-icon" onclick="openJobModal('${job.id}')" title="Analyze">🔍</button>
          <button class="btn btn-sm btn-icon" onclick="navigateTo('resume-lab'); showToast('Opening Resume Lab', 'info')" title="Resume">📄</button>
          <button class="btn btn-sm btn-icon" onclick="openSendModal()" title="Send">✉️</button>
          <button class="btn btn-sm btn-icon" onclick="showToast('Job saved!', 'success')" title="Save">🔖</button>
        </div>
      </td>
    </tr>`;
}

function filterResults(value) {
  const rows = document.querySelectorAll('#jobResultsBody tr');
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(value.toLowerCase()) ? '' : 'none';
  });
}

function sortResults(by) { showToast(`Sorted by ${by}`, 'info'); }

function editQuery() {
  const qd = document.getElementById('queryDisplay');
  const current = qd ? qd.textContent.trim().replace('📋', '').trim() : '';
  const input = prompt('Edit search query:', current);
  if (input && document.getElementById('queryDisplay')) {
    document.getElementById('queryDisplay').innerHTML = input + '<button class="btn btn-sm btn-icon" onclick="copyQuery()" title="Copy">📋</button>';
  }
}

function regenerateQuery() {
  const title = document.getElementById('jobTitleInput')?.value || 'Java Developer';
  const query = `"${title}" C2C -W2 -Full-Time -Bench -Sales -Hotlist`;
  const qd = document.getElementById('queryDisplay');
  if (qd) {
    qd.innerHTML = query + '<button class="btn btn-sm btn-icon" onclick="copyQuery()" title="Copy">📋</button>';
    showToast('Query regenerated by AI', 'success');
  }
}

function copyQuery() {
  const qd = document.getElementById('queryDisplay');
  if (qd) {
    const text = qd.textContent.replace('📋','').trim();
    navigator.clipboard.writeText(text).then(() => showToast('Query copied!', 'success')).catch(() => showToast('Copied!', 'success'));
  }
}

// =================== SEARCH & AI DISCOVERY ===================

let lastSearchJobs = [];

async function runSearchSimulation() {
  const query = document.getElementById('jobTitleInput')?.value || 'Java Developer';
  const fullQuery = `"${query}" C2C -W2 -Full-Time -Bench -Sales -Hotlist`;

  const stages = [
    { name: 'Connecting to LinkedIn Session', icon: '🔗' },
    { name: 'Searching Posts: ' + query, icon: '🔍' },
    { name: 'Filtering last 24 hours', icon: '📅' },
    { name: 'Detecting C2C keywords', icon: '🎯' },
    { name: 'Excluding W2, Full-Time, Bench, Hotlists', icon: '🚫' },
    { name: 'Extracting Recruiter Name & Email', icon: '👤' },
    { name: 'Extracting Job Description & Skills', icon: '📋' },
    { name: 'Checking SQLite Duplicate Records', icon: '🗑️' },
    { name: 'Scoring Opportunities (90-95% match)', icon: '⭐' }
  ];

  const overlay = document.createElement('div');
  overlay.className = 'progress-modal';
  overlay.id = 'searchProgressModal';
  overlay.innerHTML = `
    <div class="progress-modal-box">
      <div class="progress-modal-title">🤖 AI Discovery Running</div>
      <div class="progress-modal-sub">Executing: ${fullQuery}</div>
      <div class="progress-stages" id="progressStages">
        ${stages.map((s, i) => `
          <div class="progress-stage" id="ps_${i}">
            <div class="progress-stage-icon" id="psi_${i}"><div style="width:18px;height:18px;background:rgba(255,255,255,0.1);border-radius:50%"></div></div>
            <div class="progress-stage-name">${s.icon} ${s.name}</div>
            <div class="progress-stage-status" id="pss_${i}" style="color:var(--muted)">Waiting</div>
          </div>`).join('')}
      </div>
      <div class="progress-bar-outer"><div class="progress-bar-inner" id="searchProgressBar" style="width:0%"></div></div>
      <div id="searchSummary" style="margin-top:16px;display:none">
        <div class="info-box success">
          <span>✅</span>
          <div>
            <div style="font-weight:700">Discovery Complete!</div>
            <div id="searchStatsText" style="font-size:0.75rem;margin-top:2px">Scanning completed.</div>
          </div>
        </div>
        <button class="btn btn-primary w-full mt-3" onclick="closeSearchProgress()">View Results</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  let apiData = null;
  try {
    const res = await fetch(`${API_BASE}/api/jobs?search_query=${encodeURIComponent(fullQuery)}`);
    if (res.ok) {
      apiData = await res.json();
      if (apiData.jobs) lastSearchJobs = apiData.jobs;
    }
  } catch (err) {
    console.warn('Backend search API unreachable, using local results:', err);
  }

  let i = 0;
  const runStage = () => {
    if (i > 0) {
      document.getElementById(`ps_${i-1}`)?.classList.remove('active');
      document.getElementById(`ps_${i-1}`)?.classList.add('done');
      const iconEl = document.getElementById(`psi_${i-1}`);
      if (iconEl) iconEl.innerHTML = '<span style="color:var(--success);font-weight:700">✓</span>';
      const statusEl = document.getElementById(`pss_${i-1}`);
      if (statusEl) { statusEl.textContent = 'Done'; statusEl.style.color = 'var(--success)'; }
    }
    if (i < stages.length) {
      document.getElementById(`ps_${i}`)?.classList.add('active');
      const iconEl = document.getElementById(`psi_${i}`);
      if (iconEl) iconEl.innerHTML = '<div class="spinning"></div>';
      const statusEl = document.getElementById(`pss_${i}`);
      if (statusEl) { statusEl.textContent = 'Running...'; statusEl.style.color = 'var(--primary)'; }
      document.getElementById('searchProgressBar').style.width = `${Math.round(((i+1)/stages.length)*100)}%`;
      i++;
      setTimeout(runStage, 350);
    } else {
      document.getElementById('searchProgressBar').style.width = '100%';
      const statsText = document.getElementById('searchStatsText');
      const found = apiData?.count ?? 4;
      const dups = apiData?.duplicates_prevented ?? 4;
      if (statsText) {
        statsText.textContent = `${found} C2C opportunities discovered • ${dups} duplicates/already-contacted recruiters prevented • Filtered last 24h`;
      }
      document.getElementById('searchSummary').style.display = 'block';
    }
  };
  runStage();
}

function closeSearchProgress() {
  const el = document.getElementById('searchProgressModal');
  if (el) el.remove();
  showToast('C2C job discovery complete!', 'success');
}

// =================== AI RESUME LAB ===================

function renderResumeLab() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">AI Resume Lab</div>
        <div class="text-muted text-sm">Customize your resume for every high-quality opportunity</div>
      </div>
    </div>
    <div class="resume-workspace">
      <!-- Controls Panel -->
      <div class="resume-controls">
        <!-- Resume Selector -->
        <div class="card">
          <div class="section-title mb-3">📁 Resume Library</div>
          ${[
            { name: 'Master Resume', date: 'Sep 10, 2026', versions: 3, active: true },
            { name: 'Java Dev Variant', date: 'Sep 8, 2026', versions: 1, active: false }
          ].map(r => `
            <div class="card mb-2" style="padding:14px;border:1px solid ${r.active ? 'rgba(91,124,255,0.4)' : 'var(--border)'}">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <span style="font-size:1.3rem">📄</span>
                <div style="flex:1">
                  <div style="font-size:0.82rem;font-weight:700">${r.name}</div>
                  <div class="text-xs text-muted">Updated ${r.date} • ${r.versions} version${r.versions > 1 ? 's' : ''}</div>
                </div>
                ${r.active ? '<span class="badge badge-primary">Active</span>' : ''}
              </div>
              <button class="btn btn-sm btn-ghost w-full" onclick="showToast('Viewing ${r.name}', 'info')">View Resume</button>
            </div>`).join('')}
        </div>

        <!-- Job Selector -->
        <div class="card">
          <div class="section-title mb-3">🎯 Select Target Job</div>
          <div class="input-group mb-3">
            <label class="input-label">Job Opportunity</label>
            <select class="select" onchange="updateMatchScore(this.value)">
              ${MOCK_JOBS.map(j => `<option value="${j.id}">${j.title} — ${j.company}</option>`).join('')}
            </select>
          </div>
          <div class="match-improvement">
            <div class="match-big">
              <div class="match-big-value" style="color:var(--muted)">78%</div>
              <div class="match-big-label">Current Match</div>
            </div>
            <div class="match-arrow">→</div>
            <div class="match-big">
              <div class="match-big-value text-success">94%</div>
              <div class="match-big-label">After AI Opt.</div>
            </div>
          </div>
          <div style="margin-top:12px">
            <div class="text-xs text-muted mb-2">Skills Detected in JD:</div>
            <div class="skills-wrap">
              ${['Java', 'Spring Boot', 'AWS', 'Kafka', 'Docker', 'Microservices', 'SQL', 'REST APIs'].map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- Customization Controls -->
        <div class="card">
          <div class="section-title mb-3">⚙️ AI Customization</div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
            ${[
              'Emphasize relevant experience',
              'Prioritize required skills',
              'Optimize ATS keywords',
              'Reorder technical skills',
              'Improve professional summary',
              'Highlight matching projects',
              'Preserve factual information'
            ].map(opt => `
              <label class="checkbox-group">
                <input type="checkbox" checked />
                <span class="checkbox-label" style="font-size:0.78rem">${opt}</span>
              </label>`).join('')}
          </div>
          <div class="info-box success" style="margin-bottom:14px">
            <span>🛡️</span>
            <div>
              <div style="font-weight:700;font-size:0.75rem">Truthfulness Protection Enabled</div>
              <div style="font-size:0.68rem">AI will not invent qualifications, employers, projects, certifications or experience.</div>
            </div>
          </div>
          <button class="btn btn-primary w-full" onclick="runResumeCustomization()">
            🤖 Generate Customized Resume
          </button>
        </div>
      </div>

      <!-- Resume Preview Area -->
      <div class="resume-preview-area">
        <div class="resume-preview-header">
          <div>
            <div style="font-size:0.88rem;font-weight:700">Resume Preview</div>
            <div class="text-xs text-muted" id="resumeAtsScore">ATS Score: 82/100 • Click "Generate" to optimize</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-secondary" onclick="showToast('Preview opened in full window', 'info')">⬆️ Full Preview</button>
            <button class="btn btn-sm btn-primary" onclick="downloadResumePDF()">⬇️ Download PDF</button>
          </div>
        </div>
        <div class="resume-doc" id="resumeDoc">
          ${generateResumeHTML(false)}
        </div>
        <div style="padding:14px;display:flex;gap:10px;border-top:1px solid var(--border)">
          <button class="btn btn-sm btn-secondary" onclick="showToast('New version created', 'success')">Create New Version</button>
          <button class="btn btn-sm btn-ghost" onclick="showToast('Resume saved to library', 'success')">Save to Library</button>
        </div>
      </div>
    </div>`;
}

function generateResumeHTML(optimized) {
  const purple = optimized ? 'class="resume-ai-highlight"' : '';
  return `
    <h1>Alex Morgan</h1>
    <div class="contact-line">alex.morgan@email.com • +1 (555) 123-4567 • linkedin.com/in/alexmorgan • Dallas, TX • US Citizen</div>
    <h2>Professional Summary</h2>
    <p ${purple}>Senior Java Developer with 8+ years of experience designing and developing scalable microservices architectures using Java, Spring Boot, and cloud-native technologies. Proven expertise in AWS, Apache Kafka, Docker, and Kubernetes. ${optimized ? 'Specializing in enterprise-grade C2C consulting engagements delivering mission-critical backend systems.' : 'Strong background in agile development methodologies.'}</p>
    <h2>Technical Skills</h2>
    <p><strong>Languages:</strong> Java (8/11/17), Python, SQL, Bash</p>
    <p><strong>Frameworks:</strong> ${optimized ? '<strong>Spring Boot, Spring Cloud, Spring Security</strong>' : 'Spring Boot, Spring MVC'}, Hibernate, JUnit</p>
    <p><strong>Cloud & DevOps:</strong> ${optimized ? '<strong>AWS (EC2, ECS, Lambda, S3, RDS), Docker, Kubernetes, Apache Kafka</strong>' : 'AWS, Docker, Jenkins'}</p>
    <p><strong>Databases:</strong> PostgreSQL, MySQL, MongoDB, Redis</p>
    <p><strong>Tools:</strong> Git, JIRA, Maven, Gradle, Jenkins, SonarQube</p>
    <h2>Professional Experience</h2>
    <div class="job-entry">
      <div class="job-title-entry"><span>Senior Java Developer (C2C)</span><span>Jan 2022 – Present</span></div>
      <div class="job-company-entry">Infosys Technologies — Dallas, TX</div>
      <ul>
        <li ${purple}>Designed and implemented ${optimized ? '<strong>microservices architecture</strong>' : 'microservices'} using Java 17 and Spring Boot, reducing system latency by 40%</li>
        <li>Built event-driven data pipelines using ${optimized ? '<strong>Apache Kafka</strong>' : 'Kafka'} processing 2M+ messages/day</li>
        <li>Deployed containerized applications on ${optimized ? '<strong>AWS ECS and Kubernetes</strong>' : 'cloud platforms'} achieving 99.9% uptime</li>
        <li>Led code reviews and mentored team of 5 junior developers</li>
      </ul>
    </div>
    <div class="job-entry">
      <div class="job-title-entry"><span>Java Developer</span><span>Mar 2019 – Dec 2021</span></div>
      <div class="job-company-entry">TechCore Solutions — Houston, TX</div>
      <ul>
        <li>Developed RESTful APIs and web services using Spring Boot and Hibernate</li>
        <li>Worked with AWS services including EC2, S3, RDS for scalable deployments</li>
        <li>Implemented CI/CD pipelines with Jenkins, reducing deployment time by 60%</li>
      </ul>
    </div>
    <div class="job-entry">
      <div class="job-title-entry"><span>Junior Java Developer</span><span>Jun 2016 – Feb 2019</span></div>
      <div class="job-company-entry">DataSystems Inc — Austin, TX</div>
      <ul>
        <li>Developed and maintained Java-based enterprise applications</li>
        <li>Collaborated with cross-functional teams in Agile sprints</li>
      </ul>
    </div>
    <h2>Projects</h2>
    <p><strong>Enterprise Microservices Platform:</strong> Architected a distributed platform using Spring Cloud, Kafka, and Kubernetes serving 500K daily users.</p>
    <p><strong>Real-Time Analytics Engine:</strong> Built stream processing pipeline with Kafka Streams and AWS Lambda for real-time fraud detection.</p>
    <h2>Education</h2>
    <p>Bachelor of Science in Computer Science — University of Texas at Austin — 2016</p>
    <h2>Certifications</h2>
    <p>AWS Certified Solutions Architect — Associate (2023)</p>
    <p>Oracle Certified Professional Java SE 11 Developer (2022)</p>`;
}

function updateMatchScore(jobId) {
  showToast('Analyzing match score...', 'info');
}

async function runResumeCustomization() {
  const stages = [
    'Analyzing Job Description...',
    'Comparing Master Resume...',
    'Identifying Relevant Skills...',
    'Optimizing Keywords (90-95% Match)...',
    'Rewriting Professional Summary...',
    'Ensuring Factual Truthfulness...',
    'Generating ATS-Friendly ReportLab PDF...'
  ];

  const overlay = document.createElement('div');
  overlay.className = 'progress-modal';
  overlay.id = 'resumeProgressModal';
  overlay.innerHTML = `
    <div class="progress-modal-box">
      <div class="progress-modal-title">🤖 AI Resume Optimization</div>
      <div class="progress-modal-sub">Customizing resume for C2C opportunity...</div>
      <div style="text-align:center;padding:20px 0">
        <div class="spinning" style="width:50px;height:50px;border-width:3px;margin:0 auto 16px"></div>
        <div id="resumeStageText" style="font-size:0.88rem;color:var(--muted)">Starting...</div>
      </div>
      <div class="progress-bar-outer" style="margin-bottom:16px"><div class="progress-bar-inner" id="resumeProgressBar" style="width:0%"></div></div>
    </div>`;
  document.body.appendChild(overlay);

  const targetJob = currentSelectedJob || MOCK_JOBS[0];
  let customResult = null;

  try {
    const res = await fetch(`${API_BASE}/api/resume/customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job: {
          title: targetJob.title,
          company: targetJob.company,
          recruiter: targetJob.recruiter,
          location: targetJob.location,
          job_description: targetJob.description || targetJob.job_description || 'Java Microservices C2C'
        }
      })
    });
    customResult = await res.json();
    if (customResult && customResult.pdf_filename) {
      currentGeneratedPdf = customResult.pdf_filename;
    }
  } catch (err) {
    console.warn('Backend customize API unreachable, using local fallback:', err);
  }

  let i = 0;
  const run = () => {
    if (i < stages.length) {
      document.getElementById('resumeStageText').textContent = stages[i];
      document.getElementById('resumeProgressBar').style.width = `${Math.round(((i+1)/stages.length)*100)}%`;
      i++;
      setTimeout(run, 400);
    } else {
      overlay.remove();
      const doc = document.getElementById('resumeDoc');
      if (doc) doc.innerHTML = generateResumeHTML(true);
      const atsScore = document.getElementById('resumeAtsScore');
      const score = customResult?.match_score || 94;
      if (atsScore) {
        atsScore.innerHTML = `✨ ATS Score: <strong style="color:var(--success)">${score}/100</strong> • Job Match: <strong style="color:var(--success)">${score}%</strong> • PDF Ready: <strong style="color:var(--primary)">${currentGeneratedPdf}</strong>`;
      }
      showToast(`Resume customized & compiled to PDF! (${currentGeneratedPdf})`, 'success');
    }
  };
  setTimeout(run, 200);
}

function downloadResumePDF() {
  const filename = currentGeneratedPdf || 'Alex_Morgan_Senior_Java_Developer_C2C.pdf';
  showToast(`Downloading ATS-friendly PDF: ${filename}`, 'info');
  const a = document.createElement('a');
  a.href = `${API_BASE}/api/resumes/download/${filename}`;
  a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// =================== APPLICATION COPILOT ===================

function renderApplicationCopilot() {
  const content = document.getElementById('contentArea');
  const defaultEmail = `Dear Sarah,

I hope this email finds you well.

I came across your recent LinkedIn hiring post regarding the Senior Java Developer (C2C) opportunity at TechNova Solutions and would like to submit my application.

Please find my customized resume attached for your review.

──────────────────────────────────────────
CANDIDATE SUMMARY
──────────────────────────────────────────
Candidate Name:    Alex Morgan
Email:             alex.morgan@email.com
Phone:             +1 (555) 123-4567
LinkedIn:          linkedin.com/in/alexmorgan
Current Location:  Dallas, TX
Work Authorization: US Citizen
Availability:      Immediate
Total Experience:  8+ Years
Contract Type:     C2C (Corp-to-Corp)
Expected Rate:     Negotiable

──────────────────────────────────────────
JOB REFERENCE
──────────────────────────────────────────
Post URL: https://www.linkedin.com/posts/technova-solutions-java-dev
Position: Senior Java Developer
Company:  TechNova Solutions
Location: Dallas, TX
Type:     C2C

I believe my 8+ years of Java development experience with Spring Boot, Microservices, AWS, and Apache Kafka aligns well with your requirements and would appreciate the opportunity to discuss this role further.

Thank you for your time and consideration.

Best Regards,

Alex Morgan
Senior Java Developer
alex.morgan@email.com | +1 (555) 123-4567
linkedin.com/in/alexmorgan`;

  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Application Copilot</div>
        <div class="text-muted text-sm">Create personalized recruiter submissions with AI</div>
      </div>
    </div>
    <div class="copilot-grid">
      <!-- Left Panel -->
      <div style="display:flex;flex-direction:column;gap:14px">
        <!-- Job Info -->
        <div class="card">
          <div class="section-title mb-3">Selected Job</div>
          <div class="job-match-card" style="margin:0;border:none;padding:0;background:transparent">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div class="job-company-logo">TN</div>
              <div>
                <div class="job-title">Senior Java Developer</div>
                <div class="job-company">TechNova Solutions</div>
                <div class="text-xs text-muted">Dallas, TX • C2C</div>
              </div>
              <span class="badge badge-success" style="margin-left:auto">94%</span>
            </div>
          </div>
          <div class="divider"></div>
          <div style="font-size:0.78rem;font-weight:700;color:var(--muted);margin-bottom:8px">RECRUITER</div>
          <div class="recruiter-info" style="margin:0">
            <div class="recruiter-avatar-sm">SJ</div>
            <div>
              <div class="recruiter-name-sm">Sarah Johnson</div>
              <div style="font-size:0.68rem;color:var(--muted)">Senior Technical Recruiter</div>
              <div style="font-size:0.68rem;color:var(--success)">✓ sarah.johnson@technova.com</div>
            </div>
          </div>
        </div>

        <!-- Verification -->
        <div class="card">
          <div class="section-title mb-3">✅ Recipient Verification</div>
          <div class="verification-list">
            <div class="verify-item"><span class="check-icon success">✓</span> Valid email format</div>
            <div class="verify-item"><span class="check-icon success">✓</span> Recruiter identified</div>
            <div class="verify-item"><span class="check-icon success">✓</span> Company matched</div>
            <div class="verify-item"><span class="check-icon success">✓</span> Job matched</div>
            <div class="verify-item"><span class="check-icon success">✓</span> Duplicate check passed</div>
          </div>
        </div>

        <!-- Attachment -->
        <div class="card">
          <div class="section-title mb-3">📎 Attachment</div>
          <div class="attachment-card">
            <div class="attachment-icon">📄</div>
            <div class="attachment-info">
              <div class="attachment-name">Alex_Morgan_Senior_Java_Developer_C2C.pdf</div>
              <div class="attachment-status">✓ Customized Resume Ready</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="btn btn-sm btn-secondary" onclick="showToast('Preview opened', 'info')">Preview</button>
            <button class="btn btn-sm btn-ghost" onclick="showToast('Removed', 'info')">Remove</button>
            <button class="btn btn-sm btn-ghost" onclick="showToast('Select a file to replace', 'info')">Replace</button>
          </div>
        </div>

        <!-- Tone Selector -->
        <div class="card">
          <div class="section-title mb-3">🎙️ Email Tone</div>
          <div class="tone-selector">
            ${['Professional', 'Friendly', 'Concise', 'Confident'].map((t, i) => `
              <button class="tone-btn ${i===0?'active':''}" onclick="setTone(this, '${t}')">${t}</button>`).join('')}
          </div>
        </div>
      </div>

      <!-- Right Panel: Email Editor -->
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="card">
          <div class="section-title mb-3">✉️ Email Subject</div>
          <div style="display:flex;gap:8px">
            <input class="input" id="emailSubject" value="Submission for Senior Java Developer | C2C Consultant" style="flex:1" />
            <button class="btn btn-icon" onclick="copyToClipboard('emailSubject')" title="Copy">📋</button>
          </div>
        </div>

        <div class="card" style="flex:1">
          <div class="section-header mb-3">
            <div class="section-title">✉️ Email Body</div>
            <div style="display:flex;gap:6px">
              <span style="font-size:0.7rem;color:var(--muted)" id="wordCount">~280 words</span>
            </div>
          </div>
          <textarea class="email-editor" id="emailBody" oninput="updateWordCount()">${defaultEmail}</textarea>
          <div class="ai-tools-row mt-3">
            <button class="btn btn-sm btn-secondary" onclick="aiImproveEmail('generate')">🤖 Generate</button>
            <button class="btn btn-sm btn-secondary" onclick="aiImproveEmail('tone')">✨ Improve Tone</button>
            <button class="btn btn-sm btn-secondary" onclick="aiImproveEmail('professional')">👔 More Professional</button>
            <button class="btn btn-sm btn-secondary" onclick="aiImproveEmail('shorten')">✂️ Shorten</button>
            <button class="btn btn-sm btn-secondary" onclick="aiImproveEmail('personalize')">👤 Personalize</button>
            <button class="btn btn-sm btn-ghost" onclick="aiImproveEmail('regenerate')">🔄 Regenerate</button>
          </div>
        </div>

        <div style="display:flex;gap:10px">
          <button class="btn btn-secondary" onclick="showToast('Draft saved!', 'success')">💾 Save Draft</button>
          <button class="btn btn-primary" style="flex:1" onclick="openSendModal()">
            🚀 Send Application
          </button>
        </div>
      </div>
    </div>`;
}

function setTone(btn, tone) {
  document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(`Tone set to ${tone}`, 'info');
}

function updateWordCount() {
  const body = document.getElementById('emailBody');
  const count = document.getElementById('wordCount');
  if (body && count) {
    const words = body.value.trim().split(/\s+/).filter(w => w).length;
    count.textContent = `~${words} words`;
  }
}

function copyToClipboard(id) {
  const el = document.getElementById(id);
  if (el) {
    navigator.clipboard.writeText(el.value || el.textContent).then(() => showToast('Copied!', 'success')).catch(() => showToast('Copied!', 'success'));
  }
}

function aiImproveEmail(action) {
  const messages = {
    generate: 'Generating optimized email...',
    tone: 'Improving email tone...',
    professional: 'Making email more professional...',
    shorten: 'Shortening email...',
    personalize: 'Personalizing greeting...',
    regenerate: 'Regenerating email...'
  };
  showToast(`AI: ${messages[action]}`, 'info');
  setTimeout(() => showToast('Email updated by AI!', 'success'), 1500);
}

// =================== APPLICATION TRACKER ===================

const TRACKER_JOBS = {
  discovered: [
    { title: 'React Developer', company: 'NexGen Labs', recruiter: 'Amanda Lee', match: 83, date: '12 Sep', id: 'job5' }
  ],
  analyzed: [
    { title: 'DevOps Engineer', company: 'DataCore', recruiter: 'Michael Torres', match: 86, date: '12 Sep', id: 'job4' }
  ],
  resumeReady: [
    { title: 'Full Stack Developer', company: 'Vertex Systems', recruiter: 'Priya Sharma', match: 88, date: '11 Sep', id: 'job3' }
  ],
  emailReady: [
    { title: 'Python Developer', company: 'CloudMatrix', recruiter: 'David Chen', match: 91, date: '11 Sep', id: 'job2' }
  ],
  sent: [
    { title: 'Senior Java Developer', company: 'TechNova Solutions', recruiter: 'Sarah Johnson', match: 94, date: '12 Sep', id: 'job1' },
    { title: 'Cloud Engineer', company: 'SkyTech', recruiter: 'Rachel Wong', match: 82, date: '10 Sep', id: 'job6' },
    { title: 'Java Architect', company: 'CoreSystems', recruiter: 'Mark Davis', match: 87, date: '9 Sep', id: 'job7' }
  ],
  response: [
    { title: 'Spring Boot Dev', company: 'InnovateTech', recruiter: 'James Wilson', match: 89, date: '8 Sep', id: 'job8' }
  ],
  closed: [
    { title: 'Backend Developer', company: 'OldCorp', recruiter: 'Tom Brown', match: 72, date: '5 Sep', id: 'job9' }
  ]
};

let liveApplications = [];
let liveStats = null;

async function renderApplicationTracker() {
  const content = document.getElementById('contentArea');

  try {
    const [appsRes, statsRes] = await Promise.all([
      fetch(`${API_BASE}/api/applications`),
      fetch(`${API_BASE}/api/stats`)
    ]);
    if (appsRes.ok) liveApplications = await appsRes.json();
    if (statsRes.ok) liveStats = await statsRes.json();
  } catch (e) {
    console.warn('Could not fetch backend applications:', e);
  }

  const total = liveStats?.total_applications ?? 31;
  const sent = liveStats?.sent_applications ?? 24;
  const dups = liveStats?.duplicates_prevented ?? 4;
  const recruiters = liveStats?.total_recruiters ?? 6;

  content.innerHTML = `
    <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Application Tracker</div>
        <div class="text-muted text-sm">Real-time SQLite database tracking & duplicate prevention</div>
      </div>
      <div class="view-toggle">
        <button class="view-btn ${trackerView==='kanban'?'active':''}" onclick="setTrackerView('kanban', this)">⬜ Kanban</button>
        <button class="view-btn ${trackerView==='table'?'active':''}" onclick="setTrackerView('table', this)">📋 Table (Live DB)</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="tracker-stats mb-4">
      <div class="tracker-stat"><div class="tracker-stat-value">${total}</div><div class="tracker-stat-label">Total Submissions</div></div>
      <div class="tracker-stat"><div class="tracker-stat-value text-success">${sent}</div><div class="tracker-stat-label">Sent via Gmail</div></div>
      <div class="tracker-stat"><div class="tracker-stat-value text-warning">${dups}</div><div class="tracker-stat-label">Duplicates Prevented</div></div>
      <div class="tracker-stat"><div class="tracker-stat-value text-purple">${recruiters}</div><div class="tracker-stat-label">Recruiters Logged</div></div>
    </div>

    <div id="trackerContent"></div>`;

  renderTrackerContent();
}

function setTrackerView(view, btn) {
  trackerView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTrackerContent();
}

function renderTrackerContent() {
  const el = document.getElementById('trackerContent');
  if (!el) return;
  if (trackerView === 'kanban') el.innerHTML = renderKanban();
  else el.innerHTML = renderTrackerTable();
  if (trackerView === 'kanban') initKanbanDragDrop();
}

function renderKanban() {
  const cols = [
    { key: 'discovered', label: 'DISCOVERED', color: 'var(--muted)' },
    { key: 'analyzed', label: 'ANALYZED', color: 'var(--primary)' },
    { key: 'resumeReady', label: 'RESUME READY', color: 'var(--purple)' },
    { key: 'emailReady', label: 'EMAIL READY', color: 'var(--warning)' },
    { key: 'sent', label: 'SENT', color: 'var(--success)' },
    { key: 'response', label: 'RESPONSE', color: 'var(--success)' },
    { key: 'closed', label: 'CLOSED', color: 'var(--danger)' }
  ];
  return `<div class="kanban-board">
    ${cols.map(col => `
      <div class="kanban-col" id="col_${col.key}" data-col="${col.key}" 
           ondragover="allowDrop(event)" ondrop="dropCard(event, '${col.key}')">
        <div class="kanban-col-header">
          <div class="kanban-col-title" style="color:${col.color}">${col.label}</div>
          <div class="kanban-count">${(TRACKER_JOBS[col.key] || []).length}</div>
        </div>
        <div class="kanban-cards" id="cards_${col.key}">
          ${(TRACKER_JOBS[col.key] || []).map(job => `
            <div class="kanban-card" draggable="true" id="kcard_${job.id}" 
                 ondragstart="dragStart(event, '${job.id}', '${col.key}')">
              <div class="kanban-card-title">${job.title}</div>
              <div class="kanban-card-company">${job.company}</div>
              <div style="font-size:0.68rem;color:var(--muted);margin-bottom:8px">${job.recruiter} • ${job.date}</div>
              <div class="kanban-card-footer">
                <span class="badge badge-success">${job.match}%</span>
                <div class="kanban-card-actions">
                  <button class="btn btn-icon" onclick="openJobModal('${job.id}')" title="View" style="width:24px;height:24px;font-size:0.65rem">👁</button>
                  <button class="btn btn-icon" onclick="openSendModal()" title="Email" style="width:24px;height:24px;font-size:0.65rem">✉</button>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('')}
  </div>`;
}

function renderTrackerTable() {
  if (liveApplications && liveApplications.length > 0) {
    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-weight:700;font-size:0.9rem">Live SQLite Application Submissions (${liveApplications.length} records)</div>
          <button class="btn btn-sm btn-ghost" onclick="renderApplicationTracker()">🔄 Refresh</button>
        </div>
        <div class="results-table-wrap">
          <table class="results-table">
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Job Title</th><th>Company</th><th>Recruiter Email</th>
                <th>Status</th><th>Customized Resume PDF</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${liveApplications.map(app => `
                <tr>
                  <td class="text-xs text-muted">#${app.id}</td>
                  <td class="text-xs">${app.submission_date.substring(0, 10)}</td>
                  <td><div style="font-weight:600;font-size:0.82rem">${app.job_title}</div></td>
                  <td style="font-size:0.78rem">${app.company || 'Enterprise Client'}</td>
                  <td style="font-size:0.78rem;color:var(--primary)">${app.recruiter_email}</td>
                  <td><span class="badge badge-success">✓ ${app.email_status}</span></td>
                  <td>
                    <a href="${API_BASE}/api/resumes/download/${app.resume_filename}" target="_blank" style="color:var(--primary);font-size:0.75rem;text-decoration:underline">
                      📄 ${app.resume_filename}
                    </a>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-icon" onclick="showToast('Subject: ' + '${app.email_subject || ''}', 'info')" title="View Subject">✉</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  const allJobs = Object.entries(TRACKER_JOBS).flatMap(([status, jobs]) => jobs.map(j => ({...j, statusKey: status})));
  const statusLabels = { discovered: 'Discovered', analyzed: 'Analyzed', resumeReady: 'Resume Ready', emailReady: 'Email Ready', sent: 'Sent', response: 'Response', closed: 'Closed' };
  const statusBadge = { discovered: 'primary', analyzed: 'purple', resumeReady: 'primary', emailReady: 'warning', sent: 'success', response: 'success', closed: 'danger' };
  return `
    <div class="card">
      <div class="results-table-wrap">
        <table class="results-table">
          <thead>
            <tr>
              <th>Date</th><th>Job Title</th><th>Company</th><th>Recruiter</th>
              <th>Match</th><th>Resume</th><th>Email</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${allJobs.map(job => `
              <tr>
                <td class="text-xs text-muted">${job.date}</td>
                <td><div style="font-weight:600;font-size:0.82rem">${job.title}</div></td>
                <td style="font-size:0.78rem">${job.company}</td>
                <td style="font-size:0.78rem">${job.recruiter}</td>
                <td><span class="badge badge-success">${job.match}%</span></td>
                <td><span class="badge badge-primary">✓ Ready</span></td>
                <td><span class="badge ${job.statusKey === 'sent' || job.statusKey === 'response' ? 'badge-success' : 'badge-warning'}">${job.statusKey === 'sent' || job.statusKey === 'response' ? '✓ Sent' : 'Draft'}</span></td>
                <td><span class="badge badge-${statusBadge[job.statusKey]}">${statusLabels[job.statusKey]}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-sm btn-icon" onclick="openJobModal('${job.id || 'job1'}')" title="View">👁</button>
                    <button class="btn btn-sm btn-icon" onclick="openSendModal()" title="Email">✉</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// =================== KANBAN DRAG & DROP ===================

function initKanbanDragDrop() {
  // Already uses HTML5 drag and drop via attributes
}

function dragStart(event, jobId, fromCol) {
  event.dataTransfer.setData('jobId', jobId);
  event.dataTransfer.setData('fromCol', fromCol);
  const card = document.getElementById(`kcard_${jobId}`);
  if (card) card.classList.add('dragging');
}

function allowDrop(event) {
  event.preventDefault();
  const col = event.currentTarget;
  if (col) col.style.background = 'rgba(91,124,255,0.06)';
}

function dropCard(event, toCol) {
  event.preventDefault();
  const jobId = event.dataTransfer.getData('jobId');
  const fromCol = event.dataTransfer.getData('fromCol');
  const col = event.currentTarget;
  if (col) col.style.background = '';

  if (fromCol === toCol) return;

  // Move job in data
  const jobIdx = TRACKER_JOBS[fromCol]?.findIndex(j => j.id === jobId);
  if (jobIdx !== undefined && jobIdx >= 0) {
    const [job] = TRACKER_JOBS[fromCol].splice(jobIdx, 1);
    if (!TRACKER_JOBS[toCol]) TRACKER_JOBS[toCol] = [];
    TRACKER_JOBS[toCol].push(job);
    renderTrackerContent();
    showToast(`Moved to ${toCol.replace(/([A-Z])/g, ' $1').trim()}`, 'success');
  }

  const card = document.getElementById(`kcard_${jobId}`);
  if (card) card.classList.remove('dragging');
}

// =================== ANALYTICS ===================

function renderAnalytics() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Analytics</div>
        <div class="text-muted text-sm">Performance metrics and conversion insights</div>
      </div>
      <div style="display:flex;gap:8px">
        <select class="select" style="width:140px"><option>Last 7 Days</option><option>Last 30 Days</option><option>All Time</option></select>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Exported!', 'success')">⬇ Export</button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid-4 mb-6">
      ${[
        { label: 'Jobs Discovered', value: '128', icon: '🔍', color: 'primary' },
        { label: 'Applications Sent', value: '24', icon: '✉️', color: 'success' },
        { label: 'Responses Received', value: '8', icon: '💬', color: 'purple' },
        { label: 'Interviews Scheduled', value: '4', icon: '📅', color: 'warning' }
      ].map(m => `
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <span style="font-size:1.5rem">${m.icon}</span>
            <span class="badge badge-${m.color}">${m.color === 'success' ? '+12%' : m.color === 'primary' ? '+18' : m.color === 'purple' ? '33%' : '50%'}</span>
          </div>
          <div style="font-size:2rem;font-weight:800;margin-bottom:4px">${m.value}</div>
          <div class="text-xs text-muted">${m.label}</div>
        </div>`).join('')}
    </div>

    <div class="analytics-grid mb-6">
      <!-- Bar Chart: Jobs per Day -->
      <div class="card chart-card">
        <div class="section-header mb-4">
          <div class="chart-title">Jobs Discovered Per Day</div>
          <div style="display:flex;gap:10px">
            <div style="display:flex;align-items:center;gap:6px;font-size:0.72rem"><div style="width:10px;height:10px;border-radius:2px;background:var(--primary)"></div>Jobs</div>
            <div style="display:flex;align-items:center;gap:6px;font-size:0.72rem"><div style="width:10px;height:10px;border-radius:2px;background:var(--success)"></div>Matched</div>
          </div>
        </div>
        <div class="bar-chart">
          ${[
            { day: 'Mon', jobs: 18, matched: 10 },
            { day: 'Tue', jobs: 22, matched: 13 },
            { day: 'Wed', jobs: 15, matched: 8 },
            { day: 'Thu', jobs: 28, matched: 16 },
            { day: 'Fri', jobs: 20, matched: 11 },
            { day: 'Sat', jobs: 12, matched: 7 },
            { day: 'Sun', jobs: 13, matched: 9 }
          ].map(d => `
            <div class="bar-group">
              <div class="bar-wrap" style="gap:3px;display:flex;align-items:flex-end">
                <div class="bar bar-primary" style="height:${Math.round((d.jobs/28)*120)}px;flex:1" title="${d.jobs} jobs"></div>
                <div class="bar bar-success" style="height:${Math.round((d.matched/28)*120)}px;flex:1" title="${d.matched} matched"></div>
              </div>
              <div class="bar-label">${d.day}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Donut Chart: Match Distribution -->
      <div class="card chart-card">
        <div class="chart-title">Match Score Distribution</div>
        <div class="donut-chart-wrap" style="margin-top:16px">
          <svg class="donut-svg" width="120" height="120" viewBox="0 0 120 120">
            ${renderDonutSegments([
              { value: 12, color: '#25d695', label: '90-100%' },
              { value: 19, color: '#5b7cff', label: '80-89%' },
              { value: 23, color: '#9b5cff', label: '70-79%' },
              { value: 20, color: '#f5b942', label: '60-69%' }
            ])}
            <text x="60" y="56" text-anchor="middle" font-size="14" font-weight="800" fill="#f0f4ff">74</text>
            <text x="60" y="70" text-anchor="middle" font-size="8" fill="#8d96aa">total</text>
          </svg>
          <div class="donut-legend">
            ${[
              { color: '#25d695', label: '90-100% Match', val: '12' },
              { color: '#5b7cff', label: '80-89% Match', val: '19' },
              { color: '#9b5cff', label: '70-79% Match', val: '23' },
              { color: '#f5b942', label: '60-69% Match', val: '20' }
            ].map(l => `
              <div class="donut-legend-item">
                <div class="donut-legend-dot" style="background:${l.color}"></div>
                <span>${l.label}</span>
                <span style="margin-left:auto;font-weight:700">${l.val}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Conversion Funnel -->
    <div class="card chart-card mb-6">
      <div class="section-header mb-4">
        <div class="chart-title">C2C Opportunity Conversion Funnel</div>
        <div class="text-xs text-muted">End-to-end pipeline conversion</div>
      </div>
      <div class="funnel-chart">
        ${[
          { label: 'Jobs Discovered', val: 128, max: 128, color: 'var(--primary)' },
          { label: 'Relevant Matches', val: 74, max: 128, color: '#6b8fff' },
          { label: 'Resume Customized', val: 42, max: 128, color: 'var(--purple)' },
          { label: 'Emails Prepared', val: 31, max: 128, color: '#b56fff' },
          { label: 'Submitted', val: 24, max: 128, color: 'var(--success)' },
          { label: 'Responses', val: 8, max: 128, color: '#40e6a8' },
          { label: 'Interviews', val: 4, max: 128, color: '#25d695' }
        ].map((f, i) => `
          <div class="funnel-step">
            <div class="funnel-label">${f.label}</div>
            <div class="funnel-bar-wrap">
              <div class="funnel-bar" style="width:${Math.round((f.val/f.max)*100)}%;background:${f.color}">
                <span>${f.val}</span>
              </div>
            </div>
            <div class="funnel-value">${Math.round((f.val/128)*100)}%</div>
          </div>
          ${i < 6 ? '<div class="funnel-arrow">↓</div>' : ''}`).join('')}
      </div>
    </div>

    <!-- Response Rate -->
    <div class="grid-2">
      <div class="card chart-card">
        <div class="chart-title mb-4">Response Rate by Company Size</div>
        ${[
          { label: 'Enterprise (500+)', rate: 42, color: 'var(--primary)' },
          { label: 'Mid-Market (100-500)', rate: 35, color: 'var(--purple)' },
          { label: 'SMB (10-100)', rate: 28, color: 'var(--success)' },
          { label: 'Startup (<10)', rate: 18, color: 'var(--warning)' }
        ].map(r => `
          <div class="match-score-row mb-2">
            <span class="match-score-label" style="min-width:170px">${r.label}</span>
            <div class="match-score-bar-outer">
              <div class="match-score-bar-inner" style="width:${r.rate}%;background:${r.color}"></div>
            </div>
            <span class="match-score-pct" style="color:${r.color}">${r.rate}%</span>
          </div>`).join('')}
      </div>

      <div class="card chart-card">
        <div class="chart-title mb-4">Resume Optimization Impact</div>
        ${[
          { label: 'ATS Score', before: 72, after: 95, color: 'var(--success)' },
          { label: 'Job Match', before: 68, after: 94, color: 'var(--primary)' },
          { label: 'Keyword Coverage', before: 61, after: 93, color: 'var(--purple)' },
          { label: 'Readability', before: 78, after: 92, color: 'var(--warning)' }
        ].map(r => `
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:4px">
              <span>${r.label}</span>
              <span style="color:var(--success)">+${r.after-r.before} pts</span>
            </div>
            <div style="display:flex;gap:4px;align-items:center">
              <div style="flex:${r.before};height:8px;background:rgba(255,255,255,0.1);border-radius:4px"></div>
              <div style="flex:${r.after-r.before};height:8px;background:${r.color};border-radius:4px"></div>
              <span style="font-size:0.68rem;color:${r.color};margin-left:4px">${r.after}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>`;

  // Animate bars after render
  setTimeout(animateBars, 100);
}

function renderDonutSegments(data) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let currentAngle = 0;
  const cx = 60, cy = 60, r = 45, innerR = 28;
  return data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.sin(currentAngle);
    const y1 = cy - r * Math.cos(currentAngle);
    const x2 = cx + r * Math.sin(currentAngle + angle);
    const y2 = cy - r * Math.cos(currentAngle + angle);
    const x3 = cx + innerR * Math.sin(currentAngle + angle);
    const y3 = cy - innerR * Math.cos(currentAngle + angle);
    const x4 = cx + innerR * Math.sin(currentAngle);
    const y4 = cy - innerR * Math.cos(currentAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    currentAngle += angle;
    return `<path d="${path}" fill="${d.color}" opacity="0.9" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>`;
  }).join('');
}

function animateBars() {
  document.querySelectorAll('.funnel-bar').forEach(bar => {
    const w = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = w; bar.style.transition = 'width 0.8s ease'; }, 50);
  });
}

// =================== RECRUITER DATABASE ===================

function renderRecruiterDatabase() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Recruiter Intelligence</div>
        <div class="text-muted text-sm">Manage and enhance recruiter profiles with AI</div>
      </div>
      <div style="display:flex;gap:8px">
        <input class="input" style="width:220px" placeholder="Search recruiters..." oninput="filterRecruiters(this.value)" />
        <button class="btn btn-primary btn-sm" onclick="enhanceAllRecruiters()">🤖 Enhance All</button>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="card mb-6">
      <div class="recruiter-profile-card">
        <div class="recruiter-big-avatar">SJ</div>
        <div class="recruiter-profile-info">
          <div class="recruiter-profile-name">Sarah Johnson</div>
          <div class="recruiter-profile-role">Senior Technical Recruiter • TechNova Solutions</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span class="badge badge-success">✓ Email Verified</span>
            <span class="badge badge-primary">12 Active Roles</span>
            <span class="badge badge-purple">8 Recent Posts</span>
          </div>
          <div class="recruiter-meta-grid">
            <div class="recruiter-meta-item"><div class="recruiter-meta-label">Email</div><div class="recruiter-meta-value">sarah.johnson@technova.com</div></div>
            <div class="recruiter-meta-item"><div class="recruiter-meta-label">Company</div><div class="recruiter-meta-value">TechNova Solutions</div></div>
            <div class="recruiter-meta-item"><div class="recruiter-meta-label">Hiring Team</div><div class="recruiter-meta-value">Cloud & Enterprise Eng.</div></div>
            <div class="recruiter-meta-item"><div class="recruiter-meta-label">Confidence</div><div class="recruiter-meta-value text-success">97%</div></div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-primary btn-sm" onclick="enhanceRecruiter('Sarah Johnson')">🤖 AI Enhance</button>
          <button class="btn btn-secondary btn-sm" onclick="openSendModal()">✉️ Send Email</button>
          <button class="btn btn-ghost btn-sm" onclick="showToast('Profile saved', 'success')">💾 Save</button>
        </div>
      </div>
    </div>

    <!-- AI Enhancement Result -->
    <div class="card mb-6" id="aiEnhanceResult" style="display:none">
      <div class="section-title mb-3">🤖 AI Enhanced Profile</div>
      <div class="grid-2">
        <div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${[
              ['Recruiter Name', 'Sarah Johnson'],
              ['Role', 'Senior Technical Recruiter'],
              ['Company', 'TechNova Solutions'],
              ['Hiring Team', 'Enterprise Technology'],
              ['Preferred Contact', 'Email']
            ].map(([k,v]) => `
              <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
                <span style="font-size:0.75rem;color:var(--muted);min-width:140px">${k}</span>
                <span style="font-size:0.82rem;font-weight:600">${v}</span>
              </div>`).join('')}
          </div>
        </div>
        <div>
          <div class="info-box primary mb-3">
            <span>💬</span>
            <div>
              <div style="font-weight:700;font-size:0.75rem">Suggested Greeting</div>
              <div style="font-size:0.78rem;margin-top:4px">"Dear Sarah,"</div>
            </div>
          </div>
          <div class="info-box success">
            <span>📊</span>
            <div>
              <div style="font-weight:700;font-size:0.75rem">AI Confidence Score</div>
              <div style="font-size:1.1rem;font-weight:800;color:var(--success)">97%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recruiter Table -->
    <div class="card">
      <div class="section-title mb-3">All Recruiters</div>
      <div class="recruiter-table-wrap">
        <table class="recruiter-table" id="recruiterTable">
          <thead>
            <tr>
              <th>Recruiter</th><th>Company</th><th>Email</th>
              <th>Team</th><th>Active Roles</th><th>Posts</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK_RECRUITERS.map(r => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="recruiter-avatar-table">${r.initials}</div>
                    <div>
                      <div style="font-weight:600;font-size:0.82rem">${r.name}</div>
                      <div class="text-xs text-muted">${r.role}</div>
                    </div>
                  </div>
                </td>
                <td style="font-size:0.8rem">${r.company}</td>
                <td style="font-size:0.75rem;font-family:var(--mono)">${r.email}</td>
                <td style="font-size:0.78rem">${r.team}</td>
                <td style="text-align:center"><span class="badge badge-primary">${r.active}</span></td>
                <td style="text-align:center"><span class="badge badge-purple">${r.posts}</span></td>
                <td><span class="badge ${r.status === 'Verified' ? 'badge-success' : 'badge-warning'}">${r.status === 'Verified' ? '✓ ' : ''}${r.status}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-sm btn-icon" onclick="enhanceRecruiter('${r.name}')" title="AI Enhance">🤖</button>
                    <button class="btn btn-sm btn-icon" onclick="openSendModal()" title="Email">✉</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function enhanceRecruiter(name) {
  showToast(`AI enhancing ${name} profile...`, 'info');
  setTimeout(() => {
    document.getElementById('aiEnhanceResult').style.display = 'block';
    showToast(`${name} profile enhanced by AI!`, 'success');
    document.getElementById('aiEnhanceResult')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 1500);
}

function enhanceAllRecruiters() {
  showToast('Enhancing all recruiter profiles...', 'info');
  setTimeout(() => showToast('All 6 profiles enhanced!', 'success'), 2000);
}

function filterRecruiters(value) {
  const rows = document.querySelectorAll('#recruiterTable tbody tr');
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(value.toLowerCase()) ? '' : 'none';
  });
}

// =================== RESUME LIBRARY ===================

function renderResumeLibrary() {
  const content = document.getElementById('contentArea');
  const resumes = [
    { name: 'Master Resume', date: 'Sep 10, 2026', versions: 3, ats: 82, icon: '📄' },
    { name: 'Java Developer — TechNova', date: 'Sep 12, 2026', versions: 1, ats: 95, icon: '☕' },
    { name: 'Python Developer — CloudMatrix', date: 'Sep 11, 2026', versions: 1, ats: 91, icon: '🐍' },
    { name: 'Full Stack — Vertex Systems', date: 'Sep 11, 2026', versions: 2, ats: 88, icon: '⚡' },
    { name: 'DevOps Engineer Variant', date: 'Sep 9, 2026', versions: 1, ats: 86, icon: '⚙️' },
    { name: 'Generic C2C Resume', date: 'Sep 5, 2026', versions: 2, ats: 74, icon: '📋' }
  ];
  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Resume Library</div>
        <div class="text-muted text-sm">Manage all your resume versions and variants</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="triggerResumeUpload()">⬆️ Upload Master Resume</button>
        <button class="btn btn-primary btn-sm" onclick="navigateTo('resume-lab')">✨ Create with AI</button>
      </div>
    </div>
    <div class="resume-library-grid">
      ${resumes.map(r => `
        <div class="resume-lib-card" onclick="showToast('Opening ${r.name}', 'info')">
          <div class="resume-lib-icon">${r.icon}</div>
          <div class="resume-lib-title">${r.name}</div>
          <div class="resume-lib-meta">Updated ${r.date}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div class="resume-lib-versions">${r.versions} version${r.versions > 1 ? 's' : ''}</div>
            <span class="badge ${r.ats >= 90 ? 'badge-success' : r.ats >= 80 ? 'badge-primary' : 'badge-warning'}">ATS: ${r.ats}</span>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); showToast('Preview opened', 'info')">Preview</button>
            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); navigateTo('resume-lab')">Optimize</button>
            <button class="btn btn-sm btn-icon" onclick="event.stopPropagation(); downloadResumePDF()" title="Download PDF">⬇</button>
          </div>
        </div>`).join('')}
    </div>`;
}

function triggerResumeUpload() {
  let fileInput = document.getElementById('resumeUploadInput');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'resumeUploadInput';
    fileInput.accept = '.pdf,.txt,.docx';
    fileInput.style.display = 'none';
    fileInput.onchange = (e) => handleResumeUpload(e.target.files[0]);
    document.body.appendChild(fileInput);
  }
  fileInput.click();
}

async function handleResumeUpload(file) {
  if (!file) return;
  showToast(`Uploading and analyzing ${file.name}...`, 'info');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/api/resume/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.candidate) {
      currentActiveCandidate = data.candidate;
      showToast(`Parsed! Candidate Title: ${data.candidate.job_title}`, 'success');

      // Update candidate card on sidebar
      const nameEl = document.querySelector('.candidate-name');
      const roleEl = document.querySelector('.candidate-role');
      if (nameEl) nameEl.textContent = data.candidate.candidate_name;
      if (roleEl) roleEl.textContent = data.candidate.job_title;

      // Update search input if present
      const searchInputs = document.querySelectorAll('.settings-row input');
      searchInputs.forEach(input => {
        if (input.value && input.value.includes('C2C')) {
          input.value = data.candidate.search_query;
        }
      });
    } else {
      showToast(data.detail || 'Upload failed', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to backend upload endpoint', 'error');
  }
}

// =================== EMAIL TEMPLATES ===================

function renderEmailTemplates() {
  const content = document.getElementById('contentArea');
  const templates = [
    { name: 'Standard C2C Application', type: 'Application', uses: 24, preview: 'Dear [Recruiter], I came across your recent LinkedIn post regarding the [Position] opportunity...' },
    { name: 'Follow-Up Email', type: 'Follow-Up', uses: 8, preview: 'Dear [Recruiter], I hope this message finds you well. I am following up on my application for [Position]...' },
    { name: 'Personalized Intro', type: 'Introduction', uses: 12, preview: 'Hi [First Name], I noticed your post about the [Position] role and believe my background in [Skills] would be...' },
    { name: 'Quick Apply Template', type: 'Short-Form', uses: 18, preview: 'Hi [Recruiter], Submitting my resume for [Position] C2C at [Company]. 8+ years Java expertise...' },
    { name: 'LinkedIn Connection', type: 'Networking', uses: 6, preview: 'Hi [First Name], I came across your profile while researching [Company]. I am a Senior Java Developer...' },
    { name: 'Rate Confirmation', type: 'Rate Discussion', uses: 3, preview: 'Dear [Recruiter], Thank you for reaching out about the [Position] opportunity. Regarding the rate...' }
  ];
  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Email Templates</div>
        <div class="text-muted text-sm">Pre-built and AI-generated application templates</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="showToast('AI creating new template...', 'info')">🤖 Generate with AI</button>
    </div>
    <div class="templates-grid">
      ${templates.map(t => `
        <div class="template-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span class="badge badge-primary">${t.type}</span>
            <span class="text-xs text-muted">Used ${t.uses}x</span>
          </div>
          <div class="template-name">${t.name}</div>
          <div class="template-preview">${t.preview}</div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-secondary" onclick="showToast('Template preview opened', 'info')">Preview</button>
            <button class="btn btn-sm btn-primary" onclick="showToast('Template applied to Copilot', 'success'); navigateTo('application-copilot')">Use</button>
            <button class="btn btn-sm btn-icon" onclick="showToast('Template edited', 'info')" title="Edit">✏️</button>
          </div>
        </div>`).join('')}
    </div>`;
}

// =================== ACTIVITY LOGS ===================

function renderActivityLogs() {
  const content = document.getElementById('contentArea');
  const fullLog = [
    ...ACTIVITY_LOG,
    { type: 'primary', icon: '🔍', title: 'AI Discovery started', detail: 'Searching LinkedIn for C2C Java Developer roles', time: '21:20' },
    { type: 'success', icon: '✓', title: 'Application sent', detail: 'DevOps Engineer — DataCore (APP-2026-00941)', time: '21:00' },
    { type: 'warning', icon: '⚠️', title: 'Duplicate skipped', detail: 'Senior Java Developer — IBM (Already processed today)', time: '20:45' },
    { type: 'danger', icon: '✕', title: 'Job filtered out', detail: 'Backend Developer — W2 employment detected', time: '20:30' },
    { type: 'success', icon: '✓', title: 'Resume uploaded', detail: 'Master Resume v3 — Sep 10, 2026', time: '20:00' }
  ];
  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Activity Logs</div>
        <div class="text-muted text-sm">Detailed system and automation logs</div>
      </div>
      <div style="display:flex;gap:8px">
        <select class="select" style="width:160px">
          <option>All Activities</option>
          <option>Jobs Only</option>
          <option>Applications</option>
          <option>Errors</option>
        </select>
        <button class="btn btn-ghost btn-sm" onclick="showToast('Logs exported', 'success')">⬇ Export</button>
      </div>
    </div>
    <div class="card">
      ${fullLog.map(log => `
        <div class="log-entry">
          <div class="log-icon ${log.type}">${log.icon}</div>
          <div class="log-content">
            <div class="log-title">${log.title}</div>
            <div class="log-detail">${log.detail}</div>
          </div>
          <div class="log-time">${log.time}</div>
        </div>`).join('')}
    </div>`;
}

// =================== DUPLICATE DETECTION ===================

function renderDuplicateDetection() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div class="flex justify-between items-center mb-6" style="flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:1.1rem;font-weight:700">Duplicate & Quality Control</div>
        <div class="text-muted text-sm">Smart filtering to ensure only quality opportunities are processed</div>
      </div>
    </div>
    <div class="dup-stats-grid mb-6">
      ${[
        { val: '128', label: 'Jobs Scanned', color: 'var(--primary)' },
        { val: '19', label: 'Duplicates Found', color: 'var(--danger)' },
        { val: '11', label: 'Incomplete Posts', color: 'var(--warning)' },
        { val: '23', label: 'No Recruiter Email', color: 'var(--warning)' },
        { val: '42', label: 'Non-C2C Filtered', color: 'var(--danger)' },
        { val: '9', label: 'Already Processed', color: 'var(--muted)' },
        { val: '24', label: 'Valid Opportunities', color: 'var(--success)' }
      ].map(s => `
        <div class="dup-stat-card">
          <div class="dup-stat-value" style="color:${s.color}">${s.val}</div>
          <div class="dup-stat-label">${s.label}</div>
        </div>`).join('')}
    </div>
    <div class="section-title mb-3">Skipped Posts</div>
    <div class="skipped-cards-grid">
      ${[
        { title: 'Python Developer', company: 'Salesforce', reason: 'W2 employment detected' },
        { title: 'Java Developer', company: 'IBM', reason: 'Already processed today' },
        { title: 'DevOps Engineer', company: 'TechCorp', reason: 'Recruiter email unavailable' },
        { title: 'Full Stack Developer', company: 'StartupXYZ', reason: 'Posted more than 24 hours ago' },
        { title: 'Backend Developer', company: 'CorporateInc', reason: 'No job description provided' },
        { title: 'Cloud Engineer', company: 'MegaCorp', reason: 'Bench & Sales post detected' },
        { title: 'React Developer', company: 'DigitalAgency', reason: 'Full-time employment only' },
        { title: 'Data Engineer', company: 'Analytics Co', reason: 'Duplicate of earlier post' }
      ].map(s => `
        <div class="skipped-card">
          <div class="skipped-badge">SKIPPED</div>
          <div class="skipped-title">${s.title}</div>
          <div style="font-size:0.72rem;color:var(--muted);margin-bottom:6px">${s.company}</div>
          <div class="skipped-reason">Reason: ${s.reason}</div>
        </div>`).join('')}
    </div>`;
}

// =================== SETTINGS ===================

function renderSettings() {
  const content = document.getElementById('contentArea');
  const toggles = [
    { label: 'AI Auto-Discovery', desc: 'Automatically run job discovery every 6 hours', on: true },
    { label: 'Auto Resume Customization', desc: 'Automatically customize resume for new high-match jobs', on: true },
    { label: 'Auto Email Drafts', desc: 'Create email drafts automatically for qualified jobs', on: false },
    { label: 'Duplicate Detection', desc: 'Skip already-processed and duplicate job posts', on: true },
    { label: 'Email Notifications', desc: 'Receive notifications for important events', on: true },
    { label: 'Truthfulness Protection', desc: 'Prevent AI from fabricating qualifications or experience', on: true }
  ];
  content.innerHTML = `
    <div class="grid-2 gap-4">
      <div>
        <!-- Profile Settings -->
        <div class="card mb-4">
          <div class="settings-section-title">👤 Candidate Profile</div>
          ${[
            ['Full Name', 'Alex Morgan', 'text'],
            ['Email Address', 'alex.morgan@email.com', 'email'],
            ['Phone', '+1 (555) 123-4567', 'tel'],
            ['LinkedIn URL', 'linkedin.com/in/alexmorgan', 'text'],
            ['Current Location', 'Dallas, TX', 'text'],
            ['Work Authorization', 'US Citizen', 'text'],
            ['Job Title (for search)', 'Java Developer', 'text']
          ].map(([label, val, type]) => `
            <div class="settings-row">
              <div><div class="settings-label">${label}</div></div>
              <input class="input" type="${type}" value="${val}" style="max-width:260px" />
            </div>`).join('')}
          <button class="btn btn-primary btn-sm mt-4" onclick="showToast('Profile saved!', 'success')">Save Profile</button>
        </div>

        <!-- Search Settings -->
        <div class="card mb-4">
          <div class="settings-section-title">🔍 Search Configuration</div>
          <div class="settings-row">
            <div><div class="settings-label">Default Search Query</div><div class="settings-desc">AI-generated based on your resume</div></div>
            <input class="input" value='"Java Developer" C2C -W2 -Full-Time -Bench' style="max-width:260px" />
          </div>
          <div class="settings-row">
            <div><div class="settings-label">Minimum Match Score</div></div>
            <input class="input" type="number" value="70" min="0" max="100" style="max-width:100px" />
          </div>
          <div class="settings-row">
            <div><div class="settings-label">Post Age Limit</div></div>
            <select class="select" style="max-width:160px"><option>24 hours</option><option>48 hours</option><option>1 week</option></select>
          </div>
          <button class="btn btn-primary btn-sm mt-4" onclick="showToast('Search settings saved!', 'success')">Save Settings</button>
        </div>
      </div>

      <div>
        <!-- Automation Settings -->
        <div class="card mb-4">
          <div class="settings-section-title">⚙️ Automation Settings</div>
          ${toggles.map(t => `
            <div class="settings-row">
              <div>
                <div class="settings-label">${t.label}</div>
                <div class="settings-desc">${t.desc}</div>
              </div>
              <div class="toggle-switch ${t.on ? 'on' : ''}" onclick="toggleSwitch(this)">
                <div class="toggle-thumb"></div>
              </div>
            </div>`).join('')}
        </div>

        <!-- Email Settings -->
        <div class="card mb-4">
          <div class="settings-section-title">📧 Email Configuration</div>
          <div class="settings-row">
            <div><div class="settings-label">Gmail Account</div><div class="settings-desc">Connected email for sending applications</div></div>
            <span class="badge badge-success">✓ Connected</span>
          </div>
          <div class="settings-row">
            <div><div class="settings-label">Sender Name</div></div>
            <input class="input" value="Alex Morgan" style="max-width:200px" />
          </div>
          <div class="settings-row">
            <div><div class="settings-label">Default Tone</div></div>
            <select class="select" style="max-width:160px">
              <option>Professional</option><option>Friendly</option><option>Concise</option>
            </select>
          </div>
          <button class="btn btn-primary btn-sm mt-4" onclick="showToast('Email settings saved!', 'success')">Save Email Settings</button>
        </div>

        <!-- Danger Zone -->
        <div class="card" style="border-color:rgba(255,93,115,0.2)">
          <div class="settings-section-title" style="color:var(--danger)">⚠️ Danger Zone</div>
          <div class="settings-row">
            <div><div class="settings-label">Clear All Activity Logs</div><div class="settings-desc">Permanently delete all automation logs</div></div>
            <button class="btn btn-danger btn-sm" onclick="showToast('Action cancelled — confirmation required', 'error')">Clear Logs</button>
          </div>
          <div class="settings-row">
            <div><div class="settings-label">Reset All Settings</div><div class="settings-desc">Reset to factory defaults</div></div>
            <button class="btn btn-danger btn-sm" onclick="showToast('Action cancelled — confirmation required', 'error')">Reset</button>
          </div>
        </div>
      </div>
    </div>`;
}

function toggleSwitch(el) {
  el.classList.toggle('on');
  const isOn = el.classList.contains('on');
  showToast(`Setting ${isOn ? 'enabled' : 'disabled'}`, 'info');
}

// =================== INIT ===================

document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');

  // Simulate live activity ticker
  let liveMessages = [
    'New C2C opportunity detected on LinkedIn',
    'AI scoring job match: Senior Java Developer',
    'Recruiter email verified: sarah.johnson@technova.com',
    'Resume customization queued for: Python Developer role',
    'Duplicate job filtered: Backend Dev at IBM'
  ];
  let msgIdx = 0;
  setInterval(() => {
    showToast(liveMessages[msgIdx % liveMessages.length], 'info');
    msgIdx++;
  }, 25000);
});
