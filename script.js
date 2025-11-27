// 全局变量
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = null;
let timerInterval = null;
let selectedLibraryIds = new Set();
let convertedData = null; // 存储转换后的数据
let questionsShuffledOptions = new Map(); // 存储每道题目的选项顺序
let shortAnswerAnswerShown = new Map(); // 记录简答题是否已显示答案

// DOM元素
const elements = {
    // 标签页
    convertTab: document.getElementById('convertTab'),
    practiceTab: document.getElementById('practiceTab'),
    historyTab: document.getElementById('historyTab'),
    convertSection: document.getElementById('convertSection'),
    practiceSection: document.getElementById('practiceSection'),
    historySection: document.getElementById('historySection'),
    quizSection: document.getElementById('quizSection'),
    resultSection: document.getElementById('resultSection'),
    
    // Excel转JSON
    excelFile: document.getElementById('excelFile'),
    excelFileName: document.getElementById('excelFileName'),
    convertBtn: document.getElementById('convertBtn'),
    convertResult: document.getElementById('convertResult'),
    
    // JSON上传
    jsonFiles: document.getElementById('jsonFiles'),
    jsonFileNames: document.getElementById('jsonFileNames'),
    uploadJsonBtn: document.getElementById('uploadJsonBtn'),
    libraryList: document.getElementById('libraryList'),
    practiceControls: document.querySelector('.practice-controls'),
    
    // 练习设置
    shuffleQuestions: document.getElementById('shuffleQuestions'),
    shuffleOptions: document.getElementById('shuffleOptions'),
    difficultyFilter: document.getElementById('difficultyFilter'),
    questionTypeFilter: document.getElementById('questionTypeFilter'),
    startPracticeBtn: document.getElementById('startPracticeBtn'),
    
    // 测验界面
    questionProgress: document.getElementById('questionProgress'),
    timer: document.getElementById('timer'),
    progressFill: document.getElementById('progressFill'),
    questionType: document.getElementById('questionType'),
    questionDifficulty: document.getElementById('questionDifficulty'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    submitBtn: document.getElementById('submitBtn'),
    explanation: document.getElementById('explanation'),
    explanationText: document.getElementById('explanationText'),
    
    // 结果页面
    correctRate: document.getElementById('correctRate'),
    totalQuestions: document.getElementById('totalQuestions'),
    correctCount: document.getElementById('correctCount'),
    totalTime: document.getElementById('totalTime'),
    reviewBtn: document.getElementById('reviewBtn'),
    restartBtn: document.getElementById('restartBtn'),
    backToLibraryBtn: document.getElementById('backToLibraryBtn'),
    reviewContainer: document.getElementById('reviewContainer'),
    reviewList: document.getElementById('reviewList'),
    
    // 历史分数
    clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),
    totalHistoryCount: document.getElementById('totalHistoryCount'),
    historyList: document.getElementById('historyList')
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadLibraryFromStorage();
    loadHistoryFromStorage();
});

// 事件监听器初始化
function initializeEventListeners() {
    // 标签页切换
    elements.convertTab.addEventListener('click', () => switchTab('convert'));
    elements.practiceTab.addEventListener('click', () => switchTab('practice'));
    elements.historyTab.addEventListener('click', () => switchTab('history'));
    
    // Excel文件选择
    elements.excelFile.addEventListener('change', handleExcelFileSelect);
    elements.convertBtn.addEventListener('click', convertExcelToJson);
    
    // JSON文件上传
    elements.jsonFiles.addEventListener('change', handleJsonFileSelect);
    elements.uploadJsonBtn.addEventListener('click', uploadJsonFiles);
    
    // 练习控制
    elements.startPracticeBtn.addEventListener('click', startPractice);
    
    // 测验导航
    elements.prevBtn.addEventListener('click', previousQuestion);
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.submitBtn.addEventListener('click', submitQuiz);
    
    // 结果页面
    elements.reviewBtn.addEventListener('click', toggleReview);
    elements.restartBtn.addEventListener('click', restartPractice);
    elements.backToLibraryBtn.addEventListener('click', backToLibrary);
    
    // 历史分数
    elements.clearAllHistoryBtn.addEventListener('click', clearAllHistory);
}

