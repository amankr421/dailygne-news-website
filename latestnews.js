// ==== RSS Sources ====
const RSS_FEEDS = {
  trending: "https://feeds.bbci.co.uk/news/rss.xml",
  breaking: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
  india: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
  world: "https://feeds.bbci.co.uk/news/world/rss.xml",
  business: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
  sports: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
  technology: "https://www.gadgets360.com/rss/news",
  science: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  health: "https://www.thehindu.com/sci-tech/health/?service=rss",
  entertainment: "https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml",
  bollywood: "https://www.bollywoodhungama.com/feed/",
  environment: "https://www.downtoearth.org.in/rss/all.xml",
  cities: "https://timesofindia.indiatimes.com/rssfeeds/-2128838597.cms",
  opinion: "https://indianexpress.com/section/opinion/feed/",
  politics: "https://feeds.feedburner.com/ndtvnews-top-stories",
  mobile: "https://www.gsmarena.com/rss-news-reviews.php3",
  laptop: "https://tech.hindustantimes.com/rss/laptops-pc",
  ai: "https://artificialintelligence-news.com/feed/",
  techcrunch: "https://techcrunch.com/feed/",
  analyticsIndia: "https://analyticsindiamag.com/feed/",
  gadgets360: "https://feeds.feedburner.com/gadgets360-latest",
  bbcTech: "https://feeds.bbci.co.uk/news/technology/rss.xml",
  education: "https://timesofindia.indiatimes.com/rssfeeds/913168846.cms",
  educationToday: "https://www.indiatoday.in/rss/1206614",
  startup: "https://yourstory.com/feed",
  space: "https://www.space.com/feeds/all",
  hinduEducation: "https://www.thehindu.com/education/feeder/default.rss"
};

const CATEGORY_NAMES = {
  trending: "Trending",
  breaking: "Breaking News",
  india: "India",
  world: "World",
  business: "Business",
  sports: "Sports",
  technology: "Technology",
  science: "Science",
  health: "Health",
  entertainment: "Entertainment",
  bollywood: "Bollywood",
  environment: "Environment",
  cities: "Cities",
  opinion: "Opinion",
  politics: "Politics",
  mobile: "Mobile",
  laptop: "Laptops",
  ai: "AI & Machine Learning",
  techcrunch: "TechCrunch",
  analyticsIndia: "Analytics India",
  gadgets360: "Gadgets360",
  bbcTech: "BBC Tech",
  education: "Education",
  startup: "Startup",
  space: "Space",
  hinduEducation: "The Hindu Education"
};

// App State
const state = {
    currentCategory: 'trending',
    articles: [],
    displayedArticles: 12,
    isLoading: false,
    allArticles: [], // Store all articles for search functionality
    isSearchActive: false,
    currentSearchQuery: ''
};

