const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
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

    // スコア表示を更新
    scoreElement.textContent = `スコア: ${score}`;
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
                context.strokeRect((tetrominoPosition.x + x) * gridSize, (tetromino.y + y) * gridSize, gridSize, gridSize); // テトリミノの枠線を描画
            }
        });
    });
}

// 衝突判定
function checkCollision() {
    const shape = tetromino.shape;
    const offsetX = tetrominoPosition.x;
    const offsetY = tetrominoPosition.y;
    for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < shape[y].length; ++x) {
            if (shape[y][x] !== 0) {
                let newX = offsetX + x;
                let newY = offsetY + y;

                // ゲームボードの範囲外に出た場合、またはブロックがある場合に衝突
                if (newY >= board.length ||
                    newX < 0 ||
                    newX >= board[0].length ||
                    board[newY][newX] !== 0) {
                    return true; // 衝突
                }
            }
        }
    }
    return false; // 衝突なし
}

// テトリミノをボードに固定
function mergeTetromino() {
    tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[tetrominoPosition.y + y][tetrominoPosition.x + x] = value; // テトリミノの色情報をボードにコピー
            }
        });
    });
}

// ライン消去
function clearLines() {
    let linesCleared = 0;
    outer: for (let y = board.length - 1; y > 0; --y) {
        for (let x = 0; x < board[0].length; ++x) {
            if (board[y][x] === 0) {
                continue outer; // 1行に0が含まれていたら、continue outer で次の行へ
            }
        }

        // ラインが揃っていたら消去
        const row = board.splice(y, 1)[0].fill(0); // y行目を削除して、削除した行を取得し、0で埋める
        board.unshift(row); // ボードの先頭に行を追加
        linesCleared++;
        y++; // 行を削除したので、同じy座標を再チェック (上の行が落ちてくるため)
    }

    if (linesCleared > 0) {
        score += linesCleared * 100; // スコア加算 (消したライン数 * 100)
        scoreElement.textContent = `スコア: ${score}`; // スコアを画面表示に更新
    }
}

// ゲームオーバー判定
function checkGameOver() {
    tetrominoPosition.y = 0; // テトリミノのY座標を初期位置 (0) に設定
    return checkCollision(); // 初期位置で衝突していたらゲームオーバー
}

// キー入力処理
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // 左キー
        moveTetromino(-1); // 左に移動
    } else if (event.keyCode === 39) { // 右キー
        moveTetromino(1); // 右に移動
    } else if (event.keyCode === 40) { // 下キー
        dropInterval = 50; // 落下速度を速くする
    } else if (event.keyCode === 38) { // 上キー (または回転キー)
        rotateTetromino(); // テトリミノを回転
    }
});

// キーを離した時の処理 (下キーを離したら落下速度を元に戻す)
document.addEventListener('keyup', event => {
    if (event.keyCode === 40) { // 下キーを離した
        dropInterval = 1000; // 落下速度を元に戻す
    }
});

// テトリミノを左右に移動
function moveTetromino(direction) {
    tetrominoPosition.x += direction;
    if (checkCollision()) { // 移動先に衝突する場合
        tetrominoPosition.x -= direction; // 元の位置に戻す
    }
}

// テトリミノを回転
function rotateTetromino() {
    const originalShape = tetromino.shape; // 回転前の形状を保存
    tetromino.shape = rotateMatrix(tetromino.shape); // テトリミノを回転
    if (checkCollision()) { // 回転後に衝突する場合
        tetromino.shape = originalShape; // 回転を元に戻す
    }
}

// 行列を時計回りに90度回転させる
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotatedMatrix = [];
    for (let j = 0; j < cols; ++j) {
        rotatedMatrix[j] = []; // 新しい行を作成
        for (let i = rows - 1; i >= 0; --i) {
            rotatedMatrix[j].push(matrix[i][j]); // 元の行列の要素を新しい行列に追加 (転置と反転)
        }
    }
    return rotatedMatrix;
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
                scoreElement.textContent = `スコア: ${score}`; // スコアを画面表示に更新
                alert("ゲームオーバー！ スコア: " + score); // アラート表示
            }
        }
    }

    draw(); // 描画処理
    requestAnimationFrame(update); // 次のフレームを要求
}

update(); // ゲームループ開始
