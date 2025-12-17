
//--------------------------------------------------
// 初期プロジェクト生成（初回・リセット用）
//--------------------------------------------------
function createInitialAppData() {
  const projectId = crypto.randomUUID();
  const sectionId = crypto.randomUUID();

  return {
    projects: [
      {
        id: projectId,
        title: "My Project",
        sections: [
          {
            id: sectionId,
            title: "section 1",
            tasks: []
          }
        ]
      }
    ],
    currentProjectId: projectId,
    currentSectionId: sectionId
  };
}





//--------------------------------------------------
// アプリ全体データ（新仕様）
//--------------------------------------------------
let appData = {
  currentProjectId: null,
  currentSectionId: null,
  projects: []
};


//--------------------------------------------------
// 保存
//--------------------------------------------------
function saveToStorage() {
  try {
    const json = JSON.stringify(appData);
    localStorage.setItem("appData", json);
    console.log("💾 保存OK:", appData);
  } catch (e) {
    console.error("❌ 保存エラー", e);
  }
}
// =====================
// Export (Archive保存)
// =====================
function exportCurrentProject() {
  if (!appData.currentProjectId) return alert("⚠ プロジェクトを選択してください。");

  const project = appData.projects.find(p => p.id === appData.currentProjectId);
  if (!project) return alert("⚠ データが見つかりません。");

  const archive = JSON.parse(localStorage.getItem("archiveProjects") || "[]");

  // ---- コピー作成 ----
  const projectCopy = structuredClone(project);

  // ★★★ ここで新しいIDを発行 ★★★
  projectCopy.id = crypto.randomUUID();
  // さらにセクション・タスクにもIDがあるなら全部新しくした方が良い
  projectCopy.sections.forEach(section => {
    section.id = crypto.randomUUID();
    section.tasks.forEach(task => {
      task.id = crypto.randomUUID();
    });
  });

  // ---- 保存日時 ----
  projectCopy.updatedAt = new Date().toLocaleString("ja-JP", {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  projectCopy.updatedAt = new Date().toISOString();

  archive.push(projectCopy);
  localStorage.setItem("archiveProjects", JSON.stringify(archive));
  


  alert(`📦 '${project.title}' をアーカイブに保存しました。`);
}


//--------------------------------------------------
// 🔄 初期化リセット関数
//--------------------------------------------------
function resetAppData() {
 appData = createInitialAppData();
  saveToStorage();
}

//--------------------------------------------------
// 読み込み
//--------------------------------------------------
function loadFromStorage() {
  try {
    const json = localStorage.getItem("appData");
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    console.error("❌ 読み込みエラー", e);
    return null;
  }
}


//--------------------------------------------------
// データ移行処理（旧→新）
//--------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const stored = loadFromStorage();

  if (stored) {
    appData = stored;

    // ⭐ ここで古いデータを補正する
    appData.projects.forEach(project => {
      if (!project.sections) {
        project.sections = [];
      }

      project.sections.forEach(section => {
        if (!section.id) {
          section.id = crypto.randomUUID();
        }
        if (!section.tasks) {
          section.tasks = [];
        }
      });
    });

    // セクション選択が何もない状態なら、とりあえず先頭を選ぶ
    if (!appData.currentProjectId && appData.projects[0]) {
      appData.currentProjectId = appData.projects[0].id;
    }
    const currentProject = appData.projects.find(
      p => p.id === appData.currentProjectId
    );
    if (currentProject && !appData.currentSectionId && currentProject.sections[0]) {
      appData.currentSectionId = currentProject.sections[0].id;
    }
    if (currentProject && currentProject.sections.length === 0) {
    const sectionId = crypto.randomUUID();
    currentProject.sections.push({
      id: sectionId,
      title: "section 1",
      tasks: []
    });
    appData.currentSectionId = sectionId;
  }


    console.log("📦 既存データ復元＆ID補正", appData);
  } else {
    appData = createInitialAppData();
    saveToStorage();
    console.log("✨ 初回起動：初期プロジェクト生成", appData);
  }


});


