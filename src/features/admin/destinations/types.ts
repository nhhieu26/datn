export type DestinationListItem = {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  provinceName: string;
  address: string;
  category: string;
  ticketPrice: number | null;
  isPublished: boolean;
  createdAt: string;
};

export type DestinationsSummary = {
  total: number;
  published: number;
  draft: number;
};
