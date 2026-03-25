/**
 * Main JavaScript Module
 * Handles navigation, modals, and form submissions
 */

// === Mobile Menu Toggle ===
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
    
    // Блокируем прокрутку body при открытом меню
    if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Закрытие мобильного меню при клике на ссылку
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.getElementById('navLinks');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// === Form Modal ===
async function openFormModal(formType, prefillDirection = '') {
    const modal = document.getElementById('formModal');
    const modalBody = document.getElementById('modalBody');
    
    // Показываем состояние загрузки
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="width: 40px; height: 40px; border: 4px solid var(--color-primary); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p style="color: var(--color-text-light);">Загрузка формы...</p>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        // Загружаем данные форм и направлений
        const [formsRes, directionsRes] = await Promise.all([
            fetch('/api/forms'),
            fetch('/api/directions')
        ]);
        
        const forms = await formsRes.json();
        const directions = await directionsRes.json();
        
        const formData = forms[formType];
        
        if (!formData) {
            throw new Error(`Form type "${formType}" not found`);
        }
        
        let fieldsHtml = '';
        
        formData.fields.forEach(field => {
            let inputHtml = '';
            
            if (field.type === 'select' && field.name === 'direction') {
                inputHtml = `
                    <select name="${field.name}" class="form-control" ${field.required ? 'required' : ''}>
                        <option value="">Выберите направление</option>
                        ${directions.map(d => `
                            <option value="${d.title}" ${d.title === prefillDirection ? 'selected' : ''}>
                                ${d.title}
                            </option>
                        `).join('')}
                    </select>
                `;
            } else if (field.type === 'textarea') {
                inputHtml = `<textarea name="${field.name}" class="form-control" rows="3" placeholder="Ваш комментарий..." style="resize: none; overflow-y: auto;"></textarea>`;
            } else if (field.type === 'tel') {
                inputHtml = `
                    <input 
                        type="tel" 
                        name="${field.name}" 
                        class="form-control phone-input"
                        ${field.required ? 'required' : ''}
                        placeholder="+7 (999) 999-99-99"
                        pattern="^[\\d\\s\\-\\+\\(\\)]{10,20}$"
                        inputmode="tel"
                    >
                `;
            } else if (field.type === 'email') {
                inputHtml = `
                    <input 
                        type="email" 
                        name="${field.name}" 
                        class="form-control" 
                        ${field.required ? 'required' : ''}
                        placeholder="example@mail.ru"
                    >
                `;
            } else {
                inputHtml = `
                    <input 
                        type="${field.type}" 
                        name="${field.name}" 
                        class="form-control" 
                        ${field.required ? 'required' : ''}
                    >
                `;
            }
            
            fieldsHtml += `
                <div class="form-group">
                    <label class="form-label">${field.label} ${field.required ? '<span style="color: var(--color-primary);">*</span>' : ''}</label>
                    ${inputHtml}
                </div>
            `;
        });
        
        modalBody.innerHTML = `
            <span class="close-modal" onclick="closeFormModal()" aria-label="Закрыть">&times;</span>
            <h2 style="margin-bottom: 1.5rem;">${formData.title}</h2>
            <form onsubmit="handleFormSubmit(event, '${formType}')" novalidate>
                ${fieldsHtml}
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    Отправить заявку
                </button>
                <p class="form-note">
                    Нажимая кнопку, вы соглашаетесь с <a href="documents.html" target="_blank" style="text-decoration: underline;">обработкой персональных данных</a>.
                </p>
            </form>
        `;
        
        // Добавляем обработчик форматирования телефона
        setTimeout(() => {
            const phoneInput = modalBody.querySelector('.phone-input');
            if (phoneInput) {
                phoneInput.addEventListener('input', formatPhoneNumber);
            }
        }, 100);
        
    } catch (error) {
        console.error('Error loading form:', error);
        modalBody.innerHTML = `
            <span class="close-modal" onclick="closeFormModal()">&times;</span>
            <div style="text-align: center; padding: 2rem;">
                <p style="color: #dc3545; margin-bottom: 1rem;">❌ Не удалось загрузить форму</p>
                <button class="btn btn-outline" onclick="openFormModal('${formType}', '${prefillDirection}')">
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

// === Форматирование телефона ===
function formatPhoneNumber(e) {
    let input = e.target;
    let value = input.value.replace(/\D/g, ''); // Убираем всё кроме цифр
    
    if (value.length > 0) {
        // Убираем 7 или 8 в начале
        if (value[0] === '7' || value[0] === '8') {
            value = value.substring(1);
        }
        
        // Ограничиваем длину (10 цифр после +7)
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        // Форматируем
        let formattedValue = '+7';
        if (value.length > 0) formattedValue += ' (' + value.substring(0, 3);
        if (value.length >= 3) formattedValue += ') ' + value.substring(3, 6);
        if (value.length >= 6) formattedValue += '-' + value.substring(6, 8);
        if (value.length >= 8) formattedValue += '-' + value.substring(8, 10);
        
        input.value = formattedValue;
    }
}

// === Закрытие модального окна ===
function closeFormModal() {
    const modal = document.getElementById('formModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// === Отправка формы ===
async function handleFormSubmit(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Валидация формы
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Нормализация телефона
    if (data.phone) {
        const cleanPhone = data.phone.replace(/\D/g, '');
        let normalizedPhone = cleanPhone;
        
        if (cleanPhone.length === 11 && (cleanPhone[0] === '7' || cleanPhone[0] === '8')) {
            normalizedPhone = '7' + cleanPhone.substring(1);
        } else if (cleanPhone.length === 10) {
            normalizedPhone = '7' + cleanPhone;
        } else if (cleanPhone.length < 10) {
            alert('❌ Пожалуйста, введите корректный номер телефона (минимум 10 цифр)');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        data.phone = '+' + normalizedPhone;
    }
    
    // Disable button and show loading state
    submitBtn.textContent = '⏳ Отправка...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                formType: formType,
                data: data
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Показываем успешное сообщение
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--color-primary);">${result.message}</h3>
                    <p style="color: var(--color-text-light); margin-bottom: 1.5rem;">
                        Мы свяжемся с вами в ближайшее время.
                    </p>
                    <button class="btn btn-primary" onclick="closeFormModal()">
                        Закрыть
                    </button>
                </div>
            `;
        } else {
            alert('❌ ' + result.message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Form submission error:', error);
        alert('Произошла ошибка при отправке. Попробуйте позже или позвоните нам.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// === Закрытие модального окна при клике вне ===
window.onclick = function(event) {
    const modal = document.getElementById('formModal');
    if (event.target === modal) {
        closeFormModal();
    }
}

// === Закрытие модального окна по Escape ===
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeFormModal();
    }
});

// === Анимация спиннера ===
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinStyle);

// === FAQ Toggle Function (ГЛОБАЛЬНАЯ - для всех страниц) ===
window.toggleFaq = function(button) {
    const answer = button.nextElementSibling;
    const isActive = button.classList.contains('active');
    
    // Закрыть все элементы FAQ
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.classList.remove('show');
        q.setAttribute('aria-expanded', 'false');
    });
    
    // Открыть выбранный элемент
    if (!isActive) {
        button.classList.add('active');
        answer.classList.add('show');
        button.setAttribute('aria-expanded', 'true');
    }
}

// === Экспорт функций для глобального доступа ===
window.toggleMobileMenu = toggleMobileMenu;
window.openFormModal = openFormModal;
window.closeFormModal = closeFormModal;
window.handleFormSubmit = handleFormSubmit;