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
            baseClass: 'modal-case-study Case',
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
     * 連動フィルターの心臓部
     */
    function updateFiltersAndResults() {
        
        // 1. 現在の全フィルターの値を取得
        const currentTypes = $selectType.val() || [];
        const currentMethods = $selectMethod.val() || [];
        const query = $('input#filter_word').val(); // URL用に加工前のqを取得
        const processedQuery = query.toLowerCase().split(/[\s,、。|]+/).filter(Boolean);

        // 2. 他フィルターの選択を考慮して、各フィルターの件数を再計算
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

        // 4. SumoSelectの表示をリロード
        $selectType[0].sumo.reload();
        $selectMethod[0].sumo.reload();

        // 5. 最終的な絞り込み結果を計算
        const filteredData = allData.filter(function(item) {
            if (currentTypes.length > 0 && !currentTypes.includes("") && !currentTypes.includes(item.tags.type)) return false;
            if (currentMethods.length > 0 && !currentMethods.includes("")) {
                if (!item.tags.method || !item.tags.method.some(m => currentMethods.includes(m))) return false;
            }
            
            if (processedQuery.length > 0) {
                const searchableText = [
                    item.title,
                    item.summary,
                    $(item.modal_html).text() 
                ].join(' ').toLowerCase();
                return processedQuery.every(q => searchableText.includes(q));
            }
            return true;
        });

        // 6. 絞り込んだデータで表を描画
        renderData(filteredData);
        
        // 7. ★ 検索条件タグを更新（件数を追加）
        const finalCount = filteredData.length;
        updateConditionsDisplay(currentTypes, currentMethods, processedQuery, finalCount);

        // 8. URLパラメータを更新
        const params = new URLSearchParams();
        
        const displayTypes = currentTypes.filter(v => v !== "");
        displayTypes.forEach(type => {
            params.append('type', type);
        });

        const displayMethods = currentMethods.filter(v => v !== "");
        displayMethods.forEach(method => {
            params.append('method', method);
        });

        if (query) {
            params.set('q', query);
        }

        const newUrl = params.toString() 
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        history.pushState(null, '', newUrl);
    }

    /**
     * 検索条件タグの表示を更新する関数
     * ★ 修正：件数表示を追加、undefined対策を強化
     */
    function updateConditionsDisplay(types, methods, query, finalCount) {
        $conditionSamples.empty();
        let hasCondition = false;
        
        // ★ typesが空配列でない場合のみ処理
        if (types && types.length > 0) {
            const displayTypes = types.filter(v => v !== "");
            displayTypes.forEach(function(val) {
                if (val && val !== "") {
                    let text = $selectType.find(`option[value="${val}"]`).data('original-text');
                    if (text) { // undefinedでない場合のみ
                        text = `${text} (${finalCount})`; // ★ 件数を追加
                        addConditionTag(text, 'filter_type', val);
                        hasCondition = true;
                    }
                }
            });
        }
        
        // ★ methodsが空配列でない場合のみ処理
        if (methods && methods.length > 0) {
            const displayMethods = methods.filter(v => v !== "");
            displayMethods.forEach(function(val) {
                if (val && val !== "") {
                    let text = $selectMethod.find(`option[value="${val}"]`).data('original-text');
                    if (text) { // undefinedでない場合のみ
                        text = `${text} (${finalCount})`; // ★ 件数を追加
                        addConditionTag(text, 'filter_method', val);
                        hasCondition = true;
                    }
                }
            });
        }

        // ★ queryが空配列でない場合のみ処理
        if (query && query.length > 0) {
            let text = query.join(' ');
            if (text && text.trim() !== "") {
                text = `${text} (${finalCount})`; // ★ 件数を追加
                addConditionTag(text, 'filter_word', query.join(' '));
                hasCondition = true;
            }
        }
        
        // ★ 条件がある場合のみ表示
        if (hasCondition) {
            $conditions.attr('aria-hidden', 'false').show();
            console.log('Search conditions displayed with counts');
        } else {
            $conditions.attr('aria-hidden', 'true').hide();
            console.log('No search conditions - hiding tags');
        }
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
     * 件数カウント用ヘルパー関数
     */
    function updateOptionCounts($select, counts, totalCount) {
        $select.find('option').each(function() {
            const $opt = $(this);
            const val = $opt.val();
            
            if (!$opt.data('original-text')) {
                $opt.data('original-text', $opt.text());
            }
            const originalText = $opt.data('original-text');

            if (val) { // "すべて選択" 以外
                const count = counts[val] || 0;
                $opt.text(`${originalText} (${count})`);
                $opt.prop('disabled', count === 0);
            } else { // "すべて選択"
                $opt.text(`${originalText} (${totalCount})`);
            }
        });
    }
    
    // --- イベントリスナー設定 ---

    // フォームの検索ボタン（submit）またはEnterキー
    $form.on('submit', function(e) {
        e.preventDefault(); 
        updateFiltersAndResults();
    });

    // ドロップダウンが変更されたら、フォームのsubmitイベントを発火
    $selects.on('change', function() {
        $form.trigger('submit');
    });

    // フォームのリセットボタン
    $form.on('reset', function() {
        $('select[multiple]').each(function() {
            this.sumo.unSelectAll();
        });
        setTimeout(updateFiltersAndResults, 0);
    });

    // 検索条件タグの削除ボタン
    $conditions.on('click', 'button.unselect', function() {
        const $button = $(this);
        const controlId = $button.attr('class').replace('unselect _', '');
        const value = $button.val();

        console.log('Removing condition:', controlId, value);

        if (controlId === 'filter_word') {
            $('input#filter_word').val('');
        } else {
            const $select = $(`#${controlId}`);
            if ($select.prop('multiple')) {
                $select[0].sumo.unSelectItem(value);
            }
        }
        $form.trigger('submit'); 
    });

    // カード内のタグクリック
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
                $form.trigger('submit'); 
                
                $('html, body').animate({
                    scrollTop: $form.offset().top
                }, 400);
            }
        }
    });

    // --- 初期化処理 ---

    // 1. 最初に [case-study.json] を読み込む
    $.getJSON('./case-study.json') 
        .done(function(data) {
            console.log('case-study.json loaded:', data.length, 'items');
            allData = data; // データをグローバル変数に保存

            // 2. URLパラメータを読み取り、<select> に反映
            const params = new URLSearchParams(window.location.search);
            const types = params.getAll('type');
            const methods = params.getAll('method');
            const query = params.get('q');
            
            if (types.length > 0) {
                $selectType.val(types);
            }
            if (methods.length > 0) {
                $selectMethod.val(methods);
            }
            if (query) {
                $('input#filter_word').val(query);
            }

            // 3. SumoSelectを初期化
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

            // 4. CSSで非表示にされている検索ボックスを「強制的に表示」
            $('#filter .input-group').css('display', 'flex');
            $('#filter .inputs').css('display', 'flex'); 
            $('#filter .SumoSelect').css('display', 'inline-block');

            // 5. フィルターの件数を更新し、最終的な表示を行う
            updateFiltersAndResults();
            
            console.log('初期化完了');
        })
        .fail(function(jqXHR, textStatus, errorThrown) { 
            console.error('case-study.json読み込み失敗:', textStatus, errorThrown);
            $articleNone.text('データの読み込みに失敗しました。').show();
        });
});