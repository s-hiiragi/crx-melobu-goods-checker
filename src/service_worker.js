class Repository {
    async __load(key) {
        const result = await chrome.storage.local.get([key]);
        return result[key];
    }

    async __save(key, val) {
        await chrome.storage.local.set({[key]: val});
    }


    async _getCheckedItemIds() { return await this.__load('checkedItemIds') ?? []; }
    async _setCheckedItemIds(ids) { await this.__save('checkedItemIds', ids); }
    async _getOrderedItemIds() { return await this.__load('orderedItemIds') ?? []; }
    async _setOrderedItemIds(ids) { await this.__save('orderedItemIds', ids); }


    async query_checked_or_ordered_items() {
        const checkedItemIds = await this._getCheckedItemIds();
        const orderedItemIds = await this._getOrderedItemIds();
        return [...checkedItemIds, ...orderedItemIds];
    }

    async query_checked_items() {
        return await this._getCheckedItemIds();
    }

    async replace_checked_items(itemIds) {
        await this._setCheckedItemIds(itemIds);
    }

    async query_checked_status(itemId) {
        const checkedItemIds = await this._getCheckedItemIds();
        return checkedItemIds.includes(itemId);
    }

    async update_checked_status(itemId, checked) {
        const checkedItemIds = await this._getCheckedItemIds();
        const index = checkedItemIds.indexOf(itemId);
        if (checked) {
            if (index === -1) {
                checkedItemIds.push(itemId);
                await this._setCheckedItemIds(checkedItemIds);
            }
        } else {
            if (index !== -1) {
                checkedItemIds.splice(index, 1);
                await this._setCheckedItemIds(checkedItemIds);
            }
        }
    }

    async query_ordered_items() {
        return await this._getOrderedItemIds();
    }

    async replace_ordered_items(itemIds) {
        await this._setOrderedItemIds(itemIds);
    }

    async append_ordered_items(itemIds) {
        const orderedItemIds = await this._getOrderedItemIds();
        const newItemIds = itemIds.filter(id => !orderedItemIds.includes(id));
        await this._setOrderedItemIds([...orderedItemIds, ...newItemIds]);
    }
}


async function query_checked_or_ordered_items() {
    const itemIds = await new Repository().query_checked_or_ordered_items();
    return ({ itemIds: itemIds });
}

async function query_checked_items() {
    const itemIds = await new Repository().query_checked_items();
    return ({ itemIds: itemIds });
}

async function replace_checked_items(itemIds) {
    await new Repository().replace_checked_items(itemIds);
}

async function query_checked_status(itemId) {
    const itemIds = await new Repository().query_checked_items();
    const checked = itemIds.includes(itemId);
    return ({ checked: checked });
}

async function update_checked_status(itemId, status) {
    await new Repository().update_checked_status(itemId, status);
}

async function query_ordered_items() {
    const itemIds = await new Repository().query_ordered_items();
    return ({ itemIds: itemIds });
}

async function replace_ordered_items(itemIds) {
    await new Repository().replace_ordered_items(itemIds);
}

async function append_ordered_items(itemIds) {
    await new Repository().append_ordered_items(itemIds);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('onMessage', message?.command, message, sender);

    const sendResponseWrapper = (result) => {
        console.log('sendResponse', result);
        sendResponse(result);
    };

    switch (message.command)
    {
    case 'query_checked_or_ordered_items':
        query_checked_or_ordered_items().then(sendResponseWrapper);
        break;
    case 'query_checked_items':  // For options page
        query_checked_items().then(sendResponseWrapper);
        break;
    case 'replace_checked_items':  // For options page
        replace_checked_items(message.itemIds).then(sendResponseWrapper);
        break;
    case 'query_checked_status':
        query_checked_status(message.itemId).then(sendResponseWrapper);
        break;
    case 'update_checked_status':
        update_checked_status(message.itemId, message.checked).then(sendResponseWrapper);
        break;
    case 'query_ordered_items':  // For options page
        query_ordered_items().then(sendResponseWrapper);
        break;
    case 'replace_ordered_items':  // For options page
        replace_ordered_items(message.itemIds).then(sendResponseWrapper);
        break;
    case 'append_ordered_items':
        append_ordered_items(message.itemIds).then(sendResponseWrapper);
        break;
    }

    return true;
});
