$(document).ready(function() {
    
    // --- グローバル変数 ---
    let allData = []; // case-study.json の全データを保持
    
    // フォーム関連
    const $form = $('#filter');
    const $count = $('#count');
    const $conditions = $('#conditions');
    const $conditionTemplate = $('#condition_template li');
    const $conditionSamples = $('#condition_samples');
    const $articleNone = $('#article-none');

    // データを描画するコンテナ
    const $container = $('#items-container');
    
    // フィルターのSelect要素
    const $selectType = $('select#filter_type');
    const $selectMethod = $('select#filter_method');
    const $selects = $('select#filter_type, select#filter_method');

    // --- 関数定義 ---

    /**
     * [case-study.json] のデータを元にカードを描画する関数
     */
    function renderData(items) {
        $container.empty();
        $count.text(items.length);
        $articleNone.toggle(items.length === 0);
        
        $.each(items, function(index, item) {
            
            let typeHtml = '';
            if (item.tags.type) {
                let typeText = $selectType.find(`option[value="${item.tags.type}"]`).data('original-text') || item.tags.type;
                typeHtml = `
                    <div>
                        <dt>業種：</dt>
                        <dd class="type" data-value="${item.tags.type}">${typeText}</dd>
                    </div>`;
            }
            
            let projectHtml = '';
            if (item.tags.project) {
                const projectTextMap = {
                    'topix_30': 'TOPIX Core30',
                    'topix_70': 'TOPIX Large70',
                    'topix_400': 'TOPIX Mid400',
                    'topix_s1': 'TOPIX Small 1',
                    'topix_s2': 'TOPIX Small 2'
                };
                let projectText = projectTextMap[item.tags.project] || item.tags.project;
                projectHtml = `
                    <div>
                        <dt>規模区分：</dt>
                        <dd class="project" data-value="${item.tags.project}">${projectText}</dd>
                    </div>`;
            }

            let methodsHtml = '';
            if (item.tags.method && item.tags.method.length > 0) {
                methodsHtml = item.tags.method.map(m => `<dd class="method" data-value="${m}"></dd>`).join('');
            }

            let logoHtml = '';
            let $modalContent = $(`<div>${item.modal_html}</div>`);
            let $logo = $modalContent.find('header .image.left img');
            if ($logo.length > 0) {
                logoHtml = $logo[0].outerHTML;
            }

            const cardHtml = `
                <article id="item-${item.id.replace('detail-', '')}" data-id="${item.id.replace('detail-', '')}" class="itembox">
                    <header data-details="#${item.id}" title="この企業の事例の詳細を開きます">
                        <p class="cat ${item.summary.toLowerCase().includes('分析手法') ? 'cat-method' : 'cat-counter'}">${item.summary.toLowerCase().includes('分析手法') ? '分析手法' : '対応策'}<span class="sr-only">の事例</span></p>
                        <figure class="image">
                            ${logoHtml}
                        </figure>
                        <h3>${item.title}</h3>
                    </header>
                    <div class="options search-text">
                        <dl class="tags types class search-tags">
                            ${typeHtml}
                            ${projectHtml}
                            <div hidden>
                                <dt>物理的リスクの種類：</dt>
                                ${methodsHtml}
                            </div>
                        </dl>
                        <dl class="summary">
                            <dt>取組概要</dt>
                            <dd>${item.summary}</dd>
                        </dl>
                    </div>
                    
                    <details id="details-${item.id.replace('detail-', '')}" data-id="${item.id.replace('detail-', '')}">
                        <summary class="btn-icon" data-fancybox="item" data-type="inline" data-src="#${item.id}">
                            <span class="sr-only">「${item.title}」についての詳細を</span>
                            <img src="https://adaptation-platform.nies.go.jp/moej/tcfd-scenario-analysis/img/ico/ico-open.svg" width="26" height="26" alt="開く">
                        </summary>
                        
                        <article id="${item.id}" class="container text details" data-id="${item.id.replace('detail-', '')}">
                            ${item.modal_html}
                        </article>
                    </details>
                </article>
            `;
            
            $container.append(cardHtml);
        });

        $('[data-fancybox="item"]').fancybox({
            baseClass: 'modal-case-study Case', // .Case クラスを付与
            smallBtn: false,
            afterShow: function(instance, current) {
                current.$content.find('.image img').css({
                    'max-width': '100%',
                    'height': 'auto',
                    'display': 'block'
                });
            }
        });
    }

    /**
     * ★★★ 連動フィルターの心臓部 ★★★
     * フィルターの状態が変更されるたびに呼び出される
     */
    function updateFiltersAndResults() {
        
        // 1. 現在の全フィルターの値を取得
        const currentTypes = $selectType.val() || [];
        const currentMethods = $selectMethod.val() || [];
        const query = $('input#filter_word').val().toLowerCase().split(/[\s,、。|]+/).filter(Boolean);

        // 2. 他フィルターの選択を考慮して、各フィルターの件数を再計算
        
        // (A) 「業種」の件数を計算
        //     (絞り込み条件: method, query)
        let typeCounts = {};
        let typeTotal = 0;
        const typeSubset = allData.filter(item => {
            if (currentMethods.length > 0 && !currentMethods.includes("")) {
                if (!item.tags.method || !item.tags.method.some(m => currentMethods.includes(m))) return false;
            }
            return true;
        });
        typeSubset.forEach(item => {
            if(item.tags.type) typeCounts[item.tags.type] = (typeCounts[item.tags.type] || 0) + 1;
        });
        typeTotal = typeSubset.length;
        
        // (B) 「物理的リスク」の件数を計算
        //     (絞り込み条件: type, query)
        let methodCounts = {};
        let methodTotal = 0;
        const methodSubset = allData.filter(item => {
            if (currentTypes.length > 0 && !currentTypes.includes("") && !currentTypes.includes(item.tags.type)) return false;
            return true;
        });
        methodSubset.forEach(item => {
            if (item.tags.method) {
                item.tags.method.forEach(method => {
                    methodCounts[method] = (methodCounts[method] || 0) + 1;
                });
            }
        });
        methodTotal = methodSubset.length;

        // 3. 各ドロップダウンの <option> を更新
        updateOptionCounts($selectType, typeCounts, typeTotal);
        updateOptionCounts($selectMethod, methodCounts, methodTotal);

        // 4. SumoSelectの表示をリロード（必須）
        $selectType[0].sumo.reload();
        $selectMethod[0].sumo.reload();

        // 5. 最終的な絞り込み結果を計算
        const filteredData = allData.filter(function(item) {
            if (currentTypes.length > 0 && !currentTypes.includes("") && !currentTypes.includes(item.tags.type)) return false;
            if (currentMethods.length > 0 && !currentMethods.includes("")) {
                if (!item.tags.method || !item.tags.method.some(m => currentMethods.includes(m))) return false;
            }
            
            if (query.length > 0) {
                const searchableText = [
                    item.title,
                    item.summary,
                    $(item.modal_html).text() 
                ].join(' ').toLowerCase();
                return query.every(q => searchableText.includes(q));
            }
            return true;
        });

        // 6. 絞り込んだデータで表を描画
        renderData(filteredData);
        // 7. 検索条件タグを更新
        updateConditionsDisplay(currentTypes, currentMethods, query);
    }

    /**
     * 検索条件タグの表示を更新する関数
     */
    function updateConditionsDisplay(types, methods, query) {
        $conditionSamples.empty();
        let hasCondition = false;
        
        const displayTypes = types.filter(v => v !== ""); 
        displayTypes.forEach(function(val) {
            const text = $selectType.find(`option[value="${val}"]`).data('original-text');
            addConditionTag(text, 'filter_type', val);
            hasCondition = true;
        });
        
        const displayMethods = methods.filter(v => v !== "");
        displayMethods.forEach(function(val) {
            const text = $selectMethod.find(`option[value="${val}"]`).data('original-text');
            addConditionTag(text, 'filter_method', val);
            hasCondition = true;
        });

        if (query.length > 0) {
            addConditionTag(query.join(' '), 'filter_word', query.join(' '));
            hasCondition = true;
        }
        $conditions.attr('aria-hidden', !hasCondition).toggle(hasCondition);
    }

    /**
     * 検索条件タグ（[x]ボタン付き）を追加するヘルパー関数
     */
    function addConditionTag(text, controlId, value) {
        const $tag = $conditionTemplate.clone();
        $tag.find('kbd').text(text);
        $tag.find('button')
            .attr('class', `unselect _${controlId}`)
            .val(value)
            .attr('title', `この「${text}」の検索条件を解除します`);
        $conditionSamples.append($tag);
    }

    /**
     * ★件数カウント用ヘルパー関数★
     * @param {jQuery} $select - 対象の <select> タグ
     * @param {Object} counts - カウント結果のオブジェクト
     * @param {number} totalCount - 全体の件数
     */
    function updateOptionCounts($select, counts, totalCount) {
        $select.find('option').each(function() {
            const $opt = $(this);
            const val = $opt.val();
            // data-original-text がなければ、現在のテキストを保存
            if (!$opt.data('original-text')) {
                $opt.data('original-text', $opt.text());
            }
            const originalText = $opt.data('original-text');

            if (val) { // "すべて選択" 以外
                const count = counts[val] || 0;
                $opt.text(`${originalText} (${count})`);
                $opt.prop('disabled', count === 0); // 0件なら disabled
            } else { // "すべて選択"
                $opt.text(`${originalText} (${totalCount})`);
            }
        });
    }
    
    // --- イベントリスナー設定 ---

    // フォームの検索ボタン（submit）またはEnterキー
    $form.on('submit', function(e) {
        e.preventDefault(); 
        updateFiltersAndResults(); // ★変更★
    });

    // ドロップダウンが変更されたら、フィルター連動処理を実行
    $selects.on('change', function() {
        updateFiltersAndResults(); // ★変更★
    });

    // フォームのリセットボタン
    $form.on('reset', function() {
        $('select[multiple]').each(function() {
            this.sumo.unSelectAll();
        });
        setTimeout(updateFiltersAndResults, 0); // ★変更★
    });

    // 検索条件タグの削除ボタン
    $conditions.on('click', 'button.unselect', function() {
        const $button = $(this);
        const controlId = $button.attr('class').replace('unselect _', '');
        const value = $button.val();

        if (controlId === 'filter_word') {
            $('input#filter_word').val('');
        } else {
            const $select = $(`#${controlId}`);
            if ($select.prop('multiple')) {
                $select[0].sumo.unSelectItem(value);
            }
        }
        updateFiltersAndResults(); // ★変更★
    });

    // カード内のタグクリック（動的に生成される要素のため 'body' に委任）
    $('body').on('click', '.search-tags dd[data-value]', function(e) {
        e.preventDefault();
        const $button = $(this);
        const value = $button.attr('data-value');
        
        if (value) {
            let $select;
            if ($button.hasClass('type')) $select = $('#filter_type');
            if ($button.hasClass('method')) $select = $('#filter_method');

            if ($select && $select.length > 0) {
                $select[0].sumo.selectItem(value); 
                updateFiltersAndResults(); // ★変更★
                
                $('html, body').animate({
                    scrollTop: $form.offset().top
                }, 400);
            }
        }
    });

    // --- ★★★ 初期化処理 (ロジック変更) ★★★ ---

    // 1. 最初に [case-study.json] を読み込む
    // (index.html と同じフォルダにあると仮定)
    $.getJSON('./case-study.json') 
        .done(function(data) {
            allData = data; // データをグローバル変数に保存

            // 2. SumoSelectを初期化 (この時点では件数は 0)
            $selectType.SumoSelect({
                placeholder: "業種",
                csvDispCount: 1,
                captionFormat: '業種',
                captionFormatAllSelected: '業種',
                outputAsCSV: true
            });
            $selectMethod.SumoSelect({
                placeholder: "物理的リスクの種類",
                csvDispCount: 1,
                captionFormat: '物理的リスクの種類',
                captionFormatAllSelected: '物理的リスクの種類',
                outputAsCSV: true
            });

            // 3. CSSで非表示にされている検索ボックスを「強制的に表示」
            $('#filter .input-group').css('display', 'flex');
            $('#filter .inputs').css('display', 'flex'); 
            $('#filter .SumoSelect').css('display', 'inline-block');

            // 4. ★フィルターの件数を更新し、最終的な表示を行う★
            updateFiltersAndResults();
        })
        .fail(function(jqXHR, textStatus, errorThrown) { 
            console.error('case-study.json の読み込みに失敗しました。', textStatus, errorThrown);
            $articleNone.text('データの読み込みに失敗しました。ファイルパスやJSONの形式を確認してください。').show();
        });
});