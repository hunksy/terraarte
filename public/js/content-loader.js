/**
 * Content Loader Module
 * Loads content from JSON files and populates the page
 */

const ContentLoader = {
    content: null,
    teachers: null,

    async init() {
        try {
            const [contentRes, teachersRes] = await Promise.all([
                fetch('/api/content'),
                fetch('/api/teachers')
            ]);
            
            this.content = await contentRes.json();
            this.teachers = await teachersRes.json();
            
            this.populatePage();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    },

    populatePage() {
        const pageId = document.body.dataset.page;
        
        if (!pageId) return;

        switch(pageId) {
            case 'home':
                this.populateHome();
                break;
            case 'about':
                this.populateAbout();
                break;
            case 'directions':
                this.populateDirections();
                break;
            case 'teachers':
                this.populateTeachers();
                break;
            case 'courses':
                this.populateCourses();
                break;
            case 'masterclass':
                this.populateMasterclass();
                break;
            case 'contest':
                this.populateContest();
                break;
            case 'documents':
                this.populateDocuments();
                break;
            case 'contacts':
                this.populateContacts();
                break;
        }
    },

    populateHome() {
        const d = this.content;
        
        // Hero
        document.getElementById('hero-title').textContent = d.hero.title;
        document.getElementById('hero-subtitle').textContent = d.hero.subtitle;
        document.getElementById('hero-cta-primary').textContent = d.hero.ctaPrimary;
        document.getElementById('hero-cta-secondary').textContent = d.hero.ctaSecondary;
        
        // About preview
        document.getElementById('about-intro').textContent = d.about.intro;
        document.getElementById('about-benefits').innerHTML = d.about.benefits
            .map(b => `<li>✓ ${b}</li>`).join('');
        
        // Directions preview
        document.getElementById('directions-grid').innerHTML = d.directions.slice(0, 3)
            .map(dir => this.createDirectionCard(dir)).join('');

        document.getElementById('teachers-preview-grid').innerHTML = this.teachers.slice(0, 3)
            .map(t => this.createTeacherCard(t)).join('');
    },

    populateAbout() {
        const d = this.content;
        
        document.getElementById('about-title').textContent = d.about.title;
        document.getElementById('about-text').textContent = d.about.fullText;
        document.getElementById('about-benefits-full').innerHTML = d.about.benefits
            .map(b => `<li>✓ ${b}</li>`).join('');
    },

    populateDirections() {
        const d = this.content;
        
        document.getElementById('directions-full-grid').innerHTML = d.directions
            .map(dir => this.createDirectionCard(dir, true)).join('');
    },

    populateTeachers() {
        document.getElementById('teachers-grid').innerHTML = this.teachers
            .map(t => this.createTeacherCard(t)).join('');
    },

    populateCourses() {
        const d = this.content;
        
        document.getElementById('courses-grid').innerHTML = d.courses
            .map(course => this.createCourseCard(course)).join('');
    },

    populateMasterclass() {
        const d = this.content;
        
        document.getElementById('masterclass-grid').innerHTML = d.masterclasses
            .map(mc => this.createMasterclassCard(mc)).join('');
    },

    populateContest() {
        const d = this.content;
        
        document.getElementById('contest-title').textContent = d.contest.title;
        document.getElementById('contest-desc').textContent = d.contest.description;
        document.getElementById('contest-deadline').textContent = `⏳ Прием работ до ${d.contest.deadline}`;
        document.getElementById('contest-prizes').innerHTML = d.contest.prizes
            .map(p => `<li>🏆 ${p}</li>`).join('');
        document.getElementById('contest-requirements').innerHTML = d.contest.requirements
            .map(r => `<li>• ${r}</li>`).join('');
    },

    populateDocuments() {
        const d = this.content;
        
        document.getElementById('documents-title').textContent = d.documents.title;
        document.getElementById('documents-desc').textContent = d.documents.description;
        document.getElementById('documents-list').innerHTML = d.documents.files
            .map(file => `
                <div class="doc-item">
                    <div class="doc-info">
                        <h4>${file.name}</h4>
                        <p>${file.number}</p>
                    </div>
                    <button class="btn btn-outline" onclick="alert('Скачивание ${file.name}...')">
                        Скачать PDF
                    </button>
                </div>
            `).join('');
    },

    populateContacts() {
        const d = this.content.contacts;
        
        document.getElementById('contact-address').textContent = d.address;
        document.getElementById('contact-phone').textContent = d.phone;
        document.getElementById('contact-phone-link').href = `tel:${d.phone}`;
        document.getElementById('contact-email').textContent = d.email;
        document.getElementById('contact-email-link').href = `mailto:${d.email}`;
        document.getElementById('contact-hours').textContent = d.hours;
    },

    createDirectionCard(dir, full = false) {
        return `
            <div class="card">
                <img src="${dir.image}" class="card-img" alt="${dir.title}">
                <div class="card-body">
                    <h3 class="card-title">${dir.title}</h3>
                    <p class="card-text">${dir.description}</p>
                    ${full ? `
                        <div class="card-meta">
                            <span>📅 ${dir.duration}</span>
                            <span>💰 ${dir.price}</span>
                            <span>👶 ${dir.age}</span>
                        </div>
                    ` : ''}
                    <button class="btn btn-outline mt-lg" onclick="openFormModal('enrollment', '${dir.title}')">
                        Записаться
                    </button>
                </div>
            </div>
        `;
    },

    createTeacherCard(teacher) {
        return `
            <div class="card teacher-card">
                <img src="${teacher.image}" class="teacher-img" alt="${teacher.name}">
                <div class="card-body">
                    <h3 class="card-title">${teacher.name}</h3>
                    <p style="color: var(--color-primary); font-weight: 600;">${teacher.role}</p>
                    <p class="card-text">${teacher.description}</p>
                    <p style="font-size: 0.85rem; color: var(--color-text-light);">
                        📚 ${teacher.education}<br>
                        ⏱ ${teacher.experience} опыта
                    </p>
                </div>
            </div>
        `;
    },

    createCourseCard(course) {
        return `
            <div class="card">
                <div class="card-body">
                    <h3 class="card-title">${course.title}</h3>
                    <p class="card-text">${course.description}</p>
                    <div class="card-meta">
                        <span>📅 ${course.duration}</span>
                        <span>💰 ${course.price}</span>
                    </div>
                    <button class="btn btn-primary mt-lg" onclick="openFormModal('enrollment', '${course.title}')">
                        Записаться на курс
                    </button>
                </div>
            </div>
        `;
    },

    createMasterclassCard(mc) {
        return `
            <div class="card">
                <div class="card-body">
                    <h3 class="card-title">${mc.title}</h3>
                    <p class="card-text">${mc.description}</p>
                    <div class="card-meta">
                        <span>📅 ${mc.date}</span>
                        <span>⏱ ${mc.duration}</span>
                        <span>💰 ${mc.price}</span>
                    </div>
                    <button class="btn btn-outline mt-lg" onclick="openFormModal('enrollment', '${mc.title}')">
                        Записаться
                    </button>
                </div>
            </div>
        `;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ContentLoader.init();
});