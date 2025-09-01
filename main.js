const cryptoData = {
  'USDT': {
    name: 'Tether',
    symbol: 'USDT',
    icon: 'https://s2.blofin.com/static/currency/icon/usdt.png',
    balance: '0.00',
    networks: []
  },
  'BTC': {
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: 'https://s2.blofin.com/static/currency/icon/BTC-y1Z7we69.png',
    balance: '0.00',
    networks: []
  },
  'ETH': {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'https://s2.blofin.com/static/currency/icon/ETH-m5h6bj18.png',
    balance: '0.00',
    networks: []
  }
};




function showEmptyTableState() {
  const depositsTableBody = document.getElementById('deposits-table-body');
  const withdrawalsTableBody = document.getElementById('withdrawals-table-body');
  
  if (depositsTableBody) {
    depositsTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="py-8 text-center text-gray-500">
          <div class="flex flex-col items-center gap-2">
            <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span class="text-lg font-medium">Нет транзакций</span>
            <span class="text-sm">Транзакции появятся здесь после выполнения операций</span>
              </div>
            </td>
          </tr>
        `;
  }

  if (withdrawalsTableBody) {
    withdrawalsTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="py-8 text-center text-gray-500">
          <div class="flex flex-col items-center gap-2">
            <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span class="text-lg font-medium">Нет транзакций</span>
            <span class="text-sm">Транзакции появятся здесь после выполнения операций</span>
              </div>
            </td>
          </tr>
        `;
  }
}


