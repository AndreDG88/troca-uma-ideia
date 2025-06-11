from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Profile, Tweet


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "profile"]

    profile = serializers.SerializerMethodField()

    def get_profile(self, obj):
        return {"avatar": obj.profile.avatar.url if obj.profile.avatar else None}


class TweetSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    likes = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = ["id", "user", "content", "created_at", "likes", "liked_by_user"]

    def get_likes(self, obj):
        return obj.likes.count()

    def get_liked_by_user(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = Profile
        fields = ["avatar", "bio"]

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