// 标签页切换
function switchTab(tab) {
    // 移除所有active类
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    if (tab === 'convert') {
        elements.convertTab.classList.add('active');
        elements.convertSection.classList.add('active');
        elements.convertSection.style.display = 'block';
    } else if (tab === 'practice') {
        elements.practiceTab.classList.add('active');
        elements.practiceSection.classList.add('active');
        elements.practiceSection.style.display = 'block';
    } else if (tab === 'history') {
        elements.historyTab.classList.add('active');
        elements.historySection.classList.add('active');
        elements.historySection.style.display = 'block';
        loadHistoryFromStorage(); // 每次切换到历史页面时重新加载
    }
}

// Excel文件处理
function handleExcelFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        elements.excelFileName.textContent = `已选择: ${file.name}`;
        elements.convertBtn.disabled = false;
    } else {
        elements.excelFileName.textContent = '';
        elements.convertBtn.disabled = true;
    }
}

// Excel转JSON
function convertExcelToJson() {
    const file = elements.excelFile.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const result = {};
            
            // 处理每个工作表
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // 跳过前3行表头
                const questionsData = jsonData.slice(3);
                
                const questions = [];
                let currentStandardFile = '';
                let currentPage = '';
                
                questionsData.forEach((row, index) => {
                    // 处理合并单元格的逻辑
                    if (row[3]) { // D列 - 对应标准文件
                        currentStandardFile = row[3];
                    }
                    if (row[4]) { // E列 - 页码
                        currentPage = row[4];
                    }
                    
                    // 如果有题目描述，则创建题目对象
                    if (row[5]) { // F列 - 题型
                        const question = {
                            id: questions.length + 1,
                            standardFile: currentStandardFile,
                            page: currentPage,
                            type: row[5], // 题型
                            description: row[6], // 题目描述
                            options: {
                                A: row[7],
                                B: row[8],
                                C: row[9],
                                D: row[10],
                                E: row[11]
                            },
                            correctAnswer: row[12], // 标准答案
                            difficulty: row[13] || '中' // 难度
                        };
                        
                        // 清理空选项
                        Object.keys(question.options).forEach(key => {
                            if (!question.options[key]) {
                                delete question.options[key];
                            }
                        });
                        
                        questions.push(question);
                    }
                });
                
                result[sheetName] = questions;
            });
            
            // 显示转换结果
            displayConvertResult(result);
            
        } catch (error) {
            showMessage('转换失败: ' + error.message, 'error');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// 显示转换结果
function displayConvertResult(result) {
    const totalQuestions = Object.values(result).reduce((sum, questions) => sum + questions.length, 0);
    const sheetCount = Object.keys(result).length;
    
    // 存储转换结果到全局变量
    convertedData = result;
    
    elements.convertResult.innerHTML = `
        <div class="success-message">
            <h4>转换成功！</h4>
            <p>共转换 ${sheetCount} 个工作表，${totalQuestions} 道题目</p>
            <button onclick="downloadConvertedJson()" class="action-btn primary">下载JSON文件</button>
        </div>
    `;
}

// 下载转换后的JSON文件
function downloadConvertedJson() {
    if (!convertedData) {
        showMessage('没有可下载的数据', 'error');
        return;
    }
    
    const jsonString = JSON.stringify(convertedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `题库_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 下载JSON文件（保留原函数以备其他用途）
function downloadJson(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `题库_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// JSON文件选择处理
function handleJsonFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        elements.jsonFileNames.textContent = `已选择: ${fileNames}`;
        elements.uploadJsonBtn.disabled = false;
    } else {
        elements.jsonFileNames.textContent = '';
        elements.uploadJsonBtn.disabled = true;
    }
}

// 上传JSON文件
async function uploadJsonFiles() {
    const files = elements.jsonFiles.files;
    if (files.length === 0) return;
    
    const uploadPromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const library = {
                        id: Date.now() + Math.random(),
                        name: file.name.replace('.json', ''),
                        fileName: file.name,
                        uploadTime: new Date().toISOString(),
                        data: data,
                        questionCount: Object.values(data).reduce((sum, questions) => sum + questions.length, 0)
                    };
                    resolve(library);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    });
    
    try {
        const libraries = await Promise.all(uploadPromises);
        
        // 保存到本地存储
        libraries.forEach(library => {
            saveLibraryToStorage(library);
        });
        
        // 刷新题库列表
        loadLibraryFromStorage();
        
        // 清空文件选择
        elements.jsonFiles.value = '';
        elements.jsonFileNames.textContent = '';
        elements.uploadJsonBtn.disabled = true;
        
        showMessage(`成功上传 ${libraries.length} 个题库文件`, 'success');
        
    } catch (error) {
        showMessage('上传失败: ' + error.message, 'error');
    }
}

