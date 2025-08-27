export type DefaultHomeBannerAndMagazineType = {
  img_source: string;
  link: string | null;
  expired_at: string;
  visible: boolean;
};

export type MagazineType = DefaultHomeBannerAndMagazineType & {
  img_vertical: string;
};
