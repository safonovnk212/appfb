// Facebook Ads Analytics Application
class FacebookAdsApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentPeriod = 'day';
        this.currentMetric = 'ctr';
        this.campaigns = [];
        this.aiRecommendations = [];
        this.metricsExplanations = {};
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.setupTheme();
        this.renderDashboard();
        this.renderCampaigns();
        this.renderAIAdvice();
    }

    // Загрузка примерных данных
    loadSampleData() {
        this.campaigns = [
            {
                id: "camp_001",
                name: "Летняя распродажа 2025",
                status: "ACTIVE",
                objective: "CONVERSIONS",
                daily_budget: 5000,
                spend: 45000,
                impressions: 234567,
                clicks: 5743,
                conversions: 89,
                ctr: 2.45,
                cpc: 45.30,
                cpm: 890.50,
                cpa: 505.62,
                roas: 4.2,
                frequency: 1.8,
                reach: 130000,
                engagement_rate: 3.1,
                created_date: "2025-06-01",
                last_updated: "2025-06-20"
            },
            {
                id: "camp_002", 
                name: "Продвижение нового продукта",
                status: "ACTIVE",
                objective: "TRAFFIC",
                daily_budget: 3000,
                spend: 28500,
                impressions: 156890,
                clicks: 2965,
                conversions: 67,
                ctr: 1.89,
                cpc: 38.90,
                cpm: 654.20,
                cpa: 425.37,
                roas: 3.8,
                frequency: 1.5,
                reach: 104000,
                engagement_rate: 2.7,
                created_date: "2025-05-15",
                last_updated: "2025-06-19"
            },
            {
                id: "camp_003",
                name: "Ретаргетинг корзины",
                status: "ACTIVE", 
                objective: "CONVERSIONS",
                daily_budget: 2000,
                spend: 18000,
                impressions: 67890,
                clicks: 2118,
                conversions: 45,
                ctr: 3.12,
                cpc: 52.10,
                cpm: 1205.40,
                cpa: 400.00,
                roas: 5.6,
                frequency: 2.3,
                reach: 29500,
                engagement_rate: 4.2,
                created_date: "2025-06-10",
                last_updated: "2025-06-20"
            }
        ];

        this.aiRecommendations = [
            {
                type: "budget",
                title: "Перераспределение бюджета",
                description: "Увеличьте бюджет кампании 'Ретаргетинг корзины' на 40% - она показывает лучший ROAS (5.6)",
                priority: "high",
                potential_improvement: "Увеличение конверсий на 25%",
                campaign_id: "camp_003"
            },
            {
                type: "creative",
                title: "Обновление креативов",
                description: "Кампания 'Продвижение нового продукта' показывает низкий CTR (1.89%). Рекомендуется тестировать новые креативы",
                priority: "medium",
                potential_improvement: "Увеличение CTR до 2.5%",
                campaign_id: "camp_002"
            },
            {
                type: "frequency",
                title: "Контроль частоты показов",
                description: "Частота показов кампании 'Ретаргетинг корзины' высокая (2.3). Расширьте аудиторию или уменьшите бюджет",
                priority: "medium",
                potential_improvement: "Снижение CPC на 15%",
                campaign_id: "camp_003"
            },
            {
                type: "targeting",
                title: "Оптимизация таргетинга",
                description: "Создайте lookalike аудиторию на основе конверсий 'Летней распродажи' для масштабирования",
                priority: "high",
                potential_improvement: "Увеличение охвата на 50%",
                campaign_id: "camp_001"
            }
        ];

        this.metricsExplanations = {
            ctr: "Процент людей, кликнувших на рекламу после её просмотра. Хорошее значение: >2%",
            cpc: "Средняя стоимость одного клика по рекламе. Зависит от ниши и конкуренции",
            cpm: "Стоимость за 1000 показов рекламы. Показатель конкурентности аудитории",
            cpa: "Стоимость за целевое действие (конверсию). Ключевая метрика эффективности",
            roas: "Доход от рекламы на каждый потраченный рубль. Хорошее значение: >4:1",
            frequency: "Среднее количество показов рекламы одному пользователю. Оптимально: 1-3",
            reach: "Количество уникальных пользователей, увидевших рекламу",
            engagement_rate: "Процент взаимодействий с рекламой от общего охвата"
        };
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });

        // Переключение периодов
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPeriod(btn.dataset.period);
            });
        });

        // Переключение метрик на графике
        document.querySelectorAll('.metric-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMetric(btn.dataset.metric);
            });
        });

        // Переключение темы
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Мобильное меню
        document.getElementById('mobile-menu').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('mobile-open');
        });

        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.remove('mobile-open');
        });

        // Модальное окно добавления данных
        document.getElementById('add-data').addEventListener('click', () => {
            this.showModal('addDataModal');
        });

        document.getElementById('closeDataModal').addEventListener('click', () => {
            this.hideModal('addDataModal');
        });

        // Табы в модальном окне
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Парсинг URL
        document.getElementById('parseUrlBtn').addEventListener('click', () => {
            this.parseUrlParameters();
        });

        // Загрузка CSV
        document.getElementById('uploadCsvBtn').addEventListener('click', () => {
            this.uploadCsvFile();
        });

        // Настройки
        document.getElementById('themeSelector').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        document.getElementById('clearData').addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('saveApiSettings').addEventListener('click', () => {
            this.saveApiSettings();
        });

        // Закрытие модального окна по клику на фон
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    // Переключение секций
    switchSection(sectionName) {
        // Обновление активной ссылки навигации
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Переключение секций
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        // Закрытие мобильного меню
        document.querySelector('.sidebar').classList.remove('mobile-open');
    }

    // Переключение периодов
    switchPeriod(period) {
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        this.currentPeriod = period;
        this.updateCharts();
    }

    // Переключение метрик
    switchMetric(metric) {
        document.querySelectorAll('.metric-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-metric="${metric}"]`).classList.add('active');
        
        this.currentMetric = metric;
        this.updatePerformanceChart();
    }

    // Настройка темы
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'auto';
        this.setTheme(savedTheme);
        document.getElementById('themeSelector').value = savedTheme;
    }

    // Переключение темы
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Установка темы
    setTheme(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');

        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-color-scheme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            icon.className = prefersDark ? 'bi bi-sun' : 'bi bi-moon';
            text.textContent = prefersDark ? 'Светлая тема' : 'Тёмная тема';
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
            icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon';
            text.textContent = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
        }

        localStorage.setItem('theme', theme);
        this.updateCharts();
    }

    // Отображение дашборда
    renderDashboard() {
        this.renderCampaignsTable();
        this.renderPerformanceChart();
        this.renderImprovementChart();
    }

    // Отображение таблицы кампаний
    renderCampaignsTable() {
        const tbody = document.getElementById('campaignsTableBody');
        tbody.innerHTML = '';

        this.campaigns.forEach(campaign => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div>
                        <strong>${campaign.name}</strong>
                        <div class="status status--${campaign.status.toLowerCase()}">${this.getStatusText(campaign.status)}</div>
                    </div>
                </td>
                <td>${this.formatCurrency(campaign.daily_budget)}</td>
                <td>${this.formatCurrency(campaign.spend)}</td>
                <td>${campaign.ctr}%</td>
                <td>${this.formatCurrency(campaign.cpc)}</td>
                <td>${campaign.conversions}</td>
                <td><strong class="text-success">${campaign.roas}</strong></td>
            `;
            tbody.appendChild(row);
        });
    }

    // Отображение графика производительности
    renderPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        // Генерация данных для графика по периодам
        const data = this.generateChartData(this.currentMetric, this.currentPeriod);
        
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: this.getMetricName(this.currentMetric),
                    data: data.values,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(94, 82, 64, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(94, 82, 64, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Отображение графика улучшений
    renderImprovementChart() {
        const ctx = document.getElementById('improvementChart');
        if (!ctx) return;

        const data = {
            labels: ['CTR', 'CPC', 'ROAS', 'Конверсии'],
            datasets: [{
                label: 'Текущие показатели',
                data: [2.45, 45.30, 4.2, 89],
                backgroundColor: '#FFC185'
            }, {
                label: 'Прогнозируемые',
                data: [3.1, 38.5, 5.8, 125],
                backgroundColor: '#1FB8CD'
            }]
        };

        if (this.improvementChart) {
            this.improvementChart.destroy();
        }

        this.improvementChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(94, 82, 64, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(94, 82, 64, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Отображение кампаний
    renderCampaigns() {
        const container = document.getElementById('campaignsList');
        container.innerHTML = '';

        this.campaigns.forEach(campaign => {
            const card = document.createElement('div');
            card.className = 'card campaign-card fade-in';
            card.innerHTML = `
                <div class="card__body">
                    <div class="campaign-header">
                        <h4 class="campaign-title">${campaign.name}</h4>
                        <span class="status campaign-status status--${campaign.status.toLowerCase()}">${this.getStatusText(campaign.status)}</span>
                    </div>
                    <div class="campaign-metrics">
                        <div class="campaign-metric">
                            <div class="campaign-metric-label">ROAS</div>
                            <div class="campaign-metric-value text-success">${campaign.roas}</div>
                        </div>
                        <div class="campaign-metric">
                            <div class="campaign-metric-label">CTR</div>
                            <div class="campaign-metric-value">${campaign.ctr}%</div>
                        </div>
                        <div class="campaign-metric">
                            <div class="campaign-metric-label">Расход</div>
                            <div class="campaign-metric-value">${this.formatCurrency(campaign.spend)}</div>
                        </div>
                        <div class="campaign-metric">
                            <div class="campaign-metric-label">Конверсии</div>
                            <div class="campaign-metric-value">${campaign.conversions}</div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Отображение AI советов
    renderAIAdvice() {
        const container = document.getElementById('aiAdviceContainer');
        if (!container) return;

        container.innerHTML = '';

        this.aiRecommendations.forEach(advice => {
            const adviceElement = document.createElement('div');
            adviceElement.className = `advice-item priority-${advice.priority} fade-in`;
            adviceElement.innerHTML = `
                <div class="advice-header">
                    <h4 class="advice-title">${advice.title}</h4>
                    <span class="advice-priority ${advice.priority}">${this.getPriorityText(advice.priority)}</span>
                </div>
                <p class="advice-description">${advice.description}</p>
                <div class="advice-improvement">
                    <i class="bi bi-arrow-up-right"></i>
                    ${advice.potential_improvement}
                </div>
            `;
            container.appendChild(adviceElement);
        });
    }

    // Обновление графиков
    updateCharts() {
        this.updatePerformanceChart();
        if (this.improvementChart) {
            this.improvementChart.update();
        }
    }

    // Обновление графика производительности
    updatePerformanceChart() {
        if (!this.performanceChart) return;

        const data = this.generateChartData(this.currentMetric, this.currentPeriod);
        this.performanceChart.data.labels = data.labels;
        this.performanceChart.data.datasets[0].data = data.values;
        this.performanceChart.data.datasets[0].label = this.getMetricName(this.currentMetric);
        this.performanceChart.update();
    }

    // Генерация данных для графика
    generateChartData(metric, period) {
        const baseValue = this.campaigns.reduce((sum, campaign) => sum + campaign[metric], 0) / this.campaigns.length;
        
        let labels = [];
        let values = [];

        if (period === 'day') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
                values.push(baseValue + (Math.random() - 0.5) * baseValue * 0.3);
            }
        } else if (period === 'week') {
            for (let i = 3; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i * 7);
                labels.push(`Неделя ${date.getWeek()}`);
                values.push(baseValue + (Math.random() - 0.5) * baseValue * 0.4);
            }
        } else if (period === 'month') {
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                labels.push(date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }));
                values.push(baseValue + (Math.random() - 0.5) * baseValue * 0.5);
            }
        }

        return { labels, values };
    }

    // Показать модальное окно
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    // Скрыть модальное окно
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    // Переключение табов
    switchTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    // Парсинг URL параметров
    parseUrlParameters() {
        const urlInput = document.getElementById('fbAdsUrl');
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Пожалуйста, введите URL');
            return;
        }

        try {
            const urlObj = new URL(url);
            const params = new URLSearchParams(urlObj.search);
            
            // Извлечение параметров кампании
            const campaignData = {
                campaign_name: this.extractMacro(url, 'utm_campaign') || 'Новая кампания',
                source: this.extractMacro(url, 'utm_source') || 'facebook',
                placement: this.extractMacro(url, 'utm_placement') || 'feed',
                campaign_id: this.extractMacro(url, 'campaign_id') || `camp_${Date.now()}`,
                adset_id: this.extractMacro(url, 'adset_id') || `adset_${Date.now()}`,
                ad_id: this.extractMacro(url, 'ad_id') || `ad_${Date.now()}`
            };

            // Создание новой кампании
            const newCampaign = {
                id: campaignData.campaign_id,
                name: campaignData.campaign_name,
                status: "ACTIVE",
                objective: "CONVERSIONS",
                daily_budget: 1000,
                spend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
                ctr: 0,
                cpc: 0,
                cpm: 0,
                cpa: 0,
                roas: 0,
                frequency: 0,
                reach: 0,
                engagement_rate: 0,
                created_date: new Date().toISOString().split('T')[0],
                last_updated: new Date().toISOString().split('T')[0]
            };

            this.campaigns.push(newCampaign);
            this.renderCampaigns();
            this.renderCampaignsTable();
            this.hideModal('addDataModal');
            
            alert('Кампания успешно добавлена!');
        } catch (error) {
            alert('Ошибка при обработке URL. Проверьте правильность ссылки.');
        }
    }

    // Извлечение макросов из URL
    extractMacro(url, paramName) {
        const regex = new RegExp(`${paramName}=([^&]*)`);
        const match = url.match(regex);
        return match ? decodeURIComponent(match[1]) : null;
    }

    // Загрузка CSV файла
    uploadCsvFile() {
        const fileInput = document.getElementById('csvFileUpload');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Пожалуйста, выберите файл');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const campaigns = this.parseCsvData(csv);
                
                this.campaigns = [...this.campaigns, ...campaigns];
                this.renderCampaigns();
                this.renderCampaignsTable();
                this.hideModal('addDataModal');
                
                alert(`Загружено ${campaigns.length} кампаний`);
            } catch (error) {
                alert('Ошибка при обработке CSV файла');
            }
        };
        reader.readAsText(file);
    }

    // Парсинг CSV данных
    parseCsvData(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const campaigns = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            const campaign = {
                id: `camp_${Date.now()}_${i}`,
                name: values[0] || `Кампания ${i}`,
                status: "ACTIVE",
                objective: "CONVERSIONS",
                daily_budget: parseFloat(values[1]) || 1000,
                spend: parseFloat(values[2]) || 0,
                impressions: parseInt(values[3]) || 0,
                clicks: parseInt(values[4]) || 0,
                conversions: parseInt(values[5]) || 0,
                ctr: parseFloat(values[6]) || 0,
                cpc: parseFloat(values[7]) || 0,
                cpm: parseFloat(values[8]) || 0,
                cpa: parseFloat(values[9]) || 0,
                roas: parseFloat(values[10]) || 0,
                frequency: parseFloat(values[11]) || 0,
                reach: parseInt(values[12]) || 0,
                engagement_rate: parseFloat(values[13]) || 0,
                created_date: new Date().toISOString().split('T')[0],
                last_updated: new Date().toISOString().split('T')[0]
            };
            campaigns.push(campaign);
        }

        return campaigns;
    }

    // Очистка всех данных
    clearAllData() {
        if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            localStorage.clear();
            this.campaigns = [];
            this.renderCampaigns();
            this.renderCampaignsTable();
            alert('Все данные удалены');
        }
    }

    // Экспорт данных
    exportData() {
        const data = {
            campaigns: this.campaigns,
            recommendations: this.aiRecommendations,
            exported_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fb-ads-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Сохранение настроек API
    saveApiSettings() {
        const token = document.querySelector('input[placeholder="Введите ваш access token"]').value;
        if (token) {
            localStorage.setItem('fb_api_token', token);
            alert('Настройки API сохранены');
        } else {
            alert('Пожалуйста, введите токен доступа');
        }
    }

    // Вспомогательные функции
    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    getStatusText(status) {
        const statusMap = {
            'ACTIVE': 'Активна',
            'PAUSED': 'Приостановлена',
            'ARCHIVED': 'В архиве'
        };
        return statusMap[status] || status;
    }

    getPriorityText(priority) {
        const priorityMap = {
            'high': 'Высокий',
            'medium': 'Средний',
            'low': 'Низкий'
        };
        return priorityMap[priority] || priority;
    }

    getMetricName(metric) {
        const metricNames = {
            'ctr': 'CTR (%)',
            'cpc': 'CPC (₽)',
            'cpm': 'CPM (₽)',
            'cpa': 'CPA (₽)',
            'roas': 'ROAS',
            'conversions': 'Конверсии'
        };
        return metricNames[metric] || metric.toUpperCase();
    }
}

// Добавление метода для получения номера недели
Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new FacebookAdsApp();
});