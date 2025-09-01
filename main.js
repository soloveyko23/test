// Подробная функция для вывода всех данных API в консоль
async function showAllApiData() {
  console.log('🚀 === ПОДРОБНЫЙ ВЫВОД ВСЕХ ДАННЫХ API ===');
  
  try {
    const walletApi = new WalletApiService();
    
    // 1. Балансы
    console.log('\n💰 === БАЛАНСЫ ===');
    console.log('📡 Запрос: GET /api/wallet/getBalances');
    try {
      const balances = await walletApi.getBalances();
      console.log('📊 Ответ API (балансы):', balances);
      if (balances.status === 'success') {
        console.log('✅ Статус: success');
        console.log('💰 Балансы:', balances.balances);
        Object.entries(balances.balances || {}).forEach(([currency, balance]) => {
          console.log(`   ${currency}: ${balance}`);
        });
      } else {
        console.log('❌ Статус:', balances.status);
        console.log('📝 Сообщение:', balances.msg);
      }
    } catch (error) {
      console.error('❌ Ошибка получения балансов:', error.message);
      console.error('🔍 Полная ошибка:', error);
    }
    
    // 2. Сети для разных валют
    console.log('\n🔗 === СЕТИ ДЛЯ ВАЛЮТ ===');
    const currencies = ['USDT', 'BTC', 'ETH'];
    for (const currency of currencies) {
      console.log(`\n📡 Запрос: POST /api/wallet/getCurrencyNetworks (${currency})`);
      try {
        console.log(`🔄 Запрашиваю сети для ${currency}...`);
        const networks = await walletApi.getCurrencyNetworks(currency);
        console.log(`📊 Ответ API (сети для ${currency}):`, networks);
        if (networks.status === 'success') {
          console.log('✅ Статус: success');
          console.log(`🔗 Сети:`, networks.networks);
          console.log(`📊 Тип networks:`, typeof networks.networks);
          console.log(`📊 Является ли массивом:`, Array.isArray(networks.networks));
        } else {
          console.log('❌ Статус:', networks.status);
          console.log('📝 Сообщение:', networks.msg);
        }
      } catch (error) {
        console.error(`❌ Ошибка получения сетей для ${currency}:`, error.message);
        console.error(`🔍 Полная ошибка для ${currency}:`, error);
      }
    }
    
    // 3. Информация о кошельках
    console.log('\n🏦 === ИНФОРМАЦИЯ О КОШЕЛЬКАХ ===');
    for (const currency of currencies) {
      console.log(`\n📡 Запрос: POST /api/wallet/get (${currency})`);
      try {
        console.log(`🔄 Запрашиваю информацию о кошельке для ${currency}...`);
        const walletInfo = await walletApi.getWalletInfo(currency);
        console.log(`📊 Ответ API (кошелек ${currency}):`, walletInfo);
        if (walletInfo.status === 'success') {
          console.log('✅ Статус: success');
          console.log(`🏦 Адрес: ${walletInfo.address || 'Не указан'}`);
          console.log(`💰 Баланс: ${walletInfo.balance || 'Не указан'}`);
        } else {
          console.log('❌ Статус:', walletInfo.status);
          console.log('📝 Сообщение:', walletInfo.msg);
        }
      } catch (error) {
        console.error(`❌ Ошибка получения информации о кошельке ${currency}:`, error.message);
        console.error(`🔍 Полная ошибка для ${currency}:`, error);
      }
    }
    
    // 4. Транзакции
    console.log('\n📊 === ТРАНЗАКЦИИ ===');
    console.log('📡 Запрос: GET /api/wallet/transactions');
    try {
      console.log('🔄 Запрашиваю транзакции...');
      const transactions = await walletApi.getTransactions();
      console.log('📊 Ответ API (транзакции):', transactions);
      if (transactions.status === 'success') {
        console.log('✅ Статус: success');
        console.log(`📊 Количество транзакций: ${transactions.transactions ? transactions.transactions.length : 0}`);
        if (transactions.transactions && transactions.transactions.length > 0) {
          console.log('📋 Детали транзакций:');
          transactions.transactions.forEach((tx, index) => {
            console.log(`   ${index + 1}. ID: ${tx.id}, Направление: ${tx.direction}, Валюта: ${tx.currency}, Сумма: ${tx.amount}, Статус: ${tx.status}`);
          });
        }
      } else {
        console.log('❌ Статус:', transactions.status);
        console.log('📝 Сообщение:', transactions.msg);
      }
    } catch (error) {
      console.error('❌ Ошибка получения транзакций:', error.message);
      console.error('🔍 Полная ошибка:', error);
    }
    
    console.log('\n✅ === ВСЕ ДАННЫЕ API ВЫВЕДЕНЫ В КОНСОЛЬ ===');
    
    } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

// Функция для показа уведомления об авторизации
function showAuthNotification() {
  // Проверяем, не показывается ли уже уведомление
  if (document.getElementById('auth-notification')) {
    console.log('ℹ️ Уведомление об авторизации уже показывается');
    return;
  }
  
  console.log('🔔 Показываю уведомление об авторизации');
  const notification = document.createElement('div');
  notification.id = 'auth-notification';
  notification.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
      <div>
        <div class="font-medium">Требуется авторизация</div>
        <div class="text-sm opacity-90">Для доступа к кошельку необходимо войти в систему</div>
      </div>
    </div>
    <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-white opacity-70 hover:opacity-100">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;
  document.body.appendChild(notification);
  
  // Автоматически убираем через 10 секунд
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

// Функция для тестирования QR кода
function testQRCode() {
  console.log('🧪 === ТЕСТИРОВАНИЕ QR КОДА ===');
  
  const qrContainer = document.getElementById('qr-code');
  if (!qrContainer) {
    console.error('❌ Контейнер QR кода не найден');
    return;
  }
  
  console.log('✅ Контейнер QR кода найден');
  
  // Тестируем с тестовым адресом
  const testAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
  console.log(`🔄 Тестирую QR код с адресом: ${testAddress}`);
  
  // Создаем простой QR код
  const size = 8;
  let html = '<div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 1px; width: 100%; height: 100%;">';
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const shouldFill = (i + j + testAddress.length) % 3 === 0 || 
                        (i === 0 && j === 0) || 
                        (i === size-1 && j === 0) || 
                        (i === 0 && j === size-1);
      
      html += `<div style="background-color: ${shouldFill ? '#000' : '#fff'}; width: 100%; height: 100%;"></div>`;
    }
  }
  
  html += '</div>';
  
  qrContainer.innerHTML = `
    <div class="qr-code-container">
      <div class="qr-code-display w-32 h-32 mx-auto bg-white p-2 rounded">
        ${html}
      </div>
      <div class="text-xs text-gray-400 mt-2 text-center break-all max-w-32">${testAddress}</div>
    </div>
  `;
  
  console.log('✅ QR код протестирован и отображен');
}

