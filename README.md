## vk-coin-market-presents
Штука, которая отправляет VK Coins случайным пользователям группы вконтакте.
Сделана на коленке, дропнута в паблик по просьбам.

- ```git clone https://github.com/asyven/vk-coin-market-presents.git```
- ```npm install```

| Настройка settings.js  | описание |
| ------------- | ------------- |
| VK_ID  | id пользователя вконтакте  |
| VK_TOKEN  | токен пользователя |
| VKCOIN_MERCHANT  | мерчант ключ vk coins |
| VK_WIDGET_TOKEN  | токен виджетов вконтакте |
| GROUP  | имя группы (изпользуемое в адресной строке) |
| GROUP_STAND_IGNORE  | пользователи, которые не должны побеждать (админы, модеры и тп.)  |
| GROUP_STAND_REWARD  | максимальная награда в коинах |

## Получения токена для виджета VK_WIDGET_TOKEN
1. [Создать приложение](https://vk.com/editapp?act=create) – Встраиваемое приложение – Приложение сообщества
1. Aдресом iframe укажите ваш сервер и папку, где лежит, [widget.html](https://github.com/asyven/vk-coin-market-presents/blob/master/widget.html) с этого репозитория
1. Зайдите в ваше Сообщество – меню Управление сообществом – Приложения – выберите там ваше свежесозданное приложение
1. Дайте ему разрешение на добавление виджетов
1. В поле увидите токен, его нужно установить в settings.js в свойство ```VK_WIDGET_TOKEN```
1. Тыкайте установить виджет, первый раз нужно установить табличку, чтобы потом можно было обновлять скриптом

## Токен приложения вконтакте VK_TOKEN
 - [Ссылка на токен от VK API](https://oauth.vk.com/authorize?client_id=3116505&scope=1073737727&redirect_uri=https://api.vk.com/blank.html&display=page&response_type=token&revoke=1)
 - можете изменить параметр scope, что бы давать не все разрешения (вот [тут](https://vkhost.github.io/) можете от других приложений взять)
 - полученый токен запишите в параметр ```VK_TOKEN```
 
## Merchant api VK Coin VKCOIN_MERCHANT

1. Перейдите по ссылке [vk.com/coin#create_merchant](vk.com/coin#create_merchant).
1. Нажмите создать ключ.
1. Ключ показывается только один раз, сохраните его в надежном месте.
1. Ключ нужно установить в settings.js в свойство ```VKCOIN_MERCHANT```



-------
 - Если есть вопросы или баги писать [сюда](https://github.com/asyven/vk-coin-market-presents/issues)
 - Если хочешь улучшить эти грабли делай пр [сюда](https://github.com/asyven/vk-coin-market-presents/pulls)
