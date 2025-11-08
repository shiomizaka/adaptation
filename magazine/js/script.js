document.addEventListener('DOMContentLoaded', () => {
    
    // 検索ボタン (全ページ共通の可能性)
    const searchButton = document.querySelector('.search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            alert('検索機能は現在開発中です！');
        });
    }

    // ニュースレターフォーム (index.html, article.html 共通)
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault(); 
            const emailInput = newsletterForm.querySelector('.newsletter-input');
            const email = emailInput.value;

            if (email && email.includes('@') && email.includes('.')) {
                alert(`「${email}」でニュースレターに登録されました！`);
                emailInput.value = '';
            } else {
                alert('有効なメールアドレスを入力してください。');
            }
        });
    }

    // 「詳細を見る」ボタン (article.html のみ)
    const readMoreButton = document.querySelector('.main-article .read-more-btn');
    const articleBodySection = document.querySelector('.article-body'); // スクロール先を .article-body に変更

    if (readMoreButton && articleBodySection) {
        readMoreButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            
            // .article-body の上端までスムーズスクロール
            articleBodySection.scrollIntoView({
                behavior: 'smooth' 
            });
        });
    }

    // チャットボット (index.html のみ)
    const toggleButton = document.getElementById('chatbot-toggle-button');
    const widget = document.getElementById('chatbot-widget');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    // チャットボットの要素がすべて存在する場合のみ初期化
    if (toggleButton && widget && form && input && messagesContainer) {
        
        // チャットウィジェットの表示・非表示を切り替え
        toggleButton.addEventListener('click', function() {
            widget.classList.toggle('open');
        });

        // フォーム送信時の処理
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // ページのリロードを防ぐ
            const userMessage = input.value.trim();

            if (userMessage) {
                // ユーザーのメッセージを表示
                addMessage(userMessage, 'user');
                input.value = ''; // 入力欄をクリア
                
                // ボットの応答をシミュレート
                simulateBotResponse(userMessage);
            }
        });

        // メッセージをチャットに追加する関数
        function addMessage(text, type) {
            const messageContainerEl = document.createElement('div');
            messageContainerEl.className = 'message-container';

            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}`;
            messageElement.textContent = text;
            
            messageContainerEl.appendChild(messageElement);
            messagesContainer.appendChild(messageContainerEl);

            // 自動で一番下までスクロール
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // ボットの応答をシミュレートする関数
        function simulateBotResponse(userMessage) {
            // (ダミーの応答)
            setTimeout(() => {
                addMessage('ご質問ありがとうございます。現在、AIが回答を準備しています。', 'bot');
            }, 1000);
        }
    }

});