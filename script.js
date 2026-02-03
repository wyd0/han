// 平滑滚动功能
function smoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 导航栏滚动效果
function navScrollEffect() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 表单验证和处理 - 增强版，支持实时验证和留言收集
function formSubmitHandler() {
    const form = document.getElementById('feedbackForm');
    const formMessage = document.getElementById('formMessage');
    const messageCountElement = document.getElementById('messageCount');
    let isSubmitting = false;
    
    if (form) {
        // 初始化留言数量显示
        updateMessageCount();
        
        // 添加实时验证
        addRealTimeValidation();
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 防止重复提交
            if (isSubmitting) return;
            
            // 表单验证
            if (!validateForm()) {
                showFormMessage('请检查并修正表单中的错误！', 'error');
                return;
            }
            
            // 设置提交状态
            isSubmitting = true;
            const submitBtn = form.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;
            
            // 获取表单数据
            const formData = new FormData(form);
            const messageData = {
                id: Date.now(),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                wechat: formData.get('wechat'),
                timestamp: new Date().toISOString()
            };
            
            // 收集留言（使用localStorage存储，实际项目中可替换为API调用）
            collectMessage(messageData);
            
            // 更新留言数量
            updateMessageCount();
            
            // 显示成功消息
            showFormMessage('感谢您的留言！我们会尽快通过您选择的联系方式回复您。', 'success');
            
            // 重置表单
            form.reset();
            
            // 清除所有验证反馈
            clearValidationFeedback();
            
            // 恢复提交按钮状态
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                isSubmitting = false;
            }, 1500);
            
            // 3秒后隐藏消息
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 3000);
        });
    }
    
    // 显示表单消息
    function showFormMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
    }
    
    // 收集留言数据
    function collectMessage(messageData) {
        // 从localStorage获取现有留言
        let messages = JSON.parse(localStorage.getItem('feedbackMessages')) || [];
        
        // 添加新留言
        messages.push(messageData);
        
        // 保存到localStorage
        localStorage.setItem('feedbackMessages', JSON.stringify(messages));
        
        // 控制台输出，方便调试
        console.log('留言已收集:', messageData);
        console.log('当前留言总数:', messages.length);
    }
    
    // 更新留言数量显示
    function updateMessageCount() {
        let messages = JSON.parse(localStorage.getItem('feedbackMessages')) || [];
        if (messageCountElement) {
            messageCountElement.textContent = messages.length;
        }
    }
    
    // 添加实时验证
    function addRealTimeValidation() {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                validateField(input);
            });
            
            input.addEventListener('blur', () => {
                validateField(input);
            });
        });
    }
    
    // 验证单个字段
    function validateField(field) {
        const fieldName = field.name;
        const fieldValue = field.value.trim();
        const errorMessage = getErrorMessage(fieldName, fieldValue);
        
        // 移除旧的错误反馈
        const oldError = field.parentElement.querySelector('.field-error');
        if (oldError) {
            oldError.remove();
        }
        
        // 移除旧的验证状态
        field.classList.remove('valid', 'invalid');
        
        // 添加新的错误反馈
        if (errorMessage) {
            field.classList.add('invalid');
            const errorElement = document.createElement('span');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            errorElement.style.color = '#c0392b';
            errorElement.style.fontSize = '12px';
            errorElement.style.marginTop = '5px';
            errorElement.style.display = 'block';
            field.parentElement.appendChild(errorElement);
        } else if (fieldValue || field.required) {
            field.classList.add('valid');
        }
    }
    
    // 表单整体验证
    function validateForm() {
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const fieldValue = input.value.trim();
            const errorMessage = getErrorMessage(input.name, fieldValue);
            
            if (errorMessage) {
                isValid = false;
                validateField(input);
            }
        });
        
        return isValid;
    }
    
    // 清除所有验证反馈
    function clearValidationFeedback() {
        const errors = form.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());
        
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.classList.remove('valid', 'invalid');
        });
    }
    
    // 获取字段错误信息
    function getErrorMessage(fieldName, value) {
        switch (fieldName) {
            case 'name':
                if (!value) return '姓名为必填项！';
                if (value.length < 2) return '姓名至少需要2个字符！';
                if (value.length > 20) return '姓名不能超过20个字符！';
                break;
            
            case 'email':
                if (!value) return '邮箱为必填项！';
                if (!isValidEmail(value)) return '请输入有效的邮箱地址！';
                break;
            
            case 'phone':
                if (value && !isValidPhone(value)) return '请输入有效的手机号码！';
                break;
            
            case 'wechat':
                if (value && !isValidWechat(value)) return '请输入有效的微信号！';
                break;
            
            case 'subject':
                if (!value) return '请选择留言主题！';
                break;
            
            case 'message':
                if (!value) return '留言内容为必填项！';
                if (value.length < 10) return '留言内容至少需要10个字符！';
                if (value.length > 500) return '留言内容不能超过500个字符！';
                break;
            
            case 'privacy':
                const privacyCheckbox = form.querySelector('input[name="privacy"]');
                if (!privacyCheckbox.checked) return '请阅读并同意隐私政策！';
                break;
        }
        
        return '';
    }
    
    // 验证邮箱格式
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 验证手机号码格式
    function isValidPhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
    
    // 验证微信号格式
    function isValidWechat(wechat) {
        // 微信号格式：6-20位字母、数字、下划线或减号，以字母开头
        const wechatRegex = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/;
        return wechatRegex.test(wechat);
    }
}

