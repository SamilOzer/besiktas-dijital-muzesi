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

let contributions: Contribution[] = [];

export function getContributions(): Contribution[] {
  return [...contributions];
}

export function addContribution(c: Omit<Contribution, 'id' | 'status' | 'submittedAt'>): Contribution {
  const newC: Contribution = {
    ...c,
    id: Date.now().toString(),
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  contributions.push(newC);
  return newC;
}

export function updateContributionStatus(id: string, status: 'approved' | 'rejected'): Contribution | null {
  const c = contributions.find(x => x.id === id);
  if (c) c.status = status;
  return c ?? null;
}

export function deleteContribution(id: string): void {
  contributions = contributions.filter(x => x.id !== id);
}
