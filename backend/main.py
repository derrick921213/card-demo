import pymysql
pymysql.install_as_MySQLdb()
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymysql import MySQL
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import timedelta

# 設定
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}},
     supports_credentials=True, allow_headers="*")
pymysql_connect_kwargs = {
    'user': 'root',
    'password': '123456789',
    'host': 'db',
    'database': 'niu_code',
}
app.config['pymysql_kwargs'] = pymysql_connect_kwargs
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['UPLOAD_FOLDER'] = os.path.join(
    os.path.dirname(__file__), 'static', 'avatars')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

mysql = MySQL(app)
jwt = JWTManager(app)

# 工具函式


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def row_to_card_dict(row):
    keys = ['id', 'name', 'email', 'birthday', 'avatar', 'profession',
            'created_at', 'updated_at', 'fb_link', 'line_link']
    d = dict(zip(keys, row))
    if d['birthday'] and hasattr(d['birthday'], 'strftime'):
        d['birthday'] = d['birthday'].strftime('%Y-%m-%d')
    elif d['birthday']:
        d['birthday'] = str(d['birthday'])[:10]
    return d


def get_user_by_username(username):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    cur.close()
    return user


def get_user_by_id(user_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()
    cur.close()
    return user

# 註冊


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    if not username or not password or not email:
        return jsonify({'msg': '缺少必要欄位'}), 400
    if get_user_by_username(username):
        return jsonify({'msg': '用戶名已存在'}), 409
    password_hash = generate_password_hash(password)
    cur = mysql.connection.cursor()
    try:
        cur.execute("INSERT INTO users (username, password_hash, email) VALUES (%s, %s, %s)",
                    (username, password_hash, email))
        mysql.connection.commit()
    except Exception as e:
        cur.close()
        return jsonify({'msg': 'Email 已存在'}), 409
    cur.close()
    return jsonify({'msg': '註冊成功'}), 201

# 登入


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = get_user_by_username(username)
    if not user or not check_password_hash(user[2], password):
        return jsonify({'msg': '帳號或密碼錯誤'}), 401
    access_token = create_access_token(identity=str(user[0]))
    return jsonify({'access_token': access_token, 'username': user[1]}), 200

# 取得自己的卡片列表


@app.route('/api/cards', methods=['GET'])
@jwt_required()
def get_cards():
    user_id = get_jwt_identity()
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, name, email, birthday, avatar, profession, created_at, updated_at, fb_link, line_link FROM cards WHERE user_id=%s", (user_id,))
    cards = [row_to_card_dict(row) for row in cur.fetchall()]
    cur.close()
    return jsonify(cards)

# 新增卡片


@app.route('/api/cards', methods=['POST'])
@jwt_required()
def create_card():
    user_id = get_jwt_identity()
    data = request.form
    name = data.get('name')
    email = data.get('email')
    birthday = data.get('birthday')
    profession = data.get('profession')
    fb_link = data.get('fb_link')
    line_link = data.get('line_link')

    avatar = None
    if birthday:
        birthday = str(birthday)[:10]
    # 處理頭像
    if 'avatar' in request.files and allowed_file(request.files['avatar'].filename):
        file = request.files['avatar']
        filename = secure_filename(file.filename)
        avatar_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(avatar_path)
        avatar = f'/static/avatars/{filename}'
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO cards (user_id, name, email, birthday, avatar, profession, fb_link, line_link) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (user_id, name, email, birthday, avatar, profession, fb_link, line_link))
    mysql.connection.commit()
    cur.close()
    return jsonify({'msg': '卡片新增成功'})

# 修改卡片


@app.route('/api/cards/<int:card_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_card(card_id):
    if request.method == 'OPTIONS':
        return '', 204
    user_id = get_jwt_identity()
    data = request.form
    name = data.get('name')
    email = data.get('email')
    birthday = data.get('birthday')
    profession = data.get('profession')
    fb_link = data.get('fb_link')
    line_link = data.get('line_link')
    avatar = None
    if birthday:
        birthday = str(birthday)[:10]
    # 處理頭像
    if 'avatar' in request.files and allowed_file(request.files['avatar'].filename):
        file = request.files['avatar']
        filename = secure_filename(file.filename)
        avatar_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(avatar_path)
        avatar = f'/static/avatars/{filename}'
    cur = mysql.connection.cursor()
    # 先查詢原本的 avatar
    cur.execute(
        "SELECT avatar FROM cards WHERE id=%s AND user_id=%s", (card_id, user_id))
    old = cur.fetchone()
    if not old:
        cur.close()
        return jsonify({'msg': '卡片不存在'}), 404
    if not avatar:
        avatar = old[0]
    cur.execute("UPDATE cards SET name=%s, email=%s, birthday=%s, avatar=%s, profession=%s, fb_link=%s, line_link=%s WHERE id=%s AND user_id=%s",
                (name, email, birthday, avatar, profession, fb_link, line_link, card_id, user_id))
    mysql.connection.commit()
    cur.close()
    return jsonify({'msg': '卡片更新成功'})

# 刪除卡片


@app.route('/api/cards/<int:card_id>', methods=['DELETE'])
@jwt_required()
def delete_card(card_id):
    user_id = get_jwt_identity()
    cur = mysql.connection.cursor()
    # 先查詢 avatar 路徑
    cur.execute(
        "SELECT avatar FROM cards WHERE id=%s AND user_id=%s", (card_id, user_id))
    row = cur.fetchone()
    if row and row[0]:
        avatar_path = row[0]
        # 只刪除本地 static/avatars 內的檔案
        if avatar_path.startswith('/static/avatars/'):
            file_path = os.path.join(app.root_path, avatar_path[1:])  # 去掉前面的斜線
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"刪除圖片失敗: {e}")
    # 刪除資料庫資料
    cur.execute("DELETE FROM cards WHERE id=%s AND user_id=%s",
                (card_id, user_id))
    mysql.connection.commit()
    cur.close()
    return jsonify({'msg': '卡片已刪除'})

# 公開取得單一卡片資訊


@app.route('/api/cards/<int:card_id>', methods=['GET'])
def get_card_public(card_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, name, email, birthday, avatar, profession, created_at, updated_at, fb_link, line_link FROM cards WHERE id=%s", (card_id,))
    row = cur.fetchone()
    cur.close()
    if not row:
        return jsonify({'msg': '卡片不存在'}), 404
    return jsonify(row_to_card_dict(row))

# 取得頭像靜態檔案


@app.route('/static/avatars/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
