const util = require('util');
const fs = require('fs');
const rq = require('request');
const request = util.promisify(rq);
const sleep = util.promisify(setTimeout);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const vkcoinapi = require('node-vkcoinapi');
const CronJob = require('cron').CronJob;
const sort = require('fast-sort');

const settings = require('./settings');

let WinnersCount = 0;

const run = (async () => {

    let file = await readFile('./winners.json');
    let Winners = JSON.parse(file);

    const vkcoin = new vkcoinapi({
        key: settings.VKCOIN_MERCHANT,
        userId: settings.VK_ID,
        token: settings.VK_TOKEN,
    });

    console.log(`Устанавливаем планировщик отправки призов... `);
    new CronJob('*/1 * * * *', async function () {
        console.log(`Берем пользователей нашего сообщества ${settings.GROUP}...`);
        let users = await getGroupsUsers([settings.GROUP]);
        users = users.filter(item => !settings.GROUP_STAND_IGNORE.includes(item));

        console.log(`Выбираем победителя среди ${users.length} участников`);
        let randomIndex = Math.floor((Math.random() * users.length));
        let lucky = users[randomIndex];
        console.log(`... победителеем становится https://vk.com/id${lucky}`);

        let coinsAward = (Math.floor(Math.random() * settings.GROUP_STAND_REWARD) + 1) * 1000;
        await vkcoin.api.sendPayment(lucky, coinsAward);
        console.log(`Отправили награду победителю ${lucky}!`);

        Winners.push({
            "id": lucky,
            "type": "subscribe",
            "award": coinsAward,
            "time": Date.now()
        });

        try {
            await writeFile('./winners.json', JSON.stringify(Winners, null, 2));
        } catch (e) {
            console.log("Не смог сохранить победителя в файлик :(")
        }

        WinnersCount = Winners.length;
    }, null, true, 'Europe/Moscow');

    console.log(`Устанавливаем планировщик обновления таблицы в группе... `);
    new CronJob('15 */1 * * * *', async function () {
        console.log("Обновление таблички в группе");
        await updateWinnersWidget(Winners);
    }, null, true, 'Europe/Moscow');
});

async function getGroupsUsers(groups) {
    let vk_token = settings.VK_TOKEN;
    let users = [];
    for (let i = 0; i < groups.length; i++) {
        let res = await sendRequest(`https://api.vk.com/method/groups.getMembers?group_id=${groups[i]}&offset=0&fields=uid&sort=id_desc&version=5.95&access_token=${vk_token}`);
        res = JSON.parse(res.body);
        // console.log(res.response);
        await sleep(350);
        if (res.response && res.response.count > 0) {
            for (let j = 0; j < Math.ceil(res.response.count / 1000); j++) {
                let res = await sendRequest(`https://api.vk.com/method/groups.getMembers?group_id=${groups[i]}&offset=${j * 1000}&fields=uid&sort=id_desc&version=5.95&access_token=${vk_token}`);
                res = JSON.parse(res.body);
                await sleep(350);
                if (res.response && res.response.users) {
                    console.log(`Group: ${groups[i]} offset ${j * 1000}`);
                    for (let k = 0; k < res.response.users.length; k++) {
                        users.push(res.response.users[k].uid);
                    }
                }

            }
        }
    }
    return users;

}

async function getUsersInfo(users) {
    let vk_token = settings.VK_TOKEN;
    let res = await sendRequest(`https://api.vk.com/method/users.get?user_ids=${users.join(",")}&version=5.95&access_token=${vk_token}`);
    res = JSON.parse(res.body);

    // console.log(res);
    if (!res.response) {
        return null;
    }

    return res.response;
}

async function updateWinnersWidget(winners) {
    if (!winners) {
        return;
    }
    winners = winners.slice(-8);
    sort(winners).desc(w => w.time);

    let winnerIds = [];
    for (let i = 0; i < winners.length; i++) {
        winnerIds.push(winners[i].id);
    }

    let usersInfo = await getUsersInfo(winnerIds);

    let vk_token = settings.VK_WIDGET_TOKEN;
    let rows = [];
    console.log(winners.length);
    // return;

    for (let i = 0; i < winners.length; i++) {
        let winner = winners[i];


        let awardType = winner.type;
        if (awardType === "subscribe") {
            awardType = "Подписчик";
        } else if (awardType === "generator") {
            awardType = "Генератор";
        }


        let username = `id${winner.id}`;
        let findUser = usersInfo.filter(obj =>{return obj.uid === winner.id});
        if(findUser && findUser[0]){
            username = `${findUser[0].first_name} ${findUser[0].last_name}`
        }

        rows.push([
            {
                "text":`${username}`,
                "url": `https://vk.com/id${winner.id}`,
                "icon_id": `id${winner.id}`,
            },
            {
                "text": awardType,
            },
            {
                "text": formatCoins(winner.award),
            },
            {
                "text": new Date(winner.time).toLocaleTimeString('ru-RU'),
            },
        ]);
    }
    let data = {
        "title": "Раздач: ",
        "title_url": "https://vk.com/topic-181248257_42752671",
        "title_counter": WinnersCount,
        "more": "Участвовать в раздачах",
        "more_url": "https://vk.com/topic-181248257_42752671",
        "head": [
            {
                "text": "Победитель 🥇",
                "align": "left",
            },
            {
                "text": "Тип раздачи ⚡",
                "align": "left",
            },
            {
                "text": "Приз 💰",
                "align": "right",
            },
            {
                "text": "Время 💫",
                "align": "right",
            }
        ],
        "body": rows
    };


    let res = await sendRequest(`https://api.vk.com/method/appWidgets.update?code=return ${encodeURIComponent(JSON.stringify(data))}%3B&type=table&version=5.95&access_token=${vk_token}`);
}

async function sendRequest(url, type, data) {
    try {
        return await request({
            url: url,
            method: type,
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                "accept-language": "ru,en;q=0.9,uk;q=0.8,bg;q=0.7,und;q=0.6",
                "cache-control": "max-age=0",
                "upgrade-insecure-requests": "1"
            },
            body: data,
        });
    } catch (e) {
        console.log(e);
        return null;
    }

}

function formatCoins(coins) {
    coins = Number(coins);

    return (coins / 1000)
        .toLocaleString()
        .replace(/,/g, ' ')
        .replace(/\./g, ',');
}

run();