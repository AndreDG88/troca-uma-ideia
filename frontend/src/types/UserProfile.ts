// Interface de tipagem para o user.
export interface Tweet {
  id: number;
  content: string;
  created_at: string;
  likes_count: number;
  liked?: boolean;
  liked_by_user: boolean;
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
}

export interface UserProfile {
  id: number;
  username: string;
  profile: Profile;
  tweets: Tweet[];
}