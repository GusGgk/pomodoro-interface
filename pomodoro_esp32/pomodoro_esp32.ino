/*
 * Pomodoro Pro - ESP32 com Display OLED
 * 
 * Código adaptado do usuário com integração WebSocket
 * para controlar e sincronizar com a interface web
 * 
 * Hardware:
 * - Display OLED 128x64 (I2C - SDA:21, SCL:22)
 * - Botão Start/Pause (GPIO 4)
 * - Botão Reset (GPIO 5)
 * - Buzzer (GPIO 23)
 * 
 * Autor: Gustavo Giacoia Kumagai
 * Data: Março 2026
 * Versão: 2.0
 */

#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ================================
// CONFIGURAÇÕES DO DISPLAY
// ================================

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ================================
// PINOS
// ================================

#define BTN_START 4      // Botão Start/Pause
#define BTN_RESET 5      // Botão Reset
#define BUZZER 23        // Buzzer

// ================================
// CONFIGURAÇÕES WIFI
// ================================

// Modo AP (Access Point) - Cria uma rede WiFi própria
const char* ssid_AP = "Pomodoro-ESP32";
const char* password_AP = "pomodoro123";

// Modo STA (Station) - Conecta em uma rede existente
// ⚠️ CONFIGURE SUAS CREDENCIAIS AQUI!
// Descomente e insira o nome e senha da sua rede WiFi
// const char* ssid_STA = "SUA_REDE_WIFI";
// const char* password_STA = "SUA_SENHA_WIFI";

// ================================
// WEBSOCKET
// ================================

WebSocketsServer webSocket = WebSocketsServer(81);

// ================================
// VARIÁVEIS DO POMODORO
// ================================

int focusMin = 25;
int breakMin = 5;

int minutes = focusMin;
int seconds = 0;

bool running = false;
bool isFocus = true;

unsigned long lastUpdate = 0;
unsigned long lastButtonCheck = 0;
const int DEBOUNCE_DELAY = 200;

// ================================
// SETUP
// ================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=================================");
  Serial.println("🍅 Pomodoro Pro - GK");
  Serial.println("=================================\n");

  // Configurar pinos
  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_RESET, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);
  digitalWrite(BUZZER, LOW);

  // Inicializar Display
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("❌ Erro ao inicializar display OLED");
    while (true) {
      // Piscar LED de erro
      delay(500);
    }
  }

  Serial.println("✅ Display OLED inicializado");

  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(2);

  // Tela de inicialização
  display.clearDisplay();
  display.setCursor(0, 10);
  display.println("POMODORO");
  display.setCursor(0, 35);
  display.setTextSize(1);
  display.println("Inicializando...");
  display.display();

  // Animação de inicialização
  for (int i = 0; i < 3; i++) {
    beep(1);
    delay(150);
  }

  // Iniciar WiFi em modo AP
  setupWiFi_AP();
  
  // Ou iniciar WiFi em modo STA (conectar em rede existente)
  // ⚠️ Primeiro configure ssid_STA e password_STA acima!
  // Depois descomente a linha abaixo e comente setupWiFi_AP():
  // setupWiFi_STA();

  // Iniciar WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  Serial.println("\n✅ Sistema pronto!");
  Serial.println("=================================\n");

  // Mostrar tela inicial
  showScreen();
}

// ================================
// LOOP PRINCIPAL
// ================================

void loop() {
  // Processar WebSocket
  webSocket.loop();
  
  // Verificar botões físicos
  if (millis() - lastButtonCheck > DEBOUNCE_DELAY) {
    readButtons();
    lastButtonCheck = millis();
  }
  
  // Atualizar timer se estiver rodando
  if (running) {
    updateTimer();
  }
}

// ================================
// WIFI - MODO ACCESS POINT
// ================================

void setupWiFi_AP() {
  Serial.println("📡 Iniciando WiFi em modo AP...");
  
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid_AP, password_AP);
  
  IPAddress IP = WiFi.softAPIP();
  
  Serial.println("✅ WiFi AP iniciado!");
  Serial.print("SSID: ");
  Serial.println(ssid_AP);
  Serial.print("Senha: ");
  Serial.println(password_AP);
  Serial.print("IP: ");
  Serial.println(IP);
  Serial.print("URL WebSocket: ws://");
  Serial.print(IP);
  Serial.println(":81");
  Serial.println("\nConecte seu dispositivo nesta rede");
  Serial.println("e configure a URL no Pomodoro Pro!");
}

// ================================
// WIFI - MODO STATION (OPCIONAL)
// ================================

