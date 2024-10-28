class VersionSelector {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadVersions('official');
        this.currentDownloadUrl = null;
    }

    initializeElements() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.select = document.getElementById('blender-version-select');
        this.downloadButton = document.getElementById('download-button');
        this.modal = document.getElementById('unofficial-warning');
        this.proceedButton = document.getElementById('proceed-download');
        this.typeDescription = document.getElementById('version-type-description');
        this.latestVersion = document.getElementById('latest-version');
        this.releaseDate = document.getElementById('release-date');
    }

    bindEvents() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.handleTabClick(tab));
        });

        this.select.addEventListener('change', () => this.handleVersionChange());
        this.downloadButton.addEventListener('click', () => this.handleDownload());
        this.proceedButton.addEventListener('click', () => this.proceedWithDownload());
    }

    async loadVersions(type) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        this.select.parentNode.appendChild(loadingDiv);

        try {
            const response = await fetch('https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/versions.json');
            const files = await response.json();
            files.sort().reverse();

            const promises = files.map(file => 
                fetch(`https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/${file}`)
                    .then(response => response.json())
            );

            const dataArray = await Promise.all(promises);
            this.populateVersionSelect(dataArray, files, type === 'unofficial');
        } catch (error) {
            console.error('Error loading versions:', error);
        } finally {
            loadingDiv.remove();
        }
    }

    populateVersionSelect(dataArray, files, isUnofficial) {
        this.select.innerHTML = '<option value="">Choose your Blender version</option>';
        
        dataArray.forEach((data, index) => {
            if ((isUnofficial && data.unofficial) || (!isUnofficial && data.official)) {
                const option = document.createElement('option');
                option.value = files[index];
                option.textContent = data.version;
                this.select.appendChild(option);
            }
        });
    }

    async handleVersionChange() {
        const selectedFile = this.select.value;
        if (!selectedFile) return;

        try {
            const response = await fetch(`https://raw.githubusercontent.com/unofficalcats/unofficalcatswebsite/main/json/BlenderVersions/${selectedFile}`);
            const data = await response.json();
            
            const isUnofficial = document.querySelector('.tab-button.active').dataset.type === 'unofficial';
            const versionData = isUnofficial ? data.unofficial : data.official;

            this.latestVersion.textContent = data.latestVersion || 'N/A';
            this.releaseDate.textContent = data.releaseDate || 'N/A';
            this.currentDownloadUrl = versionData?.downloadLink || null;
            
            this.downloadButton.disabled = !this.currentDownloadUrl;
        } catch (error) {
            console.error('Error loading version details:', error);
        }
    }

    handleTabClick(tab) {
        this.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const type = tab.dataset.type;
        this.loadVersions(type);
        this.updateTypeDescription(type);
    }

    updateTypeDescription(type) {
        const descriptions = {
            official: "Official Cats plugin supports Blender versions up to 3.6. Recommended for Blender 3.5 and below.",
            unofficial: "Unofficial Cats plugin supports Blender 3.6 to 4.2. Recommended for newer Blender versions."
        };
        this.typeDescription.textContent = descriptions[type];
    }

    handleDownload() {
        const type = document.querySelector('.tab-button.active').dataset.type;
        if (type === 'unofficial') {
            this.modal.style.display = 'block';
        } else {
            this.proceedWithDownload();
        }
    }

    proceedWithDownload() {
        if (this.currentDownloadUrl) {
            window.location.href = this.currentDownloadUrl;
        }
        this.modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VersionSelector();
});
