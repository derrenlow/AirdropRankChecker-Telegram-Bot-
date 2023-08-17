require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const teleKey = process.env.TELE_TOKEN;
const Tbot = new TelegramBot(teleKey, { polling: true });
const zklistadder = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [[
            {
                text: '🧩 Update/Add ZkSync List',
                callback_data: 'zkaddlist'
            },
            {
                text: '🗒️ Check ZkSync List',
                callback_data: 'zkchecklist'
            }
        ], [
            {
                text: '🏃 Run ZkSync List',
                callback_data: 'runzksynclist'
            },
            {
                text: '⌨️ Menu',
                callback_data: 'menu'
            }]]
    }
};
const l0adder = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [[
            {
                text: '🧩 Update/Add L0 List',
                callback_data: 'l0addlist'
            },
            {
                text: '🗒️ Check L0 List',
                callback_data: 'l0checklist'
            }
        ], [
            {
                text: '🏃 Run L0 List',
                callback_data: 'runl0list'
            },
            {
                text: '⌨️ Menu',
                callback_data: 'menu'
            }]]
    }
};
const menu = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [[
            {
                text: 'ZKSync List',
                callback_data: 'zkchecklist'
            },
            {
                text: 'LayerZero List',
                callback_data: 'l0checklist'
            }

        ]]
    }
};
Tbot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    switch (action) {
        case 'menu':
            Tbot.sendMessage(msg.chat.id, 'Start menu', menu);
            break;
        case 'zkchecklist':
            await zkchecklist(msg.chat.id);
            break;
        case 'zkaddlist':
            await addlist(msg.chat.id, 'zksync');
            break;
        case 'l0checklist':
            await l0checklist(msg.chat.id);
            break;
        case 'l0addlist':
            await addlist(msg.chat.id, 'l0');
            break;
        case 'runzksynclist':
            await runzksync(msg.chat.id);
            break;
        case 'runl0list':
            await runl0(msg.chat.id);
            break;
    }
});
//ZkSync Adding list of wallets (Saved by id)
async function zkaddlist(anonid, json) {
    try {
        const zksyncjson = require('./JSON/zksync.json');
        let list = addlist(anonid);
        let checker = false;
        zksyncjson.account.forEach(acc => {
            if (acc.profile == anonid) {
                acc.data = json;
                checker = true;
            }
        });
        if (checker == false) {
            if (list != 0) {
                zksyncjson.account.push({ profile: `${anonid}`, data: json });
            }
        }
        await writeJson(anonid, zksyncjson, `zksync.json`);
    } catch (e) { }
}
//L0 Adding list of  wallets (Saved by id)
async function l0addlist(anonid, json) {
    try {
        const l0json = require('./JSON/l0address.json');
        let list = addlist(anonid);
        let checker = false;
        l0json.account.forEach(acc => {
            if (acc.profile == anonid) {
                acc.data = json;
                checker = true;
            }
        });
        if (checker == false) {
            if (list != 0) {
                l0json.account.push({ profile: `${anonid}`, data: json });
            }
        }
        await writeJson(anonid, l0json, `l0address.json`);
    } catch (e) { }
}
//Saving Json File into server
async function writeJson(anonid, json, file) {
    const updatedJsonData = JSON.stringify(json);
    fs.writeFile(`./JSON/${file}`, updatedJsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        if (file == 'zksync.json') {
            Tbot.sendMessage(anonid, `Successfully updated the list`, zklistadder);
        } else if (file == 'l0address.json') {
            Tbot.sendMessage(anonid, `Successfully updated the list`, l0adder);
        }

    });
}
//Checking L0 Config file for specific list
async function l0checklist(anonid) {
    const l0json = require('./JSON/l0address.json');
    let checker = false;
    l0json.account.forEach(acc => {
        if (acc.profile == anonid) {
            let output = 'List Of Wallets:\n\n';
            acc.data.forEach(wallet => {
                output += `*Name:* [${wallet.name}](https://debank.com/profile/${wallet.address})\n*Address:* ${wallet.address}\n`;
            });
            Tbot.sendMessage(anonid, output, l0adder);
            checker = true;
        }
    });
    if (checker == false) {
        Tbot.sendMessage(anonid, 'No LayerZero list found please add/update a list', l0adder);
    }
}
//Checking ZkSync Config file for specific list
async function zkchecklist(anonid) {
    const zkjson = require('./JSON/zksync.json');
    let checker = false;
    zkjson.account.forEach(acc => {
        if (acc.profile == anonid) {
            let output = 'List Of Wallets:\n\n';
            acc.data.forEach(wallet => {
                output += `*Name:* [${wallet.name}](https://debank.com/profile/${wallet.address})\n*Address:* ${wallet.address}\n`;
            });
            Tbot.sendMessage(anonid, output, zklistadder);
            checker = true;
        }
    });
    if (checker == false) {
        Tbot.sendMessage(anonid, 'No ZkSync list found please add/update a list', zklistadder);
    }
}
//NFT Co-Pilot
async function l0callRank(address) {
    const payload = { address: address };
    const options = {
        url: 'https://api.nftcopilot.com/layer-zero-rank/check',
        method: 'POST',
        data: payload
    };
    let data = axios.request(options, payload).then(result => {
        return result.data;
    });
    return data;
}
//Trust Go
async function gettrustGo(address) {
    const sybiloption = {
        url: 'https://mp.trustalabs.ai/zksyncera/sybil_info?account=' + address + '&chainId=324',
        method: 'GET'
    };
    const scoreoption = {
        url: 'https://mp.trustalabs.ai/zksyncera/score?account=' + address + '&chainId=324',
        method: 'GET',
    };
    const balanceoption = {
        url: 'https://mp.trustalabs.ai/debank/account_balance?account=' + address + '&chainId=324',
        method: 'GET'
    };
    const batchoption = {
        url: 'https://mp.trustalabs.ai/zksyncera/batch_query?account=' + address + '&chainId=324',
        method: 'GET'
    };
    let sybil = await axios.request(sybiloption).then(result => {
        return result.data;
    });
    let scoredata = await axios.request(scoreoption).then(result => {
        //console.log(result.data);
        return result.data;
    });
    let balance = await axios.request(balanceoption).then(result => {
        return result.data;
    });
    let batch = await axios.request(batchoption).then(result => {
        return result.data;
    });
    let output = { sybil: sybil.success, score: scoredata.data.score, rank: scoredata.data.rankValue.rank, totalrank: scoredata.data.rankValue.total, activedays: batch.data[0].activeDays, activeweeks: batch.data[0].activeWeeks, activemonth: batch.data[0].activeMonths, volume: batch.data[0].usdVolume, balance: balance.data.usd_value };
    return output;
}
//Checking list of L0
async function checklayerzero(l0json, anonid) {
    try {
        let output = '';
        for (let l = 0; l < l0json.data.length; l++) {
            let data = l0json.data[l];
            let result = await l0callRank(data.address);
            output += `*Name:* [${data.name}](https://debank.com/profile/${data.address})\n*Rank:* ${result.rank}\n*Txn Count:* ${result.txsCount}\n*Network Count:* ${result.networks}\n*Volume:* ${result.volume}\n*Top ${result.topFinal}%*\n---------------------------\n`;
        }
        Tbot.sendMessage(anonid, output, l0adder);
    } catch (e) { }
}
//Checking list of Zk
async function checkzksync(zkjson, anonid) {
    try {
        let output = '';
        for (let l = 0; l < zkjson.data.length; l++) {
            let data = zkjson.data[l];
            let result = await gettrustGo(data.address);
            output += `*Name:* [${data.name}](https://debank.com/profile/${data.address})\n*Non-Sybil:* ${result.sybil}\n*Current Balance(USD):* $${parseFloat(result.balance).toFixed(2)}\n*Score:* ${parseFloat(result.score).toFixed(2)}\n*Rank:* ${result.rank} / ${result.totalrank} (Top ${Math.trunc((result.rank / result.totalrank) * 100)}%)\n*Active Days:* ${Math.trunc(result.activedays)}\n*Active Week:* ${Math.trunc(result.activeweeks)}\n*Active Month:* ${Math.trunc(result.activemonth)}\n*Total Volume:* $${parseFloat(result.volume).toFixed(2)}\n---------------------------------------\n`;
        }
        Tbot.sendMessage(anonid, output, zklistadder);
    } catch (e) { }
}
//checking 1 Zk account
async function checkIndiZK(anonchatid) {
    try {
        const add = await Tbot.sendMessage(anonchatid, `Please key in the ZkSync address you would want to scan`, { reply_markup: { force_reply: true } });
        await Tbot.onReplyToMessage(anonchatid, add.message_id, async (res) => {
            try {
                let address = res.text;
                let result = await gettrustGo(address);
                let output = `Powered by [TrustGo](https://trustgo.trustalabs.ai/dashboard)\n\n*Name:* [${address}](https://debank.com/profile/${address})\n*Non-Sybil:* ${result.sybil}\n*Current Balance(USD):* $${parseFloat(result.balance).toFixed(2)}\n*Score:* ${parseFloat(result.score).toFixed(2)}\n*Rank:* ${result.rank} / ${result.totalrank} (Top ${Math.trunc((result.rank / result.totalrank) * 100)}%)\n*Active Days:* ${Math.trunc(result.activedays)}\n*Active Week:* ${Math.trunc(result.activeweeks)}\n*Active Month:* ${Math.trunc(result.activemonth)}\n*Total Volume:* $${parseFloat(result.volume).toFixed(2)}`;
                Tbot.sendMessage(anonchatid, output, { parse_mode: 'Markdown' });
            } catch (e) { Tbot.sendMessage(anonchatid, '*Error:* Please type in /checkzks (Address)', { parse_mode: 'Markdown' }); }
        });
    } catch (e) { }
}
//Checking 1 L0 account
async function checkIndiLayerZero(anonchatid) {
    try {
        const add = await Tbot.sendMessage(anonchatid, `Please key in the LayerZero address you would want to scan`, { reply_markup: { force_reply: true } });
        await Tbot.onReplyToMessage(anonchatid, add.message_id, async (res) => {
            try {
                let address = res.text;
                let result = await l0callRank(address);
                let output = `Powered by [NFT Co-Pilot](https://nftcopilot.com/layer-zero-rank-check)\n\n*Name:* [${address}](https://debank.com/profile/${address})\n*Rank:* ${result.rank}\n*Txn Count:* ${result.txsCount}\n*Network Count:* ${result.networks}\n*Volume:* ${result.volume}\n*Top ${result.topFinal}%*`;
                Tbot.sendMessage(anonchatid, output, { parse_mode: 'Markdown' });
            } catch (e) { Tbot.sendMessage(anonchatid, '*Error:* Please type in a valid address', { parse_mode: 'Markdown' }); }
        });
    } catch (e) { }
}
//Checking list of ZkSync Account
async function runzksync(anonid) {
    const zkjson = require('./JSON/zksync.json');
    let checker = false;
    zkjson.account.forEach(acc => {
        if (acc.profile == anonid) {
            checkzksync(acc, anonid);
            checker = true;
        }
    });
    if (checker == false) {
        Tbot.sendMessage(anonid, 'Error please check if you have a list added', zklistadder);
    }
}
//Checking list of L0 Account
async function runl0(anonid) {
    const l0json = require('./JSON/l0address.json');
    let checker = false;
    l0json.account.forEach(acc => {
        if (acc.profile == anonid) {
            checklayerzero(acc, anonid);
            checker = true;
        }
    });
    if (checker == false) {
        Tbot.sendMessage(anonid, 'Error please check if you have a list added', l0adder);
    }
}
async function addlist(anonchatid, file) {
    try {
        const add = await Tbot.sendMessage(anonchatid, `Updating your ${file} List please do it in this format name:address e.g\n\nAccount-1:0x06991e6414db9f6f942e2aa954045710fcfac13\nAccount-2:0x32ec2c55f915cad0a274d91159059dd1c74de6ee`, { reply_markup: { force_reply: true } });
        await Tbot.onReplyToMessage(anonchatid, add.message_id, async (result) => {
            let data = [];
            let checker = true;
            const text = result.text;
            const splitwallet = text.split('\n');
            try {
                checker = splitwallet.forEach(acc => {
                    let walletarr = acc.split(':');
                    let name = walletarr[0];
                    let add = walletarr[1];
                    if ((add == undefined) || (walletarr == undefined) || (!add.startsWith('0x'))) {
                        return false;
                    }
                    data.push({ name: name, address: add });
                });
            } catch (e) { }
            if ((checker == false) || (data.length == 0)) {
                Tbot.sendMessage(anonchatid, `Error adding list please check again`);
            } else {
                if (file == 'zksync') {
                    await zkaddlist(anonchatid, data);
                } else if (file == 'l0') {
                    await l0addlist(anonchatid, data);
                }
                return data;
            }
        });
    } catch (e) { }
}
//To check individual zksync wallet
Tbot.onText(/\/checkzks/, async (msg) => {
    try {
        const anonchatid = msg.from.id;
        await checkIndiZK(anonchatid);
    } catch (e) { }
});
//To check individual LayerZero wallet
Tbot.onText(/\/checkl0/, async (msg) => {
    try {
        const anonchatid = msg.from.id;
        await checkIndiLayerZero(anonchatid);
    } catch (e) { }
});
Tbot.onText(/\/menu/, async (msg) => {
    try {
        const anonchatid = msg.from.id;
        Tbot.sendMessage(anonchatid, 'Start menu', menu);
    } catch (e) { }
});