// 保存题库到本地存储
function saveLibraryToStorage(library) {
    let libraries = JSON.parse(localStorage.getItem('questionLibraries') || '[]');
    libraries.push(library);
    localStorage.setItem('questionLibraries', JSON.stringify(libraries));
}

// 从本地存储加载题库
function loadLibraryFromStorage() {
    const libraries = JSON.parse(localStorage.getItem('questionLibraries') || '[]');
    displayLibraryList(libraries);
}

// 显示题库列表
function displayLibraryList(libraries) {
    if (libraries.length === 0) {
        elements.libraryList.innerHTML = '<p style="color: #6c757d; text-align: center;">暂无题库，请先上传JSON文件</p>';
        elements.practiceControls.style.display = 'none';
        return;
    }
    
    elements.libraryList.innerHTML = libraries.map(library => `
        <div class="library-item" data-id="${library.id}" onclick="toggleLibrarySelection(${library.id})">
            <h4>${library.name}</h4>
            <p>文件名: ${library.fileName}</p>
            <p>上传时间: ${new Date(library.uploadTime).toLocaleString()}</p>
            <p class="question-count">题目数量: ${library.questionCount} 道</p>
            <button onclick="deleteLibrary(${library.id}, event)" class="action-btn" style="margin-top: 10px; padding: 8px 16px; font-size: 14px;">删除</button>
        </div>
    `).join('');
    
    elements.practiceControls.style.display = 'block';
}

// 切换题库选择
function toggleLibrarySelection(libraryId) {
    const libraryItem = document.querySelector(`.library-item[data-id="${libraryId}"]`);
    
    if (selectedLibraryIds.has(libraryId)) {
        selectedLibraryIds.delete(libraryId);
        libraryItem.classList.remove('selected');
    } else {
        selectedLibraryIds.add(libraryId);
        libraryItem.classList.add('selected');
    }
    
    // 更新开始练习按钮状态
    elements.startPracticeBtn.disabled = selectedLibraryIds.size === 0;
}

// 删除题库
function deleteLibrary(libraryId, event) {
    event.stopPropagation();
    
    if (confirm('确定要删除这个题库吗？')) {
        let libraries = JSON.parse(localStorage.getItem('questionLibraries') || '[]');
        libraries = libraries.filter(lib => lib.id !== libraryId);
        localStorage.setItem('questionLibraries', JSON.stringify(libraries));
        
        selectedLibraryIds.delete(libraryId);
        loadLibraryFromStorage();
        
        showMessage('题库已删除', 'success');
    }
}

