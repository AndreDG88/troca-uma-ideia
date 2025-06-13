from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Profile, Tweet


class UserMiniSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "profile"]

    def get_profile(self, obj):
        request = self.context.get("request")
        avatar_url = None
        is_following = False

        if obj.profile.avatar and request:
            avatar_url = request.build_absolute_uri(obj.profile.avatar.url)

        if request and request.user.is_authenticated:
            is_following = request.user.profile in obj.profile.followers.all()

        return {
            "avatar": avatar_url,
            "is_following": is_following,
        }


class OriginalTweetSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Tweet
        fields = ["id", "user", "content", "created_at"]


class TweetSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()

    original_tweet = OriginalTweetSerializer(read_only=True)
    original_tweet_id = serializers.PrimaryKeyRelatedField(
        queryset=Tweet.objects.all(), write_only=True, required=False
    )

    reply_to_id = serializers.PrimaryKeyRelatedField(
        queryset=Tweet.objects.all(), write_only=True, required=False, allow_null=True
    )

    replies = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = [
            "id",
            "user",
            "content",
            "created_at",
            "likes_count",
            "liked_by_user",
            "is_repapo",
            "original_tweet",
            "original_tweet_id",
            "reply_to_id",
            "replies",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_liked_by_user(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False

    def get_replies(self, obj):
        replies = obj.replies.all().order_by("created_at")
        return TweetSerializer(replies, many=True, context=self.context).data

    def create(self, validated_data):
        original_tweet = validated_data.pop("original_tweet_id", None)
        reply_to = validated_data.pop("reply_to_id", None)
        is_repapo = validated_data.get("is_repapo", False)

        validated_data.pop("user", None)

        tweet = Tweet.objects.create(
            user=self.context["request"].user,
            original_tweet=original_tweet,
            reply_to=reply_to,
            is_repapo=is_repapo,
            **validated_data,
        )
        return tweet


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["avatar", "bio", "followers_count", "following_count"]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def update(self, instance, validated_data):
        # Deleta avatar antigo se for trocado
        new_avatar = validated_data.get("avatar", None)
        if new_avatar and instance.avatar and instance.avatar != new_avatar:
            instance.avatar.delete(save=False)

        instance.bio = validated_data.get("bio", instance.bio)

        # Só atualiza o avatar se tiver um novo
        if new_avatar:
            instance.avatar = new_avatar

        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    tweets = TweetSerializer(many=True, read_only=True)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "profile", "tweets"]
        extra_kwargs = {"username": {"required": False}}

    def update(self, instance, validated_data):
        username = validated_data.get("username")
        if username:
            # Garante que o novo username não está em uso
            if User.objects.exclude(pk=instance.pk).filter(username=username).exists():
                raise serializers.ValidationError(
                    {"username": "Este nome de usuário já está em uso."}
                )
            instance.username = username

        instance.save()
        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(write_only=True, required=False)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password", "avatar"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    def create(self, validated_data):
        avatar = validated_data.pop("avatar", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        profile, created = Profile.objects.get_or_create(user=user)

        if avatar:
            profile.avatar = avatar
            profile.save()

        return user