class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || '/api';
    this.defaultTimeoutMs = 8000;
  }
  async fetchJson(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || this.defaultTimeoutMs);
    try {
      const res = await fetch(this.baseUrl + path, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
        ...options
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}


class DataProvider {
  constructor(apiClient, staticData) {
    this.apiClient = apiClient;
    this.staticData = staticData || {};
    this.cryptoMap = {};
    this.isLoaded = false;
  }

  async loadCryptos() {
    try {
      const list = await this.apiClient.fetchJson('/cryptos');
      this.cryptoMap = Array.isArray(list)
        ? list.reduce((acc, item) => {
            acc[item.symbol] = item;
            return acc;
          }, {})
        : {};
      if (Object.keys(this.cryptoMap).length === 0) {
        this.cryptoMap = { ...this.staticData };
      }
    } catch (_e) {
      this.cryptoMap = { ...this.staticData };
    }
    this.isLoaded = true;
    return this.cryptoMap;
  }

  getAllCryptoMap() {
    return this.cryptoMap;
  }

  getCrypto(symbol) {
    return this.cryptoMap[symbol] || null;
  }

  getSymbols() {
    return Object.keys(this.cryptoMap);
  }
}

class WalletApiService {
  constructor(baseUrl = 'https://apiexchange.ymca.one') {
    this.baseUrl = baseUrl;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const { method = 'POST', headers = {}, body, ...rest } = options;
    const finalOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include',
      ...rest
    };

    if (body && method !== 'GET') {
      finalOptions.body = JSON.stringify(body);
    }


    try {
      const response = await fetch(url, finalOptions);
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`Ответ не JSON: ${text}`);
      }

      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.msg || 'Unknown error'}`);
      }
      if (data.status === 'err') {
        throw new Error(data.msg || 'API error');
      }
      

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getBalances() {
    return this.makeRequest('/api/wallet/getBalances', {
      method: 'POST',
      body: {}
    });
  }

  async getCurrencyNetworks(currency) {
    return this.makeRequest('/api/wallet/getCurrencyNetworks', {
      method: 'POST',
      body: { currency }
    });
  }

  async getWalletInfo(currency) {
    return this.makeRequest('/api/wallet/get', {
      method: 'POST',
      body: { currency }
    });
  }

  async withdraw(currency, amount, to) {
    return this.makeRequest('/api/wallet/withdraw', {
      method: 'POST',
      body: { currency, amount, to }
    });
  }

  async getTransactions() {
    return this.makeRequest('/api/wallet/transactions', {
      method: 'GET',
      body: undefined 
    });
  }
}



class FormManager {
  constructor() {
    this.selects = new Map();
    const baseUrl =
      (window.APP_CONFIG && window.APP_CONFIG.apiBase) || window.API_BASE || '/api';
    this.apiClient = new ApiClient(baseUrl);
    this.walletApi = new WalletApiService();
    this.dataProvider = new DataProvider(this.apiClient, cryptoData);
    this.cryptoData = {};
    this.filteredCryptos = [];
    this.withdrawFilteredCryptos = [];
    this.depositState = {
      selectedCrypto: null,
      selectedNetwork: null,
      recentCryptos: []
    };
    this.withdrawState = {
      selectedCrypto: null,
      selectedNetwork: null,
      recentCryptos: []
    };
    this.refreshTransactions();

    this.depositState.recentCryptos = this.getRecentCryptos('deposit');
    this.withdrawState.recentCryptos = this.getRecentCryptos('withdraw');
  }

  async init() {
    
    this.cryptoData = { ...cryptoData };
    
    await this.loadBalancesFromApi();
    
    this.filteredCryptos = Object.keys(this.cryptoData);
    this.withdrawFilteredCryptos = Object.keys(this.cryptoData);
    
    this.initDepositForm();
    this.initWithdrawForm();
    document.addEventListener('click', this.closeAllSelects.bind(this));
    
  }

  async loadBalancesFromApi() {
    try {
      const balancesData = await this.walletApi.getBalances();
      
      if (balancesData.status === 'success' && balancesData.balances) {
        Object.keys(balancesData.balances).forEach(currency => {
          if (this.cryptoData[currency]) {
            this.cryptoData[currency].balance = balancesData.balances[currency];
          }
        });
        
        Object.keys(balancesData.balances).forEach(currency => {
          if (!this.cryptoData[currency]) {
            this.cryptoData[currency] = {
              name: currency,
              symbol: currency,
              icon: `https://s2.blofin.com/static/currency/icon/${currency.toLowerCase()}.png`,
              balance: balancesData.balances[currency],
              networks: []
            };
          }
        });
        
      } else {
      }
    } catch (error) {
    }
  }

  async refreshData() {
    await this.loadBalancesFromApi();
    this.filteredCryptos = Object.keys(this.cryptoData);
    this.withdrawFilteredCryptos = Object.keys(this.cryptoData);
    this.renderCryptoOptions('crypto-options', 'deposit');
    this.renderCryptoOptions('withdraw-crypto-options', 'withdraw');

    if (this.depositState.selectedCrypto && !this.cryptoData[this.depositState.selectedCrypto]) {
      this.depositState.selectedCrypto = null;
      const cs = this.selects.get('crypto-select');
      if (cs) cs.input.value = '';
      this.hideStepContent(2);
      this.hideStepContent(3);
      this.updateStepStatus(1, true);
      this.updateStepStatus(2, false);
      this.updateStepStatus(3, false);
    }
    if (this.withdrawState.selectedCrypto && !this.cryptoData[this.withdrawState.selectedCrypto]) {
      this.withdrawState.selectedCrypto = null;
      const cs = this.selects.get('withdraw-crypto-select');
      if (cs) cs.input.value = '';
      this.hideWithdrawStepContent(2);
      this.hideWithdrawStepContent(3);
      this.updateWithdrawStepStatus(1, true);
      this.updateWithdrawStepStatus(2, false);
      this.updateWithdrawStepStatus(3, false);
    }
  }

  initDepositForm() {
    const cryptoInput = document.querySelector('[data-select="crypto-select"]');
    const networkInput = document.querySelector('[data-select="network-select"]');
    if (cryptoInput) {
      const dropdown = document.querySelector('[data-dropdown="crypto-select"]');
      this.selects.set('crypto-select', {
        input: cryptoInput,
        dropdown,
        isOpen: false
      });
      this.bindCryptoEvents('crypto-select', 'deposit');
    }
    if (networkInput) {
      const dropdown = document.querySelector('[data-dropdown="network-select"]');
      this.selects.set('network-select', {
        input: networkInput,
        dropdown,
        isOpen: false
      });
      this.bindNetworkEvents('network-select', 'deposit');
    }
    this.loadCryptoOptions('crypto-options', 'deposit');
    this.bindCopyButton();
    this.displayRecentCryptos('deposit');
    this.updateStepStatus(1, true);
    this.updateStepStatus(2, false);
    this.updateStepStatus(3, false);
  }

  initWithdrawForm() {
    const cryptoInput = document.querySelector('[data-select="withdraw-crypto-select"]');
    const networkInput = document.querySelector('[data-select="withdraw-network-select"]');
    if (cryptoInput) {
      const dropdown = document.querySelector('[data-dropdown="withdraw-crypto-select"]');
      this.selects.set('withdraw-crypto-select', {
        input: cryptoInput,
        dropdown,
        isOpen: false
      });
      this.bindCryptoEvents('withdraw-crypto-select', 'withdraw');
    }
    if (networkInput) {
      const dropdown = document.querySelector('[data-dropdown="withdraw-network-select"]');
      this.selects.set('withdraw-network-select', {
        input: networkInput,
        dropdown,
        isOpen: false
      });
      this.bindNetworkEvents('withdraw-network-select', 'withdraw');
    }
    this.loadCryptoOptions('withdraw-crypto-options', 'withdraw');
    this.bindWithdrawEvents();
    this.displayRecentCryptos('withdraw');
    this.updateWithdrawStepStatus(1, true);
    this.updateWithdrawStepStatus(2, false);
    this.updateWithdrawStepStatus(3, false);
  }

  bindWithdrawEvents() {
    const amountInput = document.getElementById('withdraw-amount');
    const maxBtn = document.getElementById('max-amount-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');
    
    if (amountInput) {
      amountInput.addEventListener('input', () => {
        this.updateReceiveAmount();
      });
    }
    
    if (maxBtn) {
      maxBtn.addEventListener('click', () => {
        if (this.withdrawState.selectedCrypto) {
          const crypto = this.cryptoData[this.withdrawState.selectedCrypto];
          amountInput.value = crypto.balance;
          this.updateReceiveAmount();
        }
      });
    }

    if (withdrawBtn) {
      withdrawBtn.addEventListener('click', async () => {
        await this.processWithdraw();
      });
    }
  }

  async processWithdraw() {
    const amountInput = document.getElementById('withdraw-amount');
    const addressInput = document.getElementById('withdraw-address');
    
    if (!this.withdrawState.selectedCrypto || !this.withdrawState.selectedNetwork) {
      return;
    }
    
    const amount = parseFloat(amountInput.value);
    const address = addressInput.value.trim();
    
    if (!amount || amount <= 0) {
      return;
    }
    
    if (!address) {
      return;
    }
    
    try {
      const withdrawBtn = document.getElementById('withdraw-btn');
      const originalText = withdrawBtn.innerHTML;
      withdrawBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';
      withdrawBtn.disabled = true;
      
      const result = await this.walletApi.withdraw(
        this.withdrawState.selectedCrypto,
        amount,
        address
      );
      
      if (result.status === 'success') {
        this.showSuccess('Заявка на вывод отправлена успешно');
        
        amountInput.value = '';
        addressInput.value = '';
        this.withdrawState.selectedCrypto = null;
        this.withdrawState.selectedNetwork = null;
        
        await this.refreshTransactions();
        
        this.resetWithdrawForm();
      } else {
      }
    } catch (error) {
    } finally {
      const withdrawBtn = document.getElementById('withdraw-btn');
      withdrawBtn.innerHTML = originalText;
      withdrawBtn.disabled = false;
    }
  }

  resetWithdrawForm() {
    const cryptoSelect = this.selects.get('withdraw-crypto-select');
    const networkSelect = this.selects.get('withdraw-network-select');
    
    if (cryptoSelect) {
      cryptoSelect.input.value = '';
    }
    if (networkSelect) {
      networkSelect.input.value = '';
    }
    
    this.hideWithdrawStepContent(2);
    this.hideWithdrawStepContent(3);
    this.updateWithdrawStepStatus(1, true);
    this.updateWithdrawStepStatus(2, false);
    this.updateWithdrawStepStatus(3, false);
  }

  showError(message) {
    const existingError = document.querySelector('.fixed.top-4.right-4.bg-red-600');
    if (existingError) {
      return;
    }
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  showSuccess(message) {
    const existingSuccess = document.querySelector('.fixed.top-4.right-4.bg-green-600');
    if (existingSuccess) {
      return;
    }
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  updateReceiveAmount() {
    if (!this.withdrawState.selectedNetwork) return;
    const amountInput = document.getElementById('withdraw-amount');
    const receiveAmountSpan = document.getElementById('receive-amount');
    const amount = parseFloat(amountInput.value) || 0;
    const feeText = this.withdrawState.selectedNetwork.networkFee;
    const feeAmount = parseFloat(feeText.split(' ')[0]) || 0;
    const receiveAmount = Math.max(0, amount - feeAmount);
    receiveAmountSpan.textContent = `${receiveAmount.toFixed(6)} ${this.withdrawState.selectedCrypto}`;
  }

  bindCryptoEvents(selectId, formType) {
    const select = this.selects.get(selectId);
    if (!select) return;
    select.input.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (select.input.value.includes(' - ')) {
        select.input.value = '';
        if (formType === 'deposit') {
          this.filteredCryptos = Object.keys(this.cryptoData);
          this.renderCryptoOptions('crypto-options', 'deposit');
        } else {
          this.withdrawFilteredCryptos = Object.keys(this.cryptoData);
          this.renderCryptoOptions('withdraw-crypto-options', 'withdraw');
        }
        this.resetAfterCryptoCleared(formType);
      }
      this.toggleSelect(selectId);
    });
    select.input.addEventListener('input', (e) => {
      const value = e.target.value;
      if (value.includes(' - ')) {
        return;
      }
      if (!value.trim()) {
        const hasSelection =
          formType === 'deposit'
            ? this.depositState.selectedCrypto || this.depositState.selectedNetwork
            : this.withdrawState.selectedCrypto || this.withdrawState.selectedNetwork;
        if (hasSelection) {
          this.resetAfterCryptoCleared(formType);
        }
      }
      this.filterCryptos(value, formType);
      if (!select.isOpen && value.trim()) {
        this.openSelect(selectId);
      }
    });
  }


  clearNetworkSelection(formType) {
    const state = formType === 'deposit' ? this.depositState : this.withdrawState;
    state.selectedNetwork = null;
    if (formType === 'deposit') {
      this.updateStepStatus(2, false);
      this.updateStepStatus(3, false);
      this.hideStepContent(2);
      this.hideStepContent(3);
    } else {
      this.updateWithdrawStepStatus(2, false);
      this.updateWithdrawStepStatus(3, false);
      this.hideWithdrawStepContent(2);
      this.hideWithdrawStepContent(3);
    }
  }

  bindNetworkEvents(selectId, formType) {
    const select = this.selects.get(selectId);
    if (!select) return;
    select.input.addEventListener('click', (e) => {
      e.stopPropagation();
      const state = formType === 'deposit' ? this.depositState : this.withdrawState;
      if (state.selectedCrypto) {
        this.toggleSelect(selectId);
      }
    });


    select.input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      if (!value) {
        this.clearNetworkSelection(formType);
      }
    });
  }

  bindCopyButton() {
    const copyBtn = document.getElementById('copy-address-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const addressInput = document.getElementById('deposit-address');
        if (addressInput && addressInput.value) {
          const textToCopy = addressInput.value;
          const showSuccess = () => {
            copyBtn.classList.add('copy-success');
            copyBtn.innerHTML = `
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Copied!
            `;
            setTimeout(() => {
              copyBtn.classList.remove('copy-success');
              copyBtn.innerHTML = `
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
                Copy
              `;
            }, 2000);
          };
          try {
            if (navigator.clipboard && window.isSecureContext) {
              await navigator.clipboard.writeText(textToCopy);
              showSuccess();
              return;
            }
          } catch (_err) {}
          try {
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (successful) {
              showSuccess();
              return;
            }
          } catch (_e) {}
        }
      });
    }
  }

  async loadCryptoOptions(containerId, formType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    this.renderCryptoOptions(containerId, formType);
  }

  renderCryptoOptions(containerId, formType) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    container.innerHTML = '';
    const cryptos = formType === 'deposit' ? this.filteredCryptos : this.withdrawFilteredCryptos;
    const state = formType === 'deposit' ? this.depositState : this.withdrawState;
    if (state.recentCryptos.length > 0) {
      const recentSection = document.createElement('div');
      recentSection.className = 'px-3 py-2';
      recentSection.innerHTML = `<div class=" text-xs text-white tracking-wide">Recent</div>`;
      container.appendChild(recentSection);
      const recentRow = document.createElement('div');
      recentRow.className = 'flex gap-1 px-3 py-2 flex-wrap';
      state.recentCryptos.forEach(symbol => {
        const crypto = this.cryptoData[symbol];
        if (!crypto) return;
        const option = document.createElement('div');
        option.className =
          'flex cursor-pointer items-center justify-center rounded-[6px] bg-[#1a1a1a] px-[12px] py-[4px] hover:bg-[#242424] gap-2 text-sm';
        option.dataset.value = symbol;
        option.innerHTML = `
          <img src="${crypto.icon}" alt="${crypto.symbol}" class="w-3.5 h-3.5 rounded-full object-cover" onerror="this.style.display='none'">
          <span class="font-medium">${crypto.symbol}</span>
        `;
        option.addEventListener('click', e => {
          e.stopPropagation();
          this.selectCrypto(symbol, formType);
        });
        recentRow.appendChild(option);
      });
      container.appendChild(recentRow);
      const separator = document.createElement('div');
      separator.className = 'px-3 py-2';
      separator.innerHTML = `<div class=" text-xs text-white tracking-wide">All Cryptocurrencies</div>`;
      container.appendChild(separator);
    }
    cryptos.forEach(symbol => {
      const crypto = this.cryptoData[symbol];
      const option = document.createElement('div');
      option.className =
        'custom-select-option px-3 py-2 text-sm text-gray-300 hover:bg-[#232323] hover:text-white cursor-pointer transition-colors duration-150 flex items-center gap-3';
      option.dataset.value = symbol;
      option.innerHTML = `
        <img src="${crypto.icon}" alt="${crypto.symbol}" class="w-6 h-6 rounded-full" onerror="this.style.display='none'">
        <div class="flex flex-col">
          <span class="font-medium">${crypto.symbol}</span>
          <span class="text-xs text-gray-500">${crypto.name}</span>
        </div>
      `;
      option.addEventListener('click', e => {
        e.stopPropagation();
        this.selectCrypto(symbol, formType);
      });
      container.appendChild(option);
    });
  }

  filterCryptos(query, formType) {
    const searchTerm = query.toLowerCase();
    const filtered = Object.keys(this.cryptoData).filter(symbol => {
      const crypto = this.cryptoData[symbol];
      return crypto.symbol.toLowerCase().includes(searchTerm) || crypto.name.toLowerCase().includes(searchTerm);
    });
    if (formType === 'deposit') {
      this.filteredCryptos = filtered;
      this.renderCryptoOptions('crypto-options', 'deposit');
    } else {
      this.withdrawFilteredCryptos = filtered;
      this.renderCryptoOptions('withdraw-crypto-options', 'withdraw');
    }
  }

  async selectCrypto(symbol, formType) {
    
    const crypto = this.cryptoData[symbol];
    const state = formType === 'deposit' ? this.depositState : this.withdrawState;
    const selectId = formType === 'deposit' ? 'crypto-select' : 'withdraw-crypto-select';
    const select = this.selects.get(selectId);
    if (select) {
      select.input.value = `${crypto.symbol} - ${crypto.name}`;
      select.isOpen = false;
      this.updateSelectVisibility(selectId);
    }
    state.selectedCrypto = symbol;
    state.selectedNetwork = null;
    
    if (formType === 'withdraw') {
      await this.updateWithdrawBalance(symbol);
    }

    const networkSelectId = formType === 'deposit' ? 'network-select' : 'withdraw-network-select';
    const networkSelect = this.selects.get(networkSelectId);
    if (networkSelect) {
      networkSelect.input.value = '';
      networkSelect.input.placeholder = 'Select network...';
      networkSelect.input.setAttribute('readonly', 'true');
    }
    this.saveRecentCrypto(symbol, formType);
    const recentContainerId = formType === 'deposit' ? 'recent-cryptos' : 'withdraw-recent-cryptos';
    const recentContainer = document.getElementById(recentContainerId);
    if (recentContainer) {
      recentContainer.style.display = 'none';
    }
    if (formType === 'deposit') {
      this.showStepContent(2);
      this.hideStepContent(3);
      this.updateStepStatus(1, true);
      this.updateStepStatus(2, true);
      this.updateStepStatus(3, false);
      await this.loadNetworkOptions(symbol, 'network-options', 'deposit');
      const networkSelect = this.selects.get('network-select');
      if (networkSelect) {
        networkSelect.input.value = '';
        networkSelect.input.placeholder = 'Select network...';
        networkSelect.input.removeAttribute('readonly');
      }
    } else {
      this.showWithdrawStepContent(2);
      this.hideWithdrawStepContent(3);
      this.updateWithdrawStepStatus(1, true);
      this.updateWithdrawStepStatus(2, true);
      this.updateWithdrawStepStatus(3, false);
      await this.loadNetworkOptions(symbol, 'withdraw-network-options', 'withdraw');
      const networkSelect = this.selects.get('withdraw-network-select');
      if (networkSelect) {
        networkSelect.input.value = '';
        networkSelect.input.placeholder = 'Select network...';
        networkSelect.input.removeAttribute('readonly');
      }
      document.getElementById('available-balance').textContent = crypto.balance;
      document.getElementById('available-symbol').textContent = crypto.symbol;
    }
  }

  async loadNetworkOptions(cryptoSymbol, containerId, formType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div class="loading-spinner mx-auto my-4"></div>';
  
    try {
      const crypto = this.cryptoData[cryptoSymbol];
  
      const networksData = await this.walletApi.getCurrencyNetworks(crypto.symbol);
  
      let networks = [];
      if (networksData.status === 'success' && networksData.networks) {
        if (Array.isArray(networksData.networks)) {
          networks = networksData.networks.map(networkName => ({
            name: networkName,
            code: networkName,
            minDeposit: '0.001',
            minWithdraw: '0.001',
            confirmations: 1,
            networkFee: '0.001',
            dailyLimit: '1000',
            address: ''
          }));
        } else {
          networks = Object.entries(networksData.networks).map(([code, name]) => ({
            name,
            code,
            minDeposit: '0.001',
            minWithdraw: '0.001',
            confirmations: 1,
            networkFee: '0.001',
            dailyLimit: '1000',
            address: ''
          }));
        }
      } else {
        networks = crypto?.networks || [];
      }
  
      container.innerHTML = '';
      if (networks.length === 0) {
        container.innerHTML = `
          <div class="text-center py-4 text-gray-500">
            <div class="mb-2">Нет доступных сетей</div>
            <div class="text-sm">Попробуйте выбрать другую валюту</div>
          </div>
        `;
        return;
      }
  
      networks.forEach((network, index) => {
        const option = document.createElement('div');
        option.className =
          'custom-select-option px-3 py-2 text-sm text-gray-300 hover:bg-[#232323] hover:text-white cursor-pointer transition-colors duration-150';
        option.dataset.value = network.code;
        const minAmount = formType === 'deposit' ? network.minDeposit : network.minWithdraw;
        const extraInfo = formType === 'withdraw'
          ? `Fee: ${network.networkFee}`
          : `Confirmations: ${network.confirmations}`;
        option.innerHTML = `
          <div class="flex justify-between items-center">
            <span>${network.name}</span>
            <div class="text-xs text-gray-500 text-right">
              <div>Min: ${minAmount}</div>
              <div>${extraInfo}</div>
            </div>
          </div>
        `;
        option.addEventListener('click', e => {
          e.stopPropagation();
          this.selectNetwork(cryptoSymbol, network, index, formType);
        });
        container.appendChild(option);
      });
    } catch (error) {
      
      if (error.message.includes('401') || error.message.includes('Authorization')) {
      }
      
      container.innerHTML = `
        <div class="text-center py-4">
          <div class="text-red-500 mb-2">Ошибка загрузки сетей</div>
          <div class="text-gray-500 text-sm">${error.message}</div>
        </div>
      `;
    }
  }
  

  selectNetwork(cryptoSymbol, network, index, formType) {
    
    const state = formType === 'deposit' ? this.depositState : this.withdrawState;
    const selectId = formType === 'deposit' ? 'network-select' : 'withdraw-network-select';
    const select = this.selects.get(selectId);
    
    if (select) {
      select.input.value = network.name;
      select.isOpen = false;
      this.updateSelectVisibility(selectId);
    }
    
    state.selectedNetwork = network;
    
    this.refreshContent(cryptoSymbol, network, formType);
    
    if (formType === 'deposit') {
      this.updateStepStatus(2, true);
      this.updateStepStatus(3, true);
      this.showStepContent(3);
      this.updateDepositDetails(cryptoSymbol, network);
    } else {
      this.updateWithdrawStepStatus(2, true);
      this.updateWithdrawStepStatus(3, true);
      this.showWithdrawStepContent(3);
      this.updateWithdrawDetails(cryptoSymbol, network);
    }
  }

  async refreshContent(cryptoSymbol, network, formType) {
    
    if (formType === 'deposit') {
      const elements = {
        'selected-crypto-note': cryptoSymbol,
        'selected-network-note': network.name,
        'min-deposit-note': network.minDeposit,
        'confirmations-note': network.confirmations,
        'network-display': network.name,
        'min-deposit-display': network.minDeposit,
        'confirmations-display': network.confirmations,
        'arrival-time': this.calculateArrivalTime(network.confirmations)
      };
      
      Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      });
      
      await this.updateDepositAddress(cryptoSymbol, network);
      
    } else {
      const elements = {
        'network-fee': network.networkFee,
        'min-withdraw': network.minWithdraw,
        'daily-limit': network.dailyLimit
      };
      
      Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      });
      
      await this.updateWithdrawBalance(cryptoSymbol);
      
      this.updateReceiveAmount();
    }
  }

  async updateDepositAddress(cryptoSymbol, network) {
    try {
      
      const walletData = await this.walletApi.getWalletInfo(cryptoSymbol);
      
      if (walletData.status === 'success' && walletData.address) {
        const addressInput = document.getElementById('deposit-address');
        if (addressInput) {
          addressInput.value = walletData.address;
          
          this.generateQRCode(walletData.address);
        }
      } else {
      }
    } catch (error) {
    }
  }

  async updateWithdrawBalance(cryptoSymbol) {
    try {
      
      const balancesData = await this.walletApi.getBalances();
      
      if (balancesData.status === 'success' && balancesData.balances && balancesData.balances[cryptoSymbol]) {
        const newBalance = balancesData.balances[cryptoSymbol];
        
        if (this.cryptoData[cryptoSymbol]) {
          this.cryptoData[cryptoSymbol].balance = newBalance;
        }
        
        const balanceElement = document.getElementById('available-balance');
        const symbolElement = document.getElementById('available-symbol');
        
        if (balanceElement) {
          balanceElement.textContent = newBalance;
        }
        if (symbolElement) {
          symbolElement.textContent = cryptoSymbol;
        }
      } else {
      }
    } catch (error) {
    }
  }

  async updateDepositDetails(cryptoSymbol, network) {
    try {
      const walletData = await this.walletApi.getWalletInfo(cryptoSymbol);
      
      if (walletData.status === 'success') {
        const addressInput = document.getElementById('deposit-address');
        if (addressInput) {
          addressInput.value = walletData.address || network.address;
        }
        
        if (walletData.balance) {
          this.cryptoData[cryptoSymbol].balance = walletData.balance;
          const balanceElement = document.getElementById('available-balance');
          if (balanceElement) {
            balanceElement.textContent = walletData.balance;
          }
        }
      } else {
      }
    } catch (error) {
      const addressInput = document.getElementById('deposit-address');
      if (addressInput) {
        addressInput.value = network.address;
      }
    }

    const elements = {
      'selected-crypto-note': cryptoSymbol,
      'selected-network-note': network.name,
      'min-deposit-note': network.minDeposit,
      'confirmations-note': network.confirmations,
      'network-display': network.name,
      'min-deposit-display': network.minDeposit,
      'confirmations-display': network.confirmations,
      'arrival-time': this.calculateArrivalTime(network.confirmations)
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      } else {
      }
    });
    
    const addressInput = document.getElementById('deposit-address');
    if (addressInput) {
      if (addressInput.value) {
        this.generateQRCode(addressInput.value);
      } else {
      }
    } else {
    }
  }

  updateWithdrawDetails(cryptoSymbol, network) {
    const elements = {
      'network-fee': network.networkFee,
      'min-withdraw': network.minWithdraw,
      'daily-limit': network.dailyLimit
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      } else {
      }
    });
    
    const balanceElement = document.getElementById('available-balance');
    const symbolElement = document.getElementById('available-symbol');
    if (balanceElement && this.cryptoData[cryptoSymbol]) {
      balanceElement.textContent = this.cryptoData[cryptoSymbol].balance || '0';
    }
    if (symbolElement) {
      symbolElement.textContent = cryptoSymbol;
    }
    
    this.updateReceiveAmount();
  }

  calculateArrivalTime(confirmations) {
    const avgBlockTime = {
      'BTC': 10,
      'ETH': 2,
      'TRC20': 1,
      'BEP20': 0.5,
      'SOL': 0.02,
      'ADA': 5,
      'ARB': 0.25
    };
    const networkCode = this.depositState.selectedNetwork?.code || 'ETH';
    const blockTime = avgBlockTime[networkCode] || 2;
    const totalMinutes = confirmations * blockTime;
    if (totalMinutes < 60) {
      return `~${Math.round(totalMinutes)} minutes`;
    } else {
      const hours = Math.round(totalMinutes / 60 * 10) / 10;
      return `~${hours} hours`;
    }
  }

  generateQRCode(address) {
    const qrContainer = document.getElementById('qr-code');
    if (!qrContainer) {
      return;
    }
    if (!address) {
      return;
    }

    
    const qrCode = this.createSimpleQRCode(address);
    
    qrContainer.innerHTML = `
      <div class="qr-code-container">
        <div class="qr-code-display w-32 h-32 mx-auto bg-white p-2 rounded">
          ${qrCode}
        </div>
        <div class="text-xs text-gray-400 mt-2 text-center break-all max-w-32">${address}</div>
      </div>
    `;
  }

  createSimpleQRCode(text) {
    const size = 8;
    let html = '<div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 1px; width: 100%; height: 100%;">';
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const shouldFill = (i + j + text.length) % 3 === 0 || 
                          (i === 0 && j === 0) || 
                          (i === size-1 && j === 0) || 
                          (i === 0 && j === size-1);
        
        html += `<div style="background-color: ${shouldFill ? '#000' : '#fff'}; width: 100%; height: 100%;"></div>`;
      }
    }
    
    html += '</div>';
    return html;
  }

  showStepContent(stepNumber) {
    const content = document.getElementById(`step-${stepNumber}-content`);
    if (content) {
      content.classList.add('visible');
      content.style.display = 'block';
    }
  }

  hideStepContent(stepNumber) {
    const content = document.getElementById(`step-${stepNumber}-content`);
    if (content) {
      content.classList.remove('visible');
      content.style.display = 'none';
    }
  }

  showWithdrawStepContent(stepNumber) {
    const content = document.getElementById(`withdraw-step-${stepNumber}-content`);
    if (content) {
      content.classList.add('visible');
      content.style.display = 'block';
    }
  }

  hideWithdrawStepContent(stepNumber) {
    const content = document.getElementById(`withdraw-step-${stepNumber}-content`);
    if (content) {
      content.classList.remove('visible');
      content.style.display = 'none';
    }
  }

  updateStepStatus(stepNumber, isCompleted) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (!step) return;
    const indicator = step.querySelector('.step-indicator');
    const label = step.querySelector('label');
    if (indicator) {
      if (isCompleted) {
        indicator.className =
          'step-indicator flex h-5 w-5 items-end justify-center rounded-full text-center text-[14px] font-medium leading-[18px] border-[1px] border-white bg-white text-[#242424] relative z-[5]';
      } else {
        indicator.className =
          'step-indicator flex h-5 w-5 items-end justify-center rounded-full text-center text-[14px] font-medium leading-[18px] border-[1px] border-[#3c3d3d] text-[#3c3d3d] bg-[#111111] z-[5]';
      }
      indicator.textContent = stepNumber;
    }
    if (label) {
      if (isCompleted) {
        label.className =
          'flex items-center font-medium mb-2 gap-3 text-[18px] leading-[24px] text-white';
      } else {
        label.className =
          'flex items-center font-medium mb-2 gap-3 text-[18px] leading-[24px] text-[#ebecf566]';
      }
    }
  }

  updateWithdrawStepStatus(stepNumber, isCompleted) {
    const step = document.getElementById(`withdraw-step-${stepNumber}`);
    if (!step) return;
    const indicator = step.querySelector('.step-indicator');
    const label = step.querySelector('label');
    if (indicator) {
      if (isCompleted) {
        indicator.className =
          'step-indicator flex h-5 w-5 items-end justify-center rounded-full text-center text-[14px] font-medium leading-[18px] border-[1px] border-white bg-white text-[#242424] relative z-[5]';
      } else {
        indicator.className =
          'step-indicator flex h-5 w-5 items-end justify-center rounded-full text-center text-[14px] font-medium leading-[18px] border-[1px] border-[#3c3d3d] text-[#3c3d3d] bg-[#111111] z-[5]';
      }
      indicator.textContent = stepNumber;
    }
    if (label) {
      if (isCompleted) {
        label.className =
          'flex items-center font-medium mb-2 gap-3 text-[18px] leading-[24px] text-white';
      } else {
        label.className =
          'flex items-center font-medium mb-2 gap-3 text-[18px] leading-[24px] text-[#ebecf566]';
      }
    }
  }

  openSelect(selectId) {
    this.closeAllSelects(selectId);
    const select = this.selects.get(selectId);
    if (select) {
      select.isOpen = true;
      this.updateSelectVisibility(selectId);
    }
  }

  toggleSelect(selectId) {
    const select = this.selects.get(selectId);
    if (!select) return;
    if (select.isOpen) {
      this.closeAllSelects();
    } else {
      this.openSelect(selectId);
    }
  }

  closeAllSelects(exceptId = null) {
    this.selects.forEach((select, selectId) => {
      if (selectId !== exceptId && select.isOpen) {
        select.isOpen = false;
        this.updateSelectVisibility(selectId);
      }
    });
  }

  updateSelectVisibility(selectId) {
    const select = this.selects.get(selectId);
    if (!select) return;
    const { dropdown, isOpen } = select;
    const arrowIcon = select.input.parentElement.querySelector('.arrow-icon');
    if (isOpen) {
      dropdown.classList.remove('opacity-0', 'pointer-events-none');
      dropdown.classList.add('opacity-100', 'pointer-events-auto');
    } else {
      dropdown.classList.remove('opacity-100', 'pointer-events-auto');
      dropdown.classList.add('opacity-0', 'pointer-events-none');
    }
    if (arrowIcon) {
      arrowIcon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }

  getRecentCryptos(formType) {
    const key = `recent_cryptos_${formType}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return ['USDT', 'BTC', 'ETH', 'SOL', 'BNB'].slice(0, 5);
  }

  saveRecentCrypto(symbol, formType) {
    const state = formType === 'deposit' ? this.depositState : this.withdrawState;
    const key = `recent_cryptos_${formType}`;

    state.recentCryptos = state.recentCryptos.filter(c => c !== symbol);
    state.recentCryptos.unshift(symbol);
    state.recentCryptos = state.recentCryptos.slice(0, 5);
    localStorage.setItem(key, JSON.stringify(state.recentCryptos));
    this.displayRecentCryptos(formType);
  }

  displayRecentCryptos(formType) {
    const containerId = formType === 'deposit' ? 'recent-cryptos' : 'withdraw-recent-cryptos';
    const container = document.getElementById(containerId);
    if (!container) return;
    const state = formType === 'deposit' ? this.depositState : this.withdrawState;
    const cryptoContainer = container.querySelector('.flex');
    if (cryptoContainer) {
      cryptoContainer.innerHTML = '';
    }
    if (state.recentCryptos.length === 0) {
      container.style.display = 'none';
      return;
    }
    state.recentCryptos.forEach(symbol => {
      const crypto = this.cryptoData[symbol];
      if (!crypto) return;
      const button = document.createElement('button');
      button.className =
        'flex h-[36px] cursor-pointer items-center justify-center rounded-[8px] bg-[#242424] px-[12px] py-[4px] hover:bg-[#2d2d2e] gap-2';
      button.innerHTML = `
        <img src="${crypto.icon}" alt="${crypto.symbol}" class="w-5 h-5 rounded-full object-cover" onerror="this.style.display='none'">
        <div class="flex flex-col">
          <span class="font-semibold text-sm">${crypto.symbol}</span>
        </div>
      `;
      button.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.selectCrypto(symbol, formType);
      });
      if (cryptoContainer) cryptoContainer.appendChild(button);
    });
    container.style.display = 'block';
  }

  resetAfterCryptoCleared(formType) {
    const state = formType === 'deposit' ? this.depositState : this.withdrawState;
    state.selectedCrypto = null;
    state.selectedNetwork = null;
    const networkSelectId = formType === 'deposit' ? 'network-select' : 'withdraw-network-select';
    const networkSelect = this.selects.get(networkSelectId);
    if (networkSelect) {
      networkSelect.input.value = '';
      networkSelect.input.placeholder = 'Select network...';
      networkSelect.input.setAttribute('readonly', 'true');
    }
    const recentContainerId = formType === 'deposit' ? 'recent-cryptos' : 'withdraw-recent-cryptos';
    const recentContainer = document.getElementById(recentContainerId);
    if (recentContainer) {
      recentContainer.style.display = 'block';
      this.displayRecentCryptos(formType);
    }
    if (formType === 'deposit') {
      this.hideStepContent(2);
      this.hideStepContent(3);
      this.updateStepStatus(1, true);
      this.updateStepStatus(2, false);
      this.updateStepStatus(3, false);
    } else {
      this.hideWithdrawStepContent(2);
      this.hideWithdrawStepContent(3);
      this.updateWithdrawStepStatus(1, true);
      this.updateWithdrawStepStatus(2, false);
      this.updateWithdrawStepStatus(3, false);
    }
  }


  async refreshTransactions() {
    const depositsTableBody = document.getElementById('deposits-table-body');
    const withdrawalsTableBody = document.getElementById('withdrawals-table-body');
    if (!depositsTableBody || !withdrawalsTableBody) return;
  
    try {
      const txData = await this.walletApi.getTransactions();
  
      const txs = txData.transactions || txData.data || [];
  
      depositsTableBody.innerHTML = '';
      withdrawalsTableBody.innerHTML = '';
  
      if (txData.status !== 'success' || txs.length === 0) {
        showEmptyTableState();
        return;
      }
  
      txs.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-4 py-2">${tx.currency}</td>
          <td class="px-4 py-2">${tx.network || '-'}</td>
          <td class="px-4 py-2">${tx.amount}</td>
          <td class="px-4 py-2">${tx.status}</td>
          <td class="px-4 py-2">${tx.blockchain_hash || '-'}</td>
          <td class="px-4 py-2">${formatDate(tx.created_at)}</td>
        `;
  
        if (tx.direction === 'in') {
          depositsTableBody.appendChild(row);
        } else if (tx.direction === 'out') {
          withdrawalsTableBody.appendChild(row);
        }
      });
    } catch (error) {
      showEmptyTableState();
    }
  }
  
  

}


