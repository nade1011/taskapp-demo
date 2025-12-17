let currentView = "project"; 
let currentProjectId = null;
let currentSectionId = null;

function setView(view, projectId = null, sectionId = null) {
  currentView = view;
  currentProjectId = projectId;
  currentSectionId = sectionId;

  console.log("📍 View切替:", { view, projectId, sectionId });

  renderUI(); // ← UI側が view に応じて描画変える
}
