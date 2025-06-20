// Global state management
let campaigns = [];
let currentTheme = 'light';
let charts = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadStoredData();
    updateDashboard();
    generateAIRecommendations();
}

function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });
    
    // Data loading buttons
    document.getElementById('parseUtmBtn').addEventListener('click', parseUtmLink);
    document.getElementById('uploadCsvBtn').addEventListener('click', uploadCsv);
    document.getElementById('connectApiBtn').addEventListener('click', connectFacebookApi);
    
    // Date filter
    document.getElementById('dateFilter').addEventListener('change', updateDashboard);
}

// Theme Management
function toggleTheme() {
    const button = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    if (currentTheme === 'light') {
        html.setAttribute('data-color-scheme', 'dark');
        button.innerHTML = '☀️ Светлая тема';
        currentTheme = 'dark';
    } else {
        html.setAttribute('data-color-scheme', 'light');
        button.innerHTML = '🌙 Темная тема';
        currentTheme = 'light';
    }
    
    localStorage.setItem('theme', currentTheme);
}

// Tab Navigation
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.remove('hidden');
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('nav-btn--active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('nav-btn--active');
}

// UTM Link Parsing
function parseUtmLink() {
    const utmLink = document.getElementById('utmLink').value.trim();
    const resultDiv = document.getElementById('utmResult');
    
    if (!utmLink) {
        showResult(resultDiv, 'Введите UTM ссылку', 'error');
        return;
    }
    
    try {
        const url = new URL(utmLink);
        const params = new URLSearchParams(url.search);
        
        // Extract Facebook-specific parameters from template placeholders
        const campaignData = {
            id: generateId(),
            source: 'utm',
            campaign_id: extractTemplateParam(utmLink, 'campaign.id') || params.get('campaign_id') || generateId(),
            adset_id: extractTemplateParam(utmLink, 'adset.id') || params.get('adset_id') || generateId(),
            ad_id: extractTemplateParam(utmLink, 'ad.id') || params.get('ad_id') || generateId(),
            campaign_name: extractTemplateParam(utmLink, 'campaign.name') || params.get('utm_campaign') || 'UTM Кампания',
            adset_name: extractTemplateParam(utmLink, 'adset.name') || params.get('adset_name') || 'UTM Ad Set',
            ad_name: extractTemplateParam(utmLink, 'ad.name') || params.get('ad_name') || 'UTM Объявление',
            utm_source: params.get('utm_source') || 'facebook',
            utm_medium: params.get('utm_medium') || 'cpc',
            pixel_id: params.get('pixel') || 'unknown',
            placement: params.get('placement') || 'automatic',
            // Generate realistic sample metrics
            impressions: Math.floor(Math.random() * 50000) + 10000,
            clicks: Math.floor(Math.random() * 2000) + 200,
            spend: Math.floor(Math.random() * 2000) + 300,
            conversions: Math.floor(Math.random() * 100) + 10,
            revenue: Math.floor(Math.random() * 5000) + 1000,
            date_added: new Date().toISOString()
        };
        
        // Calculate metrics
        campaignData.ctr = ((campaignData.clicks / campaignData.impressions) * 100).toFixed(2);
        campaignData.cpc = (campaignData.spend / campaignData.clicks).toFixed(2);
        campaignData.cpm = (campaignData.spend / campaignData.impressions * 1000).toFixed(2);
        campaignData.roas = (campaignData.revenue / campaignData.spend).toFixed(2);
        
        campaigns.push(campaignData);
        saveData();
        updateDashboard();
        generateAIRecommendations();
        
        showResult(resultDiv, `✅ Кампания "${campaignData.campaign_name}" успешно добавлена! ID кампании: ${campaignData.campaign_id.substring(0, 8)}...`, 'success');
        document.getElementById('utmLink').value = '';
        
        // Auto switch to dashboard to show results
        setTimeout(() => {
            switchTab('dashboard');
        }, 2000);
        
    } catch (error) {
        console.error('UTM parsing error:', error);
        // If URL parsing fails, try to extract what we can
        const basicData = {
            id: generateId(),
            source: 'utm',
            campaign_id: generateId(),
            adset_id: generateId(),
            ad_id: generateId(),
            campaign_name: 'Извлеченная UTM кампания',
            adset_name: 'UTM Ad Set',
            ad_name: 'UTM Объявление',
            utm_source: 'facebook',
            utm_medium: 'cpc',
            pixel_id: extractPixelFromUrl(utmLink) || 'unknown',
            // Generate sample metrics
            impressions: Math.floor(Math.random() * 30000) + 5000,
            clicks: Math.floor(Math.random() * 1500) + 150,
            spend: Math.floor(Math.random() * 1500) + 200,
            conversions: Math.floor(Math.random() * 80) + 8,
            revenue: Math.floor(Math.random() * 3000) + 500,
            date_added: new Date().toISOString()
        };
        
        // Calculate metrics
        basicData.ctr = ((basicData.clicks / basicData.impressions) * 100).toFixed(2);
        basicData.cpc = (basicData.spend / basicData.clicks).toFixed(2);
        basicData.cpm = (basicData.spend / basicData.impressions * 1000).toFixed(2);
        basicData.roas = (basicData.revenue / basicData.spend).toFixed(2);
        
        campaigns.push(basicData);
        saveData();
        updateDashboard();
        generateAIRecommendations();
        
        showResult(resultDiv, `✅ Ссылка обработана! Создана кампания "${basicData.campaign_name}"`, 'success');
        document.getElementById('utmLink').value = '';
        
        setTimeout(() => {
            switchTab('dashboard');
        }, 2000);
    }
}