// 开始练习
function startPractice() {
    if (selectedLibraryIds.size === 0) return;
    
    // 获取选中的题库
    const libraries = JSON.parse(localStorage.getItem('questionLibraries') || '[]');
    const selectedLibraries = libraries.filter(lib => selectedLibraryIds.has(lib.id));
    
    // 合并所有题目
    let allQuestions = [];
    selectedLibraries.forEach(library => {
        Object.values(library.data).forEach(questions => {
            allQuestions = allQuestions.concat(questions);
        });
    });
    
    // 应用筛选条件
    const difficultyFilter = elements.difficultyFilter.value;
    const typeFilter = elements.questionTypeFilter.value;
    
    if (difficultyFilter !== 'all') {
        allQuestions = allQuestions.filter(q => q.difficulty === difficultyFilter);
    }
    
    if (typeFilter !== 'all') {
        allQuestions = allQuestions.filter(q => q.type === typeFilter);
    }
    
    if (allQuestions.length === 0) {
        showMessage('没有符合条件的题目', 'warning');
        return;
    }
    
    // 随机打乱题目顺序
    if (elements.shuffleQuestions.checked) {
        allQuestions = shuffleArray(allQuestions);
    }
    
    currentQuestions = allQuestions;
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    questionsShuffledOptions.clear(); // 清空之前的选项顺序记录
    shortAnswerAnswerShown.clear(); // 清空简答题答案显示状态
    startTime = Date.now();
    
    // 切换到测验界面
    switchToQuiz();
    
    // 显示第一题
    displayQuestion();
    
    // 开始计时
    startTimer();
}

// 切换到测验界面
function switchToQuiz() {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    elements.quizSection.style.display = 'block';
    elements.quizSection.classList.add('active');
}

// 显示题目
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // 更新进度
    elements.questionProgress.textContent = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    elements.progressFill.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;
    
    // 更新题目信息
    elements.questionType.textContent = question.type;
    elements.questionDifficulty.textContent = question.difficulty;
    elements.questionText.textContent = question.description;
    
    // 显示选项
    displayOptions(question);
    
    // 更新按钮状态
    elements.prevBtn.disabled = currentQuestionIndex === 0;
    
    // 检查是否是简答题或填空题且已经显示过答案
    const questionId = `${currentQuestionIndex}_${question.id || question.description}`;
    if ((question.type === '简答题' || question.type === '填空题') && shortAnswerAnswerShown.has(questionId)) {
        elements.nextBtn.textContent = '查看答案后继续';
    } else {
        elements.nextBtn.textContent = currentQuestionIndex === currentQuestions.length - 1 ? '提交' : '下一题';
    }
    
    elements.submitBtn.style.display = currentQuestionIndex === currentQuestions.length - 1 ? 'inline-block' : 'none';
    
    // 隐藏解释
    elements.explanation.style.display = 'none';
}

// 显示选项
function displayOptions(question) {
    // 简答题和填空题特殊处理
    if (question.type === '简答题' || question.type === '填空题') {
        const userAnswer = userAnswers[currentQuestionIndex] || '';
        const placeholder = question.type === '填空题' ? '请填入答案...' : '请输入你的答案...';
        elements.optionsContainer.innerHTML = `
            <div class="short-answer-container">
                <textarea id="shortAnswerInput"
                          class="short-answer-input"
                          placeholder="${placeholder}"
                          rows="4"
                          oninput="handleShortAnswerInput()">${userAnswer}</textarea>
            </div>
        `;
        return;
    }
    
    const options = Object.entries(question.options);
    const questionId = `${currentQuestionIndex}_${question.id || question.description}`;
    
    // 检查是否已经为这道题目确定了选项顺序
    if (!questionsShuffledOptions.has(questionId)) {
        let displayOptions = options;
        
        // 随机打乱选项顺序（仅在首次显示时）
        if (elements.shuffleOptions.checked) {
            displayOptions = shuffleArray(options);
        }
        
        // 存储选项顺序
        questionsShuffledOptions.set(questionId, displayOptions);
    }
    
    const displayOptions = questionsShuffledOptions.get(questionId);
    const isMultipleChoice = question.type === '多选题';
    const inputType = isMultipleChoice ? 'checkbox' : 'radio';
    
    elements.optionsContainer.innerHTML = displayOptions.map(([key, text], index) => {
        const originalKey = options.findIndex(([k]) => k === key) + 1;
        const isChecked = userAnswers[currentQuestionIndex] &&
                         (isMultipleChoice ?
                          userAnswers[currentQuestionIndex].includes(key) :
                          userAnswers[currentQuestionIndex] === key);
        
        return `
            <div class="option-item ${isChecked ? 'selected' : ''}" onclick="selectOption('${key}', ${isMultipleChoice})">
                <input type="${inputType}"
                       id="option_${index}"
                       name="question_options"
                       value="${key}"
                       ${isChecked ? 'checked' : ''}
                       onchange="selectOption('${key}', ${isMultipleChoice})">
                <label for="option_${index}" class="option-text">${text}</label>
            </div>
        `;
    }).join('');
}