void setupWiFi_STA() {
  Serial.println("📡 Conectando ao WiFi...");
  
  WiFi.mode(WIFI_STA);
  // Descomente a linha abaixo e configure suas credenciais
  WiFi.begin(ssid_STA, password_STA);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("URL WebSocket: ws://");
    Serial.print(WiFi.localIP());
    Serial.println(":81");
  } else {
    Serial.println("\n❌ Falha ao conectar WiFi!");
    Serial.println("Reiniciando em modo AP...");
    setupWiFi_AP();
  }
}

// ================================
// WEBSOCKET EVENT HANDLER
// ================================

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Cliente desconectado!\n", num);
      break;
      
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("✅ [%u] Cliente conectado: %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
        
        // Enviar estado atual para o cliente
        sendCurrentState(num);
      }
      break;
      
    case WStype_TEXT:
      {
        Serial.printf("📩 [%u] Recebido: %s\n", num, payload);
        handleWebMessage((char*)payload);
      }
      break;
  }
}

// ================================
// PROCESSAR MENSAGENS DA WEB
// ================================

void handleWebMessage(char* payload) {
  
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.println("❌ Erro ao processar JSON");
    return;
  }
  
  const char* type = doc["type"];
  
  if (strcmp(type, "timer_started") == 0) {
    running = true;
    int remaining = doc["remaining"];
    minutes = remaining / 60;
    seconds = remaining % 60;
    Serial.println("▶️ Timer iniciado via web");
    showScreen();
  }
  else if (strcmp(type, "timer_paused") == 0) {
    running = false;
    Serial.println("⏸️ Timer pausado via web");
    showScreen();
  }
  else if (strcmp(type, "timer_reset") == 0) {
    running = false;
    int total = doc["total"];
    minutes = total / 60;
    seconds = total % 60;
    Serial.println("🔄 Timer resetado via web");
    showScreen();
  }
  else if (strcmp(type, "timer_update") == 0) {
    int remaining = doc["remaining"];
    minutes = remaining / 60;
    seconds = remaining % 60;
    showScreen();
  }
  else if (strcmp(type, "timer_finished") == 0) {
    int cycles = doc["cycles"];
    Serial.printf("✅ Ciclo concluído! Total: %d\n", cycles);
    beep(2);
  }
  else if (strcmp(type, "activity_selected") == 0) {
    // Atualizar tempos de foco e pausa
    focusMin = doc["focusMinutes"];
    breakMin = doc["breakMinutes"];
    
    // Resetar timer com novos valores
    running = false;
    isFocus = true;
    minutes = focusMin;
    seconds = 0;
    
    Serial.printf("🎯 Atividade selecionada: Foco %dmin / Pausa %dmin\n", focusMin, breakMin);
    showScreen();
  }
}

// ================================
// ENVIAR ESTADO ATUAL
// ================================

void sendCurrentState(uint8_t clientNum) {
  StaticJsonDocument<200> doc;
  doc["type"] = "current_state";
  doc["running"] = running;
  doc["minutes"] = minutes;
  doc["seconds"] = seconds;
  doc["isFocus"] = isFocus;
  
  String output;
  serializeJson(doc, output);
  
  webSocket.sendTXT(clientNum, output);
  Serial.printf("📤 Estado enviado: %s\n", output.c_str());
}

// ================================
// ENVIAR AÇÃO PARA WEB
// ================================

void broadcastAction(const char* action) {
  StaticJsonDocument<100> doc;
  doc["action"] = action;
  
  String output;
  serializeJson(doc, output);
  
  webSocket.broadcastTXT(output);
  Serial.printf("📢 Broadcast: %s\n", output.c_str());
}

// ================================
// BOTÕES FÍSICOS
// ================================

void readButtons() {
  static bool lastStart = HIGH;
  static bool lastReset = HIGH;

  bool nowStart = digitalRead(BTN_START);
  bool nowReset = digitalRead(BTN_RESET);

  // Botão Start/Pause
  if (lastStart == HIGH && nowStart == LOW) {
    running = !running;
    Serial.println(running ? "▶️ Start" : "⏸️ Pause");
    
    // Notificar web
    broadcastAction(running ? "start" : "pause");
    
    beep(1);
    showScreen();
  }

  // Botão Reset
  if (lastReset == HIGH && nowReset == LOW) {
    Serial.println("🔄 Reset");
    resetPomodoro();
    
    // Notificar web
    broadcastAction("reset");
  }

  lastStart = nowStart;
  lastReset = nowReset;
}

// ================================
// TIMER
// ================================

