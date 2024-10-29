document.addEventListener('DOMContentLoaded', () => {
    // Core DOM elements
    const faqContainer = document.getElementById('faq-container');
    const loadingDiv = document.getElementById('loading');
    const errorContainer = document.getElementById('error-container');
    const searchInput = document.getElementById('faqSearch');
    const categoriesList = document.getElementById('categoriesList');
    
    // Global data storage
    let faqData = [];
    let categoriesData = [];

    // GitHub URLs
    const baseUrl = 'https://raw.githubusercontent.com/teamneoneko/unofficalcatswebsite/main/data';
    const categoriesUrl = `${baseUrl}/categories.json`;
    const faqBaseUrl = `${baseUrl}/faq`;

    // Fetch FAQ data and categories from GitHub
    async function fetchFAQData() {
        try {
            const categoriesResponse = await fetch(categoriesUrl);
            if (!categoriesResponse.ok) {
                throw new Error('Failed to fetch categories');
            }
            
            const categoriesData = await categoriesResponse.json();
            const categories = categoriesData.categories;
            
            // Fetch all category and subcategory FAQ files in parallel
            const faqPromises = categories.map(category => {
                const mainFileName = category.name.toLowerCase().replace(/\s+/g, '-');
                const mainPromise = fetch(`${faqBaseUrl}/${mainFileName}.json`)
                    .then(response => response.json())
                    .catch(error => {
                        console.warn(`Failed to load ${mainFileName}.json:`, error);
                        return { faqs: [] };
                    });

                const subPromises = category.subcategories ? 
                    category.subcategories.map(sub => {
                        const subFileName = sub.toLowerCase().replace(/\s+/g, '-');
                        return fetch(`${faqBaseUrl}/${subFileName}.json`)
                            .then(response => response.json())
                            .catch(error => {
                                console.warn(`Failed to load ${subFileName}.json:`, error);
                                return { faqs: [] };
                            });
                    }) : [];

                return Promise.all([mainPromise, ...subPromises]);
            });
    
            const faqResults = await Promise.all(faqPromises.flat());
            
            // Combine all FAQs into one array
            const combinedFaqs = faqResults.reduce((acc, result) => {
                return acc.concat(result.faqs);
            }, []);
    
            return {
                faqData: combinedFaqs,
                categoriesData: categories
            };
        } catch (error) {
            throw new Error('Failed to fetch FAQ data');
        }
    }
    
    // Render FAQ content with enhanced formatting
    function renderFAQ(faqData, categoriesData) {
        loadingDiv.style.display = 'none';
        faqContainer.innerHTML = '';
        categoriesList.innerHTML = '';
        
        // Render categories and subcategories in sidebar
        categoriesData.forEach(category => {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'category-container';
            
            const categoryLink = document.createElement('a');
            categoryLink.href = `#${category.name.toLowerCase().replace(/\s+/g, '-')}`;
            categoryLink.textContent = category.name;
            categoryLink.className = 'category-link';
            
            const subcategoryList = document.createElement('div');
            subcategoryList.className = 'subcategory-list';
            
            if (category.subcategories) {
                category.subcategories.forEach(subcategory => {
                    const subcategoryLink = document.createElement('a');
                    subcategoryLink.href = `#${subcategory.toLowerCase().replace(/\s+/g, '-')}`;
                    subcategoryLink.textContent = subcategory;
                    subcategoryLink.className = 'subcategory-link';
                    subcategoryList.appendChild(subcategoryLink);
                });
            }
            
            categoryContainer.appendChild(categoryLink);
            categoryContainer.appendChild(subcategoryList);
            categoriesList.appendChild(categoryContainer);
        });
    
        // Render FAQ content by category and subcategory
        categoriesData.forEach(category => {
            const categoryFAQs = faqData.filter(faq => faq.category === category.name);
            
            if (categoryFAQs.length > 0) {
                const section = document.createElement('section');
                section.id = category.name.toLowerCase().replace(/\s+/g, '-');
                section.className = 'markdown-content';
                
                const categoryTitle = document.createElement('h2');
                categoryTitle.textContent = category.name;
                section.appendChild(categoryTitle);

                // Render main category FAQs
                renderFAQItems(categoryFAQs, section);

                // Render subcategory FAQs
                if (category.subcategories) {
                    category.subcategories.forEach(subcategory => {
                        const subcategoryFAQs = faqData.filter(faq => faq.subcategory === subcategory);
                        if (subcategoryFAQs.length > 0) {
                            const subsection = document.createElement('section');
                            subsection.id = subcategory.toLowerCase().replace(/\s+/g, '-');
                            
                            const subTitle = document.createElement('h3');
                            subTitle.textContent = subcategory;
                            subsection.appendChild(subTitle);

                            renderFAQItems(subcategoryFAQs, subsection);
                            section.appendChild(subsection);
                        }
                    });
                }
    
                faqContainer.appendChild(section);
            }
        });
    }    

    function formatContent(content) {
        if (content.includes('[raw-markdown]')) {
            return content
                .replace('[raw-markdown]', '')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>')
                .replace(/`(.*?)`/g, '<code>$1</code>');
        }
    
        let processedContent = content;
        
        processedContent = processedContent.replace(/(\|.*\|\n?)+/g, match => {
            const rows = match.trim().split('\n');
            return '<table>' + rows.map(row => {
                const cells = row.split('|').filter(cell => cell.trim().length > 0);
                return '<tr>' + cells.map(cell => `<td>${cell.trim()}</td>`).join('') + '</tr>';
            }).join('') + '</table>';
        });
    
        processedContent = processedContent.replace(/(?:^\d+\.\s+.*(?:\n|$))+/gm, match => {
            const items = match.split('\n').filter(item => item.trim());
            return '<ol>' + items.map(item => {
                const content = item.replace(/^\d+\.\s+/, '');
                return `<li>${content}</li>`;
            }).join('') + '</ol>';
        });
    
        processedContent = processedContent.replace(/(?:^>\s*.*(?:\n|$))+/gm, match => {
            const lines = match.split('\n').filter(line => line.trim());
            const content = lines.map(line => line.replace(/^>\s*/, '')).join('<br>');
            return `<blockquote>${content}</blockquote>`;
        });
    
        return processedContent
            .replace(/\[image:(\d+):(\d+)\](.*?)\[\/image\]/g, '<img loading="lazy" src="$3" width="$1" height="$2" alt="FAQ Image">')
            .replace(/\[image\](.*?)\[\/image\]/g, '<img loading="lazy" src="$1" alt="FAQ Image">')
            .replace(/\[link\](.*?)\|(.*?)\[\/link\]/g, '<a href="$1">$2</a>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
            .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
            .replace(/^\- (.*?)$/gm, '• $1')
            .replace(/\[color:(.*?)\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>')
            .replace(/\[details\]([^|]*?)\|([\s\S]*?)\[\/details\]/gs, '<details class="faq-details"><summary class="faq-summary">$1</summary><div class="faq-details-content">$2</div></details>')
            .replace(/\[info\]([\s\S]*?)\[\/info\]/gs, '<div class="info-callout">$1</div>')
            .replace(/\[warning\]([\s\S]*?)\[\/warning\]/gs, '<div class="warning-callout">$1</div>')
            .replace(/\[note\]([\s\S]*?)\[\/note\]/gs, '<div class="note-callout">$1</div>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }   

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const sections = document.querySelectorAll('.wiki-content section');
        const faqContainer = document.getElementById('faq-container');
        let totalVisibleItems = 0;
        
        if (!searchTerm) {
            renderFAQ(faqData, categoriesData);
            return;
        }
        
        faqContainer.innerHTML = '';
        categoriesData.forEach(category => {
            const categoryFAQs = faqData.filter(faq => faq.category === category.name);
            const section = document.createElement('section');
            section.id = category.name.toLowerCase().replace(/\s+/g, '-');
            section.className = 'markdown-content';
            
            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.name;
            section.appendChild(categoryTitle);
            
            let visibleItems = 0;
            
            const categoryMatches = category.name.toLowerCase().includes(searchTerm);
            
            categoryFAQs.forEach(faq => {
                const text = `${faq.question} ${faq.answer}`.toLowerCase();
                const keywords = faq.keywords || [];
                
                const matchesText = text.includes(searchTerm);
                const matchesKeywords = keywords.some(keyword => 
                    keyword.toLowerCase().includes(searchTerm)
                );
                
                if (matchesText || matchesKeywords || categoryMatches) {
                    visibleItems++;
                    totalVisibleItems++;
                    
                    const faqItem = document.createElement('div');
                    faqItem.className = 'faq-item';
                    faqItem.dataset.keywords = faq.keywords ? faq.keywords.join(',') : '';
                    
                    const question = document.createElement('h3');
                    question.className = 'faq-question';
                    question.innerHTML = `${faq.question} <span class="toggle-icon">+</span>`;
                    
                    const answer = document.createElement('div');
                    answer.className = 'faq-content hidden markdown-content';
                    const formattedContent = formatContent(faq.answer);
                    
                    const metadata = `
                        <div class="faq-metadata">
                            <button class="version-history-btn" data-faq-id="${faq.id || ''}">
                                <span class="version-badge">v${faq.version || '1.0'}</span>
                                <span class="last-updated"><i class="fas fa-clock"></i> ${faq.lastUpdated ? new Date(faq.lastUpdated).toLocaleDateString() : 'N/A'}</span>
                                <span class="history-icon"><i class="fas fa-history"></i></span>
                            </button>
                        </div>
                    `;                   
                    
                    answer.innerHTML = formattedContent + metadata;
                    
                    question.addEventListener('click', () => {
                        const wasHidden = answer.classList.contains('hidden');
                        
                        document.querySelectorAll('.faq-content').forEach(content => {
                            content.classList.add('hidden');
                            content.previousElementSibling.querySelector('.toggle-icon').textContent = '+';
                        });
                        
                        if (wasHidden) {
                            answer.classList.remove('hidden');
                            question.querySelector('.toggle-icon').textContent = '-';
                        }
                    });
                    
                    faqItem.appendChild(question);
                    faqItem.appendChild(answer);
                    section.appendChild(faqItem);
                }
            });
            
            if (visibleItems > 0 || categoryMatches) {
                faqContainer.appendChild(section);
            }
            
            const categoryId = section.id;
            const sidebarLink = document.querySelector(`.wiki-nav a[href="#${categoryId}"]`);
            if (sidebarLink) {
                sidebarLink.style.display = (visibleItems > 0 || categoryMatches) ? 'block' : 'none';
            }
        });
    
        if (totalVisibleItems === 0) {
            faqContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>There are no results for this search. Please try again using different keywords.</p>
                </div>
            `;
        }
    });
        
    // Version history popup handler
    document.addEventListener('click', (e) => {
        if (e.target.closest('.version-history-btn')) {
            const faqId = e.target.closest('.version-history-btn').dataset.faqId;
            const faq = faqData.find(f => f.id === parseInt(faqId));
            
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            
            const modal = document.createElement('div');
            modal.className = 'version-history-modal';
            modal.innerHTML = `
                <h3>Version History</h3>
                ${faq.history ? faq.history.map(h => `
                    <div class="history-item">
                        <div class="history-version">Version ${h.version}</div>
                        <div class="history-date">${new Date(h.date).toLocaleDateString()}</div>
                        <div class="history-changes">${h.changes}</div>
                    </div>
                `).join('') : '<div class="history-item">No version history available</div>'}                
                <button class="close-modal">Close</button>
            `;
            
            document.body.appendChild(overlay);
            document.body.appendChild(modal);
            
            const closeModal = () => {
                overlay.remove();
                modal.remove();
            };
            
            overlay.addEventListener('click', closeModal);
            modal.querySelector('.close-modal').addEventListener('click', closeModal);
        }
    });

    // Initialize with GitHub data
    fetchFAQData()
        .then(({ faqData: data, categoriesData: categories }) => {
            faqData = data;
            categoriesData = categories;
            console.log('Data received:', { faqData, categoriesData });
            renderFAQ(faqData, categoriesData);
        })
        .catch(error => {
            loadingDiv.style.display = 'none';
            errorContainer.style.display = 'block';
            errorContainer.querySelector('#errorMessage').textContent = error.message;
        });
});