class SidebarManager {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.mainContent = document.getElementById('main-content');
    this.sidebarToggle = document.getElementById('sidebar-toggle');
    this.mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
    this.sidebarItems = document.querySelectorAll('[data-section]');
    this.sections = document.querySelectorAll('[id$="-section"]');
    this.isCollapsed = false;
    this.isMobile = window.innerWidth < 1024;
    this.currentSection = 'deposit';
  }

  init() {
    this.bindEvents();
    this.showSection('deposit');
    this.handleResize();

    const initialMobileTab = document.querySelector('.mobile-tab[data-section="deposit"]');
    if (initialMobileTab) {
      initialMobileTab.classList.remove('text-[rgba(235,236,245,0.4)]', 'border-transparent');
      initialMobileTab.classList.add('bg-[#1a1a1a]/50', 'text-white', 'border-[#facc15]');
    }
  }

  bindEvents() {
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }
    if (this.mobileSidebarToggle) {
      this.mobileSidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }
    this.sidebarItems.forEach(item => {
      item.addEventListener('click', e => {
        const sectionName = e.currentTarget.getAttribute('data-section');
        this.showSection(sectionName);
        if (this.isMobile) {
          this.closeMobileSidebar();
        }
      });
    });
    const mobileTabs = document.querySelectorAll('.mobile-tab');
    mobileTabs.forEach(tab => {
      tab.addEventListener('click', e => {
        const sectionName = e.currentTarget.getAttribute('data-section');
        this.showSection(sectionName);
      });
    });
    document.addEventListener('click', e => {
      if (
        this.isMobile &&
        !this.sidebar.contains(e.target) &&
        !this.mobileSidebarToggle.contains(e.target)
      ) {
        this.closeMobileSidebar();
      }
    });
    window.addEventListener('resize', () => this.handleResize());
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.toggleMobileSidebar();
      return;
    }
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.sidebar.classList.remove('w-60');
      this.sidebar.classList.add('w-20');
      this.mainContent.classList.remove('ml-60');
      this.mainContent.classList.add('ml-20');
      if (this.sidebarToggle) {
        const svg = this.sidebarToggle.querySelector('svg');
        if (svg) svg.style.transform = 'rotate(180deg)';
      }
      this.sidebarItems.forEach(item => {
        const textSpan = item.querySelector('span');
        if (textSpan) {
          textSpan.style.opacity = '0';
          textSpan.style.pointerEvents = 'none';
        }
      });
      const logoSection = this.sidebar.querySelector('.p-6');
      if (logoSection) {
        logoSection.style.opacity = '0';
        logoSection.style.pointerEvents = 'none';
      }
    } else {
      this.sidebar.classList.remove('w-20');
      this.sidebar.classList.add('w-60');
      this.mainContent.classList.remove('ml-20');
      this.mainContent.classList.add('ml-60');
      if (this.sidebarToggle) {
        const svg = this.sidebarToggle.querySelector('svg');
        if (svg) svg.style.transform = 'rotate(0deg)';
      }
      this.sidebarItems.forEach(item => {
        const textSpan = item.querySelector('span');
        if (textSpan) {
          textSpan.style.opacity = '1';
          textSpan.style.pointerEvents = 'auto';
        }
      });
      const logoSection = this.sidebar.querySelector('.p-6');
      if (logoSection) {
        logoSection.style.opacity = '1';
        logoSection.style.pointerEvents = 'auto';
      }
    }
  }

  toggleMobileSidebar() {
    this.sidebar.classList.toggle('translate-x-0');
    this.sidebar.classList.toggle('-translate-x-full');
  }

  closeMobileSidebar() {
    this.sidebar.classList.remove('translate-x-0');
    this.sidebar.classList.add('-translate-x-full');
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024;
    if (wasMobile !== this.isMobile) {
      if (this.isMobile) {
        this.sidebar.classList.add('-translate-x-full');
        this.sidebar.classList.remove('w-20', 'w-60');
        this.sidebar.classList.add('w-60');
        this.mainContent.classList.remove('ml-20', 'ml-60');
        this.mainContent.classList.add('ml-0');
        this.isCollapsed = false;
        if (this.sidebarToggle) {
          const svg = this.sidebarToggle.querySelector('svg');
          if (svg) svg.style.transform = 'rotate(0deg)';
        }
        this.sidebarItems.forEach(item => {
          const textSpan = item.querySelector('span');
          if (textSpan) {
            textSpan.style.opacity = '1';
            textSpan.style.pointerEvents = 'auto';
          }
        });
        const logoSection = this.sidebar.querySelector('.p-6');
        if (logoSection) {
          logoSection.style.opacity = '1';
          logoSection.style.pointerEvents = 'auto';
        }
      } else {
        this.sidebar.classList.remove('-translate-x-full');
        this.sidebar.classList.add('w-60');
        this.mainContent.classList.remove('ml-0');
        this.mainContent.classList.add('ml-60');
      }
    }
  }

  showSection(sectionName) {
    this.sections.forEach(section => {
      section.classList.add('section-hidden');
    });
    this.sidebarItems.forEach(item => {
      item.classList.remove('bg-[#1a1a1a]', 'text-white');
      item.classList.add('text-[rgba(235,236,245,0.4)]');
    });
    const mobileTabs = document.querySelectorAll('.mobile-tab');
    mobileTabs.forEach(tab => {
      tab.classList.remove('bg-[#1a1a1a]/50', 'text-white', 'border-[#facc15]');
      tab.classList.add('text-[rgba(235,236,245,0.4)]', 'border-transparent');
    });
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
      targetSection.classList.remove('section-hidden');
    }
    const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeItem) {
      activeItem.classList.remove('text-[rgba(235,236,245,0.4)]');
      activeItem.classList.add('bg-[#1a1a1a]', 'text-white');
    }
    const activeMobileTab = document.querySelector(`.mobile-tab[data-section="${sectionName}"]`);
    if (activeMobileTab) {
      activeMobileTab.classList.remove('text-[rgba(235,236,245,0.4)]', 'border-transparent');
      activeMobileTab.classList.add('bg-[#1a1a1a]/50', 'text-white', 'border-[#facc15]');
    }
    this.currentSection = sectionName;
    this.updatePageContent(sectionName);
  }

  updatePageContent(sectionName) {
    const breadcrumbSection = document.getElementById('breadcrumb-section');
    const pageTitle = document.getElementById('page-title');
    if (breadcrumbSection) {
      breadcrumbSection.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    }
    if (pageTitle) {
      pageTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    }
  }
}