void updateTimer() {
  
  if (millis() - lastUpdate >= 1000) {
    lastUpdate = millis();

    if (seconds == 0) {
      if (minutes == 0) {
        changeMode();
        return;
      } else {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }

    showScreen();
  }
}

// ================================
// MUDAR MODO (FOCO ⇄ PAUSA)
// ================================

void changeMode() {
  
  running = false;

  if (isFocus) {
    // Fim do foco → 2 bips
    beep(2);
    
    isFocus = false;
    minutes = breakMin;
    
    Serial.println("☕ Mudando para PAUSA");

  } else {
    // Fim da pausa → 1 bip
    beep(1);
    
    isFocus = true;
    minutes = focusMin;
    
    Serial.println("🎯 Mudando para FOCO");
  }

  seconds = 0;
  showScreen();
  
  // Notificar web que o ciclo terminou
  // A web vai lidar com a mudança de modo
}

// ================================
// RESET
// ================================

void resetPomodoro() {
  
  beep(3);
  
  running = false;
  isFocus = true;
  minutes = focusMin;
  seconds = 0;

  showScreen();
}

// ================================
// DISPLAY OLED
// ================================

void showScreen() {
  
  display.clearDisplay();

  // Mostrar modo (FOCO ou PAUSA)
  display.setTextSize(2);
  display.setCursor(0, 0);
  
  if (isFocus) {
    display.println("FOCO");
  } else {
    display.println("PAUSA");
  }

  // Mostrar tempo
  display.setCursor(0, 25);
  
  if (minutes < 10) display.print("0");
  display.print(minutes);
  display.print(":");
  
  if (seconds < 10) display.print("0");
  display.print(seconds);

  // Indicador de status
  if (!running) {
    display.setTextSize(1);
    display.setCursor(70, 0);
    display.print("PAUSADO");
  }
  
  // Indicador de WiFi
  display.setTextSize(1);
  display.setCursor(0, 56);
  if (webSocket.connectedClients() > 0) {
    display.print("WEB: ");
    display.print(webSocket.connectedClients());
    display.print(" OK");
  } else {
    display.print("WEB: ---");
  }

  display.display();
}

// ================================
// BUZZER
// ================================

void beep(int times) {
  
  for (int i = 0; i < times; i++) {
    tone(BUZZER, 3000); // 3kHz
    delay(200);
    
    noTone(BUZZER);
    delay(100);
  }
}

/*
 * ========================================
 * INSTRUÇÕES DE USO
 * ========================================
 * 
 * 1. INSTALAR BIBLIOTECAS:
 *    - WebSockets by Markus Sattler
 *    - ArduinoJson by Benoit Blanchon
 *    - Adafruit GFX Library
 *    - Adafruit SSD1306
 * 
 * 2. CONECTAR HARDWARE:
 *    - Display OLED I2C:
 *      • SDA → GPIO 21
 *      • SCL → GPIO 22
 *      • VCC → 3.3V
 *      • GND → GND
 *    
 *    - Botão START (GPIO 4):
 *      • Um lado → GPIO 4
 *      • Outro lado → GND
 *      • (Pull-up interno ativado)
 *    
 *    - Botão RESET (GPIO 5):
 *      • Um lado → GPIO 5
 *      • Outro lado → GND
 *      • (Pull-up interno ativado)
 *    
 *    - Buzzer (GPIO 23):
 *      • Positivo → GPIO 23
 *      • Negativo → GND
 * 
 * 3. FAZER UPLOAD PARA O ESP32
 * 
 * 4. ABRIR SERIAL MONITOR (115200 baud)
 * 
 * 5. ANOTAR O ENDEREÇO IP MOSTRADO
 * 
 * 6. NO POMODORO PRO:
 *    - Conectar na rede WiFi "Pomodoro-ESP32"
 *    - Senha: "pomodoro123"
 *    - Abrir o Pomodoro Pro no navegador
 *    - Ir em Configurações
 *    - Inserir: ws://192.168.4.1:81
 *    - Clicar em Reconectar
 * 
 * 7. PRONTO! Agora você pode:
 *    - Controlar pelo celular/computador
 *    - Controlar pelos botões físicos
 *    - Ver status no display OLED
 *    - Tudo sincronizado em tempo real!
 * 
 * ========================================
 * DICAS
 * ========================================
 * 
 * - Para usar sua rede WiFi em vez do AP:
 *   1. Descomente as linhas de ssid_STA e password_STA
 *   2. Configure suas credenciais
 *   3. No setup(), chame setupWiFi_STA() em vez de setupWiFi_AP()
 * 
 * - Para customizar tempos:
 *   Altere focusMin e breakMin no início do código
 * 
 * - Para mudar o tom do buzzer:
 *   Altere o valor 3000 na função beep() (1000-5000 Hz)
 * 
 * ========================================
 */
