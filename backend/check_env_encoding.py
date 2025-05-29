# check_env_encoding.py
with open(".env", "rb") as f:
    content = f.read()
    try:
        content.decode("utf-8")
        print("Arquivo .env está OK em UTF-8.")
    except UnicodeDecodeError as e:
        print("Erro de encoding no arquivo .env:")
        print(e)