// Функция для проверки элементов HTML
function checkHTMLElements() {
  console.log('🔍 === ПРОВЕРКА ЭЛЕМЕНТОВ HTML ===');
  
  const elements = [
    'deposits-table-body',
    'withdrawals-table-body',
    'deposit-address',
    'qr-code',
    'crypto-options',
    'withdraw-crypto-options',
    'available-balance',
    'available-symbol'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`✅ ${id}: найден`, element);
      if (element.innerHTML) {
        console.log(`   Содержимое: ${element.innerHTML.substring(0, 100)}...`);
      }
    } else {
      console.log(`❌ ${id}: НЕ НАЙДЕН`);
    }
  });
}

// Функция для принудительного обновления всех данных
async function forceRefreshAllData() {
  console.log('🔄 === ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ВСЕХ ДАННЫХ ===');
  
  try {
    // Обновляем балансы
    if (window.formManager) {
      await window.formManager.loadBalancesFromApi();
      console.log('✅ Балансы обновлены');
    }
    
    // Обновляем транзакции
    await forceRefreshTransactions();
    
    // Обновляем списки криптовалют
    if (window.formManager) {
      window.formManager.filteredCryptos = Object.keys(window.formManager.cryptoData);
      window.formManager.withdrawFilteredCryptos = Object.keys(window.formManager.cryptoData);
      window.formManager.renderCryptoOptions('crypto-options', 'deposit');
      window.formManager.renderCryptoOptions('withdraw-crypto-options', 'withdraw');
      console.log('✅ Списки криптовалют обновлены');
    }
    
    console.log('✅ Все данные обновлены');
  } catch (error) {
    console.error('❌ Ошибка обновления данных:', error);
  }
}

