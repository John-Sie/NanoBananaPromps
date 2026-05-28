# 🍌 Nano Banana 提示詞大師 (Prompt Master)

> **整理與構建 (Compiled & Built by)**: John Sie ([ahwayhsieh@gmail.com](mailto:ahwayhsieh@gmail.com))  
> **引導式、場景化 AI 繪圖提示詞 (Prompt) 全方位管理與調詞系統。**  
> Designed for Midjourney, Stable Diffusion, and DALL-E. Built with **202+ curated templates** to help you remix stunning AI artwork in seconds!

---

## 📖 目錄 (Table of Contents)
1. [🇹🇼 繁體中文版 (Traditional Chinese)](#-繁體中文版-traditional-chinese)
2. [🇺🇸 English Version](#-english-version)
3. [🙏 致謝與開源來源 (Credits & Inspiration)](#-致謝與參考來源-credits--inspiration)

---

## 🇹🇼 繁體中文版 (Traditional Chinese)

### 🎯 專案目的與核心願景

在 AI 繪圖的創作流程中，創作者往往面臨**「寫不出好詞」**、**「變數替換繁瑣」**、以及**「生圖目的與風格失焦」**的痛點。  

**Nano Banana 提示詞大師** 的核心願景是**「消除技術雜音，聚焦創作靈感」**：
- **場景化生圖**：告別雜亂無章的關鍵字堆砌，以「活動海報」、「公司簡報」、「商業插畫」等具體需求為導向，直接鎖定生圖目的。
- **所見即所得**：內建變數動態定位高亮與即時中英翻譯，調詞、增減品質控制字一氣呵成。
- **無縫適配風格**：一鍵解析上傳圖片風格，提取色彩、光影、材質與構圖，實現高品質的風格 Remix。

---

### ✨ 新版 V2 革命性重構升級

在 V2 版本中，我們對整體的**資訊架構 (Information Architecture)** 與**美學視覺**進行了全方位的史詩級升級：

- **🌓 雙主題一鍵無縫切換**：
  - **深色模式**：高質感的藍紫漸變背景 (`linear-gradient(#07070f, #110f24)`) 配合細緻的黃色霓虹發光，充滿未來科技感。
  - **明亮模式**：清新優雅的香蕉黃與奶油白 (`#fbfaf5`) 配色，日間閱讀極致舒適。
- **🗂️ Mini Sidebar 桌面端收合**：左側側邊欄極簡化，桌面端點擊 `☰` 可收起為 **Mini Sidebar (72px)**，僅保留 Icon，釋放高達 90% 的可視畫幅！折疊狀態會由 `localStorage` 永久記憶。
- **🎯 核心場景「橫向滑動卡片看板」**：將隱藏在 Dropdown 的場景功能解放至主頁頂部，以橫向膠囊卡片呈現。點擊啟用時伴隨 **Banana Glow 霓虹發光**，並動態淡出顯示構圖比例與調詞 Tips。
- **🎛️ 橫向篩選工具列 (Horizontal Toolbar)**：整合難度切換為高質感 **Segmented Tabs**，並引入 YouTube 風格的 **「橫向滑動標籤列」**，大幅減輕視覺負擔。
- **📝 Modal 品質關鍵詞「Accordion 折疊抽屜」**：將極佔版面的品質關鍵字隱藏於 Accordion 抽屜內，預設收起以控制 Modal 高度，讓變數填寫、代碼編輯器在第一視覺高度完美聚攏。
- **🔬 AI 風格風格分析「雷達掃描線」**：上傳圖片時觸發亮麗的霓虹雷達來回掃描動畫，模擬 AI 解析色彩、光影等參數的過程，賦予功能極佳的儀式感。
- **⚡ 360° 雙向無損同步與變數即時高亮**：在 Modal 中，一旦填寫變數的 Input 獲得焦點 (Focus)，提示詞編輯器中對應的變數會**立刻被藍色高亮選中**。直接在下面編輯器中手動修改已被替換的變數內容，上面的對應輸入框會**自動即時更新**，實現高階 IDE 般的極速調詞體驗。
- **🪙 積分中心與高級解鎖業務**：引入全新的積分激勵系統，在畫廊中將部分進階與 Featured Pro 模板進行鎖定。使用者可透過每日簽到、分享專屬邀請碼來免費獲取積分，消耗 10 積分即可永久解鎖心儀的高級提示詞！
- **🧱 響應式真瀑布流佈局與廣告插值**：重構畫廊排版，引入**等高分發瀑布流演算法**，徹底避免非同步圖片加載導致的卡片高度塌陷與排版錯置。同時整合了優雅的 Sponsor 廣告卡片，並支援一鍵關閉。

---

### 🚀 使用方式與調詞黃金工作流

```
  ❶ 選擇核心分類 ────> ❷ 啟用頂部場景引導 ────> ❸ 點選精美模板卡片
                                                      │
                                                      ▼
  ❻ 一鍵複製生圖 <──── ❺ 微調變數與展開品質詞 <──── ❹ input焦點即時高亮
```

#### ⚠️ [重要] 網頁 CORS 安全限制排除指引
* **為什麼直接點擊 index.html 會空白？**
  如果您是在本地資料夾中直接雙擊 `index.html`（使用 `file:///` 協議），現代瀏覽器（Chrome, Edge, Safari）基於安全策略，會**封鎖**對本地 JSON 資料檔（`data/` 下的模板與場景）的讀取。
* **解決方案**：
  本專案已在背景自動開通了極速本地 Web 伺服器！請勿直接雙擊檔案，請直接在瀏覽器網址列輸入並前往：
  👉 **[http://localhost:8000](http://localhost:8000)**  
  如果資料載入失敗，網頁中將會自動淡入我們精心設計的 **「CORS 限制與本地伺服器自動跳轉面板」**，點選面板中的黃金按鈕即可一鍵跳轉！

---

### 📖 提示詞大師 — 四大黃金工作流

#### ❶ 極速聚焦搜尋 (`/`)
* **動作**：在主頁面的任何非輸入狀態下，**直接按下鍵盤 of 鍵 `/` 鍵**。
* **效果**：搜尋游標將瞬間自動聚焦定位至 Header 居中的搜尋框。您可以立即打字（如 `寫實`、`3D`、`吉卜力`）來毫秒級過濾 202 個精選模板！

#### ❷ 核心場景引導 (Visual Scene Guide)
* **動作**：在頂部「橫向滾動場景看板」中點選您的生圖目標（如 🍿 `電影`、🎨 `動漫`、🏬 `產品展示`）。
* **效果**：選中的場景會觸發 **Banana Glow 金黃霓虹發光**，下方會以柔和動畫淡出專屬的「建議構圖比例」與「調詞 Tips」。系統會自動過濾最適合該場景的模板。

#### ❸ 提示詞動態編輯與即時變數定位高亮 (IDE-like Editor)
* **動作**：點擊模板卡片彈出詳情 Modal。在右側「🔧 填寫變數」欄位中，點擊任何一個輸入框（例如 `{主體}`）。
* **效果**：左側 Prompt 編輯器內對應的變數代碼將**即時高亮選中**。當您在輸入框打字時，編輯器內會即時更動！點選展開「✨ 品質提升關鍵詞」，點選想要提升的維度標籤，會自動附加在提示詞最尾端。

#### ❹ 圖片風格分析與 Remix (AI Radar Scanning)
* **動作**：點擊 Header 右側的 🔬 按鈕，拖曳或上傳一張您喜歡的參考圖。
* **效果**：面板會啟動**極光霓虹雷達掃描動畫**。1.5 秒後分析完成，自動填入對應的整體風格、構圖、光影與建議關鍵字。點擊 **🎨 生成 Remix 提示詞**，即可一鍵打包複製！

---

### 🎨 經典生圖 Remix 案例展示

#### 案例一：【活動海報】Remix 日系新海誠動漫風
- **使用場景**：🎪 活動海報 (`--aspect 16:9` / 橫幅大圖)
- **選用模板**：日系青春懷舊動漫
- **變數填寫**：
  - `{主體}` -> `a teenage girl riding a bicycle`
  - `{時間}` -> `golden hour dusk`
  - `{背景}` -> `electricity pylons, cumulonimbus clouds, highly detailed street`
- **點選品質字**：`Makoto Shinkai style`, `anime aesthetic`, `breathtaking lighting`, `8k resolution`
- **生成提示詞效果**：
  > `A gorgeous anime scene of a teenage girl riding a bicycle during golden hour dusk, surrounded by electricity pylons, cumulonimbus clouds, highly detailed street. Makoto Shinkai style, anime aesthetic, breathtaking lighting, 8k resolution --ar 16:9`

---

### 🛠️ 技術架構與極速本地部署

本專案採用**純淨、無相依、超輕量**的前端架構，無建置流程，加載速度極快！

- **核心技術**：HTML5, JavaScript (ES6+), Vanilla CSS3 (雙主題系統)。
- **無障礙標準**：嚴格遵循 **WCAG 2.1 Level AA**。
- **本地部署 (只需 1 秒)**：
  1. Clone 本專案至您的本地工作區。
  2. 在專案根目錄下直接執行：
     ```bash
     npx -y serve -p 8000
     # 或者使用 python3 內建伺服器：
     python3 -m http.server 8000
     ```
  3. 在瀏覽器中打開 `http://localhost:8000` 即可即時體驗極致優雅的調詞大師！

---

## 🇺🇸 English Version

### 🎯 Project Purpose & Core Vision

In the creative process of AI image generation, creators often face major pain points such as **\"blank canvas syndrome\" (not knowing what to write)**, **\"tedious variable replacement\"**, and **\"losing focus on the target style and output aspect ratio.\"**

**Nano Banana Prompt Master** was designed with the core vision of **\"eliminating technical noise and focusing purely on creative inspiration\"**:
- **Scenario-Driven Creation**: Say goodbye to unorganized keyword stacking. Directly align with your goals, whether it is an event poster, slide presentation, or commercial illustration.
- **What You See Is What You Get**: Built-in dynamic variable positioning, real-time highlighting, and seamless translation ensure that editing and adding quality controls flow effortlessly.
- **Seamless Style Remix**: Analyze the style of any uploaded image in one click to extract color, lighting, texture, and composition, achieving a professional Remix.

---

### ✨ New V2 Revolutionary Reconstruction

In the V2 version, we performed an epic upgrade to the overall **Information Architecture** and **Visual Aesthetics**:

- **🌓 One-Click Dual Theme Switch**:
  - **Dark Mode**: High-end blue-violet gradient background (`linear-gradient(#07070f, #110f24)`) coupled with delicate yellow neon glows, giving a futuristic sci-fi vibe.
  - **Light Mode**: Fresh and elegant banana yellow and cream white (`#fbfaf5`) color palette, highly legible and extremely comfortable for daytime reading.
- **🗂️ Mini Sidebar Desktop Collapse**: The left sidebar is highly streamlined. Desktop users can click `☰` to collapse it into a **Mini Sidebar (72px)**, preserving only icons and releasing up to 90% of the visible screen area! The collapsed state is remembered persistently via `localStorage`.
- **🎯 Horizontal Visual Scene Guide**: Scene categories are liberated from dropdown menus to the top of the homepage as horizontal capsules. Activating a scene triggers a gorgeous **Banana Glow neon highlight** and gently fades in ratio suggestions and prompt tips.
- **🎛️ Horizontal Segmented Toolbar**: Integrates difficulty selection into beautiful **Segmented Tabs** and introduces a YouTube-style **horizontal tags scrollbar**, drastically reducing visual cognitive load.
- **📝 Quality Keywords Accordion Drawer**: Hides the space-consuming quality tag groups within Accordion drawers. Collapsed by default to optimize Modal height, keeping variables and the prompt editor within prime viewing range.
- **🔬 AI Image Radar Scanner**: Uploading an image triggers a beautiful neon scanning line animation, mimicking the process of AI analyzing color, lighting, and detail parameters to add a strong sense of ceremony to the UX.
- **⚡ 360° Bidirectional Sync & Variable Highlighting**: In the Modal, focusing on any variable input **instantly highlights** the corresponding code block in blue. Editing in the input replaces text in the editor in real-time, and manually modifying the prompt below **immediately updates** the corresponding input above for an IDE-like workflow.
- **🪙 Point Center & Premium Prompt Unlock**: Introduces a brand new points reward system. Premium and Featured Pro templates are locked. Users can earn points for free via daily check-in or sharing their exclusive referral code. Spending 10 points permanently unlocks any premium prompt!
- **🧱 Responsive Masonry Column Layout & Ad Insertion**: Rebuilds the gallery layout with a **column-balancing Masonry algorithm** to fully prevent card collapse and layout misalignment caused by asynchronous image loading. Elegant Sponsor cards are beautifully interleaved and support one-click dismissal.

---

### 🚀 Getting Started & Golden Workflow

```
  ❶ Select Category ────> ❷ Enable Top Scene Guide ────> ❸ Click Beautiful Prompt Card
                                                            │
                                                            ▼
  ❻ One-Click Copy <──── ❺ Tweak Variables & Quality Tags <──── ❹ Instant Highlight on Focus
```

#### ⚠️ [Crucial] Local CORS Policy Bypass Guide
* **Why is the page empty when I double-click index.html directly?**
  If you double-click `index.html` directly from a local folder (using the `file:///` protocol), modern browsers will **block** the loading of local JSON data files under `data/` due to strict CORS security policies.
* **The Solution**:
  This project has built-in local web server support! Please do not double-click the file; instead, open your browser and navigate to:
  👉 **[http://localhost:8000](http://localhost:8000)**  
  If loading fails, the page will automatically fade in a premium **\"CORS Bypass Panel\"**. Click the golden button to jump to the local server instantly!

---

### 📖 Prompt Master — The 4 Golden Workflows

#### ❶ Lightning-Fast Search Focus (`/`)
* **Action**: Press the `/` key when you are on the homepage and not inside any input field.
* **Effect**: The search cursor instantly focuses on the search input in the header. You can type immediately (e.g., `realism`, `3D`, `Ghibli`) to filter through 202+ templates in milliseconds!

#### ❷ Visual Scene Guide
* **Action**: Click a scene card (e.g., 🍿 `Movie`, 🎨 `Anime`, 🏬 `Product`) on the top horizontal bar.
* **Effect**: The active scene triggers a **Banana Glow gold neon glow**, displaying aspect ratios and prompt tips. It filters matching templates and appends scene modifiers to your prompt.

#### ❸ IDE-Like Variable Highlighting & Live Editing
* **Action**: Click a template card to open the Detail Modal. Click any input field under \"🔧 Fill Variables\" (e.g., `{Subject}`).
* **Effect**: The corresponding variable in the editor **instantly highlights** in blue. Typing dynamically updates the editor. Expand \"✨ Quality Keywords\" to append custom style tags to the prompt.

#### ❹ AI Radar Scanning & Remix
* **Action**: Click the 🔬 button in the header, drag and drop or upload your favorite reference image.
* **Effect**: The panel plays a gorgeous **neon radar scanning animation**. After 1.5 seconds, it extracts style, lighting, composition, and keywords. Click **🎨 Generate Remix Prompt** to copy all parameters in one go!

---

### 🎨 Classic Image Generation Remix Examples

#### Example 1: [Event Poster] Remix Japanese Makoto Shinkai Style
- **Target Scene**: 🎪 Event Poster (`--aspect 16:9` / Widescreen Banner)
- **Template**: Japanese Nostalgic Youth Anime
- **Variables**:
  - `{Subject}` -> `a teenage girl riding a bicycle`
  - `{Time}` -> `golden hour dusk`
  - `{Background}` -> `electricity pylons, cumulonimbus clouds, highly detailed street`
- **Quality Tags**: `Makoto Shinkai style`, `anime aesthetic`, `breathtaking lighting`, `8k resolution`
- **Output Prompt**:
  > `A gorgeous anime scene of a teenage girl riding a bicycle during golden hour dusk, surrounded by electricity pylons, cumulonimbus clouds, highly detailed street. Makoto Shinkai style, anime aesthetic, breathtaking lighting, 8k resolution --ar 16:9`

---

### 🛠️ Tech Stack & Instant Local Deployment

This project utilizes a **pure, zero-dependency, ultra-lightweight** frontend architecture. No build processes required, lightning-fast loads!

- **Core Technologies**: HTML5, JavaScript (ES6+), Vanilla CSS3 (Dual-Theme system).
- **Accessibility Standards**: Strictly complies with **WCAG 2.1 Level AA**.
- **Local Deployment (Takes only 1 second)**:
  1. Clone this repository to your local workspace.
  2. Run the following command in the root directory:
     ```bash
     npx -y serve -p 8000
     # Or use Python's built-in server:
     python3 -m http.server 8000
     ```
  3. Open `http://localhost:8000` in your browser to experience Prompt Master!

---

## 🙏 致謝與參考來源 (Credits & Inspiration)

本專案中內建的精選提示詞模板、經典生圖案例與 Pro 級高階提示詞最初受以下 GitHub 社群著名開源項目的啟發與數據基礎而建立：

1. **[awesome-gpt4o-images](https://github.com/jamez-bondos/awesome-gpt4o-images)**：收集全球 AI 社群創作者無私分享的經典 GPT-4o 多模態生圖案例。
2. **[awesome-nano-banana-pro-prompts](https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts)**：YouMind 官方提供的 Google Nano Banana Pro 提示詞頂規數據庫與 Raycast 變數語法標準。本專案已 100% 收錄其全部精選 Featured 藝術與商業級 Prompts！
3. **[awesome-nanobanana-pro](https://github.com/ZeroLu/awesome-nanobanana-pro)**：由 ZeroLu 維護的高難度/高寫實/高逼真度 Google Nano Banana Pro 精選提示詞與結構化 JSON 生圖模組。本專案已 100% 深度整合並中英對照編譯其 19 大最具創意之 Featured 頂規提示詞，並精細適配我們的「雙向無損上下文提取同步系統」！
4. **[gpt4o-image-prompts](https://github.com/songguoxs/gpt4o-image-prompts)**：由松果先森維護的熱門 AI 生圖提示詞與網頁畫廊。本專案精選並 100% 深度整合了其 12 大 Featured 頂規創意提示詞（包括 3D 手機跨屏旅行廣告、博物館標本級昆蟲與魚類科普圖譜、K-Pop 報紙摺紙時裝 JSON 等），並完美大括號化以全面相容我們的雙向聯動高亮技術！

在此，我們向以上開源項目的維護者，以及所有在 AI 社群（Twitter/X, GitHub, Reddit 等）中無私分享創意生圖案例與提示詞技巧的貢獻者，表示最真摯的感謝與敬意！沒有全球開源社群的靈感碰撞，就沒有 Nano Banana 的誕生。
