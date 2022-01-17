# Создание собственной NFT коллекции в Ethereum (ERC-721)

### Установка Truffle

https://trufflesuite.com/

```
npm install -g truffle
```
### Создание проекта

* Создание пустого проекта:
```
truffle init
```
* В папке __contracts__ будут храниться все ```.sol``` контракты проекта.
### Установка контрактов OpenZeppelin

ERC721: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol

```
npm install @openzeppelin/contracts
```

### Создание простого контракта коллекции на основе ERC-721

* Создадим контракт ```TestToken.sol``` в папке contracts:
```
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestToken is ERC721 {
    
    address _owner;

    // tokenId => цена
    mapping (uint256 => uint256) public _offeredForSale;

    constructor() ERC721("Test Token", "TST") {
        _owner = msg.sender;
    }

    function mintProtect(address to, uint256 tokenId, string memory tokenURI) public {
        require(_owner = msg.sender, "Not owner");
        _mint(to,tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function sellToken(uint256 tokenId, uint256 price) public{
        require(_exists(tokenId), "Not exists");
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(_offeredForSale[tokenId] == 0, "On offer");
        require(price > 0, "Low price");

        _offeredForSale[tokenId] = price;
    }

    function buyToken(uint256 tokenId) public payable{
        require(msg.value > _offeredForSale[tokenId], "Low value");
        require(_exists(tokenId), "Not exists");
        require(_offeredForSale[tokenId] != 0, "Not on offer");

        address seller = ownerOf(tokenId);
        delete _offeredForSale[tokenId];
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);
    }

    function onSale(uint256 tokenId) public view returns (bool) {
        return _offeredForSale[tokenId] != 0;
    }
}
```
### Компиляция контрактов

Находясь в директории проекта вызвать команду __truffle__ для компиляции:

```
truffle compile
```
* __BIN__ и __ABI__ хранятся в json файлах в папке __build__.

### Генерация seed-phrase
* Установка ```mnemonics```:
```
npm install mnemonics
```
* Генерация сид-фразы:
```
npx mnemonics
```
* Сохраняем фразу в любое удобное место например ```mnemonics/master_seed.json```. С помощью этой фразы можно управлять своим __HDWalletProvider__.

### Установка HDWalletProvider и PrivateKeyProvider

* Установка __HDWalletProvider__ (Позволяет нам разблокировать учетные записи, используя мнемоническую фразу из двенадцати слов и подключиться к узлу Ethereum):
```
npm install @truffle/hdwallet-provider
```

* Установка __PrivateKeyProvider__ (Позволяет нам подключиться к узлу Ethereum, используя приватный ключ, например от аккаунта __MetaMask__):
```
npm install truffle-privatekey-provider
```

### Создание проекта на infura.io
* __Infura__ – это кластер узлов, который соединяет интерфейс пользователя (UI) dApps с внешним смарт-контрактом на блокчейне Ethereum. Провайдер Infura может обрабатывать подписание транзакции, а также подключение к сети Ethereum без необходимости синхронизировать ноду.

* Сохраняем __ropsten end-point__ для подключения к сети __Ropsten__:
```
https://ropsten.infura.io/v3/073c2f15d32e48b199671b57f9a87e7a
```

### Настройка truffle-config.js

* Пример настройки truffle-config.js:
```
const HDWalletProvider = require('@truffle/hdwallet-provider');
const PrivateKeyProvider = require("truffle-privatekey-provider");

// Сид-фраза для HDWalletProvider
const mnemonic = require("./mnemonics/master_seed.json").mnemonic;
// Приватный ключ аккаунта MetaMask
const privateKey = "";

module.exports = {
  networks: {
    // Подключение к сети ropsten через наш HDWalletProvider, используя первую учетную запись
    ropsten_hd: {
    provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/073c2f15d32e48b199671b57f9a87e7a`, 1),
    network_id: 3,       // Ropsten's id
    confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },

    // Подключение к сети ropsten через приватный ключ из метамаска
    ropsten_metamask: {
    provider: () => new PrivateKeyProvider(privateKey, "https://ropsten.infura.io/v3/073c2f15d32e48b199671b57f9a87e7a"),
    network_id: 3,       // Ropsten's id
    confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    }
  },

  mocha: {
  },

  compilers: {
    solc: {
      version: "0.8.11",
    }
  },
};

