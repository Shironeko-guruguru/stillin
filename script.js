// ===== ゲームの状態を管理するオブジェクト =====
let gameState = {};

// ===== UI更新用の要素をあらかじめ取得 =====
const hpValue = document.getElementById('hp-value');
const turnValue = document.getElementById('turn-value');
const strBar = document.getElementById('str-bar');
const agiBar = document.getElementById('agi-bar');
const vitBar = document.getElementById('vit-bar');
const dexBar = document.getElementById('dex-bar');
const strValue = document.getElementById('str-value');
const agiValue = document.getElementById('agi-value');
const vitValue = document.getElementById('vit-value');
const dexValue = document.getElementById('dex-value');
const buffDisplay = document.getElementById('buff-display');

// ===== ゲーム初期化関数 =====
function initializeGame() {
  // ★追加: 新しいゲームを始める前に、古い中断データを削除
  localStorage.removeItem('savedGame');

  gameState = {
    hp: 100,
    maxHp: 100,
    turn: 24,
    maxTurn: 24,
    str: 10,
    agi: 10,
    vit: 10,
    dex: 10,
    maxStat: 200, // パラメータの最大値
    trainingBuffTurns: 0, // パラメータ上昇量アップ効果の残りターン
  };
  updateUI();
  showScreen('ikusei-home');
}

// ===== UIを最新の状態に更新する関数 =====
function updateUI() {
  if (gameState.hp === undefined) return;

  hpValue.textContent = `${gameState.hp} / ${gameState.maxHp}`;
  turnValue.textContent = `${gameState.turn} / ${gameState.maxTurn}`;

  strBar.style.width = `${(gameState.str / gameState.maxStat) * 100}%`;
  agiBar.style.width = `${(gameState.agi / gameState.maxStat) * 100}%`;
  vitBar.style.width = `${(gameState.vit / gameState.maxStat) * 100}%`;
  dexBar.style.width = `${(gameState.dex / gameState.maxStat) * 100}%`;
  strValue.textContent = gameState.str;
  agiValue.textContent = gameState.agi;
  vitValue.textContent = gameState.vit;
  dexValue.textContent = gameState.dex;

  if (gameState.trainingBuffTurns > 0) {
    buffDisplay.textContent = `パラメータ上昇量アップ中 (あと${gameState.trainingBuffTurns}ターン)`;
  } else {
    buffDisplay.textContent = '';
  }
}

// ===== 基本的な画面制御 =====
const gameHeader = document.querySelector('.game-header');
let currentScreenId = '';

function showScreen(id) {
  if (document.getElementById('data-menu')) {
    document.getElementById('data-menu').classList.add('hidden');
  }
  currentScreenId = id;
  if (id === "main-home") {
    gameHeader.style.display = "none";
  } else {
    gameHeader.style.display = "flex";
  }
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// ===== 各ボタンのイベントリスナー =====

// 1. ホーム画面 → 「育成」ボタン
document.getElementById('goto-char-select-btn').addEventListener('click', () => {
  // ★変更: 中断したデータがあるか確認
  const savedData = localStorage.getItem('savedGame');
  if (savedData) {
    // あれば、そのデータでゲームを再開
    gameState = JSON.parse(savedData);
    updateUI();
    showScreen('ikusei-home');
  } else {
    // なければ、キャラクター選択画面へ
    showScreen('char-select');
  }
});

// 2. キャラクター選択
document.querySelectorAll('.char-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('.char-card.selected').classList.remove('selected');
    card.classList.add('selected');
  });
});

// 3. キャラクター決定 → 育成開始
document.getElementById('confirm-char-btn').addEventListener('click', () => {
  initializeGame();
});

// 4. トレーニングボタン
document.querySelectorAll('.btn.small').forEach(button => {
  button.addEventListener('click', () => {
    if (gameState.turn <= 0) return;
    const statType = button.dataset.stat;
    const hpPercent = gameState.hp / gameState.maxHp;
    let baseGain = 10;
    if (hpPercent < 0.4) baseGain *= 0.6;
    if (hpPercent > 0.8) baseGain *= 1.4;
    if (gameState.trainingBuffTurns > 0) baseGain *= 1.5;
    gameState.turn--;
    if (gameState.trainingBuffTurns > 0) gameState.trainingBuffTurns--;
    gameState[statType] = Math.min(gameState.maxStat, gameState[statType] + Math.round(baseGain));
    gameState.hp = Math.max(0, gameState.hp - 15);
    updateUI();
    showScreen('ikusei-home');
  });
});