// 选择选项
function selectOption(optionKey, isMultipleChoice) {
    if (isMultipleChoice) {
        // 多选题逻辑
        if (!userAnswers[currentQuestionIndex]) {
            userAnswers[currentQuestionIndex] = [];
        }
        
        const index = userAnswers[currentQuestionIndex].indexOf(optionKey);
        if (index > -1) {
            userAnswers[currentQuestionIndex].splice(index, 1);
        } else {
            userAnswers[currentQuestionIndex].push(optionKey);
        }
    } else {
        // 单选题逻辑
        userAnswers[currentQuestionIndex] = optionKey;
    }
    
    // 只更新选中状态，不重新打乱选项
    updateOptionSelection(optionKey, isMultipleChoice);
}

// 保存简答题答案
function saveShortAnswer() {
    const shortAnswerInput = document.getElementById('shortAnswerInput');
    if (shortAnswerInput) {
        userAnswers[currentQuestionIndex] = shortAnswerInput.value.trim();
    }
}

// 处理简答题输入
function handleShortAnswerInput() {
    const shortAnswerInput = document.getElementById('shortAnswerInput');
    if (shortAnswerInput) {
        // 保存用户输入的答案
        userAnswers[currentQuestionIndex] = shortAnswerInput.value.trim();
    }
}

// 更新选项选中状态（不重新打乱选项）
function updateOptionSelection(optionKey, isMultipleChoice) {
    const question = currentQuestions[currentQuestionIndex];
    const questionId = `${currentQuestionIndex}_${question.id || question.description}`;
    const displayOptions = questionsShuffledOptions.get(questionId);
    const options = Object.entries(question.options);
    
    const isMultipleChoiceType = question.type === '多选题';
    
    elements.optionsContainer.querySelectorAll('.option-item').forEach((item, index) => {
        const [key] = displayOptions[index];
        const isChecked = userAnswers[currentQuestionIndex] &&
                         (isMultipleChoiceType ?
                          userAnswers[currentQuestionIndex].includes(key) :
                          userAnswers[currentQuestionIndex] === key);
        
        if (isChecked) {
            item.classList.add('selected');
            item.querySelector('input').checked = true;
        } else {
            item.classList.remove('selected');
            item.querySelector('input').checked = false;
        }
    });
}

// 上一题
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// 下一题
function nextQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // 如果是简答题或填空题，先保存答案
    if (question.type === '简答题' || question.type === '填空题') {
        saveShortAnswer();
        
        // 检查是否已经显示过答案
        const questionId = `${currentQuestionIndex}_${question.id || question.description}`;
        if (!shortAnswerAnswerShown.has(questionId)) {
            // 第一次点击，显示答案
            showShortAnswerExplanation(question);
            shortAnswerAnswerShown.set(questionId, true);
            return; // 不跳转到下一题，让用户查看答案
        } else {
            // 第二次点击，清除显示状态并跳转到下一题
            shortAnswerAnswerShown.delete(questionId);
        }
    }
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        // 最后一题，显示提交按钮
        submitQuiz();
    }
}

