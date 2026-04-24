const rawData = [
    { rank: 1, name: "Massachusetts Institute of Technology (MIT)", country: "USA", acceptance: 4, tuition: 59750, gpa: 3.96, applicants: 33767, intl: 34, salary: 110000 },
    { rank: 2, name: "University of Cambridge", country: "UK", acceptance: 18, tuition: 42000, gpa: 3.92, applicants: 22000, intl: 40, salary: 75000 },
    { rank: 3, name: "University of Oxford", country: "UK", acceptance: 16, tuition: 44000, gpa: 3.94, applicants: 24000, intl: 45, salary: 78000 },
    { rank: 4, name: "Harvard University", country: "USA", acceptance: 3, tuition: 57200, gpa: 3.98, applicants: 61220, intl: 25, salary: 118000 },
    { rank: 5, name: "Stanford University", country: "USA", acceptance: 4, tuition: 56000, gpa: 3.96, applicants: 55000, intl: 24, salary: 122000 },
    { rank: 6, name: "Imperial College London", country: "UK", acceptance: 15, tuition: 38000, gpa: 3.85, applicants: 20000, intl: 60, salary: 72000 },
    { rank: 7, name: "ETH Zurich", country: "Switzerland", acceptance: 27, tuition: 1500, gpa: 3.80, applicants: 18000, intl: 40, salary: 95000 },
    { rank: 8, name: "National University of Singapore (NUS)", country: "Singapore", acceptance: 13, tuition: 32000, gpa: 3.88, applicants: 30000, intl: 30, salary: 68000 },
    { rank: 9, name: "UCL (University College London)", country: "UK", acceptance: 29, tuition: 35000, gpa: 3.80, applicants: 45000, intl: 55, salary: 65000 },
    { rank: 10, name: "University of California, Berkeley", country: "USA", acceptance: 11, tuition: 44000, gpa: 3.90, applicants: 128000, intl: 18, salary: 105000 }
];

// Generate simulated data for ranks 11 to 100
const countries = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "South Korea"];
for (let i = 11; i <= 100; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    rawData.push({
        rank: i,
        name: `Global Intelligence University ${i}`,
        country: country,
        acceptance: Math.floor(Math.random() * 40) + 5,
        tuition: Math.floor(Math.random() * 40000) + 15000,
        gpa: (Math.random() * (4.0 - 3.4) + 3.4).toFixed(2),
        applicants: Math.floor(Math.random() * 50000) + 10000,
        intl: Math.floor(Math.random() * 30) + 10,
        salary: Math.floor(Math.random() * 40000) + 50000
    });
}

// State Management
let compareList = [];
let userProfile = JSON.parse(localStorage.getItem('uniScopeProfile')) || null;

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    filterUniversities(); // Initial render
    updateProfileDisplay();
    updateCompareCount();
});

// Math & Logic
function calculateDifficultyIndex(uni) {
    const rankWeight = (101 - uni.rank) * 0.5;
    const accWeight = (100 - uni.acceptance) * 0.5;
    return Math.round(rankWeight + accWeight);
}

function getMatchCategory(uniGpa) {
    if (!userProfile || !userProfile.gpa) return null;
    const diff = userProfile.gpa - uniGpa;
    if (diff > 0.2) return { label: 'Safety', color: '#10b981' };
    if (diff >= -0.15) return { label: 'Match', color: '#6366f1' };
    return { label: 'Reach', color: '#ef4444' };
}

