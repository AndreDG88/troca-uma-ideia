from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Leitura (GET, HEAD ou OPTIONS) é permitida para qualquer um
        if request.method in permissions.SAFE_METHODS:
            return True

        # A edição só é permitida se o usuário for o dono do tweet
        return obj.user == request.user
