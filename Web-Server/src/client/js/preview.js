const bindRefimgPreviewHandlers = () => {
  document.querySelectorAll('.candidate-card a.refimg').forEach(link => {
    if (link.dataset.refimgBound) {
      return;
    }

    link.dataset.refimgBound = '1';

    link.addEventListener('mouseenter', () => {
      const preview = link.querySelector('.refimg-preview');
      if (!preview) {
        return;
      }

      preview.classList.remove('left');
      preview.style.display = 'block';
      const rect = preview.getBoundingClientRect();

      if (rect.right > window.innerWidth) {
        preview.classList.add('left');
      }

      preview.style.display = '';
    });

    link.addEventListener('mouseleave', () => {
      const preview = link.querySelector('.refimg-preview');
      if (preview) {
        preview.classList.remove('left');
      }
    });
  });
};

export default bindRefimgPreviewHandlers;
