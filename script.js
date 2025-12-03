// 全局变量
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let userScores = []; // 存储用户对简答题和填空题的自评分数
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
    wrongQuestionsTab: document.getElementById('wrongQuestionsTab'),
    savedPracticeTab: document.getElementById('savedPracticeTab'),
    historyTab: document.getElementById('historyTab'),
    convertSection: document.getElementById('convertSection'),
    practiceSection: document.getElementById('practiceSection'),
    wrongQuestionsSection: document.getElementById('wrongQuestionsSection'),
    savedPracticeSection: document.getElementById('savedPracticeSection'),
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
    showAnswerImmediately: document.getElementById('showAnswerImmediately'),
    enableRandomCount: document.getElementById('enableRandomCount'),
    randomQuestionCount: document.getElementById('randomQuestionCount'),
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
    saveProgressBtn: document.getElementById('saveProgressBtn'),
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
    historyList: document.getElementById('historyList'),
    
    // 错题练习
    totalWrongQuestionsCount: document.getElementById('totalWrongQuestionsCount'),
    clearAllWrongQuestionsBtn: document.getElementById('clearAllWrongQuestionsBtn'),
    wrongQuestionsList: document.getElementById('wrongQuestionsList'),
    wrongPracticeControls: document.querySelector('.wrong-practice-controls'),
    shuffleWrongQuestions: document.getElementById('shuffleWrongQuestions'),
    shuffleWrongOptions: document.getElementById('shuffleWrongOptions'),
    showWrongAnswerImmediately: document.getElementById('showWrongAnswerImmediately'),
    wrongDifficultyFilter: document.getElementById('wrongDifficultyFilter'),
    wrongQuestionTypeFilter: document.getElementById('wrongQuestionTypeFilter'),
    startWrongPracticeBtn: document.getElementById('startWrongPracticeBtn'),
    
    // 暂存练习
    totalSavedPracticeCount: document.getElementById('totalSavedPracticeCount'),
    clearAllSavedPracticeBtn: document.getElementById('clearAllSavedPracticeBtn'),
    savedPracticeList: document.getElementById('savedPracticeList'),
    
    // 历史记录详情
    historyDetailSection: document.getElementById('historyDetailSection'),
    backToHistoryBtn: document.getElementById('backToHistoryBtn'),
    historyDetailInfo: document.getElementById('historyDetailInfo'),
    historyDetailStats: document.getElementById('historyDetailStats'),
    showCorrectOnly: document.getElementById('showCorrectOnly'),
    questionTypeFilterDetail: document.getElementById('questionTypeFilterDetail'),
    historyDetailList: document.getElementById('historyDetailList')
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadLibraryFromStorage();
    loadWrongQuestionsFromStorage(); // 加载错题数据
    loadSavedPracticeFromStorage(); // 加载暂存练习数据
    loadHistoryFromStorage();
});

