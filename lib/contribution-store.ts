export interface Contribution {
  id: string;
  type: 'harita' | 'ansiklopedi';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submitterName: string;
  submitterEmail: string;
  // Harita fields
  title?: string;
  category?: string;
  timePeriod?: string;
  neighborhood?: string;
  address?: string;
  summary?: string;
  description?: string;
  coordinates?: [number, number];
  imageUrls?: string[];
  // Ansiklopedi fields
  eventTitle?: string;
  eventDate?: string;
  era?: string;
  eventCategory?: string;
  eventSummary?: string;
  eventDescription?: string;
  eventLocation?: string;
  tags?: string[];
}

const CONTRIBUTIONS_KEY = "besiktas_contributions";

const initialSeedContributions: Contribution[] = [
  {
    id: "contrib-1",
    type: "harita",
    status: "pending",
    submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    submitterName: "Mehmet Demir",
    submitterEmail: "mehmet.demir@example.com",
    title: "Akaretler Sıraevler Tarihi Çeşmesi",
    category: "tarihi",
    neighborhood: "Vişnezade",
    timePeriod: "osmanli",
    address: "Akaretler Cad. No:12",
    summary: "19. Yüzyıl Osmanlı dönemine ait tarihi sokak çeşmesi.",
    description: "Sıraevler kompleksinin inşası sırasında mahalle halkı ve saray çalışanlarının kullanımı için inşa edilen taş işçilikli Osmanlı çeşmesi.",
    coordinates: [41.0415, 29.0012],
    imageUrls: []
  }
];

const loadContributions = (): Contribution[] => {
  if (typeof window === "undefined") return [...initialSeedContributions];
  try {
    const data = localStorage.getItem(CONTRIBUTIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(initialSeedContributions));
  } catch (e) {
    console.error("Error loading contributions from localStorage:", e);
  }
  return [...initialSeedContributions];
};

const saveContributions = (list: Contribution[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Error saving contributions to localStorage:", e);
  }
};

let contributions: Contribution[] = loadContributions();

export function getContributions(): Contribution[] {
  contributions = loadContributions();
  return [...contributions];
}

export function addContribution(c: Omit<Contribution, 'id' | 'status' | 'submittedAt'>): Contribution {
  const current = loadContributions();
  const newC: Contribution = {
    ...c,
    id: `contrib-${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  const updated = [newC, ...current];
  saveContributions(updated);
  contributions = updated;
  return newC;
}

export function updateContributionStatus(id: string, status: 'approved' | 'rejected'): Contribution | null {
  const current = loadContributions();
  const c = current.find(x => x.id === id);
  if (c) {
    c.status = status;
    saveContributions(current);
    contributions = current;
    return c;
  }
  return null;
}

export function deleteContribution(id: string): void {
  const current = loadContributions();
  const filtered = current.filter(x => x.id !== id);
  saveContributions(filtered);
  contributions = filtered;
}
