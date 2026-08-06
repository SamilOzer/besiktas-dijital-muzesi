export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  status: "unread" | "read";
}

const MESSAGES_KEY = "besiktas_contact_messages";

const initialSeedMessages: ContactMessage[] = [
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

const loadMessages = (): ContactMessage[] => {
  if (typeof window === "undefined") return [...initialSeedMessages];
  try {
    const data = localStorage.getItem(MESSAGES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialSeedMessages));
  } catch (e) {
    console.error("Error loading messages from localStorage:", e);
  }
  return [...initialSeedMessages];
};

const saveMessages = (list: ContactMessage[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Error saving messages to localStorage:", e);
  }
};

let messages: ContactMessage[] = loadMessages();

export function getContactMessages(): ContactMessage[] {
  messages = loadMessages();
  return [...messages];
}

export function addContactMessage(msg: Omit<ContactMessage, "id" | "submittedAt" | "status">): ContactMessage {
  const current = loadMessages();
  const newMsg: ContactMessage = {
    ...msg,
    id: `msg-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: "unread",
  };
  const updated = [newMsg, ...current];
  saveMessages(updated);
  messages = updated;
  return newMsg;
}

export function updateMessageStatus(id: string, status: "unread" | "read"): void {
  const current = loadMessages();
  const m = current.find((x) => x.id === id);
  if (m) {
    m.status = status;
    saveMessages(current);
    messages = current;
  }
}

export function deleteContactMessage(id: string): void {
  const current = loadMessages();
  const filtered = current.filter((x) => x.id !== id);
  saveMessages(filtered);
  messages = filtered;
}
