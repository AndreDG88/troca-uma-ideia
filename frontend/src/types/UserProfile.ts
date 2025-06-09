// Interface de tipagem para o user.
export interface Tweet {
  id: number;
  user: string;
  content: string;
  created_at: string;
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