// Render Logic
function renderUniversities(data) {
    const grid = document.getElementById('universityGrid');
    const resultsCount = document.getElementById('resultsCount');
    grid.innerHTML = '';
    resultsCount.innerText = `Showing ${data.length} Universities`;

    data.forEach(uni => {
        const diffIndex = calculateDifficultyIndex(uni);
        const match = getMatchCategory(uni.gpa);
        const isComparing = compareList.some(c => c.rank === uni.rank);

        const card = document.createElement('div');
        card.className = 'uni-card';
        card.innerHTML = `
            ${match ? `<span class="match-badge" style="background:${match.color}">${match.label}</span>` : ''}
            <div class="card-body">
                <span class="rank-tag">Global Rank #${uni.rank}</span>
                <h3 class="uni-name">${uni.name}</h3>
                <p class="uni-loc"><i class="fa fa-location-dot"></i> ${uni.country}</p>
                
                <div class="difficulty-box">
                    <div class="diff-header">
                        <span>Admission Intensity</span>
                        <span>${diffIndex}%</span>
                    </div>
                    <div class="diff-bar">
                        <div class="diff-fill" style="width: ${diffIndex}%; background: ${diffIndex > 80 ? 'var(--danger)' : 'var(--brand)'}"></div>
                    </div>
                </div>

                <div class="stats-row">
                    <div class="stat-item">
                        <label>Acceptance</label>
                        <strong>${uni.acceptance}%</strong>
                    </div>
                    <div class="stat-item">
                        <label>Tuition</label>
                        <strong>$${(uni.tuition / 1000).toFixed(0)}k/yr</strong>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-primary" onclick="showDetails(${uni.rank})">Analytics</button>
                <button class="btn-ghost ${isComparing ? 'active' : ''}" onclick="toggleCompare(${uni.rank}, this)">
                    <i class="fa ${isComparing ? 'fa-check' : 'fa-plus'}"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterUniversities() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const country = document.getElementById('countryFilter').value;
    const maxRank = document.getElementById('rankRange').value;
    const tuition = document.getElementById('tuitionFilter').value;
    const sortBy = document.getElementById('sortOptions').value;

    document.getElementById('rankVal').innerText = maxRank;

    let filtered = rawData.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search) || u.country.toLowerCase().includes(search);
        const matchesCountry = country === 'all' || u.country === country;
        const matchesRank = u.rank <= maxRank;
        
        let matchesTuition = true;
        if (tuition === 'low') matchesTuition = u.tuition < 30000;
        if (tuition === 'mid') matchesTuition = u.tuition >= 30000 && u.tuition <= 50000;
        if (tuition === 'high') matchesTuition = u.tuition > 50000;

        return matchesSearch && matchesCountry && matchesRank && matchesTuition;
    });

    if (sortBy === 'rank') filtered.sort((a, b) => a.rank - b.rank);
    if (sortBy === 'difficulty') filtered.sort((a, b) => calculateDifficultyIndex(b) - calculateDifficultyIndex(a));
    if (sortBy === 'acceptance') filtered.sort((a, b) => a.acceptance - b.acceptance);

    renderUniversities(filtered);
}

// Compare System Logic (FIXED)
function toggleCompare(rank, btnElement) {
    const uni = rawData.find(u => u.rank === rank);
    const index = compareList.findIndex(c => c.rank === rank);

    if (index > -1) {
        // Remove from compare list
        compareList.splice(index, 1);
        if (btnElement) {
            btnElement.classList.remove('active');
            btnElement.innerHTML = `<i class="fa fa-plus"></i>`;
        }
    } else {
        // Add to compare list
        if (compareList.length >= 3) {
            alert("You can compare a maximum of 3 universities at a time.");
            return;
        }
        compareList.push(uni);
        if (btnElement) {
            btnElement.classList.add('active');
            btnElement.innerHTML = `<i class="fa fa-check"></i>`;
        }
    }
    updateCompareCount();
}

function updateCompareCount() {
    document.getElementById('compare-count').innerText = compareList.length;
}

function clearComparison() {
    compareList = [];
    updateCompareCount();
    closeComparison();
    filterUniversities(); // Re-render to reset all button states visually
}

function showComparison() {
    if (compareList.length < 2) {
        alert("Please add at least 2 universities to compare.");
        return;
    }
    
    const wrapper = document.getElementById('comparisonTableWrapper');
    
    let html = `<table class="comparison-table">
        <tr><th>Performance Metric</th>${compareList.map(u => `<th>${u.name}</th>`).join('')}</tr>
        <tr><td>Global QS World Rank</td>${compareList.map(u => `<td>#${u.rank}</td>`).join('')}</tr>
        <tr><td>Difficulty Score Index</td>${compareList.map(u => `<td>${calculateDifficultyIndex(u)}%</td>`).join('')}</tr>
        <tr><td>Overall Acceptance Rate</td>${compareList.map(u => `<td>${u.acceptance}%</td>`).join('')}</tr>
        <tr><td>Tuition Fees (Annual)</td>${compareList.map(u => `<td>$${u.tuition.toLocaleString()}</td>`).join('')}</tr>
        <tr><td>Average Entering GPA</td>${compareList.map(u => `<td>${u.gpa}</td>`).join('')}</tr>
        <tr><td>Average Graduate Salary</td>${compareList.map(u => `<td>$${u.salary.toLocaleString()}</td>`).join('')}</tr>
    </table>`;
    
    wrapper.innerHTML = html;
    document.getElementById('compareDrawer').classList.add('open');
}

function closeComparison() {
    document.getElementById('compareDrawer').classList.remove('open');
}

// Profile Logic
function toggleProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

function saveProfile() {
    const gpa = document.getElementById('userGPA').value;
    const sat = document.getElementById('userSAT').value;
    if (!gpa) return alert("Please enter your GPA to enable matching.");

    userProfile = { gpa: parseFloat(gpa), sat: sat };
    localStorage.setItem('uniScopeProfile', JSON.stringify(userProfile));
    
    updateProfileDisplay();
    toggleProfileModal();
    filterUniversities(); // Re-render strictly to show Match/Reach badges
}

function updateProfileDisplay() {
    const box = document.getElementById('activeProfileBox');
    const stats = document.getElementById('profileStatsDisplay');
    if (userProfile) {
        box.style.display = 'block';
        stats.innerHTML = `<p style="font-size: 1.1rem; font-weight: 700;">GPA: ${userProfile.gpa} ${userProfile.sat ? '| SAT: ' + userProfile.sat : ''}</p>`;
    }
}

// Analytics Modal
function showDetails(rank) {
    const uni = rawData.find(u => u.rank === rank);
    const modal = document.getElementById('detailsModal');
    const container = document.getElementById('detailsContent');
    const isComparing = compareList.some(c => c.rank === uni.rank);

    container.innerHTML = `
        <div class="modal-header">
            <div>
                <span class="rank-tag">Institution Intelligence Report</span>
                <h2 style="font-size:2.2rem; margin:10px 0; letter-spacing: -1px; color: var(--navy)">${uni.name}</h2>
                <p style="color:var(--slate-500); font-weight:500;"><i class="fa fa-location-dot"></i> ${uni.country} | Global Tier 1 Institutional Data</p>
            </div>
            <button class="close-btn" onclick="document.getElementById('detailsModal').style.display='none'">&times;</button>
        </div>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 30px 0;">
            <div style="background:var(--slate-50); padding:24px; border-radius:16px; border:1px solid var(--slate-200)">
                <label style="display:block; font-size:0.75rem; color:var(--slate-500); font-weight:700; text-transform:uppercase;">Applicants</label>
                <strong style="font-size:1.5rem; color:var(--navy)">${uni.applicants.toLocaleString()}</strong>
            </div>
            <div style="background:var(--slate-50); padding:24px; border-radius:16px; border:1px solid var(--slate-200)">
                <label style="display:block; font-size:0.75rem; color:var(--slate-500); font-weight:700; text-transform:uppercase;">Intl. Students</label>
                <strong style="font-size:1.5rem; color:var(--navy)">${uni.intl}%</strong>
            </div>
            <div style="background:var(--slate-50); padding:24px; border-radius:16px; border:1px solid var(--slate-200)">
                <label style="display:block; font-size:0.75rem; color:var(--slate-500); font-weight:700; text-transform:uppercase;">Post-Grad Salary</label>
                <strong style="font-size:1.5rem; color:var(--navy)">$${uni.salary.toLocaleString()}</strong>
            </div>
        </div>
        <div style="background:var(--navy); color:white; padding:30px; border-radius:20px;">
            <h3 style="margin-bottom:20px; font-size:1.1rem; color: var(--slate-200)">Program-Level Acceptance (Estimates)</h3>
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                <span>Computer Science & AI</span>
                <strong style="color:var(--brand)">${(uni.acceptance * 0.4).toFixed(1)}%</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                <span>Business & Management</span>
                <strong style="color:var(--brand)">${(uni.acceptance * 0.7).toFixed(1)}%</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>Liberal Arts</span>
                <strong style="color:var(--brand)">${(uni.acceptance * 1.2).toFixed(1)}%</strong>
            </div>
        </div>
        <div style="margin-top:30px; text-align:right;">
             <button class="btn-primary-action" style="width:auto; padding: 14px 40px; background: ${isComparing ? 'var(--success)' : 'var(--navy)'}" 
             onclick="toggleCompare(${uni.rank}); document.getElementById('detailsModal').style.display='none'; filterUniversities();">
                ${isComparing ? 'Remove from Comparison' : 'Add to Comparison'}
             </button>
        </div>
    `;
    modal.style.display = 'flex';
}

// Close Modals when clicking outside
window.onclick = function(event) {
    const profileModal = document.getElementById('profileModal');
    const detailsModal = document.getElementById('detailsModal');
    if (event.target === profileModal) profileModal.style.display = "none";
    if (event.target === detailsModal) detailsModal.style.display = "none";
}