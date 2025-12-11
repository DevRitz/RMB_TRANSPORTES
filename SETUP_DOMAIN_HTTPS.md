# Guia de Configuração de Domínio e HTTPS

## 🌐 Configurar Domínio transportesrmb.com

### Passo 1: Configurar DNS na Hostinger

1. Acesse o painel da Hostinger (hpanel)
2. Vá em **Domínios** → Selecione `transportesrmb.com`
3. Clique em **DNS / Nameservers**
4. Adicione/edite o registro **A**:
   - **Tipo:** A
   - **Nome:** @ (ou deixe vazio para domínio raiz)
   - **Aponta para:** `72.60.157.249`
   - **TTL:** 3600 (1 hora)

5. Adicione também registro para `www`:
   - **Tipo:** A
   - **Nome:** www
   - **Aponta para:** `72.60.157.249`
   - **TTL:** 3600

6. Salve as alterações

**⏰ Aguarde:** Propagação DNS pode levar de 5 minutos a 48 horas (geralmente 15-30 minutos)

### Passo 2: Verificar Propagação DNS

Execute no seu computador local:

```bash
# Windows PowerShell
nslookup transportesrmb.com
nslookup www.transportesrmb.com

# Deve retornar: 72.60.157.249
```

Ou use ferramentas online:
- https://dnschecker.org
- Digite: `transportesrmb.com` e verifique se aponta para `72.60.157.249`

---

## 🔒 Configurar HTTPS com Let's Encrypt

### Passo 3: Instalar Certbot na VPS

Conecte na VPS e execute:

```bash
# Atualizar sistema
sudo apt update

# Instalar Certbot e plugin para Nginx
sudo apt install -y certbot python3-certbot-nginx

# Verificar instalação
certbot --version
```

### Passo 4: Criar Configuração Nginx para o Domínio

Na VPS, crie arquivo de configuração:

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/transportesrmb.com
```

Cole este conteúdo:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name transportesrmb.com www.transportesrmb.com;

    # Redirecionar todo tráfego HTTP para o container Docker na porta 80
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salve e saia (`Ctrl+X`, depois `Y`, depois `Enter`)

### Passo 5: Ativar Site e Testar Nginx

```bash
# Criar link simbólico para ativar site
sudo ln -s /etc/nginx/sites-available/transportesrmb.com /etc/nginx/sites-enabled/

# Remover configuração padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Se OK, recarregar Nginx
sudo systemctl reload nginx
```

### Passo 6: Obter Certificado SSL com Certbot

**IMPORTANTE:** Execute isso SOMENTE DEPOIS que o DNS estiver propagado!

```bash
# Obter certificado SSL (certbot vai configurar HTTPS automaticamente)
sudo certbot --nginx -d transportesrmb.com -d www.transportesrmb.com
```

O Certbot vai perguntar:

1. **Email:** Digite seu email para avisos de renovação
2. **Termos de serviço:** Digite `Y` para aceitar
3. **Compartilhar email com EFF:** Digite `N` (opcional)
4. **Redirect HTTP to HTTPS:** Digite `2` para redirecionar tudo para HTTPS

### Passo 7: Testar HTTPS

Acesse no navegador:
- http://transportesrmb.com → deve redirecionar para https://transportesrmb.com
- https://transportesrmb.com → deve abrir com cadeado verde 🔒
- https://www.transportesrmb.com → deve funcionar também

### Passo 8: Configurar Renovação Automática

O Certbot já configura renovação automática, mas vamos testar:

```bash
# Testar renovação (dry-run, não renova de verdade)
sudo certbot renew --dry-run

# Se OK, está configurado! O certificado renova automaticamente a cada 60 dias
```

Para verificar quando o certificado expira:

```bash
sudo certbot certificates
```

---

## 📋 Checklist Final

Após configurar, verifique:

- ✅ http://transportesrmb.com redireciona para https://transportesrmb.com
- ✅ https://transportesrmb.com abre com cadeado verde
- ✅ https://www.transportesrmb.com funciona
- ✅ Login funciona no domínio HTTPS
- ✅ Todas as páginas carregam sem erro de "conteúdo misto"
- ✅ `sudo certbot renew --dry-run` passa sem erros

---

## 🔧 Solução de Problemas

### DNS não propagou ainda

**Erro:** `certbot: Could not find A record for transportesrmb.com`

**Solução:** Aguarde mais tempo e verifique DNS com `nslookup transportesrmb.com`

### Certbot falha ao validar domínio

**Erro:** `Failed authorization procedure`

**Causas possíveis:**
1. DNS ainda não propagou
2. Porta 80 está bloqueada no firewall
3. Nginx não está rodando

**Verificações:**
```bash
# Verificar se Nginx está rodando
sudo systemctl status nginx

# Verificar firewall
sudo ufw status

# Se firewall bloquear, permitir:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Container Docker não está acessível

**Erro:** `502 Bad Gateway` ao acessar o domínio

**Solução:**
```bash
# Verificar se containers estão rodando
cd /opt/rmb-transportes
docker compose ps

# Se não estiverem, iniciar:
docker compose up -d
```

### HTTPS funciona mas HTTP não redireciona

Edite a configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/transportesrmb.com
```

Certifique-se que tem estas linhas no bloco `server` na porta 80:

```nginx
return 301 https://$server_name$request_uri;
```

---

## 🎯 Resultado Final

Após concluir, seu sistema estará:

1. ✅ Acessível em https://transportesrmb.com
2. ✅ Com certificado SSL válido (cadeado verde)
3. ✅ HTTP redirecionando automaticamente para HTTPS
4. ✅ Certificado renovando automaticamente a cada 60 dias
5. ✅ Totalmente seguro para uso em produção

---

## 📝 Comandos Úteis

```bash
# Ver certificados instalados
sudo certbot certificates

# Renovar certificado manualmente (normalmente não precisa)
sudo certbot renew

# Testar renovação
sudo certbot renew --dry-run

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Recarregar Nginx após mudanças
sudo nginx -t && sudo systemctl reload nginx

# Ver status do container Docker
cd /opt/rmb-transportes
docker compose ps
docker compose logs frontend --tail=50
```

---

## ⚠️ IMPORTANTE: Firewall

Se a VPS tiver firewall ativo, certifique-se que as portas estão abertas:

```bash
# Verificar firewall
sudo ufw status

# Se estiver ativo, permitir portas necessárias:
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw reload
```

---

## 🔄 Ordem de Execução

1. ✅ Configurar DNS na Hostinger (Passo 1)
2. ⏰ Aguardar propagação DNS (15-30 minutos)
3. ✅ Verificar DNS com `nslookup` (Passo 2)
4. ✅ Instalar Certbot (Passo 3)
5. ✅ Configurar Nginx (Passos 4-5)
6. ✅ Obter certificado SSL (Passo 6)
7. ✅ Testar HTTPS (Passo 7)
8. ✅ Verificar renovação automática (Passo 8)

**Qualquer dúvida durante o processo, me chame!** 🚀
