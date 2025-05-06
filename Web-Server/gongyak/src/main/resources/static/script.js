const candidates = [
    {name: "후보자 A", pledges: {경제: "소상공인 지원 확대 및 세금 감면", 교육: "무상 교육 확대 및 대학 등록금 지원", 의료: "공공의료 강화 및 건강보험 확대"}},
    {name: "후보자 B", pledges: {경제: "대기업 규제 강화 및 중소기업 육성", 교육: "직업 교육 강화 및 평생 교육 지원", 의료: "민간 의료 활성화 및 의료비 절감"}},
    {name: "후보자 C", pledges: {경제: "스타트업 지원 및 벤처 투자 확대", 교육: "디지털 교육 혁신 및 코딩 교육 의무화", 의료: "원격 의료 확대 및 스마트 헬스케어 도입"}}
];

const search = (inputId) => {
    const input = document.getElementById(inputId).value.trim().toLowerCase();
    const results = document.getElementById("results");
    const initialBox = document.getElementById("initialSearchBox");
    const loading = document.getElementById("loadingTemplate").content.cloneNode(true);
    results.appendChild(loading);
    if (inputId === "searchInput") initialBox.classList.add("hidden");

    setTimeout(() => {
        document.getElementById("loading")?.remove();
        if (!input) {
            results.appendChild(document.getElementById("errorTemplate").content.cloneNode(true));
            if (inputId === "searchInput") initialBox.classList.remove("hidden");
            appendReSearch(results);
            return;
        }

        const comparison = document.getElementById("comparisonTemplate").content.cloneNode(true);
        comparison.querySelector("h3").textContent = input.charAt(0).toUpperCase() + input.slice(1) + " 공약 비교";
        const columns = comparison.querySelectorAll(".candidate-column");
        candidates.forEach(({pledges}, i) => {
            columns[i].querySelector("p").textContent = pledges[input] || "-";
        });

        if (Array.from(columns).some(col => col.querySelector("p").textContent !== "-")) {
            results.appendChild(comparison);
        } else {
            results.appendChild(document.getElementById("noResultsTemplate").content.cloneNode(true));
        }

        appendReSearch(results);
    }, 1000);
};

const appendReSearch = (results) => {
    results.querySelector(".re-search")?.remove();
    results.appendChild(document.getElementById("reSearchTemplate").content.cloneNode(true));
};