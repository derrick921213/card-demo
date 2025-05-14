import React, { useState } from "react";
import { toast } from "react-toastify";
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

interface CardFormProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
  editCard: Card | null;
}

export default function CardForm({
  token,
  onSuccess,
  onCancel,
  editCard,
}: CardFormProps) {
  const [name, setName] = useState(editCard?.name || "");
  const [email, setEmail] = useState(editCard?.email || "");
  const [birthday, setBirthday] = useState(editCard?.birthday || "");
  const [profession, setProfession] = useState(editCard?.profession || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("birthday", birthday);
    formData.append("profession", profession);
    if (avatar) formData.append("avatar", avatar);
    try {
      if (editCard) {
        await makeRequest(`/cards/${editCard.id}`, "put", formData, token, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("更新成功");
      } else {
        await makeRequest("/cards", "post", formData, token, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("新增成功");
      }
      onSuccess();
    } catch {
      toast.error("儲存失敗");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow mb-4 flex flex-col gap-2"
    >
      <input
        className="p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="姓名"
        required
      />
      <input
        className="p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        className="p-2 border rounded"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        placeholder="生日 (YYYY-MM-DD)"
        required
      />
      <input
        className="p-2 border rounded"
        value={profession}
        onChange={(e) => setProfession(e.target.value)}
        placeholder="專業"
        required
      />
      <input
        className="p-2 border rounded"
        type="file"
        accept="image/*"
        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {editCard ? "更新" : "新增"}
        </button>
        <button
          type="button"
          className="bg-gray-300 px-4 py-2 rounded"
          onClick={onCancel}
        >
          取消
        </button>
      </div>
    </form>
  );
}
