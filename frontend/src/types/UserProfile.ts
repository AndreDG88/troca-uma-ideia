// Interface de tipagem para o user.
export interface Tweet {
  id: number;
  content: string;
  created_at: string;
  likes_count: number;
  liked_by_user: boolean;
  liked?: boolean;
  is_repapo?: boolean;
  reply_to?: number | null;
  original_tweet?: Tweet | null;
  replies?: Tweet[];
  repapear_count?: number;
  user: {
    id: number;
    username: string;
    profile: {
      avatar: string | null;
    };
  };
}

export interface Profile {
  avatar: string | null;
  bio: string;
  name?: string;
  followers_count?: number;
  following_count?: number;
}

export interface UserProfile {
  id: number;
  username: string;
  profile: Profile;
  tweets: Tweet[];
}