// DOM Elements
const elements = {
    newsGrid: document.getElementById('newsGrid'),
    categoryTags: document.getElementById('categoryTags'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    themeToggle: document.getElementById('themeToggle'),
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    nav: document.querySelector('.nav'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.querySelector('.search-btn'),
    exploreBtn: document.getElementById('exploreBtn'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    sectionTitle: document.querySelector('.section-title')
};

// Initialize the application
function init() {
    renderCategoryTags();
    loadTrendingNews();
    setupEventListeners();
    checkThemePreference();
    setupResponsiveHandlers();
}

// Setup responsive event handlers
function setupResponsiveHandlers() {
    // Handle window resize for responsive behavior
    window.addEventListener('resize', debounce(() => {
        adjustLayoutForScreenSize();
    }, 250));
    
    // Initial layout adjustment
    adjustLayoutForScreenSize();
}

// Adjust layout based on screen size
function adjustLayoutForScreenSize() {
    const width = window.innerWidth;
    
    // Adjust news grid columns for different screen sizes
    if (width < 768) {
        // Mobile - single column
        document.documentElement.style.setProperty('--grid-columns', '1fr');
    } else if (width < 1024) {
        // Tablet - 2 columns
        document.documentElement.style.setProperty('--grid-columns', 'repeat(2, 1fr)');
    } else {
        // Desktop - 3 columns
        document.documentElement.style.setProperty('--grid-columns', 'repeat(auto-fill, minmax(380px, 1fr))');
    }
    
    // Adjust hero layout
    const heroContainer = document.querySelector('.hero-container');
    if (heroContainer) {
        if (width < 768) {
            heroContainer.style.gridTemplateColumns = '1fr';
            heroContainer.style.gap = '2rem';
            heroContainer.style.textAlign = 'center';
        } else {
            heroContainer.style.gridTemplateColumns = '1fr 1fr';
            heroContainer.style.gap = '4rem';
            heroContainer.style.textAlign = 'left';
        }
    }
}

// Render category tags (ALL categories)
function renderCategoryTags() {
    const allCategories = Object.keys(CATEGORY_NAMES);
    
    // Clear existing tags first
    elements.categoryTags.innerHTML = '';
    
    allCategories.forEach(category => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.textContent = CATEGORY_NAMES[category];
        tag.dataset.category = category;
        
        tag.addEventListener('click', () => {
            // Remove active class from all tags
            document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            tag.classList.add('active');
            // Reset search state
            state.isSearchActive = false;
            state.currentSearchQuery = '';
            elements.searchInput.value = '';
            // Load news for selected category
            loadNewsByCategory(category);
        });
        
        elements.categoryTags.appendChild(tag);
    });
    
    // Set trending as active by default
    const trendingTag = document.querySelector('.category-tag[data-category="trending"]');
    if (trendingTag) {
        trendingTag.classList.add('active');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Mobile menu toggle
    elements.mobileMenuToggle.addEventListener('click', () => {
        elements.nav.classList.toggle('active');
        // Update menu icon
        const icon = elements.mobileMenuToggle.querySelector('i');
        icon.className = elements.nav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
    
    // Load more button
    elements.loadMoreBtn.addEventListener('click', loadMoreArticles);
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            if (category) {
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update active category tag
                document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
                const correspondingTag = document.querySelector(`.category-tag[data-category="${category}"]`);
                if (correspondingTag) {
                    correspondingTag.classList.add('active');
                }
                
                // Reset search state
                state.isSearchActive = false;
                state.currentSearchQuery = '';
                elements.searchInput.value = '';
                
                loadNewsByCategory(category);
            }
        });
    });
    
    // Footer category links
    document.querySelectorAll('.footer-section a[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            
            // Reset search state
            state.isSearchActive = false;
            state.currentSearchQuery = '';
            elements.searchInput.value = '';
            
            loadNewsByCategory(category);
            
            // Scroll to news section
            document.querySelector('.main').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Search functionality - Input
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Search functionality - Button
    elements.searchBtn.addEventListener('click', handleSearchButton);
    
    // Enter key in search
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearchButton();
        }
    });
    
    // Explore button
    elements.exploreBtn.addEventListener('click', () => {
        document.querySelector('.main').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Newsletter form in footer
    const newsletterForm = document.querySelector('.mini-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = e.target.querySelector('input[type="email"]');
            if (emailInput) {
                const email = emailInput.value;
                if (email) {
                    alert(`Thank you for subscribing with ${email}! You'll receive our latest updates soon.`);
                    emailInput.value = '';
                }
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.nav.classList.contains('active') && 
            !elements.nav.contains(e.target) && 
            !elements.mobileMenuToggle.contains(e.target)) {
            elements.nav.classList.remove('active');
            elements.mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
        }
    });
}

// Load trending news (mix of categories)
async function loadTrendingNews() {
    state.currentCategory = 'trending';
    state.isLoading = true;
    state.isSearchActive = false;
    showLoadingSpinner();
    hideError();
    
    // Update section title
    updateSectionTitle('Latest News');
    
    try {
        // Select a few popular categories for trending
        const trendingCategories = ['india', 'world', 'technology', 'business', 'sports'];
        const allArticles = [];
        
        // Fetch from multiple categories
        for (const category of trendingCategories) {
            const articles = await fetchRSSFeed(RSS_FEEDS[category], category);
            if (articles && articles.length > 0) {
                allArticles.push(...articles.slice(0, 4));
            }
        }
        
        // Shuffle and limit articles
        state.articles = shuffleArray(allArticles).slice(0, 20);
        state.allArticles = [...state.articles]; // Store for search
        renderNewsGrid();
        
        // Also try to load real RSS in background
        setTimeout(() => {
            loadRealRSSFeeds();
        }, 1000);
        
    } catch (error) {
        console.error('Error loading trending news:', error);
        // Even if error, show mock data
        const mockArticles = generateMockArticles('trending');
        state.articles = mockArticles.slice(0, 12);
        state.allArticles = [...state.articles];
        renderNewsGrid();
    } finally {
        state.isLoading = false;
        hideLoadingSpinner();
    }
}

