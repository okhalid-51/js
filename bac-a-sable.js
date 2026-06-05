// ==================== ETAT ====================
const STORAGE_KEY = 'bac-a-sable-save';
let mode = 'web';           // 'web' | 'console'
let activeEditorTab = 'html';
let activeOutTab = 'preview';
let autoRun = true;
let debounceTimer = null;

const els = {
    html: document.getElementById('ed-html'),
    css: document.getElementById('ed-css'),
    js: document.getElementById('ed-js'),
    consoleJs: document.getElementById('ed-console-js'),
    preview: document.getElementById('preview'),
    consoleBox: document.getElementById('console-box'),
    editorTabs: document.getElementById('editor-tabs'),
    examples: document.getElementById('examples'),
    outPreviewTab: document.getElementById('out-preview-tab')
};

// ==================== CONTENU PAR DEFAUT ====================
const DEFAULTS = {
    html: '<h2>Bonjour Mayotte 👋</h2>\n<button id="btn">Cliquez-moi</button>\n<p id="message"></p>',
    css: 'body { font-family: sans-serif; padding: 20px; }\nbutton {\n  padding: 10px 18px;\n  font-size: 16px;\n  cursor: pointer;\n}\n#message { color: teal; font-weight: bold; margin-top: 12px; }',
    js: "const btn = document.getElementById('btn');\n\nbtn.addEventListener('click', () => {\n  document.getElementById('message').textContent = 'Bouton cliqué ! 🎉';\n});",
    consoleJs: "console.log('Bienvenue dans le bac à sable !');\n\nfor (let i = 1; i <= 3; i++) {\n  console.log('Ligne ' + i);\n}"
};

// ==================== EXEMPLES ====================
const WEB_EXAMPLES = {
    clic: {
        label: '🖱️ Événement click',
        html: '<h2>Bonjour Mayotte 👋</h2>\n<button id="btn">Cliquez-moi</button>\n<p id="message"></p>',
        css: 'body { font-family: sans-serif; padding: 20px; }\nbutton { padding: 10px 18px; font-size: 16px; cursor: pointer; }\n#message { color: teal; font-weight: bold; margin-top: 12px; }',
        js: "const btn = document.getElementById('btn');\n\nbtn.addEventListener('click', () => {\n  document.getElementById('message').textContent = 'Bouton cliqué ! 🎉';\n});"
    },
    survol: {
        label: '✨ Événement mouseover / mouseout',
        html: '<div id="zone">Passe ta souris ici</div>',
        css: 'body { font-family: sans-serif; padding: 20px; }\n#zone {\n  padding: 50px;\n  text-align: center;\n  font-size: 18px;\n  background: #eee;\n  border-radius: 14px;\n  transition: background 0.2s;\n  cursor: pointer;\n}',
        js: "const zone = document.getElementById('zone');\n\nzone.addEventListener('mouseover', () => {\n  zone.style.background = '#facc15';\n});\n\nzone.addEventListener('mouseout', () => {\n  zone.style.background = '#eee';\n});"
    },
    saisie: {
        label: '⌨️ Événement input',
        html: '<input id="champ" placeholder="Écris ton prénom">\n<p id="echo"></p>',
        css: 'body { font-family: sans-serif; padding: 20px; }\ninput { padding: 8px; font-size: 16px; width: 220px; }\n#echo { font-size: 22px; color: #7c3aed; margin-top: 14px; }',
        js: "const champ = document.getElementById('champ');\n\nchamp.addEventListener('input', (e) => {\n  document.getElementById('echo').textContent = 'Bonjour ' + e.target.value;\n});"
    },
    clavier: {
        label: '⌨️ Événement keydown',
        html: '<p>Appuie sur une touche du clavier ⌨️</p>\n<h1 id="touche">—</h1>',
        css: 'body { font-family: sans-serif; padding: 20px; text-align: center; }\n#touche { font-size: 70px; color: #06b6d4; }',
        js: "document.addEventListener('keydown', (e) => {\n  document.getElementById('touche').textContent = e.key;\n});"
    },
    formulaire: {
        label: '📤 Événement submit',
        html: '<form id="form">\n  <input id="nom" placeholder="Ton nom">\n  <button type="submit">Envoyer</button>\n</form>\n<p id="resultat"></p>',
        css: 'body { font-family: sans-serif; padding: 20px; }\ninput, button { padding: 8px; font-size: 15px; }\n#resultat { color: green; font-weight: bold; margin-top: 14px; }',
        js: "document.getElementById('form').addEventListener('submit', (e) => {\n  e.preventDefault();\n  const nom = document.getElementById('nom').value;\n  document.getElementById('resultat').textContent = 'Formulaire envoyé par ' + nom;\n});"
    }
};

