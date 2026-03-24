/**
 * Main JavaScript Module
 * Handles navigation, modals, and form submissions
 */

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Form Modal
function openFormModal(formType, prefillDirection = '') {
    const modal = document.getElementById('formModal');
    const modalBody = document.getElementById('modalBody');
    
    // Load form content based on type
    fetch('/api/content')
        .then(res => res.json())
        .then(content => {
            const formData = content.forms[formType];
            
            let fieldsHtml = '';
            
            formData.fields.forEach(field => {
                let inputHtml = '';
                
                if (field.type === 'select' && field.name === 'direction') {
                    inputHtml = `
                        <select name="${field.name}" class="form-control" ${field.required ? 'required' : ''}>
                            <option value="">Выберите направление</option>
                            ${content.directions.map(d => `
                                <option value="${d.title}" ${d.title === prefillDirection ? 'selected' : ''}>
                                    ${d.title}
                                </option>
                            `).join('')}
                        </select>
                    `;
                } else if (field.type === 'textarea') {
                    inputHtml = `<textarea name="${field.name}" class="form-control" rows="3"></textarea>`;
                } else {
                    inputHtml = `
                        <input 
                            type="${field.type}" 
                            name="${field.name}" 
                            class="form-control" 
                            ${field.required ? 'required' : ''}
                            ${field.type === 'tel' ? 'placeholder="+7 (___) ___-__-__"' : ''}
                        >
                    `;
                }
                
                fieldsHtml += `
                    <div class="form-group">
                        <label class="form-label">${field.label}</label>
                        ${inputHtml}
                    </div>
                `;
            });
            
            modalBody.innerHTML = `
                <span class="close-modal" onclick="closeFormModal()">&times;</span>
                <h2 style="margin-bottom: 1.5rem;">${formData.title}</h2>
                <form onsubmit="handleFormSubmit(event, '${formType}')">
                    ${fieldsHtml}
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        Отправить заявку
                    </button>
                    <p class="form-note">
                        Нажимаю кнопку, вы соглашаетесь с обработкой персональных данных.
                    </p>
                </form>
            `;
            
            modal.classList.add('active');
        });
}

function closeFormModal() {
    document.getElementById('formModal').classList.remove('active');
}

// Form submission
async function handleFormSubmit(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Disable button and show loading state
    submitBtn.textContent = 'Отправка...';
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
            alert('✅ ' + result.message);
            closeFormModal();
            form.reset();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Form submission error:', error);
        alert('❌ Произошла ошибка при отправке. Попробуйте позже.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('formModal');
    if (event.target === modal) {
        closeFormModal();
    }
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeFormModal();
    }
});