// Load news by category
async function loadNewsByCategory(category) {
    state.currentCategory = category;
    state.displayedArticles = 12;
    state.isLoading = true;
    state.isSearchActive = false;
    showLoadingSpinner();
    hideError();
    
    // Update section title
    updateSectionTitle(CATEGORY_NAMES[category] || 'Latest News');
    
    try {
        // First try real RSS
        const feedUrl = RSS_FEEDS[category];
        const articles = await fetchRSSFeed(feedUrl, category);
        
        if (articles && articles.length > 0) {
            state.articles = articles;
            state.allArticles = [...articles]; // Store for search
        } else {
            // Fallback to mock data
            throw new Error('No articles from RSS');
        }
        
        renderNewsGrid();
    } catch (error) {
        console.log(`Using mock data for ${category}:`, error.message);
        // Use mock data as fallback
        state.articles = generateMockArticles(category);
        state.allArticles = [...state.articles]; // Store for search
        renderNewsGrid();
    } finally {
        state.isLoading = false;
        hideLoadingSpinner();
    }
}

// Try to load real RSS feeds (background process)
async function loadRealRSSFeeds() {
    try {
        const categories = ['india', 'world', 'technology'];
        for (const category of categories) {
            try {
                const feedUrl = RSS_FEEDS[category];
                const articles = await fetchRSSFeed(feedUrl, category);
                if (articles && articles.length > 0) {
                    console.log(`✅ Successfully loaded real ${category} news`);
                }
            } catch (e) {
                console.log(`❌ Failed to load real ${category} news`);
            }
        }
    } catch (error) {
        console.log('Background RSS loading failed, using mock data');
    }
}

// Fetch RSS feed with multiple proxy fallbacks
async function fetchRSSFeed(feedUrl, category) {
    const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`
    ];
    
    for (const proxyUrl of proxies) {
        try {
            console.log(`Trying proxy: ${proxyUrl}`);
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/rss+xml, application/xml, text/xml'
                }
            });
            
            if (!response.ok) continue;
            
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            
            // Check for parsing errors
            const parseError = xml.querySelector('parsererror');
            if (parseError) continue;
            
            const items = xml.querySelectorAll("item");
            const articles = [];
            
            items.forEach(item => {
                const title = item.querySelector("title")?.textContent?.trim() || "No title available";
                let link = item.querySelector("link")?.textContent?.trim() || "#";
                
                // Fix Google News links
                if (category === 'breaking' && link.startsWith('https://news.google.com/')) {
                    // Extract actual news URL from Google News redirect
                    const urlMatch = item.querySelector("description")?.textContent?.match(/href="([^"]*)"/);
                    if (urlMatch && urlMatch[1]) {
                        link = urlMatch[1];
                    }
                }
                
                let description = item.querySelector("description")?.textContent?.trim() || "Click to read full article...";
                
                // Clean description from HTML tags
                description = description.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
                
                const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
                const source = item.querySelector("source")?.textContent || CATEGORY_NAMES[category] || "News Source";
                
                // Try to extract image
                let image = item.querySelector("media\\:content, content, enclosure")?.getAttribute("url") || 
                           item.querySelector("media\\:thumbnail, thumbnail")?.getAttribute("url") || "";
                
                // Fallback placeholder image
                if (!image) {
                    image = `https://picsum.photos/400/200?random=${Math.random()}&category=${category}`;
                }
                
                articles.push({
                    title,
                    link: link || "#", // Ensure link is never empty
                    description,
                    pubDate,
                    source,
                    image,
                    category
                });
            });
            
            return articles.slice(0, 20); // Return max 20 articles
            
        } catch (error) {
            console.log(`Proxy failed: ${error.message}`);
            continue;
        }
    }
    
    throw new Error('All proxies failed');
}

