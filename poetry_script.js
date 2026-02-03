// 诗歌页面统一脚本

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化滚动动画
    initScrollAnimations();
    
    // 初始化返回顶部按钮
    initBackToTop();
    
    // 初始化诗歌导航激活状态
    initPoetryNav();
});

// 滚动动画初始化
function initScrollAnimations() {
    const sections = document.querySelectorAll('.poetry-detail-section');
    
    function checkVisibility() {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top <= windowHeight * 0.8 && rect.bottom >= 0) {
                section.classList.add('visible');
            }
        });
    }
    
    // 初始检查
    checkVisibility();
    
    // 滚动时检查
    window.addEventListener('scroll', checkVisibility);
}

// 返回顶部按钮初始化
function initBackToTop() {
    // 创建返回顶部按钮
    const backToTopBtn = document.createElement('a');
    backToTopBtn.href = '#';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.title = '返回顶部';
    
    // 添加到页面
    document.body.appendChild(backToTopBtn);
    
    // 滚动事件监听
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // 点击事件
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 诗歌导航初始化
function initPoetryNav() {
    const navLinks = document.querySelectorAll('.poetry-nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
}

// 平滑滚动到锚点
function smoothScrollToAnchor(anchorId) {
    const element = document.getElementById(anchorId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth'
        });
    }
}
