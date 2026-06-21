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

document.addEventListener('DOMContentLoaded', () => {
    const numParticipantsInput = document.getElementById('numParticipants');
    const participantInputsContainer = document.getElementById('participantInputs');
    const generateBtn = document.getElementById('generateBtn');
    const bracketSection = document.getElementById('bracketSection');
    const bracketWrapper = document.getElementById('bracketWrapper');
    const shuffleCheckbox = document.getElementById('shuffleCheckbox');
    const twoLegCheckbox = document.getElementById('twoLegCheckbox');
    const thirdPlaceCheckbox = document.getElementById('thirdPlaceCheckbox');

    let tournamentRounds = [];
    let thirdPlaceWinner = { name: "Juara 3", isTBD: true };
    let thirdPlaceTeam1 = { name: "Kalah Semifinal 1", isTBD: true };
    let thirdPlaceTeam2 = { name: "Kalah Semifinal 2", isTBD: true };

    // Initialize inputs
    generateInputs(parseInt(numParticipantsInput.value));

    numParticipantsInput.addEventListener('input', (e) => {
        let count = parseInt(e.target.value);
        if (count >= 4) {
            generateInputs(count);
        }
    });

    generateBtn.addEventListener('click', generateBracket);

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
                input.placeholder = `Peserta ${i + 1}`;
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
        const inputs = document.querySelectorAll('.team-input');
        
        let participants = [];
        inputs.forEach((input, index) => {
            let name = input.value.trim() || `Peserta ${index + 1}`;
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
                            ? `<div style="position: absolute; top: -10px; right: -5px; background: var(--gold); color: var(--navy); font-size: 0.6rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10;">2 LEG</div>` 
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
                let winnerName = roundData[0].name;
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
                            <div style="font-size: 0.6rem; text-align: center; background: rgba(255,255,255,0.1); padding: 4px; font-weight: bold; letter-spacing: 1px;">JUARA 3</div>
                            <div class="team ${class1}" data-team="0" style="${pointer1}">
                                <div class="team-name" style="${tp1Style}">${thirdPlaceTeam1.name}</div>
                            </div>
                            <div class="team ${class2}" data-team="1" style="${pointer2}">
                                <div class="team-name" style="${tp2Style}">${thirdPlaceTeam2.name}</div>
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
});
