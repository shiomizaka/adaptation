$(document).ready(function() {
    
    // --- グローバル変数 ---
    let allData = []; // trends.json の全データを保持
    
    // フォーム関連
    const $form = $('#filter');
    const $count = $('#count');
    const $conditions = $('#conditions');
    const $conditionTemplate = $('#condition_template li');
    const $conditionSamples = $('#condition_samples');
    const $articleNone = $('#article-none');

    // 描画コンテナ
    const containers = {
        self: $('#trends-container-self'),
        other: $('#trends-container-other'),
        market: $('#trends-container-market')
    };
    
    // --- case-study.json 関連 ---
    let allCaseStudyData = null; // case-study.json のデータをキャッシュ

    // フィルターのSelect要素
    const $selectType = $('select#filter_type');
    const $selectMethod = $('select#filter_method');
    const $selectProject = $('select#filter_project');
    const $selects = $('select#filter_type, select#filter_method, select#filter_project');

    // --- 関数定義 ---

    /**
     * [trends.json] のデータを元にテーブルを描画する関数
     */
    function renderData(items) {
        containers.self.empty();
        containers.other.empty();
        containers.market.empty();

        let count = 0;

        $.each(items, function(index, item) {
            
            let linksHtml = '‐'; 
            if (item.links && item.links.href) {
                var targetId = item.links.href.split('#')[1]; 
                linksHtml = `
                    <dl class="nav search-text">
                        <dt>${item.links.type}</dt>
                        <dd>
                            <a href="#" class="js-open-case-study" data-target-id="${targetId}">
                                ${item.links.name}
                            </a>
                        </dd>
                    </dl>
                `;
            }

            const typeText = $selectType.find(`option[value="${item.type}"]`).data('original-text') || item.type;
            const methodText = $selectMethod.find(`option[value="${item.method}"]`).data('original-text') || item.method;
            const projectText = $selectProject.find(`option[value="${item.project}"]`).data('original-text') || item.project;

            const rowHtml = `
                <tr id="item-${item.id}" data-id="${item.id}">
                    <th scope="row" data-id="${item.id}" class="summary" data-title="開示内容">
                        <b class="search-text">${item.summary}</b>
                        <ul class="options search-tags">
                            <li><button type="button" class="btn type" aria-controls="filter_type" data-value="${item.type}" title="業種「${typeText}」で一覧を絞り込み">${typeText}</button></li>
                            <li><button type="button" class="btn method" aria-controls="filter_method" data-value="${item.method}" title="物理的リスクの種類「${methodText}」で一覧を絞り込み">${methodText}</button></li>
                            <li><button type="button" class="btn project" aria-controls="filter_project" data-value="${item.project}" title="リスク/機会のうち「${projectText}」で一覧を絞り込み">${projectText}</button></li>
                        </ul>
                    </th>
                    <td class="area">${item.area}</td>
                    <td class="action" data-title="対応策">${item.action}</td>
                    <td class="links ${!linksHtml || linksHtml === '‐' ? 'empty' : ''}">${linksHtml}</td>
                </tr>
            `;

            if (containers[item.category]) {
                containers[item.category].append(rowHtml);
                count++;
            }
        });

        $count.text(count);
        $articleNone.toggle(count === 0);
    }

    /**
     * フィルターの件数・表示を更新し、データを絞り込んで描画する
     * (この関数はページの読み込みが完了した時に1回だけ実行される)
     */
    function initializeFiltersAndDisplay() {
        
        // 1. URLから現在のフィルター設定を読み込む
        const params = new URLSearchParams(window.location.search);
        const currentType = params.get('type') || "";
        const currentMethods = params.getAll('method').filter(v => v !== "");
        const currentProjects = params.getAll('project').filter(v => v !== "");
        const query = params.get('q') || "";
        const processedQuery = query.toLowerCase().split(/[\s,、。|]+/).filter(Boolean);

        // 2. フィルターの件数を計算
        let typeCounts = {};
        let methodCounts = {};
        let projectCounts = {};
        let typeTotal = 0, methodTotal = 0, projectTotal = 0;

        // 連動フィルターのロジック
        const typeSubset = allData.filter(item => {
            if (currentMethods.length > 0 && !currentMethods.includes(item.method)) return false; 
            if (currentProjects.length > 0 && !currentProjects.includes(item.project)) return false;
            return true;
        });
        typeSubset.forEach(item => { if(item.type) typeCounts[item.type] = (typeCounts[item.type] || 0) + 1; });
        typeTotal = typeSubset.length;
        
        const methodSubset = allData.filter(item => {
            if (currentType && item.type !== currentType) return false; 
            if (currentProjects.length > 0 && !currentProjects.includes(item.project)) return false;
            return true;
        });
        methodSubset.forEach(item => { if(item.method) methodCounts[item.method] = (methodCounts[item.method] || 0) + 1; });
        methodTotal = methodSubset.length;

        const projectSubset = allData.filter(item => {
            if (currentType && item.type !== currentType) return false;
            if (currentMethods.length > 0 && !currentMethods.includes(item.method)) return false;
            return true;
        });
        projectSubset.forEach(item => { if(item.project) projectCounts[item.project] = (projectCounts[item.project] || 0) + 1; });
        projectTotal = projectSubset.length;
        
        // 3. 各ドロップダウンの <option> を更新
        updateOptionCounts($selectType, typeCounts, typeTotal);
        updateOptionCounts($selectMethod, methodCounts, methodTotal);
        updateOptionCounts($selectProject, projectCounts, projectTotal);
        
        // 4. URLパラメータに基づいて<select>の値を設定 (SumoSelect初期化前)
        if (currentType) {
            $selectType.val(currentType);
        }
        if (currentMethods.length > 0) {
            $selectMethod.val(currentMethods);
        }
        if (currentProjects.length > 0) {
            $selectProject.val(currentProjects);
        }
        if (query) {
            $('input#filter_word').val(query);
        }
        
        // 5. 最終的な絞り込み結果を計算
        const filteredData = allData.filter(function(item) {
            if (currentType && item.type !== currentType) return false;
            if (currentMethods.length > 0 && !currentMethods.includes(item.method)) return false;
            if (currentProjects.length > 0 && !currentProjects.includes(item.project)) return false;
            
            if (processedQuery.length > 0) {
                const searchableText = [
                    item.summary,
                    $(item.area).text(), 
                    $(item.action).text(),
                    (item.links && item.links.name) ? item.links.name : ''
                ].join(' ').toLowerCase();
                return processedQuery.every(q => searchableText.includes(q));
            }
            return true;
        });

        // 6. 絞り込んだデータで表を描画
        renderData(filteredData);
        
        // 7. 検索条件タグを更新
        const finalCount = filteredData.length;
        updateConditionsDisplay(currentType, currentMethods, currentProjects, processedQuery, finalCount);
    }

    /**
     * 検索条件タグの表示を更新する関数
     * ★ 修正：空の配列や空文字列をチェック
     */
    function updateConditionsDisplay(type, methods, projects, query, finalCount) {
        $conditionSamples.empty();
        let hasCondition = false;

        // ★ typeが空文字列でない場合のみ表示
        if (type && type !== "") {
            let text = $selectType.find(`option[value="${type}"]`).data('original-text');
            if (text) { // undefinedでない場合のみ
                text = `${text} (${finalCount})`; 
                addConditionTag(text, 'filter_type', type);
                hasCondition = true;
            }
        }
        
        // ★ methodsが空配列でない場合のみ処理
        if (methods && methods.length > 0) {
            methods.forEach(function(val) {
                if (val && val !== "") { // 空文字列でない場合のみ
                    let text = $selectMethod.find(`option[value="${val}"]`).data('original-text');
                    if (text) { // undefinedでない場合のみ
                        text = `${text} (${finalCount})`; 
                        addConditionTag(text, 'filter_method', val);
                        hasCondition = true;
                    }
                }
            });
        }
        
        // ★ projectsが空配列でない場合のみ処理
        if (projects && projects.length > 0) {
            projects.forEach(function(val) {
                if (val && val !== "") { // 空文字列でない場合のみ
                    let text = $selectProject.find(`option[value="${val}"]`).data('original-text');
                    if (text) { // undefinedでない場合のみ
                        text = `${text} (${finalCount})`; 
                        addConditionTag(text, 'filter_project', val);
                        hasCondition = true;
                    }
                }
            });
        }

        // ★ queryが空配列でない場合のみ処理
        if (query && query.length > 0) {
            let text = query.join(' ');
            if (text && text.trim() !== "") { // 空文字列でない場合のみ
                text = `${text} (${finalCount})`; 
                addConditionTag(text, 'filter_word', query.join(' '));
                hasCondition = true;
            }
        }
        
        // ★ 条件がある場合のみ表示
        if (hasCondition) {
            $conditions.attr('aria-hidden', 'false').show();
            console.log('Search conditions displayed:', {type, methods, projects, query});
        } else {
            $conditions.attr('aria-hidden', 'true').hide();
            console.log('No search conditions - hiding condition tags');
        }
    }

    /**
     * 検索条件タグ([x]ボタン付き)を追加するヘルパー関数
     */
    function addConditionTag(text, controlId, value) {
        const $tag = $conditionTemplate.clone();
        $tag.find('kbd').text(text);
        $tag.find('button')
            .attr('class', `unselect _${controlId}`)
            .val(value)
            .attr('title', `この「${text}」の検索条件を解除します`);
        $conditionSamples.append($tag);
        console.log('Condition tag added:', text);
    }

    /**
     * [case-study.json] のデータでFancyboxモーダルを表示する関数
     */
    function showCaseStudyModal(targetId) {
        if (!allCaseStudyData || !allCaseStudyData[targetId]) {
            console.error(targetId + ' のデータが case-study.json に見つかりません。');
            alert('開示事例データの読み込みに失敗しました。');
            return;
        }
        var item = allCaseStudyData[targetId];

        const contentHtml = `
            <article id="${item.id}" class="container text details" data-id="${item.id.replace('detail-', '')}" style="display:block;">
                ${item.modal_html}
            </article>
        `;

        $.fancybox.open({
            src: contentHtml,
            type: 'html',
            opts: {
                baseClass: 'Case', 
                smallBtn: false,
                afterShow: function(instance, current) {
                    current.$content.find('.image img').css({
                        'max-width': '100%',
                        'height': 'auto',
                        'display': 'block'
                    });
                }
            }
        });
    }

    /**
     * ページ上部の業種名などを設定する関数
     */
    function setTrendName() {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type') || '';
        const $nameEl = $('#trend-name');
        const $imgEl = $('#page-header-img');
        const $linkEl = $('#trend-link');
        
        const text = $(`select#filter_type option[value="${type}"]`).text().replace(/\s\(\d+\)$/, ''); // "(22)" などを削除
        
        if (type && text) {
            $imgEl.attr('src', $imgEl.attr('data-src').replace('{type}', type))
                    .attr('alt', $imgEl.attr('data-alt').replace('{type}', text))
                    .show();
            document.title = $imgEl.attr('data-title').replace('{type}', text);
            $nameEl.text($nameEl.attr('data-text').replace('{type}', text));
            $linkEl.attr('href', $linkEl.attr('data-href').replace('{type}', type));
            $('#items-name').text($('#items-name').attr('data-text').replace('{type}', text)).show();
        } else {
            $imgEl.hide();
            $nameEl.text($nameEl.attr('data-text-default'));
            $('#items-name').hide();
        }
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
    
    // --- イベントリスナー設定 (リロード版) ---

    // フォームの検索ボタン(submit)
    $form.on('submit', function(e) {
        // デフォルトの送信(リロード)を許可
    });

    // フォームのリセットボタン
    $form.on('reset', function(e) {
        e.preventDefault(); 
        window.location.href = window.location.pathname; 
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
                let vals = $select.val() || [];
                vals = vals.filter(v => v !== value);
                $select.val(vals);
                
                // ★ SumoSelectの表示を更新
                if ($select[0].sumo) {
                    $select[0].sumo.reload();
                }
            } else {
                $select.val(''); 
                
                // ★ SumoSelectの表示を更新
                if ($select[0].sumo) {
                    $select[0].sumo.reload();
                }
            }
        }
        $form.submit(); 
    });

    // カード内のタグクリック
    $('body').on('click', '.search-tags button', function() {
        const $button = $(this);
        const controlId = $button.attr('aria-controls');
        const value = $button.attr('data-value');
        
        if (controlId && value) {
            const $select = $(`#${controlId}`);
            if ($select.length > 0) {
                $select.val(value);
                $form.submit(); 
            }
        }
    });

    // 開示事例リンク(これはリロードしない)
    $('body').on('click', 'a.js-open-case-study', function(e) {
        e.preventDefault(); 
        var targetId = $(this).attr('data-target-id'); 

        if (!allCaseStudyData) {
            $.getJSON('../case-study/case-study.json') 
                .done(function(data) {
                    allCaseStudyData = {};
                    data.forEach(function(item) {
                        allCaseStudyData[item.id] = item;
                    });
                    console.log('Case Study JSON loaded and cached.');
                    showCaseStudyModal(targetId);
                })
                .fail(function() {
                    console.error('case-study.json の読み込みに失敗しました。');
                    alert('開示事例データの読み込みに失敗しました。');
                });
        } else {
            showCaseStudyModal(targetId);
        }
    });

    // --- ★★★ 初期化処理 ★★★ ---

    // 1. 最初に [trends.json] を読み込む
    $.getJSON('trends.json') 
        .done(function(data) {
            console.log('trends.json loaded successfully. Total items:', data.length);
            allData = data; 

            // 2. ページタイトル・業種名表示を先に実行
            setTrendName();
            
            // 3. フィルターの件数を更新し、データ描画まで行う
            initializeFiltersAndDisplay(); 
            
            // 4. ★★★ SumoSelectの初期化をここで行う ★★★
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
            $selectProject.SumoSelect({
                placeholder: "リスク/機会",
                csvDispCount: 1,
                captionFormat: 'リスク/機会', 
                captionFormatAllSelected: 'リスク/機会', 
                outputAsCSV: true
            });

            // 5. CSSで非表示にされている検索ボックスを「強制的に表示」
            $('#filter .input-group').css('display', 'flex');
            $('#filter .inputs').css('display', 'flex'); 
            $('#filter .SumoSelect').css('display', 'inline-block');

            // 6. ★★★ SumoSelect の 'change' イベントリスナーを設定 ★★★
            let isInitialized = false;
            setTimeout(function() {
                isInitialized = true;
                console.log('SumoSelect initialization completed.');
            }, 500); // 0.5秒間は初期化中とみなし、changeイベントを無視

            $selects.on('change', function() {
                // 初期化完了フラグを確認してからsubmitを実行
                if (isInitialized) {
                    console.log('Filter changed, submitting form...');
                    $form.submit();
                }
            });

        })
        .fail(function(jqXHR, textStatus, errorThrown) { 
            console.error('trends.json の読み込みに失敗しました。', textStatus, errorThrown);
            console.error('Status:', jqXHR.status, 'Response:', jqXHR.responseText);
            $articleNone.text('データの読み込みに失敗しました。ファイルパスやJSONの形式を確認してください。').show();
        });
});