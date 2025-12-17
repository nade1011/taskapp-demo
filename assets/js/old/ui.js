// === DOM Mapping ===
const projectList = document.querySelector(".project-list");
const addProjectBtn = document.querySelector(".btn--add-project");

const workspaceProjectTitle = document.querySelector(".workspace-project-title");
const workspaceSectionTitle = document.querySelector(".workspace-section-title");

const taskList = document.querySelector(".task-list");
const addTaskBtn = document.querySelector(".btn--add-task");
const template = document.getElementById("task-template");


// =======================
// Render Controller
// =======================
function renderUI() {
  renderProjects();
  
  renderWorkspaceHeader();
  renderSections();
  renderTasks();
}

// =======================
// Projects
// =======================
function renderProjects(){
    
  // クリア
 projectList.innerHTML = `
  <li class="project-list-head">プロジェクト</li>
  <div class="project-controls">
      <button class="btn--export">エクスポート</button>
      <button class="btn--reset">初期化</button>
  </div>
`;


  // プロジェクト表示
  appData.projects.forEach(project => {
    const li = document.createElement("li");
    li.classList.add("project-list__item");
    li.dataset.projectId = project.id;

li.innerHTML = `
 <div class="project-header">
      <button class="btn--project-title js-project-title">${project.title}</button>
      <input type="text" class="js-project-input is-hidden" value="${project.title}">
      <button class="btn--project-edit">✎</button>
  </div>

  <ul class="section-list"></ul>
`;


    if (appData.currentProjectId === project.id) {
    li.classList.add("is-active");
    } else {
    li.classList.remove("is-active");
    }


    projectList.appendChild(li);
  });
}

function renderWorkspaceHeader() {
  const project = appData.projects.find(p => p.id === appData.currentProjectId);
  workspaceProjectTitle.textContent = project ? project.title : "プロジェクト未選択";

  if (!project) {
    workspaceSectionTitle.textContent = "";
    return;
  }

  const section = project.sections.find(s => s.id === appData.currentSectionId);
  workspaceSectionTitle.textContent = section ? section.title : "セクション未選択";
}

function saveProjectEdit(li) {
  const input = li.querySelector(".js-project-input");
  const titleBtn = li.querySelector(".js-project-title");
  const newValue = input.value.trim() || "名称未設定";

  // ローカルUI更新
  titleBtn.textContent = newValue;
  titleBtn.classList.remove("is-hidden");
  input.classList.add("is-hidden");

  // データ保存
  const projectId = li.dataset.projectId;
  const project = appData.projects.find(p => p.id === projectId);
  if (project) project.title = newValue;

  saveToStorage();

  // ←最後にUI描画
  renderUI();
}







// =======================
// Sections
// =======================
function renderSections() {
  const project = appData.projects.find(p => p.id === appData.currentProjectId);
  if (!project) return;

  const activeProjectEl = document.querySelector(`[data-project-id="${appData.currentProjectId}"]`);
  const sectionList = activeProjectEl.querySelector(".section-list");

  sectionList.innerHTML = `
   <li class="section-list-head">セクション</li>
   <li class="section-list__add">
      <button class="btn--add-section">＋セクションを追加</button>
   </li>
  `;

  project.sections.forEach(section => {
    const li = document.createElement("li");
    li.classList.add("section-list__item");
    li.dataset.sectionId = section.id;

    if (appData.currentSectionId === section.id) {
      li.classList.add("is-active");
    }

    li.innerHTML = `
      <div class="section-header">
        <button class="btn--section-title">${section.title}</button>
        <button class="btn--section-edit">✎</button>
        <button class="btn--delete-section">×</button>

        <input type="text" class="input input--section-edit is-hidden" value="${section.title}">
      </div>
    `;

    sectionList.appendChild(li);
  });
}


// =======================
// Section Editing
// =======================
function startEditSection(li) {
  const titleBtn = li.querySelector(".btn--section-title");
  const input = li.querySelector(".input--section-edit");

  titleBtn.classList.add("is-hidden");
  input.classList.remove("is-hidden");
  input.focus();
}

function saveEditSection(li) {
  const input = li.querySelector(".input--section-edit");
  const titleBtn = li.querySelector(".btn--section-title");
  const newValue = input.value.trim() || "名称未設定";

  // UI更新
  titleBtn.textContent = newValue;
  titleBtn.classList.remove("is-hidden");
  input.classList.add("is-hidden");

  // ーーー DB更新 ーーー
  const sectionId = li.dataset.sectionId;

  const project = appData.projects.find(p => p.id === appData.currentProjectId);
  const section = project.sections.find(s => s.id === sectionId);

  if (section) {
    section.title = newValue;
    saveToStorage();
  }

  renderUI();
}