// 显示简答题答案
function showShortAnswerExplanation(question) {
    const userAnswer = userAnswers[currentQuestionIndex] || '未作答';
    const correctAnswer = question.correctAnswer || '无标准答案';
    
    elements.explanationText.innerHTML = `
        <div class="short-answer-review">
            <p><strong>你的答案：</strong>${userAnswer}</p>
            <p><strong>参考答案：</strong>${correctAnswer}</p>
        </div>
    `;
    
    elements.explanation.style.display = 'block';
    
    // 修改下一题按钮文本，提示用户查看答案后继续
    elements.nextBtn.textContent = '查看答案后继续';
}

// 提交测验
function submitQuiz() {
    if (!confirm('确定要提交答案吗？')) return;
    
    stopTimer();
    
    // 计算结果
    const results = calculateResults();
    
    // 显示结果
    displayResults(results);
    
    // 切换到结果页面
    switchToResults();
}

// 计算结果
function calculateResults() {
    let correctCount = 0;
    let gradedQuestionsCount = 0; // 不包括简答题的题目数量
    const detailedResults = [];
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correctAnswer;
        
        // 简答题和填空题不计分，但仍显示在结果中
        if (question.type === '简答题' || question.type === '填空题') {
            detailedResults.push({
                question: question,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: null // 简答题和填空题不标记对错
            });
        } else {
            const isCorrect = checkAnswer(question, userAnswer, correctAnswer);
            
            if (isCorrect) {
                correctCount++;
            }
            
            gradedQuestionsCount++; // 只有非简答题才计入总分
            
            detailedResults.push({
                question: question,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect
            });
        }
    });
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    return {
        totalQuestions: currentQuestions.length,
        gradedQuestionsCount: gradedQuestionsCount, // 实际计分的题目数量
        correctCount: correctCount,
        correctRate: gradedQuestionsCount > 0 ? Math.round((correctCount / gradedQuestionsCount) * 100) : 0,
        totalTime: totalTime,
        detailedResults: detailedResults
    };
}

// 检查答案
function checkAnswer(question, userAnswer, correctAnswer) {
    if (!userAnswer) return false;
    
    if (question.type === '多选题') {
        if (!Array.isArray(userAnswer)) return false;
        
        const userSet = new Set(userAnswer.sort());
        // 处理连续字母组合的标准答案（如"ABC"）
        const correctSet = new Set(correctAnswer.split('').map(a => a.trim()).sort());
        
        if (userSet.size !== correctSet.size) return false;
        
        for (let item of userSet) {
            if (!correctSet.has(item)) return false;
        }
        
        return true;
    } else {
        return userAnswer === correctAnswer;
    }
}

// 显示结果
function displayResults(results) {
    elements.totalQuestions.textContent = results.totalQuestions;
    elements.correctCount.textContent = results.correctCount;
    elements.correctRate.textContent = results.correctRate + '%';
    elements.totalTime.textContent = formatTime(results.totalTime);
    
    // 如果有简答题或填空题，显示说明
    if (results.gradedQuestionsCount < results.totalQuestions) {
        const nonGradedCount = results.totalQuestions - results.gradedQuestionsCount;
        const scoreNote = document.createElement('p');
        scoreNote.textContent = `注：包含${nonGradedCount}道简答题/填空题，不计入分数统计`;
        scoreNote.style.fontSize = '14px';
        scoreNote.style.color = '#6c757d';
        scoreNote.style.marginTop = '10px';
        
        // 添加到正确率后面
        elements.correctRate.parentNode.appendChild(scoreNote);
    }
    
    // 存储详细结果供查看
    window.currentResults = results;
    
    // 自动保存分数到历史记录
    autoSaveScoreToHistory(results);
}

// 切换到结果页面
function switchToResults() {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    elements.resultSection.style.display = 'block';
    elements.resultSection.classList.add('active');
}