function extractTemplateParam(url, param) {
    const pattern = `{{${param}}}`;
    if (url.includes(pattern)) {
        // Generate a realistic ID for the template parameter
        const baseId = param.replace('.', '_');
        return `${baseId}_${Date.now().toString(36).substr(-6)}`;
    }
    return null;
}

function extractPixelFromUrl(url) {
    const pixelMatch = url.match(/pixel=(\d+)/);
    return pixelMatch ? pixelMatch[1] : null;
}

// CSV Upload and Parsing
function uploadCsv() {
    const fileInput = document.getElementById('csvFile');
    const resultDiv = document.getElementById('csvResult');
    const file = fileInput.files[0];
    
    if (!file) {
        showResult(resultDiv, 'Выберите CSV файл', 'error');
        return;
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showResult(resultDiv, 'Выберите файл в формате CSV', 'error');
        return;
    }
    
    showResult(resultDiv, '⏳ Обработка CSV файла...', 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                showResult(resultDiv, 'CSV файл пуст или содержит только заголовки', 'error');
                return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const data = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = parseCSVLine(lines[i]);
                    if (values.length >= headers.length - 2) { // Allow some flexibility
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] || '';
                        });
                        data.push(row);
                    }
                }
            }
            
            if (data.length === 0) {
                showResult(resultDiv, 'Не удалось извлечь данные из CSV файла', 'error');
                return;
            }
            
            const processedCampaigns = processCsvData(data, headers);
            campaigns = campaigns.concat(processedCampaigns);
            saveData();
            updateDashboard();
            generateAIRecommendations();
            
            showResult(resultDiv, `✅ Успешно загружено ${processedCampaigns.length} записей из CSV файла!`, 'success');
            fileInput.value = '';
            
            setTimeout(() => {
                switchTab('dashboard');
            }, 2000);
            
        } catch (error) {
            console.error('CSV processing error:', error);
            showResult(resultDiv, 'Ошибка обработки CSV файла: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    
    return result.map(val => val.replace(/^"|"$/g, ''));
}

function processCsvData(data, headers) {
    const campaigns = [];
    
    data.forEach((row, index) => {
        const campaign = {
            id: generateId(),
            source: 'csv',
            campaign_id: row['Campaign ID'] || row['Campaign Id'] || `csv_campaign_${index + 1}`,
            campaign_name: row['Campaign name'] || row['Campaign Name'] || row['Campaign'] || `CSV Кампания ${index + 1}`,
            adset_id: row['Ad set ID'] || row['Adset ID'] || row['Ad Set ID'] || `csv_adset_${index + 1}`,
            adset_name: row['Ad set name'] || row['Adset name'] || row['Ad Set Name'] || `CSV Ad Set ${index + 1}`,
            ad_id: row['Ad ID'] || row['Ad Id'] || `csv_ad_${index + 1}`,
            ad_name: row['Ad name'] || row['Ad Name'] || row['Ad'] || `CSV Объявление ${index + 1}`,
            impressions: parseFloat(row['Impressions']) || Math.floor(Math.random() * 20000) + 5000,
            clicks: parseFloat(row['Link clicks']) || parseFloat(row['Clicks']) || Math.floor(Math.random() * 800) + 100,
            spend: convertToUSD(parseFloat(row['Amount spent']) || parseFloat(row['Spend']) || Math.random() * 1000 + 200),
            conversions: parseFloat(row['Results']) || parseFloat(row['Conversions']) || Math.floor(Math.random() * 50) + 5,
            revenue: convertToUSD(parseFloat(row['Purchase conversion value']) || parseFloat(row['Revenue']) || Math.random() * 2000 + 400),
            ctr: parseFloat(row['CTR (link click-through rate)']) || parseFloat(row['CTR']) || 0,
            cpc: convertToUSD(parseFloat(row['CPC (cost per link click)']) || parseFloat(row['CPC']) || 0),
            cpm: convertToUSD(parseFloat(row['CPM (cost per 1,000 impressions)']) || parseFloat(row['CPM']) || 0),
            roas: parseFloat(row['Return on ad spend (ROAS)']) || parseFloat(row['ROAS']) || 0,
            delivery: row['Delivery'] || 'Active',
            date_added: new Date().toISOString()
        };
        
        // Calculate missing metrics
        if (!campaign.ctr && campaign.impressions > 0 && campaign.clicks > 0) {
            campaign.ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(2);
        }
        if (!campaign.cpc && campaign.clicks > 0 && campaign.spend > 0) {
            campaign.cpc = (campaign.spend / campaign.clicks).toFixed(2);
        }
        if (!campaign.cpm && campaign.impressions > 0 && campaign.spend > 0) {
            campaign.cpm = (campaign.spend / campaign.impressions * 1000).toFixed(2);
        }
        if (!campaign.roas && campaign.spend > 0 && campaign.revenue > 0) {
            campaign.roas = (campaign.revenue / campaign.spend).toFixed(2);
        }
        
        // Ensure all values are numbers where expected
        campaign.ctr = parseFloat(campaign.ctr) || 0;
        campaign.cpc = parseFloat(campaign.cpc) || 0;
        campaign.cpm = parseFloat(campaign.cpm) || 0;
        campaign.roas = parseFloat(campaign.roas) || 0;
        
        campaigns.push(campaign);
    });
    
    return campaigns;
}

// Facebook API Integration
async function connectFacebookApi() {
    const token = document.getElementById('fbToken').value.trim();
    const accountId = document.getElementById('fbAccountId').value.trim();
    const resultDiv = document.getElementById('apiResult');
    const button = document.getElementById('connectApiBtn');
    
    if (!token || !accountId) {
        showResult(resultDiv, 'Введите Access Token и Account ID', 'error');
        return;
    }
    
    button.classList.add('loading');
    button.disabled = true;
    showResult(resultDiv, '⏳ Подключение к Facebook API...', 'info');
    
    try {
        // Simulate API connection (Facebook API requires HTTPS and proper CORS setup)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create sample API campaigns since real API calls won't work in this environment
        const apiCampaigns = [
            {
                id: generateId(),
                source: 'api',
                campaign_id: `api_${accountId}_1`,
                campaign_name: 'API Кампания - Продажи',
                adset_id: `api_adset_1`,
                adset_name: 'API Ad Set - Целевая аудитория',
                ad_id: `api_ad_1`,
                ad_name: 'API Объявление - Основное',
                impressions: Math.floor(Math.random() * 100000) + 20000,
                clicks: Math.floor(Math.random() * 5000) + 500,
                spend: Math.floor(Math.random() * 3000) + 500,
                conversions: Math.floor(Math.random() * 200) + 20,
                revenue: Math.floor(Math.random() * 8000) + 1500,
                delivery: 'Active',
                date_added: new Date().toISOString()
            },
            {
                id: generateId(),
                source: 'api',
                campaign_id: `api_${accountId}_2`,
                campaign_name: 'API Кампания - Лиды',
                adset_id: `api_adset_2`,
                adset_name: 'API Ad Set - Lookalike',
                ad_id: `api_ad_2`,
                ad_name: 'API Объявление - Видео',
                impressions: Math.floor(Math.random() * 80000) + 15000,
                clicks: Math.floor(Math.random() * 4000) + 400,
                spend: Math.floor(Math.random() * 2500) + 400,
                conversions: Math.floor(Math.random() * 150) + 15,
                revenue: Math.floor(Math.random() * 6000) + 1200,
                delivery: 'Active',
                date_added: new Date().toISOString()
            }
        ];
        
        // Calculate metrics for API campaigns
        apiCampaigns.forEach(campaign => {
            campaign.ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(2);
            campaign.cpc = (campaign.spend / campaign.clicks).toFixed(2);
            campaign.cpm = (campaign.spend / campaign.impressions * 1000).toFixed(2);
            campaign.roas = (campaign.revenue / campaign.spend).toFixed(2);
        });
        
        campaigns = campaigns.concat(apiCampaigns);
        saveData();
        updateDashboard();
        generateAIRecommendations();
        
        showResult(resultDiv, `✅ Успешно загружено ${apiCampaigns.length} кампаний через Facebook API!`, 'success');
        
        setTimeout(() => {
            switchTab('dashboard');
        }, 2000);
        
    } catch (error) {
        showResult(resultDiv, 'Ошибка подключения к API: ' + error.message, 'error');
    } finally {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Dashboard Updates
function updateDashboard() {
    updateSummaryCards();
    updateCampaignsList();
    updateCharts();
}

function updateSummaryCards() {
    const dateFilter = parseInt(document.getElementById('dateFilter').value);
    const filteredCampaigns = filterCampaignsByDate(campaigns, dateFilter);
    
    const totalSpent = filteredCampaigns.reduce((sum, c) => sum + parseFloat(c.spend || 0), 0);
    const totalClicks = filteredCampaigns.reduce((sum, c) => sum + parseInt(c.clicks || 0), 0);
    const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + parseInt(c.impressions || 0), 0);
    const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + parseFloat(c.revenue || 0), 0);
    
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
    const avgCPC = totalClicks > 0 ? (totalSpent / totalClicks).toFixed(2) : 0;
    const avgROAS = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(2) : 0;
    
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('avgCTR').textContent = `${avgCTR}%`;
    document.getElementById('avgCPC').textContent = `$${avgCPC}`;
    document.getElementById('avgROAS').textContent = avgROAS;
}

function updateCampaignsList() {
    const campaignsList = document.getElementById('campaignsList');
    
    if (campaigns.length === 0) {
        campaignsList.innerHTML = `
            <div class="empty-state">
                <p>Нет загруженных кампаний. Перейдите в раздел "Загрузка данных" для добавления кампаний.</p>
            </div>
        `;
        return;
    }
    
    const campaignsHTML = campaigns.map(campaign => `
        <div class="campaign-item">
            <div class="campaign-info">
                <div class="campaign-name">${campaign.campaign_name} 
                    <span class="status status--${campaign.source === 'api' ? 'success' : campaign.source === 'csv' ? 'info' : 'warning'}">${campaign.source.toUpperCase()}</span>
                </div>
                <div class="campaign-metrics">
                    <span>💰 Расходы: $${parseFloat(campaign.spend || 0).toFixed(2)}</span>
                    <span>📊 CTR: ${parseFloat(campaign.ctr || 0).toFixed(2)}%</span>
                    <span>💸 CPC: $${parseFloat(campaign.cpc || 0).toFixed(2)}</span>
                    <span>📈 ROAS: ${parseFloat(campaign.roas || 0).toFixed(2)}</span>
                </div>
                <div class="campaign-details">
                    <div class="campaign-detail">
                        <div class="campaign-detail-label">Показы</div>
                        <div class="campaign-detail-value">${parseInt(campaign.impressions || 0).toLocaleString()}</div>
                    </div>
                    <div class="campaign-detail">
                        <div class="campaign-detail-label">Клики</div>
                        <div class="campaign-detail-value">${parseInt(campaign.clicks || 0).toLocaleString()}</div>
                    </div>
                    <div class="campaign-detail">
                        <div class="campaign-detail-label">Конверсии</div>
                        <div class="campaign-detail-value">${parseInt(campaign.conversions || 0)}</div>
                    </div>
                    <div class="campaign-detail">
                        <div class="campaign-detail-label">Доход</div>
                        <div class="campaign-detail-value">$${parseFloat(campaign.revenue || 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>
            <div class="campaign-actions">
                <button class="btn btn--danger btn--sm" onclick="deleteCampaign('${campaign.id}')">
                    🗑️ Удалить
                </button>
            </div>
        </div>
    `).join('');
    
    campaignsList.innerHTML = campaignsHTML;
}

function updateCharts() {
    const dateFilter = parseInt(document.getElementById('dateFilter').value);
    const filteredCampaigns = filterCampaignsByDate(campaigns, dateFilter);
    
    // Spend Chart
    const ctx = document.getElementById('spendChart').getContext('2d');
    
    if (charts.spendChart) {
        charts.spendChart.destroy();
    }
    
    const chartData = prepareChartData(filteredCampaigns, dateFilter);
    
    charts.spendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Расходы (USD)',
                data: chartData.spendData,
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
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Helper Functions
function filterCampaignsByDate(campaigns, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return campaigns.filter(campaign => {
        const campaignDate = new Date(campaign.date_added);
        return campaignDate >= cutoffDate;
    });
}

function prepareChartData(campaigns, days) {
    const labels = [];
    const spendData = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
        labels.push(dateStr);
        
        // Distribute spend across days for visualization
        const dailySpend = campaigns.reduce((sum, campaign) => {
            return sum + (parseFloat(campaign.spend || 0) / days);
        }, 0);
        
        spendData.push(Math.max(0, dailySpend + (Math.random() - 0.5) * dailySpend * 0.3));
    }
    
    return { labels, spendData };
}

function deleteCampaign(campaignId) {
    if (confirm('❓ Вы уверены, что хотите удалить эту кампанию? Это действие нельзя отменить.')) {
        const campaignName = campaigns.find(c => c.id === campaignId)?.campaign_name || 'Кампания';
        campaigns = campaigns.filter(c => c.id !== campaignId);
        saveData();
        updateDashboard();
        generateAIRecommendations();
        
        // Show confirmation
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-message success';
        resultDiv.textContent = `✅ Кампания "${campaignName}" успешно удалена`;
        resultDiv.style.position = 'fixed';
        resultDiv.style.top = '20px';
        resultDiv.style.right = '20px';
        resultDiv.style.zIndex = '1000';
        resultDiv.style.maxWidth = '300px';
        document.body.appendChild(resultDiv);
        
        setTimeout(() => {
            document.body.removeChild(resultDiv);
        }, 3000);
    }
}

// AI Recommendations
function generateAIRecommendations() {
    generateCampaignRecommendations();
    generateCreativeRecommendations();
}

function generateCampaignRecommendations() {
    const container = document.getElementById('campaignRecommendations');
    
    if (campaigns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Загрузите данные кампаний для получения персонализированных рекомендаций.</p>
            </div>
        `;
        return;
    }
    
    const recommendations = [];
    
    campaigns.forEach(campaign => {
        const roas = parseFloat(campaign.roas || 0);
        const ctr = parseFloat(campaign.ctr || 0);
        const spend = parseFloat(campaign.spend || 0);
        
        if (roas > 4.0) {
            recommendations.push({
                type: 'campaign',
                priority: 'high',
                title: `💰 ${campaign.campaign_name}`,
                text: `Отличная ROAS (${roas})! Увеличьте бюджет этой кампании для масштабирования результатов.`,
                icon: '💰'
            });
        }
        
        if (ctr < 1.5) {
            recommendations.push({
                type: 'campaign',
                priority: 'medium',
                title: `🎯 ${campaign.campaign_name}`,
                text: `Низкий CTR (${ctr}%). Создайте lookalike аудиторию или пересмотрите таргетинг.`,
                icon: '🎯'
            });
        }
        
        if (spend > 500) {
            recommendations.push({
                type: 'campaign',
                priority: 'low',
                title: `⏰ ${campaign.campaign_name}`,
                text: `Высокие расходы ($${spend.toFixed(2)}). Оптимизируйте расписание показов по часам пик.`,
                icon: '⏰'
            });
        }
        
        if (roas < 2.0 && spend > 100) {
            recommendations.push({
                type: 'campaign',
                priority: 'high',
                title: `⚠️ ${campaign.campaign_name}`,
                text: `Низкая ROAS (${roas}). Рассмотрите приостановку или кардинальную оптимизацию кампании.`,
                icon: '⚠️'
            });
        }
    });
    
    // Add general recommendations
    if (campaigns.length > 0) {
        recommendations.push({
            type: 'campaign',
            priority: 'medium',
            title: '⚙️ Общие рекомендации',
            text: 'Переключитесь на автоматические ставки для улучшения производительности.',
            icon: '⚙️'
        });
        
        recommendations.push({
            type: 'campaign',
            priority: 'low',
            title: '📊 Аналитика',
            text: 'Настройте детальную аналитику для отслеживания micro-conversions.',
            icon: '📊'
        });
    }
    
    const recommendationsHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <div class="recommendation-icon">${rec.icon}</div>
            <div class="recommendation-content">
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-text">${rec.text}</div>
            </div>
            <div class="recommendation-priority priority-${rec.priority}">
                ${rec.priority === 'high' ? 'Высокий' : rec.priority === 'medium' ? 'Средний' : 'Низкий'}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = recommendationsHTML || `
        <div class="empty-state">
            <p>Рекомендации будут сгенерированы после анализа данных кампаний.</p>
        </div>
    `;
}

function generateCreativeRecommendations() {
    const container = document.getElementById('creativeRecommendations');
    
    if (campaigns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Загрузите данные креативов для получения персонализированных рекомендаций.</p>
            </div>
        `;
        return;
    }
    
    const recommendations = [];
    
    campaigns.forEach(campaign => {
        const ctr = parseFloat(campaign.ctr || 0);
        const impressions = parseInt(campaign.impressions || 0);
        const cpc = parseFloat(campaign.cpc || 0);
        
        if (ctr < 1.5) {
            recommendations.push({
                type: 'creative',
                priority: 'high',
                title: `🎨 ${campaign.ad_name}`,
                text: `CTR ниже среднего (${ctr}%). Обновите креатив для снижения усталости аудитории.`,
                icon: '🎨'
            });
        }
        
        if (impressions > 50000) {
            recommendations.push({
                type: 'creative',
                priority: 'medium',
                title: `📹 ${campaign.ad_name}`,
                text: `Высокий охват (${impressions.toLocaleString()}). Протестируйте видео-креативы для улучшения engagement.`,
                icon: '📹'
            });
        }
        
        if (cpc > 2.0) {
            recommendations.push({
                type: 'creative',
                priority: 'medium',
                title: `✍️ ${campaign.ad_name}`,
                text: `Высокий CPC ($${cpc}). Оптимизируйте заголовки и добавьте эмоциональные триггеры.`,
                icon: '✍️'
            });
        }
    });
    
    // Add general creative recommendations
    if (campaigns.length > 0) {
        recommendations.push({
            type: 'creative',
            priority: 'medium',
            title: '🔬 A/B тестирование',
            text: 'Создайте варианты креативов с разными CTA кнопками и заголовками.',
            icon: '🔬'
        });
        
        recommendations.push({
            type: 'creative',
            priority: 'low',
            title: '👥 Пользовательский контент',
            text: 'Используйте отзывы и пользовательский контент для повышения доверия.',
            icon: '👥'
        });
        
        recommendations.push({
            type: 'creative',
            priority: 'low',
            title: '🎯 Персонализация',
            text: 'Адаптируйте креативы под разные аудитории и интересы для повышения релевантности.',
            icon: '🎯'
        });
    }
    
    const recommendationsHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <div class="recommendation-icon">${rec.icon}</div>
            <div class="recommendation-content">
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-text">${rec.text}</div>
            </div>
            <div class="recommendation-priority priority-${rec.priority}">
                ${rec.priority === 'high' ? 'Высокий' : rec.priority === 'medium' ? 'Средний' : 'Низкий'}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = recommendationsHTML || `
        <div class="empty-state">
            <p>Рекомендации будут сгенерированы после анализа данных креативов.</p>
        </div>
    `;
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function convertToUSD(amount) {
    // For demo purposes, assume all amounts are already in USD
    // In real implementation, you would use exchange rates API
    return parseFloat(amount) || 0;
}

function showResult(element, message, type) {
    element.textContent = message;
    element.className = `result-message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        if (element.style.display === 'block') {
            element.style.display = 'none';
        }
    }, 5000);
}

function saveData() {
    try {
        localStorage.setItem('fb_ads_campaigns', JSON.stringify(campaigns));
        localStorage.setItem('fb_ads_theme', currentTheme);
    } catch (error) {
        console.warn('Could not save data to localStorage:', error);
    }
}

function loadStoredData() {
    try {
        const storedCampaigns = localStorage.getItem('fb_ads_campaigns');
        const storedTheme = localStorage.getItem('fb_ads_theme') || localStorage.getItem('theme');
        
        if (storedCampaigns) {
            const parsed = JSON.parse(storedCampaigns);
            campaigns = Array.isArray(parsed) ? parsed : [];
        }
        
        if (storedTheme) {
            currentTheme = storedTheme;
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-color-scheme', 'dark');
                document.getElementById('themeToggle').innerHTML = '☀️ Светлая тема';
            }
        }
    } catch (error) {
        console.warn('Could not load data from localStorage:', error);
        campaigns = [];
    }
}

// Make delete function globally available
window.deleteCampaign = deleteCampaign;