// Generate realistic mock articles for all categories
function generateMockArticles(category) {
    const mockData = {
        trending: [
            {
                title: "Breaking: Major Developments Across Multiple Sectors",
                description: "Significant updates from technology, business, and politics shaping today's news landscape.",
                source: "DailyGNE",
                image: "https://picsum.photos/400/200?random=1&category=trending",
                link: "https://www.bbc.com/news"
            }
        ],
        breaking: [
            {
                title: "Breaking: Global Tech Giants Announce AI Alliance",
                description: "Major companies join hands to standardize ethical AI development worldwide.",
                source: "BBC News",
                image: "https://picsum.photos/400/200?random=11&category=breaking",
                link: "https://www.bbc.com/news/technology"
            }
        ],
        india: [
            {
                title: "India's Economy Shows Strong Growth in Q3 2024",
                description: "India's GDP growth exceeded expectations this quarter, driven by robust manufacturing and services sectors.",
                source: "Economic Times",
                image: "https://picsum.photos/400/200?random=2&category=india",
                link: "https://economictimes.indiatimes.com"
            }
        ],
        world: [
            {
                title: "Global Summit Addresses Climate Change Challenges",
                description: "World leaders gather to discuss urgent climate action and sustainable development goals.",
                source: "BBC World",
                image: "https://picsum.photos/400/200?random=3&category=world",
                link: "https://www.bbc.com/news/world"
            }
        ],
        technology: [
            {
                title: "AI Breakthrough Revolutionizes Healthcare Diagnostics",
                description: "New artificial intelligence system can detect diseases with unprecedented accuracy.",
                source: "TechCrunch",
                image: "https://picsum.photos/400/200?random=4&category=technology",
                link: "https://techcrunch.com"
            }
        ],
        business: [
            {
                title: "Stock Markets Reach All-Time High Amid Economic Recovery",
                description: "Global markets show strong performance as economic indicators continue to improve.",
                source: "Bloomberg",
                image: "https://picsum.photos/400/200?random=5&category=business",
                link: "https://www.bloomberg.com"
            }
        ],
        sports: [
            {
                title: "Indian Cricket Team Wins Championship in Thrilling Final",
                description: "In a nail-biting finish, the national team secured victory with a last-ball boundary.",
                source: "ESPN Cricinfo",
                image: "https://picsum.photos/400/200?random=8&category=sports",
                link: "https://www.espncricinfo.com"
            }
        ]
        // Add more categories as needed...
    };

    // Default data for any category
    const defaultData = [
        {
            title: `Latest ${CATEGORY_NAMES[category]} Developments`,
            description: `Stay updated with the most recent news and analysis from the ${CATEGORY_NAMES[category]} sector.`,
            source: "DailyGNE",
            image: `https://picsum.photos/400/200?random=${Math.random()}&category=${category}`,
            link: "https://www.example.com/news"
        }
    ];

    const categoryData = mockData[category] || defaultData;
    
    // Generate 12 articles by repeating and modifying
    const articles = [];
    for (let i = 0; i < 12; i++) {
        const baseArticle = categoryData[i % categoryData.length];
        articles.push({
            title: `${baseArticle.title}`,
            description: baseArticle.description,
            link: baseArticle.link || `https://www.example.com/news/${category}-${i + 1}`,
            pubDate: new Date(Date.now() - i * 3600000).toISOString(),
            source: baseArticle.source,
            image: baseArticle.image,
            category: category
        });
    }
    
    return articles;
}

// Update section title
function updateSectionTitle(title) {
    if (elements.sectionTitle) {
        const liveIndicator = elements.sectionTitle.querySelector('.live-indicator');
        elements.sectionTitle.innerHTML = `
            <img src="logo.png"class="news-logo">
            ${title}
            ${liveIndicator ? liveIndicator.outerHTML : ''}
        `;
    }
}

