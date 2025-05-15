# Card Demo 專案

前後端分離的電子名片管理系統，支援用戶註冊、登入、JWT 驗證、卡片 CRUD 與頭像上傳。

---

## 技術棧

- **前端**：React 19、Vite、TypeScript、TailwindCSS、React Router、Axios、React Toastify
- **後端**：Python 3.12+、Flask 3、Flask-MySQLdb、Flask-JWT-Extended、Flask-CORS、Werkzeug
- **資料庫**：MySQL 8+
- **後端 Python 套件管理**：使用 uv
- uv 相專指令:
  - uv add [套件名稱]
  - uv remove [套件名稱]

---

## 註記
- `flask-pymysql` 使用外部修正包,添加指令如下
```shell
uv add "flask-pymysql @ git+https://github.com/derrick921213/flask-pymysql"
```

## 環境安裝與啟動

### 1. 資料庫

1. 安裝 MySQL，啟動服務。
2. 將 card_demo.sql 匯入，預設資料庫名稱為 `niu_code`，可依需求修改。

---

### 2. 後端（使用 uv）

1. 進入 `backend` 目錄，安裝 [uv](https://docs.astral.sh/uv/guides/install-python/)（如未安裝）：
   ```bash
   curl -Ls https://astral.sh/uv/install.sh | sh
   ```
2. 安裝 Python 依賴：
   ```bash
   uv pip install -r pyproject.toml
   ```
   或
   ```bash
   uv pip install .
   ```
   > uv 會自動根據 `pyproject.toml` 與 `uv.lock` 安裝所有依賴，速度比 pip 更快。
3. 設定 MySQL 連線資訊（可在 `main.py` 修改）：
   - `MYSQL_HOST`、`MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DB`
4. 啟動 Flask 伺服器：
   ```bash
   uv run main.py
   ```
   預設會在 `http://127.0.0.1:500` 提供 API。

---

### 3. 前端

1. 進入 `frontend` 目錄，安裝依賴：
   ```bash
   yarn install
   ```
2. 啟動開發伺服器：
   ```bash
   yarn dev
   ```
   預設會在 `http://localhost:5173` 提供前端頁面。
