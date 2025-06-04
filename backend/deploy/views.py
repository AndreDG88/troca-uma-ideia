import subprocess

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def github_webhook(request):
    if request.method == "POST":
        process = subprocess.Popen(
            ["/bin/bash", "/home/AndreDG88/troca-uma-ideia/backend/deploy.sh"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        stdout, stderr = process.communicate()
        print("STDOUT:", stdout.decode())
        print("STDERR:", stderr.decode())

        if process.returncode == 0:
            return HttpResponse("Deploy iniciado com sucesso!", status=200)
        else:
            return HttpResponse(f"Erro no deploy:\n{stderr.decode()}", status=500)
    return HttpResponse("Método não permitido", status=405)
