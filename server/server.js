require('dotenv').config();
const express = require('express');
const path = require('path');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// const emailTransporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.mail.ru',
//     port: parseInt(process.env.EMAIL_PORT) || 465,
//     secure: true,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     },
//     lookup: (hostname, options, callback) => {
//         return dns.lookup(hostname, { family: 4 }, callback);
//     }
// });

// emailTransporter.verify((error, success) => {
//     if (error) {
//         console.error('Ошибка подключения к почте:', error.message);
//     } else {
//         console.log('Почта готова к отправке');
//     }
// });

app.get('/api/config', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/config.json'));
});

app.get('/api/hero', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/hero.json'));
});

app.get('/api/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/about.json'));
});

app.get('/api/directions', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/directions.json'));
});

app.get('/api/courses', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/courses.json'));
});

app.get('/api/masterclasses', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/masterclasses.json'));
});

app.get('/api/contest', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/contest.json'));
});

app.get('/api/documents', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/documents.json'));
});

app.get('/api/contacts', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/contacts.json'));
});

app.get('/api/forms', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/forms.json'));
});

app.get('/api/faq', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/faq.json'));
});

app.get('/api/teachers', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/teachers.json'));
});

app.get('/api/courses', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/courses.json'));
});

app.get('/api/masterclasses', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/masterclasses.json'));
});

app.post('/api/submit-form', async (req, res) => {
    const { formType, data } = req.body;
    
    if (!['enrollment', 'contest'].includes(formType)) {
        return res.status(400).json({ success: false, message: 'Invalid form type' });
    }

    const requiredFields = formType === 'enrollment' 
        ? ['parentName', 'phone', 'childName', 'childAge', 'direction']
        : ['fullName', 'phone', 'email', 'age', 'workTitle'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
        }
    }

    try {
        const telegramMessage = formatFormMessage(formType, data, { forTelegram: true });
        const plainTextMessage = formatFormMessage(formType, data, { forTelegram: false });
        const emailSubject = formType === 'enrollment' 
            ? '📚 Новая заявка на обучение' 
            : '🏆 Новая заявка на конкурс';

        let telegramSent = false;
        let emailSent = false;
        let errors = [];

        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        if (telegramToken && telegramChatId) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: telegramChatId,
                        text: telegramMessage,
                        parse_mode: 'HTML'
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (telegramResponse.ok) {
                    telegramSent = true;
                } else {
                    const errData = await telegramResponse.json().catch(() => ({}));
                    errors.push('Telegram');
                }
            } catch (error) {
                errors.push('Telegram (timeout)');
            }
        }

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailTo = process.env.EMAIL_TO || 'vfndtqxtvfuby@mail.ru';
        const emailFrom = process.env.EMAIL_FROM || emailUser;

        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'onboarding@resend.dev', // можно оставить
                    to: emailTo,
                    subject: emailSubject,
                    html: `
                        <div style="font-family: Arial; padding: 20px;">
                            <h2>${emailSubject}</h2>
                            <pre style="white-space: pre-wrap;">${plainTextMessage}</pre>
                            <p style="color: #999; font-size: 12px;">
                                Отправлено: ${new Date().toLocaleString('ru-RU')}
                            </p>
                        </div>
                    `
                });
        
                emailSent = true;
            } catch (error) {
                console.error(error.message);
                errors.push('Email');
            }
        }

        if (emailSent || telegramSent) {
            res.json({ 
                success: true, 
                message: 'Заявка успешно отправлена',
                details: {
                    telegram: telegramSent ? 'отправлено' : 'ошибка',
                    email: emailSent ? 'отправлено' : 'ошибка'
                }
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Не удалось отправить заявку. Пожалуйста, свяжитесь с нами по телефону.',
                errors: errors
            });
        }
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка отправки заявки',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

function formatFormMessage(formType, data, options = {}) {
    const { forTelegram = true } = options;
    const br = '\n';
    const boldOpen = forTelegram ? '<b>' : '';
    const boldClose = forTelegram ? '</b>' : '';

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

app.listen(PORT, () => {
    console.log(`Server running`);
});
