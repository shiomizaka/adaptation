document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement; // <html>要素

    if (!themeToggleButton) {
        console.warn('Theme toggle button not found. Make sure an element with id="theme-toggle" exists.');
        return;
    }

    // OSのカラースキーム変更を検知
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyThemeFromStorageOrOS = () => {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            htmlElement.classList.add('dark-theme');
        } else if (savedTheme === 'light') {
            htmlElement.classList.remove('dark-theme');
        } else {
            // localStorageに設定がない場合のみOSの設定を反映
            // ただし、このサイトのデフォルトはダークテーマなので、OSがライトでもダークを維持
            if (mediaQuery.matches) {
                 htmlElement.classList.add('dark-theme');
            } else {
                 // OSがライトモードの場合のデフォルト（サイトのデフォルトに合わせる）
                 htmlElement.classList.add('dark-theme');
            }
        }
    };

    // ページロード時にテーマを適用 (FOUC対策スクリプトが<head>で実行済みだが、ボタンの状態設定のためにここでも呼び出す)
    applyThemeFromStorageOrOS();

    // ボタンクリック時のイベントリスナー
    themeToggleButton.addEventListener('click', () => {
        // 現在のテーマを切り替える
        htmlElement.classList.toggle('dark-theme');

        // 切り替え後のテーマをlocalStorageに保存する
        if (htmlElement.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // OSのカラースキーム変更イベントをリッスン
    mediaQuery.addEventListener('change', event => {
        // ユーザーが手動でテーマを設定していない場合のみOS設定に同期
        if (!localStorage.getItem('theme')) { 
            if (event.matches) {
                htmlElement.classList.add('dark-theme');
            } else {
                // OSがライトモードになった場合（サイトのデフォルトはダーク）
                // ユーザーが手動でライトを選んでいない限り、ダークを維持
                // htmlElement.classList.remove('dark-theme'); // OSに追従させたい場合はコメント解除
            }
        }
    });
});