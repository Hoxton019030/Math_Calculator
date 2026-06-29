<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>十位數加減法 - 10題特訓</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #1e272e;
            color: #d2dae2;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            background: #2c3e50;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
            text-align: center;
            max-width: 800px;
            width: 100%;
            min-height: 400px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        h2 {
            margin-top: 0;
            color: #0fbcf9;
        }
        .progress {
            font-size: 20px;
            color: #808e9b;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .equation {
            font-family: 'Courier New', Courier, monospace;
            font-size: 40px;
            margin: 20px 0;
            letter-spacing: 2px;
            background: #1e272e;
            padding: 20px;
            border-radius: 8px;
            font-weight: bold;
        }
        .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .option-btn {
            background-color: #3c6382;
            color: white;
            border: 2px solid #3c6382;
            padding: 15px 10px;
            font-size: 24px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: monospace;
            font-weight: bold;
        }
        .option-btn:hover:not(:disabled) {
            background-color: #0a3d62;
            border-color: #0fbcf9;
            transform: translateY(-2px);
        }
        .option-btn.correct {
            background-color: #05c46b;
            border-color: #05c46b;
            color: white;
        }
        .option-btn.wrong {
            background-color: #ff3f34;
            border-color: #ff3f34;
            color: white;
        }
        .option-btn:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }
        .feedback {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            min-height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .countdown {
            font-size: 18px;
            color: #d2dae2;
            font-weight: normal;
        }
        .action-btn {
            background-color: #0fbcf9;
            color: #1e272e;
            border: none;
            padding: 15px 40px;
            font-size: 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 20px;
            transition: 0.2s;
        }
        .action-btn:hover {
            background-color: #4bcffa;
            transform: scale(1.05);
        }
        /* 錯誤檢討清單樣式 */
        .mistakes-box {
            background: #1e272e;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: left;
            max-height: 300px;
            overflow-y: auto;
        }
        .mistake-item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #3c6382;
        }
        .mistake-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .mistake-eq {
            font-family: 'Courier New', Courier, monospace;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        /* 畫面切換控制 */
        #gameScreen, #endScreen {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 開始畫面 -->
        <div id="startScreen">
            <h2>十位數加減法特訓</h2>
            <p style="font-size: 20px; color: #808e9b; margin-bottom: 40px;">
                每次挑戰 10 題。<br>答題後會顯示結果，3 秒後自動進入下一題。
            </p>
            <button class="action-btn" onclick="startGame()">開始測驗</button>
        </div>

        <!-- 遊戲畫面 -->
        <div id="gameScreen">
            <div class="progress" id="progressText">第 1 / 10 題</div>
            <div class="equation" id="equationBox">載入中...</div>
            <div id="feedback" class="feedback">請作答</div>
            <div class="options-grid" id="optionsContainer"></div>
        </div>

        <!-- 結算畫面 -->
        <div id="endScreen">
            <h2>測驗結束！</h2>
            <div class="equation" style="font-size: 48px; color: #0fbcf9;" id="finalScore"></div>
            <p id="evaluationText" style="font-size: 24px; margin-bottom: 20px;"></p>
            
            <!-- 錯誤檢討顯示區塊 -->
            <div id="mistakesContainer"></div>

            <button class="action-btn" onclick="startGame()">再挑戰一次</button>
        </div>
    </div>

    <script>
        let currentAnswer;
        let questionCount = 0;
        let correctCount = 0;
        const MAX_QUESTIONS = 10;
        const OPTION_COUNT = 12;
        let timerInterval;
        
        // 新增：用來記錄錯誤題目的陣列
        let mistakes = [];

        function getRandom2Digit() {
            let num = Math.floor(Math.random() * 100); 
            return Math.random() < 0.5 ? num : -num;
        }

        function formatOperand(num) {
            return num < 0 ? `(${num})` : num;
        }

        function generateDistractors(num1, num2, isAddition, correctAns, count) {
            let options = new Set();
            options.add(correctAns);

            options.add(-correctAns);

            let wrongOpAns = isAddition ? (num1 - num2) : (num1 + num2);
            options.add(wrongOpAns);
            options.add(-wrongOpAns);

            options.add(correctAns + 10);
            options.add(correctAns - 10);

            options.add(correctAns + 1);
            options.add(correctAns - 1);
            options.add(correctAns + 2);
            options.add(correctAns - 2);

            while (options.size < count) {
                let randomOffset = Math.floor(Math.random() * 41) - 20;
                options.add(correctAns + randomOffset);
            }

            let arr = Array.from(options);
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function startGame() {
            // 重置遊戲狀態
            questionCount = 0;
            correctCount = 0;
            mistakes = []; // 每次重新開始都要清空錯誤紀錄
            
            // 切換畫面
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('endScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            
            generateProblem();
        }

        function generateProblem() {
            questionCount++;
            document.getElementById('progressText').innerText = `第 ${questionCount} / ${MAX_QUESTIONS} 題`;
            document.getElementById('feedback').innerHTML = '請作答';

            let num1 = getRandom2Digit();
            let num2 = getRandom2Digit();
            let isAddition = Math.random() < 0.5;

            currentAnswer = isAddition ? num1 + num2 : num1 - num2;

            let operator = isAddition ? '+' : '-';
            let equationStr = `${formatOperand(num1)} ${operator} ${formatOperand(num2)} = ?`;
            document.getElementById('equationBox').innerText = equationStr;

            let choices = generateDistractors(num1, num2, isAddition, currentAnswer, OPTION_COUNT);
            renderOptions(choices);
        }

        function renderOptions(choices) {
            let container = document.getElementById('optionsContainer');
            container.innerHTML = ''; 

            choices.forEach(choice => {
                let btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerText = choice;
                btn.onclick = () => checkAnswer(btn, choice);
                container.appendChild(btn);
            });
        }

        function checkAnswer(btnElement, selectedValue) {
            // 避免重複點擊
            let allBtns = document.querySelectorAll('.option-btn');
            allBtns.forEach(b => b.disabled = true);

            let isCorrect = (selectedValue === currentAnswer);
            let feedback = document.getElementById('feedback');
            
            if (isCorrect) {
                btnElement.classList.add('correct');
                correctCount++;
                feedback.innerHTML = '<span style="color:#05c46b;">正確！</span>';
            } else {
                btnElement.classList.add('wrong');
                feedback.innerHTML = `<span style="color:#ff3f34;">算錯囉！答案是 ${currentAnswer}</span>`;
                
                // 新增：紀錄答錯的資訊
                let currentEquation = document.getElementById('equationBox').innerText.replace(' = ?', '');
                mistakes.push({
                    equation: currentEquation,
                    selected: selectedValue,
                    correct: currentAnswer
                });
                
                // 標示出正確答案
                allBtns.forEach(b => {
                    if (parseInt(b.innerText) === currentAnswer) {
                        b.classList.add('correct');
                        b.style.transform = 'scale(1.05)';
                        b.style.boxShadow = '0 0 10px #05c46b';
                    }
                });
            }

            // 啟動 1 秒自動跳轉 (為了測試節奏，這裡暫時維持你原本程式碼內的 1 秒設定)
            startAutoAdvance();
        }

        function startAutoAdvance() {
            let timeLeft = 1; // 改回 3 秒
            let feedback = document.getElementById('feedback');
            
            // 建立倒數計時顯示元素
            let countdownSpan = document.createElement('span');
            countdownSpan.className = 'countdown';
            countdownSpan.innerText = `(${timeLeft} 秒後下一題)`;
            feedback.appendChild(countdownSpan);

            // 清除之前的計時器（安全機制）
            if(timerInterval) clearInterval(timerInterval);

            timerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    countdownSpan.innerText = `(${timeLeft} 秒後下一題)`;
                } else {
                    clearInterval(timerInterval);
                    if (questionCount >= MAX_QUESTIONS) {
                        showEndScreen();
                    } else {
                        generateProblem();
                    }
                }
            }, 1000);
        }

        function showEndScreen() {
            document.getElementById('gameScreen').style.display = 'none';
            document.getElementById('endScreen').style.display = 'block';
            
            document.getElementById('finalScore').innerText = `${correctCount} / ${MAX_QUESTIONS}`;
            
            let evaluation = document.getElementById('evaluationText');
            let mistakesContainer = document.getElementById('mistakesContainer');
            
            if (correctCount === 10) {
                evaluation.innerHTML = '太神啦！<span style="color:#05c46b;">全對滿分！</span> 計算能力非常扎實。';
                mistakesContainer.innerHTML = ''; // 全對不顯示錯誤清單
            } else {
                if (correctCount >= 7) {
                    evaluation.innerText = '表現不錯！只差一點點就完美了，繼續保持！';
                } else {
                    evaluation.innerText = '沒關係，這本來就很吃專注力，多練習幾次一定會進步！';
                }
                
                // 新增：渲染錯誤檢討清單
                if (mistakes.length > 0) {
                    let html = '<h3 style="color: #ff3f34; margin: 10px 0 15px 0; font-size: 22px;">答錯的題目檢討：</h3>';
                    html += '<div class="mistakes-box">';
                    
                    mistakes.forEach((m, index) => {
                        html += `
                        <div class="mistake-item">
                            <div class="mistake-eq">${m.equation} = <span style="color:#05c46b;">${m.correct}</span></div>
                            <div style="color: #808e9b; font-size: 18px;">
                                你的選擇：<span style="color:#ff3f34; text-decoration: line-through;">${m.selected}</span>
                            </div>
                        </div>`;
                    });
                    
                    html += '</div>';
                    mistakesContainer.innerHTML = html;
                }
            }
        }
    </script>
</body>
</html>