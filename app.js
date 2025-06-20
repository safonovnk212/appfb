// Facebook Ads Analytics Application
class FacebookAdsAnalytics {
    constructor() {
        this.campaigns = [];
        this.creatives = [];
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.charts = {};
        this.benchmarks = {
            cpm_range: [5.54, 35.23],
            cpc_range: [0.25, 0.58],
            ctr_range: [1.5, 5.0],
            cpa_range: [3.45, 15.20],
            roas_median: 2.19,
            roas_sales: 4.87,
            frequency_threshold: 3.0
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupTheme();
        this.updateUI();
    }

    // Data Management
    loadData() {
        const savedCampaigns = localStorage.getItem('fb_ads_campaigns');
        const savedCreatives = localStorage.getItem('fb_ads_creatives');
        
        if (savedCampaigns) {
            this.campaigns = JSON.parse(savedCampaigns);
        }
        if (savedCreatives) {
            this.creatives = JSON.parse(savedCreatives);
        }
    }

    saveData() {
        localStorage.setItem('fb_ads_campaigns', JSON.stringify(this.campaigns));
        localStorage.setItem('fb_ads_creatives', JSON.stringify(this.creatives));
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Add campaign buttons
        document.getElementById('addCampaignBtn').addEventListener('click', () => this.openAddCampaignModal());
        document.getElementById('addCampaignBtn2').addEventListener('click', () => this.openAddCampaignModal());
        document.getElementById('addFromUtmBtn').addEventListener('click', () => this.openAddCampaignModal('utm'));
        document.getElementById('uploadCsvBtn').addEventListener('click', () => this.openAddCampaignModal('csv'));
        document.getElementById('connectFbBtn').addEventListener('click', () => this.openAddCampaignModal('api'));

        // Modal controls
        document.getElementById('closeAddModal').addEventListener('click', () => this.closeModal('addCampaignModal'));
        document.getElementById('closeCreativeModal').addEventListener('click', () => this.closeModal('creativeModal'));

        // Modal tabs
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchModalTab(e.target.dataset.method));
        });

        // UTM processing
        document.getElementById('parseUtmBtn').addEventListener('click', () => this.parseUTM());
        document.getElementById('utmUrl').addEventListener('input', () => this.previewUTM());

        // CSV upload
        document.getElementById('csvFile').addEventListener('change', (e) => this.previewCSV(e.target.files[0]));
        document.getElementById('uploadCsvDataBtn').addEventListener('click', () => this.processCSV());

        // Facebook API
        document.getElementById('fetchFromApiBtn').addEventListener('click', () => this.fetchFromFacebookAPI());
        document.getElementById('saveFbTokenBtn').addEventListener('click', () => this.saveFacebookToken());

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // AI Tips
        document.getElementById('generateTipsBtn').addEventListener('click', () => this.generateAITips());

        // Period selector
        document.getElementById('periodSelector').addEventListener('change', () => this.updateDashboard());

        // Filters
        document.getElementById('campaignFilter').addEventListener('change', () => this.filterCreatives());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterCreatives());

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    // Theme Management
    setupTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.currentTheme);
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.setupTheme();
    }

    // Navigation
    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('nav-btn--active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('nav-btn--active');

        // Show tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('tab-content--active');
        });
        document.getElementById(tabName).classList.add('tab-content--active');

        // Update specific tab content
        switch(tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'campaigns':
                this.updateCampaignsList();
                break;
            case 'creatives':
                this.updateCreativesList();
                break;
            case 'ai-tips':
                this.updateAITips();
                break;
        }
    }

    // Modal Management
    openAddCampaignModal(method = 'utm') {
        const modal = document.getElementById('addCampaignModal');
        modal.classList.add('modal--active');
        this.switchModalTab(method);
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('modal--active');
        this.resetModalForms();
    }

    switchModalTab(method) {
        // Update tab buttons
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.classList.remove('modal-tab--active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('modal-tab--active');

        // Show method content
        document.querySelectorAll('.method-content').forEach(content => {
            content.classList.remove('method-content--active');
        });
        document.getElementById(`${method}Method`).classList.add('method-content--active');
    }

    resetModalForms() {
        document.getElementById('utmUrl').value = '';
        document.getElementById('csvFile').value = '';
        document.getElementById('accountId').value = '';
        document.getElementById('campaignId').value = '';
        document.getElementById('utmPreview').innerHTML = '';
        document.getElementById('csvPreview').innerHTML = '';
    }

    // UTM Processing
    previewUTM() {
        const utmUrl = document.getElementById('utmUrl').value.trim();
        const preview = document.getElementById('utmPreview');
        
        if (!utmUrl) {
            preview.innerHTML = '';
            return;
        }

        try {
            const url = new URL(utmUrl);
            const params = this.extractUTMParameters(url);
            
            if (Object.keys(params).length === 0) {
                preview.innerHTML = '<p style="color: var(--color-error);">UTM параметры не найдены в ссылке</p>';
                return;
            }

            let html = '<h4>Найденные параметры:</h4><div class="utm-params">';
            Object.entries(params).forEach(([key, value]) => {
                html += `<span class="param-label">${key}:</span><span class="param-value">${value}</span>`;
            });
            html += '</div>';
            preview.innerHTML = html;
        } catch (error) {
            preview.innerHTML = '<p style="color: var(--color-error);">Некорректная ссылка</p>';
        }
    }

    extractUTMParameters(url) {
        const params = {};
        const searchParams = url.searchParams;
        
        // Facebook dynamic parameters
        const fbParams = [
            'utm_campaign', 'utm_source', 'utm_placement',
            'campaign_id', 'adset_id', 'ad_id',
            'adset_name', 'ad_name'
        ];

        fbParams.forEach(param => {
            const value = searchParams.get(param);
            if (value && !value.includes('{{') && !value.includes('}}')) {
                params[param] = value;
            }
        });

        return params;
    }

    parseUTM() {
        const utmUrl = document.getElementById('utmUrl').value.trim();
        
        if (!utmUrl) {
            this.showToast('Введите UTM ссылку', 'error');
            return;
        }

        try {
            const url = new URL(utmUrl);
            const params = this.extractUTMParameters(url);
            
            if (Object.keys(params).length === 0) {
                this.showToast('UTM параметры не найдены', 'error');
                return;
            }

            // Create campaign from UTM data
            const campaign = this.createCampaignFromUTM(params);
            this.campaigns.push(campaign);
            
            // Create creative if ad data exists
            if (params.ad_id && params.ad_name) {
                const creative = this.createCreativeFromUTM(params, campaign.id);
                this.creatives.push(creative);
            }

            this.saveData();
            this.closeModal('addCampaignModal');
            this.showToast('Кампания успешно добавлена', 'success');
            this.updateUI();
        } catch (error) {
            this.showToast('Ошибка обработки UTM ссылки', 'error');
        }
    }

    createCampaignFromUTM(params) {
        return {
            id: params.campaign_id || this.generateId(),
            name: params.utm_campaign || 'Unnamed Campaign',
            source: params.utm_source || 'Facebook',
            status: 'active',
            dateAdded: new Date().toISOString(),
            metrics: {
                spend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
                cpm: 0,
                cpc: 0,
                ctr: 0,
                cpa: 0,
                roas: 0
            },
            adsets: params.adset_id ? [{
                id: params.adset_id,
                name: params.adset_name || 'Unnamed Adset'
            }] : []
        };
    }

    createCreativeFromUTM(params, campaignId) {
        return {
            id: params.ad_id,
            name: params.ad_name || 'Unnamed Creative',
            campaignId: campaignId,
            campaignName: params.utm_campaign || 'Unnamed Campaign',
            adsetId: params.adset_id,
            adsetName: params.adset_name || 'Unnamed Adset',
            status: 'active',
            dateCreated: new Date().toISOString(),
            metrics: {
                spend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
                cpm: 0,
                cpc: 0,
                ctr: 0,
                cpa: 0,
                roas: 0,
                frequency: 0,
                reach: 0
            },
            performance: {
                fatigueScore: 0,
                trending: 'stable'
            }
        };
    }

    // CSV Processing
    previewCSV(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            let html = '<h4>Предварительный просмотр CSV:</h4>';
            html += `<p>Найдено строк: ${lines.length - 1}</p>`;
            html += '<p>Заголовки: ' + headers.slice(0, 5).join(', ') + (headers.length > 5 ? '...' : '') + '</p>';
            
            document.getElementById('csvPreview').innerHTML = html;
        };
        reader.readAsText(file);
    }

    processCSV() {
        const fileInput = document.getElementById('csvFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('Выберите CSV файл', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const data = this.parseCSVData(csv);
                
                if (data.campaigns.length === 0) {
                    this.showToast('Данные кампаний не найдены в файле', 'error');
                    return;
                }

                // Add campaigns and creatives
                data.campaigns.forEach(campaign => {
                    const existingIndex = this.campaigns.findIndex(c => c.id === campaign.id);
                    if (existingIndex >= 0) {
                        this.campaigns[existingIndex] = campaign;
                    } else {
                        this.campaigns.push(campaign);
                    }
                });

                data.creatives.forEach(creative => {
                    const existingIndex = this.creatives.findIndex(c => c.id === creative.id);
                    if (existingIndex >= 0) {
                        this.creatives[existingIndex] = creative;
                    } else {
                        this.creatives.push(creative);
                    }
                });

                this.saveData();
                this.closeModal('addCampaignModal');
                this.showToast(`Добавлено ${data.campaigns.length} кампаний и ${data.creatives.length} креативов`, 'success');
                this.updateUI();
            } catch (error) {
                this.showToast('Ошибка обработки CSV файла', 'error');
            }
        };
        reader.readAsText(file);
    }

    parseCSVData(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const campaigns = [];
        const creatives = [];
        const campaignMap = new Map();

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            // Extract campaign data
            if (row['Campaign ID'] || row['Campaign Name']) {
                const campaignId = row['Campaign ID'] || this.generateId();
                
                if (!campaignMap.has(campaignId)) {
                    const campaign = {
                        id: campaignId,
                        name: row['Campaign Name'] || 'Unnamed Campaign',
                        source: 'Facebook',
                        status: row['Campaign Status'] || 'active',
                        dateAdded: new Date().toISOString(),
                        metrics: {
                            spend: parseFloat(row['Amount Spent']) || 0,
                            impressions: parseInt(row['Impressions']) || 0,
                            clicks: parseInt(row['Clicks']) || 0,
                            conversions: parseInt(row['Conversions']) || 0,
                            cpm: parseFloat(row['CPM']) || 0,
                            cpc: parseFloat(row['CPC']) || 0,
                            ctr: parseFloat(row['CTR']) || 0,
                            cpa: parseFloat(row['Cost per Action']) || 0,
                            roas: parseFloat(row['ROAS']) || 0
                        },
                        adsets: []
                    };
                    
                    campaignMap.set(campaignId, campaign);
                    campaigns.push(campaign);
                }

                // Extract creative data
                if (row['Ad ID'] || row['Ad Name']) {
                    const creative = {
                        id: row['Ad ID'] || this.generateId(),
                        name: row['Ad Name'] || 'Unnamed Creative',
                        campaignId: campaignId,
                        campaignName: row['Campaign Name'] || 'Unnamed Campaign',
                        adsetId: row['Ad Set ID'] || '',
                        adsetName: row['Ad Set Name'] || '',
                        status: row['Ad Status'] || 'active',
                        dateCreated: new Date().toISOString(),
                        metrics: {
                            spend: parseFloat(row['Amount Spent']) || 0,
                            impressions: parseInt(row['Impressions']) || 0,
                            clicks: parseInt(row['Clicks']) || 0,
                            conversions: parseInt(row['Conversions']) || 0,
                            cpm: parseFloat(row['CPM']) || 0,
                            cpc: parseFloat(row['CPC']) || 0,
                            ctr: parseFloat(row['CTR']) || 0,
                            cpa: parseFloat(row['Cost per Action']) || 0,
                            roas: parseFloat(row['ROAS']) || 0,
                            frequency: parseFloat(row['Frequency']) || 0,
                            reach: parseInt(row['Reach']) || 0
                        },
                        performance: {
                            fatigueScore: this.calculateFatigueScore({
                                ctr: parseFloat(row['CTR']) || 0,
                                frequency: parseFloat(row['Frequency']) || 0,
                                cpa: parseFloat(row['Cost per Action']) || 0,
                                roas: parseFloat(row['ROAS']) || 0
                            }),
                            trending: 'stable'
                        }
                    };
                    
                    creatives.push(creative);
                }
            }
        }

        return { campaigns, creatives };
    }

    // Facebook API Integration
    async fetchFromFacebookAPI() {
        const accountId = document.getElementById('accountId').value.trim();
        const campaignId = document.getElementById('campaignId').value.trim();
        const token = localStorage.getItem('fb_access_token');

        if (!accountId) {
            this.showToast('Введите Account ID', 'error');
            return;
        }

        if (!token) {
            this.showToast('Сначала сохраните Access Token в настройках', 'error');
            return;
        }

        try {
            this.showToast('Загрузка данных из Facebook API...', 'info');
            
            // Simulate API call (replace with real Facebook Graph API calls)
            const data = await this.mockFacebookAPICall(accountId, campaignId, token);
            
            if (data.campaigns.length === 0) {
                this.showToast('Кампании не найдены', 'warning');
                return;
            }

            // Add campaigns and creatives
            data.campaigns.forEach(campaign => {
                const existingIndex = this.campaigns.findIndex(c => c.id === campaign.id);
                if (existingIndex >= 0) {
                    this.campaigns[existingIndex] = campaign;
                } else {
                    this.campaigns.push(campaign);
                }
            });

            data.creatives.forEach(creative => {
                const existingIndex = this.creatives.findIndex(c => c.id === creative.id);
                if (existingIndex >= 0) {
                    this.creatives[existingIndex] = creative;
                } else {
                    this.creatives.push(creative);
                }
            });

            this.saveData();
            this.closeModal('addCampaignModal');
            this.showToast(`Загружено ${data.campaigns.length} кампаний из Facebook API`, 'success');
            this.updateUI();
        } catch (error) {
            this.showToast('Ошибка подключения к Facebook API', 'error');
        }
    }

    async mockFacebookAPICall(accountId, campaignId, token) {
        // This would be replaced with real Facebook Graph API calls
        // For demo purposes, returning empty data
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    campaigns: [],
                    creatives: []
                });
            }, 1500);
        });
    }

    saveFacebookToken() {
        const token = document.getElementById('fbAccessToken').value.trim();
        if (token) {
            localStorage.setItem('fb_access_token', token);
            this.showToast('Facebook Access Token сохранен', 'success');
        } else {
            this.showToast('Введите действительный токен', 'error');
        }
    }

    // UI Updates
    updateUI() {
        const hasData = this.campaigns.length > 0;
        
        // Show/hide empty state
        document.getElementById('emptyState').classList.toggle('hidden', hasData);
        document.getElementById('dashboardContent').classList.toggle('hidden', !hasData);
        
        if (hasData) {
            this.updateDashboard();
            this.updateCampaignsList();
            this.updateCreativesList();
            this.updateCampaignFilter();
        }
    }

    updateDashboard() {
        if (this.campaigns.length === 0) return;

        const metrics = this.calculateOverallMetrics();
        
        // Update metric cards
        document.getElementById('totalSpend').textContent = this.formatCurrency(metrics.totalSpend);
        document.getElementById('avgCpm').textContent = this.formatCurrency(metrics.avgCpm);
        document.getElementById('avgCpc').textContent = this.formatCurrency(metrics.avgCpc);
        document.getElementById('avgCtr').textContent = this.formatPercentage(metrics.avgCtr);
        document.getElementById('avgRoas').textContent = metrics.avgRoas.toFixed(2);
        document.getElementById('totalConversions').textContent = metrics.totalConversions;

        // Update charts
        this.updateCharts();
    }

    calculateOverallMetrics() {
        const totals = this.campaigns.reduce((acc, campaign) => {
            acc.spend += campaign.metrics.spend;
            acc.impressions += campaign.metrics.impressions;
            acc.clicks += campaign.metrics.clicks;
            acc.conversions += campaign.metrics.conversions;
            acc.cpmSum += campaign.metrics.cpm;
            acc.cpcSum += campaign.metrics.cpc;
            acc.ctrSum += campaign.metrics.ctr;
            acc.roasSum += campaign.metrics.roas;
            return acc;
        }, {
            spend: 0, impressions: 0, clicks: 0, conversions: 0,
            cpmSum: 0, cpcSum: 0, ctrSum: 0, roasSum: 0
        });

        const campaignCount = this.campaigns.length;
        
        return {
            totalSpend: totals.spend,
            avgCpm: totals.cpmSum / campaignCount,
            avgCpc: totals.cpcSum / campaignCount,
            avgCtr: totals.ctrSum / campaignCount,
            avgRoas: totals.roasSum / campaignCount,
            totalConversions: totals.conversions
        };
    }

    updateCharts() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        // Create spend chart
        const spendCtx = document.getElementById('spendChart').getContext('2d');
        this.charts.spend = new Chart(spendCtx, {
            type: 'line',
            data: {
                labels: this.campaigns.map(c => c.name),
                datasets: [{
                    label: 'Расходы ($)',
                    data: this.campaigns.map(c => c.metrics.spend),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Create campaign performance chart
        const campaignCtx = document.getElementById('campaignChart').getContext('2d');
        this.charts.campaign = new Chart(campaignCtx, {
            type: 'bar',
            data: {
                labels: this.campaigns.map(c => c.name),
                datasets: [{
                    label: 'ROAS',
                    data: this.campaigns.map(c => c.metrics.roas),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateCampaignsList() {
        const container = document.getElementById('campaignsList');
        
        if (this.campaigns.length === 0) {
            container.innerHTML = '<div class="empty-campaigns"><p>Кампании не найдены. Добавьте первую кампанию для начала анализа.</p></div>';
            return;
        }

        const html = this.campaigns.map(campaign => `
            <div class="campaign-card">
                <div class="campaign-header">
                    <div>
                        <h3 class="campaign-title">${campaign.name}</h3>
                        <p class="campaign-id">ID: ${campaign.id}</p>
                    </div>
                    <div class="campaign-actions">
                        <button class="btn btn--sm btn--outline" onclick="app.editCampaign('${campaign.id}')">Редактировать</button>
                        <button class="btn btn--sm btn--danger" onclick="app.deleteCampaign('${campaign.id}')">Удалить</button>
                    </div>
                </div>
                <div class="campaign-metrics">
                    <div class="campaign-metric">
                        <div class="campaign-metric-label">Потрачено</div>
                        <div class="campaign-metric-value">${this.formatCurrency(campaign.metrics.spend)}</div>
                    </div>
                    <div class="campaign-metric">
                        <div class="campaign-metric-label">CPM</div>
                        <div class="campaign-metric-value">${this.formatCurrency(campaign.metrics.cpm)}</div>
                    </div>
                    <div class="campaign-metric">
                        <div class="campaign-metric-label">CPC</div>
                        <div class="campaign-metric-value">${this.formatCurrency(campaign.metrics.cpc)}</div>
                    </div>
                    <div class="campaign-metric">
                        <div class="campaign-metric-label">CTR</div>
                        <div class="campaign-metric-value">${this.formatPercentage(campaign.metrics.ctr)}</div>
                    </div>
                    <div class="campaign-metric">
                        <div class="campaign-metric-label">ROAS</div>
                        <div class="campaign-metric-value">${campaign.metrics.roas.toFixed(2)}</div>
                    </div>
                    <div class="campaign-metric">
                        <div class="campaign-metric-label">Конверсии</div>
                        <div class="campaign-metric-value">${campaign.metrics.conversions}</div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateCreativesList() {
        const container = document.getElementById('creativesGrid');
        
        if (this.creatives.length === 0) {
            container.innerHTML = '<div class="empty-creatives"><p>Креативы не найдены. Добавьте кампании для анализа креативов.</p></div>';
            return;
        }

        let filteredCreatives = [...this.creatives];
        
        // Apply filters
        const campaignFilter = document.getElementById('campaignFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        if (campaignFilter) {
            filteredCreatives = filteredCreatives.filter(c => c.campaignId === campaignFilter);
        }
        
        if (statusFilter) {
            if (statusFilter === 'fatigue') {
                filteredCreatives = filteredCreatives.filter(c => c.performance.fatigueScore > 70);
            } else {
                filteredCreatives = filteredCreatives.filter(c => c.status === statusFilter);
            }
        }

        const html = filteredCreatives.map(creative => `
            <div class="creative-card" onclick="app.openCreativeDetail('${creative.id}')">
                <div class="creative-preview">
                    <span>Предварительный просмотр креатива</span>
                </div>
                <div class="creative-content">
                    <h4 class="creative-name">${creative.name}</h4>
                    <p class="creative-campaign">${creative.campaignName}</p>
                    <div class="creative-metrics">
                        <div class="creative-metric">
                            <div class="creative-metric-label">CTR</div>
                            <div class="creative-metric-value">${this.formatPercentage(creative.metrics.ctr)}</div>
                        </div>
                        <div class="creative-metric">
                            <div class="creative-metric-label">CPC</div>
                            <div class="creative-metric-value">${this.formatCurrency(creative.metrics.cpc)}</div>
                        </div>
                        <div class="creative-metric">
                            <div class="creative-metric-label">ROAS</div>
                            <div class="creative-metric-value">${creative.metrics.roas.toFixed(2)}</div>
                        </div>
                        <div class="creative-metric">
                            <div class="creative-metric-label">Частота</div>
                            <div class="creative-metric-value">${creative.metrics.frequency.toFixed(1)}</div>
                        </div>
                    </div>
                    <div class="creative-status">
                        <span class="status ${this.getCreativeStatusClass(creative)}">${this.getCreativeStatusText(creative)}</span>
                        <span class="creative-fatigue">Усталость: ${creative.performance.fatigueScore}%</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateCampaignFilter() {
        const select = document.getElementById('campaignFilter');
        const options = '<option value="">Все кампании</option>' + 
            this.campaigns.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        select.innerHTML = options;
    }

    // Creative Detail Modal
    openCreativeDetail(creativeId) {
        const creative = this.creatives.find(c => c.id === creativeId);
        if (!creative) return;

        const modal = document.getElementById('creativeModal');
        const title = document.getElementById('creativeModalTitle');
        const body = document.getElementById('creativeModalBody');

        title.textContent = `Анализ креатива: ${creative.name}`;
        
        const recommendations = this.generateCreativeRecommendations(creative);
        
        body.innerHTML = `
            <div class="creative-detail-content">
                <div class="creative-detail-header">
                    <h4>Основная информация</h4>
                    <p><strong>Кампания:</strong> ${creative.campaignName}</p>
                    <p><strong>Группа объявлений:</strong> ${creative.adsetName}</p>
                    <p><strong>Статус:</strong> <span class="status ${this.getCreativeStatusClass(creative)}">${this.getCreativeStatusText(creative)}</span></p>
                </div>
                
                <div class="creative-detail-metrics">
                    <h4>Детальная аналитика</h4>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <h5>Потрачено</h5>
                            <div class="metric-value">${this.formatCurrency(creative.metrics.spend)}</div>
                        </div>
                        <div class="metric-card">
                            <h5>Показы</h5>
                            <div class="metric-value">${creative.metrics.impressions.toLocaleString()}</div>
                        </div>
                        <div class="metric-card">
                            <h5>Клики</h5>
                            <div class="metric-value">${creative.metrics.clicks.toLocaleString()}</div>
                        </div>
                        <div class="metric-card">
                            <h5>Конверсии</h5>
                            <div class="metric-value">${creative.metrics.conversions}</div>
                        </div>
                        <div class="metric-card">
                            <h5>CPM</h5>
                            <div class="metric-value">${this.formatCurrency(creative.metrics.cpm)}</div>
                        </div>
                        <div class="metric-card">
                            <h5>CPC</h5>
                            <div class="metric-value">${this.formatCurrency(creative.metrics.cpc)}</div>
                        </div>
                        <div class="metric-card">
                            <h5>CTR</h5>
                            <div class="metric-value">${this.formatPercentage(creative.metrics.ctr)}</div>
                        </div>
                        <div class="metric-card">
                            <h5>CPA</h5>
                            <div class="metric-value">${this.formatCurrency(creative.metrics.cpa)}</div>
                        </div>
                        <div class="metric-card">
                            <h5>ROAS</h5>
                            <div class="metric-value">${creative.metrics.roas.toFixed(2)}</div>
                        </div>
                        <div class="metric-card">
                            <h5>Частота</h5>
                            <div class="metric-value">${creative.metrics.frequency.toFixed(2)}</div>
                        </div>
                        <div class="metric-card">
                            <h5>Охват</h5>
                            <div class="metric-value">${creative.metrics.reach.toLocaleString()}</div>
                        </div>
                        <div class="metric-card">
                            <h5>Усталость</h5>
                            <div class="metric-value">${creative.performance.fatigueScore}%</div>
                        </div>
                    </div>
                </div>
                
                <div class="creative-detail-recommendations">
                    <h4>AI Рекомендации по оптимизации</h4>
                    <div class="recommendations-list">
                        ${recommendations.map(rec => `
                            <div class="recommendation-item">
                                <div class="recommendation-priority ${rec.priority}">${rec.priority.toUpperCase()}</div>
                                <div class="recommendation-text">${rec.text}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="creative-detail-actions">
                    <button class="btn btn--primary" onclick="app.optimizeCreative('${creative.id}')">Применить оптимизацию</button>
                    <button class="btn btn--outline" onclick="app.pauseCreative('${creative.id}')">Приостановить</button>
                    <button class="btn btn--secondary" onclick="app.duplicateCreative('${creative.id}')">Дублировать</button>
                </div>
            </div>
        `;

        modal.classList.add('modal--active');
    }

    generateCreativeRecommendations(creative) {
        const recommendations = [];
        
        // CTR analysis
        if (creative.metrics.ctr < this.benchmarks.ctr_range[0]) {
            recommendations.push({
                priority: 'high',
                text: 'CTR ниже среднего. Рекомендуется обновить креатив или протестировать новые заголовки и изображения.'
            });
        }
        
        // Frequency analysis
        if (creative.metrics.frequency > this.benchmarks.frequency_threshold) {
            recommendations.push({
                priority: 'high',
                text: 'Высокая частота показов может привести к усталости аудитории. Создайте новые креативы или расширьте аудиторию.'
            });
        }
        
        // ROAS analysis
        if (creative.metrics.roas < this.benchmarks.roas_median) {
            recommendations.push({
                priority: 'medium',
                text: 'ROAS ниже медианного значения. Оптимизируйте целевую страницу или измените стратегию ставок.'
            });
        }
        
        // CPC analysis
        if (creative.metrics.cpc > this.benchmarks.cpc_range[1]) {
            recommendations.push({
                priority: 'medium',
                text: 'Высокая цена за клик. Попробуйте оптимизировать релевантность объявления или таргетинг аудитории.'
            });
        }
        
        // Fatigue score analysis
        if (creative.performance.fatigueScore > 70) {
            recommendations.push({
                priority: 'high',
                text: 'Креатив показывает признаки усталости. Немедленно создайте новые варианты или приостановите показы.'
            });
        }
        
        // Default recommendations if performance is good
        if (recommendations.length === 0) {
            recommendations.push({
                priority: 'low',
                text: 'Креатив показывает хорошие результаты. Продолжайте мониторинг и рассмотрите возможность масштабирования.'
            });
        }
        
        return recommendations;
    }

    // AI Tips
    updateAITips() {
        const container = document.getElementById('aiTipsContent');
        
        if (this.campaigns.length === 0) {
            container.innerHTML = '<div class="empty-tips"><p>Добавьте кампании для получения персонализированных AI рекомендаций.</p></div>';
            return;
        }

        this.generateAITips();
    }

    generateAITips() {
        const container = document.getElementById('aiTipsContent');
        
        const campaignTips = this.generateCampaignTips();
        const creativeTips = this.generateCreativeTips();
        
        container.innerHTML = `
            <div class="tip-category">
                <h3>🎯 Оптимизация кампаний</h3>
                <ul class="tip-list">
                    ${campaignTips.map(tip => `
                        <li class="tip-item">
                            <div class="tip-icon">💡</div>
                            <div class="tip-text">${tip}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="tip-category">
                <h3>🎨 Оптимизация креативов</h3>
                <ul class="tip-list">
                    ${creativeTips.map(tip => `
                        <li class="tip-item">
                            <div class="tip-icon">🎨</div>
                            <div class="tip-text">${tip}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    generateCampaignTips() {
        const tips = [];
        
        // High performing campaigns
        const highROAS = this.campaigns.filter(c => c.metrics.roas > this.benchmarks.roas_sales);
        if (highROAS.length > 0) {
            tips.push(`Увеличьте бюджет на кампании с высоким ROAS: ${highROAS.map(c => c.name).join(', ')}`);
        }
        
        // Low performing campaigns
        const lowROAS = this.campaigns.filter(c => c.metrics.roas < this.benchmarks.roas_median);
        if (lowROAS.length > 0) {
            tips.push(`Оптимизируйте или приостановите кампании с низким ROAS: ${lowROAS.map(c => c.name).join(', ')}`);
        }
        
        // General recommendations
        tips.push('Создайте lookalike аудитории на основе лучших конвертеров');
        tips.push('Настройте автоматические правила для управления бюджетом');
        tips.push('Протестируйте различные плейсменты (Stories, Reels, Feed)');
        
        return tips;
    }

    generateCreativeTips() {
        const tips = [];
        
        // Fatigued creatives
        const fatigued = this.creatives.filter(c => c.performance.fatigueScore > 70);
        if (fatigued.length > 0) {
            tips.push(`Обновите усталые креативы: ${fatigued.map(c => c.name).join(', ')}`);
        }
        
        // Low CTR creatives
        const lowCTR = this.creatives.filter(c => c.metrics.ctr < this.benchmarks.ctr_range[0]);
        if (lowCTR.length > 0) {
            tips.push(`Оптимизируйте креативы с низким CTR: ${lowCTR.map(c => c.name).join(', ')}`);
        }
        
        // General recommendations
        tips.push('Протестируйте видео-креативы - они показывают на 30% лучший CTR');
        tips.push('Используйте UGC (User Generated Content) для повышения доверия');
        tips.push('A/B тестируйте различные CTA кнопки');
        tips.push('Создавайте креативы в соотношении 9:16 для Stories и Reels');
        
        return tips;
    }

    // Campaign Management
    deleteCampaign(campaignId) {
        if (confirm('Вы уверены, что хотите удалить эту кампанию?')) {
            this.campaigns = this.campaigns.filter(c => c.id !== campaignId);
            this.creatives = this.creatives.filter(c => c.campaignId !== campaignId);
            this.saveData();
            this.showToast('Кампания удалена', 'success');
            this.updateUI();
        }
    }

    editCampaign(campaignId) {
        // Implement campaign editing functionality
        this.showToast('Функция редактирования будет доступна в следующем обновлении', 'info');
    }

    // Creative Management
    optimizeCreative(creativeId) {
        this.showToast('Оптимизация креатива запущена', 'success');
    }

    pauseCreative(creativeId) {
        const creative = this.creatives.find(c => c.id === creativeId);
        if (creative) {
            creative.status = 'paused';
            this.saveData();
            this.showToast('Креатив приостановлен', 'success');
            this.updateCreativesList();
        }
    }

    duplicateCreative(creativeId) {
        const creative = this.creatives.find(c => c.id === creativeId);
        if (creative) {
            const duplicate = {
                ...creative,
                id: this.generateId(),
                name: creative.name + ' (копия)',
                dateCreated: new Date().toISOString()
            };
            this.creatives.push(duplicate);
            this.saveData();
            this.showToast('Креатив продублирован', 'success');
            this.updateCreativesList();
        }
    }

    // Filtering
    filterCreatives() {
        this.updateCreativesList();
    }

    // Export
    exportData() {
        const data = {
            campaigns: this.campaigns,
            creatives: this.creatives,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fb_ads_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Данные экспортированы', 'success');
    }

    // Utility Functions
    calculateFatigueScore(metrics) {
        let score = 0;
        
        // CTR factor
        if (metrics.ctr < this.benchmarks.ctr_range[0]) score += 30;
        else if (metrics.ctr < this.benchmarks.ctr_range[1]) score += 10;
        
        // Frequency factor
        if (metrics.frequency > this.benchmarks.frequency_threshold) score += 40;
        else if (metrics.frequency > 2.0) score += 20;
        
        // CPA factor
        if (metrics.cpa > this.benchmarks.cpa_range[1]) score += 20;
        
        // ROAS factor
        if (metrics.roas < this.benchmarks.roas_median) score += 10;
        
        return Math.min(score, 100);
    }

    getCreativeStatusClass(creative) {
        if (creative.performance.fatigueScore > 70) return 'status--error';
        if (creative.performance.fatigueScore > 40) return 'status--warning';
        if (creative.status === 'paused') return 'status--info';
        return 'status--success';
    }

    getCreativeStatusText(creative) {
        if (creative.performance.fatigueScore > 70) return 'Усталость';
        if (creative.performance.fatigueScore > 40) return 'Внимание';
        if (creative.status === 'paused') return 'Приостановлен';
        return 'Активный';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatPercentage(value) {
        return (value).toFixed(2) + '%';
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const messageEl = document.getElementById('toastMessage');
        
        messageEl.textContent = message;
        toast.className = `toast toast--${type} toast--show`;
        
        setTimeout(() => {
            toast.classList.remove('toast--show');
        }, 3000);
        
        document.getElementById('toastClose').onclick = () => {
            toast.classList.remove('toast--show');
        };
    }
}

// Initialize the application
const app = new FacebookAdsAnalytics();