// 事件监听器初始化
function initializeEventListeners() {
    // 标签页切换
    elements.convertTab.addEventListener('click', () => switchTab('convert'));
    elements.practiceTab.addEventListener('click', () => switchTab('practice'));
    elements.wrongQuestionsTab.addEventListener('click', () => switchTab('wrongQuestions'));
    elements.savedPracticeTab.addEventListener('click', () => switchTab('savedPractice'));
    elements.historyTab.addEventListener('click', () => switchTab('history'));
    
    // Excel文件选择
    elements.excelFile.addEventListener('change', handleExcelFileSelect);
    elements.convertBtn.addEventListener('click', convertExcelToJson);
    
    // JSON文件上传
    elements.jsonFiles.addEventListener('change', handleJsonFileSelect);
    elements.uploadJsonBtn.addEventListener('click', uploadJsonFiles);
    
    // 练习控制
    elements.startPracticeBtn.addEventListener('click', startPractice);
    
    // 随机抽取功能
    elements.enableRandomCount.addEventListener('change', function() {
        if (this.checked) {
            elements.randomQuestionCount.focus();
        }
    });
    
    // 错题练习控制
    elements.startWrongPracticeBtn.addEventListener('click', startWrongPractice);
    elements.clearAllWrongQuestionsBtn.addEventListener('click', clearAllWrongQuestions);
    
    // 测验导航
    elements.prevBtn.addEventListener('click', previousQuestion);
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.saveProgressBtn.addEventListener('click', savePracticeProgress);
    elements.submitBtn.addEventListener('click', submitQuiz);
    
    // 结果页面
    elements.reviewBtn.addEventListener('click', toggleReview);
    elements.restartBtn.addEventListener('click', restartPractice);
    elements.backToLibraryBtn.addEventListener('click', backToLibrary);
    
    // 历史分数
    elements.clearAllHistoryBtn.addEventListener('click', clearAllHistory);
    
    // 暂存练习
    elements.clearAllSavedPracticeBtn.addEventListener('click', clearAllSavedPractice);
    
    // 历史记录详情
    elements.backToHistoryBtn.addEventListener('click', backToHistory);
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
    } else if (tab === 'wrongQuestions') {
        elements.wrongQuestionsTab.classList.add('active');
        elements.wrongQuestionsSection.classList.add('active');
        elements.wrongQuestionsSection.style.display = 'block';
        loadWrongQuestionsFromStorage(); // 每次切换到错题页面时重新加载
    } else if (tab === 'savedPractice') {
        elements.savedPracticeTab.classList.add('active');
        elements.savedPracticeSection.classList.add('active');
        elements.savedPracticeSection.style.display = 'block';
        loadSavedPracticeFromStorage(); // 每次切换到暂存页面时重新加载
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
    // 加载选中的题库ID
    const selectedIds = JSON.parse(localStorage.getItem('selectedLibraryIds') || '[]');
    selectedLibraryIds = new Set(selectedIds);
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
        <div class="library-item${selectedLibraryIds.has(library.id) ? ' selected' : ''}" data-id="${library.id}" onclick="toggleLibrarySelection(${library.id})">
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
    
    // 保存选中状态到本地存储
    localStorage.setItem('selectedLibraryIds', JSON.stringify(Array.from(selectedLibraryIds)));
    
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
        // 更新本地存储中的选中状态
        localStorage.setItem('selectedLibraryIds', JSON.stringify(Array.from(selectedLibraryIds)));
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
    
    // 检查是否启用随机抽取功能
    if (elements.enableRandomCount.checked) {
        const randomCount = parseInt(elements.randomQuestionCount.value);
        
        // 验证输入的题目数量
        if (isNaN(randomCount) || randomCount < 1) {
            showMessage('请输入有效的题目数量（大于0的整数）', 'warning');
            return;
        }
        
        if (randomCount > allQuestions.length) {
            showMessage(`输入的题目数量(${randomCount})大于符合条件的题目总数(${allQuestions.length})`, 'warning');
            return;
        }
        
        // 随机抽取指定数量的题目
        allQuestions = getRandomQuestions(allQuestions, randomCount);
        showMessage(`已随机抽取${randomCount}道题目`, 'success');
    }
    
    // 随机打乱题目顺序
    if (elements.shuffleQuestions.checked) {
        allQuestions = shuffleArray(allQuestions);
    }
    
    currentQuestions = allQuestions;
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    userScores = new Array(currentQuestions.length).fill(null); // 初始化用户自评分数数组
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

// 随机抽取指定数量的题目
function getRandomQuestions(questions, count) {
    // 先打乱题目顺序
    const shuffled = shuffleArray([...questions]);
    // 返回前count道题
    return shuffled.slice(0, count);
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
    
    // 判断题特殊处理 - 强制显示"对"和"错"两个选项
    if (question.type === '判断题') {
        const userAnswer = userAnswers[currentQuestionIndex] || '';
        elements.optionsContainer.innerHTML = `
            <div class="judgment-options">
                <div class="option-item ${userAnswer === '对' ? 'selected' : ''}" onclick="selectJudgmentOption('对')">
                    <input type="radio" id="option_true" name="judgment_option" value="对" ${userAnswer === '对' ? 'checked' : ''}>
                    <label for="option_true" class="option-text">对</label>
                </div>
                <div class="option-item ${userAnswer === '错' ? 'selected' : ''}" onclick="selectJudgmentOption('错')">
                    <input type="radio" id="option_false" name="judgment_option" value="错" ${userAnswer === '错' ? 'checked' : ''}>
                    <label for="option_false" class="option-text">错</label>
                </div>
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
        const shouldShuffleOptions = window.isWrongQuestionPractice ?
            elements.shuffleWrongOptions.checked :
            elements.shuffleOptions.checked;
            
        if (shouldShuffleOptions) {
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
    
    // 检查是否需要立即显示答案
    checkAndShowAnswerImmediately();
}

// 选择判断题选项
function selectJudgmentOption(value) {
    userAnswers[currentQuestionIndex] = value;
    
    // 更新选中状态
    document.querySelectorAll('.judgment-options .option-item').forEach(item => {
        item.classList.remove('selected');
        item.querySelector('input').checked = false;
    });
    
    const selectedItem = document.querySelector(`.judgment-options .option-item input[value="${value}"]`);
    if (selectedItem) {
        selectedItem.checked = true;
        selectedItem.closest('.option-item').classList.add('selected');
    }
    
    // 检查是否需要立即显示答案
    checkAndShowAnswerImmediately();
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
    
    // 简答题不自动显示答案，需要用户点击下一题
}

// 设置用户自评分数
function setSelfScore(questionIndex, score) {
    userScores[questionIndex] = score;
    showMessage(`已设置${score === 1 ? '正确' : '错误'}`, 'success');
}

// 检查并立即显示答案
function checkAndShowAnswerImmediately() {
    // 检查是否启用了即时显示答案功能
    const shouldShowImmediately = window.isWrongQuestionPractice ?
        elements.showWrongAnswerImmediately.checked :
        elements.showAnswerImmediately.checked;
    
    if (!shouldShowImmediately) {
        return;
    }
    
    // 检查是否已作答
    if (!userAnswers[currentQuestionIndex]) {
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    
    // 简答题和填空题不自动显示答案，需要用户点击下一题
    if (question.type === '简答题' || question.type === '填空题') {
        return;
    }
    
    // 显示答案
    showAnswerExplanation(question);
}

// 显示答案解析（通用函数）
function showAnswerExplanation(question) {
    const userAnswer = userAnswers[currentQuestionIndex] || '未作答';
    const correctAnswer = question.correctAnswer || '无标准答案';
    const isCorrect = checkAnswer(question, userAnswers[currentQuestionIndex], correctAnswer);
    
    // 获取选项内容而不是选项键
    const getOptionText = (optionKey) => {
        if (optionKey && question.options && question.options[optionKey]) {
            return question.options[optionKey];
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
    
    elements.explanationText.innerHTML = `
        <div class="answer-review">
            <p><strong>你的答案：</strong>${formatAnswer(userAnswer)}</p>
            <p><strong>正确答案：</strong>${formatCorrectAnswer(correctAnswer)}</p>
            <p><strong>答题结果：</strong><span class="${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? '✓ 正确' : '✗ 错误'}</span></p>
        </div>
    `;
    
    elements.explanation.style.display = 'block';
    
    // 修改下一题按钮文本，提示用户查看答案后继续
    elements.nextBtn.textContent = '查看答案后继续';
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
    const questionId = `${currentQuestionIndex}_${question.id || question.description}`;
    
    // 检查是否已经评分
    const existingScore = userScores && userScores[currentQuestionIndex] !== undefined ? userScores[currentQuestionIndex] : null;
    
    elements.explanationText.innerHTML = `
        <div class="short-answer-review">
            <p><strong>你的答案：</strong>${userAnswer}</p>
            <p><strong>参考答案：</strong>${correctAnswer}</p>
            <div class="score-section">
                <p><strong>给自己打分：</strong></p>
                <div class="score-options">
                    <label class="score-option">
                        <input type="radio" name="score_${questionId}" value="1" ${existingScore === 1 ? 'checked' : ''} onchange="setSelfScore(${currentQuestionIndex}, 1)">
                        <span>正确 (1分)</span>
                    </label>
                    <label class="score-option">
                        <input type="radio" name="score_${questionId}" value="0" ${existingScore === 0 ? 'checked' : ''} onchange="setSelfScore(${currentQuestionIndex}, 0)">
                        <span>错误 (0分)</span>
                    </label>
                </div>
            </div>
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
    let autoGradedQuestionsCount = 0; // 自动评分的题目数量（不包括简答题和填空题）
    let selfGradedQuestionsCount = 0; // 用户自评的题目数量（简答题和填空题）
    let selfGradedCorrectCount = 0; // 用户自评的正确数量
    const detailedResults = [];
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correctAnswer;
        
        // 简答题和填空题使用用户自评分数
        if (question.type === '简答题' || question.type === '填空题') {
            const selfScore = userScores[index];
            const isCorrect = selfScore === 1; // 1表示正确，0表示错误
            
            if (selfScore !== null && selfScore !== undefined) {
                selfGradedQuestionsCount++;
                if (isCorrect) {
                    selfGradedCorrectCount++;
                    correctCount++;
                }
            }
            
            detailedResults.push({
                question: question,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                isSelfGraded: true,
                selfScore: selfScore
            });
        } else {
            const isCorrect = checkAnswer(question, userAnswer, correctAnswer);
            
            if (isCorrect) {
                correctCount++;
            }
            
            autoGradedQuestionsCount++; // 只有非简答题才计入自动评分
            
            detailedResults.push({
                question: question,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                isSelfGraded: false
            });
        }
    });
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const totalGradedQuestionsCount = autoGradedQuestionsCount + selfGradedQuestionsCount;
    
    return {
        totalQuestions: currentQuestions.length,
        autoGradedQuestionsCount: autoGradedQuestionsCount,
        selfGradedQuestionsCount: selfGradedQuestionsCount,
        totalGradedQuestionsCount: totalGradedQuestionsCount,
        correctCount: correctCount,
        correctRate: totalGradedQuestionsCount > 0 ? Math.round((correctCount / totalGradedQuestionsCount) * 100) : 0,
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
    } else if (question.type === '判断题') {
        // 判断题答案为"对"或"错"
        return userAnswer === correctAnswer;
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
    
    // 显示评分说明
    const scoreNote = document.createElement('p');
    if (results.selfGradedQuestionsCount > 0) {
        scoreNote.textContent = `注：包含${results.autoGradedQuestionsCount}道自动评分题目和${results.selfGradedQuestionsCount}道自评题目`;
    } else {
        scoreNote.textContent = `注：全部${results.autoGradedQuestionsCount}道题目为自动评分`;
    }
    scoreNote.style.fontSize = '14px';
    scoreNote.style.color = '#6c757d';
    scoreNote.style.marginTop = '10px';
    
    // 添加到正确率后面
    elements.correctRate.parentNode.appendChild(scoreNote);
    
    // 存储详细结果供查看
    window.currentResults = results;
    
    // 自动保存分数到历史记录
    autoSaveScoreToHistory(results);
    
    // 收集错题到错题本
    collectWrongQuestions(results);
    
    // 处理错题练习结果（如果是错题练习模式）
    handleWrongQuestionResults(results);
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
            const selfScore = result.selfScore;
            const scoreText = selfScore === 1 ? '自评: 正确' : (selfScore === 0 ? '自评: 错误' : '未评分');
            const scoreClass = selfScore === 1 ? 'correct' : (selfScore === 0 ? 'incorrect' : 'ungraded');
            
            return `
                <div class="review-item short-answer-review-item ${scoreClass}">
                    <div class="review-question">
                        ${index + 1}. ${result.question.description}
                    </div>
                    <div class="review-answer">
                        <span>你的答案: ${userAnswer}</span>
                        <span>参考答案: ${correctAnswer}</span>
                        <span>${scoreText}</span>
                    </div>
                </div>
            `;
        }
        
        // 判断题特殊处理
        if (result.question.type === '判断题') {
            const userAnswer = result.userAnswer || '未作答';
            const correctAnswer = result.correctAnswer || '无标准答案';
            
            return `
                <div class="review-item ${statusClass}">
                    <div class="review-question">
                        ${index + 1}. ${result.question.description}
                    </div>
                    <div class="review-answer">
                        <span>你的答案: ${userAnswer}</span>
                        <span>正确答案: ${correctAnswer}</span>
                        <span>${statusText}</span>
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
        if (window.isWrongQuestionPractice) {
            startWrongPractice();
        } else {
            startPractice();
        }
    }
}

// 返回题库
function backToLibrary() {
    // 先保存当前模式，然后重置状态
    const wasWrongQuestionPractice = window.isWrongQuestionPractice;
    
    // 重置状态
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    userScores = []; // 清空用户自评分数
    selectedLibraryIds.clear();
    questionsShuffledOptions.clear();
    shortAnswerAnswerShown.clear(); // 清空简答题答案显示状态
    
    // 停止计时器
    stopTimer();
    
    // 重置错题练习模式标志
    window.isWrongQuestionPractice = false;
    
    // 根据当前练习模式返回相应页面
    const targetTab = wasWrongQuestionPractice ? 'wrongQuestions' : 'practice';
    switchTab(targetTab);
    
    // 重新加载相应列表
    if (targetTab === 'wrongQuestions') {
        loadWrongQuestionsFromStorage();
    } else {
        loadLibraryFromStorage();
    }
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
    
    let libraryNames;
    let difficulty;
    let questionType;
    
    if (window.isWrongQuestionPractice) {
        // 错题练习模式
        libraryNames = ['错题练习'];
        difficulty = elements.wrongDifficultyFilter.value === 'all' ? '所有难度' : elements.wrongDifficultyFilter.value;
        questionType = elements.wrongQuestionTypeFilter.value === 'all' ? '所有题型' : elements.wrongQuestionTypeFilter.value;
    } else {
        // 普通练习模式
        const libraries = JSON.parse(localStorage.getItem('questionLibraries') || '[]');
        const selectedLibraries = libraries.filter(lib => selectedLibraryIds.has(lib.id));
        libraryNames = selectedLibraries.map(lib => lib.name);
        difficulty = elements.difficultyFilter.value === 'all' ? '所有难度' : elements.difficultyFilter.value;
        questionType = elements.questionTypeFilter.value === 'all' ? '所有题型' : elements.questionTypeFilter.value;
    }
    
    // 创建历史记录对象
    const historyRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        totalQuestions: results.totalQuestions,
        correctCount: results.correctCount,
        correctRate: results.correctRate,
        totalTime: results.totalTime,
        libraryNames: libraryNames,
        difficulty: difficulty,
        questionType: questionType,
        detailedResults: results.detailedResults, // 保存详细的答题情况
        isWrongQuestionPractice: window.isWrongQuestionPractice || false // 标记是否为错题练习
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
                    <div class="history-actions">
                        <button onclick="viewHistoryDetail(${record.id})" class="view-btn">查看详情</button>
                        <button onclick="deleteHistoryRecord(${record.id})" class="delete-btn">删除</button>
                    </div>
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

// 查看历史记录详情
function viewHistoryDetail(recordId) {
    const history = JSON.parse(localStorage.getItem('scoreHistory') || '[]');
    const record = history.find(r => r.id === recordId);
    
    if (!record) {
        showMessage('未找到该历史记录', 'error');
        return;
    }
    
    // 保存当前记录到全局变量
    window.currentHistoryRecord = record;
    
    // 切换到历史记录详情页面
    switchToHistoryDetail();
    
    // 显示历史记录详情
    displayHistoryDetail(record);
}

// 切换到历史记录详情页面
function switchToHistoryDetail() {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    elements.historyDetailSection.style.display = 'block';
    elements.historyDetailSection.classList.add('active');
}

// 返回历史记录列表
function backToHistory() {
    switchTab('history');
}

// 显示历史记录详情
function displayHistoryDetail(record) {
    // 显示基本信息
    const date = new Date(record.date);
    const dateStr = date.toLocaleString('zh-CN');
    const timeStr = formatTime(record.totalTime);
    
    elements.historyDetailInfo.innerHTML = `
        <div class="info-row">
            <span class="info-label">练习时间:</span>
            <span class="info-value">${dateStr}</span>
        </div>
        <div class="info-row">
            <span class="info-label">题库来源:</span>
            <span class="info-value">${record.libraryNames.join(', ')}</span>
        </div>
        <div class="info-row">
            <span class="info-label">难度筛选:</span>
            <span class="info-value">${record.difficulty}</span>
        </div>
        <div class="info-row">
            <span class="info-label">题型筛选:</span>
            <span class="info-value">${record.questionType}</span>
        </div>
    `;
    
    // 显示统计信息
    elements.historyDetailStats.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">总题数</span>
            <span class="stat-value">${record.totalQuestions}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">正确数</span>
            <span class="stat-value">${record.correctCount}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">正确率</span>
            <span class="stat-value">${record.correctRate}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">用时</span>
            <span class="stat-value">${timeStr}</span>
        </div>
    `;
    
    // 显示答题详情
    displayHistoryDetailList(record.detailedResults || []);
}

// 显示历史记录答题详情列表
function displayHistoryDetailList(detailedResults) {
    if (!detailedResults || detailedResults.length === 0) {
        elements.historyDetailList.innerHTML = '<p style="color: #6c757d; text-align: center;">暂无答题详情</p>';
        return;
    }
    
    // 应用筛选条件
    let filteredResults = [...detailedResults];
    
    // 只显示错题筛选
    if (elements.showCorrectOnly.checked) {
        filteredResults = filteredResults.filter(result => !result.isCorrect);
    }
    
    // 题型筛选
    const questionTypeFilter = elements.questionTypeFilterDetail.value;
    if (questionTypeFilter !== 'all') {
        filteredResults = filteredResults.filter(result => result.question.type === questionTypeFilter);
    }
    
    if (filteredResults.length === 0) {
        elements.historyDetailList.innerHTML = '<p style="color: #6c757d; text-align: center;">没有符合筛选条件的题目</p>';
        return;
    }
    
    elements.historyDetailList.innerHTML = filteredResults.map((result, index) => {
        const originalIndex = detailedResults.indexOf(result);
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
            const selfScore = result.selfScore;
            const scoreText = selfScore === 1 ? '自评: 正确' : (selfScore === 0 ? '自评: 错误' : '未评分');
            const scoreClass = selfScore === 1 ? 'correct' : (selfScore === 0 ? 'incorrect' : 'ungraded');
            
            return `
                <div class="history-detail-item short-answer-review-item ${scoreClass}">
                    <div class="detail-question-number">第 ${originalIndex + 1} 题</div>
                    <div class="detail-question-type">${result.question.type}</div>
                    <div class="detail-question-text">${result.question.description}</div>
                    <div class="detail-answer-section">
                        <div class="detail-answer-row">
                            <span class="answer-label">你的答案:</span>
                            <span class="answer-text">${userAnswer}</span>
                        </div>
                        <div class="detail-answer-row">
                            <span class="answer-label">参考答案:</span>
                            <span class="answer-text">${correctAnswer}</span>
                        </div>
                        <div class="detail-answer-row">
                            <span class="answer-label">评分结果:</span>
                            <span class="answer-text ${scoreClass}">${scoreText}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 判断题特殊处理
        if (result.question.type === '判断题') {
            const userAnswer = result.userAnswer || '未作答';
            const correctAnswer = result.correctAnswer || '无标准答案';
            
            return `
                <div class="history-detail-item ${statusClass}">
                    <div class="detail-question-number">第 ${originalIndex + 1} 题</div>
                    <div class="detail-question-type">${result.question.type}</div>
                    <div class="detail-question-text">${result.question.description}</div>
                    <div class="detail-answer-section">
                        <div class="detail-answer-row">
                            <span class="answer-label">你的答案:</span>
                            <span class="answer-text">${userAnswer}</span>
                        </div>
                        <div class="detail-answer-row">
                            <span class="answer-label">正确答案:</span>
                            <span class="answer-text">${correctAnswer}</span>
                        </div>
                        <div class="detail-answer-row">
                            <span class="answer-label">答题结果:</span>
                            <span class="answer-text ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="history-detail-item ${statusClass}">
                <div class="detail-question-number">第 ${originalIndex + 1} 题</div>
                <div class="detail-question-type">${result.question.type}</div>
                <div class="detail-question-text">${result.question.description}</div>
                <div class="detail-answer-section">
                    <div class="detail-answer-row">
                        <span class="answer-label">你的答案:</span>
                        <span class="answer-text">${formatAnswer(result.userAnswer)}</span>
                    </div>
                    <div class="detail-answer-row">
                        <span class="answer-label">正确答案:</span>
                        <span class="answer-text">${formatCorrectAnswer(result.correctAnswer)}</span>
                    </div>
                    <div class="detail-answer-row">
                        <span class="answer-label">答题结果:</span>
                        <span class="answer-text ${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 筛选历史记录详情
function filterHistoryDetails() {
    if (window.currentHistoryRecord) {
        displayHistoryDetailList(window.currentHistoryRecord.detailedResults || []);
    }
}

// 错题相关函数

// 收集错题到错题本
function collectWrongQuestions(results) {
    if (!results || !results.detailedResults) return;
    
    const wrongQuestions = results.detailedResults.filter(result => !result.isCorrect);
    
    if (wrongQuestions.length === 0) return;
    
    // 获取现有错题
    let wrongQuestionsCollection = JSON.parse(localStorage.getItem('wrongQuestionsCollection') || '[]');
    
    // 为每个错题添加唯一ID和时间戳
    wrongQuestions.forEach(wrongQuestion => {
        const questionWithMeta = {
            ...wrongQuestion,
            id: generateUniqueId(),
            collectedAt: new Date().toISOString(),
            originalQuizDate: new Date().toISOString(),
            libraryNames: results.libraryNames || ['未知题库']
        };
        
        // 检查是否已存在相同的错题（基于题目内容和正确答案）
        const isDuplicate = wrongQuestionsCollection.some(existing =>
            existing.question.description === wrongQuestion.question.description &&
            existing.question.correctAnswer === wrongQuestion.question.correctAnswer
        );
        
        if (!isDuplicate) {
            wrongQuestionsCollection.push(questionWithMeta);
        }
    });
    
    // 保存到本地存储
    localStorage.setItem('wrongQuestionsCollection', JSON.stringify(wrongQuestionsCollection));
    
    showMessage(`已收集 ${wrongQuestions.length} 道错题到错题本`, 'success');
}

// 生成唯一ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 从本地存储加载错题
function loadWrongQuestionsFromStorage() {
    const wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestionsCollection') || '[]');
    displayWrongQuestionsList(wrongQuestions);
}

// 显示错题列表
function displayWrongQuestionsList(wrongQuestions) {
    elements.totalWrongQuestionsCount.textContent = wrongQuestions.length;
    
    if (wrongQuestions.length === 0) {
        elements.wrongQuestionsList.innerHTML = '<p style="color: #6c757d; text-align: center;">暂无错题，请先完成练习</p>';
        elements.wrongPracticeControls.style.display = 'none';
        return;
    }
    
    elements.wrongPracticeControls.style.display = 'block';
    
    elements.wrongQuestionsList.innerHTML = wrongQuestions.map((wrongQuestion, index) => {
        const question = wrongQuestion.question;
        const collectedDate = new Date(wrongQuestion.collectedAt).toLocaleString('zh-CN');
        const libraryNames = wrongQuestion.libraryNames.join(', ');
        
        return `
            <div class="wrong-question-item" data-id="${wrongQuestion.id}">
                <div class="wrong-question-header">
                    <div class="wrong-question-number">错题 ${index + 1}</div>
                    <div class="wrong-question-actions">
                        <button onclick="viewWrongQuestionDetail('${wrongQuestion.id}')" class="view-btn">查看详情</button>
                        <button onclick="removeWrongQuestion('${wrongQuestion.id}')" class="delete-btn">移除</button>
                    </div>
                </div>
                <div class="wrong-question-content">
                    <div class="wrong-question-meta">
                        <span class="type-tag">${question.type}</span>
                        <span class="difficulty-tag">${question.difficulty}</span>
                        <span class="library-tag">${libraryNames}</span>
                    </div>
                    <div class="wrong-question-text">${question.description}</div>
                    <div class="wrong-question-answer">
                        <span class="answer-label">你的答案:</span>
                        <span class="answer-text incorrect">${formatWrongAnswer(wrongQuestion.userAnswer, question)}</span>
                    </div>
                    <div class="wrong-question-answer">
                        <span class="answer-label">正确答案:</span>
                        <span class="answer-text correct">${formatCorrectAnswer(wrongQuestion.correctAnswer, question)}</span>
                    </div>
                    <div class="wrong-question-date">收集时间: ${collectedDate}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 格式化错题答案
function formatWrongAnswer(userAnswer, question) {
    if (!userAnswer) return '未作答';
    
    if (Array.isArray(userAnswer)) {
        return userAnswer.map(key => question.options[key]).join(', ');
    } else {
        return question.options[userAnswer] || userAnswer;
    }
}

// 格式化正确答案
function formatCorrectAnswer(correctAnswer, question) {
    if (!correctAnswer) return '无标准答案';
    
    // 处理多选题答案
    if (correctAnswer.includes(',') || (correctAnswer.length > 1 && /^[A-E]+$/.test(correctAnswer))) {
        const letters = correctAnswer.includes(',') ?
            correctAnswer.split(',').map(key => key.trim()) :
            correctAnswer.split('');
        return letters.map(key => question.options[key]).join(', ');
    } else {
        return question.options[correctAnswer] || correctAnswer;
    }
}

// 查看错题详情
function viewWrongQuestionDetail(wrongQuestionId) {
    const wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestionsCollection') || '[]');
    const wrongQuestion = wrongQuestions.find(wq => wq.id === wrongQuestionId);
    
    if (!wrongQuestion) {
        showMessage('未找到该错题', 'error');
        return;
    }
    
    const question = wrongQuestion.question;
    const userAnswer = wrongQuestion.userAnswer;
    const correctAnswer = wrongQuestion.correctAnswer;
    const collectedDate = new Date(wrongQuestion.collectedAt).toLocaleString('zh-CN');
    const libraryNames = wrongQuestion.libraryNames.join(', ');
    
    const detailContent = `
        <div class="wrong-question-detail-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>错题详情</h3>
                    <button onclick="closeWrongQuestionDetail()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="wrong-question-meta">
                        <span class="type-tag">${question.type}</span>
                        <span class="difficulty-tag">${question.difficulty}</span>
                        <span class="library-tag">${libraryNames}</span>
                    </div>
                    <div class="wrong-question-text">${question.description}</div>
                    <div class="wrong-question-answer">
                        <span class="answer-label">你的答案:</span>
                        <span class="answer-text incorrect">${formatWrongAnswer(userAnswer, question)}</span>
                    </div>
                    <div class="wrong-question-answer">
                        <span class="answer-label">正确答案:</span>
                        <span class="answer-text correct">${formatCorrectAnswer(correctAnswer, question)}</span>
                    </div>
                    <div class="wrong-question-date">收集时间: ${collectedDate}</div>
                </div>
            </div>
        </div>
    `;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.innerHTML = detailContent;
    document.body.appendChild(modal);
    
    // 添加背景遮罩
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
}

// 关闭错题详情
function closeWrongQuestionDetail() {
    const modal = document.querySelector('.wrong-question-detail-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// 移除错题
function removeWrongQuestion(wrongQuestionId) {
    if (confirm('确定要移除这道错题吗？')) {
        let wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestionsCollection') || '[]');
        wrongQuestions = wrongQuestions.filter(wq => wq.id !== wrongQuestionId);
        localStorage.setItem('wrongQuestionsCollection', JSON.stringify(wrongQuestions));
        
        loadWrongQuestionsFromStorage();
        showMessage('错题已移除', 'success');
    }
}

// 清空所有错题
function clearAllWrongQuestions() {
    if (confirm('确定要清空所有错题吗？此操作不可恢复！')) {
        localStorage.removeItem('wrongQuestionsCollection');
        loadWrongQuestionsFromStorage();
        showMessage('所有错题已清空', 'success');
    }
}

// 开始错题练习
function startWrongPractice() {
    const wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestionsCollection') || '[]');
    
    if (wrongQuestions.length === 0) {
        showMessage('没有可练习的错题', 'warning');
        return;
    }
    
    // 应用筛选条件
    let practiceQuestions = wrongQuestions.map(wq => wq.question);
    
    const difficultyFilter = elements.wrongDifficultyFilter.value;
    const typeFilter = elements.wrongQuestionTypeFilter.value;
    
    if (difficultyFilter !== 'all') {
        practiceQuestions = practiceQuestions.filter(q => q.difficulty === difficultyFilter);
    }
    
    if (typeFilter !== 'all') {
        practiceQuestions = practiceQuestions.filter(q => q.type === typeFilter);
    }
    
    if (practiceQuestions.length === 0) {
        showMessage('没有符合条件的错题', 'warning');
        return;
    }
    
    // 随机打乱题目顺序
    if (elements.shuffleWrongQuestions.checked) {
        practiceQuestions = shuffleArray(practiceQuestions);
    }
    
    // 设置当前练习为错题练习模式
    window.isWrongQuestionPractice = true;
    
    currentQuestions = practiceQuestions;
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    userScores = new Array(currentQuestions.length).fill(null);
    questionsShuffledOptions.clear();
    shortAnswerAnswerShown.clear();
    startTime = Date.now();
    
    // 切换到测验界面
    switchToQuiz();
    
    // 显示第一题
    displayQuestion();
    
    // 开始计时
    startTimer();
    
    showMessage(`开始错题练习，共 ${practiceQuestions.length} 道题目`, 'success');
}

// 错题练习结果处理
function handleWrongQuestionResults(results) {
    if (!window.isWrongQuestionPractice) return;
    
    const correctResults = results.detailedResults.filter(result => result.isCorrect);
    
    if (correctResults.length > 0) {
        const confirmRemove = confirm(`您在错题练习中答对了 ${correctResults.length} 道题目，是否将这些题目从错题本中移除？`);
        
        if (confirmRemove) {
            let wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestionsCollection') || '[]');
            
            correctResults.forEach(correctResult => {
                const question = correctResult.question;
                wrongQuestions = wrongQuestions.filter(wq =>
                    !(wq.question.description === question.description &&
                      wq.question.correctAnswer === question.correctAnswer)
                );
            });
            
            localStorage.setItem('wrongQuestionsCollection', JSON.stringify(wrongQuestions));
            showMessage(`已移除 ${correctResults.length} 道已答对的错题`, 'success');
        }
    }
}

// 暂存练习相关函数

// 保存练习进度
function savePracticeProgress() {
    if (!currentQuestions || currentQuestions.length === 0) {
        showMessage('没有可保存的练习进度', 'warning');
        return;
    }
    
    // 保存当前简答题答案
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (currentQuestion && (currentQuestion.type === '简答题' || currentQuestion.type === '填空题')) {
        saveShortAnswer();
    }
    
    // 获取练习设置
    let practiceSettings;
    let libraryNames;
    
    if (window.isWrongQuestionPractice) {
        // 错题练习模式
        practiceSettings = {
            shuffleQuestions: elements.shuffleWrongQuestions.checked,
            shuffleOptions: elements.shuffleWrongOptions.checked,
            showAnswerImmediately: elements.showWrongAnswerImmediately.checked,
            difficultyFilter: elements.wrongDifficultyFilter.value,
            questionTypeFilter: elements.wrongQuestionTypeFilter.value
        };
        libraryNames = ['错题练习'];
    } else {
        // 普通练习模式
        practiceSettings = {
            shuffleQuestions: elements.shuffleQuestions.checked,
            shuffleOptions: elements.shuffleOptions.checked,
            showAnswerImmediately: elements.showAnswerImmediately.checked,
            enableRandomCount: elements.enableRandomCount.checked,
            randomQuestionCount: elements.randomQuestionCount.value,
            difficultyFilter: elements.difficultyFilter.value,
            questionTypeFilter: elements.questionTypeFilter.value
        };
        
        const libraries = JSON.parse(localStorage.getItem('questionLibraries') || '[]');
        const selectedLibraries = libraries.filter(lib => selectedLibraryIds.has(lib.id));
        libraryNames = selectedLibraries.map(lib => lib.name);
    }
    
    // 创建暂存记录对象
    const savedPractice = {
        id: Date.now(),
        saveTime: new Date().toISOString(),
        title: generatePracticeTitle(libraryNames),
        libraryNames: libraryNames,
        practiceSettings: practiceSettings,
        isWrongQuestionPractice: window.isWrongQuestionPractice || false,
        currentQuestions: currentQuestions,
        currentQuestionIndex: currentQuestionIndex,
        userAnswers: [...userAnswers],
        userScores: [...userScores],
        questionsShuffledOptions: Array.from(questionsShuffledOptions.entries()),
        shortAnswerAnswerShown: Array.from(shortAnswerAnswerShown.entries()),
        startTime: startTime,
        elapsedTime: Math.floor((Date.now() - startTime) / 1000)
    };
    
    // 保存到本地存储
    let savedPractices = JSON.parse(localStorage.getItem('savedPractices') || '[]');
    savedPractices.unshift(savedPractice); // 新记录添加到开头
    
    // 限制暂存记录数量（最多保存20条）
    if (savedPractices.length > 20) {
        savedPractices = savedPractices.slice(0, 20);
    }
    
    localStorage.setItem('savedPractices', JSON.stringify(savedPractices));
    
    showMessage('练习进度已保存', 'success');
}

// 生成练习标题
function generatePracticeTitle(libraryNames) {
    const date = new Date();
    const dateStr = date.toLocaleDateString('zh-CN');
    const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    if (libraryNames.length === 0) {
        return `练习 ${dateStr} ${timeStr}`;
    } else if (libraryNames.length === 1) {
        return `${libraryNames[0]} ${dateStr} ${timeStr}`;
    } else {
        return `多题库练习 ${dateStr} ${timeStr}`;
    }
}

// 从本地存储加载暂存练习
function loadSavedPracticeFromStorage() {
    const savedPractices = JSON.parse(localStorage.getItem('savedPractices') || '[]');
    displaySavedPracticeList(savedPractices);
}

// 显示暂存练习列表
function displaySavedPracticeList(savedPractices) {
    elements.totalSavedPracticeCount.textContent = savedPractices.length;
    
    if (savedPractices.length === 0) {
        elements.savedPracticeList.innerHTML = '<p style="color: #6c757d; text-align: center;">暂无暂存记录，请在练习中保存进度</p>';
        return;
    }
    
    elements.savedPracticeList.innerHTML = savedPractices.map(practice => {
        const saveDate = new Date(practice.saveTime);
        const dateStr = saveDate.toLocaleString('zh-CN');
        const progress = Math.round(((practice.currentQuestionIndex + 1) / practice.currentQuestions.length) * 100);
        const timeStr = formatTime(practice.elapsedTime);
        
        return `
            <div class="saved-practice-item" data-id="${practice.id}">
                <div class="saved-practice-header">
                    <div class="saved-practice-title">${practice.title}</div>
                    <div class="saved-practice-actions">
                        <button onclick="resumeSavedPractice(${practice.id})" class="resume-btn">继续练习</button>
                        <button onclick="deleteSavedPractice(${practice.id})" class="delete-btn">删除</button>
                    </div>
                </div>
                <div class="saved-practice-content">
                    <div class="saved-practice-meta">
                        <span class="type-tag">${practice.isWrongQuestionPractice ? '错题练习' : '普通练习'}</span>
                        <span class="progress-tag">进度: ${progress}%</span>
                    </div>
                    <div class="saved-practice-details">
                        <span>题库: ${practice.libraryNames.join(', ')}</span>
                        <span>题目: ${practice.currentQuestionIndex + 1} / ${practice.currentQuestions.length}</span>
                        <span>用时: ${timeStr}</span>
                    </div>
                    <div class="saved-practice-date">保存时间: ${dateStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 恢复暂存的练习
function resumeSavedPractice(practiceId) {
    const savedPractices = JSON.parse(localStorage.getItem('savedPractices') || '[]');
    const practice = savedPractices.find(p => p.id === practiceId);
    
    if (!practice) {
        showMessage('未找到该暂存记录', 'error');
        return;
    }
    
    // 恢复练习状态
    currentQuestions = practice.currentQuestions;
    currentQuestionIndex = practice.currentQuestionIndex;
    userAnswers = [...practice.userAnswers];
    userScores = [...practice.userScores];
    questionsShuffledOptions = new Map(practice.questionsShuffledOptions);
    shortAnswerAnswerShown = new Map(practice.shortAnswerAnswerShown);
    startTime = Date.now() - (practice.elapsedTime * 1000); // 调整开始时间以保持已用时间
    
    // 设置练习模式
    window.isWrongQuestionPractice = practice.isWrongQuestionPractice;
    
    // 恢复练习设置（如果需要）
    if (practice.practiceSettings) {
        if (practice.isWrongQuestionPractice) {
            elements.shuffleWrongQuestions.checked = practice.practiceSettings.shuffleQuestions;
            elements.shuffleWrongOptions.checked = practice.practiceSettings.shuffleOptions;
            elements.showWrongAnswerImmediately.checked = practice.practiceSettings.showAnswerImmediately;
            elements.wrongDifficultyFilter.value = practice.practiceSettings.difficultyFilter;
            elements.wrongQuestionTypeFilter.value = practice.practiceSettings.questionTypeFilter;
        } else {
            elements.shuffleQuestions.checked = practice.practiceSettings.shuffleQuestions;
            elements.shuffleOptions.checked = practice.practiceSettings.shuffleOptions;
            elements.showAnswerImmediately.checked = practice.practiceSettings.showAnswerImmediately;
            elements.enableRandomCount.checked = practice.practiceSettings.enableRandomCount;
            elements.randomQuestionCount.value = practice.practiceSettings.randomQuestionCount;
            elements.difficultyFilter.value = practice.practiceSettings.difficultyFilter;
            elements.questionTypeFilter.value = practice.practiceSettings.questionTypeFilter;
        }
    }
    
    // 切换到测验界面
    switchToQuiz();
    
    // 显示当前题目
    displayQuestion();
    
    // 开始计时
    startTimer();
    
    showMessage(`已恢复练习: ${practice.title}`, 'success');
}

// 删除暂存记录
function deleteSavedPractice(practiceId) {
    if (confirm('确定要删除这条暂存记录吗？')) {
        let savedPractices = JSON.parse(localStorage.getItem('savedPractices') || '[]');
        savedPractices = savedPractices.filter(practice => practice.id !== practiceId);
        localStorage.setItem('savedPractices', JSON.stringify(savedPractices));
        
        loadSavedPracticeFromStorage();
        showMessage('暂存记录已删除', 'success');
    }
}

// 清空所有暂存记录
function clearAllSavedPractice() {
    if (confirm('确定要清空所有暂存记录吗？此操作不可恢复！')) {
        localStorage.removeItem('savedPractices');
        loadSavedPracticeFromStorage();
        showMessage('所有暂存记录已清空', 'success');
    }
}