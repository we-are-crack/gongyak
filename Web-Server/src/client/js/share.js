export function bindShareButton() {
  const shareBtn = document.getElementById('shareButton');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', () => {
    const keywordElem = document.querySelector('.search-keyword-value');
    if (!keywordElem) return;

    const keyword = keywordElem.textContent.trim();
    const shareUrl = `${window.location.origin}/share?q=${encodeURIComponent(keyword)}`;

    // 모바일 환경 감지
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && window.Kakao && window.Kakao.Link) {
      window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title: `공약21 공약 검색: ${keyword}`,
          description: '공약21에서 검색한 결과를 공유합니다.',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '공약21에서 검색한 결과 보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      // PC 또는 카카오 미설치 시 URL 복사
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('공유 링크가 복사되었습니다!');
      });
    }
  });
}