// 5. お休みボタン
document.getElementById('rest-btn').addEventListener('click', () => {
  if (gameState.turn <= 0) return;
  gameState.turn--;
  if (gameState.trainingBuffTurns > 0) gameState.trainingBuffTurns--;
  const recovery = 70;
  gameState.hp = Math.min(gameState.maxHp, gameState.hp + recovery);
  updateUI();
});

// 6. お出掛けボタン
document.getElementById('outing-btn').addEventListener('click', () => {
  if (gameState.turn <= 0) return;
  gameState.turn--;
  const recovery = 30;
  gameState.hp = Math.min(gameState.maxHp, gameState.hp + recovery);
  gameState.trainingBuffTurns = 5;
  updateUI();
});


// ===== ハンバーガーメニュー制御 =====
const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const volumeMenu = document.getElementById('volume-menu');

settingsBtn.addEventListener('click', () => {
  if (currentScreenId === 'main-home') {
    volumeMenu.classList.toggle('hidden');
    settingsMenu.classList.add('hidden');
  } else {
    settingsMenu.classList.toggle('hidden');
    volumeMenu.classList.add('hidden');
  }
});

const saveQuitBtn = document.getElementById('save-quit-btn');
const noSaveQuitBtn = document.getElementById('no-save-quit-btn');

// ★変更: 「保存して中断」の処理
saveQuitBtn.addEventListener('click', () => {
  // 現在のgameStateをローカルストレージに保存
  localStorage.setItem('savedGame', JSON.stringify(gameState));
  showScreen('main-home');
  settingsMenu.classList.add('hidden');
});

// ★変更: 「保存せず中断」の処理
noSaveQuitBtn.addEventListener('click', () => {
  const isConfirmed = confirm("本当に保存しないで中断しますか？\n（この操作は取り消せません）");
  if (isConfirmed) {
    // 中断データがあれば削除
    localStorage.removeItem('savedGame');
    showScreen('main-home');
    settingsMenu.classList.add('hidden');
  }
});

// ===== データ連携機能 =====
const dataMenu = document.getElementById('data-menu');
const dataBtn = document.getElementById('data-btn');
const saveDataBtn = document.getElementById('save-data-btn');
const loadDataBtn = document.getElementById('load-data-btn');
const fileLoader = document.getElementById('file-loader');

dataBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  dataMenu.classList.toggle('hidden');
});

// 「進行状況を保存(ダウンロード)」の処理
saveDataBtn.addEventListener('click', () => {
  // ★変更: ローカルストレージの中断データも保存対象にする
  const activeGameState = localStorage.getItem('savedGame');
  const dataToSave = activeGameState ? JSON.parse(activeGameState) : gameState;

  if (Object.keys(dataToSave).length === 0) {
    alert("保存できる進行状況がありません。");
    return;
  }
  const dataStr = JSON.stringify(dataToSave, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `game-save-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  dataMenu.classList.add('hidden');
});

loadDataBtn.addEventListener('click', () => {
  fileLoader.click();
  dataMenu.classList.add('hidden');
});

fileLoader.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const restoredState = JSON.parse(e.target.result);
      if (restoredState.hp !== undefined && restoredState.turn !== undefined) {
        gameState = restoredState;
        // ★追加: 復元したデータを中断データとして保存
        localStorage.setItem('savedGame', JSON.stringify(gameState));
        updateUI();
        showScreen('ikusei-home');
        alert("進行状況を復旧しました。");
      } else {
        throw new Error("無効なセーブデータです。");
      }
    } catch (error) {
      alert("ファイルの読み込みに失敗しました。\n" + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
});

document.body.addEventListener('click', () => {
  dataMenu.classList.add('hidden');
});

// ===== 初期画面の設定 =====
showScreen("main--home");