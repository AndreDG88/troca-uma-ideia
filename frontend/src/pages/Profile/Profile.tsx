import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserProfile } from '../../types/UserProfile';
import TweetCard from '../../components/TweetCard/TweetCard';
import api from '../../api/axios';

const Profile = () => {
  const { username } = useParams<{ username: string }>();  // explicitamente tipado
  const { user } = useAuth();  // supondo que o contexto fornece token JWT também
  const finalUsername = username || user?.username;
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const isOwnProfile = user?.username === finalUsername;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Exemplo de endpoint, ajuste para o seu backend
        const res = await api.get(`/api/profiles/${finalUsername}/`);
        setProfileData(res.data);

        // Supondo que a API retorne se você já segue essa pessoa
        setFollowing(res.data.is_following || false);

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError('Erro ao buscar perfil: ' + err.message);
        } else {
          setError('Erro ao buscar perfil.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (finalUsername) {
      fetchProfile();
    }
  }, [finalUsername]);

  // Função para seguir ou deixar de seguir
  const toggleFollow = async () => {
    if (!finalUsername || isOwnProfile) return;

    setBtnLoading(true);
    try {
      if (following) {
        // Deixar de seguir
        await api.post(`/api/profiles/${finalUsername}/unfollow/`);
        setFollowing(false);
        setProfileData((prev) => prev ? { 
          ...prev, 
          profile: { 
            ...prev.profile, 
            followers_count: (prev.profile.followers_count || 1) - 1 
          } 
        } : prev);
      } else {
        // Seguir
        await api.post(`/api/profiles/${finalUsername}/follow/`);
        setFollowing(true);
        setProfileData((prev) => prev ? { 
          ...prev, 
          profile: { 
            ...prev.profile, 
            followers_count: (prev.profile.followers_count || 0) + 1 
          } 
        } : prev);
      }
    } catch (err) {
      console.error('Erro ao seguir/deixar de seguir:', err);
      alert('Não foi possível atualizar o status de seguir.');
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return <p>Carregando perfil...</p>;
  if (error) return <p>{error}</p>;
  if (!profileData) return <p>Perfil não encontrado.</p>;

  const { profile, tweets } = profileData;

  return (
    <div>
      <div>
        <img
          src={profile.avatar || '/default-avatar.png'}
          alt="Avatar"
          style={{ width: 120, height: 120, borderRadius: '50%' }}
        />
        <h2>{profile.name || finalUsername} (@{finalUsername})</h2>
        <p>{profile.bio}</p>
        <p>
          <strong>{profile.followers_count || 0}</strong> seguidores ·{' '}
          <strong>{profile.following_count || 0}</strong> seguindo
        </p>

        {isOwnProfile ? (
          <button onClick={() => alert('Funcionalidade de editar perfil ainda não implementada')}>
            Editar perfil
          </button>
        ) : (
          <button onClick={toggleFollow} disabled={btnLoading}>
            {btnLoading ? 'Carregando...' : (following ? 'Deixar de seguir' : 'Seguir')}
          </button>
        )}
      </div>

      <div>
        <h3>Postagens</h3>
        {tweets.length === 0 ? (
          <p>Nenhum tweet ainda.</p>
        ) : (
          tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)
        )}
      </div>
    </div>
  );
};

export default Profile;