// Render news grid
function renderNewsGrid() {
    const articlesToShow = state.articles.slice(0, state.displayedArticles);
    
    if (articlesToShow.length === 0) {
        elements.newsGrid.innerHTML = `
            <div class="no-articles" style="grid-column: 1 / -1; text-align: center; padding: 3rem 2rem; color: var(--text-light);">
                <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>No articles found</h3>
                <p>Try selecting a different category or check back later for updates.</p>
            </div>
        `;
        elements.loadMoreBtn.style.display = 'none';
        return;
    }
    
    elements.newsGrid.innerHTML = articlesToShow.map((article, index) => `
        <div class="news-card">
            <div class="news-image">
                <img src="${article.image}" alt="${article.title}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyNTYzZWI7Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWQ0ZWQ4OyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LWZhbWlseT0iQXJpYWwiPk5ld3NOb3ZhPC90ZXh0Pjwvc3ZnPg=='">
                <div class="news-category">${CATEGORY_NAMES[article.category] || article.category}</div>
            </div>
            <div class="news-content">
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description}</p>
                <div class="news-meta">
                    <div class="news-source">
                        <div class="source-logo">${article.source.charAt(0)}</div>
                        <span>${article.source}</span>
                    </div>
                    <span>${new Date(article.pubDate).toLocaleDateString()}</span>
                </div>
                <a href="${article.link}" target="_blank" class="read-more" onclick="event.stopPropagation();">
                    Read Full Article <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');
    
    // Show/hide load more button
    elements.loadMoreBtn.style.display = state.displayedArticles < state.articles.length ? 'block' : 'none';
}

// Handle search input
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    performSearch(query);
}

// Handle search button click
function handleSearchButton() {
    const query = elements.searchInput.value.toLowerCase().trim();
    performSearch(query);
}

// Perform search functionality
function performSearch(query) {
    if (query === '') {
        // If search is empty, show current category articles
        state.isSearchActive = false;
        state.currentSearchQuery = '';
        updateSectionTitle(CATEGORY_NAMES[state.currentCategory] || 'Latest News');
        renderNewsGrid();
        return;
    }
    
    state.isSearchActive = true;
    state.currentSearchQuery = query;
    
    // Search in all stored articles
    const filteredArticles = state.allArticles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.description.toLowerCase().includes(query) ||
        (CATEGORY_NAMES[article.category] && CATEGORY_NAMES[article.category].toLowerCase().includes(query))
    );
    
    if (filteredArticles.length === 0) {
        elements.newsGrid.innerHTML = `
            <div class="no-articles" style="grid-column: 1 / -1; text-align: center; padding: 3rem 2rem; color: var(--text-light);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>No results found for "${query}"</h3>
                <p>Try different keywords or browse by category.</p>
            </div>
        `;
        elements.loadMoreBtn.style.display = 'none';
        updateSectionTitle(`Search Results for "${query}"`);
    } else {
        // Show search results
        state.articles = filteredArticles;
        state.displayedArticles = 12;
        renderNewsGrid();
        
        // Update UI to show search mode
        updateSectionTitle(`Search Results for "${query}"`);
    }
}

// Load more articles
function loadMoreArticles() {
    state.displayedArticles += 6;
    renderNewsGrid();
}

// Show loading spinner
function showLoadingSpinner() {
    elements.loadingSpinner.style.display = 'block';
    elements.newsGrid.style.display = 'none';
    elements.loadMoreBtn.style.display = 'none';
}

function hideLoadingSpinner() {
    elements.loadingSpinner.style.display = 'none';
    elements.newsGrid.style.display = 'grid';
}

// Show error message
function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.style.display = 'block';
    elements.newsGrid.style.display = 'none';
    elements.loadingSpinner.style.display = 'none';
    elements.loadMoreBtn.style.display = 'none';
}

function hideError() {
    elements.errorMessage.style.display = 'none';
}

// Theme functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle icon
    elements.themeToggle.innerHTML = newTheme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function checkThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set correct icon
    elements.themeToggle.innerHTML = savedTheme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for global access (if needed)
window.loadNewsByCategory = loadNewsByCategory;
window.loadTrendingNews = loadTrendingNews;