// Inject critical CSS fixes to bypass browser caching
(function() {
    if (!document.getElementById('dynamic-bracket-fixes')) {
        const style = document.createElement('style');
        style.id = 'dynamic-bracket-fixes';
        style.textContent = `
            .round:not(:last-child) .match:only-child::after {
                height: 0 !important;
                border-right: none !important;
                border-bottom: none !important;
                border-radius: 0 !important;
            }
            .match-3rd::after, .match-3rd::before {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
})();

// Translations
const translations = {
    id: {
        desc: "Buat bagan turnamen mabarmu dengan mudah",
        num_participants: "Jumlah Peserta",
        participant_names: "Nama Peserta / Tim",
        type_names: "Ketik nama peserta",
        two_leg: "2 Leg (Kandang-Tandang)",
        third_place: "Perebutan Juara 3",
        shuffle: "Acak Posisi",
        generate: "Generate Bagan",
        bracket_title: "Bagan Turnamen",
        participant_prefix: "Peserta ",
        third_place_match: "JUARA 3",
        champion: "Juara",
        loser_semi_1: "Kalah Semifinal 1",
        loser_semi_2: "Kalah Semifinal 2",
        two_leg_badge: "2 LEG",
        format_label: "Format Turnamen",
        format_knockout: "Sistem Gugur (Knockout)",
        format_league: "Klasemen Liga (Round Robin)",
        standings_title: "Klasemen Liga",
        fixtures_title: "Jadwal Pertandingan",
        team: "Tim",
        played: "P",
        won: "W",
        drawn: "D",
        lost: "L",
        gf: "GF",
        ga: "GA",
        gd: "GD",
        pts: "Pts",
        matchday_prefix: "Pekan ",
        export_btn: "📸 Download",
        format_group: "Fase Grup + Knockout",
        group_title: "Fase Grup",
        advance_knockout: "🏆 Lanjut ke Knockout",
        group_name: "Grup ",
        reset_btn: "Hapus Data Turnamen"
    },
    en: {
        desc: "Create your tournament bracket easily",
        num_participants: "Number of Participants",
        participant_names: "Participant / Team Names",
        type_names: "Type participant names",
        two_leg: "2 Legs (Home & Away)",
        third_place: "3rd Place Play-off",
        shuffle: "Shuffle Positions",
        generate: "Generate Bracket",
        bracket_title: "Tournament Bracket",
        participant_prefix: "Participant ",
        third_place_match: "3RD PLACE",
        champion: "Champion",
        loser_semi_1: "Loser Semi 1",
        loser_semi_2: "Loser Semi 2",
        two_leg_badge: "2 LEGS",
        format_label: "Tournament Format",
        format_knockout: "Knockout Bracket",
        format_league: "League Standings (Round Robin)",
        standings_title: "League Standings",
        fixtures_title: "Match Fixtures",
        team: "Team",
        played: "P",
        won: "W",
        drawn: "D",
        lost: "L",
        gf: "GF",
        ga: "GA",
        gd: "GD",
        pts: "Pts",
        matchday_prefix: "Matchday ",
        export_btn: "📸 Download",
        format_group: "Group Stage + Knockout",
        group_title: "Group Stage",
        advance_knockout: "🏆 Advance to Knockout",
        group_name: "Group ",
        reset_btn: "Reset Tournament Data"
    }
};

let currentLang = 'id';

function setLanguage(lang) {
    currentLang = lang;
    
    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update active button styles
    document.getElementById('lang-id').classList.toggle('active', lang === 'id');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');

    // Update placeholders
    const inputs = document.querySelectorAll('.team-input');
    inputs.forEach((input, index) => {
        input.placeholder = `${translations[lang].participant_prefix}${index + 1}`;
    });

    // Update existing 3rd place box if generated
    const thirdPlaceLabels = document.querySelectorAll('.match-3rd .match-teams > div:first-child');
    thirdPlaceLabels.forEach(label => {
        label.textContent = translations[lang].third_place_match;
    });

    // Re-render bracket to instantly update labels inside the bracket
    if (typeof tournamentRounds !== 'undefined' && tournamentRounds.length > 0) {
        renderBracket(tournamentRounds);
    }
    
    // Re-render league if exists
    if (typeof leagueFixtures !== 'undefined' && leagueFixtures.length > 0) {
        renderLeague();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Language switchers
    document.getElementById('lang-id').addEventListener('click', () => setLanguage('id'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    const numParticipantsInput = document.getElementById('numParticipants');
    const participantInputsContainer = document.getElementById('participantInputs');
    const generateBtn = document.getElementById('generateBtn');
    const bracketSection = document.getElementById('bracketSection');
    const leagueSection = document.getElementById('leagueSection');
    const groupSection = document.getElementById('groupSection');
    const bracketWrapper = document.getElementById('bracketWrapper');
    const shuffleCheckbox = document.getElementById('shuffleCheckbox');
    const twoLegCheckbox = document.getElementById('twoLegCheckbox');
    const thirdPlaceCheckbox = document.getElementById('thirdPlaceCheckbox');
    const tournamentFormat = document.getElementById('tournamentFormat');

    let tournamentRounds = [];
    let leagueFixtures = [];
    let leagueParticipants = [];
    let groupData = [];
    let thirdPlaceWinner = { name: "Juara 3", isTBD: true };
    let thirdPlaceTeam1 = { name: "Kalah Semifinal 1", isTBD: true };
    let thirdPlaceTeam2 = { name: "Kalah Semifinal 2", isTBD: true };

    // --- SAVE AND LOAD STATE ---
    function saveState() {
        const inputs = document.querySelectorAll('.team-input');
        let inputNames = [];
        inputs.forEach(input => inputNames.push(input.value));

        const state = {
            format: tournamentFormat.value,
            num: numParticipantsInput.value,
            inputNames,
            shuffle: shuffleCheckbox.checked,
            twoLeg: twoLegCheckbox.checked,
            thirdPlace: thirdPlaceCheckbox.checked,
            tournamentRounds,
            thirdPlaceWinner,
            thirdPlaceTeam1,
            thirdPlaceTeam2,
            leagueFixtures,
            leagueParticipants,
            groupData,
            lang: currentLang,
            bracketVisible: bracketSection.style.display === 'block',
            leagueVisible: leagueSection.style.display === 'block',
            groupVisible: groupSection.style.display === 'block'
        };
        localStorage.setItem('efootball_state', JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem('efootball_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                if (state.lang) setLanguage(state.lang);
                
                if (state.format) {
                    tournamentFormat.value = state.format;
                    tournamentFormat.dispatchEvent(new Event('change'));
                }
                if (state.num) numParticipantsInput.value = state.num;
                if (state.shuffle !== undefined) shuffleCheckbox.checked = state.shuffle;
                if (state.twoLeg !== undefined) twoLegCheckbox.checked = state.twoLeg;
                if (state.thirdPlace !== undefined) thirdPlaceCheckbox.checked = state.thirdPlace;
                
                generateInputs(parseInt(state.num) || 4);
                const inputs = document.querySelectorAll('.team-input');
                if (state.inputNames) {
                    inputs.forEach((input, i) => {
                        if (state.inputNames[i]) input.value = state.inputNames[i];
                    });
                }

                if (state.bracketVisible && state.tournamentRounds && state.tournamentRounds.length > 0) {
                    tournamentRounds = state.tournamentRounds;
                    thirdPlaceWinner = state.thirdPlaceWinner;
                    thirdPlaceTeam1 = state.thirdPlaceTeam1;
                    thirdPlaceTeam2 = state.thirdPlaceTeam2;
                    renderBracket(tournamentRounds);
                    bracketSection.style.display = 'block';
                    leagueSection.style.display = 'none';
                } else if (state.leagueVisible && state.leagueFixtures && state.leagueFixtures.length > 0) {
                    leagueFixtures = state.leagueFixtures;
                    leagueParticipants = state.leagueParticipants;
                    renderLeague();
                    leagueSection.style.display = 'block';
                    bracketSection.style.display = 'none';
                    groupSection.style.display = 'none';
                } else if (state.groupVisible && state.groupData && state.groupData.length > 0) {
                    groupData = state.groupData;
                    renderGroupStage();
                    groupSection.style.display = 'block';
                    bracketSection.style.display = 'none';
                    leagueSection.style.display = 'none';
                }
            } catch (e) {
                console.error("Error loading state", e);
            }
        }
    }

    // Initialize inputs
    generateInputs(parseInt(numParticipantsInput.value));
    loadState(); // Load saved tournament on init

    numParticipantsInput.addEventListener('input', (e) => {
        let count = parseInt(e.target.value);
        let minCount = tournamentFormat.value === 'league' ? 3 : 4;
        if (count >= minCount) {
            generateInputs(count);
        }
    });

    tournamentFormat.addEventListener('change', (e) => {
        if (e.target.value === 'league') {
            thirdPlaceCheckbox.parentElement.style.display = 'none';
            numParticipantsInput.min = "3";
        } else if (e.target.value === 'group') {
            thirdPlaceCheckbox.parentElement.style.display = 'inline-flex';
            numParticipantsInput.min = "6";
            if (parseInt(numParticipantsInput.value) < 6) {
                numParticipantsInput.value = 6;
                generateInputs(6);
            }
        } else {
            thirdPlaceCheckbox.parentElement.style.display = 'inline-flex';
            numParticipantsInput.min = "4";
            if (parseInt(numParticipantsInput.value) < 4) {
                numParticipantsInput.value = 4;
                generateInputs(4);
            }
        }
    });

    generateBtn.addEventListener('click', () => {
        if (tournamentFormat.value === 'league') {
            generateLeague();
        } else if (tournamentFormat.value === 'group') {
            generateGroupStage();
        } else {
            generateBracket();
        }
    });

    // --- CUSTOM MODAL ---
    function showModal(message, isConfirm = false, onConfirm = null) {
        const modal = document.getElementById('customModal');
        const titleEl = document.getElementById('modalTitle');
        const msgEl = document.getElementById('modalMessage');
        const cancelBtn = document.getElementById('modalCancelBtn');
        const confirmBtn = document.getElementById('modalConfirmBtn');

        titleEl.textContent = currentLang === 'id' ? "Perhatian" : "Attention";
        msgEl.textContent = message;
        
        cancelBtn.textContent = currentLang === 'id' ? "Batal" : "Cancel";
        
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        if (isConfirm) {
            newCancelBtn.style.display = 'block';
            newConfirmBtn.className = 'btn-danger';
            newConfirmBtn.textContent = currentLang === 'id' ? "Hapus" : "Delete";
        } else {
            newCancelBtn.style.display = 'none';
            newConfirmBtn.className = 'btn-primary';
            newConfirmBtn.textContent = "OK";
        }

        newConfirmBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (onConfirm) onConfirm();
        });

        newCancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.style.display = 'flex';
    }

    document.getElementById('resetBtn').addEventListener('click', () => {
        showModal(
            currentLang === 'id' ? "Apakah Anda yakin ingin menghapus SEMUA data turnamen ini?" : "Are you sure you want to delete ALL tournament data?",
            true,
            () => {
                localStorage.removeItem('efootball_state');
                location.reload();
            }
        );
    });

    // Zoom logic
    let currentZoom = 1;
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomLevelText = document.getElementById('zoomLevel');

    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < 2) {
            currentZoom += 0.1;
            updateZoom();
        }
    });

    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > 0.4) {
            currentZoom -= 0.1;
            updateZoom();
        }
    });

    function updateZoom() {
        const bracket = document.querySelector('.bracket');
        if (bracket) {
            bracket.style.zoom = currentZoom;
            // Fallback for older Firefox if needed
            bracket.style.transform = `scale(${currentZoom})`;
            bracket.style.transformOrigin = 'top left';
        }
        zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    // Custom Drag to Scroll (Pan)
    let isDown = false;
    let startX, startY, scrollLeft, scrollTop;

    // --- DOWNLOAD IMAGE ---
    const exportBracketBtn = document.getElementById('exportBracketBtn');
    const exportLeagueBtn = document.getElementById('exportLeagueBtn');

    function exportToImage(elementId, filename) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let oldZoom = 1;
        if (elementId === 'bracketWrapper') {
            oldZoom = currentZoom;
            currentZoom = 1;
            updateZoom();
        }

        html2canvas(element, {
            backgroundColor: '#000028',
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            if (elementId === 'bracketWrapper') {
                currentZoom = oldZoom;
                updateZoom();
            }
        });
    }

    if(exportBracketBtn) exportBracketBtn.addEventListener('click', () => exportToImage('bracketWrapper', 'efootball_bracket.png'));
    if(exportLeagueBtn) exportLeagueBtn.addEventListener('click', () => exportToImage('leagueSection', 'efootball_standings.png'));
    // ------------------------

    bracketWrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - bracketWrapper.offsetLeft;
        scrollLeft = bracketWrapper.scrollLeft;
        startY = e.pageY - bracketWrapper.offsetTop;
        scrollTop = bracketWrapper.scrollTop;
    });

    bracketWrapper.addEventListener('mouseleave', () => {
        isDown = false;
    });

    bracketWrapper.addEventListener('mouseup', () => {
        isDown = false;
    });

    bracketWrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); // Prevent text selection
        const x = e.pageX - bracketWrapper.offsetLeft;
        const walkX = (x - startX) * 1.5; // Drag speed
        bracketWrapper.scrollLeft = scrollLeft - walkX;
        
        const y = e.pageY - bracketWrapper.offsetTop;
        const walkY = (y - startY) * 1.5;
        bracketWrapper.scrollTop = scrollTop - walkY;
    });

    // Click to advance
    bracketWrapper.addEventListener('click', (e) => {
        const teamEl = e.target.closest('.team-clickable');
        if (teamEl) {
            const r = parseInt(teamEl.dataset.round);
            const m = parseInt(teamEl.dataset.match);
            const t = parseInt(teamEl.dataset.team);
            advanceTeam(r, m, t);
        }
        
        const thirdTeamEl = e.target.closest('.third-team-clickable');
        if (thirdTeamEl) {
            const t = parseInt(thirdTeamEl.dataset.team);
            if (t === 0 && !thirdPlaceTeam1.isTBD) thirdPlaceWinner = { name: thirdPlaceTeam1.name, isTBD: false };
            if (t === 1 && !thirdPlaceTeam2.isTBD) thirdPlaceWinner = { name: thirdPlaceTeam2.name, isTBD: false };
            renderBracket(tournamentRounds);
            saveState();
        }
    });

    function advanceTeam(roundIndex, matchIndex, teamIndex) {
        const team = tournamentRounds[roundIndex][matchIndex][teamIndex];
        if (!team || team.isTBD) return;

        const nextRoundIndex = roundIndex + 1;
        if (nextRoundIndex >= tournamentRounds.length) return;

        if (tournamentRounds[nextRoundIndex][0].winner !== undefined) {
            // Advance to Winner block
            tournamentRounds[nextRoundIndex][0].name = team.name;
            tournamentRounds[nextRoundIndex][0].isTBD = false;
        } else {
            // Advance to next match
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const nextTeamIndex = matchIndex % 2;
            tournamentRounds[nextRoundIndex][nextMatchIndex][nextTeamIndex] = { name: team.name, isTBD: false };
        }
        
        renderBracket(tournamentRounds);
        saveState();
    }

    function generateInputs(count) {
        const currentCount = participantInputsContainer.children.length;
        
        if (count > currentCount) {
            for (let i = currentCount; i < count; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'input-wrapper';
                
                const iconDiv = document.createElement('div');
                iconDiv.className = 'input-icon';
                iconDiv.textContent = (i + 1);
                
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `${translations[currentLang].participant_prefix}${i + 1}`;
                input.className = 'team-input';
                
                wrapper.appendChild(iconDiv);
                wrapper.appendChild(input);
                participantInputsContainer.appendChild(wrapper);
            }
        } else if (count < currentCount) {
            for (let i = currentCount - 1; i >= count; i--) {
                participantInputsContainer.removeChild(participantInputsContainer.lastChild);
            }
        }
    }

    function generateBracket() {
        leagueSection.style.display = 'none';
        groupSection.style.display = 'none';
        const inputs = document.querySelectorAll('.team-input');
        
        let participants = [];
        inputs.forEach((input, index) => {
            let name = input.value.trim() || input.placeholder;
            participants.push({ name });
        });

        if (shuffleCheckbox.checked) {
            participants = participants.sort(() => Math.random() - 0.5);
        }

        let power = 1;
        while (power < participants.length) power *= 2;
        
        let numMatchesR1 = power / 2;
        let matchesR1 = Array.from({ length: numMatchesR1 }, () => []);
        let pIndex = 0;
        
        for (let i = 0; i < numMatchesR1; i++) {
            matchesR1[i].push(participants[pIndex++]);
        }
        
        let fillOrder = [];
        let left = 0, right = numMatchesR1 - 1;
        while (left <= right) {
            if (left === right) { fillOrder.push(left); break; }
            fillOrder.push(left);
            fillOrder.push(right);
            left++;
            right--;
        }
        
        let fillIdx = 0;
        while (pIndex < participants.length) {
            let matchIdx = fillOrder[fillIdx++];
            matchesR1[matchIdx].push(participants[pIndex++]);
        }
        
        let round1 = matchesR1.map(m => m.length === 2 ? m : [m[0], null]);
        
        let rounds = [round1];
        let totalRounds = Math.log2(power);
        
        for (let r = 1; r < totalRounds; r++) {
            let prevRound = rounds[r-1];
            let currentRound = [];
            
            for (let i = 0; i < prevRound.length; i += 2) {
                let match1 = prevRound[i];
                let match2 = prevRound[i+1];
                
                let p1 = match1[1] === null ? match1[0] : { name: "TBD", isTBD: true };
                let p2 = match2[1] === null ? match2[0] : { name: "TBD", isTBD: true };
                
                currentRound.push([p1, p2]);
            }
            rounds.push(currentRound);
        }
        
        rounds.push([ { winner: true, name: "Juara", isTBD: true } ]);
        
        tournamentRounds = rounds;
        thirdPlaceWinner = { name: "Juara 3", isTBD: true };
        
        renderBracket(tournamentRounds);
        bracketSection.style.display = 'block';
        
        setTimeout(() => {
            bracketSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        saveState();
    }

    function renderBracket(rounds) {
        bracketWrapper.innerHTML = '';
        const totalRounds = rounds.length - 1; // since Winner block is added
        
        // Compute 3rd place teams from Semifinals if they exist
        thirdPlaceTeam1 = { name: "Kalah Semifinal 1", isTBD: true };
        thirdPlaceTeam2 = { name: "Kalah Semifinal 2", isTBD: true };
        
        if (totalRounds >= 2) {
            let semiRound = rounds[totalRounds - 2];
            let finalRound = rounds[totalRounds - 1];
            
            // Check Semi 1 (Match 0)
            if (!finalRound[0][0].isTBD) {
                let t1 = semiRound[0][0];
                let t2 = semiRound[0][1];
                if (t1 && t1.name === finalRound[0][0].name) thirdPlaceTeam1 = t2 || thirdPlaceTeam1;
                else if (t2 && t2.name === finalRound[0][0].name) thirdPlaceTeam1 = t1 || thirdPlaceTeam1;
            }
            // Check Semi 2 (Match 1)
            if (!finalRound[0][1].isTBD) {
                let t1 = semiRound[1][0];
                let t2 = semiRound[1][1];
                if (t1 && t1.name === finalRound[0][1].name) thirdPlaceTeam2 = t2 || thirdPlaceTeam2;
                else if (t2 && t2.name === finalRound[0][1].name) thirdPlaceTeam2 = t1 || thirdPlaceTeam2;
            }
        }
        
        const bracket = document.createElement('div');
        bracket.className = 'bracket';
        
        rounds.forEach((roundData, roundIndex) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            
            if (roundIndex < totalRounds) {
                roundData.forEach((match, i) => {
                    const matchDiv = document.createElement('div');
                    matchDiv.className = 'match';
                    
                    if (match[1] === null) {
                        // Slot BYE
                        matchDiv.innerHTML = `
                            <div class="match-teams">
                                <div class="team" style="border-bottom: none;">
                                    <div class="team-name" style="font-weight: 600; color: var(--gold);" title="${match[0].name}">${match[0].name} <span style="font-size: 0.7rem; color: var(--gray); font-weight: normal; margin-left: 5px;">(BYE)</span></div>
                                </div>
                            </div>
                        `;
                    } else {
                        // Normal match
                        let t1Style = match[0].isTBD ? 'color: var(--gray); font-style: italic;' : '';
                        let t2Style = match[1].isTBD ? 'color: var(--gray); font-style: italic;' : '';
                        
                        let pointer1 = match[0].isTBD ? '' : 'cursor: pointer;';
                        let pointer2 = match[1].isTBD ? '' : 'cursor: pointer;';
                        let class1 = match[0].isTBD ? '' : 'team-clickable';
                        let class2 = match[1].isTBD ? '' : 'team-clickable';
                        
                        let twoLegBadge = (twoLegCheckbox.checked && roundIndex < totalRounds - 1) 
                            ? `<div style="position: absolute; top: -10px; right: -5px; background: var(--gold); color: var(--navy); font-size: 0.6rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10;">${translations[currentLang].two_leg_badge}</div>` 
                            : '';
                            
                        matchDiv.innerHTML = `
                            <div class="match-teams">
                                ${twoLegBadge}
                                <div class="team ${class1}" data-round="${roundIndex}" data-match="${i}" data-team="0" style="${pointer1}">
                                    <div class="team-name" style="${t1Style}" title="${match[0].name}">${match[0].name}</div>
                                </div>
                                <div class="team ${class2}" data-round="${roundIndex}" data-match="${i}" data-team="1" style="${pointer2}">
                                    <div class="team-name" style="${t2Style}" title="${match[1].name}">${match[1].name}</div>
                                </div>
                            </div>
                        `;
                    }
                    roundDiv.appendChild(matchDiv);
                });
            } else {
                // Winner
                let winnerName = roundData[0].isTBD ? translations[currentLang].champion : roundData[0].name;
                let winnerStyle = roundData[0].isTBD ? 'color: var(--gray); font-style: italic;' : 'color: var(--gold); font-weight: bold;';
                
                const matchDiv = document.createElement('div');
                matchDiv.className = 'match round-winner';
                matchDiv.innerHTML = `
                    <div class="match-teams" style="border-color: var(--gold);">
                        <div class="team">
                            <span style="margin-right: 8px;">👑</span>
                            <div class="team-name" style="${winnerStyle} text-align: center;">${winnerName}</div>
                        </div>
                    </div>
                `;
                roundDiv.appendChild(matchDiv);
                
                // 3rd place
                if (thirdPlaceCheckbox.checked && totalRounds >= 2) {
                    let tp1Style = thirdPlaceTeam1.isTBD ? 'color: var(--gray); font-style: italic;' : '';
                    let tp2Style = thirdPlaceTeam2.isTBD ? 'color: var(--gray); font-style: italic;' : '';
                    let tpwStyle = thirdPlaceWinner.isTBD ? 'color: var(--gray); font-style: italic;' : 'color: var(--gold); font-weight: bold;';
                    
                    let pointer1 = thirdPlaceTeam1.isTBD ? '' : 'cursor: pointer;';
                    let pointer2 = thirdPlaceTeam2.isTBD ? '' : 'cursor: pointer;';
                    let class1 = thirdPlaceTeam1.isTBD ? '' : 'third-team-clickable';
                    let class2 = thirdPlaceTeam2.isTBD ? '' : 'third-team-clickable';
                    
                    const thirdPlaceHTML = `
                        <div class="match-teams" style="border-color: var(--gray);">
                            <div style="font-size: 0.6rem; text-align: center; background: rgba(255,255,255,0.1); padding: 4px; font-weight: bold; letter-spacing: 1px;">${translations[currentLang].third_place_match}</div>
                            <div class="team ${class1}" data-team="0" style="${pointer1}">
                                <div class="team-name" style="${tp1Style}">${thirdPlaceTeam1.isTBD ? translations[currentLang].loser_semi_1 : thirdPlaceTeam1.name}</div>
                            </div>
                            <div class="team ${class2}" data-team="1" style="${pointer2}">
                                <div class="team-name" style="${tp2Style}">${thirdPlaceTeam2.isTBD ? translations[currentLang].loser_semi_2 : thirdPlaceTeam2.name}</div>
                            </div>
                            ${!thirdPlaceWinner.isTBD ? `
                            <div class="team" style="border-top: 1px solid rgba(255,255,255,0.1); justify-content: center; background: rgba(250, 204, 21, 0.1);">
                                <div class="team-name" style="${tpwStyle} text-align: center;">🥉 ${thirdPlaceWinner.name}</div>
                            </div>` : ''}
                        </div>
                    `;
                    
                    // Invisible spacer at the top to balance the Juara 3 box at the bottom
                    const spacerDiv = document.createElement('div');
                    spacerDiv.className = 'match match-3rd';
                    spacerDiv.style.visibility = 'hidden';
                    spacerDiv.innerHTML = thirdPlaceHTML;
                    roundDiv.insertBefore(spacerDiv, matchDiv);
                    
                    const thirdPlaceDiv = document.createElement('div');
                    thirdPlaceDiv.className = 'match match-3rd';
                    thirdPlaceDiv.innerHTML = thirdPlaceHTML;
                    roundDiv.appendChild(thirdPlaceDiv);
                }
            }
            
            bracket.appendChild(roundDiv);
        });
        
        bracketWrapper.appendChild(bracket);
        updateZoom(); // Apply current zoom after render
    }

    // --- LEAGUE LOGIC ---
    function generateRoundRobin(participantsArray, isTwoLeg) {
        let teams = [...participantsArray];
        let numTeams = teams.length;
        let dummyAdded = false;
        
        if (numTeams % 2 !== 0) {
            teams.push({ name: "BYE", id: "BYE", dummy: true });
            numTeams++;
            dummyAdded = true;
        }

        let matchdays = [];
        let half = numTeams / 2;

        for (let round = 0; round < numTeams - 1; round++) {
            let matchday = [];
            for (let i = 0; i < half; i++) {
                let t1 = teams[i];
                let t2 = teams[numTeams - 1 - i];
                
                if (!t1.dummy && !t2.dummy) {
                    if (i === 0 && round % 2 === 1) {
                        matchday.push({ home: t2, away: t1, homeScore: null, awayScore: null, id: `md${round}_m${i}_${Math.random().toString(36).substr(2,5)}` });
                    } else {
                        matchday.push({ home: t1, away: t2, homeScore: null, awayScore: null, id: `md${round}_m${i}_${Math.random().toString(36).substr(2,5)}` });
                    }
                }
            }
            matchdays.push(matchday);
            teams.splice(1, 0, teams.pop());
        }

        if (isTwoLeg) {
            let numMatchdays = matchdays.length;
            for (let i = 0; i < numMatchdays; i++) {
                let returnMatchday = matchdays[i].map((m, idx) => ({
                    home: m.away,
                    away: m.home,
                    homeScore: null,
                    awayScore: null,
                    id: `md${numMatchdays + i}_m${idx}_${Math.random().toString(36).substr(2,5)}`
                }));
                matchdays.push(returnMatchday);
            }
        }
        
        if (dummyAdded) {
            // Remove dummy from participants if it was passed by reference
            let idx = participantsArray.findIndex(p => p.dummy);
            if (idx > -1) participantsArray.splice(idx, 1);
        }
        
        return matchdays;
    }

    function generateLeague() {
        bracketSection.style.display = 'none';
        groupSection.style.display = 'none';
        
        const inputs = document.querySelectorAll('.team-input');
        leagueParticipants = [];
        inputs.forEach((input, index) => {
            let name = input.value.trim() || input.placeholder;
            leagueParticipants.push({ name, id: index });
        });

        if (shuffleCheckbox.checked) {
            leagueParticipants = leagueParticipants.sort(() => Math.random() - 0.5);
        }

        leagueFixtures = generateRoundRobin(leagueParticipants, twoLegCheckbox.checked);
        renderLeague();
        
        leagueSection.style.display = 'block';
        setTimeout(() => {
            leagueSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        saveState();
    }

    function renderLeague() {
        const fixturesContainer = document.getElementById('fixturesContainer');
        fixturesContainer.innerHTML = '';
        
        leagueFixtures.forEach((md, roundIndex) => {
            const mdDiv = document.createElement('div');
            mdDiv.className = 'matchday';
            
            const title = document.createElement('h3');
            title.textContent = `${translations[currentLang].matchday_prefix} ${roundIndex + 1}`;
            mdDiv.appendChild(title);
            
            md.forEach(match => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'league-match';
                
                matchDiv.innerHTML = `
                    <div class="league-team home" title="${match.home.name}">${match.home.name}</div>
                    <div class="score-inputs">
                        <input type="number" class="score-input" data-match="${match.id}" data-side="home" min="0" value="${match.homeScore !== null ? match.homeScore : ''}">
                        <span style="color: var(--gray); font-weight: bold;">-</span>
                        <input type="number" class="score-input" data-match="${match.id}" data-side="away" min="0" value="${match.awayScore !== null ? match.awayScore : ''}">
                    </div>
                    <div class="league-team away" title="${match.away.name}">${match.away.name}</div>
                `;
                mdDiv.appendChild(matchDiv);
            });
            
            fixturesContainer.appendChild(mdDiv);
        });

        // Add event listeners to score inputs
        const scoreInputs = document.querySelectorAll('.score-input');
        scoreInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let matchId = e.target.getAttribute('data-match');
                let side = e.target.getAttribute('data-side');
                let val = e.target.value === '' ? null : parseInt(e.target.value);
                
                // Find and update match
                for (let md of leagueFixtures) {
                    for (let m of md) {
                        if (m.id === matchId) {
                            if (side === 'home') m.homeScore = val;
                            else m.awayScore = val;
                        }
                    }
                }
                updateStandings();
                saveState();
            });
        });

        updateStandings(); // Initial render of table
    }

    function updateStandings() {
        // Initialize standings data
        let standings = {};
        leagueParticipants.forEach(p => {
            standings[p.id] = {
                name: p.name,
                p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
            };
        });

        // Compute from fixtures
        leagueFixtures.forEach(md => {
            md.forEach(match => {
                if (match.homeScore !== null && match.awayScore !== null) {
                    let s1 = standings[match.home.id];
                    let s2 = standings[match.away.id];
                    let hScore = match.homeScore;
                    let aScore = match.awayScore;

                    s1.p++; s2.p++;
                    s1.gf += hScore; s2.gf += aScore;
                    s1.ga += aScore; s2.ga += hScore;

                    if (hScore > aScore) {
                        s1.w++; s1.pts += 3;
                        s2.l++;
                    } else if (hScore < aScore) {
                        s2.w++; s2.pts += 3;
                        s1.l++;
                    } else {
                        s1.d++; s1.pts += 1;
                        s2.d++; s2.pts += 1;
                    }
                    
                    s1.gd = s1.gf - s1.ga;
                    s2.gd = s2.gf - s2.ga;
                }
            });
        });

        // Convert to array and sort
        let tableData = Object.values(standings).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts; // 1. Points
            if (b.gd !== a.gd) return b.gd - a.gd;    // 2. Goal Difference
            if (b.gf !== a.gf) return b.gf - a.gf;    // 3. Goals For
            return a.name.localeCompare(b.name);      // 4. Alphabetical
        });

        // Render table
        const tbody = document.getElementById('standingsBody');
        tbody.innerHTML = '';
        
        tableData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td style="text-align: left; font-weight: 600;">${row.name}</td>
                <td>${row.p}</td>
                <td>${row.w}</td>
                <td>${row.d}</td>
                <td>${row.l}</td>
                <td>${row.gf}</td>
                <td>${row.ga}</td>
                <td>${row.gd}</td>
                <td style="font-weight: bold; color: var(--gold);">${row.pts}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- GROUP STAGE LOGIC ---
    function generateGroupStage() {
        bracketSection.style.display = 'none';
        leagueSection.style.display = 'none';
        
        const inputs = document.querySelectorAll('.team-input');
        let participants = [];
        inputs.forEach((input, index) => {
            let name = input.value.trim() || input.placeholder;
            participants.push({ name, id: `p_${index}` });
        });

        if (shuffleCheckbox.checked) {
            participants = participants.sort(() => Math.random() - 0.5);
        }

        let numTeams = participants.length;
        let numGroups = 2;
        if (numTeams >= 12 && numTeams < 24) numGroups = 4;
        else if (numTeams >= 24) numGroups = 8;
        
        groupData = [];
        const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
        for(let i=0; i<numGroups; i++) {
            groupData.push({
                name: groupLetters[i],
                participants: [],
                fixtures: [],
                standings: {}
            });
        }
        
        // Distribute evenly
        participants.forEach((p, index) => {
            groupData[index % numGroups].participants.push(p);
        });

        groupData.forEach(g => {
            g.fixtures = generateRoundRobin(g.participants, twoLegCheckbox.checked);
            g.participants.forEach(p => {
                g.standings[p.id] = { name: p.name, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
            });
        });

        renderGroupStage();
        groupSection.style.display = 'block';
        
        setTimeout(() => {
            groupSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        saveState();
    }

    function renderGroupStage() {
        const container = document.getElementById('groupsContainer');
        container.innerHTML = '';

        groupData.forEach((g, gIndex) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'glass-panel';
            groupDiv.style.padding = '1.5rem';
            
            // Table
            let tableHTML = `
                <h3 style="color: var(--gold); text-align: center; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">${translations[currentLang].group_name} ${g.name}</h3>
                <div class="table-responsive" style="margin-bottom: 2rem; overflow-x: auto;">
                    <table class="standings-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th style="text-align: left;">${translations[currentLang].team}</th>
                                <th>${translations[currentLang].played}</th>
                                <th>${translations[currentLang].won}</th>
                                <th>${translations[currentLang].drawn}</th>
                                <th>${translations[currentLang].lost}</th>
                                <th>${translations[currentLang].gf}</th>
                                <th>${translations[currentLang].ga}</th>
                                <th>${translations[currentLang].gd}</th>
                                <th>${translations[currentLang].pts}</th>
                            </tr>
                        </thead>
                        <tbody id="groupBody_${gIndex}"></tbody>
                    </table>
                </div>
            `;

            // Fixtures
            let fixturesHTML = `<div class="fixtures-grid">`;
            g.fixtures.forEach((md, roundIndex) => {
                fixturesHTML += `<div class="matchday">
                    <h3>${translations[currentLang].matchday_prefix} ${roundIndex + 1}</h3>`;
                md.forEach(match => {
                    fixturesHTML += `
                    <div class="league-match">
                        <div class="league-team home" title="${match.home.name}">${match.home.name}</div>
                        <div class="score-inputs">
                            <input type="number" class="score-input group-score" data-group="${gIndex}" data-match="${match.id}" data-side="home" min="0" value="${match.homeScore !== null ? match.homeScore : ''}">
                            <span style="color: var(--gray); font-weight: bold;">-</span>
                            <input type="number" class="score-input group-score" data-group="${gIndex}" data-match="${match.id}" data-side="away" min="0" value="${match.awayScore !== null ? match.awayScore : ''}">
                        </div>
                        <div class="league-team away" title="${match.away.name}">${match.away.name}</div>
                    </div>`;
                });
                fixturesHTML += `</div>`;
            });
            fixturesHTML += `</div>`;

            groupDiv.innerHTML = tableHTML + fixturesHTML;
            container.appendChild(groupDiv);
        });

        document.querySelectorAll('.group-score').forEach(input => {
            input.addEventListener('input', (e) => {
                let gIndex = e.target.getAttribute('data-group');
                let matchId = e.target.getAttribute('data-match');
                let side = e.target.getAttribute('data-side');
                let val = e.target.value === '' ? null : parseInt(e.target.value);
                
                let g = groupData[gIndex];
                for (let md of g.fixtures) {
                    for (let m of md) {
                        if (m.id === matchId) {
                            if (side === 'home') m.homeScore = val;
                            else m.awayScore = val;
                        }
                    }
                }
                updateGroupStandings(gIndex);
                saveState();
            });
        });

        groupData.forEach((_, i) => updateGroupStandings(i));
    }

    function updateGroupStandings(gIndex) {
        let g = groupData[gIndex];
        
        // Reset
        Object.keys(g.standings).forEach(k => {
            g.standings[k] = { ...g.standings[k], p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
        });

        g.fixtures.forEach(md => {
            md.forEach(match => {
                if (match.homeScore !== null && match.awayScore !== null) {
                    let s1 = g.standings[match.home.id];
                    let s2 = g.standings[match.away.id];
                    let hScore = match.homeScore;
                    let aScore = match.awayScore;

                    s1.p++; s2.p++;
                    s1.gf += hScore; s2.gf += aScore;
                    s1.ga += aScore; s2.ga += hScore;

                    if (hScore > aScore) {
                        s1.w++; s1.pts += 3;
                        s2.l++;
                    } else if (hScore < aScore) {
                        s2.w++; s2.pts += 3;
                        s1.l++;
                    } else {
                        s1.d++; s1.pts += 1;
                        s2.d++; s2.pts += 1;
                    }
                    
                    s1.gd = s1.gf - s1.ga;
                    s2.gd = s2.gf - s2.ga;
                }
            });
        });

        let tableData = Object.values(g.standings).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            if (b.gf !== a.gf) return b.gf - a.gf;
            return a.name.localeCompare(b.name);
        });

        g.sortedStandings = tableData;

        const tbody = document.getElementById(`groupBody_${gIndex}`);
        tbody.innerHTML = '';
        tableData.forEach((row, index) => {
            const tr = document.createElement('tr');
            if (index < 2) tr.style.background = 'rgba(0, 255, 0, 0.05)';
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td style="text-align: left; font-weight: 600;">${row.name}</td>
                <td>${row.p}</td>
                <td>${row.w}</td>
                <td>${row.d}</td>
                <td>${row.l}</td>
                <td>${row.gf}</td>
                <td>${row.ga}</td>
                <td>${row.gd}</td>
                <td style="font-weight: bold; color: var(--gold);">${row.pts}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('advanceToKnockoutBtn').addEventListener('click', () => {
        let qualified = [];
        groupData.forEach(g => {
            if (g.sortedStandings && g.sortedStandings.length >= 2) {
                qualified.push({
                    group: g.name,
                    first: g.sortedStandings[0].name,
                    second: g.sortedStandings[1].name
                });
            }
        });
        
        if (qualified.length < 2) {
            showModal(currentLang === 'id' ? "Harap selesaikan beberapa pertandingan dulu sebelum melaju ke Knockout." : "Please finish some matches first before advancing.");
            return;
        }

        let bracketMatches = [];
        if (qualified.length === 2) { // Groups A, B
            bracketMatches.push([ { name: qualified[0].first, isTBD: false }, { name: qualified[1].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[1].first, isTBD: false }, { name: qualified[0].second, isTBD: false } ]);
        } else if (qualified.length === 4) { // A, B, C, D
            bracketMatches.push([ { name: qualified[0].first, isTBD: false }, { name: qualified[1].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[2].first, isTBD: false }, { name: qualified[3].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[1].first, isTBD: false }, { name: qualified[0].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[3].first, isTBD: false }, { name: qualified[2].second, isTBD: false } ]);
        } else if (qualified.length === 8) { // A to H
            bracketMatches.push([ { name: qualified[0].first, isTBD: false }, { name: qualified[1].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[2].first, isTBD: false }, { name: qualified[3].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[4].first, isTBD: false }, { name: qualified[5].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[6].first, isTBD: false }, { name: qualified[7].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[1].first, isTBD: false }, { name: qualified[0].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[3].first, isTBD: false }, { name: qualified[2].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[5].first, isTBD: false }, { name: qualified[4].second, isTBD: false } ]);
            bracketMatches.push([ { name: qualified[7].first, isTBD: false }, { name: qualified[6].second, isTBD: false } ]);
        }

        let totalRounds = Math.log2(bracketMatches.length * 2);
        let rounds = [bracketMatches];
        for (let r = 1; r < totalRounds; r++) {
            let prevRound = rounds[r-1];
            let currentRound = [];
            for (let i = 0; i < prevRound.length; i += 2) {
                currentRound.push([ { name: "TBD", isTBD: true }, { name: "TBD", isTBD: true } ]);
            }
            rounds.push(currentRound);
        }
        rounds.push([ { winner: true, name: "Juara", isTBD: true } ]);
        
        tournamentRounds = rounds;
        thirdPlaceWinner = { name: "Juara 3", isTBD: true };
        thirdPlaceTeam1 = { name: "Kalah Semifinal 1", isTBD: true };
        thirdPlaceTeam2 = { name: "Kalah Semifinal 2", isTBD: true };
        
        groupSection.style.display = 'none';
        bracketSection.style.display = 'block';
        
        renderBracket(tournamentRounds);
        
        setTimeout(() => {
            bracketSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        saveState();
    });
});
