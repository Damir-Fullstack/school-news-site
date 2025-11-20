// --- Переменные для отслеживания состояния (глобально доступны) ---
// Установите здесь начальные ID, соответствующие самым старой и самой новой новостям
let currentNewNewsId = 100; 
let currentOldNewsId = 99;  

// !!! НАСТРОЙТЕ ЭТИ АДРЕСА ПОД СВОЙ СЕРВЕР !!!
const NEWS_API_CHECK_ENDPOINT = '/api/get-latest-news-id';
const NEWS_API_CONTENT_ENDPOINT = '/api/get-news-content/'; 

// Элементы UI: Используем ваши ID
const newContentElement = document.getElementById('nnews'); // Новая новость
const oldContentElement = document.getElementById('onews'); // Старая новость
const updateButton = document.getElementById('up');     // Кнопка

// --- Вспомогательная функция для получения контента новости ---
async function fetchNewsContent(newsId) {
    if (!newsId) return "Brak danych (ID nie podano)";
    
    try {
        console.log(`[Загрузка] Запрос контента для ID: ${newsId}`);
        const response = await fetch(NEWS_API_CONTENT_ENDPOINT + newsId);
        
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json();
        
        // ВАЖНО: Мы вставляем контент внутрь вашего тега <p>. 
        // Сохраняем начальные теги <strong> и <span> для Старой/Новой новости.
        
        const label = (newsId === currentNewNewsId) ? 'New news' : 'Old news';
        
        // Сервер должен вернуть { title: "...", content: "..." }
        return `<strong><span>${label}</span>:</strong><br>${data.content || 'Brak treści'}<br><em>${data.title || ''}</em>`;

    } catch (error) {
        console.error(`[Ошибка] Не удалось загрузить контент новости ID ${newsId}:`, error.message);
        return `<strong><span>Błąd</span>:</strong><br>Nie udało się załadować wiadomości (ID: ${newsId}).`;
    }
}

/**
 * 💡 ГЛАВНАЯ ФУНКЦИЯ, привязанная к кнопке.
 */
async function updatePage() {
    console.log('--- [Начало] updatePage: Проверка новостей ---');
    
    try {
        // 1. Проверяем наличие новой новости (только по ID)
        const response = await fetch(`${NEWS_API_CHECK_ENDPOINT}?current_id=${currentNewNewsId}`);

        if (!response.ok) {
            console.error(`[Ошибка] HTTP-статус: ${response.status}. Не удалось проверить ID.`);
            return; 
        }

        const data = await response.json();
        const latestServerId = data.latest_id;
        
        if (latestServerId > currentNewNewsId) {
            
            // 2. Сдвиг состояния
            const previousNewId = currentNewNewsId;
            currentOldNewsId = previousNewId;
            currentNewNewsId = latestServerId;
            
            console.log('✅ [Успех] Найдена новая новость! Сдвиг ID выполнен.');

            // 3. Обновление UI:
            
            // a) Обновляем Старую новость (ID: onews)
            if (oldContentElement) {
                 // Вставляем предыдущую "Новую" новость в секцию "Старая"
                 const oldContentHTML = await fetchNewsContent(previousNewId);
                 oldContentElement.innerHTML = oldContentHTML;
            }
            
            // b) Обновляем Новую новость (ID: nnews)
            if (newContentElement) {
                // Загружаем самую последнюю новость в секцию "Новая"
                const newContentHTML = await fetchNewsContent(currentNewNewsId);
                newContentElement.innerHTML = newContentHTML;
            }
            
        } else {
            console.log('[Без изменений] Новостей нет или они уже загружены. ID:', currentNewNewsId);
        }
        
    } catch (error) {
        console.error('[Критическая ошибка] Ошибка при выполнении запроса:', error.message);
    }
    
    console.log('--- [Конец] updatePage завершена ---');
}

// --- Привязка функции к кнопке после загрузки DOM ---
document.addEventListener('DOMContentLoaded', () => {
    if (updateButton) {
        // Привязываем функцию к кнопке с ID 'up'
        updateButton.addEventListener('click', updatePage);
        console.log("JavaScript подключен. Функция updatePage() привязана к кнопке с ID 'up'.");
    } else {
         console.error("Кнопка с ID 'up' не найдена. Проверьте HTML.");
    }
});

                                
