import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CardForm from "../components/CardForm";
import { makeRequest } from "../api";

interface Card {
  id: number;
  name: string;
  email: string;
  birthday: string;
  avatar: string | null;
  profession: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCards();
    // eslint-disable-next-line
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await makeRequest<Card[]>("/cards", "get", undefined, token!);
      setCards(res);
    } catch {
      toast.error("取得卡片失敗，請重新登入");
      navigate("/login");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("確定要刪除這張卡片嗎？")) return;
    try {
      await makeRequest(`/cards/${id}`, "delete", undefined, token!);
      toast.success("刪除成功");
      fetchCards();
    } catch {
      toast.error("刪除失敗");
    }
  };

  const handleEdit = (card: Card) => {
    setEditCard(card);
    setShowForm(true);
  };

  const handlePreview = (id: number) => {
    navigate(`/card/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">我的電子卡片</h2>
        <button
          onClick={handleLogout}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          登出
        </button>
      </div>
      <button
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => {
          setEditCard(null);
          setShowForm(true);
        }}
      >
        新增卡片
      </button>
      {showForm && (
        <CardForm
          token={token!}
          onSuccess={() => {
            setShowForm(false);
            fetchCards();
          }}
          onCancel={() => setShowForm(false)}
          editCard={editCard}
        />
      )}
      {loading ? (
        <div>載入中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-white p-4 rounded shadow relative">
              {card.avatar && (
                <img
                  src={`http://localhost:5001${card.avatar}`}
                  alt="avatar"
                  className="w-16 h-16 rounded-full mb-2"
                />
              )}
              <div className="font-bold">{card.name}</div>
              <div>{card.email}</div>
              <div>{card.birthday}</div>
              <div>{card.profession}</div>
              <div className="text-xs text-gray-400">
                建立：{card.created_at}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => handleEdit(card)}
                >
                  編輯
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(card.id)}
                >
                  刪除
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                  onClick={() => handlePreview(card.id)}
                >
                  預覽
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
