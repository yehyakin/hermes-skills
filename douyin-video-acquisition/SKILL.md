---
name: douyin-video-acquisition
description: 从抖音分享链接获取视频文件，绕过登录限制。支持短链接解析、获取视频信息（标题/话题/时长）和下载链接。
triggers:
  - 抖音视频获取
  - 抖音链接解析
  - 抖音视频下载
  - douyin video
  - 抖音链接
category: media
version: 1.0.0
tags: [抖音, 视频获取, 下载, 爬取]
---

# 抖音视频获取

## 核心方案

使用 `CharlesPikachu/videodl` 的 `DouyinVideoClient`，在 Python 3.11 venv 下运行。

## 前置条件

videodl 已持久化在 `~/.hermes/scripts/videodl`，无需额外安装。

Python 3.11 venv 路径：`/Users/yehya/.hermes-guardian/venv/bin/python3`

## 获取视频信息

```bash
/Users/yehya/.hermes-guardian/venv/bin/python3 ~/.hermes/scripts/douyin_get.py "https://v.douyin.com/xxxxx"
```

输出示例：
```
✅ 标题: 「Spima.铂金」120 支高支棉...
👤 作者: 秦磊男装旗舰店
⏱️  时长: 64.2秒
🏷️  话题: 秦磊, 秦磊男装, 男士搭配
🎬 视频ID: 7634125020805057801

📥 下载链接:
http://www.iesdouyin.com/aweme/v1/play/?video_id=xxx&ratio=1080p&line=0
```

## JSON 格式输出

```bash
/Users/yehya/.hermes-guardian/venv/bin/python3 ~/.hermes/scripts/douyin_get.py "URL" --json
```

返回字段：`title`, `author`, `duration_ms`, `cover_url`, `download_url`, `ext`, `aweme_id`, `hashtags`

## 内部数据结构（经验值）

```python
# 重要：raw_data 的路径是 loaderData['video_(id)/page']['videoInfoRes']
# 不是 loaderData['videoInfoRes']！踩坑发现的
info = results[0]
raw = info.raw_data
ld = raw.get('loaderData', {})
vid_page = ld.get('video_(id)/page', {})         # ← 特殊键名，含斜杠
vip = vid_page.get('videoInfoRes', {})
item = vip.get('item_list', [{}])[0]
# item 包含: desc, author.nickname, video.duration, aweme_id, text_extra(话题)
```

## 完整获取脚本

`~/.hermes/scripts/douyin_get.py` — 已封装好上述路径解析，直接调用：
```bash
# 文本输出
/Users/yehya/.hermes-guardian/venv/bin/python3 ~/.hermes/scripts/douyin_get.py "URL"

# JSON输出（程序调用）
/Users/yehya/.hermes-guardian/venv/bin/python3 ~/.hermes/scripts/douyin_get.py "URL" --json
```

## 下载视频

```bash
# Step 1: 获取 download_url（iesdouyin.com 格式）
URL=$(/Users/yehya/.hermes-guardian/venv/bin/python3 ~/.hermes/scripts/douyin_get.py "URL" --json 2>/dev/null | \
  /Users/yehya/.hermes-guardian/venv/bin/python3 -c "import sys,json; print(json.load(sys.stdin)['download_url'])")

# Step 2: yt-dlp 下载（加了 User-Agent 和 Referer 才能拿真实CDN链接）
yt-dlp -o "%(title)s.%(ext)s" "$URL" \
  --add-header "User-Agent:Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15" \
  --add-header "Referer:https://www.douyin.com/"
```

## yt-dlp 下载注意

**❌ 错误写法：** `-H "User-Agent:..."`（会报 no such option）
**✅ 正确写法：** `--add-header "User-Agent:..."`（需要用 --add-header，不能用 -H）

## 账号主页批量拉取：CDP Cookie 提取法 ✅

**核心发现（20260429）：通过 Chrome DevTools Protocol（CDP）可以提取任意域名的完整 cookies，包括 httpOnly 的 `ttwid`、`odin_tt` 等 JS 无法读取的 cookie。**

### Step 1: 启动带 Debug 端口的 Chrome

```bash
pkill -9 "Google Chrome" && sleep 2
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/chrome-debug &
sleep 5
```

### Step 2: 手动登录抖音

用这个 Chrome 打开 https://www.douyin.com 并登录。

### Step 3: 获取 Tab ID

Chrome 调试端口在 `http://127.0.0.1:9222/json/list`，拿 `id` 字段。

### Step 4: 用 CDP 提取 Cookies

CDP WebSocket 路径：`ws://127.0.0.1:9222/devtools/page/<tab_id>`

完整脚本已保存至 `/tmp/extract_cookies.py`，核心流程：

1. **WebSocket 握手**：发送 HTTP Upgrade 请求
2. **发送 `Network.enable` + `Page.enable`**
3. **发送 `Page.navigate`** 到目标 URL
4. **等待页面加载完成后发送 `Network.getAllCookies`**
5. **解析响应**，提取 cookies，按 Netscape 格式写入文件

