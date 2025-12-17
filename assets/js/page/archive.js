// ======================
// アーカイブレンダリング（全体保存対応）
// ======================

// ======================
// アーカイブレンダリング（IDベース）
// ======================
function renderArchive() {
  const container = document.querySelector(".archive-list");
  container.innerHTML = "";

  const archive = JSON.parse(localStorage.getItem("archiveProjects")) || [];

  if (archive.length === 0) {
    container.innerHTML = `<p style="opacity:.6;">保存されたデータはありません。</p>`;
    return;
  }

  // ★ 表示用にコピーしてソート（実体は触らない）
  const sortedArchive = [...archive].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime() || 0;
    const timeB = new Date(b.updatedAt).getTime() || 0;
    return timeB - timeA;
  });

  sortedArchive.forEach(data => {
    const projectTitle = data.title || "名称未設定";

    const totalTasks = data.sections
      ? data.sections.flatMap(s => s.tasks).length
      : 0;

    const todoCount = data.sections
      ? data.sections.flatMap(s => s.tasks).filter(t => t.status !== "done").length
      : 0;

    const timestamp = data.updatedAt
      ? new Date(data.updatedAt).toLocaleString("ja-JP", {
          year: "2-digit",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "日時なし";

    // DOM生成
      const card = document.createElement("div");
      card.classList.add("archive-card"); 
        
      card.dataset.projectId = data.id;
      card.dataset.frame = "archive-card";
      card.dataset.flex = "archive-card"; 
      card.dataset.gap = "archive-card"; 
      card.dataset.padding = "archive-card-block";
      card.dataset.margin = "archive-card-bottom";
      card.dataset.design = "archive-card";
        


    card.innerHTML = `
      <p class="log">保存日: ${timestamp}</p>
       <h3 class="project-title" data-design="project-title-archive">${projectTitle}</h3> 
       <p class="task-count">総タスク: ${totalTasks}</p>
        <p class="todo-count">未完了: ${todoCount}</p>
        <div class="btn-wrapper" data-frame="archive-btn-wrapper" data-flex="archive-btn-wrapper" data-gap="archive-btn-wrapper">
         <button class="import-btn"  data-project-id="${data.id}" data-frame="archive-btn" data-design="archive-btn">インポート</button>
          <button class="delete-btn"  data-project-id="${data.id}" data-frame="archive-btn" data-design="archive-btn">削除</button> 
          </div>
    `;

    container.appendChild(card);
  });
}


// ======================
// Import 処理（ワークスペースへ復元）
// ======================
 //section 制限
  const maxSections = 3;
  function canAddSection(project) {
    return project.sections.length < maxSections;
  }
  //保守
  function sanitizeSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.slice(0, maxSections);
  }

function importProject(projectId) {
  const archive = JSON.parse(localStorage.getItem("archiveProjects")) || [];
  const target = archive.find(p => p.id === projectId);

  if (!target) {
    alert("⚠ データが見つかりません。");
    return;
  }

  const cloned = structuredClone(target);
  cloned.id = crypto.randomUUID();

  cloned.sections = sanitizeSections(cloned.sections);
  cloned.sections.forEach(section => {
    section.id = crypto.randomUUID();
    section.tasks.forEach(task => {
      task.id = crypto.randomUUID();
    });
  });

  const newAppData = {
    projects: [cloned],
    currentProjectId: cloned.id,
    currentSectionId: cloned.sections?.[0]?.id ?? null
  };

  localStorage.setItem("appData", JSON.stringify(newAppData));

  alert(`📂 '${target.title}' をワークスペースに復元しました。`);
  window.location.href = "../workspace/index.html";
}





// ======================
// 削除処理（indexベース）
// ======================
document.addEventListener("click", e => {
  const deleteBtn = e.target.closest(".delete-btn");
  if (!deleteBtn) return;

  const projectId = deleteBtn.dataset.projectId;
  let archive = JSON.parse(localStorage.getItem("archiveProjects")) || [];

  archive = archive.filter(p => p.id !== projectId);

  localStorage.setItem("archiveProjects", JSON.stringify(archive));
  renderArchive();
});


// ======================
// Import (ワークスペースへリストア)
// ======================
document.addEventListener("click", e => {
  const importBtn = e.target.closest(".import-btn");
  if (!importBtn) return;

  const projectId = importBtn.dataset.projectId;
  importProject(projectId);
});





// ======================
// 初期ロード
// ======================
document.addEventListener("DOMContentLoaded", () => {
  renderArchive();
});
