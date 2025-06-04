import subprocess

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def github_webhook(request):
    if request.method == "POST":
        subprocess.Popen(
            ["/bin/bash", "/home/AndreDG88/troca-uma-ideia/backend/deploy.sh"]
        )
        return HttpResponse("Deploy iniciado com sucesso!", status=200)
    return HttpResponse("Método não permitido", status=405)
