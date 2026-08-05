export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  status: "unread" | "read";
}

let messages: ContactMessage[] = [
  {
    id: "msg-1",
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    message: "Barbaros Hayreddin Paşa Anıtı ile ilgili elimde 1950'lerden kalma yüksek çözünürlüklü fotoğraflar var. Arşivinize katkıda bulunmak isterim.",
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "unread",
  },
  {
    id: "msg-2",
    name: "Elif Arslan",
    email: "elif.arslan@example.com",
    message: "Dolmabahçe Sarayı ve Ihlamur Kasrı hakkında okullar için düzenlenen dijital rehberli tur programı var mı?",
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "read",
  },
];

export function getContactMessages(): ContactMessage[] {
  return [...messages];
}

export function addContactMessage(msg: Omit<ContactMessage, "id" | "submittedAt" | "status">): ContactMessage {
  const newMsg: ContactMessage = {
    ...msg,
    id: `msg-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: "unread",
  };
  messages.unshift(newMsg);
  return newMsg;
}

export function updateMessageStatus(id: string, status: "unread" | "read"): void {
  const m = messages.find((x) => x.id === id);
  if (m) m.status = status;
}

export function deleteContactMessage(id: string): void {
  messages = messages.filter((x) => x.id !== id);
}