async function loadTransactionsFromApi() {
  try {
    const walletApi = new WalletApiService();
    const transactionsData = await walletApi.getTransactions();
    
    
    if (transactionsData.status === 'success' && transactionsData.transactions && transactionsData.transactions.length > 0) {
      renderTransactionsTable(transactionsData.transactions);
    } else {
      showEmptyTableState();
    }
  } catch (error) {
    
    showEmptyTableState();
  }
}

function renderTransactionsTable(transactions) {
  
  const depositsTableBody = document.getElementById('deposits-table-body');
  const withdrawalsTableBody = document.getElementById('withdrawals-table-body');
  
  
  if (!depositsTableBody || !withdrawalsTableBody) {
    return;
  }
  
  const deposits = transactions.filter(tx => tx.direction === 'in');
  const withdrawals = transactions.filter(tx => tx.direction === 'out');
  const depositsHTML = deposits.map((item, index) => {
    const crypto = cryptoData[item.currency] || {
      name: item.currency,
      symbol: item.currency,
      icon: 'https://s2.blofin.com/static/currency/icon/usdt.png'
    };
    
    const rowHTML = `
      <tr class="border-b border-[#232323] hover:bg-[#1a1a1a] transition-colors duration-200">
        <td class="py-3 px-2">
          <div class="flex items-center gap-2 whitespace-nowrap">
            <img src="${crypto.icon}" alt="${crypto.symbol}" class="w-6 h-6 rounded-full">
            <span class="text-white">${crypto.name} (${crypto.symbol})</span>
          </div>
        </td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${item.amount}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${item.address ? item.address.substring(0, 8) + '...' + item.address.substring(item.address.length - 8) : '-'}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${formatDate(item.created_at)}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${item.blockchain_hash ? item.blockchain_hash.substring(0, 8) + '...' + item.blockchain_hash.substring(item.blockchain_hash.length - 8) : '-'}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${item.address ? item.address.substring(0, 8) + '...' + item.address.substring(item.address.length - 8) : '-'}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">-</td>
        <td class="py-3 px-2">
          <span class="px-2 py-1 rounded text-xs font-medium ${
            item.status === 'completed'
              ? 'bg-green-500/20 text-green-500'
              : item.status === 'pending'
              ? 'bg-yellow-500/20 text-yellow-500'
              : 'bg-blue-500/20 text-blue-500'
          }">${item.status}</span>
        </td>
        <td class="py-3 px-2">
          <button class="px-3 py-1 rounded text-xs font-medium bg-[#facc15] text-black hover:bg-[#e6b800] transition-colors duration-200">
            Deposit
          </button>
        </td>
      </tr>
    `;
    
    return rowHTML;
  }).join('');
  
  depositsTableBody.innerHTML = depositsHTML;
  
  const withdrawalsHTML = withdrawals.map((item, index) => {
    const crypto = cryptoData[item.currency] || {
      name: item.currency,
      symbol: item.currency,
      icon: 'https://s2.blofin.com/static/currency/icon/usdt.png'
    };
    
    const rowHTML = `
      <tr class="border-b border-[#232323] hover:bg-[#1a1a1a] transition-colors duration-200">
        <td class="py-3 px-2">
          <div class="flex items-center gap-2 whitespace-nowrap">
            <img src="${crypto.icon}" alt="${crypto.symbol}" class="w-6 h-6 rounded-full">
            <span class="text-white">${crypto.name} (${crypto.symbol})</span>
          </div>
        </td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${item.amount}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${item.address ? item.address.substring(0, 8) + '...' + item.address.substring(item.address.length - 8) : '-'}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${formatDate(item.created_at)}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${item.blockchain_hash ? item.blockchain_hash.substring(0, 8) + '...' + item.blockchain_hash.substring(item.blockchain_hash.length - 8) : '-'}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">${item.address ? item.address.substring(0, 8) + '...' + item.address.substring(item.address.length - 8) : '-'}</td>
        <td class="py-3 px-2 text-white whitespace-nowrap">-</td>
        <td class="py-3 px-2">
          <span class="px-2 py-1 rounded text-xs font-medium ${
            item.status === 'completed'
              ? 'bg-green-500/20 text-green-500'
              : item.status === 'pending'
              ? 'bg-yellow-500/20 text-yellow-500'
              : 'bg-blue-500/20 text-blue-500'
          }">${item.status}</span>
        </td>
        <td class="py-3 px-2">
          <button class="px-3 py-1 rounded text-xs font-medium bg-[#facc15] text-black hover:bg-[#e6b800] transition-colors duration-200">
            Withdraw
          </button>
        </td>
      </tr>
    `;
    
    return rowHTML;
  }).join('');
  
  withdrawalsTableBody.innerHTML = withdrawalsHTML;
  
  
}

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loadingIndicator.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-lg flex flex-col items-center gap-4">
        <div class="loading-spinner"></div>
        <div class="text-white text-lg">Загрузка приложения...</div>
      </div>
    `;
    document.body.appendChild(loadingIndicator);

    try {
      const sessionResponse = await fetch('https://apiexchange.ymca.one/session', {
        method: 'GET',
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();

      if (sessionData.status !== 'success') {
      } else {
      }
    } catch (error) {
    }

    const sidebarManager = new SidebarManager();
    sidebarManager.init();

    const fm = new FormManager();
    await fm.init();

    await loadTransactionsFromApi();

    window.formManager = fm;
    window.sidebarManager = sidebarManager;
    window.walletApi = fm.walletApi;

    fm.refreshTransactions = async function() {
      await loadTransactionsFromApi();
    };
  } catch (error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-50';
    errorDiv.innerHTML = `
      <div class="bg-red-800 p-8 rounded-lg max-w-md text-center">
        <div class="text-red-200 text-2xl mb-4">⚠️ Ошибка загрузки</div>
        <div class="text-red-100 mb-4">Не удалось загрузить приложение</div>
        <div class="text-red-300 text-sm mb-4">${error.message}</div>
        <button onclick="location.reload()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Перезагрузить страницу
        </button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  } finally {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
});
