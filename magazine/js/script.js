document.addEventListener('DOMContentLoaded', () => {
    // 検索ボタンのイベントリスナー
    const searchButton = document.querySelector('.search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            alert('検索機能は現在開発中です！');
            // 将来的には検索モーダル表示などの処理をここに記述
        });
    }

    // ニュースレターフォームのイベントリスナー
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault(); // ページの再読み込みを防ぐ

            const emailInput = newsletterForm.querySelector('.newsletter-input');
            const email = emailInput.value;

            if (email && email.includes('@') && email.includes('.')) {
                alert(`「${email}」でニュースレターに登録されました！`);
                emailInput.value = ''; // 入力欄をクリア
                // 将来的にはサーバーサイドにメールアドレスを送信する処理をここに記述
            } else {
                alert('有効なメールアドレスを入力してください。');
            }
        });
    }

    // ここに他のインタラクティブな機能のJavaScriptコードを追加できます。
    // 例:
    // - ハンバーガーメニューの開閉 (モバイル版を考慮する場合)
    // - スクロールアニメーション
    // - 画像カルーセルなど
});

document.addEventListener('DOMContentLoaded', () => {
    // 検索ボタンのイベントリスナー（既存）
    const searchButton = document.querySelector('.search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            alert('検索機能は現在開発中です！');
            // 将来的には検索モーダル表示などの処理をここに記述
        });
    }

    // ニュースレターフォームのイベントリスナー（既存）
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault(); // ページの再読み込みを防ぐ

            const emailInput = newsletterForm.querySelector('.newsletter-input');
            const email = emailInput.value;

            if (email && email.includes('@') && email.includes('.')) {
                alert(`「${email}」でニュースレターに登録されました！`);
                emailInput.value = ''; // 入力欄をクリア
                // 将来的にはサーバーサイドにメールアドレスを送信する処理をここに記述
            } else {
                alert('有効なメールアドレスを入力してください。');
            }
        });
    }

    // --- ここから追加 ---

    // 「詳細を見る」ボタンのイベントリスナー
    const readMoreButton = document.querySelector('.main-article .read-more-btn');
    const articleMainSection = document.querySelector('.article-body');

    if (readMoreButton && articleMainSection) {
        readMoreButton.addEventListener('click', (event) => {
            event.preventDefault(); // デフォルトのリンク動作（ページ遷移など）を停止

            // article-main の上端までスムーズスクロール
            articleMainSection.scrollIntoView({
                behavior: 'smooth' // スムーズスクロールを有効にする
            });
        });
    }

    // --- ここまで追加 ---
});