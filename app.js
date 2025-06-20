// Facebook Ads Analytics Application
class FacebookAdsAnalytics {
    constructor() {
        this.data = {
            creatives: [],
            campaigns: [],
            apiKey: '',
            chatHistory: []
        };
        this.charts = {};
        this.currentSection = 'dashboard';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleDataIfEmpty();
        this.updateDashboard();
        this.setupThemeToggle();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Dashboard
        document.getElementById('exportData').addEventListener('click', () => this.exportData());

        // Import
        document.getElementById('loadSampleData').addEventListener('click', () => this.loadSampleData());
        document.getElementById('clearData').addEventListener('click', () => this.clearData());
        document.getElementById('selectFileBtn').addEventListener('click', () => {
            document.getElementById('csvFileInput').click();
        });
        document.getElementById('csvFileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('confirmImport').addEventListener('click', () => this.confirmImport());
        document.getElementById('cancelImport').addEventListener('click', () => this.cancelImport());

        // File drag and drop
        const uploadArea = document.getElementById('fileUploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect({ target: { files } });
            }
        });

        // Chat
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.querySelectorAll('.quick-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.dataset.question;
                document.getElementById('chatInput').value = question;
                this.sendMessage();
            });
        });

        // Filter
        document.getElementById('statusFilter').addEventListener('change', () => this.filterCreatives());

        // Modal
        document.getElementById('confirmAction').addEventListener('click', () => this.executeConfirmAction());
        document.getElementById('cancelAction').addEventListener('click', () => this.hideModal());
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-color-scheme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-color-scheme', newTheme);
        });
    }

    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        this.currentSection = sectionName;
        
        // Update section-specific content
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        } else if (sectionName === 'creatives') {
            this.updateCreativesSection();
        }
    }

    loadSampleDataIfEmpty() {
        if (this.data.creatives.length === 0) {
            this.loadSampleData();
        }
    }

    loadSampleData() {
        const sampleData = {
            "creatives": [
                {
                    "ad_name": "AO_qVHSJLXq_20.06_1",
                    "creative_id": "704623132470235",
                    "delivery_status": "active",
                    "results": 5.0,
                    "reach": 2677,
                    "impressions": 2855,
                    "frequency": 1.07,
                    "cost_per_result": 1.17,
                    "amount_spent_usd": 5.86,
                    "cpm": 2.05,
                    "link_clicks": 143,
                    "cpc": 0.041,
                    "ctr_link": 5.01,
                    "clicks_all": 178,
                    "ctr_all": 6.23,
                    "cpc_all": 0.033
                },
                {
                    "ad_name": "AO_qVHSJLXq_20.06_2",
                    "creative_id": "762546256297653",
                    "delivery_status": "not_delivering",
                    "results": 0.0,
                    "reach": 1118,
                    "impressions": 1160,
                    "frequency": 1.04,
                    "cost_per_result": 0.0,
                    "amount_spent_usd": 2.5,
                    "cpm": 2.16,
                    "link_clicks": 46,
                    "cpc": 0.054,
                    "ctr_link": 3.97,
                    "clicks_all": 59,
                    "ctr_all": 5.09,
                    "cpc_all": 0.042
                },
                {
                    "ad_name": "AO_Performance_Test_3",
                    "creative_id": "825647291836472",
                    "delivery_status": "active",
                    "results": 12.0,
                    "reach": 4523,
                    "impressions": 5847,
                    "frequency": 1.29,
                    "cost_per_result": 0.98,
                    "amount_spent_usd": 11.76,
                    "cpm": 2.01,
                    "link_clicks": 287,
                    "cpc": 0.041,
                    "ctr_link": 4.91,
                    "clicks_all": 356,
                    "ctr_all": 6.09,
                    "cpc_all": 0.033
                }
            ]
        };

        this.data.creatives = sampleData.creatives;
        this.updateDashboard();
        this.updateCreativesSection();
        this.showNotification('Демо данные успешно загружены', 'success');
    }

    clearData() {
        this.showConfirmModal(
            'Очистить данные',
            'Вы уверены, что хотите удалить все загруженные данные? Это действие нельзя отменить.',
            () => {
                this.data.creatives = [];
                this.data.campaigns = [];
                this.data.chatHistory = [];
                this.updateDashboard();
                this.updateCreativesSection();
                this.showNotification('Все данные очищены', 'success');
            }
        );
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            this.showNotification('Пожалуйста, выберите CSV файл', 'error');
            return;
        }

        this.showLoading(true);
        
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                this.showLoading(false);
                this.previewImportData(results.data);
            },
            error: (error) => {
                this.showLoading(false);
                this.showNotification('Ошибка при чтении файла: ' + error.message, 'error');
            }
        });
    }

    previewImportData(csvData) {
        if (csvData.length === 0) {
            this.showNotification('CSV файл пустой', 'error');
            return;
        }

        this.pendingData = this.processCsvData(csvData);
        
        const preview = document.getElementById('dataPreview');
        const previewContent = document.getElementById('previewContent');
        
        previewContent.innerHTML = `
            <p><strong>Найдено креативов:</strong> ${this.pendingData.length}</p>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Статус</th>
                            <th>CTR</th>
                            <th>CPC</th>
                            <th>Затраты</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.pendingData.slice(0, 5).map(item => `
                            <tr>
                                <td>${item.ad_name}</td>
                                <td><span class="status-badge status-badge--${item.delivery_status === 'active' ? 'active' : 'not-delivering'}">${item.delivery_status}</span></td>
                                <td>${item.ctr_link.toFixed(2)}%</td>
                                <td>$${item.cpc.toFixed(3)}</td>
                                <td>$${item.amount_spent_usd.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        ${this.pendingData.length > 5 ? `<tr><td colspan="5">... и еще ${this.pendingData.length - 5} креативов</td></tr>` : ''}
                    </tbody>
                </table>
            </div>
        `;
        
        preview.classList.remove('hidden');
    }

    processCsvData(csvData) {
        return csvData.filter(row => row['Ad name']).map(row => ({
            ad_name: row['Ad name'] || '',
            creative_id: row['Image/video ID'] || Math.random().toString(36).substr(2, 15),
            delivery_status: this.normalizeStatus(row['Delivery status'] || ''),
            results: parseFloat(row['Results'] || 0),
            reach: parseInt(row['Reach'] || 0),
            impressions: parseInt(row['Impressions'] || 0),
            frequency: parseFloat(row['Frequency'] || 0),
            cost_per_result: parseFloat(row['Cost per result'] || 0),
            amount_spent_usd: parseFloat(row['Amount spent (USD)'] || 0),
            cpm: parseFloat(row['CPM'] || 0),
            link_clicks: parseInt(row['Link clicks'] || 0),
            cpc: parseFloat(row['CPC'] || 0),
            ctr_link: parseFloat(row['CTR'] || 0),
            clicks_all: parseInt(row['Clicks (all)'] || 0),
            ctr_all: parseFloat(row['CTR (all)'] || 0),
            cpc_all: parseFloat(row['CPC (all)'] || 0)
        }));
    }

    normalizeStatus(status) {
        const statusMap = {
            'Active': 'active',
            'Not delivering': 'not_delivering',
            'Paused': 'paused',
            'In review': 'in_review'
        };
        return statusMap[status] || 'unknown';
    }

    confirmImport() {
        if (this.pendingData) {
            this.data.creatives = this.pendingData;
            this.pendingData = null;
            this.updateDashboard();
            this.updateCreativesSection();
            this.cancelImport();
            this.showNotification('Данные успешно импортированы', 'success');
        }
    }

    cancelImport() {
        document.getElementById('dataPreview').classList.add('hidden');
        this.pendingData = null;
    }

    updateDashboard() {
        if (this.data.creatives.length === 0) {
            this.showEmptyState();
            return;
        }

        const metrics = this.calculateMetrics();
        
        // Update summary cards
        document.getElementById('totalSpend').textContent = `$${metrics.totalSpend.toFixed(2)}`;
        document.getElementById('totalResults').textContent = metrics.totalResults.toString();
        document.getElementById('avgCTR').textContent = `${metrics.avgCTR.toFixed(2)}%`;
        document.getElementById('avgCPC').textContent = `$${metrics.avgCPC.toFixed(3)}`;

        // Update charts
        this.updateCharts();
        
        // Update performance table
        this.updatePerformanceTable();
    }

    calculateMetrics() {
        const creatives = this.data.creatives;
        
        return {
            totalSpend: creatives.reduce((sum, c) => sum + c.amount_spent_usd, 0),
            totalResults: creatives.reduce((sum, c) => sum + c.results, 0),
            avgCTR: creatives.reduce((sum, c) => sum + c.ctr_link, 0) / creatives.length,
            avgCPC: creatives.reduce((sum, c) => sum + c.cpc, 0) / creatives.length,
            avgCPM: creatives.reduce((sum, c) => sum + c.cpm, 0) / creatives.length
        };
    }

    updateCharts() {
        this.createCTRChart();
        this.createSpendChart();
    }

    createCTRChart() {
        const ctx = document.getElementById('ctrChart');
        if (this.charts.ctr) {
            this.charts.ctr.destroy();
        }

        const data = this.data.creatives.map(c => ({
            label: c.ad_name.length > 20 ? c.ad_name.substr(0, 17) + '...' : c.ad_name,
            value: c.ctr_link
        }));

        this.charts.ctr = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    label: 'CTR (%)',
                    data: data.map(d => d.value),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                    borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                    borderWidth: 1
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
                        title: {
                            display: true,
                            text: 'CTR (%)'
                        }
                    }
                }
            }
        });
    }

    createSpendChart() {
        const ctx = document.getElementById('spendChart');
        if (this.charts.spend) {
            this.charts.spend.destroy();
        }

        const data = this.data.creatives.map(c => ({
            label: c.ad_name.length > 15 ? c.ad_name.substr(0, 12) + '...' : c.ad_name,
            value: c.amount_spent_usd
        }));

        this.charts.spend = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.value),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updatePerformanceTable() {
        const tbody = document.querySelector('#performanceTable tbody');
        tbody.innerHTML = '';

        this.data.creatives.forEach(creative => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${creative.ad_name}</td>
                <td><span class="status-badge status-badge--${creative.delivery_status === 'active' ? 'active' : 'not-delivering'}">${creative.delivery_status}</span></td>
                <td>${creative.ctr_link.toFixed(2)}%</td>
                <td>$${creative.cpc.toFixed(3)}</td>
                <td>$${creative.amount_spent_usd.toFixed(2)}</td>
                <td>${creative.results}</td>
                <td>
                    <button class="btn btn--sm btn--outline" onclick="app.deleteCreative('${creative.creative_id}')">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateCreativesSection() {
        const grid = document.getElementById('creativesGrid');
        grid.innerHTML = '';

        this.data.creatives.forEach(creative => {
            const card = this.createCreativeCard(creative);
            grid.appendChild(card);
        });
    }

    createCreativeCard(creative) {
        const card = document.createElement('div');
        card.className = 'card creative-card';
        
        const performanceScore = this.calculatePerformanceScore(creative);
        const fatigueStatus = this.calculateFatigueStatus(creative);
        const recommendations = this.generateRecommendations(creative);

        card.innerHTML = `
            <div class="card__body">
                <div class="creative-header">
                    <div>
                        <h3 class="creative-title">${creative.ad_name}</h3>
                        <div class="creative-id">ID: ${creative.creative_id}</div>
                    </div>
                    <div class="creative-actions">
                        <button class="btn btn--sm btn--outline" onclick="app.deleteCreative('${creative.creative_id}')">Удалить</button>
                    </div>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-item">
                        <div class="metric-label">CTR</div>
                        <div class="metric-value">${creative.ctr_link.toFixed(2)}%</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">CPC</div>
                        <div class="metric-value">$${creative.cpc.toFixed(3)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Затраты</div>
                        <div class="metric-value">$${creative.amount_spent_usd.toFixed(2)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Результаты</div>
                        <div class="metric-value">${creative.results}</div>
                    </div>
                </div>
                
                <div class="performance-indicators">
                    <div class="performance-score">
                        <span>Оценка производительности:</span>
                        <span class="score-value ${performanceScore.class}">${performanceScore.score}/100</span>
                    </div>
                    <div class="fatigue-indicator">
                        <span class="fatigue-dot ${fatigueStatus.class}"></span>
                        <span>${fatigueStatus.text}</span>
                    </div>
                    
                    ${recommendations.length > 0 ? `
                        <div class="recommendations">
                            <h4>AI Рекомендации:</h4>
                            <ul>
                                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return card;
    }

    calculatePerformanceScore(creative) {
        let score = 50; // Base score
        
        // CTR scoring
        if (creative.ctr_link > 5) score += 25;
        else if (creative.ctr_link > 2) score += 15;
        else if (creative.ctr_link > 1) score += 5;
        else score -= 15;
        
        // CPC scoring
        if (creative.cpc < 0.25) score += 15;
        else if (creative.cpc < 0.5) score += 10;
        else if (creative.cpc > 1) score -= 10;
        
        // Delivery status
        if (creative.delivery_status === 'active') score += 10;
        else score -= 20;
        
        score = Math.max(0, Math.min(100, score));
        
        let className = 'score-poor';
        if (score >= 80) className = 'score-excellent';
        else if (score >= 60) className = 'score-good';
        else if (score >= 40) className = 'score-warning';
        
        return { score, class: className };
    }

    calculateFatigueStatus(creative) {
        if (creative.frequency > 3) {
            return { class: 'fatigue-critical', text: 'Критическая усталость аудитории' };
        } else if (creative.frequency > 2) {
            return { class: 'fatigue-warning', text: 'Предупреждение об усталости' };
        } else {
            return { class: 'fatigue-normal', text: 'Нормальная частота показов' };
        }
    }

    generateRecommendations(creative) {
        const recommendations = [];
        
        if (creative.delivery_status !== 'active') {
            recommendations.push('Проверьте статус доставки и причины блокировки');
        }
        
        if (creative.ctr_link < 1.5) {
            recommendations.push('CTR ниже среднего - обновите креатив');
        }
        
        if (creative.frequency > 2.5) {
            recommendations.push('Высокая частота - расширьте аудиторию');
        }
        
        if (creative.cpc > 0.5) {
            recommendations.push('Высокая стоимость клика - оптимизируйте таргетинг');
        }
        
        if (creative.ctr_link > 4 && creative.cpc < 0.3) {
            recommendations.push('Отличная производительность - масштабируйте кампанию');
        }
        
        return recommendations;
    }

    filterCreatives() {
        const filter = document.getElementById('statusFilter').value;
        const cards = document.querySelectorAll('.creative-card');
        
        cards.forEach(card => {
            const statusBadge = card.querySelector('.status-badge');
            const status = statusBadge.classList.contains('status-badge--active') ? 'active' : 'not_delivering';
            
            if (!filter || status === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    deleteCreative(creativeId) {
        this.showConfirmModal(
            'Удалить креатив',
            'Вы уверены, что хотите удалить этот креатив?',
            () => {
                this.data.creatives = this.data.creatives.filter(c => c.creative_id !== creativeId);
                this.updateDashboard();
                this.updateCreativesSection();
                this.showNotification('Креатив удален', 'success');
            }
        );
    }

    saveApiKey() {
        const apiKey = document.getElementById('apiKey').value.trim();
        if (!apiKey) {
            this.showNotification('Пожалуйста, введите API ключ', 'error');
            return;
        }
        
        this.data.apiKey = apiKey;
        this.updateApiStatus();
        this.showNotification('API ключ сохранен', 'success');
    }

    updateApiStatus() {
        const statusEl = document.getElementById('apiStatus');
        if (this.data.apiKey) {
            statusEl.innerHTML = '<span class="status status--success">API подключен</span>';
        } else {
            statusEl.innerHTML = '<span class="status status--info">API не настроен</span>';
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        this.addMessageToChat(message, 'user');
        
        if (!this.data.apiKey) {
            this.addMessageToChat('Пожалуйста, настройте API ключ в настройках выше.', 'ai');
            return;
        }
        
        try {
            const response = await this.callPerplexityAPI(message);
            this.addMessageToChat(response, 'ai');
        } catch (error) {
            this.addMessageToChat('Извините, произошла ошибка при обращении к AI. Проверьте API ключ и попробуйте снова.', 'ai');
        }
    }

    async callPerplexityAPI(message) {
        const context = this.generateChatContext();
        
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.data.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    {
                        role: 'system',
                        content: `Вы эксперт по Facebook рекламе с глубокими знаниями оптимизации кампаний, анализа креативов и performance маркетинга. Анализируйте предоставленные данные кампаний и давайте конкретные, действенные рекомендации. Всегда ссылайтесь на реальные метрики из загруженных данных в ваших ответах. Фокусируйтесь на оптимизации CTR, предотвращении усталости креативов, расширении аудиторий и улучшении cost efficiency. Отвечайте на русском языке.

Текущие данные кампаний:
${context}`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 1000,
                temperature: 0.1
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    generateChatContext() {
        if (this.data.creatives.length === 0) {
            return 'Данные о креативах не загружены.';
        }

        const summary = this.calculateMetrics();
        const creativesData = this.data.creatives.map(c => ({
            name: c.ad_name,
            status: c.delivery_status,
            ctr: c.ctr_link,
            cpc: c.cpc,
            spend: c.amount_spent_usd,
            results: c.results,
            frequency: c.frequency
        }));

        return `
Общая статистика:
- Всего креативов: ${this.data.creatives.length}
- Общие затраты: $${summary.totalSpend.toFixed(2)}
- Общие результаты: ${summary.totalResults}
- Средний CTR: ${summary.avgCTR.toFixed(2)}%
- Средний CPC: $${summary.avgCPC.toFixed(3)}

Детали по креативам:
${creativesData.map(c => `
- ${c.name}: CTR ${c.ctr.toFixed(2)}%, CPC $${c.cpc.toFixed(3)}, затраты $${c.spend.toFixed(2)}, результаты ${c.results}, частота ${c.frequency.toFixed(2)}, статус: ${c.status}
`).join('')}
        `;
    }

    addMessageToChat(message, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = `message message--${sender}`;
        
        const timestamp = new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageEl.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-timestamp">${timestamp}</div>
        `;
        
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.data.chatHistory.push({ message, sender, timestamp });
    }

    exportData() {
        const dataToExport = {
            creatives: this.data.creatives,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facebook_ads_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Данные экспортированы', 'success');
    }

    showEmptyState() {
        document.getElementById('totalSpend').textContent = '$0.00';
        document.getElementById('totalResults').textContent = '0';
        document.getElementById('avgCTR').textContent = '0.00%';
        document.getElementById('avgCPC').textContent = '$0.00';
        
        const tbody = document.querySelector('#performanceTable tbody');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Нет данных для отображения. Загрузите данные через раздел "Импорт данных".</td></tr>';
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            background: var(--color-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'});
            color: white;
            border-radius: 8px;
            z-index: 1001;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').classList.remove('hidden');
        
        this.pendingConfirmAction = onConfirm;
    }

    executeConfirmAction() {
        if (this.pendingConfirmAction) {
            this.pendingConfirmAction();
            this.pendingConfirmAction = null;
        }
        this.hideModal();
    }

    hideModal() {
        document.getElementById('confirmModal').classList.add('hidden');
        this.pendingConfirmAction = null;
    }
}

// Initialize the application
const app = new FacebookAdsAnalytics();

// Make app globally accessible for onclick handlers
window.app = app;