// =======================
// Tasks
// =======================
function renderTasks() {
  // クリア
   taskList.innerHTML = "";

  const project = appData.projects.find(p => p.id === appData.currentProjectId);
  if (!project) return;

  const section = project.sections.find(s => s.id === appData.currentSectionId);
  if (!section) return;

 

  section.tasks.forEach(task => {
    const node = template.content.cloneNode(true);
    const li = node.querySelector(".task-item");

    // ★ ここを追加（タスクIDをDOMに埋め込む）
    li.dataset.id = task.id;

    // タイトル
    li.querySelector(".js-task-title").textContent = task.title;
    li.querySelector(".js-task-input").value = task.title;

    // メモ
    li.querySelector(".js-task-memo").textContent = task.memo ?? "";
    li.querySelector(".js-memo-input").value = task.memo ?? "";

    // ステータス
    const statusBtn = li.querySelector(".btn--status");
    statusBtn.textContent = task.status === "todo" ? "未" : task.status === "doing" ? "中" : "完";

    li.dataset.status = task.status;

    // ※ hidden解除
    li.classList.remove("is-hidden");

    // DOMへ
    taskList.appendChild(li);
  });
}


// =======================
// Add Section Logic
// =======================
function addSection() {
  const project = appData.projects.find(p => p.id === appData.currentProjectId);
  if (!project) return;

  const newSection = {
    id: crypto.randomUUID(),
    title: `Section ${project.sections.length + 1}`,
    tasks: []
  };

  project.sections.push(newSection);
  appData.currentSectionId = newSection.id; // ←選択状態にする

  saveToStorage();
  renderUI();
}


// =======================
// Events
// =======================
document.addEventListener("click", e => {

  // --- プロジェクト選択 ---
  const projectBtn = e.target.closest(".btn--project-title");
  if (projectBtn) {
    const li = projectBtn.closest(".project-list__item");
    const id = li.dataset.projectId;

    appData.currentProjectId = id;
    saveToStorage();
    renderUI();
    return;
  }

  // --- セクション選択 ---
const sectionBtn = e.target.closest(".btn--section-title");
if (sectionBtn) {
  const li = sectionBtn.closest(".section-list__item");
  const id = li.dataset.sectionId;

  appData.currentSectionId = id;
  saveToStorage();
  renderUI();
  return;
}

  // --- セクション追加 ---
  const addSectionBtn = e.target.closest(".btn--add-section");
  if (addSectionBtn) {
    addSection();
    return;
  }

});

document.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn--section-edit");
  if (!editBtn) return; // ←該当する時だけ発火

  const li = editBtn.closest(".section-list__item");
  if (!li) return; // ←ない場合は安全に抜ける

  startEditSection(li);
});


document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const input = e.target.closest(".input--section-edit");
  if (!input) return;

  const li = input.closest(".section-list__item");
  if (!li) return;

  saveEditSection(li);
});




// --- プロジェクト編集開始 ---
document.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn--project-edit");
  if (!editBtn) return;

  const li = editBtn.closest(".project-list__item");
  if (!li) return;

  const titleBtn = li.querySelector(".js-project-title");
  const input = li.querySelector(".js-project-input");

  if (!titleBtn || !input) {
    console.warn("⚠ UI mismatch: project title/input not found");
    return;
  }

  titleBtn.classList.add("is-hidden");
  input.classList.remove("is-hidden");
  input.focus();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const input = e.target.closest(".js-project-input");
  if (!input) return;

  const li = input.closest(".project-list__item");
  const newValue = input.value.trim() || "名称未設定";

  const projectId = li.dataset.projectId;
  const project = appData.projects.find(p => p.id === projectId);

  // データ更新
  project.title = newValue;
  saveToStorage();

  // 👉 ここ！UIを操作してから renderUI()
  input.classList.add("is-hidden");

  const titleBtn = li.querySelector(".btn--project-title");
  if (titleBtn) {
    titleBtn.textContent = newValue;
    titleBtn.classList.remove("is-hidden");
  }

  // 最後に UI 更新
  renderUI();
});



//インプット
document.addEventListener("input", e => {
  const li = e.target.closest(".task-item");
  if (!li) return;

  const taskId = li.dataset.id;

  const project = appData.projects.find(p => p.id === appData.currentProjectId);
  if (!project) return;

  const section = project.sections.find(s => s.id === appData.currentSectionId);
  if (!section) return;

  const task = section.tasks.find(t => t.id === taskId);
  if (!task) return;

  // --- タイトル変更 ---
  if (e.target.classList.contains("js-task-input")) {
    task.title = e.target.value;
    li.querySelector(".js-task-title").textContent = task.title;
  }

  // --- メモ変更 ---
  if (e.target.classList.contains("js-memo-input")) {
    task.memo = e.target.value;
    li.querySelector(".js-task-memo").textContent = task.memo;
  }

  saveToStorage();
});

//削除系
document.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".btn--delete-section");
  if (!deleteBtn) return;

  const li = deleteBtn.closest(".section-list__item");
  const sectionId = li.dataset.sectionId;

  const project = appData.projects.find(p => p.id === appData.currentProjectId);

  // そのセクション削除
  project.sections = project.sections.filter(s => s.id !== sectionId);

  // もし現在表示中のセクションが消えたらリセット
  if (appData.currentSectionId === sectionId) {
    appData.currentSectionId = project.sections[0]?.id || null;
  }

  saveToStorage();
  renderUI();
});
//reset
document.addEventListener("click", (e) => {
  const resetBtn = e.target.closest(".btn--reset");
  if (!resetBtn) return;

  if (!confirm("本当にリセットしますか？\n全ての内容が初期化されます。"))
    return;

  resetAppData();
  renderUI();
});



