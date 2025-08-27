export type CredentialType = {
  mail_address: string;
  password: string;
};

export type AgreementType = {
  myLeisureAgreed: boolean;
  personalInfoAgreed: boolean;
  marketingAgreed: boolean;
  kakaoMarketingAgreed: boolean;
  emailMarketingAgreed: boolean;
  pushMarketingAgreed: boolean;
};
export type UpdateAgreementType = { user_id: string; agreements: AgreementType };
export type SignUpType = CredentialType & { agreements: AgreementType };

export type RefreshType = {
  user_id: string;
  refreshToken: string;
};

export type ResetPasswordType = {
  user_id: string;
  password: string;
};

export type ProfileType = {
  user_id: string;
  age?: 1 | 2 | 3 | 4 | 5 | 6;
  gender?: 0 | 1;
  name?: string;
  mail_address?: string;
};

export type WithdrawType = {
  user_id: string;
  withdrawSurvey: string;
};