// 元素进入视口时的动画效果
function animateOnScroll() {
    // 为需要动画的元素添加观察
    const animatedElements = document.querySelectorAll('.about, .culture, .clothing, .difference-entrance, .contact, .donate, .culture-item, .gallery-item, .manchu-section, .yao-section, .yugur-section, .tujia-section, .uzbek-section, .wa-section, .xibe-section, .tu-section, .uyghur-section, .tatar-section, .tajik-section, .shui-section, .she-section, .salar-section, .russian-section, .qiang-section, .pumi-section, .orochun-section, .nu-section, .naxi-section, .mulao-section, .monba-section, .maonan-section, .zhuang-section, .yi-section, .tibetan-section, .mongolian-section, .miao-section, .loba-section, .lisu-section, .li-section, .lahu-section, .korean-section, .kirgiz-section, .kazak-section, .jino-section, .jingpo-section, .jing-section, .hui-section, .hezhen-section, .hani-section, .han-section, .gelao-section, .gaoshan-section, .ewenki-section, .drung-section, .dongxiang-section, .dong-section, .deang-section, .daur-section, .dai-section, .achang-section, .bai-section, .blang-section, .bonan-section, .buyi-section, .culture-section, .literature-section, .festival-section, .festival-detail-section, .music-section, .ritual-section, .marriage-section, .funeral-section, .social-section, .court-section, .sacrifice-section, .medicine-section, .craft-section, .craft-detail-section, .clothing-section, .difference-section, .dynasty-section, .instrument-section, .school-section, .poetry-section, .prose-section, .novel-section, .opera-section, .opera-regional-section, .prose-types-section, .novel-types-section, .timeline-item, .clothing-item, .food-item, .festival-celebration, .religion-section, .epic-section, .language-section, .music-section, .daur-religion-section, .daur-language-section, .daur-festival-section, .daur-music-section, .salar-religion-section, .salar-language-section, .salar-music-section, .salar-festival-section, .detail-section');
    
    // 同时为所有子页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.detail-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有柯尔克孜族子页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.religion-section, .epic-section, .language-section, .music-section, .daur-religion-section, .daur-language-section, .daur-festival-section, .daur-music-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有黎族页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.li-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有普米族页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.pumi-section, .ritual-item, .feature-item, .dance-item, .festival-item').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有傈僳族页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.lisu-section, .timeline-item, .culture-item, .clothing-item, .food-item, .festival-celebration').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有裕固族子页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.yugur-language-section, .yugur-religion-section, .yugur-customs-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 50);
    
    // 同时为所有裕固族子页面的 feature-item 添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.feature-item').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有撒拉族子页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.salar-religion-section, .salar-language-section, .salar-music-section, .salar-festival-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有新添加的散文种类详细页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.prose-types-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有新添加的小说种类详细页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.novel-types-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有新添加的文学详细页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.poetry-section, .prose-section, .novel-section, .opera-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 同时为所有新添加的戏曲地区分类页面元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.opera-regional-section').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    // 页面加载时为所有元素添加动画，使它们同时出现
    setTimeout(() => {
        animatedElements.forEach(el => {
            el.classList.add('visible');
        });
    }, 300);
    
    // 同时保留滚动观察，确保页面下方的元素也能正确显示
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // 为需要动画的元素添加观察
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}