```

### Настройка файлов деплоя
* За деплой контарктов отвечают скрипты в папке __migrations__. Создадим новый файл __2_deploy_erc.js__, файл __1_initial_migration.js__ не трогаем. Нумерация в названиях важна, она определяет порядок деплоя контрактов.
* Пример __2_deploy_erc.js__:
```
const TestToken = artifacts.require("TestToken");

module.exports = function (deployer) {
  deployer.deploy(TestToken);
};

```

### Деплой контракта с помощью HDWalletProvider
* Подключаемся к сети через консоль:
```
truffle console --network ropsten_hd
```
* Узнаем адреса наших учетных записей:
```
web3.eth.getAccounts()

// Получаем список всех адресов, приватный ключ которых совпадает с нашей сид-фразой.
// Так как мы указали использовать первый адрес в truffle-config.js, тут
//
// provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/073c2f15d32e48b199671b57f9a87e7a`, <НОМЕР_АДРЕСА_В_МАССИВЕ_НАЧИНАЯ_С_ЕДИНИЦЫ>),
//
// то его следует пополнить тестовыми ETH, так как он будет деплоить все наши контракты.

[
  '0x93E6E5bf54B2eF9e8973F47F06c0C78eEf54c88c',
  '0x05C22884bd9529E88348665C8c97D96EebC9679c',
  '0x9C618f579041f2200262b6731d76597A25416D58',
  '0x1e2FF8660e85d92D1143d753f7e833F34b2B3c3e',
  '0x5340574C2Ca5Fd31336b6F43c639B55961407E1B',
  '0x89AA75387031421658bC2C1F6060B965825bf35f',
  '0x5547f953E18186F4759625f423939d25444f603C',
  '0xD2C50730B1A10905A30Ef2878dEbE4AD0E0F4CA9',
  '0xB955122b29B718Ce4b13146b82B9bF7207761aF8',
  '0x1f9f5745EF8cA258A31e47789994080498D76ac4'
]
```
* Когда на счету этого адреса имеется достаточно средств, можно начинать деплой. Для этого находясь в консоли достаточно вызвать команду ```migrate```.

### Создание экземпляра контракта
* Для того чтобы управлять контрактом нужно создать его __экземпляр__:
```
let TestToken = await TestToken.deployed()
undefined // значит все прошло успешно
```
### Минтинг новых токенов
* Теперь мы можем вызывать функцию минта нашего контракта:
```
TestToken.mintProtect("<адрес_владельца_токенаs", <id_токена>)
```
* Можно проверить владельца этого токена:
```
TestToken.ownerOf(<id_токена>)
```
### Продажа токена
* Для того чтобы продать токен нужно создать транзакцию от имени владельца, для это используем __PrivateKeyProvider__:
    * Копируем приватный ключ из __MetaMask__ (не сид-фразу). Вставляем его в поле privateKey в __truffle-config.json__.
* Подключаемся к сети от адреса нашего аккаунта __MetaMask__:
```
truffle console --network ropsten_metamask //наша сеть из конфига
```
* Создаем экземпляр контракта и вызываем метод ```sellToken```:
```
let TestToken = await TestToken.deployed()

TestToken.sellToken(<id_токена>, <цена>)
```
* Проверить состояние токена можно с помощью функции ```onSale```:
```
TestToken.onSale(<id_токена>)
true // токен на продаже
false // токен не на продаже
```

### Покупка токена
* Чтобы купить токен нужно проделать все тоже самое что и с продажей. Подключаемся к сети через приватный ключ другого кошелька, и вызываем функцию ```buyToken```:
```
let TestToken = await TestToken.deployed()

TestToken.buyToken(<id_токена>, {from: "<адрес_аккаунта_покупателя>", value: <сумма_оплаты_в_wei>})
```
