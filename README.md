# 🍅 Pomodoro Pro

> Um timer Pomodoro completo com controle via ESP32, estatísticas avançadas e interface web moderna. Feito por quem precisa focar de verdade! 🎯

![Version](https://img.shields.io/badge/version-2.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Made with Love](https://img.shields.io/badge/made%20with-❤️-red)

---

## 💡 Por que fiz isso?

Muitas vezes decidi estudar e acabei me destraindo, perdendo o foco e não sabendo quanto tempo eu descansei, estudei ou fiquei procastinando, então decidi criar o meu Pomodoro, para ter esse controle dos meus estudos e metas. 

O resultado? Um timer completo que:
- 🎨 Funciona **offline** (nada de depender de internet)
- 🤖 Sincroniza com **ESP32** (display físico na sua mesa!)
- 📊 Mostra **estatísticas** reais (não aquelas genéricas)
- 🎯 É **seu** de verdade (código aberto, modifique à vontade)

---

## ✨ O que ele faz?

### 🍅 Timer Pomodoro (óbvio, né?)
- Timer visual com aquele **progresso circular** bonitão
- Controles simples: Play, Pause, Reset
- Alterna automaticamente entre foco e pausa
- Notificações reais do navegador (não apenas sons)
- Sons customizáveis

### 📊 Estatísticas que fazem sentido
- Veja quantas sessões você fez hoje/semana/total
- Gráfico semanal (veja seu progresso de verdade!)
- Sistema de streak (quantos dias seguidos você manteve?)
- Histórico completo com horários e atividades
- Exporta tudo em JSON (seus dados são seus!)

### 🎯 Atividades Personalizadas
- Crie atividades específicas: "Estudar React", "Fazer TCC", etc
- Configure tempo de foco e pausa **para cada atividade**
- Categorias: Trabalho, Estudo, Exercício, Projetos...
- Troca rápida entre atividades

### 🌓 Temas & Configurações
- **Tema escuro/claro** (seus olhos agradecem)
- Controle de volume dos sons
- Auto-start para pausa (menos cliques!)
- Atalhos de teclado (Espaço = Play/Pause, R = Reset)

### 🤖 Integração ESP32 (a parte mais legal!)
- Display OLED mostrando o timer **sempre visível**
- Botões físicos para Start/Reset
- Buzzer que apita quando termina
- Sincroniza com a interface web em **tempo real**
- Controle tanto pelo celular quanto pelos botões!

---

## 🚀 Como começar?

### Só quer usar a interface web?

1. **Baixe o projeto:**
   ```bash
   git clone https://github.com/gukumagai/pomodoro-pro.git
   cd pomodoro-pro
   ```

2. **Inicie um servidor local:**
   ```bash
   # Se tiver Python:
   python -m http.server 8000
   
   # Se tiver Node.js:
   npx http-server
   ```

3. **Abra no navegador:**
   ```
   http://localhost:8000
   ```

4. **Pronto!** 🎉 Comece a usar!

### Quer o ESP32 também?

**Hardware necessário:**
- ESP32 DevKit
- Display OLED 128x64 (I2C)
- 2 Botões (push button)
- 1 Buzzer
- Jumpers e protoboard

**Montagem rápida:**
```
ESP32 GPIO 21 → Display SDA
ESP32 GPIO 22 → Display SCL
ESP32 GPIO 4  → Botão START → GND
ESP32 GPIO 5  → Botão RESET → GND
ESP32 GPIO 23 → Buzzer (+)
3.3V → Display VCC
GND  → Display GND + Botões + Buzzer
```

**Instale bibliotecas no Arduino IDE:**
- WebSockets (by Markus Sattler)
- ArduinoJson
- Adafruit GFX
- Adafruit SSD1306

**Faça upload do código:**
1. Abra `pomodoro_esp32/pomodoro_esp32.ino`
2. Conecte o ESP32 via USB
3. Selecione a placa e porta
4. Clique em Upload

---

## 📶 Configurar WiFi do ESP32

O ESP32 pode funcionar em **2 modos**:

### 🔴 Modo 1: AP (Access Point) - Padrão

**Como funciona:**
- ESP32 cria **sua própria rede WiFi**
- Nome: `Pomodoro-ESP32`
- Senha: `pomodoro123`

**Vantagens:**
- ✅ Funciona sem WiFi de casa
- ✅ Não precisa configurar nada
- ✅ Portátil (leva para qualquer lugar)

**Desvantagens:**
- ❌ Dispositivos perdem internet
- ❌ Só funciona perto do ESP32

**Como usar:**
1. Código já vem configurado assim!
2. Conecte seu celular na rede `Pomodoro-ESP32`
3. Acesse: `http://192.168.4.1:8000`

---

### 🟢 Modo 2: STA (Station) - Conecta na sua WiFi

**Como funciona:**
- ESP32 se conecta na **sua rede WiFi de casa**
- Todos os dispositivos na mesma rede

**Vantagens:**
- ✅ Mantém internet em todos dispositivos
- ✅ Mais fácil de usar no dia a dia
- ✅ Alcance maior (WiFi da casa)

**Desvantagens:**
- ❌ Precisa configurar credenciais WiFi
- ❌ Só funciona onde tem essa rede

**Como configurar:**

1. **Abra o arquivo:** `pomodoro_esp32/pomodoro_esp32.ino`

2. **Procure por** (linha ~50):
   ```cpp
   // Modo STA (Station) - Conecta em uma rede existente
   // ⚠️ CONFIGURE SUAS CREDENCIAIS AQUI!
   // const char* ssid_STA = "SUA_REDE_WIFI";
   // const char* password_STA = "SUA_SENHA_WIFI";
   ```

3. **Descomente e configure:**
   ```cpp
   const char* ssid_STA = "NomeDaSuaWiFi";      // ← Seu WiFi
   const char* password_STA = "suaSenhaAqui";    // ← Sua senha
   ```

4. **Procure o setup()** (linha ~125):
   ```cpp
   // Iniciar WiFi em modo AP
   setupWiFi_AP();
   
   // Ou iniciar WiFi em modo STA (conectar em rede existente)
   // ⚠️ Primeiro configure ssid_STA e password_STA acima!
   // setupWiFi_STA();
   ```

5. **Comente o AP e descomente o STA:**
   ```cpp
   // Iniciar WiFi em modo AP
   // setupWiFi_AP();
   
   // Ou iniciar WiFi em modo STA (conectar em rede existente)
   setupWiFi_STA();
   ```

6. **Faça upload** para o ESP32

7. **Abra o Monitor Serial** (115200 baud) e **anote o IP**:
   ```
   ✅ WiFi conectado!
   IP: 192.168.1.XXX  ← ANOTE ESTE IP!
   ```

8. **Configure na interface web:**
   - Ambos (PC e celular) conectados na mesma WiFi
   - Acesse: `http://192.168.1.XXX:8000`
   - Em Configurações, WebSocket: `ws://IP_DO_ESP32:81`

**Pronto!** Agora funciona com internet! 🎉

---

## ⌨️ Atalhos Úteis

| Tecla | Ação |
|-------|------|
| `Espaço` | Play/Pause |
| `R` | Reset |
| `Ctrl+N` | Próxima atividade |

---

## 🛠️ Tecnologias Usadas

**Frontend:**
- HTML5, CSS3, JavaScript ES6+
- Sem frameworks! (Vanilla JS puro)
- Módulos ES6 para organização
- Canvas API para gráficos
- LocalStorage para persistência

**Hardware (ESP32):**
- Arduino C++
- WebSocket Server
- Display OLED (I2C)
- GPIO para botões e buzzer

---

## 📁 Estrutura do Projeto

```
pomodoro-interface/
├── index.html              # Página principal
├── style.css               # Todos os estilos
├── config.json             # Configurações padrão
│
├── js/                     # Código modularizado
│   ├── main.js            # Ponto de entrada
│   ├── timer.js           # Lógica do timer
│   ├── activities.js      # Gerenciar atividades
│   ├── statistics.js      # Estatísticas e gráficos
│   ├── websocket.js       # Comunicação ESP32
│   ├── notifications.js   # Notificações e sons
│   ├── storage.js         # LocalStorage
│   ├── settings.js        # Configurações
│   ├── keyboard.js        # Atalhos
│   ├── ui.js              # Manipulação DOM
│   ├── events.js          # Event listeners
│   ├── state.js           # Estado global
│   └── config.js          # Constantes
│
├── assets/
│   ├── icons/             # Ícones SVG
│   └── sounds/            # Sons (start, pause, alarme)
│
├── pomodoro_esp32/
│   └── pomodoro_esp32.ino # Código Arduino completo
│
├── README.md               # Documentação completa
├── LICENSE                 # MIT License
└── .gitignore              # Arquivos ignorados
```

---

## 💡 Como funciona a sincronização ESP32?

É simples! O ESP32 e a interface web conversam via **WebSocket**.

**Exemplo:**
1. Você aperta o botão físico no ESP32  
2. ESP32 envia: `{"action": "start"}`  
3. Interface web recebe e inicia o timer  
4. Timer atualiza a cada 10s enviando: `{"type": "timer_update", "remaining": 1490}`  
5. ESP32 recebe e atualiza o display  

**Resultado:** Tudo sincronizado em tempo real! ⚡

---

## 🎯 Dicas de Uso

### Para Estudantes:
- Crie atividades por matéria ("Cálculo", "Física", "TCC")
- Use 25min foco / 5min pausa (tradicional)
- Revise suas estatísticas semanalmente

### Para Desenvolvedores:
- Atividades por projeto ou tarefa
- 50min foco / 10min pausa (intenso!)
- Auto-start na pausa para manter o flow

### Para Freelancers:
- Categorize por cliente
- Exporte dados para faturamento
- Acompanhe produtividade semanal

---

## 🐛 Problemas Comuns

### "Cannot use import statement outside a module"
**Solução:** Use um servidor local! Não abra o arquivo direto (`file://`).
```bash
python -m http.server 8000
```

### ESP32 não conecta
**Solução:** Verifique:
1. URL está correta? `ws://IP:81` (com `ws://`)
2. ESP32 e dispositivo na mesma rede WiFi?
3. Firewall bloqueando?

### Notificações não aparecem
**Solução:** Permita notificações quando o navegador pedir!

### Display OLED em branco
**Solução:** Troque SDA ↔ SCL ou teste endereço 0x3D

### Erro ao fazer upload no ESP32
**Solução:** 
1. Segure o botão **BOOT** durante "Connecting..."
2. Verifique se selecionou a porta COM correta
3. Instale drivers: CP210x ou CH340 (depende do seu ESP32)
4. Use cabo USB de **dados** (não apenas carga)

### ESP32 mostra IP mas não conecta
**Solução:**
1. Anote o IP do Monitor Serial
2. Configure na interface: `ws://IP_DO_ESP32:81`
3. Certifique-se que começou com `ws://` (não `http://`)

---

## 🌟 Roadmap (ideias futuras)

- [ ] **PWA** - Instalar como app no celular
- [ ] **Sincronização nuvem** - Backup automático
- [ ] **Google Calendar** - Registrar sessões
- [ ] **Relatórios PDF** - Exportar estatísticas
- [ ] **Integração Spotify** - Pausar música automaticamente
- [ ] **Pomodoro Longo** - Modo 90min para deep work
- [ ] **Frases motivacionais** - Um boost quando você precisar
- [ ] **Modos de sons** - Som de chuva, café, natureza...

_Quer sugerir algo? Abre uma issue!_

---

## 🤝 Contribuindo

Encontrou um bug? Tem uma ideia? **Contribuições são super bem-vindas!**

1. **Fork** o projeto  
2. **Crie uma branch**: `git checkout -b minha-feature`  
3. **Commit**: `git commit -m 'Adiciona feature X'`  
4. **Push**: `git push origin minha-feature`  
5. **Abra um Pull Request**

Ou simplesmente **abra uma issue** com sua ideia/bug!

---

## 📄 Licença

Este projeto é **open source** sob a licença [MIT](LICENSE).

**TL;DR:** Você pode usar, modificar, distribuir... faça o que quiser! Só dê os créditos. 😊

---

## 👨‍💻 Autor

Feito com ☕ e muito ⏱️ por **Gustavo Giacoia Kumagai**

Se esse projeto te ajudou de alguma forma, deixa uma ⭐ no repo!


<div align="center">

**[⬆ Voltar ao topo](#-pomodoro-pro)**


</div>

