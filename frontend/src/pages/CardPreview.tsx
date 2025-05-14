import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

export default function CardPreview() {
  const { id } = useParams();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await makeRequest<Card>(`/cards/${id}`);
        setCard(res);
      } catch {
        setCard(null);
      }
      setLoading(false);
    };
    fetchCard();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        載入中...
      </div>
    );
  if (!card)
    return (
      <div className="flex items-center justify-center min-h-screen">
        找不到卡片
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 flex flex-col items-center">
        {card.avatar && (
          <img
            src={`http://localhost:5001${card.avatar}`}
            alt="avatar"
            className="w-24 h-24 rounded-full mb-4"
          />
        )}
        <div className="text-2xl font-bold mb-2">{card.name}</div>
        <div className="mb-1">Email: {card.email}</div>
        <div className="mb-1">生日: {card.birthday}</div>
        <div className="mb-1">專業: {card.profession}</div>
        <div className="text-xs text-gray-400 mt-2">
          建立：{card.created_at}
        </div>
      </div>
    </div>
  );
}
