export type Anime = {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    jpg:  { image_url: string; large_image_url: string };
    webp?: { image_url: string; large_image_url: string };
  };
  synopsis?: string;
  score?: number;
  scored_by?: number;
  episodes?: number;
  status?: string;
  type?: string;
  year?: number;
  season?: string;
  genres?: { mal_id: number; name: string }[];
  studios?: { mal_id: number; name: string }[];
  trailer?: { youtube_id?: string; url?: string };
  duration?: string;
  rating?: string;
  rank?: number;
  popularity?: number;
  members?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
  };
};
