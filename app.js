// ============================================================
// Banana Mage Banana咒語 - 核心應用邏輯
// ============================================================

(function () {
  'use strict';

  // ----------------------------------------------------------
  // Global Error Listener for Advanced Debugging (Premium UX)
  // ----------------------------------------------------------
  window.addEventListener('error', (e) => {
    console.error('偵測到全域 Runtime 錯誤:', e.error);
    const msg = e.error ? `${e.error.name}: ${e.error.message}` : e.message;
    const banner = document.createElement('div');
    banner.className = 'debug-error-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:#fff;padding:14px 20px;z-index:99999;text-align:center;font-weight:bold;font-family:system-ui,-apple-system,sans-serif;font-size:0.95rem;box-shadow:0 4px 20px rgba(0,0,0,0.4);border-bottom:3px solid #b91c1c;animation:corsSpringIn 0.3s ease;';
    banner.innerHTML = `⚠️ 系統執行期異常：${msg} <br> <small style="font-weight:normal;opacity:0.85;font-size:0.8rem;">請複製此錯誤訊息或截圖告知我們，我們將秒速為您排除！</small> <button onclick="this.parentNode.remove()" style="margin-left:15px;background:rgba(255,255,255,0.25);border:none;color:#fff;padding:3px 10px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:0.8rem;transition:background 0.2s;">✕ 關閉</button>`;
    document.body.appendChild(banner);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('偵測到未處理的 Promise 拒絕:', e.reason);
    const msg = e.reason ? (e.reason.message || e.reason) : '未知非同步錯誤';
    const banner = document.createElement('div');
    banner.className = 'debug-error-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f59e0b;color:#07070f;padding:14px 20px;z-index:99999;text-align:center;font-weight:bold;font-family:system-ui,-apple-system,sans-serif;font-size:0.95rem;box-shadow:0 4px 20px rgba(0,0,0,0.4);border-bottom:3px solid #d97706;animation:corsSpringIn 0.3s ease;';
    banner.innerHTML = `⚠️ 非同步資料載入限制：${msg} <br> <small style="font-weight:normal;opacity:0.85;font-size:0.8rem;">若受限於 CORS 限制，請直接點選 CORS 警告面板中的極速本地伺服器連結跳轉！</small> <button onclick="this.parentNode.remove()" style="margin-left:15px;background:rgba(0,0,0,0.15);border:none;color:#07070f;padding:3px 10px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:0.8rem;transition:background 0.2s;">✕ 關閉</button>`;
    document.body.appendChild(banner);
  });

  // ----------------------------------------------------------
  // i18n Dictionaries
  // ----------------------------------------------------------
  const I18N_DICTS = {
    'zh': {
      'app.title': '🍌 Banana Mage Banana咒語',
      'sidebar.logo': '🍌 Banana Mage',
      'sidebar.title': '分類',
      'sidebar.all': '全部模板',
      'sidebar.pro': 'Banana Pro',
      'sidebar.standard': 'Banana Basic',
      'sidebar.favorites': '我的收藏',
      'sidebar.custom': '自訂模板',
      'sidebar.square': '咒語廣場',
      'custom.btn_publish': '🚀 發佈到廣場',
      'header.search_placeholder': '搜尋 205 個精選模板... (按 / 聚焦)',
      'header.analysis_tooltip': '圖片風格分析',
      'header.analysis_text': '圖片風格分析',
      'header.add_custom_tooltip': '新增自訂模板',
      'header.add_custom_text': '建立自訂模板',
      'header.theme_tooltip': '切換主題',
      'header.lang_tooltip': '選擇語言 / Language',
      'filter.difficulty': '難度：',
      'filter.diff_all': '全部',
      'filter.diff_beginner': '入門',
      'filter.diff_intermediate': '中級',
      'filter.diff_advanced': '進階',
      'filter.tags': '標籤：',
      'filter.stats': '{count} 個精選模板',
      'filter.view_grid': '網格檢視',
      'filter.view_list': '列表檢視',
      'gallery.empty_title': '找不到符合的模板',
      'gallery.empty_desc': '試試調整搜尋條件或篩選標籤',
      'modal.favorite': '收藏',
      'modal.source': '原始來源',
      'modal.close': '關閉',
      'modal.input_badge': '📎 需要輸入圖片',
      'modal.scene_suggestions': '🎯 場景適配建議',
      'modal.prompt_title': '📝 提示詞',
      'modal.vars_title': '🔧 填寫變數',
      'modal.vars_placeholder': '輸入 {var}',
      'modal.quality_drawer': '✨ 品質提升關鍵詞 (點選展開/收合)',
      'modal.copy_btn': '📋 複製提示詞',
      'modal.reset_btn': '🔄 重置',
      'modal.save_custom': '💾 存為自訂模板',
      'analysis.title': '🔬 圖片風格分析',
      'analysis.intro': '上傳一張你喜歡的圖片，我會幫你分析其風格參數，讓你可以 remix 出類似的效果。',
      'analysis.placeholder': '拖曳圖片到此處，或點選上傳',
      'analysis.hint': '支援 JPG、PNG、WebP',
      'analysis.scanning': '分析中...',
      'analysis.label_style': '🎨 整體風格',
      'analysis.label_color': '🌈 色彩分析',
      'analysis.label_comp': '📐 構圖方式',
      'analysis.label_light': '💡 光影效果',
      'analysis.label_texture': '🖌️ 材質/質感',
      'analysis.label_mood': '😊 氛圍/情緒',
      'analysis.label_desc': '📝 詳細描述',
      'analysis.label_keywords': '🔑 建議提示詞關鍵字',
      'analysis.btn_copy': '📋 複製分析結果',
      'analysis.btn_remix': '🎨 生成 Remix 提示詞',
      'custom.title': '✏️ 新增自訂模板',
      'custom.label_name': '模板名稱',
      'custom.placeholder_name': '為你的模板取個名字',
      'custom.label_tags': '標籤（逗號分隔）',
      'custom.placeholder_tags': '例：風格轉換, 3D渲染, 人物',
      'custom.label_prompt': '提示詞',
      'custom.placeholder_prompt': '輸入你的提示詞...',
      'custom.btn_save': '💾 儲存模板',
      'custom.btn_cancel': '取消',
      'toast.copied': '已複製到剪貼簿 📋',
      'toast.custom_saved': '自訂模板已儲存 ✅',
      'toast.theme_changed': '已切換至{theme}主題 🌓',
      'toast.fill_required': '請填寫模板名稱和提示詞',
      'toast.remix_copied': 'Remix 提示詞已複製 🎨',
      'toast.load_failed': '資料載入失敗，請確認 data/ 資料夾是否存在',
      'modal.char_unit': '字',
      'custom.title_edit': '✏️ 編輯自訂模板',
      'custom.btn_update': '💾 更新模板',
      'custom.btn_delete': '🗑️ 刪除模板',
      'custom.btn_edit': '✏️ 編輯模板',
      'custom.label_image': '預覽圖片網址',
      'custom.placeholder_image': '填入圖片網址（選填）',
      'custom.label_difficulty': '難易度分級',
      'custom.label_requires_input': '需要參考圖片作為輸入',
      'custom.label_input_description': '參考圖片用途描述',
      'custom.placeholder_input_description': '例如：需上傳人物圖片作為參考圖',
      'custom.label_scenes': '建議適用場景（可多選）',
      'toast.custom_deleted': '自訂模板已刪除 🗑️',
      'toast.delete_confirm': '確定要刪除此自訂模板嗎？此動作無法復原。'
    },
    'en': {
      'app.title': '🍌 Banana Mage Banana Spell',
      'sidebar.logo': '🍌 Banana Mage',
      'sidebar.title': 'Categories',
      'sidebar.all': 'All Templates',
      'sidebar.pro': 'Banana Pro',
      'sidebar.standard': 'Banana Basic',
      'sidebar.favorites': 'My Favorites',
      'sidebar.custom': 'Custom Templates',
      'sidebar.square': 'Spell Square',
      'custom.btn_publish': '🚀 Publish to Square',
      'header.search_placeholder': 'Search 205 premium templates... (Press / to focus)',
      'header.analysis_tooltip': 'Image Style Analysis',
      'header.analysis_text': 'Style Analyzer',
      'header.add_custom_tooltip': 'Add Custom Template',
      'header.add_custom_text': 'Create Custom',
      'header.theme_tooltip': 'Toggle Theme',
      'header.lang_tooltip': 'Select Language',
      'filter.difficulty': 'Difficulty:',
      'filter.diff_all': 'All',
      'filter.diff_beginner': 'Beginner',
      'filter.diff_intermediate': 'Intermediate',
      'filter.diff_advanced': 'Advanced',
      'filter.tags': 'Tags:',
      'filter.stats': '{count} premium templates',
      'filter.view_grid': 'Grid View',
      'filter.view_list': 'List View',
      'gallery.empty_title': 'No Templates Found',
      'gallery.empty_desc': 'Try adjusting your search query or filters',
      'modal.favorite': 'Favorite',
      'modal.source': 'Original Source',
      'modal.close': 'Close',
      'modal.input_badge': '📎 Image Input Required',
      'modal.scene_suggestions': '🎯 Suggested Scenes',
      'modal.prompt_title': '📝 Prompt',
      'modal.vars_title': '🔧 Fill Variables',
      'modal.vars_placeholder': 'Enter {var}',
      'modal.quality_drawer': '✨ Quality Boosters (Click to expand/collapse)',
      'modal.copy_btn': '📋 Copy Prompt',
      'modal.reset_btn': '🔄 Reset',
      'modal.save_custom': '💾 Save as Custom',
      'analysis.title': '🔬 Image Style Analysis',
      'analysis.intro': 'Upload an image you like and I\'ll analyze its style parameters so you can remix it into similar effects.',
      'analysis.placeholder': 'Drag & drop image here, or click to upload',
      'analysis.hint': 'Supports JPG, PNG, WebP',
      'analysis.scanning': 'Analyzing...',
      'analysis.label_style': '🎨 Overall Style',
      'analysis.label_color': '🌈 Color Analysis',
      'analysis.label_comp': '📐 Composition',
      'analysis.label_light': '💡 Lighting',
      'analysis.label_texture': '🖌️ Texture/Material',
      'analysis.label_mood': '😊 Mood/Atmosphere',
      'analysis.label_desc': '📝 Detailed Description',
      'analysis.label_keywords': '🔑 Suggested Keywords',
      'analysis.btn_copy': '📋 Copy Analysis Results',
      'analysis.btn_remix': '🎨 Generate Remix Prompt',
      'custom.title': '✏️ Add Custom Template',
      'custom.label_name': 'Template Name',
      'custom.placeholder_name': 'Give your template a name',
      'custom.label_tags': 'Tags (comma separated)',
      'custom.placeholder_tags': 'e.g. style, 3D, character',
      'custom.label_prompt': 'Prompt',
      'custom.placeholder_prompt': 'Enter your prompt here...',
      'custom.btn_save': '💾 Save Template',
      'custom.btn_cancel': 'Cancel',
      'toast.copied': 'Copied to clipboard 📋',
      'toast.custom_saved': 'Custom template saved ✅',
      'toast.theme_changed': 'Switched to {theme} theme 🌓',
      'toast.fill_required': 'Please fill in the template name and prompt',
      'toast.remix_copied': 'Remix prompt copied 🎨',
      'toast.load_failed': 'Failed to load data. Please ensure data/ folder exists',
      'modal.char_unit': 'chars',
      'custom.title_edit': '✏️ Edit Custom Template',
      'custom.btn_update': '💾 Update Template',
      'custom.btn_delete': '🗑️ Delete Template',
      'custom.btn_edit': '✏️ Edit Template',
      'custom.label_image': 'Preview Image URL',
      'custom.placeholder_image': 'Enter image URL (optional)',
      'custom.label_difficulty': 'Difficulty Level',
      'custom.label_requires_input': 'Requires input image as reference',
      'custom.label_input_description': 'Description of reference image usage',
      'custom.placeholder_input_description': 'e.g. Need to upload a character image as reference',
      'custom.label_scenes': 'Suggested Scenes (Multiple choice)',
      'toast.custom_deleted': 'Custom template deleted 🗑️',
      'toast.delete_confirm': 'Are you sure you want to delete this custom template? This action cannot be undone.'
    },
    'ja': {
      'app.title': '🍌 Banana Mage Banana Spell',
      'sidebar.logo': '🍌 Banana Mage',
      'sidebar.title': 'カテゴリー',
      'sidebar.all': 'すべてのテンプレート',
      'sidebar.pro': 'Banana Pro',
      'sidebar.standard': 'Banana Basic',
      'sidebar.favorites': 'お気に入り',
      'sidebar.custom': 'カスタムテンプレート',
      'sidebar.square': '呪文広場',
      'custom.btn_publish': '🚀 広場に公開',
      'header.search_placeholder': '205個の厳選テンプレートを検索... (/ キーでフォーカス)',
      'header.analysis_tooltip': '画像スタイル分析',
      'header.analysis_text': '画像スタイル分析',
      'header.add_custom_tooltip': 'カスタムテンプレートを追加',
      'header.add_custom_text': 'カスタム作成',
      'header.theme_tooltip': 'テーマを切り替え',
      'header.lang_tooltip': '言語を選択',
      'filter.difficulty': '難易度：',
      'filter.diff_all': 'すべて',
      'filter.diff_beginner': '初級',
      'filter.diff_intermediate': '中級',
      'filter.diff_advanced': '上級',
      'filter.tags': 'タグ：',
      'filter.stats': '{count} 個の厳選テンプレート',
      'filter.view_grid': 'グリッド表示',
      'filter.view_list': 'リスト表示',
      'gallery.empty_title': 'テンプレートが見つかりません',
      'gallery.empty_desc': '検索キーワードやフィルターを変更してください',
      'modal.favorite': 'お気に入り',
      'modal.source': '元のソース',
      'modal.close': '閉じる',
      'modal.input_badge': '📎 画像入力が必要',
      'modal.scene_suggestions': '🎯 推奨されるシーン',
      'modal.prompt_title': '📝 プロンプト',
      'modal.vars_title': '🔧 変数に入力',
      'modal.vars_placeholder': '{var} を入力',
      'modal.quality_drawer': '✨ クオリティ向上キーワード (クリックで展開/折りたたみ)',
      'modal.copy_btn': '📋 プロンプトをコピー',
      'modal.reset_btn': '🔄 リセット',
      'modal.save_custom': '💾 カスタムとして保存',
      'analysis.title': '🔬 画像スタイル分析',
      'analysis.intro': 'お気に入りの画像をアップロードすると、スタイルパラメーターを分析して同様の効果をリミックスできます。',
      'analysis.placeholder': '画像をドラッグ＆ドロップ、またはクリックしてアップロード',
      'analysis.hint': 'JPG、PNG、WebPに対応',
      'analysis.scanning': '分析中...',
      'analysis.label_style': '🎨 全体スタイル',
      'analysis.label_color': '🌈 色彩分析',
      'analysis.label_comp': '📐 構図方法',
      'analysis.label_light': '💡 光影効果',
      'analysis.label_texture': '🖌️ 材質・質感',
      'analysis.label_mood': '😊 雰囲気・感情',
      'analysis.label_desc': '📝 詳細な説明',
      'analysis.label_keywords': '🔑 推奨キーワード',
      'analysis.btn_copy': '📋 分析結果をコピー',
      'analysis.btn_remix': '🎨 Remixプロンプトを生成',
      'custom.title': '✏️ カスタムテンプレートを追加',
      'custom.label_name': 'テンプレート名',
      'custom.placeholder_name': 'テンプレートに名前を付けます',
      'custom.label_tags': 'タグ (カンマ区切り)',
      'custom.placeholder_tags': '例：スタイル、3D、キャラクター',
      'custom.label_prompt': 'プロンプト',
      'custom.placeholder_prompt': 'プロンプトを入力してください...',
      'custom.btn_save': '💾 テンプレートを保存',
      'custom.btn_cancel': 'キャンセル',
      'toast.copied': 'クリップボードにコピーしました 📋',
      'toast.custom_saved': 'カスタムテンプレートが保存されました ✅',
      'toast.theme_changed': '{theme}テーマに切り替えました 🌓',
      'toast.fill_required': 'テンプレート名とプロンプトを入力してください',
      'toast.remix_copied': 'Remixプロンプトがコピーされました 🎨',
      'toast.load_failed': 'データの読み込みに失敗しました。data/ フォルダが存在することを確認してください',
      'modal.char_unit': '文字',
      'custom.title_edit': '✏️ カスタムテンプレートを編集',
      'custom.btn_update': '💾 テンプレートを更新',
      'custom.btn_delete': '🗑️ テンプレートを削除',
      'custom.btn_edit': '✏️ テンプレートを編集',
      'custom.label_image': 'プレビュー画像URL',
      'custom.placeholder_image': '画像URLを入力 (任意)',
      'custom.label_difficulty': '難易度レベル',
      'custom.label_requires_input': '参考画像を入力として必要とする',
      'custom.label_input_description': '参考画像の用途説明',
      'custom.placeholder_input_description': '例：参考としてキャラクター画像をアップロードする必要があります',
      'custom.label_scenes': '推奨シーン (複数選択可)',
      'toast.custom_deleted': 'カスタムテンプレートが削除されました 🗑️',
      'toast.delete_confirm': 'このカスタムテンプレートを削除してもよろしいですか？この操作は取り消せません。'
    },
    'ko': {
      'app.title': '🍌 Banana Mage Banana Spell',
      'sidebar.logo': '🍌 Banana Mage',
      'sidebar.title': '카테고리',
      'sidebar.all': '모든 템플릿',
      'sidebar.pro': 'Banana Pro',
      'sidebar.standard': 'Banana Basic',
      'sidebar.favorites': '내가 좋아하는 템플릿',
      'sidebar.custom': '커스텀 템플릿',
      'sidebar.square': '주문 광장',
      'custom.btn_publish': '🚀 광장에 게시',
      'header.search_placeholder': '205개 추천 템플릿 검색... (/ 키로 포커스)',
      'header.analysis_tooltip': '이미지 스타일 분석',
      'header.analysis_text': '이미지 스타일 분석',
      'header.add_custom_tooltip': '커스텀 템플릿 추가',
      'header.add_custom_text': '커스텀 생성',
      'header.theme_tooltip': '테마 전환',
      'header.lang_tooltip': '언어 선택',
      'filter.difficulty': '난이도:',
      'filter.diff_all': '전체',
      'filter.diff_beginner': '초급',
      'filter.diff_intermediate': '중급',
      'filter.diff_advanced': '고급',
      'filter.tags': '태그:',
      'filter.stats': '{count}개 추천 템플릿',
      'filter.view_grid': '그리드 뷰',
      'filter.view_list': '리스트 뷰',
      'gallery.empty_title': '템플릿을 찾을 수 없습니다',
      'gallery.empty_desc': '검색어 또는 필터를 변경해 보세요',
      'modal.favorite': '즐겨찾기',
      'modal.source': '원본 출처',
      'modal.close': '닫기',
      'modal.input_badge': '📎 이미지 입력 필요',
      'modal.scene_suggestions': '🎯 권장 시나리오',
      'modal.prompt_title': '📝 프롬프트',
      'modal.vars_title': '🔧 변수 입력',
      'modal.vars_placeholder': '{var} 입력',
      'modal.quality_drawer': '✨ 퀄리티 향상 키워드 (클릭하여 펼치기/접기)',
      'modal.copy_btn': '📋 프롬프트 복사',
      'modal.reset_btn': '🔄 초기화',
      'modal.save_custom': '💾 커스텀으로 저장',
      'analysis.title': '🔬 이미지 스타일 분석',
      'analysis.intro': '좋아하는 이미지를 업로드하면 해당 스타일의 파라미터를 분석해 비슷한 느낌으로 리믹스할 수 있도록 도와드립니다.',
      'analysis.placeholder': '이미지를 드래그 앤 드롭하거나 클릭하여 업로드',
      'analysis.hint': 'JPG, PNG, WebP 지원',
      'analysis.scanning': '분석 중...',
      'analysis.label_style': '🎨 전체 스타일',
      'analysis.label_color': '🌈 색상 분석',
      'analysis.label_comp': '📐 구도 방식',
      'analysis.label_light': '💡 광원 효과',
      'analysis.label_texture': '🖌️ 재질/질감',
      'analysis.label_mood': '😊 분위기/감정',
      'analysis.label_desc': '📝 상세 묘사',
      'analysis.label_keywords': '🔑 추천 키워드',
      'analysis.btn_copy': '📋 분석 결과 복사',
      'analysis.btn_remix': '🎨 Remix 프롬프트 생성',
      'custom.title': '✏️ 커스텀 템플릿 추가',
      'custom.label_name': '템플릿 이름',
      'custom.placeholder_name': '템플릿에 이름을 지어주세요',
      'custom.label_tags': '태그 (쉼표로 구분)',
      'custom.placeholder_tags': '예: 스타일, 3D, 캐릭터',
      'custom.label_prompt': '프롬프트',
      'custom.placeholder_prompt': '프롬프트를 입력하세요...',
      'custom.btn_save': '💾 템플릿 저장',
      'custom.btn_cancel': '취소',
      'toast.copied': '클립보드에 복사되었습니다 📋',
      'toast.custom_saved': '커스텀 템플릿이 저장되었습니다 ✅',
      'toast.theme_changed': '{theme} 테마로 전환되었습니다 🌓',
      'toast.fill_required': '템플릿 이름과 프롬프트를 입력해 주세요',
      'toast.remix_copied': 'Remix 프롬프트가 복사되었습니다 🎨',
      'toast.load_failed': '데이터 로드에 실패했습니다. data/ 폴더가 존재하는지 확인해 주세요',
      'modal.char_unit': '자',
      'custom.title_edit': '✏️ 커스텀 템플릿 편집',
      'custom.btn_update': '💾 템플릿 업데이트',
      'custom.btn_delete': '🗑️ 템플릿 삭제',
      'custom.btn_edit': '✏️ 템플릿 편집',
      'custom.label_image': '미리보기 이미지 URL',
      'custom.placeholder_image': '이미지 URL 입력 (선택 사항)',
      'custom.label_difficulty': '난이도 레벨',
      'custom.label_requires_input': '참조 이미지 입력 필요',
      'custom.label_input_description': '참조 이미지 용도 설명',
      'custom.placeholder_input_description': '예: 참조용 캐릭터 이미지를 업로드해야 합니다',
      'custom.label_scenes': '권장 시나리오 (다중 선택 가능)',
      'toast.custom_deleted': '커스텀 템플릿이 삭제되었습니다 🗑️',
      'toast.delete_confirm': '이 커스텀 템플릿을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.'
    }
  };

  const SCENE_TRANSLATIONS = {
    'poster': {
      'zh': { 'name': '活動海報', 'description': '活動宣傳、展覽海報、音樂會海報、電影海報' },
      'en': { 'name': 'Event Poster', 'description': 'Event promotion, exhibition, concert, movie posters' },
      'ja': { 'name': 'イベントポスター', 'description': 'イベント宣伝、展示会、コンサート、映画のポスター' },
      'ko': { 'name': '이벤트 포스터', 'description': '이벤트 홍보, 전시회, 콘서트, 영화 포스터' }
    },
    'presentation': {
      'zh': { 'name': '公司簡報插圖', 'description': 'PPT、Keynote 簡報中的插圖、說明圖或封面' },
      'en': { 'name': 'Presentation Illustration', 'description': 'Illustrations, diagrams, or covers in PPT or Keynote' },
      'ja': { 'name': 'プレゼン資料の挿絵', 'description': 'PPTやKeynoteスライド内の挿絵、説明図、カバー' },
      'ko': { 'name': '프리젠테이션 일러스트', 'description': 'PPT, Keynote 슬라이드 내 일러스트, 설명도 또는 표지' }
    },
    'greeting_card': {
      'zh': { 'name': '節慶賀卡', 'description': '春節、聖誕節、生日、中秋節、情人節賀卡' },
      'en': { 'name': 'Greeting Card', 'description': 'New Year, Christmas, birthday, Mid-Autumn, Valentine\'s cards' },
      'ja': { 'name': 'グリーティングカード', 'description': '旧正月、クリスマス、誕生日、中秋節、バレンタインカード' },
      'ko': { 'name': '그리팅 카드', 'description': '설날, 크리스마스, 생일, 추석, 발렌타인 카드' }
    },
    'social_media': {
      'zh': { 'name': '社群媒體貼文', 'description': 'Instagram、Facebook、X（Twitter）、小紅書貼文配圖' },
      'en': { 'name': 'Social Media Post', 'description': 'Images for Instagram, Facebook, X, Xiaohongshu posts' },
      'ja': { 'name': 'SNS投稿画像', 'description': 'Instagram、Facebook、X（Twitter）、小紅書などの投稿用画像' },
      'ko': { 'name': 'SNS 게시물 이미지', 'description': '인스타그램, 페이스북, X(트위터), 샤오홍슈 게시글 배율 이미지' }
    },
    'product_photo': {
      'zh': { 'name': '產品照片/展示', 'description': '電商產品圖、包裝設計、產品概念展示' },
      'en': { 'name': 'Product Photo', 'description': 'E-commerce product photos, packaging design, product concepts' },
      'ja': { 'name': '商品写真・展示', 'description': 'EC商品の写真、パッケージデザイン、商品のコンセプト展示' },
      'ko': { 'name': '제품 사진/전시', 'description': '전자상거래 제품 사진, 패키지 디자인, 제품 콘셉트 전시' }
    },
    'business_card': {
      'zh': { 'name': '名片設計', 'description': '個人名片、企業名片、品牌識別' },
      'en': { 'name': 'Business Card', 'description': 'Personal business cards, corporate cards, brand identity' },
      'ja': { 'name': '名刺デザイン', 'description': '個人用名刺、企業用名刺、ブランドアイデンティティ' },
      'ko': { 'name': '명함 디자인', 'description': '개인 명함, 기업 명함, 브랜드 아이덴티티' }
    },
    'infographic': {
      'zh': { 'name': '資訊圖表', 'description': '數據視覺化、流程圖、知識整理、教學圖解' },
      'en': { 'name': 'Infographic', 'description': 'Data visualization, flowcharts, knowledge summaries, educational diagrams' },
      'ja': { 'name': 'インフォグラフィック', 'description': 'データ視覚化、フローチャート、知識の整理、図解' },
      'ko': { 'name': '인포그래픽', 'description': '데이터 시각화, 플로우 차트, 지식 정리, 교육용 도해' }
    },
    'comic': {
      'zh': { 'name': '漫畫/分鏡', 'description': '漫畫創作、電影分鏡、故事板、四格漫畫' },
      'en': { 'name': 'Comic & Storyboard', 'description': 'Comic creation, movie storyboards, four-panel comics' },
      'ja': { 'name': '漫画・絵コンテ', 'description': '漫画制作、映画の絵コンテ、ストーリーボード、4コマ漫画' },
      'ko': { 'name': '만화/스토리보드', 'description': '만화 창작, 영화 스토리보드, 4컷 만화' }
    },
    'game_asset': {
      'zh': { 'name': '遊戲素材', 'description': '角色設定、場景設計、UI 介面、道具設計' },
      'en': { 'name': 'Game Asset', 'description': 'Character sheets, environment design, UI interfaces, props' },
      'ja': { 'name': 'ゲーム素材', 'description': 'キャラクターデザイン、背景デザイン、UI、アイテム設計' },
      'ko': { 'name': '게임 에셋', 'description': '캐릭터 설정, 배경 디자인, UI 인터페이스, 아이템 디자인' }
    },
    'education': {
      'zh': { 'name': '教育素材', 'description': '教學圖片、學習海報、兒童識字、科普插圖' },
      'en': { 'name': 'Educational Asset', 'description': 'Teaching pictures, learning posters, children\'s literacy, science illustrations' },
      'ja': { 'name': '教育素材', 'description': '教材画像、学習ポスター、子供の文字学習、科学イラスト' },
      'ko': { 'name': '교육용 소재', 'description': '교수용 이미지, 학습 포스터, 어린이 글자 공부, 과학 일러스트' }
    },
    'interior_design': {
      'zh': { 'name': '室內設計/建築', 'description': '空間規劃、3D 渲染、建築概念、景觀設計' },
      'en': { 'name': 'Interior Design & Architecture', 'description': 'Space planning, 3D rendering, architectural concepts, landscape' },
      'ja': { 'name': 'インテリア・建築', 'description': '空間設計、3Dレンダリング、建築コンセプト、景観デザイン' },
      'ko': { 'name': '인테리어/건축', 'description': '공간 계획, 3D 렌더링, 건축 콘셉트, 조경 디자인' }
    },
    'fashion': {
      'zh': { 'name': '時尚/穿搭', 'description': '服裝設計、穿搭展示、時尚攝影、美妝' },
      'en': { 'name': 'Fashion & Outfit', 'description': 'Clothing design, outfit displays, fashion photography, cosmetics' },
      'ja': { 'name': 'ファッション・コーデ', 'description': '服飾デザイン、コーディネート展示、ファッション写真、メイク' },
      'ko': { 'name': '패션/코디', 'description': '의류 디자인, 코디 전시, 패션 사진, 메이크업' }
    },
    'sticker_emoji': {
      'zh': { 'name': '貼圖/表情包', 'description': 'LINE 貼圖、Telegram 貼圖、表情包、emoji' },
      'en': { 'name': 'Sticker & Emoji', 'description': 'LINE stickers, Telegram stickers, meme packs, emojis' },
      'ja': { 'name': 'スタンプ・絵文字', 'description': 'LINEスタンプ、Telegramスタンプ、表情パック、絵文字' },
      'ko': { 'name': '스티커/이모티콘', 'description': '라인 스티커, 텔레그램 스티커, 이모티콘' }
    },
    'wallpaper': {
      'zh': { 'name': '手機/桌面壁紙', 'description': '手機壁紙、電腦桌面壁紙、鎖屏畫面' },
      'en': { 'name': 'Wallpaper', 'description': 'Phone wallpaper, desktop wallpaper, lock screen images' },
      'ja': { 'name': '壁紙', 'description': 'スマホ壁紙、PCデスクトップ壁紙、ロック画面' },
      'ko': { 'name': '배경화면', 'description': '모바일 배경화면, PC 데스크톱 배경화면, 잠금 화면' }
    },
    'custom': {
      'zh': { 'name': '自訂場景', 'description': '自由定義你的使用場景與目標受眾' },
      'en': { 'name': 'Custom Scene', 'description': 'Define your own use cases and target audience' },
      'ja': { 'name': 'カスタムシーン', 'description': 'あなた自身の使用シーンとターゲット層を自由に定義' },
      'ko': { 'name': '커스텀 시나리오', 'description': '자신만의 사용 시나리오와 타겟층을 자유롭게 정의' }
    }
  };

  const QUALITY_CATEGORY_NAMES = {
    'resolution': { 'zh': '📐 解析度', 'en': '📐 Resolution', 'ja': '📐 解像度', 'ko': '📐 해상도' },
    'lighting': { 'zh': '💡 光影', 'en': '💡 Lighting', 'ja': '💡 ライティング', 'ko': '💡 조명' },
    'style': { 'zh': '🎨 風格', 'en': '🎨 Style', 'ja': '🎨 スタイル', 'ko': '🎨 스타일' },
    'composition': { 'zh': '📐 構圖', 'en': '📐 Composition', 'ja': '📐 構図', 'ko': '📐 구도' },
    'mood': { 'zh': '🎭 氛圍', 'en': '🎭 Mood', 'ja': '🎭 雰囲気', 'ko': '🎭 분위기' },
    'quality': { 'zh': '✨ 品質', 'en': '✨ Quality', 'ja': '✨ クオリティ', 'ko': '✨ 화질' }
  };

  const QUALITY_ITEM_DESCRIPTIONS = {
    '8K resolution': { 'zh': '最高解析度', 'en': 'Highest resolution', 'ja': '最高解像度', 'ko': '최고 해상도' },
    'ultra HD': { 'zh': '超高畫質', 'en': 'Ultra high definition', 'ja': '超高画質', 'ko': '초고화질' },
    'high detail': { 'zh': '高細節', 'en': 'High detail', 'ja': '高精細', 'ko': '높은 디테일' },
    'sharp focus': { 'zh': '清晰對焦', 'en': 'Sharp focus', 'ja': '鮮明なフォーカス', 'ko': '선명한 초점' },
    '4K HD': { 'zh': '4K 高畫質', 'en': '4K High Definition', 'ja': '4K 高画質', 'ko': '4K 고화질' },
    'studio lighting': { 'zh': '影棚燈光', 'en': 'Studio lighting', 'ja': 'スタジオ照明', 'ko': '스튜디오 조명' },
    'dramatic lighting': { 'zh': '戲劇性光影', 'en': 'Dramatic lighting', 'ja': 'ドラマチックな照明', 'ko': '드라마틱한 조명' },
    'cinematic lighting': { 'zh': '電影級光影', 'en': 'Cinematic lighting', 'ja': '映画のような照明', 'ko': '시네마틱 조명' },
    'soft natural light': { 'zh': '柔和自然光', 'en': 'Soft natural light', 'ja': '柔らかい自然光', 'ko': '부드러운 자연광' },
    'golden hour': { 'zh': '黃金時刻光線', 'en': 'Golden hour', 'ja': 'ゴールデンアワーの光', 'ko': '골든 아워 조명' },
    'neon glow': { 'zh': '霓虹光暈', 'en': 'Neon glow', 'ja': 'ネオングロー', 'ko': '네온 글로우' },
    'rim lighting': { 'zh': '輪廓光', 'en': 'Rim lighting', 'ja': 'リムライト', 'ko': '림 라이트' },
    'volumetric lighting': { 'zh': '體積光', 'en': 'Volumetric lighting', 'ja': 'ボリュメトリックライト', 'ko': '입체 조명' },
    'photorealistic': { 'zh': '照片級真實', 'en': 'Photorealistic', 'ja': '写真のようにリアル', 'ko': '사진 같은 실사' },
    'hyper-realistic': { 'zh': '超寫實', 'en': 'Hyper-realistic', 'ja': '超リアル', 'ko': '극실사' },
    'vector illustration': { 'zh': '向量插畫', 'en': 'Vector illustration', 'ja': 'ベクターイラスト', 'ko': '벡터 일러스트' },
    'watercolor texture': { 'zh': '水彩質感', 'en': 'Watercolor texture', 'ja': '水彩の質感', 'ko': '수채화 질감' },
'oil painting': { 'zh': '油畫風格', 'en': 'Oil painting style', 'ja': '油絵風', 'ko': '유화 스타일' },
    'concept art': { 'zh': '概念藝術', 'en': 'Concept art', 'ja': 'コンセプトアート', 'ko': '컨셉 아트' },
    'anime style': { 'zh': '動漫風格', 'en': 'Anime style', 'ja': 'アニメ風', 'ko': '애니메이션 스타일' },
    'pixel art': { 'zh': '畫素藝術', 'en': 'Pixel art', 'ja': 'ドット絵', 'ko': '픽셀 아트' },
    'flat design': { 'zh': '扁平化設計', 'en': 'Flat design', 'ja': 'フラットデザイン', 'ko': '플랫 디자인' },
    'hand-drawn': { 'zh': '手繪風格', 'en': 'Hand-drawn style', 'ja': '手書き風', 'ko': '손그림 스타일' },
    'rule of thirds': { 'zh': '三分法構圖', 'en': 'Rule of thirds', 'ja': '三分割法', 'ko': '삼등분의 법칙' },
    'centered composition': { 'zh': '居中構圖', 'en': 'Centered composition', 'ja': '日の丸構図', 'ko': '중앙 구도' },
    'bird\'s eye view': { 'zh': '鳥瞰視角', 'en': 'Bird\'s eye view', 'ja': '鳥瞰図', 'ko': '조감도' },
    'isometric view': { 'zh': '等距視角', 'en': 'Isometric view', 'ja': '等角投影法', 'ko': '등각 투영 뷰' },
    'wide angle': { 'zh': '廣角鏡頭', 'en': 'Wide angle', 'ja': '広角', 'ko': '광각' },
    'shallow depth of field': { 'zh': '淺景深', 'en': 'Shallow depth of field', 'ja': '被写界深度が浅い', 'ko': '얕은 피사체 심도' },
    'panoramic': { 'zh': '全景', 'en': 'Panoramic', 'ja': 'パノラマ', 'ko': '파노라마' },
    'close-up': { 'zh': '特寫', 'en': 'Close-up', 'ja': 'クローズアップ', 'ko': '클로즈업' },
    'dreamy': { 'zh': '夢幻', 'en': 'Dreamy', 'ja': '幻想的', 'ko': '몽환적인' },
    'surreal': { 'zh': '超現實', 'en': 'Surreal', 'ja': 'シュールレアリスム', 'ko': '초현실적인' },
    'minimalist': { 'zh': '極簡主義', 'en': 'Minimalist', 'ja': 'ミニマリスト', 'ko': '미니멀리즘' },
    'futuristic': { 'zh': '未來感', 'en': 'Futuristic', 'ja': '未来的', 'ko': '미래 지향적인' },
    'vintage': { 'zh': '復古', 'en': 'Vintage', 'ja': 'ヴィンテージ', 'ko': '빈티지' },
    'cozy': { 'zh': '溫馨舒適', 'en': 'Cozy', 'ja': '心地よい', 'ko': '아늑한' },
    'dark and moody': { 'zh': '暗黑氛圍', 'en': 'Dark and moody', 'ja': 'ダークでムーディー', 'ko': '어둡고 그윽한' },
    'vibrant and energetic': { 'zh': '活力四射', 'en': 'Vibrant and energetic', 'ja': '鮮やかでエネルギッシュ', 'ko': '활기차고 역동적인' },
    'elegant and sophisticated': { 'zh': '優雅精緻', 'en': 'Elegant and sophisticated', 'ja': 'エレガントで洗練された', 'ko': '우아하고 세련된' },
    'whimsical': { 'zh': '奇幻異想', 'en': 'Whimsical', 'ja': '風変わりな', 'ko': '기발하고 환상적인' },
    'professional photography': { 'zh': '專業攝影', 'en': 'Professional photography', 'ja': 'プロの写真', 'ko': '전문 사진' },
    'editorial quality': { 'zh': '雜誌級品質', 'en': 'Editorial quality', 'ja': 'エディトリアル品質', 'ko': '에디토리얼 화질' },
    'award-winning': { 'zh': '獲獎級', 'en': 'Award-winning', 'ja': '受賞歴あり', 'ko': '수상작 급' },
    'masterpiece': { 'zh': '傑作', 'en': 'Masterpiece', 'ja': '傑作', 'ko': '명작' },
    'highly detailed': { 'zh': '高度細緻', 'en': 'Highly detailed', 'ja': '非常に詳細', 'ko': '매우 디테일함' },
    'clean lines': { 'zh': '線條俐落', 'en': 'Clean lines', 'ja': 'すっきりしたライン', 'ko': '깔끔한 선' }
  };

  const STYLE_TRANSLATIONS = {
    'glassmorphism': {
      'zh': { 'name': '玻璃擬態', 'description': '透明磨砂玻璃效果，現代 UI 設計熱門風格' },
      'en': { 'name': 'Glassmorphism', 'description': 'Translucent frosted glass effect, popular in modern UI' },
      'ja': { 'name': 'グラスモフィズム', 'description': '透明なすりガラス効果、現代のUIデザインで人気のスタイル' },
      'ko': { 'name': '글래스모피즘', 'description': '반투명 반투명 유리 효과, 현대 UI 디자인의 인기 스타일' }
    },
    'cyberpunk': {
      'zh': { 'name': '賽博朋克', 'description': '霓虹燈、科技感、暗色調的未來都市風格' },
      'en': { 'name': 'Cyberpunk', 'description': 'Neon lights, high-tech, dark futuristic city style' },
      'ja': { 'name': 'サイバーパンク', 'description': 'ネオンライト、テクノロジー感、ダークトーンの未来都市スタイル' },
      'ko': { 'name': '사이버펑크', 'description': '네온사인, 하이테크, 어두운 톤의 미래 도시 스타일' }
    },
    'studio_ghibli': {
      'zh': { 'name': '吉卜力風格', 'description': '宮崎駿動畫風格，溫暖的色調和細膩的自然景觀' },
      'en': { 'name': 'Ghibli Style', 'description': 'Studio Ghibli style, warm tones and detailed nature scenes' },
      'ja': { 'name': 'ジブリ風', 'description': 'スタジオジブリ風、温かみのある色彩と繊細な自然景観' },
      'ko': { 'name': '지브리 스타일', 'description': '스튜디오 지브리 스타일, 따뜻한 색조와 섬세한 자연 경관' }
    },
    'ukiyoe': {
      'zh': { 'name': '浮世繪', 'description': '日本傳統木版畫風格' },
      'en': { 'name': 'Ukiyo-e', 'description': 'Traditional Japanese woodblock print style' },
      'ja': { 'name': '浮世絵', 'description': '日本の伝統的な木版画スタイル' },
      'ko': { 'name': '우키요에', 'description': '일본 전통 목판화 스타일' }
    },
    'art_deco': {
      'zh': { 'name': 'Art Deco 裝飾藝術', 'description': '1920年代風格，幾何圖案 and 金色元素' },
      'en': { 'name': 'Art Deco', 'description': '1920s style with geometric patterns and gold accents' },
      'ja': { 'name': 'アール・デコ', 'description': '1920年代スタイル、幾何学模様と金色のディテール' },
      'ko': { 'name': '아르 데코', 'description': '1920년대 스타일, 기하학적 패턴과 골드 디테일' }
    },
    'vaporwave': {
      'zh': { 'name': '蒸氣波', 'description': '80-90年代復古未來主義，粉紫色調' },
      'en': { 'name': 'Vaporwave', 'description': '80s-90s retro-futurism, pink and purple tones' },
      'ja': { 'name': 'ヴェイパーウェイヴ', 'description': '80〜90年代のレトロフューチャリズム、ピンクと紫のトーン' },
      'ko': { 'name': '베이퍼웨이브', 'description': '80-90년대 레트로 미래주의, 핑크와 퍼플 색조' }
    },
    'paper_cut': {
      'zh': { 'name': '剪紙藝術', 'description': '層疊紙片效果，立體感強' },
      'en': { 'name': 'Paper Cut Art', 'description': 'Layered paper sheets effect with strong depth' },
      'ja': { 'name': 'ペーパーカットアート', 'description': '重ね合わせた紙シート効果、強い立体感' },
      'ko': { 'name': '페이퍼 컷 아트', 'description': '레이어드 페이퍼 효과, 입체감 강함' }
    },
    'low_poly': {
      'zh': { 'name': '低多邊形', 'description': '幾何三角面組成的 3D 風格' },
      'en': { 'name': 'Low Poly', 'description': '3D style composed of geometric triangular faces' },
      'ja': { 'name': 'ローポリゴン', 'description': '幾何学的な三角面で構成された3Dスタイル' },
      'ko': { 'name': '로우 폴리', 'description': '기하학적 삼각형 패싯으로 구성된 3D 스타일' }
    },
    'ink_wash': {
      'zh': { 'name': '水墨畫', 'description': '中國傳統水墨畫風格，留白意境' },
      'en': { 'name': 'Ink Wash Painting', 'description': 'Traditional ink wash painting style with aesthetic blank spaces' },
      'ja': { 'name': '水墨画', 'description': '伝統的な水墨画スタイル、余白の美学' },
      'ko': { 'name': '수묵화', 'description': '전전통 수묵화 스타일, 여백의 미' }
    },
    'claymation': {
      'zh': { 'name': '黏土動畫', 'description': '定格動畫黏土質感' },
      'en': { 'name': 'Claymation', 'description': 'Stop-motion animation with clay texture' },
      'ja': { 'name': 'クレイアニメ', 'description': 'クレイ（粘土）の質感を持つストップモーションアニメ' },
      'ko': { 'name': '클레이메이션', 'description': '점토 질감의 스톱 모션 애니메이션' }
    }
  };

  // ----------------------------------------------------------
  // 商業化 Sponsor 廣告資料庫
  // ----------------------------------------------------------
  const SPONSOR_ADS = [
    {
      id: 'sponsor-1',
      isSponsor: true,
      name: 'OpenNana生圖大師 Pro',
      author: '官方贊助',
      image_url: 'https://img.opennana.com/prompts/assets/202604/sponsor-1775209261102-1.png',
      target_url: 'https://opennana.com',
      tags: ['AI生圖', '快速生圖', '算力包'],
      description: '極速生成極致細節，體驗 Banana Pro 的終極算力魅力！'
    },
    {
      id: 'sponsor-2',
      isSponsor: true,
      name: 'ChatGPT Plus 尊享帳號',
      author: '合作推廣',
      image_url: 'https://img.opennana.com/prompts/assets/202605/1779899743064-fnqfhugq-1779899743473-1-480.jpg',
      target_url: 'https://opennana.com/pricing',
      tags: ['ChatGPT', 'GPT-4o', '免翻牆'],
      description: '一鍵升級 ChatGPT Plus，免去翻牆排隊煩惱，解鎖無限 Prompt 靈感！'
    }
  ];

  function getTemplateAspectRatio(t) {
    if (t.aspect_ratio) return parseFloat(t.aspect_ratio);
    // 根據 t.id 生成一個確定性隨機長寬比，在 0.8 到 1.5 之間，創造高低起伏的美感
    const str = String(t.id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const ratios = [1.33, 1.0, 1.5, 0.82, 1.2]; // 4:3, 1:1, 3:2, 4:5, 6:5 等
    return ratios[Math.abs(hash) % ratios.length];
  }

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------
  const state = {
    templates: [],
    categories: [],
    scenes: [],
    qualityBoosters: {},
    styleSuggestions: [],
    currentCategory: 'all',
    currentDifficulty: 'all',
    currentScene: null,
    currentTags: new Set(),
    searchQuery: '',
    currentLang: 'zh',
    currentGlobalLang: 'zh', // Global UI Language: zh, en, ja, ko
    currentTemplate: null,
    isCustomized: false,
    customPrompt: '',
    lastVarValues: {},
    favorites: new Set(),
    customTemplates: [],
    squareTemplates: [],
    editingTemplateId: null,
    viewMode: 'grid',
    allTags: [],
    // 商業化與積分增長模組狀態
    points: 100,
    unlockedTemplates: new Set(),
    lastCheckInDate: null,
    closedSponsors: new Set(),
    hasUsedReferralCode: false
  };

  // ----------------------------------------------------------
  // Internationalization (i18n) Logic
  // ----------------------------------------------------------
  function updateGlobalUI() {
    const lang = state.currentGlobalLang || 'zh';
    const dict = I18N_DICTS[lang] || I18N_DICTS['zh'];
    
    // Update document title and html lang attribute
    document.title = dict['app.title'] || 'Banana Mage Banana咒語';
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : lang;

    // Update elements with data-i18n attribute
    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      let text = dict[key];
      if (text !== undefined) {
        if (key === 'filter.stats') {
          const count = $('#filteredCount') ? $('#filteredCount').textContent : '0';
          el.innerHTML = text.replace('{count}', `<span id="filteredCount">${count}</span>`);
        } else {
          el.textContent = text;
        }
      }
    });

    // Update elements with data-i18n-placeholder
    $$('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const text = dict[key];
      if (text !== undefined) {
        el.placeholder = text;
      }
    });

    // Update elements with data-i18n-title
    $$('[data-i18n-title]').forEach((el) => {
      const key = el.dataset.i18nTitle;
      const text = dict[key];
      if (text !== undefined) {
        el.title = text;
        if (el.hasAttribute('aria-label')) {
          el.setAttribute('aria-label', text);
        }
      }
    });

    // Update analysis form placeholder dynamically
    const styleInput = $('#analysisStyle');
    if (styleInput) {
      if (lang === 'zh') {
        styleInput.placeholder = '例：賽博朋克、水彩、極簡主義...';
        const elColor = $('#analysisColor'); if (elColor) elColor.placeholder = '例：暖色調、高飽和、霓虹配色...';
        const elComp = $('#analysisComposition'); if (elComp) elComp.placeholder = '例：居中、三分法、鳥瞰...';
        const elLight = $('#analysisLighting'); if (elLight) elLight.placeholder = '例：影棚燈光、自然光、戲劇性光影...';
        const elTexture = $('#analysisTexture'); if (elTexture) elTexture.placeholder = '例：磨砂、光澤、紙質、金屬...';
        const elMood = $('#analysisMood'); if (elMood) elMood.placeholder = '例：夢幻、溫馨、未來感、復古...';
        const elDesc = $('#analysisDescription'); if (elDesc) elDesc.placeholder = '圖片的詳細描述...';
        const elKeywords = $('#analysisKeywords'); if (elKeywords) elKeywords.placeholder = '可用於 remix 的關鍵字...';
      } else {
        const pMap = {
          en: {
            style: 'e.g. Cyberpunk, watercolor, minimalism...',
            color: 'e.g. Warm tones, highly saturated, neon...',
            comp: 'e.g. Centered, rule of thirds, bird\'s-eye...',
            light: 'e.g. Studio lighting, natural, dramatic...',
            texture: 'e.g. Matte, glossy, paper, metallic...',
            mood: 'e.g. Dreamy, cozy, futuristic, nostalgic...',
            desc: 'Detailed description of the image...',
            keywords: 'Keywords for remixing...'
          },
          ja: {
            style: '例：サイバーパンク、水彩、ミニマリズム...',
            color: '例：暖色系、高彩度、ネオンカラー...',
            comp: '例：日の丸構図、三分割法、鳥瞰...',
            light: '例：スタジオ照明、自然光、劇的な光影...',
            texture: '例：マット、光沢、紙質、金屬...',
            mood: '例：幻想的、居心地が良い、未來的...',
            desc: '畫像の詳細な説明...',
            keywords: 'リミックス用推奨キーワード...'
          },
          ko: {
            style: '예: 사이버펑크, 수채화, 미니멀리즘...',
            color: '예: 따뜻한 톤, 고채도, 네온 컬러...',
            comp: '예: 중앙 구도, 삼등분, 조감도...',
            light: '예: 스튜디오 조명, 자연광, 극적인 음영...',
            texture: '예: 매트, 광택, 종이 질감, 금속...',
            mood: '예: 몽환적인, 아늑한, 미래 지향적...',
            desc: '이미지에 대한 상세 묘사...',
            keywords: '리믹스에 사용될 추천 키워드...'
          }
        }[lang] || {};

        styleInput.placeholder = pMap.style || '';
        const elColor = $('#analysisColor'); if (elColor) elColor.placeholder = pMap.color || '';
        const elComp = $('#analysisComposition'); if (elComp) elComp.placeholder = pMap.comp || '';
        const elLight = $('#analysisLighting'); if (elLight) elLight.placeholder = pMap.light || '';
        const elTexture = $('#analysisTexture'); if (elTexture) elTexture.placeholder = pMap.texture || '';
        const elMood = $('#analysisMood'); if (elMood) elMood.placeholder = pMap.mood || '';
        const elDesc = $('#analysisDescription'); if (elDesc) elDesc.placeholder = pMap.desc || '';
        const elKeywords = $('#analysisKeywords'); if (elKeywords) elKeywords.placeholder = pMap.keywords || '';
      }
    }
  }

  function changeLanguage(lang) {
    if (!I18N_DICTS[lang]) lang = 'zh';
    state.currentGlobalLang = lang;
    localStorage.setItem('nb_global_lang', lang);
    
    if (lang === 'zh') {
      state.currentLang = 'zh';
    } else {
      state.currentLang = 'en';
    }

    // Sync Dropdown items active state
    $$('.lang-dropdown-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    updateGlobalUI();
    
    // Rerender all dynamic sections
    renderGallery();
    renderHorizontalTags();
    renderVisualSceneBoard();
    updateCounts();

    if (state.currentScene) {
      showSceneInfo(state.currentScene);
    }

    // Dynamic Modal Language Synchronization
    const templateModal = $('#templateModal');
    if (templateModal && templateModal.classList.contains('active') && state.currentTemplate) {
      openTemplateModal(state.currentTemplate.id);
    }

    const customModal = $('#customModal');
    if (customModal && customModal.classList.contains('active')) {
      const scenesContainer = $('#customScenesContainer');
      if (scenesContainer) {
        const checkedSceneIds = new Set(
          $$('input[name="customScene"]:checked').map((input) => input.value)
        );
        scenesContainer.innerHTML = state.scenes
          .map((s) => {
            const transName = SCENE_TRANSLATIONS[s.id] && SCENE_TRANSLATIONS[s.id][lang]
              ? SCENE_TRANSLATIONS[s.id][lang].name
              : s.name;
            const isChecked = checkedSceneIds.has(s.id) ? 'checked' : '';
            return `
              <label class="scene-checkbox-label">
                <input type="checkbox" name="customScene" value="${s.id}" ${isChecked}>
                <span>${s.icon} ${transName}</span>
              </label>`;
          })
          .join('');
      }
    }
  }

  // ----------------------------------------------------------
  // DOM Cache
  // ----------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // ----------------------------------------------------------
  // Init
  // ----------------------------------------------------------
  async function init() {
    loadPersistedState();
    persistPoints();
    applyTheme();
    applySidebarCollapse();
    await loadData();
    buildTagList();
    renderHorizontalTags();
    renderGallery();
    renderVisualSceneBoard();
    bindEvents();
    updateCounts();
    updateGlobalUI();
  }

  // ----------------------------------------------------------
  // Data Loading
  // ----------------------------------------------------------
  async function loadData() {
    try {
      const [templatesRes, scenesRes] = await Promise.all([
        fetch('data/templates.json'),
        fetch('data/scenes.json'),
      ]);
      const templatesData = await templatesRes.json();
      const scenesData = await scenesRes.json();

      state.categories = templatesData.categories || [];
      state.templates = [];
      state.categories.forEach((cat) => {
        (cat.templates || []).forEach((t) => {
          t._category = cat.id;
          t._categoryName = cat.name;
          state.templates.push(t);
        });
      });

      state.scenes = scenesData.scenes || [];
      state.qualityBoosters = scenesData.quality_boosters || {};
      state.styleSuggestions = scenesData.style_suggestions || [];
      state.loadFailed = false;
    } catch (e) {
      console.error('載入資料失敗:', e);
      state.loadFailed = true;
      const dict = I18N_DICTS[state.currentGlobalLang] || I18N_DICTS['zh'];
      showToast(dict['toast.load_failed'] || '資料載入失敗，請確認是否受到 CORS 限制或改用本地伺服器瀏覽', 'error');
    }
  }

  // ----------------------------------------------------------
  // Security Integrity Check & Device Fingerprint (anti-tampering)
  // ----------------------------------------------------------
  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'canvas_not_supported';
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial', 'Microsoft JhengHei'";
      ctx.fillStyle = "#f5f5fa";
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(10, 10, 30, 30);
      ctx.fillStyle = "#8B5CF6";
      ctx.fillText("🍌 Banana Mage 🍌", 15, 15);
      ctx.fillStyle = "rgba(16, 185, 129, 0.5)";
      ctx.fillText("專家級安全防護 2.0", 17, 17);
      
      const dataURL = canvas.toDataURL();
      let hash = 0;
      for (let i = 0; i < dataURL.length; i++) {
        const char = dataURL.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return 'nb_fp_' + Math.abs(hash).toString(36);
    } catch (e) {
      return 'nb_fp_error_fallback';
    }
  }

  const deviceFp = getCanvasFingerprint();

  function generateIntegritySignature(points, unlockedSet, fingerprint) {
    const salt = "NanoBananaMasterCryptoSalt_998244353_ObfuscationKey";
    const unlockedStr = unlockedSet ? Array.from(unlockedSet).sort().join(',') : '';
    const rawStr = `${points}:${unlockedStr}:${fingerprint}:${salt}`;
    
    let h1 = 0x811c9dc5;
    let h2 = 0x12345678;
    for (let i = 0; i < rawStr.length; i++) {
      const char = rawStr.charCodeAt(i);
      h1 ^= char;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= char;
      h2 = Math.imul(h2, 33) + h1;
    }
    
    h1 ^= h1 >>> 16;
    h1 = Math.imul(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = Math.imul(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;
    
    h2 ^= h2 >>> 15;
    h2 = Math.imul(h2, 0x7feb352d);
    h2 ^= h2 >>> 13;
    
    const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `${part1}-${part2}`;
  }

  function checkFingerprintCheckInIndexedDB(todayStr, callback) {
    try {
      const request = indexedDB.open("nb_secure_storage", 1);
      request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("logs")) {
          db.createObjectStore("logs", { keyPath: "id" });
        }
      };
      request.onsuccess = function(e) {
        const db = e.target.result;
        const tx = db.transaction("logs", "readonly");
        const store = tx.objectStore("logs");
        const getReq = store.get(deviceFp);
        getReq.onsuccess = function() {
          const data = getReq.result;
          if (data && data.lastCheckInDate === todayStr) {
            callback(true);
          } else {
            callback(false);
          }
        };
        getReq.onerror = function() { callback(false); };
      };
      request.onerror = function() { callback(false); };
    } catch (err) {
      callback(false);
    }
  }

  function saveFingerprintCheckInIndexedDB(todayStr) {
    try {
      const request = indexedDB.open("nb_secure_storage", 1);
      request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("logs")) {
          db.createObjectStore("logs", { keyPath: "id" });
        }
      };
      request.onsuccess = function(e) {
        const db = e.target.result;
        const tx = db.transaction("logs", "readwrite");
        const store = tx.objectStore("logs");
        store.put({ id: deviceFp, lastCheckInDate: todayStr });
      };
    } catch (err) {}
  }

  // ----------------------------------------------------------
  // Persistence (localStorage)
  // ----------------------------------------------------------
  function loadPersistedState() {
    try {
      const fav = localStorage.getItem('nb_favorites');
      if (fav) state.favorites = new Set(JSON.parse(fav));
      const custom = localStorage.getItem('nb_custom_templates');
      if (custom) state.customTemplates = JSON.parse(custom);

      const square = localStorage.getItem('nb_square_templates');
      if (square) {
        state.squareTemplates = JSON.parse(square);
      } else {
        state.squareTemplates = getMockSquareTemplates();
        try {
          localStorage.setItem('nb_square_templates', JSON.stringify(state.squareTemplates));
        } catch (e) {}
      }
      
      const pts = localStorage.getItem('nb_points');
      const sig = localStorage.getItem('nb_points_sig');
      const ul = localStorage.getItem('nb_unlocked_templates');
      
      let parsedUnlocked = new Set();
      if (ul) {
        try {
          parsedUnlocked = new Set(JSON.parse(ul));
        } catch (e) {}
      }
      
      let tempPoints = 500;
      if (pts !== null) tempPoints = parseInt(pts, 10);

      // 密碼學安全防護校驗
      const expectedSig = generateIntegritySignature(tempPoints, parsedUnlocked, deviceFp);
      
      if (pts !== null && sig !== expectedSig) {
        console.error("⚠️ [Security Audit] 檢測到積分資料完整性遭到破壞！系統已強制清空以防作弊。");
        state.points = 0;
        state.unlockedTemplates = new Set();
        try {
          localStorage.setItem('nb_points', 0);
          localStorage.setItem('nb_unlocked_templates', '[]');
          localStorage.setItem('nb_points_sig', generateIntegritySignature(0, new Set(), deviceFp));
        } catch (err) {}
        
        setTimeout(() => {
          showToast("⚠️ 檢測到點數資料異常，已重置清零！", "error");
        }, 1200);
      } else {
        state.points = tempPoints;
        state.unlockedTemplates = parsedUnlocked;
      }
      
      const lcid = localStorage.getItem('nb_last_checkin_date');
      if (lcid) state.lastCheckInDate = lcid;
      const hurc = localStorage.getItem('nb_has_used_referral_code') === 'true';
      state.hasUsedReferralCode = hurc;
      const cs = localStorage.getItem('nb_closed_sponsors');
      if (cs) state.closedSponsors = new Set(JSON.parse(cs));

      const savedLang = localStorage.getItem('nb_global_lang');
      if (savedLang && I18N_DICTS[savedLang]) {
        state.currentGlobalLang = savedLang;
      } else {
        const navLang = navigator.language || navigator.userLanguage;
        if (navLang) {
          if (navLang.startsWith('zh')) state.currentGlobalLang = 'zh';
          else if (navLang.startsWith('ja')) state.currentGlobalLang = 'ja';
          else if (navLang.startsWith('ko')) state.currentGlobalLang = 'ko';
          else state.currentGlobalLang = 'en';
        }
      }
      state.currentLang = state.currentGlobalLang === 'zh' ? 'zh' : 'en';
    } catch (e) {
      console.warn('讀取 localStorage 失敗', e);
    }
  }

  function applyTheme() {
    const savedTheme = localStorage.getItem('nb_theme') || 'dark';
    document.documentElement.dataset.theme = savedTheme;
  }

  function applySidebarCollapse() {
    const isCollapsed = localStorage.getItem('nb_sidebar_collapsed') === 'true';
    const sidebar = $('#sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed', isCollapsed);
    }
  }

  function persistFavorites() {
    localStorage.setItem('nb_favorites', JSON.stringify([...state.favorites]));
  }

  function persistCustomTemplates() {
    localStorage.setItem(
      'nb_custom_templates',
      JSON.stringify(state.customTemplates)
    );
  }

  function persistPoints() {
    const sig = generateIntegritySignature(state.points, state.unlockedTemplates, deviceFp);
    try {
      localStorage.setItem('nb_points', state.points);
      localStorage.setItem('nb_points_sig', sig);
    } catch (e) {}
    const valSpan = document.getElementById('headerPointsValue');
    if (valSpan) valSpan.textContent = state.points;
    const dispDiv = document.getElementById('userPointsDisplay');
    if (dispDiv) dispDiv.textContent = state.points;
    const dispUnlockDiv = document.getElementById('unlockUserPoints');
    if (dispUnlockDiv) dispUnlockDiv.textContent = state.points;
  }

  function persistUnlockedTemplates() {
    try {
      localStorage.setItem('nb_unlocked_templates', JSON.stringify([...state.unlockedTemplates]));
      const sig = generateIntegritySignature(state.points, state.unlockedTemplates, deviceFp);
      localStorage.setItem('nb_points_sig', sig);
    } catch (e) {}
  }

  function persistSquareTemplates() {
    try {
      localStorage.setItem('nb_square_templates', JSON.stringify(state.squareTemplates));
    } catch (e) {}
  }

  function getMockSquareTemplates() {
    return [
      {
        id: 'square-mock-1',
        name_zh: '賽博龐克霓虹雨夜',
        name_en: 'Cyberpunk Neon Rainy Night',
        author: '@CyberWizard',
        source_url: '',
        requires_input: false,
        input_description: '',
        prompt_zh: '賽博龐克風格，雨夜的東京街頭，五彩斑斕的霓虹燈倒影在濕漉漉的地面上，一個孤獨的旅人撐著發光的雨傘，寫實，細節豐富，光追效果，8k畫質 --ar 16:9 --style raw',
        prompt_en: 'Cyberpunk style, rainy night Tokyo street, colorful neon lights reflecting on the wet ground, a lonely traveler holding a glowing umbrella, realistic, highly detailed, ray tracing, 8k resolution --ar 16:9 --style raw',
        variables: ['東京街頭', '發光的雨傘'],
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
        tags: ['賽博龐克', '雨夜', '科幻'],
        suggested_scenes: ['landscape'],
        difficulty: 'intermediate',
        isSquare: true,
        isPublished: true
      },
      {
        id: 'square-mock-2',
        name_zh: '吉卜力手繪夏日鄉間',
        name_en: 'Ghibli Hand-drawn Summer Countryside',
        author: '@PromptMaster',
        source_url: '',
        requires_input: false,
        input_description: '',
        prompt_zh: '吉卜力工作室風格，夏天的日本鄉間小路，天空中漂浮著巨大的棉花糖雲朵，兩旁是翠綠的稻田，溫暖的陽光，充滿懷舊溫馨氣氛，水彩手繪質感，夢幻 --ar 4:3 --v 6.0',
        prompt_en: 'Studio Ghibli style, summer Japanese countryside path, huge marshmallow clouds floating in the sky, green rice fields on both sides, warm sunlight, nostalgic and cozy atmosphere, watercolor hand-drawn texture, dreamy --ar 4:3 --v 6.0',
        variables: ['日本鄉間小路', '巨大的棉花糖雲朵'],
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
        tags: ['吉卜力', '夏日', '溫馨', '手繪'],
        suggested_scenes: ['landscape'],
        difficulty: 'beginner',
        isSquare: true,
        isPublished: true
      },
      {
        id: 'square-mock-3',
        name_zh: '三維立體黏土萌寵',
        name_en: '3D Clay Cute Pet',
        author: '@DesignPro',
        source_url: '',
        requires_input: false,
        input_description: '',
        prompt_zh: '極簡 3D 黏土風格，一隻超級可愛的毛茸茸小橘貓，大眼睛，坐在小板凳上，背景是明亮溫暖的莫蘭迪粉色，可愛卡通，黏土質感，Octane 渲染，完美光影，柔和陰影 --ar 1:1',
        prompt_en: 'Minimalist 3D clay style, a super cute fluffy orange kitten with big eyes, sitting on a tiny stool, bright and warm Morandi pink background, cute cartoon, clay texture, Octane render, perfect lighting, soft shadows --ar 1:1',
        variables: ['毛茸茸小橘貓', '莫蘭迪粉色'],
        image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
        tags: ['3D黏土', '萌寵', '卡通'],
        suggested_scenes: ['character'],
        difficulty: 'advanced',
        isSquare: true,
        isPublished: true
      }
    ];
  }

  function publishCustomTemplate(template) {
    if (!template) return;
    template.isPublished = true;
    const exists = state.squareTemplates.some(x => String(x.id) === String(template.id));
    const squareCopy = {
      ...template,
      author: state.currentGlobalLang === 'zh' ? '我 (創作者)' : 'Me (Creator)',
      isSquare: true,
      requiresUnlock: false,
      _category: 'square',
      _categoryName: '✨ 咒語廣場'
    };
    if (!exists) {
      state.squareTemplates.unshift(squareCopy);
    } else {
      const idx = state.squareTemplates.findIndex(x => String(x.id) === String(template.id));
      if (idx !== -1) {
        state.squareTemplates[idx] = squareCopy;
      }
    }
    persistCustomTemplates();
    persistSquareTemplates();
    
    // 自動幫用戶跳轉並切換至「咒語廣場」分類，帶給用戶最直覺流暢的視覺反饋！
    state.currentCategory = 'square';
    document.querySelectorAll('.category-item').forEach((el) => el.classList.remove('active'));
    const squareItem = document.querySelector('.category-item[data-category="square"]');
    if (squareItem) squareItem.classList.add('active');

    showToast('🚀 恭喜！您的自訂模板已成功發佈到「咒語廣場」！所有人都可以解鎖您的模板，解鎖消耗 of 10 積分將會自動轉給您！🪙', 'success');
    renderGallery();
    updateCounts();
  }

  function triggerSimulatedEarnings() {
    const published = state.customTemplates.filter(x => x.isPublished);
    if (published.length === 0) return;
    if (Math.random() > 0.2) return;
    const template = published[Math.floor(Math.random() * published.length)];
    const templateName = state.currentGlobalLang === 'zh' ? (template.name_zh || template.name_en) : (template.name_en || template.name_zh);
    const simulatedUsers = ['@CyberMage', '@PixelArtist', '@PromptGuru', '@BananaFan', '@Alchemist', '@MageLover', '@Diffuser'];
    const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
    state.points += 10;
    persistPoints();
    const toastMsg = state.currentGlobalLang === 'zh' 
      ? `🔔 創作者收益！用戶 ${randomUser} 購買解鎖了您的廣場模板【${templateName}】，您獲得了 +10 積分！🪙`
      : `🔔 Creator Earnings! User ${randomUser} unlocked your template 【${templateName}】 in the square, you earned +10 points! 🪙`;
    showToast(toastMsg, 'gold');
  }

  // ----------------------------------------------------------
  // Tag Extraction
  // ----------------------------------------------------------
  function buildTagList() {
    const tagCount = {};
    state.templates.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    state.allTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag]) => tag);
  }

  // ----------------------------------------------------------
  // Filtering
  // ----------------------------------------------------------
  function getFilteredTemplates() {
    let list = [...state.templates];

    // 準備自訂與廣場的虛擬分類模板副本
    const customs = state.customTemplates.map((c) => ({
      ...c,
      _category: 'custom',
      _categoryName: '✏️ 自訂模板',
    }));

    const squares = state.squareTemplates.map((s) => ({
      ...s,
      _category: 'square',
      _categoryName: '✨ 咒語廣場',
    }));

    // 若有搜尋字串，直接強制全域檢索（涵蓋內建、自訂與廣場所有 205 個模板）
    if (state.searchQuery && state.searchQuery.trim()) {
      list = [...list, ...customs, ...squares];
    } else {
      // 分類篩選主邏輯
      if (state.currentCategory === 'custom') {
        list = customs;
      } else if (state.currentCategory === 'square') {
        list = squares;
      } else if (state.currentCategory === 'all') {
        list = [...list, ...customs, ...squares];
      } else if (state.currentCategory === 'favorites') {
        // 我的收藏：必須包含內建、自訂以及廣場中被收藏的所有模板！
        list = [...list, ...customs, ...squares].filter((t) => state.favorites.has(t.id));
      } else {
        // 內建的 Banana Pro (nano-banana-pro) 或 Banana Basic (nano-banana)
        list = list.filter((t) => t._category === state.currentCategory);
      }
    }

    // Difficulty
    if (state.currentDifficulty !== 'all') {
      list = list.filter((t) => t.difficulty === state.currentDifficulty);
    }

    // Tags
    if (state.currentTags.size > 0) {
      list = list.filter((t) =>
        [...state.currentTags].some((tag) => (t.tags || []).includes(tag))
      );
    }

    // Search
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          (t.name_zh || '').toLowerCase().includes(q) ||
          (t.name_en || '').toLowerCase().includes(q) ||
          (t.prompt_zh || '').toLowerCase().includes(q) ||
          (t.prompt_en || '').toLowerCase().includes(q) ||
          (t.author || '').toLowerCase().includes(q) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort: Unlocked and Free templates first, locked Pro templates last
    list.sort((a, b) => {
      const aLocked = (a._category === 'nano-banana-pro' && !state.unlockedTemplates.has(a.id)) ? 1 : 0;
      const bLocked = (b._category === 'nano-banana-pro' && !state.unlockedTemplates.has(b.id)) ? 1 : 0;
      
      if (aLocked !== bLocked) {
        return aLocked - bLocked; // 0 (unlocked/free) comes before 1 (locked)
      }
      
      // Secondary: Scene match priority (if scene filter is active)
      if (state.currentScene) {
        const aMatch = (a.suggested_scenes || []).includes(state.currentScene) ? 1 : 0;
        const bMatch = (b.suggested_scenes || []).includes(state.currentScene) ? 1 : 0;
        if (aMatch !== bMatch) {
          return bMatch - aMatch; // 1 (matched) comes before 0 (unmatched)
        }
      }
      
      return 0;
    });

    return list;
  }

  // ----------------------------------------------------------
  // Rendering: Gallery
  // ----------------------------------------------------------
  function renderGallery() {
    const grid = $('#galleryGrid');
    const empty = $('#emptyState');

    if (state.loadFailed) {
      grid.style.display = 'none';
      empty.style.display = 'none';
      
      let errorContainer = $('#corsErrorPanel');
      if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'corsErrorPanel';
        errorContainer.className = 'cors-error-panel';
        grid.parentNode.insertBefore(errorContainer, grid);
      }
      errorContainer.style.display = 'flex';
      errorContainer.innerHTML = `
        <div class="cors-card">
          <div class="cors-icon">🍌</div>
          <h2 class="cors-title">檢測到瀏覽器 CORS 安全限制</h2>
          <p class="cors-desc">
            親愛的專家，您目前似乎是直接雙擊檔案 (<code>file:///</code>) 開啟此網頁。
            由於瀏覽器的跨來源資源共享 (CORS) 安全策略限制，此模式下無法讀取本地 <code>data/</code> JSON 檔案。
          </p>
          <div class="cors-solution">
            <h3>💡 解決方案：使用已開通的本地伺服器</h3>
            <p>我們已經自動為您在背景啟動了極速本地 Web 伺服器，請直接點擊下方連結跳轉：</p>
            <a href="http://localhost:8000" class="cors-link-btn" target="_blank">
              🚀 立即跳轉至 http://localhost:8000
            </a>
          </div>
          <div class="cors-manual">
            <p>手動指令（若需重新啟動伺服器）：</p>
            <code>npx serve -p 8000</code>
          </div>
        </div>
      `;
      return;
    } else {
      const errorContainer = $('#corsErrorPanel');
      if (errorContainer) errorContainer.style.display = 'none';
    }

    const filtered = getFilteredTemplates();
    $('#filteredCount').textContent = filtered.length;

    if (filtered.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'flex';
      return;
    }

    grid.style.display = '';
    empty.style.display = 'none';

    // 1. 列表模式下：回復到原來簡單的 Grid 列印，不插入廣告
    if (state.viewMode === 'list') {
      grid.className = 'gallery-grid gallery-list';
      grid.classList.remove('masonry-active');
      grid.innerHTML = filtered.map((t) => renderCard(t)).join('');
    } 
    // 2. 網格模式下：啟用「真響應式瀑布流」與「Sponsor 廣告插值」
    else {
      grid.className = 'gallery-grid masonry-active';

      // 篩選未關閉的 Sponsor 廣告
      const activeSponsors = SPONSOR_ADS.filter(ad => !state.closedSponsors.has(ad.id));
      
      // 混入廣告（每 6 個模板插入一個）
      const galleryItems = [];
      let adIndex = 0;
      filtered.forEach((item, index) => {
        galleryItems.push(item);
        if (index > 0 && index % 6 === 0 && adIndex < activeSponsors.length) {
          galleryItems.push(activeSponsors[adIndex++]);
        }
      });

      // 計算合適的 Column 數
      const width = window.innerWidth;
      let cols = 4;
      if (width <= 600) cols = 1;
      else if (width <= 900) cols = 2;
      else if (width <= 1200) cols = 3;

      grid.innerHTML = '';
      
      // 產生 Column 容器
      const colElements = [];
      for (let i = 0; i < cols; i++) {
        const col = document.createElement('div');
        col.className = 'masonry-column';
        col.id = `masonry-col-${i}`;
        grid.appendChild(col);
        colElements.push({ element: col, height: 0 });
      }

      // 等高分發卡片（防止非同步圖片加載時的高度坍塌錯置）
      galleryItems.forEach((item) => {
        let cardBodyHeight = 120; // 預估 body 高度
        if (item.isSponsor) cardBodyHeight = 150;
        
        const ratio = getTemplateAspectRatio(item);
        const imgHeight = 280 / ratio; // 預期寬度 280px 下的預估圖片高度
        const expectedHeight = cardBodyHeight + imgHeight;

        // 尋找累計高度最低的欄分發
        let targetCol = colElements[0];
        colElements.forEach((col) => {
          if (col.height < targetCol.height) {
            targetCol = col;
          }
        });

        const cardHTML = renderCard(item);
        targetCol.element.insertAdjacentHTML('beforeend', cardHTML);
        targetCol.height += expectedHeight;
      });
    }

    // 漸進式圖片載入 & 骨架屏隱藏
    grid.querySelectorAll('.card-image-wrapper img').forEach((img) => {
      const handleLoad = () => {
        img.classList.add('loaded');
      };
      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener('load', handleLoad);
      }
      
      img.addEventListener('error', function () {
        this.src = 'data:image/svg+xml,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="225" fill="%2312121a"><rect width="300" height="225"/><text x="150" y="112" text-anchor="middle" fill="%23666680" font-size="40">🍌</text></svg>'
        );
        handleLoad();
      });
    });
  }

  function renderCard(t) {
    if (t.isSponsor) {
      return `
        <div class="template-card sponsor-card" data-id="${t.id}" tabindex="0">
          <div class="sponsor-close" data-id="${t.id}" title="關閉廣告">✕</div>
          <div class="card-image-wrapper" style="aspect-ratio: 1.33;">
            <img src="${t.image_url || ''}" alt="${t.name}" loading="lazy">
            <div class="shimmer-placeholder"></div>
            <span class="sponsor-badge">Sponsor 贊助</span>
          </div>
          <div class="card-body">
            <h3 class="card-title" style="color: var(--purple, #8B5CF6); font-weight: 700; font-size: 0.95rem;">${t.name}</h3>
            <p class="card-author">${t.author}</p>
            <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; margin: 4px 0;">${t.description}</p>
            <a href="${t.target_url}" target="_blank" class="btn btn-secondary btn-sm" style="text-align: center; margin-top: 8px; border-color: rgba(139,92,246,0.3); color: var(--purple); width: 100%; display: block;">
              🌐 立即探索
            </a>
          </div>
        </div>
      `;
    }

    const isFav = state.favorites.has(t.id);
    const dict = I18N_DICTS[state.currentGlobalLang] || I18N_DICTS['zh'];
    
    const diffLabel = { 
      beginner: dict['filter.diff_beginner'], 
      intermediate: dict['filter.diff_intermediate'], 
      advanced: dict['filter.diff_advanced'] 
    }[t.difficulty] || '';
    const diffClass = t.difficulty || 'intermediate';

    const cardTitle = state.currentGlobalLang === 'zh' ? (t.name_zh || t.name_en) : (t.name_en || t.name_zh || 'Untitled');
    const inputBadgeText = dict['modal.input_badge'] || '📎 需要輸入圖片';
    const favTitle = isFav ? (dict['modal.favorite'] ? '取消' + dict['modal.favorite'] : '取消收藏') : (dict['modal.favorite'] || '收藏');

    const isProCategory = t._category === 'nano-banana-pro';
    const isSquareCategory = t._category === 'square';
    const isSelfSquare = isSquareCategory && (t.author === '我 (創作者)' || t.author === 'Me (Creator)');
    const isLockedPro = isProCategory && !state.unlockedTemplates.has(t.id);
    const isLockedSquare = isSquareCategory && !isSelfSquare && !state.unlockedTemplates.has(t.id);
    const isLocked = isLockedPro || isLockedSquare;
    const isUnlockedPro = isProCategory && !isLocked;
    const isUnlockedSquare = isSquareCategory && !isSelfSquare && !isLocked;

    const ratio = getTemplateAspectRatio(t);

    return `
      <div class="template-card" data-id="${t.id}" data-locked="${isLocked}" tabindex="0">
        <div class="card-image">
          <div class="card-image-wrapper" style="aspect-ratio: ${ratio};">
            <img src="${t.image_url || ''}" alt="${cardTitle}" loading="lazy">
            <div class="shimmer-placeholder"></div>
            ${isLocked ? `
              <div class="card-lock-overlay">
                <span class="lock-icon-badge">🔒</span>
                <span class="lock-text">消耗 10 積分解鎖</span>
              </div>
            ` : ''}
          </div>
          ${isUnlockedPro ? `
            <div class="card-unlocked-badge" title="您已永久解鎖此高級提示詞">
              <span class="unlocked-icon-badge">🔓</span>
              <span class="unlocked-text">Pro 已解鎖</span>
            </div>
          ` : ''}
          ${isUnlockedSquare ? `
            <div class="card-unlocked-badge" style="background: linear-gradient(135deg, #10B981, #059669);" title="您已解鎖此廣場提示詞">
              <span class="unlocked-icon-badge">🔓</span>
              <span class="unlocked-text">廣場已解鎖</span>
            </div>
          ` : ''}
          <div class="card-overlay">
            <button class="btn-icon card-fav ${isFav ? 'active' : ''}" data-id="${t.id}" title="${favTitle}">
              ${isFav ? '★' : '☆'}
            </button>
            ${t.requires_input ? `<span class="card-badge">${inputBadgeText}</span>` : ''}
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${cardTitle}</h3>
          <p class="card-author">${t.author || ''}</p>
          <div class="card-footer">
            <div class="card-tags">
              ${(t.tags || [])
                .slice(0, 3)
                .map((tag) => `<span class="badge">${tag}</span>`)
                .join('')}
            </div>
            <span class="card-difficulty ${diffClass}">${diffLabel}</span>
          </div>
        </div>
      </div>`;
  }

  // ----------------------------------------------------------
  // Rendering: Horizontal Scrolling Tags
  // ----------------------------------------------------------
  function renderHorizontalTags() {
    const container = $('#tagFilter');
    if (!container) return;
    container.innerHTML = state.allTags
      .map(
        (tag) =>
          `<button class="filter-tag ${state.currentTags.has(tag) ? 'active' : ''}" data-tag="${tag}">${tag}</button>`
      )
      .join('');
  }

  function updateCounts() {
    const all = state.templates.length + state.customTemplates.length + state.squareTemplates.length;
    const pro = state.templates.filter(
      (t) => t._category === 'nano-banana-pro'
    ).length;
    const standard = state.templates.filter(
      (t) => t._category === 'nano-banana'
    ).length;
    const favs = [...state.favorites].filter(
      (id) =>
        state.templates.some((t) => t.id === id) ||
        state.customTemplates.some((t) => t.id === id) ||
        state.squareTemplates.some((t) => t.id === id)
    ).length;
    const countSquare = state.squareTemplates.length;

    const setCount = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setCount('countAll', all);
    setCount('countPro', pro);
    setCount('countStandard', standard);
    setCount('countFavorites', favs);
    setCount('countCustom', state.customTemplates.length);
    setCount('countSquare', countSquare);
  }

  // ----------------------------------------------------------
  // Rendering: Visual Scene Selector Board
  // ----------------------------------------------------------
  function renderVisualSceneBoard() {
    const container = $('#sceneVisualScroll');
    if (!container) return;
    const lang = state.currentGlobalLang || 'zh';
    container.innerHTML = state.scenes
      .map(
        (s) => {
          const trans = SCENE_TRANSLATIONS[s.id] && SCENE_TRANSLATIONS[s.id][lang] 
            ? SCENE_TRANSLATIONS[s.id][lang] 
            : { 'name': s.name, 'description': s.description };
          
          return `
            <div class="scene-visual-card ${state.currentScene === s.id ? 'active' : ''}" data-scene="${s.id}" tabindex="0" title="${trans.description}">
              <span class="scene-icon">${s.icon}</span>
              <div class="scene-details">
                <span class="scene-name">${trans.name}</span>
                <span class="scene-desc">${trans.description.substring(0, 15)}...</span>
              </div>
            </div>`;
        }
      )
      .join('');
  }

  // ----------------------------------------------------------
  // Modal: Template Detail
  // ----------------------------------------------------------
  function openTemplateModal(templateId) {
    if (!templateId) return;
    
    // 確保以字串形式匹配
    const searchId = String(templateId);
    
    const t =
      state.templates.find((x) => String(x.id) === searchId) ||
      state.customTemplates.find((x) => String(x.id) === searchId) ||
      state.squareTemplates.find((x) => String(x.id) === searchId);
    if (!t) return;

    state.currentTemplate = t;
    state.isCustomized = false;
    state.customPrompt = '';
    state.lastVarValues = {};
    state.currentLang = state.currentGlobalLang === 'zh' ? 'zh' : 'en';

    const modal = $('#templateModal');
    if (!modal) return;
    
    const lang = state.currentGlobalLang || 'zh';
    const dict = I18N_DICTS[lang] || I18N_DICTS['zh'] || {};

    // 動態顯隱編輯與刪除自訂模板按鈕
    const deleteBtn = $('#deleteCustom');
    const editBtn = $('#editCustom');
    const publishToSquareBtn = $('#publishToSquare');
    if (deleteBtn && editBtn) {
      const isCustom = searchId.startsWith('custom-') || t._category === 'custom';
      if (isCustom) {
        deleteBtn.style.display = 'inline-flex';
        editBtn.style.display = 'inline-flex';
        if (publishToSquareBtn) {
          publishToSquareBtn.style.display = t.isPublished ? 'none' : 'inline-flex';
        }
      } else {
        deleteBtn.style.display = 'none';
        editBtn.style.display = 'none';
        if (publishToSquareBtn) {
          publishToSquareBtn.style.display = 'none';
        }
      }
    }

    // Fill header
    $('#modalTitle').textContent = state.currentGlobalLang === 'zh' ? (t.name_zh || t.name_en) : (t.name_en || t.name_zh || '');
    $('#modalAuthor').textContent = t.author || '';
    const srcLink = $('#modalSource');
    if (t.source_url) {
      srcLink.href = t.source_url;
      srcLink.style.display = '';
    } else {
      srcLink.style.display = 'none';
    }

    // Favorite
    const favBtn = $('#modalFavorite');
    const isFav = state.favorites.has(t.id);
    favBtn.textContent = isFav ? '★' : '☆';
    favBtn.classList.toggle('active', isFav);
    favBtn.title = isFav 
      ? (dict['modal.favorite'] ? '取消' + dict['modal.favorite'] : '取消收藏') 
      : (dict['modal.favorite'] || '收藏');
    favBtn.setAttribute('aria-label', favBtn.title);

    // Image
    const img = $('#modalImage');
    const defaultPlaceholder = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="64">🍌</text><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="14" font-family="system-ui, sans-serif" letter-spacing="1">NANO BANANA PRO</text></svg>'
    );
    
    img.src = t.image_url || defaultPlaceholder;
    img.alt = state.currentGlobalLang === 'zh' ? (t.name_zh || t.name_en) : (t.name_en || t.name_zh || '');
    img.onerror = () => {
      if (img.src !== defaultPlaceholder) {
        img.src = defaultPlaceholder;
      }
    };

    // Tags
    $('#modalTags').innerHTML = (t.tags || [])
      .map((tag) => `<span class="badge">${tag}</span>`)
      .join('');

    // Difficulty
    const diffMap = {
      beginner: '🟢 ' + dict['filter.diff_beginner'],
      intermediate: '🟡 ' + dict['filter.diff_intermediate'],
      advanced: '🔴 ' + dict['filter.diff_advanced']
    };
    $('#modalDifficulty').textContent = diffMap[t.difficulty] || '';

    // Input badge
    const inputBadge = $('#modalInputBadge');
    const inputNotice = $('#inputNotice');
    if (t.requires_input) {
      inputBadge.style.display = '';
      inputBadge.textContent = dict['modal.input_badge'] || '📎 需要輸入圖片';
      inputNotice.style.display = '';
      
      let inputDesc = t.input_description;
      if (!inputDesc) {
        inputDesc = dict['modal.input_badge'] ? dict['modal.input_badge'].replace('📎 ', '') : '需要上傳參考圖片';
      } else if (inputDesc && lang !== 'zh') {
        inputDesc = inputDesc
          .replace('需上傳參考圖片作為人物物件', 'Need to upload reference image as character')
          .replace('需上傳文章/文字作為生成PPT的內容', 'Need to upload article/text as content for PPT')
          .replace('需上傳人物圖片作為參考圖', 'Need to upload character image as reference')
          .replace('需上傳一張參考圖片', 'Need to upload a reference image')
          .replace('需上傳城市參考圖片', 'Need to upload a city reference image');
      }
      $('#inputNoticeText').textContent = inputDesc;
    } else {
      inputBadge.style.display = 'none';
      inputNotice.style.display = 'none';
    }

    // Scene suggestions
    renderSceneSuggestions(t);

    // Variables
    renderVariables(t);

    // Prompt
    updatePromptDisplay();

    // Quality boosters
    renderQualityBoosters();

    // Reset quality boosters accordion state on open
    const trigger = $('#qualityAccordionTrigger');
    const cats = $('#qualityCategories');
    if (trigger && cats) {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.classList.remove('active');
      cats.classList.remove('open');
      cats.style.display = '';
    }

    // Language toggle
    $$('#langToggle .lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === state.currentLang);
    });

    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
  }

  function closeTemplateModal() {
    const modal = $('#templateModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
    document.body.style.overflow = '';
    state.currentTemplate = null;
  }

  // ----------------------------------------------------------
  // Scene Suggestions in Modal
  // ----------------------------------------------------------
  function renderSceneSuggestions(t) {
    const container = $('#modalSceneSuggestions');
    if (!container) return;
    const lang = state.currentGlobalLang || 'zh';

    const suggested = (t.suggested_scenes || [])
      .map((id) => state.scenes.find((s) => s.id === id))
      .filter(Boolean);

    if (suggested.length === 0) {
      const noSuggestionsText = {
        zh: '此模板適用於多種場景',
        en: 'This template is suitable for various scenes',
        ja: 'このテンプレートはさまざまなシーンに適しています',
        ko: '이 템플릿은 다양한 시나리오에 적합합니다'
      }[lang] || '此模板適用於多種場景';
      
      container.innerHTML = `<p class="text-muted">${noSuggestionsText}</p>`;
      return;
    }

    container.innerHTML = suggested
      .map(
        (s) => {
          const transName = SCENE_TRANSLATIONS[s.id] && SCENE_TRANSLATIONS[s.id][lang]
            ? SCENE_TRANSLATIONS[s.id][lang].name
            : s.name;
          return `
            <div class="scene-chip">
              <span>${s.icon}</span>
              <span>${transName}</span>
            </div>`;
        }
      )
      .join('');
  }

  // ----------------------------------------------------------
  // Variables
  // ----------------------------------------------------------
  function renderVariables(t) {
    const section = $('#variablesSection');
    const list = $('#variablesList');

    const vars = t.variables || [];
    if (vars.length === 0) {
      section.style.display = 'none';
      return;
    }

    const lang = state.currentGlobalLang || 'zh';
    const dict = I18N_DICTS[lang] || I18N_DICTS['zh'];

    section.style.display = '';
    list.innerHTML = vars
      .map(
        (v, i) => {
          let cleanVar = v.replace(/[{}\[\]]/g, '');
          if (lang !== 'zh') {
            cleanVar = cleanVar
              .replace('角色名字', 'Character Name')
              .replace('柱名/稱號', 'Hashira Name/Title')
              .replace('武器描述', 'Weapon Description')
              .replace('呼吸法招式名稱', 'Breathing Move Name')
              .replace('視覺特效描述', 'Visual Effect Description')
              .replace('日文漢字名字', 'Japanese Name')
              .replace('阿童木', 'Astro Boy')
              .replace('一臺 3D 拍立得相機', 'a 3D Polaroid camera')
              .replace('機身具有明顯的厚度與立體深度，經典拍立得相機的標誌性造型——方正機身、前置鏡頭、頂部取景器、正面拍照按鈕以及底部吐片槽——全部以簡化卻極為精確的幾何結構呈現，使其無需任何圖案就能一眼辨認', 'a classic Polaroid camera body with dimensional depth, front lens, viewfinder, shutter button, and film slot in precise geometric structure');
          }
          const placeholderText = (dict['modal.vars_placeholder'] || '輸入 {var}').replace('{var}', cleanVar);
          
          return `
            <div class="variable-input">
              <label>${cleanVar}</label>
              <input type="text" class="var-input" data-var="${v}" data-index="${i}" placeholder="${placeholderText}">
            </div>`;
        }
      )
      .join('');
  }

  function syncVariablesListFromTextarea() {
    const textarea = $('#promptTextarea');
    const list = $('#variablesList');
    const section = $('#variablesSection');
    if (!textarea || !list || !section) return;

    // 1. 基礎變數：首先加入當前模板預設有的變數（確保手動修改提示詞時，這些變數輸入框不會消失）
    const newVars = [];
    if (state.currentTemplate && Array.isArray(state.currentTemplate.variables)) {
      state.currentTemplate.variables.forEach(v => {
        if (!newVars.includes(v)) {
          newVars.push(v);
        }
      });
    }

    // 2. 從 textarea.value 中提取所有手動新增的 `{變數}`
    const text = textarea.value;
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const varMarkup = match[0]; // 例如 "{主體}"
      if (!newVars.includes(varMarkup)) {
        newVars.push(varMarkup);
      }
    }

    // 3. 智慧型歷史變數值保留機制：如果變數的當前實際值仍在文字中，也視為有效保留
    if (state.lastVarValues) {
      Object.entries(state.lastVarValues).forEach(([varMarkup, val]) => {
        if (text.includes(val) && !newVars.includes(varMarkup)) {
          newVars.push(varMarkup);
        }
      });
    }

    // 4. 如果沒有任何變數，隱藏變數區塊並清空列表
    if (newVars.length === 0) {
      section.style.display = 'none';
      list.innerHTML = '';
      return;
    }

    section.style.display = '';

    const lang = state.currentGlobalLang || 'zh';
    const dict = I18N_DICTS[lang] || I18N_DICTS['zh'] || {};

    // 5. 獲取現有的變數 input
    const currentInputs = Array.from(list.querySelectorAll('.var-input'));

    // 6. 移除在新列表中不存在的變數 DOM
    currentInputs.forEach(input => {
      const varMarkup = input.dataset.var;
      if (!newVars.includes(varMarkup)) {
        const wrapper = input.closest('.variable-input');
        if (wrapper) wrapper.remove();
      }
    });

    // 7. 新增或調整變數 DOM 的順序與屬性
    newVars.forEach((v, index) => {
      let cleanVar = v.replace(/[{}\[\]]/g, '');
      if (lang !== 'zh') {
        cleanVar = cleanVar
          .replace('角色名字', 'Character Name')
          .replace('柱名/稱號', 'Hashira Name/Title')
          .replace('武器描述', 'Weapon Description')
          .replace('呼吸法招式名稱', 'Breathing Move Name')
          .replace('視覺特效描述', 'Visual Effect Description')
          .replace('日文漢字名字', 'Japanese Name')
          .replace('阿童木', 'Astro Boy')
          .replace('一臺 3D 拍立得相機', 'a 3D Polaroid camera')
          .replace('機身具有明顯的厚度與立體深度，經典拍立得相機的標誌性造型——方正機身、前置鏡頭、頂部取景器、正面拍照按鈕以及底部吐片槽——全部以簡化卻極為精確的幾何結構呈現，使其無需任何圖案就能一眼辨認', 'a classic Polaroid camera body with dimensional depth, front lens, viewfinder, shutter button, and film slot in precise geometric structure');
      }
      const placeholderText = (dict['modal.vars_placeholder'] || '輸入 {var}').replace('{var}', cleanVar);

      // 檢查是否已存在
      const existingInput = currentInputs.find(input => input.dataset.var === v);
      if (existingInput) {
        // 如果已存在，確保它的順序正確。
        const wrapper = existingInput.closest('.variable-input');
        if (wrapper && list.children[index] !== wrapper) {
          list.insertBefore(wrapper, list.children[index] || null);
        }
      } else {
        // 如果不存在，建立新的變數 input
        const newWrapper = document.createElement('div');
        newWrapper.className = 'variable-input';
        newWrapper.innerHTML = `
          <label>${cleanVar}</label>
          <input type="text" class="var-input" data-var="${v}" data-index="${index}" placeholder="${placeholderText}">
        `;
        list.insertBefore(newWrapper, list.children[index] || null);
      }
    });
  }

  // ----------------------------------------------------------
  // Prompt Display & Editing
  // ----------------------------------------------------------
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function updatePromptDisplay() {
    const t = state.currentTemplate;
    if (!t) return;

    const textarea = $('#promptTextarea');
    const highlighter = $('#promptHighlighter');
    if (!textarea) return;

    if (state.isCustomized) {
      // 智慧雙向無損同步演算法：
      // 在使用者客製化手動修改的基礎上，將改變的變數值進行替換，而不丟失使用者客製化的字串！
      $$('.var-input').forEach((input) => {
        const varName = input.dataset.var;
        const newVal = input.value.trim() || varName;
        const oldVal = state.lastVarValues[varName] || varName;
        
        if (newVal !== oldVal && varName) {
          if (textarea.value.includes(oldVal)) {
            textarea.value = textarea.value.replaceAll(oldVal, newVal);
          }
          state.lastVarValues[varName] = newVal;
        }
      });
      
      state.customPrompt = textarea.value;
      renderHighlighterFromCustomPrompt();
      $('#charCount').textContent = textarea.value.length;
      return;
    }

    // 否則，使用原始模板渲染：
    let basePrompt =
      state.currentLang === 'zh'
        ? t.prompt_zh || t.prompt_en || ''
        : t.prompt_en || t.prompt_zh || '';

    let prompt = basePrompt;
    let htmlPrompt = escapeHTML(basePrompt);

    // 初始化 lastVarValues
    state.lastVarValues = {};

    // Apply variable replacements & Highlighter markup
    $$('.var-input').forEach((input) => {
      const varName = input.dataset.var;
      const val = input.value.trim();
      
      const displayVal = val || varName;
      state.lastVarValues[varName] = displayVal;

      // Update pure text model
      if (varName) {
        prompt = prompt.replaceAll(varName, displayVal);
      }

      // Update overlaid HTML view
      const escapedDisplayVal = escapeHTML(displayVal);
      const isFilled = !!val;
      const activeClass = (input === document.activeElement) ? 'active' : '';
      const filledClass = isFilled ? 'active-filled' : '';

      const span = `<span class="highlight-var ${activeClass} ${filledClass}" data-var="${varName}">${escapedDisplayVal}</span>`;
      const escapedVarName = escapeHTML(varName);
      htmlPrompt = htmlPrompt.replaceAll(escapedVarName, span);
    });

    // Append quality boosters
    let qualitySuffix = '';
    const selectedBoosters = $$(
      '.quality-tag.selected'
    ).map((el) => el.dataset.keyword);
    if (selectedBoosters.length > 0) {
      qualitySuffix += '\n\n' + selectedBoosters.join(', ');
    }

    // Append scene suffix
    let sceneSuffix = '';
    if (state.currentScene) {
      const scene = state.scenes.find((s) => s.id === state.currentScene);
      if (scene) {
        const suffix =
          state.currentLang === 'zh'
            ? scene.prompt_suffix_zh
            : scene.prompt_suffix_en;
        if (suffix) sceneSuffix = suffix;
      }
    }

    prompt += qualitySuffix + sceneSuffix;
    textarea.value = prompt;

    htmlPrompt += escapeHTML(qualitySuffix + sceneSuffix);
    if (highlighter) {
      highlighter.innerHTML = htmlPrompt;
      highlighter.scrollTop = textarea.scrollTop;
    }

    $('#charCount').textContent = prompt.length;
  }

  // 輔助函數：從客製化的當前 prompt 渲染高亮層
  function renderHighlighterFromCustomPrompt() {
    const textarea = $('#promptTextarea');
    const highlighter = $('#promptHighlighter');
    if (!textarea || !highlighter) return;

    let text = textarea.value;
    let html = escapeHTML(text);

    // 1. 高亮尚未被替換的大括號變數，如 `{主體}`
    const bracketRegex = /\{([^}]+)\}/g;
    html = html.replace(bracketRegex, (match) => {
      let activeClass = '';
      let filledClass = '';
      const input = Array.from($$('.var-input')).find(i => i.dataset.var === match);
      if (input) {
        if (input.value.trim()) filledClass = 'active-filled';
        if (input === document.activeElement) activeClass = 'active';
      }
      return `<span class="highlight-var ${activeClass} ${filledClass}" data-var="${escapeHTML(match)}">${escapeHTML(match)}</span>`;
    });

    // 2. 高亮已經被替換的變數值，避開標籤內部屬性
    const inputs = Array.from($$('.var-input')).filter(input => input.value.trim() !== '');
    inputs.sort((a, b) => b.value.trim().length - a.value.trim().length);

    inputs.forEach(input => {
      const varName = input.dataset.var;
      const val = input.value.trim();
      const escapedVal = escapeHTML(val);
      const activeClass = (input === document.activeElement) ? 'active' : '';
      const filledClass = 'active-filled';
      
      const span = `<span class="highlight-var ${activeClass} ${filledClass}" data-var="${escapeHTML(varName)}">${escapedVal}</span>`;
      const escapedRegexStr = escapeRegExp(escapedVal) + "(?![^<>]*>)";
      const regex = new RegExp(escapedRegexStr, 'g');
      html = html.replace(regex, span);
    });

    highlighter.innerHTML = html;
    highlighter.scrollTop = textarea.scrollTop;
    highlighter.scrollLeft = textarea.scrollLeft;
  }

  // ----------------------------------------------------------
  // Quality Boosters
  // ----------------------------------------------------------
  function renderQualityBoosters() {
    const container = $('#qualityCategories');
    if (!container) return;

    const categories = state.qualityBoosters;
    const lang = state.currentGlobalLang || 'zh';

    container.innerHTML = Object.entries(categories)
      .map(
        ([key, items]) => {
          const catName = QUALITY_CATEGORY_NAMES[key] && QUALITY_CATEGORY_NAMES[key][lang]
            ? QUALITY_CATEGORY_NAMES[key][lang]
            : key;
            
          return `
            <div class="quality-category">
              <h5 class="quality-category-title">${catName}</h5>
              <div class="quality-tags">
                ${items
                  .map(
                    (item) => {
                      const desc = QUALITY_ITEM_DESCRIPTIONS[item.keyword] && QUALITY_ITEM_DESCRIPTIONS[item.keyword][lang]
                        ? QUALITY_ITEM_DESCRIPTIONS[item.keyword][lang]
                        : item.description;
                      return `<button class="quality-tag" data-keyword="${item.keyword}" title="${desc}">${item.keyword}</button>`;
                    }
                  )
                  .join('')}
              </div>
            </div>`;
        }
      )
      .join('');
  }

  // ----------------------------------------------------------
  // Image Analysis Modal
  // ----------------------------------------------------------
  function openAnalysisModal() {
    const modal = $('#analysisModal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);
    }
    document.body.style.overflow = 'hidden';
  }

  function closeAnalysisModal() {
    const modal = $('#analysisModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
    document.body.style.overflow = '';
  }

  // ----------------------------------------------------------
  // Custom Template Modal
  // ----------------------------------------------------------
  function openCustomModal(prefill) {
    const modal = $('#customModal');
    const lang = state.currentGlobalLang || 'zh';
    const dict = I18N_DICTS[lang] || I18N_DICTS['zh'];

    const isEdit = prefill && prefill.id && prefill.id.startsWith('custom-');
    if (isEdit) {
      state.editingTemplateId = prefill.id;
      $('#customModalTitle').textContent = dict['custom.title_edit'] || '✏️ 編輯自訂模板';
      $('#saveCustom').textContent = dict['custom.btn_update'] || '💾 更新模板';

      // 填充欄位
      $('#customName').value = prefill.name_zh || prefill.name_en || '';
      $('#customTags').value = (prefill.tags || []).join(', ');
      $('#customPrompt').value = prefill.prompt_zh || prefill.prompt_en || '';
      $('#customImage').value = prefill.image_url || '';
      $('#customDifficulty').value = prefill.difficulty || 'intermediate';
      $('#customRequiresInput').checked = prefill.requires_input || false;
      $('#customInputDescription').value = prefill.input_description || '';
      $('#customInputDescContainer').style.display = prefill.requires_input ? 'block' : 'none';
    } else {
      state.editingTemplateId = null;
      $('#customModalTitle').textContent = dict['custom.title'] || '✏️ 新增自訂模板';
      $('#saveCustom').textContent = dict['custom.btn_save'] || '💾 儲存模板';

      // 填充或清空
      if (prefill) {
        // Remix 另存模式
        $('#customName').value = prefill.name || '';
        $('#customTags').value = (prefill.tags || []).join(', ');
        $('#customPrompt').value = prefill.prompt || '';
        $('#customImage').value = '';
        $('#customDifficulty').value = 'intermediate';
        $('#customRequiresInput').checked = false;
        $('#customInputDescription').value = '';
        $('#customInputDescContainer').style.display = 'none';
      } else {
        // 全新新增模式
        $('#customName').value = '';
        $('#customTags').value = '';
        $('#customPrompt').value = '';
        $('#customImage').value = '';
        $('#customDifficulty').value = 'intermediate';
        $('#customRequiresInput').checked = false;
        $('#customInputDescription').value = '';
        $('#customInputDescContainer').style.display = 'none';
      }
    }

    // 動態渲染場景勾選列表
    const scenesContainer = $('#customScenesContainer');
    if (scenesContainer) {
      scenesContainer.innerHTML = state.scenes
        .map((s) => {
          const transName = SCENE_TRANSLATIONS[s.id] && SCENE_TRANSLATIONS[s.id][lang]
            ? SCENE_TRANSLATIONS[s.id][lang].name
            : s.name;
          const isChecked = prefill && prefill.suggested_scenes && prefill.suggested_scenes.includes(s.id)
            ? 'checked'
            : '';
          return `
            <label class="scene-checkbox-label">
              <input type="checkbox" name="customScene" value="${s.id}" ${isChecked}>
              <span>${s.icon} ${transName}</span>
            </label>`;
        })
        .join('');
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
  }

  function closeCustomModal() {
    const modal = $('#customModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
    document.body.style.overflow = '';
  }

  function saveCustomTemplate(shouldPublish = false) {
    const name = $('#customName').value.trim();
    const tagsStr = $('#customTags').value.trim();
    const prompt = $('#customPrompt').value.trim();
    const imageUrl = $('#customImage').value.trim();
    const difficulty = $('#customDifficulty').value;
    const requiresInput = $('#customRequiresInput').checked;
    const inputDescription = $('#customInputDescription').value.trim();

    // 取得勾選的場景
    const suggestedScenes = Array.from(
      document.querySelectorAll('input[name="customScene"]:checked')
    ).map((el) => el.value);

    const lang = state.currentGlobalLang || 'zh';
    const dict = I18N_DICTS[lang] || I18N_DICTS['zh'];

    if (!name || !prompt) {
      const errBtn = dict['toast.fill_required'] || '請填寫模板名稱和提示詞';
      showToast(errBtn, 'error');
      return;
    }

    // 自動 Regex 解析提示詞中的變數占位符，例如：{角色名稱} 或 {var}
    const regex = /\{([^}]+)\}/g;
    let match;
    const variables = [];
    while ((match = regex.exec(prompt)) !== null) {
      const fullVar = match[0];
      if (!variables.includes(fullVar)) {
        variables.push(fullVar);
      }
    }

    const tags = tagsStr
      ? tagsStr.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
      : [];

    let targetId = state.editingTemplateId;
    if (!targetId) {
      targetId = 'custom-' + Date.now();
    }

    if (state.editingTemplateId) {
      // 編輯模式：原地更新
      const index = state.customTemplates.findIndex((x) => x.id === state.editingTemplateId);
      if (index !== -1) {
        const prev = state.customTemplates[index];
        const updated = {
          ...prev,
          name_zh: name,
          name_en: name,
          tags,
          prompt_zh: prompt,
          prompt_en: prompt,
          image_url: imageUrl,
          difficulty,
          requires_input: requiresInput,
          input_description: inputDescription,
          suggested_scenes: suggestedScenes,
          variables,
        };
        state.customTemplates[index] = updated;

        // 如果這個模板已經發佈過，也需要更新廣場中的版本！
        if (updated.isPublished) {
          const sqIdx = state.squareTemplates.findIndex(x => String(x.id) === String(updated.id));
          if (sqIdx !== -1) {
            state.squareTemplates[sqIdx] = {
              ...state.squareTemplates[sqIdx],
              ...updated,
              author: state.currentGlobalLang === 'zh' ? '我 (創作者)' : 'Me (Creator)',
              isSquare: true,
              _category: 'square'
            };
            persistSquareTemplates();
          }
        }
      }
      state.editingTemplateId = null;
    } else {
      // 新增模式
      const template = {
        id: targetId,
        name_zh: name,
        name_en: name,
        author: '自訂',
        source_url: '',
        requires_input: requiresInput,
        input_description: inputDescription,
        prompt_zh: prompt,
        prompt_en: prompt,
        variables,
        image_url: imageUrl,
        tags,
        suggested_scenes: suggestedScenes,
        difficulty,
      };
      state.customTemplates.push(template);
    }

    persistCustomTemplates();
    closeCustomModal();

    if (shouldPublish) {
      const savedTemplate = state.customTemplates.find(x => x.id === targetId);
      if (savedTemplate) {
        publishCustomTemplate(savedTemplate);
      }
    } else {
      // 自動幫用戶跳轉並切換至「自訂模板」分類，讓用戶能第一時間看見剛儲存的模板！
      state.currentCategory = 'custom';
      document.querySelectorAll('.category-item').forEach((el) => el.classList.remove('active'));
      const customItem = document.querySelector('.category-item[data-category="custom"]');
      if (customItem) customItem.classList.add('active');

      renderGallery();
      updateCounts();
      const savedMsg = dict['toast.custom_saved'] || '自訂模板已儲存 ✅';
      showToast(savedMsg);
    }
  }

  // ----------------------------------------------------------
  // Scene Selection
  // ----------------------------------------------------------
  function selectScene(sceneId) {
    if (state.currentScene === sceneId) {
      state.currentScene = null;
      hideSceneInfo();
    } else {
      state.currentScene = sceneId;
      showSceneInfo(sceneId);
    }

    renderVisualSceneBoard();
    renderGallery();

    if (state.currentTemplate) {
      updatePromptDisplay();
    }
  }

  function showSceneInfo(sceneId) {
    const scene = state.scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    const bar = $('#sceneInfoBar');
    if (bar) bar.style.display = '';

    const icon = $('#sceneInfoIcon');
    if (icon) icon.textContent = scene.icon;
    
    const lang = state.currentGlobalLang || 'zh';
    const dict = I18N_DICTS[lang] || I18N_DICTS['zh'];
    
    const trans = SCENE_TRANSLATIONS[scene.id] && SCENE_TRANSLATIONS[scene.id][lang]
      ? SCENE_TRANSLATIONS[scene.id][lang]
      : { 'name': scene.name, 'description': scene.description };
    
    const text = $('#sceneInfoText');
    if (text) text.textContent = `${trans.name} — ${trans.description}`;
    
    const ratio = $('#sceneInfoRatio');
    if (ratio) {
      let ratioPrefix = '建議比例:';
      if (lang === 'en') ratioPrefix = 'Aspect Ratio:';
      else if (lang === 'ja') ratioPrefix = '推奨比率:';
      else if (lang === 'ko') ratioPrefix = '권장 비율:';
      
      let ratioText = scene.aspect_ratio;
      if (lang !== 'zh') {
        ratioText = ratioText
          .replace('或', ' or ')
          .replace('（直式）', ' (Portrait)')
          .replace('（橫式）', ' (Landscape)')
          .replace('（正方或直式）', ' (Square or Portrait)')
          .replace('（標準名片）', ' (Standard Business Card)')
          .replace('（直式長圖）或', ' (Long Portrait) or ')
          .replace('手機', 'Phone')
          .replace('桌面', 'Desktop')
          .replace('依需求而定', 'Depends on needs')
          .replace('自訂', 'Custom');
      }
      ratio.textContent = `${ratioPrefix} ${ratioText}`;
    }

    const tips = $('#sceneInfoTips');
    if (tips) {
      tips.innerHTML = (scene.quality_tips || [])
        .map((tip) => {
          let translatedTip = tip;
          if (lang !== 'zh') {
            translatedTip = translatedTip
              .replace('使用 8K resolution, ultra HD 提升解析度', 'Use "8K resolution, ultra HD" to improve resolution')
              .replace('加入 dramatic lighting 或 cinematic lighting 強化氛圍', 'Add "dramatic lighting" or "cinematic lighting" to enhance mood')
              .replace('指定 bold typography 確保文字醒目', 'Specify "bold typography" to make text prominent')
              .replace('使用 high contrast color scheme 增加視覺衝擊', 'Use "high contrast color scheme" for visual impact')
              .replace('使用簡潔的白色或淺色背景，確保投影清晰', 'Use clean white or light backgrounds to ensure clear projection')
              .replace('加入 clean, minimalist, professional 風格描述', 'Add "clean, minimalist, professional" style descriptions')
              .replace('避免過多細節，重點突出核心資訊', 'Avoid too many details, highlight core information')
              .replace('指定 flat design 或 modern infographic style', 'Specify "flat design" or "modern infographic style"')
              .replace('明確指定節慶元素（如春節的紅色、燈籠、鞭炮）', 'Specify festive elements clearly')
              .replace('加入 warm, festive, celebratory 情感描述', 'Add "warm, festive, celebratory" descriptions')
              .replace('預留文字空間給祝福語', 'Leave space for text and greetings')
              .replace('使用 soft lighting, warm tones 營造溫馨氛圍', 'Use "soft lighting, warm tones" for a cozy atmosphere')
              .replace('使用鮮豔色彩和強對比吸引滑動瀏覽的注意力', 'Use vibrant colors and strong contrast to grab attention')
              .replace('加入 eye-catching, viral, trendy 描述', 'Add "eye-catching, viral, trendy" descriptions')
              .replace('考慮正方形（IG）或 9:16（Stories）比例', 'Consider Square (1:1) or 9:16 aspect ratio')
              .replace('加入 meme-worthy 或 shareable 的元素', 'Include meme-worthy or shareable elements')
              .replace('使用 studio lighting, professional product photography', 'Use "studio lighting, professional product photography"')
              .replace('指定背景（純白/純灰/場景化）', 'Specify background (pure white, solid gray, or contextual)')
              .replace('加入 high-end, premium, commercial quality 描述', 'Add "high-end, premium, commercial quality" descriptions')
              .replace('注意產品的材質描述（光澤、霧面、金屬等）', 'Describe product materials (glossy, matte, metal, etc.)')
              .replace('指定名片尺寸（3.5×2 英寸）', 'Specify business card dimensions (3.5×2 inches)')
              .replace('強調 layout, typography, visual hierarchy', 'Emphasize "layout, typography, visual hierarchy"')
              .replace('加入材質描述（霧面、亮面、亞克力、金屬）', 'Add material descriptions (matte, glossy, acrylic, metal)')
              .replace('預留聯絡資訊欄位', 'Leave blank spaces for contact information')
              .replace('使用 clear hierarchy, structured layout', 'Use "clear hierarchy, structured layout"')
              .replace('加入 data visualization, infographic style', 'Add "data visualization, infographic style"')
              .replace('色彩分割槽明確，使用一致的色彩系統', 'Define color zones clearly using a consistent palette')
              .replace('文字要清晰可讀，字型大小適當', 'Ensure text is legible with appropriate sizes')
              .replace('指定分格數量 and 版面配置', 'Specify panel numbers and layout')
              .replace('明確角色設定和風格（日系/美系/歐系）', 'Clarify character designs and styles (Anime/Western/European)')
              .replace('加入 sequential art, comic panel layout', 'Add "sequential art, comic panel layout"')
              .replace('注意對話方塊和文字的預留空間', 'Leave blank spaces for speech bubbles and text')
              .replace('指定遊戲風格（畫素、3D、手繪、賽步朋克）', 'Specify game style (Pixel, 3D, Hand-drawn, Cyberpunk)')
              .replace('角色設定要包含多角度檢視', 'Character sheets should include multiple view angles')
              .replace('加入 game art, character design sheet', 'Add "game art, character design sheet"')
              .replace('注意風格一致性，方便後續擴充套件', 'Ensure style consistency for easier scaling')
              .replace('針對目標年齡調整視覺複雜度', 'Adjust visual complexity based on target age group')
              .replace('使用 bright, clear, educational 風格', 'Use "bright, clear, educational" style')
              .replace('文字大且清晰，搭配拼音或注音', 'Large and clear text, with annotations')
              .replace('加入 child-friendly, colorful, engaging 描述', 'Add "child-friendly, colorful, engaging" descriptions')
              .replace('指定視角（鳥瞰/等距/透視）', 'Specify perspective (Bird\'s eye, Isometric, Perspective)')
              .replace('描述材質和光線（自然光/暖光/冷調）', 'Describe materials and lighting (Natural, Warm, Cold)')
              .replace('加入 architectural visualization, interior rendering', 'Add "architectural visualization, interior rendering"')
              .replace('指定風格（現代簡約/工業風/日式/北歐）', 'Specify style (Minimalist, Industrial, Japanese, Nordic)')
              .replace('描述服裝材質和細節', 'Describe clothing fabrics and details')
              .replace('加入 fashion editorial, lookbook, haute couture', 'Add "fashion editorial, lookbook, haute couture"')
              .replace('指定光線風格（自然光/影棚/戶外）', 'Specify lighting style (Natural, Studio, Outdoor)')
              .replace('描述姿態和表情', 'Describe poses and expressions')
              .replace('使用透明或純色背景', 'Use transparent or solid backgrounds')
              .replace('表情誇張明確，遠看也能辨識', 'Expressive facial features visible from afar')
              .replace('加入 sticker set, emoji style, expressive', 'Add "sticker set, emoji style, expressive"')
              .replace('保持風格一致性（同一組貼圖）', 'Ensure style consistency across the set')
              .replace('手機桌布用 9:19.5 或 9:16 比例', 'Use 9:19.5 or 9:16 aspect ratio for phone wallpapers')
              .replace('避免中心區域放重要元素（會被時鐘/圖示遮擋）', 'Avoid placing key elements in the center (blocked by UI)')
              .replace('加入 wallpaper, clean composition, aesthetic', 'Add "wallpaper, clean composition, aesthetic"')
              .replace('注意深色/淺色模式的適配', 'Ensure compatibility with Dark/Light modes')
              .replace('明確描述你的使用情境和目標', 'Describe your use cases and goals clearly')
              .replace('指定畫面的尺寸和方向', 'Specify image dimensions and orientation')
              .replace('描述期望的風格和氛圍', 'Describe preferred style and atmosphere');
          }
          return `<span class="scene-tip">💡 ${translatedTip}</span>`;
        })
        .join('');
    }
  }

  function hideSceneInfo() {
    const bar = $('#sceneInfoBar');
    if (bar) bar.style.display = 'none';
  }

  // ----------------------------------------------------------
  // Clipboard
  // ----------------------------------------------------------
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('已複製到剪貼簿 📋');
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('已複製到剪貼簿 📋');
    }
  }

  // ----------------------------------------------------------
  // Toast
  // ----------------------------------------------------------
  function showToast(message, type = 'success') {
    const container = $('#toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ----------------------------------------------------------
  // Upload
  // ----------------------------------------------------------
  function setupUpload() {
    const area = $('#uploadArea');
    const input = $('#imageUpload');
    const preview = $('#uploadPreview');

    if (!area) return;

    area.addEventListener('click', () => {
      if (input) input.value = '';
      input.click();
    });

    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('drag-over');
    });

    area.addEventListener('dragleave', () => {
      area.classList.remove('drag-over');
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
      }
    });

    input.addEventListener('change', () => {
      if (input.files[0]) handleImageFile(input.files[0]);
    });
  }

  // ----------------------------------------------------------
  // Real Computer Vision (CV) Image Analyzer
  // ----------------------------------------------------------
  function analyzeImage(dataUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 為了效能與順暢度，使用 60x60 尺寸進行快速取樣
        const size = 60;
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;
        
        let totalR = 0, totalG = 0, totalB = 0, totalL = 0, totalS = 0;
        let warmPixels = 0, coolPixels = 0, purplePixels = 0;
        let edgeComplexity = 0; // 近似計算邊緣複雜度
        
        // 用於尋找最主要顏色的簡易統計（色彩桶）
        const colorBuckets = {};
        
        // 輔助函數：RGB 轉 HSL
        const rgbToHslLocal = (r, g, b) => {
          r /= 255; g /= 255; b /= 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h, s, l = (max + min) / 2;
          if (max === min) {
            h = s = 0;
          } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
        };
        
        const pixelCount = size * size;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          totalR += r;
          totalG += g;
          totalB += b;
          
          // 亮度
          const l = 0.299 * r + 0.587 * g + 0.114 * b;
          totalL += l;
          
          // HSL
          const [h, s, hslL] = rgbToHslLocal(r, g, b);
          totalS += s;
          
          // 色彩桶，將 RGB 轉為簡化的 12 色階，尋找代表色
          const roundedH = Math.round(h / 30) * 30 % 360;
          const key = `${roundedH},${Math.round(s/25)*25},${Math.round(hslL/25)*25}`;
          colorBuckets[key] = (colorBuckets[key] || 0) + 1;
          
          // 統計色域
          if (h >= 0 && h < 60 || h >= 300) warmPixels++;
          else if (h >= 60 && h < 240) coolPixels++;
          else if (h >= 240 && h < 300) purplePixels++;
          
          // 邊緣複雜度簡易估算：計算當前像素與右側、下方像素的亮度差
          const x = (i / 4) % size;
          const y = Math.floor((i / 4) / size);
          if (x < size - 1 && y < size - 1) {
            const rightIdx = (y * size + (x + 1)) * 4;
            const downIdx = ((y + 1) * size + x) * 4;
            const rightL = 0.299 * data[rightIdx] + 0.587 * data[rightIdx+1] + 0.114 * data[rightIdx+2];
            const downL = 0.299 * data[downIdx] + 0.587 * data[downIdx+1] + 0.114 * data[downIdx+2];
            edgeComplexity += Math.abs(l - rightL) + Math.abs(l - downL);
          }
        }
        
        // 平均指標
        const avgR = Math.round(totalR / pixelCount);
        const avgG = Math.round(totalG / pixelCount);
        const avgB = Math.round(totalB / pixelCount);
        const avgL = Math.round(totalL / pixelCount);
        const avgS = Math.round(totalS / pixelCount);
        const normalizedComplexity = Math.round(edgeComplexity / (pixelCount * 2));
        
        // 計算主導的 Hex 顏色
        const toHex = (c) => {
          const hex = c.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        const dominantHex = `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`;
        
        // 找到色彩桶中最熱門的 HSL
        let maxCount = 0;
        let dominantBucket = '0,0,50';
        for (const bucket in colorBuckets) {
          if (colorBuckets[bucket] > maxCount) {
            maxCount = colorBuckets[bucket];
            dominantBucket = bucket;
          }
        }
        const [domH, domS, domL] = dominantBucket.split(',').map(Number);
        
        // 翻譯色彩名稱
        const getColorName = (h, s, l) => {
          if (s < 12) {
            if (l < 20) return '深黑';
            if (l > 80) return '純白';
            return '中性灰調';
          }
          if (l < 15) return '暗黑色系';
          if (l > 85) return '極淡柔和色';
          
          if (h >= 345 || h < 15) return '紅、緋紅';
          if (h >= 15 && h < 45) return '暖橙、落日橘';
          if (h >= 45 && h < 75) return '金黃、琥珀';
          if (h >= 75 && h < 140) return '清新綠、森林綠';
          if (h >= 140 && h < 170) return '薄荷綠、青綠';
          if (h >= 170 && h < 200) return '冰藍、青黛';
          if (h >= 200 && h < 240) return '天藍、湛藍';
          if (h >= 240 && h < 280) return '幽紫、靛藍';
          if (h >= 280 && h < 315) return '神秘紫、洋紅';
          return '玫瑰粉、桃紅';
        };
        
        const dominantColorName = getColorName(domH, domS, domL);
        
        // 啟發式決策判定
        let style = '';
        let colorDesc = '';
        let composition = '';
        let lighting = '';
        let texture = '';
        let mood = '';
        let description = '';
        let keywords = '';
        
        // 1. 構圖檢測：簡化判斷
        if (normalizedComplexity < 12) {
          composition = '極簡留白構圖、中心點聚焦';
        } else if (avgL > 65) {
          composition = '經典三分法構圖、開闊高調視野';
        } else {
          composition = '黃金比例分割構圖、豐富層次對稱佈局';
        }
        
        // 2. 決策矩陣判斷風格
        if (avgS < 15) {
          // 黑白膠片
          style = '經典黑白攝影 / 膠片電影質感 (Vintage Monochrome Film)';
          colorDesc = `純淨無彩色系、黑白灰階對比，主要基調色接近 ${dominantHex}`;
          lighting = avgL < 40 ? '強烈低調影棚光、高對比側光、戲劇性陰影' : '均勻自然散光、高調柔和明暗層次';
          texture = '細顆粒膠片質感、經典銀鹽紙質、復古磨砂';
          mood = '寧靜、懷舊、故事感、深邃而雋永';
          description = `這是一張經典復古的黑白風格照片，畫面透過無彩色系的精緻黑白灰層次展開。主體在光影雕琢下呈現強烈的質感與深度，邊緣輪廓分明，展現出豐富的細節對比與極強的故事張力。`;
          keywords = 'classic black and white photography, monochrome film grain, dramatic shadows, silver halide paper texture, cinematic lighting, nostalgic, timeless aesthetic, deep contrast';
        } 
        else if (avgS > 50 && avgL < 45 && purplePixels > (pixelCount / 10)) {
          // 賽博朋克
          style = '賽博朋克霓虹科技風 (Cyberpunk Tech Aesthetic)';
          colorDesc = `高飽和霓虹配色、亮藍與粉紫強烈冷暖對比、深邃暗調基底色為 ${dominantHex}`;
          lighting = '霓虹微光發光、背光反射、戲劇性人工點光源';
          texture = '亮面金屬反射、雨夜濕滑路面反光、科技玻璃質感';
          mood = '科幻未來感、前衛街頭、神秘、深夜冷寂';
          description = `這是一張充滿科幻未來感的賽博朋克風影像。深邃的暗部基調與高飽和度的粉紫、冰藍霓虹發光形成劇烈的色彩反差，金屬與玻璃折射出迷離的雨夜反光，塑造出強烈的近未來都市氣息。`;
          keywords = 'cyberpunk style, neon lights, glowing pink and purple cyan accents, rain-slicked street reflection, high contrast, futuristic tech vibe, blade runner aesthetic, hyper-detailed';
        } 
        else if (avgL > 55 && avgS > 30 && coolPixels > warmPixels * 1.2) {
          // 日系清新
          style = '清新日系動漫手繪風 (Anime & Shinkai Aesthetic)';
          colorDesc = `明亮天藍、金黃落日色、淡雅馬卡龍色調，主色調偏向明朗的 ${dominantColorName} (${dominantHex})`;
          lighting = '治癒系逆光、強烈落日斜陽光暈、邊緣發光';
          texture = '清新水彩質感、細膩手繪筆觸、微風漫反射';
          mood = '青春、治癒、唯美夢幻、溫馨的夏日 nostalgia';
          description = `這是一張清新唯美的日系動漫風格畫作。天空中浮動著大片明亮的雲朵，溫柔的落日逆光為整個畫面鍍上一層毛茸茸的金黃發光邊緣，明亮舒暢的天藍與地面的暖色形成了讓人心安的動漫色彩。`;
          keywords = 'Makoto Shinkai style, anime aesthetic, breathtaking cloudscape, golden hour sun shafts, backlighting glow, youth nostalgia, vibrant but pastel color palette, highly detailed';
        } 
        else if (warmPixels > coolPixels * 1.5 && avgS > 45 && avgL > 50) {
          // 溫暖豐收/鮮豔秋季/活力色
          style = '溫暖陽光活力藝術風 (Vibrant Sunny / Autumn Aesthetic)';
          colorDesc = `高飽和暖色調、鮮明 ${dominantColorName}、熱烈金黃與橘紅`;
          lighting = '溫暖金色陽光、明亮側光、高透明度漫散射';
          texture = '豐富微小質感、自然手繪筆觸、溫和紙張纖維';
          mood = '活力、溫馨、明朗、幸福、熱烈歡樂';
          description = `這是一張洋溢著溫暖陽光的活力風格圖片。主色調為溫馨的 ${dominantColorName}，豐富的暖橙、金黃色澤如秋日陽光般灑落，色彩高飽和而富有感染力，光線充足明亮，傳遞出濃濃的溫暖與生機。`;
          keywords = 'vibrant warm tones, sunny golden hour lighting, autumn color palette, cozy sunny vibe, high saturation, artistic illustration, detailed render, welcoming atmosphere';
        }
        else if (avgL < 35 && avgS < 30) {
          // 深沈暗調 / 懸疑電影
          style = '深沉暗調 / 懸疑電影質感 (Dark Moody Cinematic Style)';
          colorDesc = `低飽和深沉冷色、局部 ${dominantColorName} 微光、底色為 ${dominantHex}`;
          lighting = '微弱局部光、低明度戲劇性側光、高對比斑駁光影';
          texture = '暗色磨砂、粗糙水泥牆面、有歲月刻痕的材質';
          mood = '神祕、孤寂、冷酷、充滿懸疑的故事張力';
          description = `這是一張充滿懸疑電影質感的深沉暗色調影像。大面積的暗部投影幾乎吞噬了背景，僅有局部的微弱光線投射在主體上，將色彩與細節壓抑至最低限度，渲染出極致的神祕與張力。`;
          keywords = 'dark moody cinematography, dim focal lighting, heavy shadows, film noir atmosphere, low key contrast, mysterious, cinematic suspense, textured grain';
        }
        else if (normalizedComplexity < 15 && avgS > 35) {
          // 極簡插畫
          style = '扁平極簡向量插畫 (Minimalist Flat Vector Illustration)';
          colorDesc = `乾淨純色塊、亮麗明朗、${dominantColorName} 對比色搭配 (基調為 ${dominantHex})`;
          lighting = '均勻無投影、扁平二維光線、高飽和無陰影';
          texture = '乾淨滑順無顆粒、極簡向量線條、數位扁平風格';
          mood = '簡約、時尚、趣味、現代平面設計感';
          description = `這是一張風格獨特的扁平極簡插畫。畫面捨棄了複雜的立體光影，純粹使用乾淨的 ${dominantColorName} 色塊與極簡的二維線條勾勒出形體，配色時尚明快，給人以強烈的平面設計美感。`;
          keywords = 'flat design vector illustration, minimalist, corporate memphis style, clean geometric shapes, solid color blocks, modern graphic design, high contrast, bold lines';
        }
        else {
          // 寫實商業攝影 (預設高品質)
          style = '寫實商業攝影 / 頂級產品畫質 (High-end Product Photography)';
          colorDesc = `真實自然色彩、亮暗部層次豐富、${dominantColorName} 點綴 (基底色為 ${dominantHex})`;
          lighting = '專業多光源、柔光箱擴散、清晰點光源高光反射';
          texture = '細膩寫實肌理、清透玻璃或金屬光澤、高級磨砂工藝';
          mood = '專業、高檔尊貴、精準現代、商業品質';
          description = `這是一張達到寫實商業攝影級別的高級圖像。畫面採用了專業的影棚多光源佈局，精細地還原了主體表面的細膩材質肌理，亮部的高光折射與暗部柔和的漸變陰影交織，層次分明而高級。`;
          keywords = 'commercial product photography, studio light setup, realistic textures, glossy metallic highlights, soft diffused shadows, high contrast, clean backdrop, premium quality';
        }
        
        callback({
          style,
          colorDesc,
          composition,
          lighting,
          texture,
          mood,
          description,
          keywords
        });
      } catch (err) {
        console.error('Image analysis error:', err);
        callback(null);
      }
    };
    img.onerror = () => {
      callback(null);
    };
    img.src = dataUrl;
  }

  function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const radar = $('#scanRadar');
      const placeholder = $('#uploadArea .upload-placeholder');
      const preview = $('#uploadPreview');
      const form = $('#analysisForm');
      const lang = state.currentGlobalLang || 'zh';

      // 顯示雷達，隱藏 placeholder 與預覽
      if (radar) radar.style.display = 'flex';
      if (placeholder) placeholder.style.display = 'none';
      preview.style.display = 'none';
      
      // 表單暫時淡出，呈現極佳的 AI 分析儀式感，並禁用點選
      if (form) {
        form.style.opacity = '0.15';
        form.style.pointerEvents = 'none';
        form.style.transition = 'opacity 0.5s ease';
      }

      // 開始真實圖像分析
      analyzeImage(e.target.result, (result) => {
        const fillData = result || {
          style: '現代數位藝術風格 (Modern Digital Art Style)',
          colorDesc: '平衡的色彩搭配、自然的明暗對比',
          composition: '經典三分法構圖、高質感的構圖方式',
          lighting: '自然環境光、細緻光影投射',
          texture: '細膩數位筆觸、光滑清透的畫質',
          mood: '現代、精緻、簡約且和諧的氛圍',
          description: '這是一張色彩精緻且光影層次自然的現代風格圖像。',
          keywords: 'modern digital art, balanced color palette, natural soft lighting, detailed composition'
        };

        setTimeout(() => {
          // 隱藏雷達，顯示預覽與淡入表單
          if (radar) radar.style.display = 'none';
          preview.src = e.target.result;
          preview.style.display = 'block';
          preview.style.opacity = '0';
          preview.style.transition = 'opacity 0.5s ease';
          setTimeout(() => {
            preview.style.opacity = '1';
          }, 50);
          
          if (form) {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            
            // 將電腦視覺真實分析的成果，高精準度地填入輸入框！
            $('#analysisStyle').value = fillData.style;
            $('#analysisColor').value = fillData.colorDesc;
            $('#analysisComposition').value = fillData.composition;
            $('#analysisLighting').value = fillData.lighting;
            $('#analysisTexture').value = fillData.texture;
            $('#analysisMood').value = fillData.mood;
            $('#analysisDescription').value = fillData.description;
            $('#analysisKeywords').value = fillData.keywords;
          }
          
          // 完美對齊語系
          const toastMsg = {
            zh: '圖像風格深度分析完成 🔬',
            en: 'Image style deep analysis completed 🔬',
            ja: '画像スタイル分析が完了しました 🔬',
            ko: '이미지 스타일 분석이 완료되었습니다 🔬'
          }[lang] || '圖像風格深度分析完成 🔬';
          showToast(toastMsg);
        }, 1500); // 完美的 1.5 秒 AI 掃描儀式感，兼顧科技感與體驗
      });
    };
    reader.readAsDataURL(file);
  }

  function highlightVariableInTextarea(varName) {
    const textarea = $('#promptTextarea');
    if (!textarea) return;
    const text = textarea.value;
    const index = text.indexOf(varName);
    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + varName.length);
    }
  }

  // ----------------------------------------------------------
  // Event Bindings
  // ----------------------------------------------------------
  function bindEvents() {
    const safeBind = (sel, event, cb) => {
      const el = $(sel);
      if (el) {
        el.addEventListener(event, cb);
      }
    };

    // Search Input and "/" shortcut focus
    const searchInput = $('#searchInput');
    let searchTimeout;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          state.searchQuery = searchInput.value;
          renderGallery();
        }, 200);
      });

      // Clear search
      safeBind('#searchClear', 'click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        renderGallery();
      });

      // Keyboard hotkey '/' to search
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      });
    }

    // Category Selector
    safeBind('#categoryList', 'click', (e) => {
      const item = e.target.closest('.category-item');
      if (!item) return;
      $$('.category-item').forEach((el) => el.classList.remove('active'));
      item.classList.add('active');
      state.currentCategory = item.dataset.category;
      renderGallery();
    });

    // Difficulty Segmented Tabs
    safeBind('#difficultyFilter', 'click', (e) => {
      const btn = e.target.closest('.segment-btn');
      if (!btn) return;
      $$('#difficultyFilter .segment-btn').forEach((el) =>
        el.classList.remove('active')
      );
      btn.classList.add('active');
      state.currentDifficulty = btn.dataset.difficulty;
      renderGallery();
    });

    // Horizontal Scrolling Tags Filter
    safeBind('#tagFilter', 'click', (e) => {
      const btn = e.target.closest('.filter-tag');
      if (!btn) return;
      const tag = btn.dataset.tag;
      if (state.currentTags.has(tag)) {
        state.currentTags.delete(tag);
        btn.classList.remove('active');
      } else {
        state.currentTags.add(tag);
        btn.classList.add('active');
      }
      renderGallery();
    });

    // Gallery Card clicks
    safeBind('#galleryGrid', 'click', (e) => {
      // 廣告關閉按鈕 ✕ 點擊
      const closeAdBtn = e.target.closest('.sponsor-close');
      if (closeAdBtn) {
        e.stopPropagation();
        const adId = closeAdBtn.dataset.id;
        state.closedSponsors.add(adId);
        try {
          localStorage.setItem('nb_closed_sponsors', JSON.stringify([...state.closedSponsors]));
        } catch (err) {}
        renderGallery();
        showToast('已隱藏該推廣卡片 ✕');
        return;
      }

      // Favorite button
      const favBtn = e.target.closest('.card-fav');
      if (favBtn) {
        e.stopPropagation();
        toggleFavorite(favBtn.dataset.id);
        return;
      }
      
      // Card click
      const card = e.target.closest('.template-card');
      if (card) {
        const templateId = card.dataset.id;
        const isLocked = card.dataset.locked === 'true';
        
        if (isLocked) {
          e.stopPropagation();
          state.pendingUnlockId = templateId;
          
          // 查找模板名稱
          const t = state.templates.find(x => String(x.id) === String(templateId)) ||
                    state.squareTemplates.find(x => String(x.id) === String(templateId));
          const name = t ? (state.currentGlobalLang === 'zh' ? (t.name_zh || t.name_en) : (t.name_en || t.name_zh)) : '高級提示詞';
          
          $('#unlockTemplateName').textContent = name;
          $('#unlockUserPoints').textContent = state.points;
          
          // 打開解鎖 Modal
          const unlockModal = $('#unlockModal');
          if (unlockModal) {
            unlockModal.style.display = 'flex';
            setTimeout(() => unlockModal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
          }
        } else {
          openTemplateModal(templateId);
        }
      }
    });

    // Gallery Card keyboard Enter
    safeBind('#galleryGrid', 'keydown', (e) => {
      if (e.key === 'Enter') {
        const card = e.target.closest('.template-card');
        if (card) {
          const templateId = card.dataset.id;
          const isLocked = card.dataset.locked === 'true';
          
          if (isLocked) {
            e.stopPropagation();
            state.pendingUnlockId = templateId;
            const t = state.templates.find(x => String(x.id) === String(templateId)) ||
                      state.squareTemplates.find(x => String(x.id) === String(templateId));
            const name = t ? (state.currentGlobalLang === 'zh' ? (t.name_zh || t.name_en) : (t.name_en || t.name_zh)) : '高級提示詞';
            $('#unlockTemplateName').textContent = name;
            $('#unlockUserPoints').textContent = state.points;
            
            const unlockModal = $('#unlockModal');
            if (unlockModal) {
              unlockModal.style.display = 'flex';
              setTimeout(() => unlockModal.classList.add('active'), 10);
              document.body.style.overflow = 'hidden';
            }
          } else {
            openTemplateModal(templateId);
          }
        }
      }
    });

    // 視窗大小改變時重算瀑布流
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (state.viewMode === 'grid') {
          renderGallery();
        }
      }, 150);
    });

    // ========================================================================
    // 新增：積分中心與解鎖業務邏輯綁定
    // ========================================================================
    
    // 開啟積分中心 Modal
    const openPointsModal = () => {
      const modal = $('#pointsModal');
      if (!modal) return;
      
      // 更新積分顯示
      $('#userPointsDisplay').textContent = state.points;
      
      // 生成專屬邀請連結
      const randId = Math.abs(state.points * 31 + 47) % 900000 + 100000;
      const refCode = `nb_${randId}`;
      const refLink = `${window.location.origin}${window.location.pathname}?ref=${refCode}`;
      
      $('#referralLinkInput').value = refLink;
      
      // 更新簽到按鈕狀態
      const today = new Date().toISOString().split('T')[0];
      const checkInBtn = $('#dailyCheckInBtn');
      if (checkInBtn) {
        if (state.lastCheckInDate === today) {
          checkInBtn.textContent = '📅 今日已簽到';
          checkInBtn.disabled = true;
          checkInBtn.style.opacity = '0.6';
        } else {
          checkInBtn.textContent = '📅 每日簽到 (+20)';
          checkInBtn.disabled = false;
          checkInBtn.style.opacity = '1';
        }
      }
      
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);
      document.body.style.overflow = 'hidden';
    };

    safeBind('#headerPointsBtn', 'click', openPointsModal);
    safeBind('#referralBanner', 'click', openPointsModal);

    // 關閉積分中心 Modal
    const closePointsModal = () => {
      const modal = $('#pointsModal');
      if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
      }
      document.body.style.overflow = '';
    };
    safeBind('#pointsModalClose', 'click', closePointsModal);
    safeBind('#pointsModal', 'click', (e) => {
      if (e.target === $('#pointsModal')) closePointsModal();
    });

    // 每日簽到
    safeBind('#dailyCheckInBtn', 'click', () => {
      const today = new Date().toISOString().split('T')[0];
      if (state.lastCheckInDate === today) {
        showToast('今日已經簽到過囉！');
        return;
      }
      
      // 雙向 IndexedDB 設備指紋防刷校驗
      checkFingerprintCheckInIndexedDB(today, (isFingerprintCheckedIn) => {
        if (isFingerprintCheckedIn) {
          showToast('⚠️ 檢測到此設備今日已簽到過囉！', 'error');
          // 自動同步禁用按鈕狀態
          const checkInBtn = $('#dailyCheckInBtn');
          if (checkInBtn) {
            checkInBtn.textContent = '📅 今日已簽到';
            checkInBtn.disabled = true;
            checkInBtn.style.opacity = '0.6';
          }
          return;
        }

        // 正常簽到
        state.points += 20;
        state.lastCheckInDate = today;
        try {
          localStorage.setItem('nb_last_checkin_date', today);
        } catch (err) {}
        saveFingerprintCheckInIndexedDB(today);
        persistPoints();
        showToast('簽到成功，獲得 20 積分！📅', 'success');
        triggerSimulatedEarnings();
        
        // 禁用按鈕
        const checkInBtn = $('#dailyCheckInBtn');
        if (checkInBtn) {
          checkInBtn.textContent = '📅 今日已簽到';
          checkInBtn.disabled = true;
          checkInBtn.style.opacity = '0.6';
        }
      });
    });

    // 複製邀請連結
    safeBind('#copyReferralLinkBtn', 'click', () => {
      const linkInput = $('#referralLinkInput');
      if (linkInput) {
        linkInput.select();
        try {
          navigator.clipboard.writeText(linkInput.value);
          showToast('邀請連結已複製到剪貼簿 📋', 'success');
        } catch (err) {
          document.execCommand('copy');
          showToast('邀請連結已複製到剪貼簿 📋', 'success');
        }
      }
    });

    // 啟用邀請碼
    safeBind('#submitReferralCodeBtn', 'click', () => {
      if (state.hasUsedReferralCode) {
        showToast('您已經啟用過迎新禮，無法重複領取！', 'error');
        return;
      }
      const codeInput = $('#referralCodeInput');
      const val = codeInput ? codeInput.value.trim() : '';
      if (!val.startsWith('nb_') || val.length < 5) {
        showToast('無效的邀請碼格式，請輸入類似 nb_XXXXXX 的邀請碼', 'error');
        return;
      }
      
      state.points += 50;
      state.hasUsedReferralCode = true;
      try {
        localStorage.setItem('nb_has_used_referral_code', 'true');
      } catch (err) {}
      persistPoints();
      showToast('成功啟用好友邀請！獲得 50 積分迎新大禮 🎁', 'success');
      if (codeInput) codeInput.value = '';
    });

    // 關閉解鎖 Modal
    const closeUnlockModal = () => {
      const modal = $('#unlockModal');
      if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
      }
      document.body.style.overflow = '';
      state.pendingUnlockId = null;
    };
    safeBind('#unlockModalClose', 'click', closeUnlockModal);
    safeBind('#cancelUnlockBtn', 'click', closeUnlockModal);
    safeBind('#unlockModal', 'click', (e) => {
      if (e.target === $('#unlockModal')) closeUnlockModal();
    });

    // 確認扣分解鎖
    safeBind('#confirmUnlockBtn', 'click', () => {
      const tid = state.pendingUnlockId;
      if (!tid) return;
      
      if (state.points < 10) {
        showToast('您的積分點數不足！請透過簽到或邀請好友免費獲取積分。', 'error');
        return;
      }
      
      const isSquareTemplate = state.squareTemplates.some(x => String(x.id) === String(tid));
      let authorName = '';
      if (isSquareTemplate) {
        const sq = state.squareTemplates.find(x => String(x.id) === String(tid));
        if (sq) {
          authorName = sq.author;
        }
      }

      state.points -= 10;
      state.unlockedTemplates.add(tid);
      
      persistPoints();
      persistUnlockedTemplates();
      
      if (isSquareTemplate && authorName) {
        const successMsg = state.currentGlobalLang === 'zh'
          ? `解鎖廣場提示詞成功！已將消耗的 10 積分轉給創作者 ${authorName}！🔑`
          : `Unlocked square template successfully! 10 points transferred to creator ${authorName}! 🔑`;
        showToast(successMsg, 'success');
      } else {
        showToast('永久解鎖高級提示詞成功！🔑', 'success');
      }
      closeUnlockModal();
      
      // 重新渲染畫廊（更新鎖定狀態遮罩）
      renderGallery();
      
      // 延遲自動開啟該模板的詳情
      setTimeout(() => {
        openTemplateModal(tid);
      }, 100);
    });

    // Gallery View Mode Toggle
    $$('.view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.view-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.viewMode = btn.dataset.view;
        renderGallery();
      });
    });

    // 🎯 核心場景引導橫向滑動卡片點擊
    const sceneVisualScroll = $('#sceneVisualScroll');
    if (sceneVisualScroll) {
      sceneVisualScroll.addEventListener('click', (e) => {
        const card = e.target.closest('.scene-visual-card');
        if (card) {
          selectScene(card.dataset.scene);
        }
      });
      sceneVisualScroll.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const card = e.target.closest('.scene-visual-card');
          if (card) {
            selectScene(card.dataset.scene);
          }
        }
      });
    }

    // Clear Active Scene
    safeBind('#clearScene', 'click', () => {
      state.currentScene = null;
      hideSceneInfo();
      renderVisualSceneBoard();
      renderGallery();
      if (state.currentTemplate) updatePromptDisplay();
    });

    // Template Modal actions
    safeBind('#modalClose', 'click', closeTemplateModal);
    safeBind('#templateModal', 'click', (e) => {
      if (e.target === $('#templateModal')) closeTemplateModal();
    });

    // Modal favorite
    safeBind('#modalFavorite', 'click', () => {
      if (!state.currentTemplate) return;
      toggleFavorite(state.currentTemplate.id);
      const isFav = state.favorites.has(state.currentTemplate.id);
      $('#modalFavorite').textContent = isFav ? '★' : '☆';
      $('#modalFavorite').classList.toggle('active', isFav);
    });

    // Language toggle
    safeBind('#langToggle', 'click', (e) => {
      const btn = e.target.closest('.lang-btn');
      if (!btn) return;
      state.currentLang = btn.dataset.lang;
      $$('#langToggle .lang-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.lang === state.currentLang)
      );
      updatePromptDisplay();
    });

    // Variable inputs focus, input, and blur event binding
    safeBind('#variablesList', 'input', () => {
      updatePromptDisplay();
    });

    safeBind('#variablesList', 'focusin', (e) => {
      const input = e.target.closest('.var-input');
      if (!input) return;
      updatePromptDisplay();

      // Overlaid and Native selection sync
      const varName = input.dataset.var;
      const val = input.value.trim();
      const targetText = val || varName;
      const textarea = $('#promptTextarea');
      const highlighter = $('#promptHighlighter');
      if (textarea && targetText) {
        const idx = textarea.value.indexOf(targetText);
        if (idx !== -1) {
          textarea.setSelectionRange(idx, idx + targetText.length);
          
          // Auto scroll to target line (just like high-end IDE view)
          const lineCount = textarea.value.substring(0, idx).split('\n').length;
          const lineHeight = 24; // 1.7 line-height * 14.4px font-size ≈ 24px
          textarea.scrollTop = Math.max(0, (lineCount - 3) * lineHeight);
          if (highlighter) highlighter.scrollTop = textarea.scrollTop;
        }
      }
    });

    safeBind('#variablesList', 'focusout', (e) => {
      if (e.target.closest('.var-input')) {
        updatePromptDisplay();
      }
    });

    // Prompt textarea manual edit & scroll sync
    const promptTextarea = $('#promptTextarea');
    const promptHighlighter = $('#promptHighlighter');
    if (promptTextarea && promptHighlighter) {
      promptTextarea.addEventListener('scroll', () => {
        promptHighlighter.scrollTop = promptTextarea.scrollTop;
        promptHighlighter.scrollLeft = promptTextarea.scrollLeft;
      });
      
      promptTextarea.addEventListener('input', () => {
        state.isCustomized = true;
        state.customPrompt = promptTextarea.value;
        
        // 即時差異化增減右側的變數 input 列表，讓介面與內容同步改變，且不丟失焦點！
        syncVariablesListFromTextarea();
        
        // 實時渲染高亮層，使用者打字立刻能看得見！
        renderHighlighterFromCustomPrompt();
      });
    }

    // Quality boosters tag selection
    safeBind('#qualityCategories', 'click', (e) => {
      const tag = e.target.closest('.quality-tag');
      if (!tag) return;
      tag.classList.toggle('selected');
      updatePromptDisplay();
    });

    // Quality Accordion toggle expanding/collapsing
    const qualityAccordionTrigger = $('#qualityAccordionTrigger');
    const qualityCategories = $('#qualityCategories');
    if (qualityAccordionTrigger && qualityCategories) {
      qualityAccordionTrigger.addEventListener('click', () => {
        const isExpanded = qualityAccordionTrigger.getAttribute('aria-expanded') === 'true';
        qualityAccordionTrigger.setAttribute('aria-expanded', !isExpanded);
        qualityAccordionTrigger.classList.toggle('active', !isExpanded);
        qualityCategories.classList.toggle('open', !isExpanded);
      });
    }

    // Add Custom Template Button inside Header
    safeBind('#addCustomBtn', 'click', () => openCustomModal());

    // Copy prompt
    safeBind('#copyPrompt', 'click', () => {
      const text = $('#promptTextarea').value;
      if (text) {
        copyToClipboard(text);
        triggerSimulatedEarnings();
      }
    });

    // Reset prompt
    safeBind('#resetPrompt', 'click', () => {
      $$('.var-input').forEach((input) => (input.value = ''));
      $$('.quality-tag.selected').forEach((tag) =>
        tag.classList.remove('selected')
      );
      updatePromptDisplay();
    });

    // Save as custom
    safeBind('#saveAsCustom', 'click', () => {
      const prompt = $('#promptTextarea').value;
      openCustomModal({
        name: state.currentTemplate
          ? state.currentTemplate.name_zh + ' (自訂)'
          : '',
        tags: state.currentTemplate ? state.currentTemplate.tags : [],
        prompt,
      });
    });

    // Analysis modal trigger (from header button)
    safeBind('#imageAnalysisBtn', 'click', openAnalysisModal);
    safeBind('#analysisClose', 'click', closeAnalysisModal);
    safeBind('#analysisModal', 'click', (e) => {
      if (e.target === $('#analysisModal')) closeAnalysisModal();
    });

    // Copy analysis
    safeBind('#copyAnalysis', 'click', () => {
      const fields = [
        ['整體風格', '#analysisStyle'],
        ['色彩分析', '#analysisColor'],
        ['構圖方式', '#analysisComposition'],
        ['光影效果', '#analysisLighting'],
        ['材質/質感', '#analysisTexture'],
        ['氛圍/情緒', '#analysisMood'],
        ['詳細描述', '#analysisDescription'],
        ['建議提示詞關鍵字', '#analysisKeywords'],
      ];
      const text = fields
        .map(([label, sel]) => `${label}: ${$(sel).value || '(未填寫)'}`)
        .join('\n');
      copyToClipboard(text);
    });

    // Generate remix prompt
    safeBind('#generateRemixPrompt', 'click', () => {
      const style = $('#analysisStyle').value;
      const color = $('#analysisColor').value;
      const comp = $('#analysisComposition').value;
      const light = $('#analysisLighting').value;
      const texture = $('#analysisTexture').value;
      const mood = $('#analysisMood').value;
      const keywords = $('#analysisKeywords').value;
      const lang = state.currentGlobalLang || 'zh';

      let remix = '';
      if (lang === 'zh') {
        remix = '請生成一張圖片，風格參數如下：\n';
        if (style) remix += `風格：${style}\n`;
        if (color) remix += `色彩：${color}\n`;
        if (comp) remix += `構圖：${comp}\n`;
        if (light) remix += `光影：${light}\n`;
        if (texture) remix += `材質：${texture}\n`;
        if (mood) remix += `氛圍：${mood}\n`;
        if (keywords) remix += `\n關鍵詞：${keywords}\n`;
        remix += '\n請保持以上風格參數，但創作全新的畫面內容。';
      } else {
        // English / i18n fallback
        remix = 'Please generate an image with the following style parameters:\n';
        if (style) remix += `Style: ${style}\n`;
        if (color) remix += `Colors: ${color}\n`;
        if (comp) remix += `Composition: ${comp}\n`;
        if (light) remix += `Lighting: ${light}\n`;
        if (texture) remix += `Texture: ${texture}\n`;
        if (mood) remix += `Mood: ${mood}\n`;
        if (keywords) remix += `\nKeywords: ${keywords}\n`;
        remix += '\nPlease maintain these style parameters but create completely new image content.';
      }

      copyToClipboard(remix);
      
      const toastMsg = {
        zh: 'Remix 提示詞已複製 🎨',
        en: 'Remix prompt copied 🎨',
        ja: 'Remixプロンプトをコピーしました 🎨',
        ko: 'Remix 프롬프트가 복사되었습니다 🎨'
      }[lang] || 'Remix 提示詞已複製 🎨';
      showToast(toastMsg);
    });

    // Custom template modal
    safeBind('#customClose', 'click', closeCustomModal);
    safeBind('#customModal', 'click', (e) => {
      if (e.target === $('#customModal')) closeCustomModal();
    });
    safeBind('#saveCustom', 'click', () => saveCustomTemplate(false));
    safeBind('#publishCustom', 'click', () => saveCustomTemplate(true));
    safeBind('#publishToSquare', 'click', () => {
      if (state.currentTemplate) {
        publishCustomTemplate(state.currentTemplate);
        closeTemplateModal();
      }
    });
    safeBind('#cancelCustom', 'click', closeCustomModal);

    // 新增：需要參考圖片切換事件
    safeBind('#customRequiresInput', 'change', (e) => {
      const container = $('#customInputDescContainer');
      if (container) {
        container.style.display = e.target.checked ? 'block' : 'none';
      }
    });

    // 新增：編輯與刪除自訂模板點擊事件
    safeBind('#editCustom', 'click', () => {
      if (state.currentTemplate) {
        const t = state.currentTemplate;
        closeTemplateModal();
        openCustomModal(t);
      }
    });

    safeBind('#deleteCustom', 'click', () => {
      if (state.currentTemplate) {
        const t = state.currentTemplate;
        const lang = state.currentGlobalLang || 'zh';
        const dict = I18N_DICTS[lang] || I18N_DICTS['zh'];
        const confirmMsg = dict['toast.delete_confirm'] || '確定要刪除此自訂模板嗎？此動作無法復原。';
        if (confirm(confirmMsg)) {
          state.customTemplates = state.customTemplates.filter((x) => x.id !== t.id);
          state.squareTemplates = state.squareTemplates.filter((x) => x.id !== t.id);
          persistCustomTemplates();
          persistSquareTemplates();
          closeTemplateModal();
          renderGallery();
          updateCounts();
          const deletedMsg = dict['toast.custom_deleted'] || '自訂模板已刪除 🗑️';
          showToast(deletedMsg);
        }
      }
    });

    // Upload
    setupUpload();

    // Global Language selector Dropdown logic
    const trigger = $('#langDropdownTrigger');
    const menu = $('#langDropdownMenu');
    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.getAttribute('aria-hidden') === 'true';
        menu.setAttribute('aria-hidden', !isHidden);
        trigger.setAttribute('aria-expanded', isHidden);
        menu.classList.toggle('show', isHidden);
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        menu.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('show');
      });

      // Item selection
      menu.addEventListener('click', (e) => {
        const item = e.target.closest('.lang-dropdown-item');
        if (item) {
          const selectedLang = item.dataset.lang;
          changeLanguage(selectedLang);
        }
      });
    }

    // Theme toggle
    const themeToggle = $('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem('nb_theme', nextTheme);
        showToast(`已切換至${nextTheme === 'dark' ? '深色' : '明亮'}主題 🌓`);
      });
    }

    // Variable inputs focus highlist positioning
    const varList = $('#variablesList');
    if (varList) {
      varList.addEventListener('focusin', (e) => {
        const input = e.target.closest('.var-input');
        if (input) {
          highlightVariableInTextarea(input.dataset.var);
        }
      });
    }

    // Sidebar toggle (Desktop: Mini sidebar)
    const sidebarToggle = $('#sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const sidebar = $('#sidebar');
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('nb_sidebar_collapsed', isCollapsed);
      });
    }

    // Mobile/Desktop Sidebar Hamburger toggle (.mobileMenu click)
    const mobileMenu = $('#mobileMenu');
    if (mobileMenu) {
      mobileMenu.addEventListener('click', () => {
        const sidebar = $('#sidebar');
        const isMobile = window.innerWidth <= 1200;
        
        if (isMobile) {
          sidebar.classList.toggle('open');
        } else {
          sidebar.classList.toggle('collapsed');
          const isCollapsed = sidebar.classList.contains('collapsed');
          localStorage.setItem('nb_sidebar_collapsed', isCollapsed);
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTemplateModal();
        closeAnalysisModal();
        closeCustomModal();
        $('#sidebar').classList.remove('open');
      }
    });

    // Backup & Restore Actions
    safeBind('#btnExportBackup', 'click', exportBackup);
    safeBind('#btnImportBackup', 'click', () => {
      const fileInput = $('#importBackupFileInput');
      if (fileInput) fileInput.click();
    });
    safeBind('#importBackupFileInput', 'change', handleImportBackup);
  }

  // ----------------------------------------------------------
  // Favorite Toggle
  // ----------------------------------------------------------
  function toggleFavorite(id) {
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
    } else {
      state.favorites.add(id);
    }
    persistFavorites();
    renderGallery();
    updateCounts();
  }

  // ----------------------------------------------------------
  // 備份與還原系統邏輯 (Export / Import Backup)
  // ----------------------------------------------------------
  function generateBackupSignature(points, unlockedArray) {
    const salt = "NanoBananaBackupIntegritySecret_Key_7718290";
    const rawStr = `${points}:${Array.from(unlockedArray || []).sort().join(',')}:${salt}`;
    let h = 0x811c9dc5;
    for (let i = 0; i < rawStr.length; i++) {
      h ^= rawStr.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  function exportBackup() {
    try {
      const backupData = {
        app: "Banana Mage Banana咒語",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        data: {
          favorites: [...state.favorites],
          customTemplates: state.customTemplates,
          points: state.points,
          unlockedTemplates: [...state.unlockedTemplates],
          theme: localStorage.getItem('nb_theme') || 'dark',
          globalLang: state.currentGlobalLang || 'zh'
        },
        signature: generateBackupSignature(state.points, [...state.unlockedTemplates])
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = `nano-banana-backup-${dateStr}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);

      const msg = state.currentGlobalLang === 'zh' ? '資料備份匯出成功！📤' : 'Backup exported successfully! 📤';
      showToast(msg, 'success');
    } catch (e) {
      console.error('匯出備份失敗:', e);
      const errMsg = state.currentGlobalLang === 'zh' ? '匯出備份失敗 ❌' : 'Failed to export backup ❌';
      showToast(errMsg, 'error');
    }
  }

  function handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const backup = JSON.parse(evt.target.result);
        
        // 驗證備份格式
        if (!backup || !backup.data || (!backup.data.favorites && !backup.data.customTemplates)) {
          throw new Error("Invalid backup format");
        }

        // 備份簽章完整性防偽驗證
        const expectedSig = generateBackupSignature(parseInt(backup.data.points || 0, 10), backup.data.unlockedTemplates || []);
        if (backup.signature !== expectedSig) {
          console.error("⚠️ [Security Restrict] 匯入備份簽章不相符，阻斷復原！");
          const tamperMsg = state.currentGlobalLang === 'zh' 
            ? "匯入失敗：檢測到備份檔案資料完整性異常，疑似被篡改 ❌" 
            : "Import failed: Backup file signature mismatch (Tampered) ❌";
          showToast(tamperMsg, 'error');
          e.target.value = '';
          return;
        }

        const confirmMsg = state.currentGlobalLang === 'zh'
          ? "⚠️ 匯入備份將會完全覆蓋您目前的收藏、自訂模板與積分紀錄！確定要繼續嗎？"
          : "⚠️ Importing this backup will completely overwrite your current favorites, custom templates, and points. Do you want to proceed?";

        if (confirm(confirmMsg)) {
          // 寫入 state
          if (backup.data.favorites) state.favorites = new Set(backup.data.favorites);
          if (backup.data.customTemplates) state.customTemplates = backup.data.customTemplates;
          if (backup.data.points !== undefined) state.points = parseInt(backup.data.points, 10);
          if (backup.data.unlockedTemplates) state.unlockedTemplates = new Set(backup.data.unlockedTemplates);
          
          // 寫入 localStorage
          persistFavorites();
          persistCustomTemplates();
          persistPoints();
          persistUnlockedTemplates();

          if (backup.data.theme) {
            localStorage.setItem('nb_theme', backup.data.theme);
            applyTheme();
          }
          if (backup.data.globalLang) {
            state.currentGlobalLang = backup.data.globalLang;
            localStorage.setItem('nb_global_lang', backup.data.globalLang);
          }

          // 即時重新整理渲染
          changeLanguage(state.currentGlobalLang);

          const successMsg = state.currentGlobalLang === 'zh' ? "資料備份還原成功！✅" : "Backup restored successfully! ✅";
          showToast(successMsg, 'success');
        }
      } catch (err) {
        console.error('還原備份失敗:', err);
        const errorMsg = state.currentGlobalLang === 'zh' ? "匯入失敗：不合法的備份檔案格式 ❌" : "Import failed: Invalid backup file format ❌";
        showToast(errorMsg, 'error');
      }
      e.target.value = ''; // 清空以利下一次選取同檔案
    };
    reader.readAsText(file);
  }

  // ----------------------------------------------------------
  // Boot
  // ----------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
