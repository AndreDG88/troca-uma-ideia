import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserProfile } from '../../types/UserProfile';
import TweetCard from '../../components/TweetCard/TweetCard';
import api from '../../api/axios';
import styles from './Profile.module.css';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const finalUsername = username || user?.username;
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);

  const isOwnProfile = user?.username === finalUsername;

  // Carrega perfil de outro usuário ou o próprio
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(
          isOwnProfile ? "/api/profile/" : `/api/profiles/${finalUsername}/`
        );
        setProfileData(res.data);
        setFollowing(res.data.is_following || false);
        
        if (isOwnProfile) {
          setNewBio(res.data.profile.bio || "");
        }

      } catch (err: unknown) {
        setError("Erro ao buscar perfil.");
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (finalUsername) fetchProfile();
  }, [finalUsername, isOwnProfile]);

  // Função para seguir ou deixar de seguir
  const toggleFollow = async () => {
    if (!finalUsername || isOwnProfile) return;
    setBtnLoading(true);
    try {
        await api.post(`/api/profiles/${finalUsername}/follow/`);
        setFollowing((prev) => !prev);
        setProfileData((prev) =>
          prev 
            ? { 
                ...prev, 
                profile: { 
                  ...prev.profile,
                  followers_count:
                    (prev.profile.followers_count || 0) + (following ? -1 : 1),
                }, 
              } 
            : prev
        );
      } catch (err: unknown) {
          console.error("Erro no toggleFollow:", err);
          alert("Erro ao seguir/deixar de seguir.");
      } finally {
      setBtnLoading(false);
    }
  };

  // Edições no perfil (avatar, nome, bio)
  const handleSaveEdit = async () => {
    const formData = new FormData();
    formData.append('bio', newBio);
    if (newAvatar) {
      formData.append('avatar', newAvatar);
    }

    try {
      const res = await api.patch('/api/myprofile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfileData((prev) =>
        prev ? { ...prev, profile: res.data } : prev
      );
      setUser((prevUser) =>
        prevUser ? { ...prevUser, profile: res.data } : prevUser
      );
      setEditing(false);
      setNewAvatar(null);
    } catch (err) {
      alert('Erro ao salvar perfil.');
      console.error(err);
    }
  };

  if (loading) return <p>Carregando perfil...</p>;
  if (error) return <p>{error}</p>;
  if (!profileData) return <p>Perfil não encontrado.</p>;

  const { profile, tweets } = profileData;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileContainer}>
        <div style={{ textAlign: "center" }}>
          <img
            src={profile.avatar || '/default-avatar.png'}
            alt="Avatar"
            className={styles.avatar}
          />

          {editing && isOwnProfile ? (
            <div className={styles.editControls}>
              <input
                type="file"
                accept="image/*"
                className={styles.inputFile}
                onChange={(e) => {
                  if (e.target.files) setNewAvatar(e.target.files[0]);
                }}
              />

              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Bio"
              />
              <div className={styles.buttonsRow}>
                <button onClick={handleSaveEdit} className={styles.button}>
                  Salvar
                </button>
                <button onClick={() => setEditing(false)} className={styles.button}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Exibe username fixo */}
              <h2 className={styles.username}>@{finalUsername}</h2>
              <p className={styles.stats}>
                <strong>{profile.followers_count || 0}</strong> seguidores ·{' '}
                <strong>{profile.following_count || 0}</strong> seguindo
              </p>
              {/* Bio logo abaixo dos números */}
              <p className={styles.bio}>{profile.bio}</p>

              <div className={styles.buttonsRow}>
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setEditing(true)} className={styles.button}>
                      Editar perfil
                    </button>
                    <button onClick={() => navigate("/")} className={styles.button}>
                      Voltar para Home
                    </button>
                  </>
              ) : (
                <button onClick={toggleFollow} disabled={btnLoading} className={styles.button}>
                  {btnLoading
                    ? 'Carregando...'
                    : following
                    ? 'Deixar de seguir'
                    : 'Seguir'}
                </button>
              )}
              </div>
            </>
          )}
        </div>

        <div className={styles.tweetsSection}>
          <h2 className={styles.title}>Trocas de ideia</h2>
          {tweets.length === 0 ? (
            <p>Nenhum tweet ainda.</p>
          ) : (
            tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