// 邮箱联想功能
function emailSuggestion() {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;
    
    // 常见邮箱后缀
    const commonDomains = [
        'qq.com',
        '163.com',
        '126.com',
        'gmail.com',
        'outlook.com',
        'hotmail.com',
        'sina.com',
        'sohu.com',
        'yahoo.com',
        'foxmail.com'
    ];
    
    // 创建联想容器
    let suggestionContainer = null;
    
    // 输入事件监听
    emailInput.addEventListener('input', function() {
        const value = this.value.trim();
        
        // 清除旧的联想容器
        if (suggestionContainer) {
            suggestionContainer.remove();
            suggestionContainer = null;
        }
        
        // 如果输入为空或已包含@符号，不显示联想
        if (!value || value.includes('@')) {
            return;
        }
        
        // 生成联想列表
        const suggestions = commonDomains.map(domain => `${value}@${domain}`);
        
        // 创建联想容器
        suggestionContainer = document.createElement('div');
        suggestionContainer.className = 'email-suggestions';
        suggestionContainer.style.position = 'absolute';
        suggestionContainer.style.top = '100%';
        suggestionContainer.style.left = '0';
        suggestionContainer.style.right = '0';
        suggestionContainer.style.backgroundColor = '#fff';
        suggestionContainer.style.border = '1px solid #ddd';
        suggestionContainer.style.borderTop = 'none';
        suggestionContainer.style.borderRadius = '0 0 4px 4px';
        suggestionContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        suggestionContainer.style.zIndex = '1000';
        suggestionContainer.style.maxHeight = '200px';
        suggestionContainer.style.overflowY = 'auto';
        
        // 添加联想项
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'email-suggestion-item';
            item.style.padding = '8px 12px';
            item.style.cursor = 'pointer';
            item.style.fontSize = '14px';
            item.style.color = '#333';
            item.textContent = suggestion;
            
            // 鼠标悬停效果
            item.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#f5f5f5';
            });
            
            item.addEventListener('mouseout', function() {
                this.style.backgroundColor = '#fff';
            });
            
            // 点击选择
            item.addEventListener('click', function() {
                emailInput.value = this.textContent;
                if (suggestionContainer) {
                    suggestionContainer.remove();
                    suggestionContainer = null;
                }
                // 触发输入事件，更新验证状态
                const event = new Event('input');
                emailInput.dispatchEvent(event);
            });
            
            suggestionContainer.appendChild(item);
        });
        
        // 添加到父容器
        const parent = emailInput.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(suggestionContainer);
    });
    
    // 点击其他地方关闭联想
    document.addEventListener('click', function(event) {
        if (suggestionContainer && !emailInput.contains(event.target) && !suggestionContainer.contains(event.target)) {
            suggestionContainer.remove();
            suggestionContainer = null;
        }
    });
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    smoothScroll();
    navScrollEffect();
    formSubmitHandler();
    animateOnScroll();
    emailSuggestion();
});

