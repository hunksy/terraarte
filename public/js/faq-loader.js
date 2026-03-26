document.addEventListener('DOMContentLoaded', () => {
    loadFAQ();
});

async function loadFAQ() {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;

    try {
        const response = await fetch('/api/faq');
        if (!response.ok) throw new Error('Не удалось загрузить FAQ');
        
        const data = await response.json();
        renderFAQ(data, faqList);
    } catch (error) {
        console.error('Ошибка загрузки FAQ:', error);
        faqList.innerHTML = '<p style="text-align:center;color:var(--color-text-light)">Не удалось загрузить вопросы. Попробуйте позже.</p>';
    }
}

function renderFAQ(faqItems, container) {
    const items = Array.isArray(faqItems) ? faqItems : (faqItems.faq || []);
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--color-text-light)">Вопросы пока не добавлены</p>';
        return;
    }
    
    container.innerHTML = items.map((item, index) => `
        <div class="faq-item">
            <button class="faq-question" onclick="toggleFaq(this)" aria-expanded="false">
                <span>${escapeHtml(item.question)}</span>
                <svg class="faq-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div class="faq-answer">
                <p>${escapeHtml(item.answer)}</p>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}