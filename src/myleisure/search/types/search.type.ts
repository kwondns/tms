export type SearchType = MapSearchType & {
  page: number;
  order?: string;
};

export type MapSearchType = {
  search?: string;
  category?: string;
  address?: string;
};
