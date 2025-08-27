export type LeisureQueryResult = {
  id: number;
  category: string;
  business_name: string;
  business_photo: string;
  address: string;
  visitor_review_count: number;
  blog_review_count: number;
};

export type ArchiveGetPayloadType = {
  user_id: string;
  page: number;
};