// Функция для принудительного обновления таблиц транзакций
async function forceRefreshTransactions() {
  console.log('🔄 === ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ТАБЛИЦ ТРАНЗАКЦИЙ ===');
  
  try {
    // Очищаем таблицы
    const depositsTableBody = document.getElementById('deposits-table-body');
    const withdrawalsTableBody = document.getElementById('withdrawals-table-body');
    
    if (depositsTableBody) {
      depositsTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Обновление...</td></tr>';
    }
    if (withdrawalsTableBody) {
      withdrawalsTableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4">Обновление...</td></tr>';
    }
    
    // Загружаем транзакции заново
    await loadTransactionsFromApi();
    
    console.log('✅ Таблицы транзакций обновлены');
  } catch (error) {
    console.error('❌ Ошибка обновления таблиц:', error);
  }
}

// Функция для тестирования получения сетей
async function testNetworks() {
  console.log('🧪 === ТЕСТИРОВАНИЕ ПОЛУЧЕНИЯ СЕТЕЙ ===');
  
  try {
    const walletApi = new WalletApiService();
    
    // Тестируем получение сетей для USDT
    console.log('🔄 Тестирую получение сетей для USDT...');
    const networksData = await walletApi.getCurrencyNetworks('USDT');
    console.log('📊 Результат получения сетей USDT:', networksData);
    
    if (networksData.status === 'success') {
      console.log(`✅ Сети получены:`, networksData.networks);
      console.log(`📊 Тип networks:`, typeof networksData.networks);
      console.log(`📊 Является ли массивом:`, Array.isArray(networksData.networks));
    } else {
      console.log(`❌ Ошибка: ${networksData.msg}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования сетей:', error);
  }
}

// Функция для тестирования получения адреса кошелька
async function testWalletAddress() {
  console.log('🧪 === ТЕСТИРОВАНИЕ ПОЛУЧЕНИЯ АДРЕСА КОШЕЛЬКА ===');
  
  try {
    const walletApi = new WalletApiService();
    
    // Тестируем получение адреса для USDT
    console.log('🔄 Тестирую получение адреса для USDT...');
    const walletData = await walletApi.getWalletInfo('USDT');
    console.log('📊 Результат получения адреса USDT:', walletData);
    
    if (walletData.status === 'success') {
      console.log(`✅ Адрес получен: ${walletData.address}`);
      console.log(`💰 Баланс: ${walletData.balance}`);
    } else {
      console.log(`❌ Ошибка: ${walletData.msg}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования адреса:', error);
  }
}

// Функция для тестирования API без авторизации
async function testApiWithoutAuth() {
  console.log('🧪 === ТЕСТИРОВАНИЕ API БЕЗ АВТОРИЗАЦИИ ===');
  
  try {
    const testUrl = 'https://apiexchange.ymca.one/api/wallet/transactions';
    console.log(`🔄 Тестирую GET запрос к: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Статус ответа: ${response.status}`);
    console.log(`📋 Заголовки:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`📝 Тело ответа:`, text);
    
    try {
      const json = JSON.parse(text);
      console.log(`🔍 JSON ответ:`, json);
    } catch (e) {
      console.log(`❌ Ответ не является JSON`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования API:', error);
  }
}

// Базовые данные для fallback (используются только при ошибках API)
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


// Убрал тестовые данные - теперь используются только реальные данные из API


// Функция для отображения пустого состояния таблицы
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
    const finalOptions = {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };

    // Для GET запросов не добавляем body
    if (options.method !== 'GET' && options.body) {
      finalOptions.body = JSON.stringify(options.body);
    }

    // 📝 подробный лог запроса
    console.log(`\n📡 === API ЗАПРОС ===`);
    console.log(`🌐 URL: ${url}`);
    console.log(`📋 Метод: ${finalOptions.method}`);
    console.log(`📦 Тело запроса:`, finalOptions.body);
    console.log(`🔧 Опции:`, finalOptions);

    try {
      const response = await fetch(url, finalOptions);
      const text = await response.text();
      console.log(`\n📡 === API ОТВЕТ ===`);
      console.log(`🌐 URL: ${url}`);
      console.log(`📊 Статус HTTP: ${response.status}`);
      console.log(`📝 Сырой ответ:`, text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`Ответ не JSON: ${text}`);
      }

      console.log(`📊 Обработанный ответ:`, data);
      
      if (!response.ok) {
        console.error(`❌ HTTP ошибка ${response.status}:`, data);
        throw new Error(`HTTP ${response.status}: ${data.msg || 'Unknown error'}`);
      }
      if (data.status === 'err') {
        console.error(`❌ API ошибка:`, data);
        throw new Error(data.msg || 'API error');
      }
      
      console.log(`✅ API запрос успешен`);

      return data;
    } catch (error) {
      console.error(`❌ API Error (${url}):`, error);
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
    // 🚀 передаём валюту ровно как в balances
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
    // 🚀 убрал body для GET
    return this.makeRequest('/api/wallet/transactions', {
      method: 'GET',
      body: undefined // Явно убираем body для GET запроса
    });
  }
}


// Функция будет вызвана автоматически при загрузке страницы

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
    console.log('🚀 Начинаю инициализацию FormManager...');
    
    // Инициализируем cryptoData статическими данными сначала
    this.cryptoData = { ...cryptoData };
    console.log('📊 Инициализирован cryptoData:', Object.keys(this.cryptoData));
    
    // Загружаем балансы из API
    await this.loadBalancesFromApi();
    
    this.filteredCryptos = Object.keys(this.cryptoData);
    this.withdrawFilteredCryptos = Object.keys(this.cryptoData);
    console.log(`📋 Обновлены списки криптовалют: ${this.filteredCryptos.length} для депозита, ${this.withdrawFilteredCryptos.length} для вывода`);
    
    this.initDepositForm();
    this.initWithdrawForm();
    document.addEventListener('click', this.closeAllSelects.bind(this));
    
    console.log('✅ Инициализация FormManager завершена');
  }

  async loadBalancesFromApi() {
    try {
      console.log('🔄 Загружаю балансы из API...');
      const balancesData = await this.walletApi.getBalances();
      console.log('📊 Полученные балансы:', balancesData);
      
      if (balancesData.status === 'success' && balancesData.balances) {
        console.log('✅ Успешно получены балансы');
        // Обновляем балансы в cryptoData
        Object.keys(balancesData.balances).forEach(currency => {
          if (this.cryptoData[currency]) {
            this.cryptoData[currency].balance = balancesData.balances[currency];
            console.log(`💰 Обновлен баланс ${currency}: ${balancesData.balances[currency]}`);
          }
        });
        
        // Если API вернул новые валюты, добавляем их
        Object.keys(balancesData.balances).forEach(currency => {
          if (!this.cryptoData[currency]) {
            this.cryptoData[currency] = {
              name: currency,
              symbol: currency,
              icon: `https://s2.blofin.com/static/currency/icon/${currency.toLowerCase()}.png`,
              balance: balancesData.balances[currency],
              networks: []
            };
            console.log(`🆕 Добавлена новая валюта: ${currency}`);
          }
        });
        
      } else {
        console.log(`❌ Ошибка API: ${balancesData.msg || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки балансов:', error);
      // Не показываем ошибку пользователю при загрузке, только в консоль
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
      console.log('⚠️ Не выбрана валюта или сеть');
      return;
    }
    
    const amount = parseFloat(amountInput.value);
    const address = addressInput.value.trim();
    
    if (!amount || amount <= 0) {
      console.log('⚠️ Сумма не указана или некорректна:', amount);
      return;
    }
    
    if (!address) {
      console.log('⚠️ Адрес не указан');
      return;
    }
    
    try {
      // Показываем индикатор загрузки
      const withdrawBtn = document.getElementById('withdraw-btn');
      const originalText = withdrawBtn.innerHTML;
      withdrawBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';
      withdrawBtn.disabled = true;
      
      // Выполняем вывод через API
      const result = await this.walletApi.withdraw(
        this.withdrawState.selectedCrypto,
        amount,
        address
      );
      
      if (result.status === 'success') {
        this.showSuccess('Заявка на вывод отправлена успешно');
        
        // Очищаем форму
        amountInput.value = '';
        addressInput.value = '';
        this.withdrawState.selectedCrypto = null;
        this.withdrawState.selectedNetwork = null;
        
        // Обновляем историю транзакций
        await this.refreshTransactions();
        
        // Сбрасываем состояние формы
        this.resetWithdrawForm();
      } else {
        console.log('❌ Ошибка API при выводе:', result.msg);
      }
    } catch (error) {
      console.error('❌ Ошибка вывода:', error);
    } finally {
      // Восстанавливаем кнопку
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
    // Проверяем, не показывается ли уже ошибка
    const existingError = document.querySelector('.fixed.top-4.right-4.bg-red-600');
    if (existingError) {
      console.log('ℹ️ Ошибка уже показывается, пропускаю:', message);
      return;
    }
    
    console.log('❌ Показываю ошибку:', message);
    // Создаем уведомление об ошибке
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
    // Проверяем, не показывается ли уже уведомление об успехе
    const existingSuccess = document.querySelector('.fixed.top-4.right-4.bg-green-600');
    if (existingSuccess) {
      console.log('ℹ️ Уведомление об успехе уже показывается, пропускаю:', message);
      return;
    }
    
    console.log('✅ Показываю успех:', message);
    // Создаем уведомление об успехе
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
          console.log('Failed to copy address');
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
    console.log(`🔄 Рендерю опции криптовалют для ${containerId} (${formType})`);
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`❌ Контейнер ${containerId} не найден`);
      return;
    }
    container.innerHTML = '';
    const cryptos = formType === 'deposit' ? this.filteredCryptos : this.withdrawFilteredCryptos;
    console.log(`📊 Количество криптовалют для отображения: ${cryptos.length}`);
    console.log(`🔍 Список криптовалют:`, cryptos);
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
    console.log(`✅ Рендеринг опций криптовалют завершен для ${containerId}`);
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
    console.log(`🔄 Выбираю криптовалюту: ${symbol} (${formType})`);
    
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
    
    // Обновляем баланс при выборе криптовалюты для вывода
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
      console.log(`🔄 Загружаю сети для ${cryptoSymbol}...`);
  
      // 🚀 берём именно symbol из balances
      const networksData = await this.walletApi.getCurrencyNetworks(crypto.symbol);
      console.log(`📊 Полученные данные сетей для ${cryptoSymbol}:`, networksData);
  
      let networks = [];
      if (networksData.status === 'success' && networksData.networks) {
        // Согласно OpenAPI, networks - это массив строк
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
          // Fallback для случая, если networks - объект
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
      console.error(`❌ Ошибка загрузки сетей для ${cryptoSymbol}:`, error);
      
      // Проверяем, является ли ошибка связанной с авторизацией
      if (error.message.includes('401') || error.message.includes('Authorization')) {
        console.warn(`⚠️ Ошибка авторизации при загрузке сетей для ${cryptoSymbol}`);
        // Не показываем уведомление при загрузке
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
    console.log(`🔄 Выбираю сеть: ${network.name} для ${cryptoSymbol} (${formType})`);
    
    const state = formType === 'deposit' ? this.depositState : this.withdrawState;
    const selectId = formType === 'deposit' ? 'network-select' : 'withdraw-network-select';
    const select = this.selects.get(selectId);
    
    if (select) {
      select.input.value = network.name;
      select.isOpen = false;
      this.updateSelectVisibility(selectId);
      console.log(`✅ Обновлен селект сети: ${network.name}`);
    }
    
    state.selectedNetwork = network;
    console.log(`📝 Сохранена выбранная сеть в состоянии:`, network);
    
    // Принудительно обновляем контент при смене сети
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

  // Функция для принудительного обновления контента при смене сети
  async refreshContent(cryptoSymbol, network, formType) {
    console.log(`🔄 Обновляю контент для ${cryptoSymbol} на сети ${network.name} (${formType})`);
    
    if (formType === 'deposit') {
      // Обновляем детали депозита
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
          console.log(`✅ Обновлен элемент ${id}: ${value}`);
        }
      });
      
      // Обновляем адрес при смене сети
      await this.updateDepositAddress(cryptoSymbol, network);
      
    } else {
      // Обновляем детали вывода
      const elements = {
        'network-fee': network.networkFee,
        'min-withdraw': network.minWithdraw,
        'daily-limit': network.dailyLimit
      };
      
      Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
          console.log(`✅ Обновлен элемент ${id}: ${value}`);
        }
      });
      
      // Обновляем баланс
      await this.updateWithdrawBalance(cryptoSymbol);
      
      this.updateReceiveAmount();
    }
  }

  // Функция для обновления адреса депозита
  async updateDepositAddress(cryptoSymbol, network) {
    try {
      console.log(`🔄 Обновляю адрес для ${cryptoSymbol} на сети ${network.name}`);
      
      // Получаем новый адрес из API
      const walletData = await this.walletApi.getWalletInfo(cryptoSymbol);
      
      if (walletData.status === 'success' && walletData.address) {
        const addressInput = document.getElementById('deposit-address');
        if (addressInput) {
          addressInput.value = walletData.address;
          console.log(`✅ Обновлен адрес: ${walletData.address}`);
          
          // Генерируем новый QR код
          this.generateQRCode(walletData.address);
        }
      } else {
        console.warn(`⚠️ Не удалось получить адрес для ${cryptoSymbol}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка обновления адреса для ${cryptoSymbol}:`, error);
    }
  }

  // Функция для обновления баланса при выводе
  async updateWithdrawBalance(cryptoSymbol) {
    try {
      console.log(`🔄 Обновляю баланс для ${cryptoSymbol}`);
      
      // Получаем актуальный баланс из API
      const balancesData = await this.walletApi.getBalances();
      
      if (balancesData.status === 'success' && balancesData.balances && balancesData.balances[cryptoSymbol]) {
        const newBalance = balancesData.balances[cryptoSymbol];
        
        // Обновляем в локальных данных
        if (this.cryptoData[cryptoSymbol]) {
          this.cryptoData[cryptoSymbol].balance = newBalance;
        }
        
        // Обновляем отображение
        const balanceElement = document.getElementById('available-balance');
        const symbolElement = document.getElementById('available-symbol');
        
        if (balanceElement) {
          balanceElement.textContent = newBalance;
          console.log(`💰 Обновлен баланс: ${newBalance}`);
        }
        if (symbolElement) {
          symbolElement.textContent = cryptoSymbol;
          console.log(`🏷️ Обновлен символ: ${cryptoSymbol}`);
        }
      } else {
        console.warn(`⚠️ Не удалось получить баланс для ${cryptoSymbol}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка обновления баланса для ${cryptoSymbol}:`, error);
    }
  }

  async updateDepositDetails(cryptoSymbol, network) {
    try {
      console.log(`🔄 Загружаю информацию о кошельке для ${cryptoSymbol}...`);
      // Получаем информацию о кошельке из API
      const walletData = await this.walletApi.getWalletInfo(cryptoSymbol);
      console.log(`📊 Данные кошелька для ${cryptoSymbol}:`, walletData);
      
      if (walletData.status === 'success') {
        console.log(`✅ Успешно получен адрес: ${walletData.address}`);
        const addressInput = document.getElementById('deposit-address');
        if (addressInput) {
          addressInput.value = walletData.address || network.address;
          console.log(`📝 Установлен адрес в поле: ${addressInput.value}`);
        }
        
        // Обновляем баланс из API
        if (walletData.balance) {
          this.cryptoData[cryptoSymbol].balance = walletData.balance;
          console.log(`💰 Обновлен баланс: ${walletData.balance}`);
          // Обновляем отображение баланса если он показан на странице
          const balanceElement = document.getElementById('available-balance');
          if (balanceElement) {
            balanceElement.textContent = walletData.balance;
          }
        }
      } else {
        console.log(`❌ Ошибка API: ${walletData.msg || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('❌ Ошибка получения информации о кошельке:', error);
      // Не показываем ошибку пользователю, только в консоль
      // Fallback на статические данные
      const addressInput = document.getElementById('deposit-address');
      if (addressInput) {
        addressInput.value = network.address;
        console.log(`🔄 Использую fallback адрес: ${network.address}`);
      }
    }

    // Безопасно обновляем элементы с проверкой их существования
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
        console.log(`✅ Обновлен элемент ${id}: ${value}`);
      } else {
        console.warn(`⚠️ Элемент ${id} не найден`);
      }
    });
    
    const addressInput = document.getElementById('deposit-address');
    console.log(`🔍 Проверяю адрес для QR кода:`, addressInput);
    if (addressInput) {
      console.log(`📝 Значение адреса: "${addressInput.value}"`);
      if (addressInput.value) {
        console.log(`✅ Адрес найден, генерирую QR код`);
        this.generateQRCode(addressInput.value);
      } else {
        console.log(`❌ Адрес пустой, не могу сгенерировать QR код`);
      }
    } else {
      console.log(`❌ Элемент deposit-address не найден`);
    }
  }

  updateWithdrawDetails(cryptoSymbol, network) {
    // Безопасно обновляем элементы с проверкой их существования
    const elements = {
      'network-fee': network.networkFee,
      'min-withdraw': network.minWithdraw,
      'daily-limit': network.dailyLimit
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
        console.log(`✅ Обновлен элемент ${id}: ${value}`);
      } else {
        console.warn(`⚠️ Элемент ${id} не найден`);
      }
    });
    
    // Обновляем баланс
    const balanceElement = document.getElementById('available-balance');
    const symbolElement = document.getElementById('available-symbol');
    if (balanceElement && this.cryptoData[cryptoSymbol]) {
      balanceElement.textContent = this.cryptoData[cryptoSymbol].balance || '0';
      console.log(`💰 Обновлен баланс: ${this.cryptoData[cryptoSymbol].balance}`);
    }
    if (symbolElement) {
      symbolElement.textContent = cryptoSymbol;
      console.log(`🏷️ Обновлен символ: ${cryptoSymbol}`);
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
    console.log(`🔄 Генерирую QR код для адреса: ${address}`);
    const qrContainer = document.getElementById('qr-code');
    if (!qrContainer) {
      console.error('❌ Контейнер QR кода не найден');
      return;
    }
    if (!address) {
      console.error('❌ Адрес для QR кода не предоставлен');
      return;
    }

    console.log(`✅ Генерирую QR код для адреса: ${address}`);
    
    // Создаем простой QR код без внешних зависимостей
    const qrCode = this.createSimpleQRCode(address);
    
    qrContainer.innerHTML = `
      <div class="qr-code-container">
        <div class="qr-code-display w-32 h-32 mx-auto bg-white p-2 rounded">
          ${qrCode}
        </div>
        <div class="text-xs text-gray-400 mt-2 text-center break-all max-w-32">${address}</div>
      </div>
    `;
    console.log(`✅ QR код сгенерирован и отображен`);
  }

  // Простая функция для создания QR кода без внешних зависимостей
  createSimpleQRCode(text) {
    // Создаем простой паттерн QR кода (для демонстрации)
    const size = 8;
    let html = '<div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 1px; width: 100%; height: 100%;">';
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Создаем простой паттерн на основе текста
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
  
      // 🚀 берём либо transactions, либо data
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
      console.error('❌ Ошибка загрузки транзакций:', error);
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
    console.log('🔄 Начинаю загрузку транзакций...');
    const walletApi = new WalletApiService();
    const transactionsData = await walletApi.getTransactions();
    
    console.log('📊 Полученные данные транзакций:', transactionsData);
    
    if (transactionsData.status === 'success' && transactionsData.transactions && transactionsData.transactions.length > 0) {
      console.log(`✅ Найдено ${transactionsData.transactions.length} транзакций`);
      renderTransactionsTable(transactionsData.transactions);
    } else {
      console.log('ℹ️ Нет транзакций или пустой ответ');
      showEmptyTableState();
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки транзакций:', error);
    
    // Проверяем, является ли ошибка связанной с авторизацией
    if (error.message.includes('401') || error.message.includes('Authorization')) {
      console.warn('⚠️ Ошибка авторизации при загрузке транзакций');
      // Не показываем уведомление при загрузке
    }
    
    showEmptyTableState();
  }
}

