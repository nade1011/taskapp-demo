document.addEventListener("DOMContentLoaded", () => {

  //--------------------------------------------------
  // UI 操作用の関数（あとで分離可能）
  //--------------------------------------------------


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


  //--------------------------------------------------
  // クリックイベント → まとめて1つに統合
  //--------------------------------------------------
  document.addEventListener("click", (e) => {

    const addBtn = e.target.closest(".btn--add-task");
    if (addBtn) {
      const list = document.querySelector(".task-list");
      const template = document.querySelector("#task-template");

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

   // --- タスク削除 ---
    const deleteBtn = e.target.closest(".btn--delete-task");
    if (deleteBtn) {
    const li = deleteBtn.closest(".task-item");
    const taskId = li.dataset.id; // ← ここ重要idで削除を見つける
    const project = appData.projects.find(p => p.id === appData.currentProjectId);
    const section = project.sections.find(s => s.id === appData.currentSectionId);

    // 対象タスク削除
    section.tasks = section.tasks.filter(t => t.id !== taskId);

    saveToStorage();
    renderUI();
    return;
    }


    if (e.target.closest(".js-task-title")) {
      startEditTitle(e.target.closest(".task-item"));
      return;
    }

    if (e.target.closest(".task-memo-wrapper")) {
      startEditMemo(e.target.closest(".task-item"));
      return;
    }

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

  });


  //--------------------------------------------------
  // Enterで確定イベント
  //--------------------------------------------------
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const titleInput = e.target.closest(".js-task-input");
    const memoInput = e.target.closest(".js-memo-input");

    if (titleInput) saveEditTitle(titleInput.closest(".task-item"));
    if (memoInput) saveEditMemo(memoInput.closest(".task-item"));
  });


}); 