const CONSOLE_EXAMPLES = {
    log: {
        label: '📝 console.log',
        js: "console.log('Hello !');\nconsole.log('JavaScript', 'est', 'génial');\nconsole.warn('Ceci est un avertissement');\nconsole.error('Ceci est une erreur');"
    },
    boucle: {
        label: '🔁 Boucle for',
        js: "for (let i = 1; i <= 5; i++) {\n  console.log('Itération n°' + i);\n}"
    },
    condition: {
        label: '⚖️ Condition if / else',
        js: "let age = 20;\n\nif (age >= 18) {\n  console.log('Majeur');\n} else {\n  console.log('Mineur');\n}"
    }
};

// ==================== TABS EDITEUR ====================
function switchEditorTab(tab) {
    activeEditorTab = tab;
    document.querySelectorAll('#editor-tabs .tab').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
    });
    els.html.classList.toggle('hidden-pane', tab !== 'html');
    els.css.classList.toggle('hidden-pane', tab !== 'css');
    els.js.classList.toggle('hidden-pane', tab !== 'js');
}

function switchOutTab(tab) {
    activeOutTab = tab;
    els.preview.classList.toggle('hidden-pane', tab !== 'preview');
    els.consoleBox.classList.toggle('hidden-pane', tab !== 'console');
    els.outPreviewTab.classList.toggle('active', tab === 'preview');
    document.getElementById('out-console-tab').classList.toggle('active', tab === 'console');
}

// ==================== MODE ====================
function switchMode(m) {
    mode = m;
    document.getElementById('mode-web').classList.toggle('active', m === 'web');
    document.getElementById('mode-console').classList.toggle('active', m === 'console');

    if (m === 'web') {
        els.editorTabs.classList.remove('hidden-pane');
        els.consoleJs.classList.add('hidden-pane');
        switchEditorTab(activeEditorTab === 'consoleJs' ? 'html' : activeEditorTab);
        els.outPreviewTab.classList.remove('hidden-pane');
        switchOutTab('preview');
    } else {
        // Console : un seul editeur JS, pas d'apercu
        els.editorTabs.classList.add('hidden-pane');
        els.html.classList.add('hidden-pane');
        els.css.classList.add('hidden-pane');
        els.js.classList.add('hidden-pane');
        els.consoleJs.classList.remove('hidden-pane');
        els.outPreviewTab.classList.add('hidden-pane');
        switchOutTab('console');
    }
    populateExamples();
    run();
    save();
}

// ==================== EXEMPLES (menu) ====================
function populateExamples() {
    const set = mode === 'web' ? WEB_EXAMPLES : CONSOLE_EXAMPLES;
    let html = '<option value="">&#x1F4D6; Charger un exemple…</option>';
    Object.keys(set).forEach(key => {
        html += `<option value="${key}">${set[key].label}</option>`;
    });
    els.examples.innerHTML = html;
    els.examples.value = '';
}

function loadExample(key) {
    if (!key) return;
    if (mode === 'web') {
        const ex = WEB_EXAMPLES[key];
        if (!ex) return;
        els.html.value = ex.html;
        els.css.value = ex.css;
        els.js.value = ex.js;
    } else {
        const ex = CONSOLE_EXAMPLES[key];
        if (!ex) return;
        els.consoleJs.value = ex.js;
    }
    els.examples.value = '';
    run();
    save();
}

// ==================== EXECUTION ====================
// Script injecte dans l'iframe pour renvoyer les console.* au parent.
const CAPTURE = '<scr' + 'ipt>(function(){' +
    'function send(t,a){try{parent.postMessage({__sb:1,t:t,m:Array.prototype.slice.call(a).map(function(x){' +
    'try{return (typeof x==="object"&&x!==null)?JSON.stringify(x):String(x);}catch(e){return String(x);}}).join(" ")},"*");}catch(e){}}' +
    '["log","info","warn","error"].forEach(function(k){var o=console[k];console[k]=function(){send(k,arguments);try{o.apply(console,arguments);}catch(e){}};});' +
    'window.addEventListener("error",function(e){send("error",[e.message]);});' +
    'window.addEventListener("unhandledrejection",function(e){send("error",[String(e.reason)]);});' +
    '})();<\/scr' + 'ipt>';