function renderTransactionsTable(transactions) {
  console.log('🔄 Начинаю рендеринг таблицы транзакций...');
  console.log('📊 Полученные транзакции:', transactions);
  
  const depositsTableBody = document.getElementById('deposits-table-body');
  const withdrawalsTableBody = document.getElementById('withdrawals-table-body');
  
  console.log('🔍 Поиск элементов таблиц:');
  console.log('- depositsTableBody:', depositsTableBody);
  console.log('- withdrawalsTableBody:', withdrawalsTableBody);
  
  if (!depositsTableBody || !withdrawalsTableBody) {
    console.error('❌ Не найдены элементы таблиц транзакций');
    return;
  }
  
  // Разделяем транзакции на депозиты и выводы
  const deposits = transactions.filter(tx => tx.direction === 'in');
  const withdrawals = transactions.filter(tx => tx.direction === 'out');
  
  console.log('📊 Фильтрация транзакций:');
  console.log(`- Всего транзакций: ${transactions.length}`);
  console.log(`- Депозиты (in): ${deposits.length}`);
  console.log(`- Выводы (out): ${withdrawals.length}`);
  console.log('🔍 Примеры транзакций:');
  transactions.forEach((tx, index) => {
    console.log(`  ${index}: direction=${tx.direction}, currency=${tx.currency}, amount=${tx.amount}`);
  });
  
  // Рендерим депозиты
  console.log(`🔄 Рендерю ${deposits.length} депозитов...`);
  const depositsHTML = deposits.map((item, index) => {
    console.log(`📊 Обрабатываю депозит ${index + 1}:`, item);
    
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
    
    console.log(`✅ Строка депозита ${index + 1} сгенерирована`);
    return rowHTML;
  }).join('');
  
  depositsTableBody.innerHTML = depositsHTML;
  console.log(`✅ HTML депозитов установлен в таблицу`);
  
  // Рендерим выводы
  console.log(`🔄 Рендерю ${withdrawals.length} выводов...`);
  const withdrawalsHTML = withdrawals.map((item, index) => {
    console.log(`📊 Обрабатываю вывод ${index + 1}:`, item);
    
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
    
    console.log(`✅ Строка вывода ${index + 1} сгенерирована`);
    return rowHTML;
  }).join('');
  
  withdrawalsTableBody.innerHTML = withdrawalsHTML;
  console.log(`✅ HTML выводов установлен в таблицу`);
  
  console.log('✅ Рендеринг таблиц завершен');
  console.log(`- Депозиты отрендерены: ${deposits.length} записей`);
  console.log(`- Выводы отрендерены: ${withdrawals.length} записей`);
  
  // Проверяем, что таблицы действительно обновились
  const depositsTableBodyCheck = document.getElementById('deposits-table-body');
  const withdrawalsTableBodyCheck = document.getElementById('withdrawals-table-body');
  
  if (depositsTableBodyCheck) {
    console.log(`📊 Содержимое таблицы депозитов: ${depositsTableBodyCheck.children.length} строк`);
  }
  if (withdrawalsTableBodyCheck) {
    console.log(`📊 Содержимое таблицы выводов: ${withdrawalsTableBodyCheck.children.length} строк`);
  }
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
    // Показываем индикатор загрузки
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

    // Проверяем авторизацию
    console.log('🔐 Проверяю авторизацию...');
    try {
      const sessionResponse = await fetch('https://apiexchange.ymca.one/session', {
        method: 'GET',
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();
      console.log('📊 Данные сессии:', sessionData);
      
      if (sessionData.status !== 'success') {
        console.warn('⚠️ Пользователь не авторизован');
        // Не показываем уведомление при загрузке, только при ошибках API
      } else {
        console.log('✅ Пользователь авторизован');
      }
    } catch (error) {
      console.error('❌ Ошибка проверки сессии:', error);
    }

    const sidebarManager = new SidebarManager();
    sidebarManager.init();
      
    const fm = new FormManager();
    await fm.init();
    
    // Тестируем API без авторизации
    await testApiWithoutAuth();
    
    // Тестируем получение адреса кошелька
    await testWalletAddress();
    
    // Тестируем получение сетей
    await testNetworks();
    
    // Проверяем элементы HTML
    checkHTMLElements();
    
    // Тестируем QR код
    testQRCode();
    
    // Показываем все данные API в консоль
    await showAllApiData();
    
    // Загружаем транзакции из API
    await loadTransactionsFromApi();

  window.formManager = fm;
  window.sidebarManager = sidebarManager;
    
    // Добавляем метод для обновления транзакций в FormManager
    fm.refreshTransactions = async function() {
      await loadTransactionsFromApi();
    };
    
    // Добавляем глобальные функции для отладки
    window.showAllApiData = showAllApiData;
    window.testApiWithoutAuth = testApiWithoutAuth;
    window.testWalletAddress = testWalletAddress;
    window.testNetworks = testNetworks;
    window.forceRefreshTransactions = forceRefreshTransactions;
    window.forceRefreshAllData = forceRefreshAllData;
    window.checkHTMLElements = checkHTMLElements;
    window.testQRCode = testQRCode;
    window.showAuthNotification = showAuthNotification;
    window.walletApi = fm.walletApi;
    window.formManager = fm;
  } catch (error) {
    console.error('❌ Критическая ошибка при инициализации:', error);
    
    // Показываем критическую ошибку
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
    // Убираем индикатор загрузки
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
});
