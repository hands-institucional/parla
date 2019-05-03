# Projeto Parla

Projeto em realidade aumentada criado para interagir com estátuas do mundo real, fazendo-as contar suas próprias histórias imersivamente.



### Known Issues on Latest Release
- Baixa performance em alguns dispositivos mobile antigos.
- Fácil perda de foco da face quando movimenta-se a câmera.
- Difícil detecção / detecção com anomalia nos casos de faces claras em ambientes claros ou de faces escuras em ambientes escuros.



## Requisitos
Para executar o projeto localmente, é necessário ter o Node.js instalado: https://nodejs.org/en/.

Após instalá-lo, dentro do terminal, execute o comando `npm i -g http-server` para instalar o servidor http localmente.



## Executando o projeto:
- Clonar o repositório. No terminal, executar
>`git clone https://github.com/hands-institucional/parla.git`
- Dentro da raiz do projeto, execute o seguinte comando para criar arquivos de certificado, necessários para rodar um servidor https local:
> `openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem` 
- Ainda dentro da raiz do projeto, executar 
> `http-server -S -C cert.pem -o`
- No navegador, acessar https://localhost:8080 ou https://SEU-IP-LOCAL:8080


## Troubleshooting

- Não consigo acessar a página.
> Certifique-se que está acessando a página por `https` e não por `http`.
- Estou tentando acessar a página pelo Chrome iOS e estou vendo uma mensagem de erro.
> Em dispositivos iOS, apenas o navegador Safari tem permissão para acessar `navigator.getUserMedia()` (comando que permite browsers acessarem dispositivos como a câmera), a compatibilidade desta página com outros browsers depende de  atualizações da Apple. Fonte: http://www.openradar.me/33571214.