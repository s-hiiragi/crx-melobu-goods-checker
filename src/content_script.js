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

function getProductIdFromUrl(url) {
    return new URL(url).searchParams.get('product_id');
}

async function main() {
    // 通常注文履歴ページ
    if (location.pathname === '/mypage/history.php') {
        const ids = Array.from(document.querySelectorAll('.history-detail__product-info tr:nth-child(1)>td')).map(e=>e.textContent.trim());
        await MyExtension.append_ordered_items({itemIds: ids});
        return;
    }

    // 通常注文履歴の注文の詳細情報ページ
    if (location.pathname === '/mypage/history_detail.php') {
        const ids = Array.from(document.querySelectorAll('.history-detail__product-info tr:nth-child(1)>td')).map(e=>e.textContent.trim());
        await MyExtension.append_ordered_items({itemIds: ids});
        return;
    }

    // 商品ページ
    if (location.pathname === '/detail/detail.php') {
        const productId = getProductIdFromUrl(location.href);

        const checkbox = document.createElement('div');
        checkbox.innerHTML = '<label><input type="checkbox">確認済み</label>';
        checkbox.querySelector('input[type="checkbox"]').onclick = async (ev) => {
            await MyExtension.update_checked_status({itemId: productId, checked: ev.target.checked});
        };
        document.querySelector('.item-favorite').appendChild(checkbox);

        checkbox.querySelector('input[type="checkbox"]').checked = (await MyExtension.query_checked_status({itemId: productId})).checked;

        // fallthrough
    }

    // チェック済みの商品をマーク
    {
        const checkedItems = (await MyExtension.query_checked_or_ordered_items()).itemIds;

        const productLinks = Array.from(document.querySelectorAll('a[href*="/detail/detail.php?product_id="]'));
        productLinks.forEach(a => {
            const id = getProductIdFromUrl(a.href);
            if (checkedItems.includes(id)) {
                a.style.opacity = '0.4';
            }
        });
    }
}

main();
