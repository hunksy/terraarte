/**
 * Content Loader Module
 * Loads content from separate JSON files and populates the page
 */

const ContentLoader = {
    data: {},
    
    // Загрузка всех необходимых данных параллельно
    async init() {
        try {
            // Определяем, какие данные нужны для текущей страницы
            const pageId = document.body.dataset.page;
            const endpoints = this.getEndpointsForPage(pageId);
            
            // Загружаем данные параллельно
            const promises = endpoints.map(endpoint => 
                fetch(`/api/${endpoint}`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to load ${endpoint}`);
                        return res.json();
                    })
                    .catch(err => {
                        console.error(`Error loading ${endpoint}:`, err);
                        return null;
                    })
            );
            
            const results = await Promise.all(promises);
            
            // Сохраняем данные в объект
            endpoints.forEach((endpoint, i) => {
                this.data[endpoint] = results[i];
            });
            
            // Дополнительно загружаем формы для модальных окон (всегда нужны)
            if (!this.data.forms) {
                const formsRes = await fetch('/api/forms');
                this.data.forms = await formsRes.json().catch(() => null);
            }
            
            // Дополнительно загружаем направления для селектов в формах
            if (!this.data.directions) {
                const dirRes = await fetch('/api/directions');
                this.data.directions = await dirRes.json().catch(() => null);
            }
            
            this.populatePage(pageId);
        } catch (error) {
            console.error('Error initializing ContentLoader:', error);
        }
    },
    
    // Определяем, какие эндпоинты нужны для каждой страницы
    getEndpointsForPage(pageId) {
        const pageEndpoints = {
            'home': ['hero', 'about', 'directions', 'teachers'],
            'about': ['about'],
            'directions': ['directions'],
            'teachers': ['teachers'],
            'courses': ['courses', 'directions'],
            'masterclass': ['masterclasses'],
            'contest': ['contest'],
            'documents': ['documents'],
            'contacts': ['contacts']
        };
        
        return pageEndpoints[pageId] || [];
    },

    populatePage(pageId) {
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
        const { hero, about, directions, teachers } = this.data;
        
        // Hero
        if (hero) {
            document.getElementById('hero-title').textContent = hero.title;
            document.getElementById('hero-subtitle').textContent = hero.subtitle;
            document.getElementById('hero-cta-primary').textContent = hero.ctaPrimary;
            document.getElementById('hero-cta-secondary').textContent = hero.ctaSecondary;
        }
        
        // About preview
        if (about) {
            document.getElementById('about-intro').textContent = about.intro;
            document.getElementById('about-benefits').innerHTML = about.benefits
                .slice(0, 4)
                .map(b => `<li>✓ ${b}</li>`).join('');
        }
        
        // Directions preview
        if (directions) {
            document.getElementById('directions-grid').innerHTML = directions.slice(0, 3)
                .map(dir => this.createDirectionCard(dir)).join('');
        }

        // Teachers preview
        if (teachers) {
            document.getElementById('teachers-preview-grid').innerHTML = teachers.slice(0, 3)
                .map(t => this.createTeacherCard(t)).join('');
        }
    },

    populateAbout() {
        const { about } = this.data;
        if (!about) return;
        
        document.getElementById('about-title').textContent = about.title;
        document.getElementById('about-text').textContent = about.fullText;
        document.getElementById('about-benefits-full').innerHTML = about.benefits
            .map(b => `<li>✓ ${b}</li>`).join('');
    },

    populateDirections() {
        const { directions } = this.data;
        if (!directions) return;
        
        document.getElementById('directions-full-grid').innerHTML = directions
            .map(dir => this.createDirectionCard(dir, true)).join('');
    },

    populateTeachers() {
        const { teachers } = this.data;
        if (!teachers) return;
        
        document.getElementById('teachers-grid').innerHTML = teachers
            .map(t => this.createTeacherCard(t)).join('');
    },

    populateCourses() {
        const { courses } = this.data;
        if (!courses) return;
        
        document.getElementById('courses-grid').innerHTML = courses
            .map(course => this.createCourseCard(course)).join('');
    },

    populateMasterclass() {
        const { masterclasses } = this.data;
        if (!masterclasses) return;
        
        document.getElementById('masterclass-grid').innerHTML = masterclasses
            .map(mc => this.createMasterclassCard(mc)).join('');
    },

    populateContest() {
        const { contest } = this.data;
        if (!contest) return;
        
        document.getElementById('contest-title').textContent = contest.title;
        document.getElementById('contest-desc').textContent = contest.description;
        document.getElementById('contest-deadline').textContent = `⏳ Прием работ до ${contest.deadline}`;
        document.getElementById('contest-prizes').innerHTML = contest.prizes
            .map(p => `<li>🏆 ${p}</li>`).join('');
        document.getElementById('contest-requirements').innerHTML = contest.requirements
            .map(r => `<li>• ${r}</li>`).join('');
    },

    populateDocuments() {
        const { documents } = this.data;
        if (!documents) return;
        
        document.getElementById('documents-title').textContent = documents.title;
        document.getElementById('documents-desc').textContent = documents.description;
        document.getElementById('documents-list').innerHTML = documents.files
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
        const { contacts } = this.data;
        if (!contacts) return;
        
        document.getElementById('contact-address').textContent = contacts.address;
        document.getElementById('contact-phone').textContent = contacts.phone;
        document.getElementById('contact-phone-link').href = `tel:${contacts.phone}`;
        document.getElementById('contact-email').textContent = contacts.email;
        document.getElementById('contact-email-link').href = `mailto:${contacts.email}`;
        document.getElementById('contact-hours').textContent = contacts.hours;
    },

    createDirectionCard(dir, full = false) {
        return `
            <div class="card">
                <img src="${dir.image}" class="card-img" alt="${dir.title}" loading="lazy">
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
                <img src="${teacher.image}" class="teacher-img" alt="${teacher.name}" loading="lazy">
                <div class="card-body">
                    <h3 class="card-title">${teacher.name}</h3>
                    <p style="color: var(--color-primary); font-weight: 600;">${teacher.role}</p>
                    <p class="card-text">${teacher.description}</p>
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