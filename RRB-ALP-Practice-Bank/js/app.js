(() => {
  'use strict';

  const allQuestions = window.RRB_ALP_DATA?.questions || [];
  const PAGE_SIZE = 24;
  const $ = (selector) => document.querySelector(selector);
  const topics = [...new Set(allQuestions.map((item) => item.topic))];
  const state = { section: 'Maths', subject: '', topic: '', query: '', shown: PAGE_SIZE };

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);

  function sectionQuestions() {
    return allQuestions.filter((item) => item.section === state.section);
  }

  function availableQuestions() {
    return sectionQuestions().filter((item) => {
      if (state.subject && item.topic !== state.subject) return false;
      if (state.topic && item.topic !== state.topic) return false;
      if (state.query) {
        const searchText = `${item.question} ${(item.options || []).join(' ')} ${item.topic} ${item.qno}`.toLocaleLowerCase();
        if (!searchText.includes(state.query)) return false;
      }
      return true;
    });
  }

  function updateTopicControls() {
    const eligible = sectionQuestions().filter((item) => !state.subject || item.topic === state.subject);
    const topicCounts = new Map();
    eligible.forEach((item) => topicCounts.set(item.topic, (topicCounts.get(item.topic) || 0) + 1));
    if (state.topic && !topicCounts.has(state.topic)) state.topic = '';

    $('#topic-filter').innerHTML = `<option value="">All topics</option>${[...topicCounts].map(([topic, count]) =>
      `<option value="${escapeHtml(topic)}">${escapeHtml(topic)} · ${count}</option>`).join('')}`;
    $('#topic-filter').value = state.topic;
    $('#topic-grid').innerHTML = [...topicCounts].map(([topic, count], index) => `
      <button class="topic-button${state.topic === topic ? ' active' : ''}" type="button" data-topic="${escapeHtml(topic)}">
        <span class="topic-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="topic-name">${escapeHtml(topic)} · ${count}</span>
      </button>`).join('');
    $('#topic-grid').querySelectorAll('[data-topic]').forEach((button) => {
      button.addEventListener('click', () => {
        state.topic = state.topic === button.dataset.topic ? '' : button.dataset.topic;
        state.shown = PAGE_SIZE;
        updateTopicControls();
        render();
      });
    });
  }

  function questionCard(item, index) {
    const options = Array.isArray(item.options) ? item.options : [];
    const choices = ['A', 'B', 'C', 'D'].map((letter, optionIndex) => {
      const text = options[optionIndex] || '';
      const display = text ? escapeHtml(text) : '<span class="empty-option">Option text unclear in scan</span>';
      return `<button class="option-btn" type="button" data-option="${letter}" data-correct="${item.answer}" data-card="${index}">
        <span class="option-letter">${letter}</span><span>${display}</span>
      </button>`;
    }).join('');
    return `<article class="question-card" data-question-id="${escapeHtml(item.id)}">
      <div class="question-meta">
        <span class="question-number">Q${escapeHtml(item.qno)}</span>
        <span class="pill pill-topic">${escapeHtml(item.topic)}</span>
        <span class="pill pill-year">2024</span>
        ${item.reviewRequired ? '<span class="pill pill-review">Check scan</span>' : ''}
        <span class="pill-source">PDF p. ${escapeHtml(item.sourcePage)}</span>
      </div>
      <p class="question-text">${escapeHtml(item.question || 'Question text needs a visual check against the PDF.')}</p>
      <div class="options">${choices}</div>
      <div class="answer-slot" aria-live="polite"></div>
    </article>`;
  }

  function render() {
    const filtered = availableQuestions();
    const visible = filtered.slice(0, state.shown);
    $('#questions-grid').innerHTML = visible.map(questionCard).join('');
    $('#result-count').textContent = filtered.length.toLocaleString();
    $('#empty-state').hidden = filtered.length !== 0;
    $('#load-more').hidden = filtered.length <= visible.length;
    $('#load-more').textContent = `Load ${Math.min(PAGE_SIZE, filtered.length - visible.length)} more questions ↓`;

    $('#questions-grid').querySelectorAll('.option-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const card = button.closest('.question-card');
        if (card.dataset.answered) return;
        card.dataset.answered = 'true';
        const selected = button.dataset.option;
        const correct = button.dataset.correct;
        card.querySelectorAll('.option-btn').forEach((option) => {
          option.disabled = true;
          if (option.dataset.option === correct) option.classList.add('correct');
        });
        if (selected !== correct) button.classList.add('incorrect');
        const feedback = card.querySelector('.answer-slot');
        const question = allQuestions.find((item) => item.id === card.dataset.questionId);
        const answerText = question?.options?.[['A', 'B', 'C', 'D'].indexOf(correct)] || '';
        feedback.innerHTML = `<div class="answer-feedback${selected === correct ? '' : ' wrong'}">${selected === correct ? 'Correct' : 'Correct answer'}: <b>${escapeHtml(correct)}</b>${answerText ? ` · ${escapeHtml(answerText)}` : ''}</div>`;
      });
    });
  }

  function setSection(section) {
    state.section = section;
    state.subject = '';
    state.topic = '';
    state.shown = PAGE_SIZE;
    document.querySelectorAll('.tab-btn[data-section]').forEach((button) => {
      const active = button.dataset.section === section;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    $('#section-title').textContent = section === 'Maths' ? 'Mathematics' : 'General Science';
    $('#section-description').textContent = section === 'Maths'
      ? 'Chapter-wise practice, ordered as in the source PDF.'
      : 'Choose a science subject or practise the full section.';
    $('#science-subjects').hidden = section !== 'Science';
    $('#notice').hidden = sectionQuestions().every((item) => !item.reviewRequired);
    updateTopicControls();
    render();
  }

  function setTheme(dark) {
    document.body.classList.toggle('dark', dark);
    $('#theme-toggle').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    $('.theme-glyph').textContent = dark ? '☀' : '☾';
    $('.theme-text').textContent = dark ? 'Light mode' : 'Dark mode';
    try { localStorage.setItem('alp-practice-theme', dark ? 'dark' : 'light'); } catch (_) { /* private browsing */ }
  }

  function initialize() {
    const mathCount = allQuestions.filter((item) => item.section === 'Maths').length;
    const scienceCount = allQuestions.filter((item) => item.section === 'Science').length;
    $('#stat-total').textContent = allQuestions.length.toLocaleString();
    $('#stat-maths').textContent = mathCount.toLocaleString();
    $('#stat-science').textContent = scienceCount.toLocaleString();
    $('#tab-maths small').textContent = `${mathCount} questions`;
    $('#tab-science small').textContent = `${scienceCount} questions`;

    document.querySelectorAll('.tab-btn[data-section]').forEach((button) => button.addEventListener('click', () => setSection(button.dataset.section)));
    document.querySelectorAll('.subject-chip').forEach((button) => button.addEventListener('click', () => {
      state.subject = button.dataset.subject;
      state.topic = '';
      state.shown = PAGE_SIZE;
      document.querySelectorAll('.subject-chip').forEach((chip) => chip.classList.toggle('active', chip === button));
      updateTopicControls();
      render();
    }));
    $('#topic-filter').addEventListener('change', (event) => {
      state.topic = event.target.value;
      state.shown = PAGE_SIZE;
      updateTopicControls();
      render();
    });
    $('#search').addEventListener('input', (event) => {
      state.query = event.target.value.trim().toLocaleLowerCase();
      state.shown = PAGE_SIZE;
      render();
    });
    $('#load-more').addEventListener('click', () => {
      state.shown += PAGE_SIZE;
      render();
    });
    $('#theme-toggle').addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));
    let dark = false;
    try { dark = localStorage.getItem('alp-practice-theme') === 'dark'; } catch (_) { /* private browsing */ }
    setTheme(dark);
    setSection('Maths');
  }

  if (!allQuestions.length) {
    $('#questions-grid').innerHTML = '<p>The question data could not be loaded. Check that the data folder is included with this site.</p>';
    return;
  }
  initialize();
})();