function buildDoc() {
    if (mode === 'web') {
        return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">' +
            '<style>' + els.css.value + '</style></head><body>' +
            els.html.value + CAPTURE + '<scr' + 'ipt>' + els.js.value + '<\/scr' + 'ipt>' +
            '</body></html>';
    }
    // console : pas de HTML/CSS, juste le JS + la capture
    return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head><body>' +
        CAPTURE + '<scr' + 'ipt>' + els.consoleJs.value + '<\/scr' + 'ipt></body></html>';
}

function run() {
    clearConsole(false);
    // Recreer le srcdoc relance entierement le code (ecouteurs reattaches a neuf)
    els.preview.srcdoc = buildDoc();
}

// Re-execution automatique (live) avec anti-rebond
function scheduleRun() {
    if (!autoRun) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 450);
}

function onAutoToggle() {
    autoRun = document.getElementById('auto-run').checked;
    if (autoRun) run();
}

// ==================== CONSOLE ====================
let consoleEmpty = true;

function clearConsole(showPlaceholder) {
    els.consoleBox.innerHTML = '';
    consoleEmpty = true;
    if (showPlaceholder) renderEmptyPlaceholder();
}

function renderEmptyPlaceholder() {
    if (consoleEmpty) {
        els.consoleBox.innerHTML = '<div class="c-line c-empty">// La sortie de console.log() s\'affiche ici…</div>';
    }
}

function appendConsole(type, text) {
    if (consoleEmpty) { els.consoleBox.innerHTML = ''; consoleEmpty = false; }
    const cls = { log: 'c-log', info: 'c-info', warn: 'c-warn', error: 'c-error' }[type] || 'c-log';
    const badge = { warn: '⚠ warn', error: '✖ error', info: 'info' }[type] || '';
    const line = document.createElement('div');
    line.className = 'c-line ' + cls;
    line.textContent = (badge ? badge + '  ' : '') + text;
    els.consoleBox.appendChild(line);
    els.consoleBox.scrollTop = els.consoleBox.scrollHeight;
}

window.addEventListener('message', function(e) {
    const d = e.data;
    if (!d || d.__sb !== 1) return;
    appendConsole(d.t, d.m);
});

// ==================== SAUVEGARDE ====================
function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            mode: mode,
            html: els.html.value,
            css: els.css.value,
            js: els.js.value,
            consoleJs: els.consoleJs.value
        }));
    } catch (e) {}
}

function load() {
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (!raw) {
        els.html.value = DEFAULTS.html;
        els.css.value = DEFAULTS.css;
        els.js.value = DEFAULTS.js;
        els.consoleJs.value = DEFAULTS.consoleJs;
        return;
    }
    let s;
    try { s = JSON.parse(raw); } catch (e) { return; }
    els.html.value = s.html != null ? s.html : DEFAULTS.html;
    els.css.value = s.css != null ? s.css : DEFAULTS.css;
    els.js.value = s.js != null ? s.js : DEFAULTS.js;
    els.consoleJs.value = s.consoleJs != null ? s.consoleJs : DEFAULTS.consoleJs;
    mode = s.mode === 'console' ? 'console' : 'web';
}

function resetAll() {
    if (!confirm('Réinitialiser tout le code du bac à sable ?')) return;
    els.html.value = DEFAULTS.html;
    els.css.value = DEFAULTS.css;
    els.js.value = DEFAULTS.js;
    els.consoleJs.value = DEFAULTS.consoleJs;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    run();
    save();
}

// ==================== TOUCHE TAB DANS LES EDITEURS ====================
function handleTab(e) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = e.target;
    const start = ta.selectionStart, end = ta.selectionEnd;
    ta.value = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
    ta.selectionStart = ta.selectionEnd = start + 2;
}

// ==================== INITIALISATION ====================
[els.html, els.css, els.js, els.consoleJs].forEach(ta => {
    ta.addEventListener('input', () => { scheduleRun(); save(); });
    ta.addEventListener('keydown', handleTab);
});

load();
switchMode(mode);   // applique l'affichage + populateExamples + run
