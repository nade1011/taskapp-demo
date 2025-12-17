document.addEventListener("DOMContentLoaded", () => {

  // ==============================
  // DOM Mapping
  // ==============================
  const projectList = document.querySelector(".project-list");
  const addProjectBtn = document.querySelector(".btn--add-project");

  const workspaceProjectTitle = document.querySelector(".workspace-project-title");
  const workspaceSectionTitle = document.querySelector(".workspace-section-title");

  const taskList = document.querySelector(".task-list");
  const addTaskBtn = document.querySelector(".btn--add-task");
  const template = document.getElementById("task-template");

  // ==============================
  // Render Controller
  // ==============================
  function renderUI() {
    renderProjects();
    renderWorkspaceHeader();
    renderSections();
    renderTasks();

    
  }

  // ==============================
  // Projects
  // ==============================
  function renderProjects() {
    projectList.innerHTML = `
      <li class="project-list-head" data-design="nav-listHead">プロジェクト</li>
      <div class="project-controls" data-space="project-controls-bottom">
          <button class="btn--export" data-frame="btn-export-reset" data-design="btn-export-reset" data-spMarginBottom="btn--export">エクスポート</button>
          <button class="btn--reset" data-frame="btn-export-reset" data-design="btn-export-reset">初期化</button>
      </div>
    `;

    appData.projects.forEach(project => {
      const li = document.createElement("li");
      li.classList.add("project-list__item");
      li.dataset.projectId = project.id;

      li.innerHTML = `
        <div class="project-header" data-space="project-header-bottom">
            <button class="btn--project-title js-project-title">${project.title}</button>
            <input type="text" class="js-project-input is-hidden" value="${project.title}">
            <button class="btn--project-edit">✎</button>
        </div>
        <ul class="section-list"></ul>
      `;

      if (appData.currentProjectId === project.id) {
        li.classList.add("is-active");
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
    workspaceSectionTitle.textContent = section ? section.title : "セクション未選択(セクションを追加してください)";
  }

  function saveProjectEdit(li) {
    const input = li.querySelector(".js-project-input");
    const titleBtn = li.querySelector(".js-project-title");
    const newValue = input.value.trim() || "名称未設定";

    titleBtn.textContent = newValue;
    titleBtn.classList.remove("is-hidden");
    input.classList.add("is-hidden");

    const projectId = li.dataset.projectId;
    const project = appData.projects.find(p => p.id === projectId);
    if (project) project.title = newValue;

    saveToStorage();
    renderUI();
  }

  // ==============================
  // Sections
  // ==============================
  //section 制限
  const maxSections = 3;
  function canAddSection(project) {
    return project.sections.length < maxSections;
  }
  



  function renderSections() {
    const project = appData.projects.find(p => p.id === appData.currentProjectId);
    if (!project) return;

    const activeProjectEl = document.querySelector(`[data-project-id="${appData.currentProjectId}"]`);
    const sectionList = activeProjectEl.querySelector(".section-list");

    sectionList.innerHTML = `
      <li class="section-list-head" data-design="nav-listHead">セクション</li>
      <li class="section-list__add" data-space="section-list__add-bottom">
          <button class="btn--add-section" data-frame="btn-add-section" data-design="btn-add-section">＋セクションを追加</button>
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
          <button class="btn--delete-section" data-frame="btn-delete-project-section" data-design="btn-delete-project-section">×</button>
          <input type="text" class="input input--section-edit is-hidden" value="${section.title}">
        </div>
      `;

      sectionList.appendChild(li);
    });
  }

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

    titleBtn.textContent = newValue;
    titleBtn.classList.remove("is-hidden");
    input.classList.add("is-hidden");

    const sectionId = li.dataset.sectionId;
    const project = appData.projects.find(p => p.id === appData.currentProjectId);
    const section = project.sections.find(s => s.id === sectionId);

    if (section) {
      section.title = newValue;
      saveToStorage();
    }

    renderUI();
  }

  function addSection() {
    const project = appData.projects.find(p => p.id === appData.currentProjectId);
    if (!project) return;

    if (!canAddSection(project)) {
      alert(`セクションは最大${maxSections}つまで追加可能です。`);
      return;
    }

    const newSection = {
      id: crypto.randomUUID(),
      title: `Section ${project.sections.length + 1}`,
      tasks: []
    };

    project.sections.push(newSection);
    appData.currentSectionId = newSection.id;

    saveToStorage();
    renderUI();
  }

  // ==============================
  // Tasks
  // ==============================
  function renderTasks() {
    taskList.innerHTML = "";

    const project = appData.projects.find(p => p.id === appData.currentProjectId);
    if (!project) return;

    const section = project.sections.find(s => s.id === appData.currentSectionId);
    if (!section) return;

    section.tasks.forEach(task => {
      const node = template.content.cloneNode(true);
      const li = node.querySelector(".task-item");

      li.dataset.id = task.id;

      li.querySelector(".js-task-title").textContent = task.title;
      li.querySelector(".js-task-input").value = task.title;

      li.querySelector(".js-task-memo").textContent = task.memo ?? "";
      li.querySelector(".js-memo-input").value = task.memo ?? "";

      const statusBtn = li.querySelector(".btn--status");
      statusBtn.textContent = task.status === "todo" ? "未" : task.status === "doing" ? "中" : "完";

      li.dataset.status = task.status;
      li.classList.remove("is-hidden");

      taskList.appendChild(li);
    });
  }



  // ==============================
  // Task Editing (Title & Memo)
  // ==============================
  function startEditTitle(item) {
    const title = item.querySelector(".js-task-title");
    const input = item.querySelector(".js-task-input");

    title.classList.add("is-hidden");
    input.classList.remove("is-hidden");
    input.focus();
  }

  function saveEditTitle(item) {
    const title = item.querySelector(".js-task-title");
    const input = item.querySelector(".js-task-input");
    const newValue = input.value.trim() || "新しいタスク";

    title.textContent = newValue;
    title.classList.remove("is-hidden");
    input.classList.add("is-hidden");

    const taskId = item.dataset.id;

    const project = appData.projects.find(p => p.id === appData.currentProjectId);
    const section = project.sections.find(s => s.id === appData.currentSectionId);
    const task = section.tasks.find(t => t.id === taskId);

    if (task) {
      task.title = newValue;
      saveToStorage();
      renderUI();
    }
  }

  function startEditMemo(item) {
    const memo = item.querySelector(".js-task-memo");
    const input = item.querySelector(".js-memo-input");

    memo.classList.add("is-hidden");
    input.classList.remove("is-hidden");
    input.focus();
  }

  function saveEditMemo(item) {
    const memo = item.querySelector(".js-task-memo");
    const input = item.querySelector(".js-memo-input");
    const newValue = input.value.trim();

    memo.textContent = newValue;
    memo.classList.remove("is-hidden");
    input.classList.add("is-hidden");

    const taskId = item.dataset.id;

    const project = appData.projects.find(p => p.id === appData.currentProjectId);
    const section = project.sections.find(s => s.id === appData.currentSectionId);
    const task = section.tasks.find(t => t.id === taskId);

    if (task) {
      task.memo = newValue;
      saveToStorage();
      renderUI();
    }
  }

  // ==============================
  // Events
  // ==============================
  document.addEventListener("click", (e) => {
    // プロジェクト選択
    const projectBtn = e.target.closest(".btn--project-title");
    if (projectBtn) {
      const li = projectBtn.closest(".project-list__item");
      const id = li.dataset.projectId;

      appData.currentProjectId = id;
      saveToStorage();
      renderUI();
      return;
    }

    // セクション選択
    const sectionBtn = e.target.closest(".btn--section-title");
    if (sectionBtn) {
      const li = sectionBtn.closest(".section-list__item");
      const id = li.dataset.sectionId;

      appData.currentSectionId = id;
      saveToStorage();
      renderUI();
      return;
    }

    // セクション追加
    const addSectionBtn = e.target.closest(".btn--add-section");
    if (addSectionBtn) {
      addSection();
      return;
    }

    // 編集開始（セクション）
    const editSectionBtn = e.target.closest(".btn--section-edit");
    if (editSectionBtn) {
      startEditSection(editSectionBtn.closest(".section-list__item"));
      return;
    }

    // 削除（セクション）
    const deleteSectionBtn = e.target.closest(".btn--delete-section");
    if (deleteSectionBtn) {
      const li = deleteSectionBtn.closest(".section-list__item");
      const sectionId = li.dataset.sectionId;

      const project = appData.projects.find(p => p.id === appData.currentProjectId);
      project.sections = project.sections.filter(s => s.id !== sectionId);

      if (appData.currentSectionId === sectionId) {
        appData.currentSectionId = project.sections[0]?.id || null;
      }

      saveToStorage();
      renderUI();
      return;
    }

    // 編集開始（プロジェクト）
    const editProjectBtn = e.target.closest(".btn--project-edit");
    if (editProjectBtn) {
      const li = editProjectBtn.closest(".project-list__item");
      const titleBtn = li.querySelector(".js-project-title");
      const input = li.querySelector(".js-project-input");

      titleBtn.classList.add("is-hidden");
      input.classList.remove("is-hidden");
      input.focus();
      return;
    }

    // ========================
    // タスク系の判定ブロック
    // ========================

    // 新規タスク
    const addTask = e.target.closest(".btn--add-task");
    if (addTask) {
      const list = document.querySelector(".task-list");
      const clone = template.content.cloneNode(true);
      const newTask = clone.querySelector(".task-item");

      const taskData = {
        id: crypto.randomUUID(),
        title: "新しいタスク",
        memo: "メモ編集",
        status: "todo"
      };

      newTask.dataset.id = taskData.id;
      newTask.dataset.status = taskData.status;
      newTask.querySelector(".task-title").textContent = taskData.title;
      newTask.querySelector(".task-memo").textContent = taskData.memo;
      newTask.querySelector(".js-task-input").value = taskData.title;
      newTask.querySelector(".js-memo-input").value = taskData.memo;

      list.appendChild(newTask);

      const project = appData.projects.find(p => p.id === appData.currentProjectId);
      const section = project.sections.find(s => s.id === appData.currentSectionId);

      if (!section) {
        alert("セクションが選択されていません。");
        return;
      }

      section.tasks.push(taskData);

      saveToStorage();
      renderUI();
      return;
    }

    // タスク削除
    const deleteTaskBtn = e.target.closest(".btn--delete-task");
    if (deleteTaskBtn) {
      const li = deleteTaskBtn.closest(".task-item");
      const taskId = li.dataset.id;

      const project = appData.projects.find(p => p.id === appData.currentProjectId);
      const section = project.sections.find(s => s.id === appData.currentSectionId);

      section.tasks = section.tasks.filter(t => t.id !== taskId);

      saveToStorage();
      renderUI();
      return;
    }

    // タスク編集開始（タイトル）
    if (e.target.closest(".js-task-title")) {
      startEditTitle(e.target.closest(".task-item"));
      return;
    }

    // 編集開始（メモ）
    if (e.target.closest(".task-memo-wrapper")) {
      startEditMemo(e.target.closest(".task-item"));
      return;
    }

    // ステータス変更
    const statusBtn = e.target.closest(".btn--status");
    if (statusBtn) {
      const task = statusBtn.closest(".task-item");
      const taskId = task.dataset.id;

      const project = appData.projects.find(p => p.id === appData.currentProjectId);
      const section = project.sections.find(s => s.id === appData.currentSectionId);
      const itemData = section.tasks.find(t => t.id === taskId);

      if (itemData) {
        const current = itemData.status;
        const next = current === "todo" ? "doing" : current === "doing" ? "done" : "todo";

        itemData.status = next;

        task.dataset.status = next;
        statusBtn.textContent =
          next === "todo" ? "未" : next === "doing" ? "中" : "完";

        saveToStorage();
        renderUI();
      }

      return;
    }

    // リセット
    const resetBtn = e.target.closest(".btn--reset");
    if (resetBtn) {
      if (!confirm("本当にリセットしますか？\n全ての内容が初期化されます。")) return;
      resetAppData();
      renderUI();
      return;
    }
    // エクスポート
    const exportBtn = e.target.closest(".btn--export");
    if (!exportBtn) return;

    exportCurrentProject();
    resetAppData();
      renderUI();
});



  // ==============================
  // Enter 確定
  // ==============================
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const titleInput = e.target.closest(".js-project-input");
    const sectionInput = e.target.closest(".input--section-edit");
    const taskTitleInput = e.target.closest(".js-task-input");
    const memoInput = e.target.closest(".js-memo-input");

    if (titleInput) saveProjectEdit(titleInput.closest(".project-list__item"));
    if (sectionInput) saveEditSection(sectionInput.closest(".section-list__item"));
    if (taskTitleInput) saveEditTitle(taskTitleInput.closest(".task-item"));
    if (memoInput) saveEditMemo(memoInput.closest(".task-item"));
  });

  // ==============================
  // Input変更 → 自動保存
  // ==============================
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

    if (e.target.classList.contains("js-task-input")) {
      task.title = e.target.value;
      li.querySelector(".js-task-title").textContent = task.title;
    }

    if (e.target.classList.contains("js-memo-input")) {
      task.memo = e.target.value;
      li.querySelector(".js-task-memo").textContent = task.memo;
    }

    saveToStorage();
  });

  // ------------------------------
  // 初回 UI描画
  // ------------------------------
  renderUI();
});
