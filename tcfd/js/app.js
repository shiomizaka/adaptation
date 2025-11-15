$(document).ready(function() {
    
    // --- グローバル変数 ---
    let allData = []; // trend.json の全データを保持
    
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
     * ★★★ これが連動フィルターの心臓部 ★★★
     * フィルターの状態が変更されるたびに呼び出される
     */
    function updateFiltersAndResults() {
        
        // 1. 現在の全フィルターの値を取得
        const currentType = $selectType.val() || "";
        const currentMethods = $selectMethod.val() || [];
        const currentProjects = $selectProject.val() || [];
        const query = $('input#filter_word').val().toLowerCase().split(/[\s,、。|]+/).filter(Boolean);

        // 2. 他フィルターの選択を考慮して、各フィルターの件数を再計算
        
        // (A) 「業種」の件数を計算
        //     (絞り込み条件: method, project, query)
        let typeCounts = {};
        let typeTotal = 0;
        const typeSubset = allData.filter(item => {
            if (currentMethods.length > 0 && !currentMethods.includes("") && !currentMethods.includes(item.method)) return false;
            if (currentProjects.length > 0 && !currentProjects.includes("") && !currentProjects.includes(item.project)) return false;
            // (フリーワード検索は、フィルターの件数には影響させないのが一般的)
            return true;
        });
        typeSubset.forEach(item => {
            if(item.type) typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        });
        typeTotal = typeSubset.length;
        
        // (B) 「物理的リスク」の件数を計算
        //     (絞り込み条件: type, project, query)
        let methodCounts = {};
        let methodTotal = 0;
        const methodSubset = allData.filter(item => {
            if (currentType && item.type !== currentType) return false;
            if (currentProjects.length > 0 && !currentProjects.includes("") && !currentProjects.includes(item.project)) return false;
            return true;
        });
        methodSubset.forEach(item => {
            if(item.method) methodCounts[item.method] = (methodCounts[item.method] || 0) + 1;
        });
        methodTotal = methodSubset.length;

        // (C) 「リスク/機会」の件数を計算
        //     (絞り込み条件: type, method, query)
        let projectCounts = {};
        let projectTotal = 0;
        const projectSubset = allData.filter(item => {
            if (currentType && item.type !== currentType) return false;
            if (currentMethods.length > 0 && !currentMethods.includes("") && !currentMethods.includes(item.method)) return false;
            return true;
        });
        projectSubset.forEach(item => {
            if(item.project) projectCounts[item.project] = (projectCounts[item.project] || 0) + 1;
        });
        projectTotal = projectSubset.length;

        // 3. 各ドロップダウンの <option> を更新
        updateOptionCounts($selectType, typeCounts, typeTotal);
        updateOptionCounts($selectMethod, methodCounts, methodTotal);
        updateOptionCounts($selectProject, projectCounts, projectTotal);

        // 4. SumoSelectの表示をリロード（必須）
        $selectType[0].sumo.reload();
        $selectMethod[0].sumo.reload();
        $selectProject[0].sumo.reload();

        // 5. 最終的な絞り込み結果を計算
        const filteredData = allData.filter(function(item) {
            if (currentType && item.type !== currentType) return false;
            if (currentMethods.length > 0 && !currentMethods.includes("") && !currentMethods.includes(item.method)) return false;
            if (currentProjects.length > 0 && !currentProjects.includes("") && !currentProjects.includes(item.project)) return false;
            
            if (query.length > 0) {
                const searchableText = [
                    item.summary,
                    $(item.area).text(), 
                    $(item.action).text(),
                    (item.links && item.links.name) ? item.links.name : ''
                ].join(' ').toLowerCase();
                return query.every(q => searchableText.includes(q));
            }
            return true;
        });

        // 6. 絞り込んだデータで表を描画
        renderData(filteredData);
        // 7. 検索条件タグを更新
        updateConditionsDisplay(currentType, currentMethods, currentProjects, query);
    }

    /**
     * 検索条件タグの表示を更新する関数
     */
    function updateConditionsDisplay(type, methods, projects, query) {
        $conditionSamples.empty();
        let hasCondition = false;

        if (type) {
            const text = $selectType.find(`option[value="${type}"]`).data('original-text');
            addConditionTag(text, 'filter_type', type);
            hasCondition = true;
        }
        
        const displayMethods = methods.filter(v => v !== "");
        displayMethods.forEach(function(val) {
            const text = $selectMethod.find(`option[value="${val}"]`).data('original-text');
            addConditionTag(text, 'filter_method', val);
            hasCondition = true;
        });
        
        const displayProjects = projects.filter(v => v !== "");
        displayProjects.forEach(function(val) {
            const text = $selectProject.find(`option[value="${val}"]`).data('original-text');
            addConditionTag(text, 'filter_project', val);
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
        
        if (type) {
            const text = $(`select#filter_type option[value="${type}"]`).data('original-text');
            if (text) {
                $imgEl.attr('src', $imgEl.attr('data-src').replace('{type}', type))
                      .attr('alt', $imgEl.attr('data-alt').replace('{type}', text))
                      .show();
                document.title = $imgEl.attr('data-title').replace('{type}', text);
                $nameEl.text($nameEl.attr('data-text').replace('{type}', text));
                $linkEl.attr('href', $linkEl.attr('data-href').replace('{type}', type));
                $('#items-name').text($('#items-name').attr('data-text').replace('{type}', text)).show();
            }
        } else {
            $imgEl.hide();
            $nameEl.text($nameEl.attr('data-text-default'));
            $('#items-name').hide();
        }
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
        // SumoSelect の選択をリセット
        $selectType[0].sumo.selectItem(0); // 単一選択
        $selectMethod[0].sumo.unSelectAll(); // 複数選択
        $selectProject[0].sumo.unSelectAll(); // 複数選択
        
        // 少し遅らせてから実行
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
            } else {
                $select[0].sumo.selectItem(0); 
            }
        }
        updateFiltersAndResults(); // ★変更★
    });

    // カード内のタグクリック（動的に生成される要素のため 'body' に委任）
    $('body').on('click', '.search-tags button', function() {
        const $button = $(this);
        const controlId = $button.attr('aria-controls');
        const value = $button.attr('data-value');
        
        if (controlId && value) {
            const $select = $(`#${controlId}`);
            if ($select.length > 0) {
                $select[0].sumo.selectItem(value);
                updateFiltersAndResults(); // ★変更★
                $('html, body').animate({
                    scrollTop: $form.offset().top
                }, 400);
            }
        }
    });

    // 開示事例リンク（動的に生成される要素のため 'body' に委任）
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

    // --- ★★★ 初期化処理 (ロジック変更) ★★★ ---

    // 1. 最初に [trends.json] を読み込む
    $.getJSON('../trend/trends.json') 
        .done(function(data) {
            allData = data; // データをグローバル変数に保存

            // 2. ★SumoSelectを初期化★ (この時点では件数は 0)
            $('select#filter_type').SumoSelect({
                placeholder: "業種",
                csvDispCount: 1,
                captionFormat: '業種', // 複数選択時の表示
                captionFormatAllSelected: '業種', // ★「すべて選択」時の表示（追加）
                outputAsCSV: true
            });
            $('select#filter_method').SumoSelect({
                placeholder: "物理的リスクの種類",
                csvDispCount: 1,
                captionFormat: '物理的リスクの種類', // 複数選択時の表示
                captionFormatAllSelected: '物理的リスクの種類', // ★「すべて選択」時の表示（追加）
                outputAsCSV: true
            });
            $('select#filter_project').SumoSelect({
                placeholder: "リスク/機会",
                csvDispCount: 1,
                captionFormat: 'リスク/機会', // 複数選択時の表示
                captionFormatAllSelected: 'リスク/機会', // ★「すべて選択」時の表示（追加）
                outputAsCSV: true
            });

            // 3. CSSで非表示にされている検索ボックスを「強制的に表示」
            $('#filter .input-group').css('display', 'flex');
            $('#filter .inputs').css('display', 'flex'); 
            $('#filter .SumoSelect').css('display', 'inline-block');

            // 4. URLパラメータに基づいて初期絞り込み
            const params = new URLSearchParams(window.location.search);
            const type = params.get('type') || '';
            if (type) {
                $('select#filter_type')[0].sumo.selectItem(type);
            }

            // 5. ページタイトル・業種名表示を実行
            //    (注：件数更新の前に実行する必要がある)
            setTrendName();
            
            // 6. ★フィルターの件数を更新し、最終的な表示を行う★
            updateFiltersAndResults();
        })
        .fail(function(jqXHR, textStatus, errorThrown) { 
            console.error('trends.json の読み込みに失敗しました。', textStatus, errorThrown);
            $articleNone.text('データの読み込みに失敗しました。ファイルパスやJSONの形式を確認してください。').show();
        });
});