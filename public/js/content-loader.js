const ContentLoader = {
    data: {},
    
    async init() {
        try {
            const pageId = document.body.dataset.page;
            const endpoints = this.getEndpointsForPage(pageId);
            
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
            
            endpoints.forEach((endpoint, i) => {
                this.data[endpoint] = results[i];
            });
            
            if (!this.data.forms) {
                const formsRes = await fetch('/api/forms');
                this.data.forms = await formsRes.json().catch(() => null);
            }
            
            if (!this.data.directions) {
                const dirRes = await fetch('/api/directions');
                this.data.directions = await dirRes.json().catch(() => null);
            }

            if (!this.data.contacts) {
                const contactsRes = await fetch('/api/contacts');
                this.data.contacts = await contactsRes.json().catch(() => null);
            }
            
            this.populatePage(pageId);
            this.populateFooter(); 
        } catch (error) {
            console.error('Error initializing ContentLoader:', error);
        }
    },
    
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
        
        if (hero) {
            document.getElementById('hero-title').textContent = hero.title;
            document.getElementById('hero-subtitle').textContent = hero.subtitle;
            document.getElementById('hero-cta-primary').textContent = hero.ctaPrimary;
            document.getElementById('hero-cta-secondary').textContent = hero.ctaSecondary;
        }
        
        if (about) {
            document.getElementById('about-intro').textContent = about.intro;
            document.getElementById('about-benefits').innerHTML = about.benefits
                .slice(0, 4)
                .map(b => `<li>✓ ${b}</li>`).join('');
        }
        
        if (directions) {
            document.getElementById('directions-grid').innerHTML = directions.slice(0, 3)
                .map(dir => this.createDirectionCard(dir)).join('');
        }

        if (teachers) {
            document.getElementById('teachers-preview-grid').innerHTML = teachers.slice(0, 3)
                .map(t => this.createTeacherCard(t)).join('');
        }
    },

    populateAbout() {
        const { about } = this.data;
        if (!about) return;
        
        document.getElementById('about-title').textContent = about.title;
        document.getElementById('about-intro').textContent = about.intro;
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
        document.getElementById('contest-deadline').textContent = ` Прием работ до ${contest.deadline}`;
        document.getElementById('contest-prizes').innerHTML = contest.prizes
            .map(p => `<li>• ${p}</li>`).join('');
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
                    <button class="btn btn-outline" onclick="">
                        Скачать PDF
                    </button>
                </div>
            `).join('');
    },

    populateContacts() {
        const { contacts } = this.data;
        if (!contacts) return;
        
        document.getElementById('contact-address').textContent = contacts.address;
        
        document.getElementById('contact-hours').textContent = contacts.hours;
        
        const phonesContainer = document.getElementById('contact-phones');
        if (contacts.phones && Array.isArray(contacts.phones)) {
            phonesContainer.innerHTML = contacts.phones
                .map(phone => `
                    <a href="tel:${phone.number.replace(/\s/g, '')}" class="phone-link">
                        ${phone.number}
                    </a>
                `).join('');
        }
        
        const socialContainer = document.getElementById('social-links');
        if (contacts.social && Array.isArray(contacts.social)) {
            socialContainer.innerHTML = contacts.social
                .map(social => `
                    <a href="${social.url}" target="_blank" rel="noopener" class="social-link-btn" aria-label="${social.name}">
                        <img src="${social.icon}" alt="${social.name}" class="social-icon" width="24" height="24" loading="lazy">
                    </a>
                `).join('');
        }
    },

    populateFooter() {
        const { contacts } = this.data;
        if (!contacts || !contacts.footer) return;
        
        const footerDesc = document.getElementById('footer-description');
        if (footerDesc) {
            footerDesc.textContent = contacts.footer.description;
        }
        
        const footerNav = document.getElementById('footer-navigation');
        if (footerNav && contacts.footer.navigation) {
            footerNav.innerHTML = contacts.footer.navigation
                .map(link => `<li><a href="${link.url}">${link.label}</a></li>`)
                .join('');
        }
        
        const footerAddress = document.getElementById('footer-address');
        if (footerAddress) {
            footerAddress.textContent = contacts.address;
        }
        
        const footerPhones = document.getElementById('footer-phones');
        if (contacts.phones && Array.isArray(contacts.phones)) {
            footerPhones.innerHTML = contacts.phones
                .map(phone => `
                    <a href="tel:${phone.number.replace(/\s/g, '')}" class="phone-link">
                        ${phone.number}
                    </a>
                `).join('');
        }
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
                            <div class="meta-attr">
                                <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="7" r="5" stroke="#000000" stroke-width="2"/>
                                    <path d="M17 14H17.3517C18.8646 14 20.1408 15.1266 20.3285 16.6279L20.719 19.7519C20.8682 20.9456 19.9374 22 18.7344 22H5.26556C4.06257 22 3.1318 20.9456 3.28101 19.7519L3.67151 16.6279C3.85917 15.1266 5.13538 14 6.64835 14H7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>${dir.age}</span>
                            </div>
                            <div class="meta-attr">
                                <span>${dir.price}</span>
                            </div>
                        </div>
                    ` : ''}
                    <button class="btn btn-primary mt-lg" onclick="openFormModal('enrollment', '${dir.title}')">
                        Записаться
                    </button>
                </div>
            </div>
        `;
    },

    createTeacherCard(teacher) {
        return `
            <div class="card teacher-card">
                <div class="teacher-card-inner">
                    <!-- Front Side -->
                    <div class="teacher-card-front">
                        <img src="${teacher.image}" class="teacher-img" alt="${teacher.name}" loading="lazy">
                        <div class="teacher-card-body">
                            <div>
                                <h3 class="card-title">${teacher.name}</h3>
                                <p class="teacher-role">${teacher.role}</p>
                                <p class="card-text">${teacher.description}</p>
                            </div>
                            <div class="teacher-card-actions">
                                <button class="btn btn-outline teacher-card-btn" onclick="event.stopPropagation(); flipTeacherCard(this)">
                                    Подробнее
                                </button>
                                <div class="teacher-card-hint">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                    </svg>
                                    <span>Наведите для подробностей</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Back Side -->
                    <div class="teacher-card-back">
                        <button class="teacher-card-back-btn" onclick="event.stopPropagation(); flipTeacherCard(this)">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Назад
                        </button>
                        <h3 class="card-title" style="color: white; margin-bottom: 0.5rem;">${teacher.name}</h3>
                        <p class="teacher-role" style="color: rgba(255,255,255,0.8); margin-bottom: 1rem;">${teacher.role}</p>
                        <p class="card-text">${teacher.description}</p>
                    </div>
                </div>
            </div>
        `;
    },

    createCourseCard(course) {
        return `
            <div class="card">
                <img src="${course.image}" class="card-img" alt="${course.title}" loading="lazy">
                <div class="card-body">
                    <h3 class="card-title">${course.title}</h3>
                    <p class="card-text">${course.description}</p>
                    <div class="card-meta">
                        <div class="meta-attr">
                            <svg fill="#000000" width="16px" height="16px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="icon">
                                <path d="M928 224H768v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56H548v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56H328v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56H96c-17.7 0-32 14.3-32 32v576c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32zm-40 568H136V296h120v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56h148v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56h148v56c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-56h120v496zM416 496H232c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0 136H232c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm308.2-177.4L620.6 598.3l-52.8-73.1c-3-4.2-7.8-6.6-12.9-6.6H500c-6.5 0-10.3 7.4-6.5 12.7l114.1 158.2a15.9 15.9 0 0 0 25.8 0l165-228.7c3.8-5.3 0-12.7-6.5-12.7H737c-5-.1-9.8 2.4-12.8 6.5z"/>
                            </svg>
                            <span>${course.classes}</span>
                        </div>
                        <div class="meta-attr">
                            <svg fill="#000000" width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 8c0 4.418 3.59 8 8 8 4.418 0 8-3.59 8-8 0-4.418-3.59-8-8-8-4.418 0-8 3.59-8 8zm2 0c0-3.307 2.686-6 6-6 3.307 0 6 2.686 6 6 0 3.307-2.686 6-6 6-3.307 0-6-2.686-6-6zm5 1h5V7H9V4H7v5z" fill-rule="evenodd"/>
                            </svg>                       
                            <span>${course.duration}</span>
                        </div>
                        <div class="meta-attr">
                            <span>${course.price}</span>
                        </div>
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
                <img src="${mc.image}" class="card-img" alt="${mc.title}" loading="lazy">
                <div class="card-body">
                    <h3 class="card-title">${mc.title}</h3>
                    <div class="card-meta">
                        <div class="meta-attr">
                            <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="7" r="5" stroke="#000000" stroke-width="2"/>
                                <path d="M17 14H17.3517C18.8646 14 20.1408 15.1266 20.3285 16.6279L20.719 19.7519C20.8682 20.9456 19.9374 22 18.7344 22H5.26556C4.06257 22 3.1318 20.9456 3.28101 19.7519L3.67151 16.6279C3.85917 15.1266 5.13538 14 6.64835 14H7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${mc.age}</span>
                        </div>
                        <div class="meta-attr">
                            <span>${mc.group}</span>
                        </div>
                        <div class="meta-attr">
                            <svg fill="#000000" width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 8c0 4.418 3.59 8 8 8 4.418 0 8-3.59 8-8 0-4.418-3.59-8-8-8-4.418 0-8 3.59-8 8zm2 0c0-3.307 2.686-6 6-6 3.307 0 6 2.686 6 6 0 3.307-2.686 6-6 6-3.307 0-6-2.686-6-6zm5 1h5V7H9V4H7v5z" fill-rule="evenodd"/>
                            </svg>  
                            <span>${mc.duration}</span>
                        </div>
                        <div class="meta-attr">
                            <span>${mc.price}</span>
                        </div>
                    </div>
                    <button class="btn btn-outline mt-lg" onclick="openFormModal('enrollment', '${mc.title}')">
                        Записаться
                    </button>
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ContentLoader.init();
});