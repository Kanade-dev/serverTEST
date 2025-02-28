const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
const gridSize = 20; // 1マスのサイズ
const colors = [ // テトリミノの色
    '#000000', // 0: 空
    '#FF0D72', // 1: T
    '#0DC2FF', // 2: I
    '#0DFF72', // 3: J
    '#F538FF', // 4: L
    '#FF8E0D', // 5: O
    '#FFE138', // 6: S
    '#38FFE1'  // 7: Z
];

let board = createBoard(); // ゲームボード
let tetromino = createTetromino(); // 現在操作中のテトリミノ
let tetrominoPosition = {x: 0, y: 0}; // テトリミノの位置
let score = 0; // スコア
let dropCounter = 0; // 落下カウンター
let dropInterval = 1000; // 落下間隔 (ミリ秒)
let lastTime = 0; // 前回の時間

// ゲームボードを作成
function createBoard() {
    return Array(canvas.height / gridSize).fill().map(() => Array(canvas.width / gridSize).fill(0));
}

// テトリミノをランダムに作成
function createTetromino() {
    const tetrominos = 'TJILOSZ';
    const randomTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return createPiece(randomTetromino);
}

// テトリミノの形状定義
function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ];
        case 'I':
            return [
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0]
            ];
        case 'J':
            return [
                [0, 0, 0],
                [3, 3, 3],
                [0, 0, 3]
            ];
        case 'L':
            return [
                [0, 0, 0],
                [4, 4, 4],
                [4, 0, 0]
            ];
        case 'O':
            return [
                [5, 5],
                [5, 5]
            ];
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ];
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ];
    }
}

// 描画処理
function draw() {
    context.fillStyle = '#000'; // 背景色
    context.fillRect(0, 0, canvas.width, canvas.height); // 背景を塗りつぶし

    drawBoard(); // ゲームボードを描画
    drawTetromino(); // テトリミノを描画
}

// ゲームボードを描画
function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value]; // ブロックの色を設定
                context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize); // ブロックを描画
                context.strokeStyle = '#888'; // ブロックの枠線の色
                context.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize); // ブロックの枠線を描画
            }
        });
    });
}

// テトリミノを描画
function drawTetromino() {
    tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value]; // テトリミノの色を設定
                context.fillRect((tetrominoPosition.x + x) * gridSize, (tetrominoPosition.y + y) * gridSize, gridSize, gridSize); // テトリミノを描画
                context.strokeStyle = '#888'; // テトリミノの枠線の色
                context.strokeRect((tetrominoPosition.x + x) * gridSize, (tetrominoPosition.y + y) * gridSize, gridSize, gridSize); // テトリミノの枠線を描画
            }
        });
    });
}

// ゲームループ
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        tetrominoPosition.y++; // テトリミノを下に移動
        dropCounter = 0;
        if (checkCollision()) { // 衝突判定
            tetrominoPosition.y--; // 衝突したら元の位置に戻す
            mergeTetromino(); // テトリミノをボードに固定
            clearLines(); // ライン消去
            tetromino = createTetromino(); // 新しいテトリミノを作成
            tetrominoPosition.x = 0; // テトリミノの初期位置をリセット
            tetrominoPosition.y = 0;
            if (checkGameOver()) { // ゲームオーバー判定
                board = createBoard(); // ゲームボードをリセット
                score = 0; // スコアをリセット
                alert("ゲームオーバー！ スコア: " + score); // アラート表示
            }
        }
    }

    draw(); // 描画処理
    requestAnimationFrame(update); // 次のフレームを要求
}

update(); // ゲームループ開始