// 页面加载完成后的效果
window.addEventListener('load', function() {
    // 添加页面加载完成的类，用于触发某些动画
    document.body.classList.add('loaded');
    
    // 初始化搜索历史显示
    displaySearchHistory();
    
    // 强制为所有需要动画的元素添加 visible 类
    setTimeout(() => {
        document.querySelectorAll('.lisu-section, .timeline-item, .culture-item, .clothing-item, .food-item, .festival-celebration, .li-section, .mulao-section, .feature-item, .religion-item, .art-item, .craft-item, .donate').forEach(el => {
            el.classList.add('visible');
        });
    }, 500);
    
    // 强制为柯尔克孜族子页面元素添加 visible 类
    setTimeout(() => {
        const kirgizElements = document.querySelectorAll('.religion-section, .epic-section, .language-section, .music-section, .daur-religion-section, .daur-language-section, .daur-festival-section, .daur-music-section');
        console.log('找到子页面元素数量:', kirgizElements.length);
        kirgizElements.forEach(el => {
            el.classList.add('visible');
            console.log('为元素添加visible类:', el.className);
        });
    }, 300);
    
    // 强制为仫佬族子页面元素添加 visible 类
    setTimeout(() => {
        const mulaoElements = document.querySelectorAll('.mulao-section, .feature-item, .religion-item, .art-item, .craft-item');
        console.log('找到仫佬族子页面元素数量:', mulaoElements.length);
        mulaoElements.forEach(el => {
            el.classList.add('visible');
            console.log('为仫佬族元素添加visible类:', el.className);
        });
    }, 300);
    
    // 强制为裕固族子页面元素添加 visible 类
    setTimeout(() => {
        const yugurElements = document.querySelectorAll('.yugur-language-section, .yugur-religion-section, .yugur-customs-section');
        console.log('找到裕固族子页面元素数量:', yugurElements.length);
        yugurElements.forEach(el => {
            el.classList.add('visible');
            console.log('为裕固族元素添加visible类:', el.className);
        });
    }, 150);
    
    // 强制为裕固族子页面的 feature-item 添加 visible 类
    setTimeout(() => {
        const yugurFeatureItems = document.querySelectorAll('.feature-item');
        console.log('找到裕固族子页面 feature-item 数量:', yugurFeatureItems.length);
        yugurFeatureItems.forEach(el => {
            el.classList.add('visible');
            console.log('为裕固族 feature-item 添加visible类:', el.className);
        });
    }, 200);
    
    // 强制为撒拉族子页面元素添加 visible 类
    setTimeout(() => {
        const salarElements = document.querySelectorAll('.salar-religion-section, .salar-language-section, .salar-music-section, .salar-festival-section');
        console.log('找到撒拉族子页面元素数量:', salarElements.length);
        salarElements.forEach(el => {
            el.classList.add('visible');
            console.log('为撒拉族元素添加visible类:', el.className);
        });
    }, 300);
});

// 节日数据
const festivalData = [
    {
        name: "春节",
        date: "农历正月初一",
        description: "中国最重要的传统节日，象征着团圆、吉祥和新的开始。主要习俗包括贴春联、放鞭炮、吃年夜饭、拜年等。",
        link: "festival_spring.html",
        season: "春季"
    },
    {
        name: "元宵节",
        date: "农历正月十五",
        description: "又称上元节，主要习俗包括赏花灯、吃元宵、猜灯谜等，象征着团圆和美满。",
        link: "festival_lantern.html",
        season: "春季"
    },
    {
        name: "二月二龙抬头",
        date: "农历二月初二",
        description: "又称春耕节，主要习俗包括理发、吃猪头肉、祭龙王等，象征着万物复苏、春耕开始。",
        link: "festival_dragon_head.html",
        season: "春季"
    },
    {
        name: "寒食节",
        date: "清明节前一天",
        description: "主要习俗包括禁火、吃冷食、扫墓等，是为了纪念介子推而设立的节日。",
        link: "festival_cold_food.html",
        season: "春季"
    },
    {
        name: "清明节",
        date: "公历4月4日或5日",
        description: "是祭祀祖先和扫墓的节日，同时也是踏青、春游的好时节。",
        link: "festival_qingming.html",
        season: "春季"
    },
    {
        name: "端午节",
        date: "农历五月初五",
        description: "是为了纪念屈原而设立的节日，主要习俗包括吃粽子、赛龙舟、挂菖蒲等。",
        link: "festival_dragon.html",
        season: "夏季"
    },
    {
        name: "七夕节",
        date: "农历七月初七",
        description: "又称乞巧节，主要习俗包括穿针乞巧、拜织女、吃巧果等，是中国的传统情人节。",
        link: "festival_qixi.html",
        season: "秋季"
    },
    {
        name: "中元节",
        date: "农历七月十五",
        description: "又称鬼节，主要习俗包括祭祖、放河灯、烧纸钱等，是为了祭祀祖先和超度亡灵。",
        link: "festival_zhongyuan.html",
        season: "秋季"
    },
    {
        name: "中秋节",
        date: "农历八月十五",
        description: "是团圆的节日，主要习俗包括赏月、吃月饼、家人团聚等。",
        link: "festival_midautumn.html",
        season: "秋季"
    },
    {
        name: "重阳节",
        date: "农历九月初九",
        description: "又称老人节，主要习俗包括登高、插茱萸、赏菊花等，表达对老人的尊敬和祝福。",
        link: "festival_double_ninth.html",
        season: "秋季"
    },
    {
        name: "腊八节",
        date: "农历十二月初八",
        description: "主要习俗包括喝腊八粥、腌腊八蒜等，象征着丰收和吉祥。",
        link: "festival_laba.html",
        season: "冬季"
    },
    {
        name: "小年",
        date: "农历十二月二十三或二十四",
        description: "主要习俗包括祭灶、扫尘、贴窗花等，是春节的前奏。",
        link: "festival_little_new_year.html",
        season: "冬季"
    },
    {
        name: "除夕",
        date: "农历十二月最后一天",
        description: "是春节的前一天，主要习俗包括贴春联、挂灯笼、吃年夜饭、守岁等，象征着辞旧迎新。",
        link: "festival_new_year_eve.html",
        season: "冬季"
    }
];

