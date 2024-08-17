const MyExtension = new Proxy({}, {
    /**
     * @return {function(object): Promise<object>}
     */
    get(target, prop, receiver) {
        return (args) => {
            return chrome.runtime.sendMessage({command: prop, ...args});
        };
    }
});

async function main() {
    const checkedItemsArea = document.querySelector('#checked_items');
    const orderedItemsArea = document.querySelector('#ordered_items');

    const checkedItemIds = (await MyExtension.query_checked_items()).itemIds;
    const orderedItemIds = (await MyExtension.query_ordered_items()).itemIds;

    checkedItemsArea.value = checkedItemIds.join('\r\n') + '\r\n';
    orderedItemsArea.value = orderedItemIds.join('\r\n') + '\r\n';

    const replaceCheckedItemsButton = document.querySelector('#replace_checked_items');
    const replaceOrderedItemsButton = document.querySelector('#replace_ordered_items');

    replaceCheckedItemsButton.onclick = async () => {
        const ids = checkedItemsArea.value.trim().split(/\s+/);
        await MyExtension.replace_checked_items({itemIds: ids});
    };
    replaceOrderedItemsButton.onclick = async () => {
        const ids = orderedItemsArea.value.trim().split(/\s+/);
        await MyExtension.replace_ordered_items({itemIds: ids});
    };
}

main();
