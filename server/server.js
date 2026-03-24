require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Serve JSON data
app.get('/api/content', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/content.json'));
});

app.get('/api/teachers', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/teachers.json'));
});

// Form submission handler
app.post('/api/submit-form', async (req, res) => {
    const { formType, data } = req.body;
    
    // Validate form type
    if (!['enrollment', 'contest'].includes(formType)) {
        return res.status(400).json({ success: false, message: 'Invalid form type' });
    }

    // Validate required fields
    const requiredFields = formType === 'enrollment' 
        ? ['parentName', 'phone', 'childName', 'childAge', 'direction']
        : ['fullName', 'phone', 'email', 'age', 'workTitle'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
        }
    }

    // Send to Telegram
    try {
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        if (telegramToken && telegramChatId) {
            const message = formatFormMessage(formType, data);
            
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramChatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        }

        // Log to console (for development)
        console.log(`\n=== NEW ${formType.toUpperCase()} FORM ===`);
        console.log(formatFormMessage(formType, data, false));
        console.log('==============================\n');

        res.json({ success: true, message: 'Заявка успешно отправлена' });
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ success: false, message: 'Ошибка отправки заявки' });
    }
});

// Helper function to format message
function formatFormMessage(formType, data, html = true) {
    const br = html ? '\n' : '\n';
    const boldOpen = html ? '<b>' : '';
    const boldClose = html ? '</b>' : '';

    if (formType === 'enrollment') {
        return `${boldOpen}📚 НОВАЯ ЗАЯВКА НА ОБУЧЕНИЕ${boldClose}${br}${br}` +
               `${boldOpen}Родитель:${boldClose} ${data.parentName}${br}` +
               `${boldOpen}Телефон:${boldClose} ${data.phone}${br}` +
               `${boldOpen}Ребёнок:${boldClose} ${data.childName} (${data.childAge} лет)${br}` +
               `${boldOpen}Направление:${boldClose} ${data.direction}${br}` +
               (data.comment ? `${boldOpen}Комментарий:${boldClose} ${data.comment}${br}` : '');
    } else {
        return `${boldOpen}🏆 НОВАЯ ЗАЯВКА НА КОНКУРС${boldClose}${br}${br}` +
               `${boldOpen}ФИО:${boldClose} ${data.fullName}${br}` +
               `${boldOpen}Телефон:${boldClose} ${data.phone}${br}` +
               `${boldOpen}Email:${boldClose} ${data.email}${br}` +
               `${boldOpen}Возраст:${boldClose} ${data.age}${br}` +
               `${boldOpen}Работа:${boldClose} ${data.workTitle}${br}` +
               (data.comment ? `${boldOpen}Комментарий:${boldClose} ${data.comment}${br}` : '');
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});