// 切换查看答案
function toggleReview() {
    if (elements.reviewContainer.style.display === 'none') {
        displayDetailedResults();
        elements.reviewContainer.style.display = 'block';
        elements.reviewBtn.textContent = '隐藏答案';
    } else {
        elements.reviewContainer.style.display = 'none';
        elements.reviewBtn.textContent = '查看答案';
    }
}

// 显示详细结果
function displayDetailedResults() {
    const results = window.currentResults;
    
    elements.reviewList.innerHTML = results.detailedResults.map((result, index) => {
        const statusClass = result.isCorrect ? 'correct' : 'incorrect';
        const statusText = result.isCorrect ? '✓ 正确' : '✗ 错误';
        
        const userAnswerText = result.userAnswer ? 
            (Array.isArray(result.userAnswer) ? result.userAnswer.join(', ') : result.userAnswer) : 
            '未作答';
        
        // 获取选项内容而不是选项键
        const getOptionText = (optionKey) => {
            if (optionKey && result.question.options && result.question.options[optionKey]) {
                return result.question.options[optionKey];
            }
            return optionKey;
        };
        
        // 处理多选题答案
        const formatAnswer = (answer) => {
            if (!answer) return '未作答';
            
            if (Array.isArray(answer)) {
                return answer.map(key => getOptionText(key)).join(', ');
            } else {
                return getOptionText(answer);
            }
        };
        
        // 处理正确答案（可能是连续字母组合或逗号分隔的字符串）
        const formatCorrectAnswer = (answer) => {
            if (!answer) return '无正确答案';
            
            // 检查是否为连续字母组合（如"ABC"）
            if (answer.includes(',') || answer.length > 1 && /^[A-E]+$/.test(answer)) {
                // 处理连续字母组合
                const letters = answer.includes(',') ?
                    answer.split(',').map(key => key.trim()) :
                    answer.split('');
                return letters.map(key => getOptionText(key)).join(', ');
            } else {
                return getOptionText(answer);
            }
        };
        
        // 简答题和填空题特殊处理
        if (result.question.type === '简答题' || result.question.type === '填空题') {
            const userAnswer = result.userAnswer || '未作答';
            const correctAnswer = result.correctAnswer || '无标准答案';
            
            return `
                <div class="review-item short-answer-review-item">
                    <div class="review-question">
                        ${index + 1}. ${result.question.description}
                    </div>
                    <div class="review-answer">
                        <span>你的答案: ${userAnswer}</span>
                        <span>参考答案: ${correctAnswer}</span>
                        <span>不计分</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="review-item ${statusClass}">
                <div class="review-question">
                    ${index + 1}. ${result.question.description}
                </div>
                <div class="review-answer">
                    <span>你的答案: ${formatAnswer(result.userAnswer)}</span>
                    <span>正确答案: ${formatCorrectAnswer(result.correctAnswer)}</span>
                    <span>${statusText}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 重新练习
function restartPractice() {
    if (confirm('确定要重新练习吗？')) {
        startPractice();
    }
}

// 返回题库
function backToLibrary() {
    // 重置状态
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    selectedLibraryIds.clear();
    questionsShuffledOptions.clear();
    shortAnswerAnswerShown.clear(); // 清空简答题答案显示状态
    
    // 停止计时器
    stopTimer();
    
    // 使用switchTab函数确保标签页状态正确
    switchTab('practice');
    
    // 重新加载题库列表
    loadLibraryFromStorage();
}

// 计时器功能
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        elements.timer.textContent = formatTime(elapsed);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 工具函数：数组随机打乱
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 显示消息
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
    `;
    
    // 设置背景色
    switch (type) {
        case 'success':
            messageDiv.style.background = '#28a745';
            break;
        case 'error':
            messageDiv.style.background = '#dc3545';
            break;
        case 'warning':
            messageDiv.style.background = '#ffc107';
            messageDiv.style.color = '#212529';
            break;
        default:
            messageDiv.style.background = '#17a2b8';
    }
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// 历史分数相关函数

// 自动保存分数到历史记录
function autoSaveScoreToHistory(results) {
    if (!results) {
        return;
    }
    
    // 获取选中的题库名称
    const libraries = JSON.parse(localStorage.getItem('questionLibraries') || '[]');
    const selectedLibraries = libraries.filter(lib => selectedLibraryIds.has(lib.id));
    const libraryNames = selectedLibraries.map(lib => lib.name);
    
    // 获取筛选条件
    const difficultyFilter = elements.difficultyFilter.value;
    const questionTypeFilter = elements.questionTypeFilter.value;
    
    // 创建历史记录对象
    const historyRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        totalQuestions: results.totalQuestions,
        correctCount: results.correctCount,
        correctRate: results.correctRate,
        totalTime: results.totalTime,
        libraryNames: libraryNames,
        difficulty: difficultyFilter === 'all' ? '所有难度' : difficultyFilter,
        questionType: questionTypeFilter === 'all' ? '所有题型' : questionTypeFilter
    };
    
    // 保存到本地存储
    let history = JSON.parse(localStorage.getItem('scoreHistory') || '[]');
    history.unshift(historyRecord); // 新记录添加到开头
    localStorage.setItem('scoreHistory', JSON.stringify(history));
    
    showMessage('分数已自动保存到历史记录', 'success');
}

// 保存分数到历史记录（保留原函数以备其他用途）
function saveScoreToHistory() {
    const results = window.currentResults;
    if (!results) {
        showMessage('没有可保存的分数', 'error');
        return;
    }
    
    autoSaveScoreToHistory(results);
}

// 从本地存储加载历史记录
function loadHistoryFromStorage() {
    const history = JSON.parse(localStorage.getItem('scoreHistory') || '[]');
    displayHistoryList(history);
}

// 显示历史记录列表
function displayHistoryList(history) {
    elements.totalHistoryCount.textContent = history.length;
    
    if (history.length === 0) {
        elements.historyList.innerHTML = '<p style="color: #6c757d; text-align: center;">暂无历史记录</p>';
        return;
    }
    
    elements.historyList.innerHTML = history.map(record => {
        const date = new Date(record.date);
        const dateStr = date.toLocaleString('zh-CN');
        const timeStr = formatTime(record.totalTime);
        
        return `
            <div class="history-item" data-id="${record.id}">
                <div class="history-header">
                    <div class="history-date">${dateStr}</div>
                    <button onclick="deleteHistoryRecord(${record.id})" class="delete-btn">删除</button>
                </div>
                <div class="history-content">
                    <div class="history-score">
                        <span class="score-label">正确率:</span>
                        <span class="score-value">${record.correctRate}%</span>
                    </div>
                    <div class="history-details">
                        <span>总题数: ${record.totalQuestions}</span>
                        <span>正确数: ${record.correctCount}</span>
                        <span>用时: ${timeStr}</span>
                    </div>
                    <div class="history-libraries">
                        <span>题库: ${record.libraryNames.join(', ')}</span>
                    </div>
                    <div class="history-filters">
                        <span>难度: ${record.difficulty}</span>
                        <span>题型: ${record.questionType}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 删除单条历史记录
function deleteHistoryRecord(recordId) {
    if (confirm('确定要删除这条历史记录吗？')) {
        let history = JSON.parse(localStorage.getItem('scoreHistory') || '[]');
        history = history.filter(record => record.id !== recordId);
        localStorage.setItem('scoreHistory', JSON.stringify(history));
        
        loadHistoryFromStorage();
        showMessage('历史记录已删除', 'success');
    }
}

// 清空所有历史记录
function clearAllHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
        localStorage.removeItem('scoreHistory');
        loadHistoryFromStorage();
        showMessage('所有历史记录已清空', 'success');
    }
}