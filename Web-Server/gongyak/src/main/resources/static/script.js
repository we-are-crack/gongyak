function search(isSecond = false) {
    const inputId = isSecond ? 'searchInput2' : 'searchInput';
    const input = document.getElementById(inputId).value.trim();

    if (!input) {
        alert("검색어를 입력해주세요.");
        return;
    }

    // ✅ 로딩 메시지 항상 보이도록
    document.getElementById('loader').style.display = 'block';

    // ✅ 초기 검색이면 초기 화면 보이고, 아니면 그냥 유지
    if (!isSecond) {
        document.getElementById('initialView').style.display = 'flex';
    }

    // ✅ 일시적으로 결과 숨김
    document.getElementById('resultsContainer').style.display = 'none';

    // ✅ 결과 준비 후 다시 보여줌
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('initialView').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'block';
        document.getElementById('results').style.display = 'flex';

        const newResultSet = document.createElement('div');
        newResultSet.style.display = 'flex';
        newResultSet.style.gap = '30px';
        newResultSet.style.marginBottom = '40px';
        newResultSet.style.flexWrap = 'wrap';
        newResultSet.style.justifyContent = 'center';

        const candidates = [
            { name: "🧑 후보자 A", text: `후보자 A는 "${input}"에 대해 청년층을 위한 정책 확대를 제시합니다.` },
            { name: "👩 후보자 B", text: `후보자 B는 "${input}" 관련 세금 감면 및 규제 완화를 주장합니다.` },
            { name: "👨 후보자 C", text: `후보자 C는 "${input}"에 대해 전국 단위 개혁 방안을 공약합니다.` },
        ];

        candidates.forEach(c => {
            const card = document.createElement('div');
            card.className = 'candidate';
            card.innerHTML = `<h3>${c.name}</h3><p>${c.text}</p>`;
            newResultSet.appendChild(card);
        });

        document.getElementById('results').appendChild(newResultSet);
        newResultSet.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
}