// 搜索节日
function searchFestival() {
    console.log('开始搜索');
    
    const searchInput = document.getElementById('festival-search');
    if (!searchInput) {
        console.error('未找到搜索输入框');
        return;
    }
    
    const searchTerm = searchInput.value.trim();
    console.log('搜索关键词:', searchTerm);
    
    const searchResults = document.getElementById('search-results');
    if (!searchResults) {
        console.error('未找到搜索结果容器');
        return;
    }
    
    // 确保搜索结果容器可见
    searchResults.style.display = 'block';
    searchResults.style.backgroundColor = '#fff';
    searchResults.style.padding = '30px';
    searchResults.style.borderRadius = '10px';
    searchResults.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    searchResults.style.marginTop = '20px';
    
    // 隐藏所有节日相关内容
    const festivalSections = document.querySelectorAll('.festivals-grid, h3');
    festivalSections.forEach(section => {
        section.style.display = 'none';
    });
    
    if (!searchTerm) {
        // 如果搜索词为空，显示所有节日
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        
        // 显示所有节日相关内容
        festivalSections.forEach(section => {
            section.style.display = 'block';
        });
        
        console.log('搜索词为空，显示所有节日');
        return;
    }
    
    // 保存搜索历史
    saveSearchHistory(searchTerm);
    
    // 显示搜索历史
    displaySearchHistory();
    
    // 过滤节日 - 精确匹配节日名称
    const filteredFestivals = festivalData.filter(festival => {
        // 只返回节日名称完全匹配的结果
        // 这样可以确保搜索结果更加准确
        return festival.name === searchTerm;
    });
    
    console.log('搜索结果数量:', filteredFestivals.length);
    console.log('搜索结果:', filteredFestivals);
    
    // 处理搜索结果
    if (filteredFestivals.length > 0) {
        // 显示搜索结果列表
        let resultsHTML = '<h3 style="text-align: center; color: #c0392b; margin-bottom: 30px;">搜索结果</h3>';
        resultsHTML += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">';
        
        filteredFestivals.forEach(festival => {
            resultsHTML += `
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                    <h4 style="color: #c0392b; font-size: 24px; margin-bottom: 20px; font-family: 'SimSun', serif;">${festival.name} <span style="font-size: 16px; color: #666;">（${festival.date}）</span></h4>
                    <p style="font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 20px;">${festival.description}</p>
                    <a href="${festival.link}" style="display: inline-block; background-color: #c0392b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px; transition: background-color 0.3s ease;">查看详情</a>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        searchResults.innerHTML = resultsHTML;
        console.log('搜索结果已显示');
        
        // 如果只有一个搜索结果，自动跳转到该节日的详细页面
        if (filteredFestivals.length === 1) {
            console.log('只有一个搜索结果，跳转到:', filteredFestivals[0].link);
            window.open(filteredFestivals[0].link, '_blank');
        }
    } else {
        // 显示无结果提示
        searchResults.innerHTML = '<h3 style="text-align: center; color: #c0392b; margin-bottom: 30px;">搜索结果</h3><p style="text-align: center; color: #666; margin: 30px 0;">未找到匹配的节日，请尝试其他关键词。</p>';
        console.log('未找到搜索结果');
    }
}

// 清空搜索
function clearSearch() {
    console.log('开始清空搜索');
    
    const searchInput = document.getElementById('festival-search');
    if (!searchInput) {
        console.error('未找到搜索输入框');
        return;
    }
    
    const searchResults = document.getElementById('search-results');
    if (!searchResults) {
        console.error('未找到搜索结果容器');
        return;
    }
    
    // 清空搜索框
    searchInput.value = '';
    
    // 清空搜索结果
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';
    
    // 显示所有节日相关内容
    const festivalSections = document.querySelectorAll('.festivals-grid, h3');
    festivalSections.forEach(section => {
        section.style.display = 'block';
    });
    
    // 显示搜索历史
    displaySearchHistory();
    
    console.log('搜索已清空，页面已恢复');
}

// 保存搜索历史
function saveSearchHistory(term) {
    // 从localStorage获取现有历史
    let history = JSON.parse(localStorage.getItem('festivalSearchHistory')) || [];
    
    // 移除重复项
    history = history.filter(item => item !== term);
    
    // 添加新搜索词到开头
    history.unshift(term);
    
    // 限制历史记录数量为10条
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    // 保存到localStorage
    localStorage.setItem('festivalSearchHistory', JSON.stringify(history));
}

// 显示搜索历史
function displaySearchHistory() {
    const searchHistory = document.getElementById('search-history');
    if (!searchHistory) return;
    
    // 从localStorage获取历史
    const history = JSON.parse(localStorage.getItem('festivalSearchHistory')) || [];
    
    if (history.length > 0) {
        let historyHTML = '<p>搜索历史：';
        history.forEach((term, index) => {
            historyHTML += `<span style="margin: 0 5px; padding: 5px 10px; background-color: #f0f0f0; border-radius: 15px; cursor: pointer; font-size: 14px;" onclick="searchWithHistory('${term}')">${term}</span>`;
        });
        historyHTML += `<span style="margin: 0 5px; padding: 5px 10px; background-color: #e74c3c; color: white; border-radius: 15px; cursor: pointer; font-size: 14px;" onclick="clearSearchHistory()">清除历史</span>`;
        historyHTML += '</p>';
        searchHistory.innerHTML = historyHTML;
    } else {
        searchHistory.innerHTML = '<p>暂无搜索历史</p>';
    }
}

// 使用历史记录搜索
function searchWithHistory(term) {
    const searchInput = document.getElementById('festival-search');
    searchInput.value = term;
    searchFestival();
}

// 清空搜索历史
function clearSearchHistory() {
    localStorage.removeItem('festivalSearchHistory');
    displaySearchHistory();
}

// 输入联想功能
function addFestivalSuggestions() {
    const searchInput = document.getElementById('festival-search');
    if (!searchInput) return;
    
    let suggestionContainer = null;
    
    // 输入事件监听
    searchInput.addEventListener('input', function() {
        const value = this.value.trim();
        
        // 清除旧的联想容器
        if (suggestionContainer) {
            suggestionContainer.remove();
            suggestionContainer = null;
        }
        
        // 如果输入为空，不显示联想
        if (!value) {
            return;
        }
        
        // 过滤匹配的节日
        const matchedFestivals = festivalData.filter(festival => {
            return festival.name.includes(value) || 
                   festival.description.includes(value) || 
                   festival.season.includes(value);
        });
        
        if (matchedFestivals.length > 0) {
            // 创建联想容器
            suggestionContainer = document.createElement('div');
            suggestionContainer.className = 'festival-suggestions';
            suggestionContainer.style.position = 'absolute';
            suggestionContainer.style.top = '100%';
            suggestionContainer.style.left = '50%';
            suggestionContainer.style.transform = 'translateX(-50%)';
            suggestionContainer.style.width = '60%';
            suggestionContainer.style.maxWidth = '500px';
            suggestionContainer.style.backgroundColor = '#fff';
            suggestionContainer.style.border = '2px solid #c0392b';
            suggestionContainer.style.borderRadius = '0 0 25px 25px';
            suggestionContainer.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            suggestionContainer.style.zIndex = '1000';
            suggestionContainer.style.maxHeight = '300px';
            suggestionContainer.style.overflowY = 'auto';
            suggestionContainer.style.marginTop = '2px';
            
            // 添加联想项
            matchedFestivals.forEach(festival => {
                const item = document.createElement('div');
                item.className = 'festival-suggestion-item';
                item.style.padding = '12px 20px';
                item.style.cursor = 'pointer';
                item.style.fontSize = '16px';
                item.style.color = '#333';
                item.style.borderBottom = '1px solid #f0f0f0';
                item.style.transition = 'background-color 0.2s ease';
                
                // 高亮匹配部分
                let highlightedName = festival.name;
                if (festival.name.includes(value)) {
                    const regex = new RegExp(`(${value})`, 'gi');
                    highlightedName = festival.name.replace(regex, '<span style="color: #c0392b; font-weight: bold;">$1</span>');
                }
                
                item.innerHTML = `${highlightedName} <span style="font-size: 14px; color: #666;">（${festival.season}）</span>`;
                
                // 鼠标悬停效果
                item.addEventListener('mouseover', function() {
                    this.style.backgroundColor = '#f9f9f9';
                });
                
                item.addEventListener('mouseout', function() {
                    this.style.backgroundColor = '#fff';
                });
                
                // 点击选择
                item.addEventListener('click', function() {
                    searchInput.value = festival.name;
                    if (suggestionContainer) {
                        suggestionContainer.remove();
                        suggestionContainer = null;
                    }
                    // 触发搜索
                    searchFestival();
                });
                
                suggestionContainer.appendChild(item);
            });
            
            // 添加到父容器
            const parent = searchInput.parentElement;
            parent.style.position = 'relative';
            parent.appendChild(suggestionContainer);
        }
    });
    
    // 点击其他地方关闭联想
    document.addEventListener('click', function(event) {
        if (suggestionContainer && !searchInput.contains(event.target) && !suggestionContainer.contains(event.target)) {
            suggestionContainer.remove();
            suggestionContainer = null;
        }
    });
    
    // 键盘导航
    searchInput.addEventListener('keydown', function(e) {
        if (!suggestionContainer) return;
        
        const items = suggestionContainer.querySelectorAll('.festival-suggestion-item');
        let activeItem = suggestionContainer.querySelector('.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                activeItem.style.backgroundColor = '#fff';
                const nextItem = activeItem.nextElementSibling;
                if (nextItem) {
                    nextItem.classList.add('active');
                    nextItem.style.backgroundColor = '#f9f9f9';
                    nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    items[0].classList.add('active');
                    items[0].style.backgroundColor = '#f9f9f9';
                    items[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                items[0].classList.add('active');
                items[0].style.backgroundColor = '#f9f9f9';
                items[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                activeItem.style.backgroundColor = '#fff';
                const prevItem = activeItem.previousElementSibling;
                if (prevItem) {
                    prevItem.classList.add('active');
                    prevItem.style.backgroundColor = '#f9f9f9';
                    prevItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    items[items.length - 1].classList.add('active');
                    items[items.length - 1].style.backgroundColor = '#f9f9f9';
                    items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                items[items.length - 1].classList.add('active');
                items[items.length - 1].style.backgroundColor = '#f9f9f9';
                items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeItem) {
                // 点击选中的项
                activeItem.click();
            } else {
                // 执行搜索
                searchFestival();
            }
        }
    });
}

// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化搜索功能');
    
    // 初始化搜索历史显示
    displaySearchHistory();
    
    // 添加输入联想功能
    addFestivalSuggestions();
    
    // 绑定搜索输入框事件
    const searchInput = document.getElementById('festival-search');
    if (searchInput) {
        console.log('找到搜索输入框，绑定事件');
        // 使用keydown事件，确保在所有浏览器中都能正常工作
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                console.log('回车键被按下，执行搜索');
                e.preventDefault(); // 阻止默认行为
                searchFestival();
            }
        });
        
        // 绑定input事件，实时显示联想
        searchInput.addEventListener('input', function() {
            console.log('输入内容变化:', this.value);
        });
    } else {
        console.error('未找到搜索输入框');
    }
    
    // 绑定搜索按钮点击事件
    const searchButton = document.querySelector('button[onclick="searchFestival()"]');
    if (searchButton) {
        console.log('找到搜索按钮，绑定点击事件');
        // 移除内联onclick属性，使用事件监听器
        searchButton.removeAttribute('onclick');
        searchButton.addEventListener('click', function() {
            console.log('搜索按钮被点击，执行搜索');
            searchFestival();
        });
    } else {
        console.error('未找到搜索按钮');
    }
    
    // 绑定清空按钮点击事件
    const clearButton = document.querySelector('button[onclick="clearSearch()"]');
    if (clearButton) {
        console.log('找到清空按钮，绑定点击事件');
        // 移除内联onclick属性，使用事件监听器
        clearButton.removeAttribute('onclick');
        clearButton.addEventListener('click', function() {
            console.log('清空按钮被点击，执行清空');
            clearSearch();
        });
    } else {
        console.error('未找到清空按钮');
    }
});