**关键修复（踩坑）：**
- CDP 返回的 `expires = -1`（session cookie）→ yt-dlp 要求改为 `expires = 0`
- 空名 cookie 导致 Netscape 解析报错 → 跳过 `name == ""` 的条目
- Cookie value 中含 `\t` → 替换为空格

### Step 5: 验证 Cookie

```bash
yt-dlp --cookies /tmp/douyin_cookies.txt --skip-download \
  "https://www.douyin.com/user/目标sec_user_id" --playlist-end 3
```

### 已知限制（20260429 更新）

- **视频列表 API**：`/aweme/v1/web/aweme/post/` 需要 `X-Bogus` 签名，有 cookie 但不带签名仍被拦截
- **Video Download API**：`/aweme/v1/play/` 同样需要 `X-Bogus` 签名
- **账号主页作品区**：直接访问账号主页（如 `douyin.com/user/{sec_user_id}`）的视频列表区会显示**"服务异常，重新刷新拉取数据"**——这是 Douyin 的反爬升级，账号视频列表无法通过浏览器自动化获取
- **浏览器搜索页**：访问 `douyin.com/search?type=video` 会触发**验证码中间页**，无法自动化搜索
- **CDP 远程连接**：通过 `ws://127.0.0.1:9222` 连接 CDP 会报 403，需要 Chrome 启动时加 `--remote-allow-origins=*`

### 方案总结

| 需求 | 方法 |
|------|------|
| 单条视频下载 | `videodl/douyin_get.py` ✅ |
| 账号信息（粉丝等） | CDP cookie + `/web/api/v2/user/info/` API ✅ |
| 账号视频列表（批量50+） | ❌ 无法自动化，需人工提供视频链接 |
| 批量下载账号视频 | 需人工提供视频链接 + `douyin_get.py` 逐个分析 |

### 账号视频列表获取的正确姿势（需人工）

由于 Douyin 反爬，无法自动获取账号视频列表。正确方法是：

1. **手机抖音 App**：打开目标账号主页 → 作品 → 点右上角筛选 → 选"最近" → 截图或分享链接发来
2. **或者**：在飞书/微信群里有分享过视频链接，直接把链接发过来
3. `douyin_get.py` 支持批量传入链接分析，有链接就能跑

### CDP Cookie 提取的正确姿势（20260429 更新）

❌ **之前错误**：直接 WebSocket 连接 `http://127.0.0.1:9222/devtools/page/<id>` 报 403

✅ **正确步骤**：
```bash
# Step 1: 启动 Chrome 时必须加这个参数
pkill -9 "Google Chrome" && sleep 2
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --remote-allow-origins=* \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/chrome-debug &
sleep 5

# Step 2: 手动登录抖音

# Step 3: 用 Python websocket 库连接（不能用 curl）
# 参考 /tmp/extract_cookies.py，但需要加上 Origin header
```

## 已验证不可用的方案（持续更新）

| 方案 | 原因 |
|------|------|
| TikTokDownloader (JoeanAmier) | 源码有 Python 3.9 语法错误 |
| Johnserf-Seed/f2 | 要求 Python 3.10+，系统是 3.9 |
| yt-dlp --cookies-from-browser | 提取 Chrome cookie 超时（>20秒）|
| yt-dlp + douyin.com/user/ | 不支持账号主页URL |
| iesdouyin.com 移动API（/web/api/v2/aweme/post/） | 返回空内容，需登录态 |
| iesdouyin.com 移动API（/web/api/v2/user/info/） | ✅ 可用，返回账号信息，但拿不到视频列表 |
| **CDP 提取 Chrome cookie（默认配置）** | WebSocket 连接报 403 Forbidden |
| **浏览器访问账号主页作品区** | 显示"服务异常"（反爬升级，20260429）|
| **浏览器搜索页** | 触发验证码中间页（20260429）|
| **CDP cookie + X-Bogus** | X-Bogus 生成逻辑在混淆 JS bundle 中，无法提取 |

## 新发现（20260429）

### 账号主页"服务异常"问题
账号主页 `douyin.com/user/{sec_user_id}` 顶部信息（粉丝数、获赞等）正常加载，但下方**作品视频列表区**显示"服务异常，重新刷新拉取数据"。这是 Douyin 的**反爬升级**：
- 账号基础信息走公开 API → 正常
- 视频列表走需要登录态的 API → 被拦截

### 8字短 ID 提取
即使在"服务异常"状态下，页面底部热门推荐里仍能找到一些视频链接（如 `video/7633989679712357641` 等）。这些是推荐视频，**不是账号视频**，但可作为单视频分析的数据源。

### douyin_get.py 验证结果
已验证可提取字段：`title`, `author`, `duration_ms`, `cover_url`, `aweme_id`，无需 cookie。

## 脚本位置

`~/.hermes/scripts/douyin_get.py`
