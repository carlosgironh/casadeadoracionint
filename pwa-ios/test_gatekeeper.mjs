import assert from 'assert';

function evaluateUA(ua, standalone = false, maxTouchPoints = 0, platform = '') {
  const isAndroid = /android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);

  if (isAndroid) return 'android';
  if (!isIOS) return 'desktop';
  return standalone ? 'ios-standalone' : 'ios-browser';
}

console.log("--- Ejecutando pruebas de Gatekeeper ---");

// 1. Android
const androidUA = "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
assert.strictEqual(evaluateUA(androidUA), 'android', "Debe detectar Android");
console.log("✔ Android detectado correctamente");

// 2. Windows Desktop
const winUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
assert.strictEqual(evaluateUA(winUA), 'desktop', "Debe detectar Desktop Windows");
console.log("✔ Windows Desktop detectado correctamente");

// 3. Mac Desktop sin touch
const macUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15";
assert.strictEqual(evaluateUA(macUA, false, 0, 'MacIntel'), 'desktop', "Debe detectar Mac Desktop");
console.log("✔ Mac Desktop detectado correctamente");

// 4. iPad moderno (MacIntel con touch)
assert.strictEqual(evaluateUA(macUA, false, 5, 'MacIntel'), 'ios-browser', "Debe detectar iPad en Safari");
console.log("✔ iPad en Safari detectado correctamente");

// 5. iPhone en Safari (No instalado)
const iphoneUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1";
assert.strictEqual(evaluateUA(iphoneUA, false), 'ios-browser', "Debe detectar iPhone en navegador");
console.log("✔ iPhone en Safari navegador detectado correctamente (Bloqueo activo)");

// 6. iPhone PWA Standalone (Instalado en pantalla de inicio)
assert.strictEqual(evaluateUA(iphoneUA, true), 'ios-standalone', "Debe detectar iPhone instalado");
console.log("✔ iPhone Standalone PWA detectado correctamente (Acceso Desbloqueado)");

console.log("\nTODAS LAS PRUEBAS DE GATEKEEPER PASARON EXITOSAMENTE (6/6)");
