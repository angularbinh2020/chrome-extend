//@ts-check
const CONFIG = {
  TIME_INTERVAL: 300,
  EXPORT_ID: "EXPORT_ID",
  XLSX_SCRIPT_ID: "XLSX_SCRIPT_ID",
  LOADING_CONTAINER_ID: "LOADING_CONTAINER_ID",
  LOADING_PROCESS_ID: "LOADING_PROCESS_ID",
};

function getVideosUrl() {
  return Array.from(
    document.querySelectorAll(
      `[data-e2e="user-post-item-list"] [data-e2e="user-post-item-desc"] a[href^="${location.href}"]`
    ),
    (element) => element.href
  );
}

function setLoadingProcess(innerText = "") {
  const processElement = document.getElementById(CONFIG.LOADING_PROCESS_ID);
  if (processElement) {
    processElement.innerText = innerText;
  }
}

async function getVideoMeta(url) {
  try {
    const res = await fetch(url);
    const rawHtmlText = await res.text();
    const objectString = rawHtmlText
      .split('<script id="SIGI_STATE" type="application/json">')[1]
      .split("</script>")[0];
    const appContext = JSON.parse(objectString);
    const videoId = url.split("/").slice(-1);
    const videoInfo = appContext.ItemModule[videoId];
    const hashtag =
      videoInfo?.textExtra
        ?.filter((content) => content.hashtagName)
        ?.map((content) => "#" + content.hashtagName)
        ?.join(" ") ?? "";
    return {
      link: url,
      title: videoInfo?.desc ?? "",
      view: videoInfo?.stats?.playCount ?? 0,
      love: videoInfo?.stats?.diggCount ?? 0,
      comment: videoInfo?.stats?.commentCount ?? 0,
      save: Number(videoInfo?.stats?.collectCount ?? 0),
      caption:
        videoInfo?.contents?.map((content) => content.desc)?.join(" ") ?? "",
      hashtag,
    };
  } catch (e) {
    return { error: e };
  }
}

async function getVideosMeta(urls) {
  return new Promise((resolve) => {
    let videoIndex = 0;
    const videos = [];
    const getMetaData = async () => {
      const videoUrl = urls[videoIndex];
      if (videoUrl) {
        const video = await getVideoMeta(videoUrl);
        videos.push(video);
        setLoadingProcess(
          `Tải dữ liệu video: ${videoIndex + 1} / ${urls.length}`
        );
        videoIndex++;
        getMetaData();
        return;
      }
      resolve(videos);
    };
    getMetaData();
  });
}

function exportToFile(videos) {
  const aoa = [
    ["Link", "Title", "View", "Love", "Comment", "Save", "Caption", "Hashtag"],
  ];
  videos.forEach((video) => {
    if (!video.error)
      aoa.push([
        video.link,
        video.title,
        video.view,
        video.love,
        video.comment,
        video.save,
        video.caption,
        video.hashtag,
      ]);
  });
  const timeCreate = new Date().getTime();
  var ws = XLSX.utils.aoa_to_sheet(aoa);
  var wb = XLSX.utils.book_new();
  const profileName = location.pathname.split("@").pop();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${profileName}_${timeCreate}.xlsx`);
}

function showLoadingView() {
  if (!document.getElementById(CONFIG.LOADING_CONTAINER_ID)) {
    const loadingContainer = document.createElement("div");
    const loadingProcess = document.createElement("div");
    loadingContainer.setAttribute("id", CONFIG.LOADING_CONTAINER_ID);
    loadingProcess.setAttribute("id", CONFIG.LOADING_PROCESS_ID);
    loadingContainer.setAttribute(
      "style",
      `display: flex;
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    justify-content: center;
    align-items: center;
    background-color: #0000008c;
    z-index: 1000;`
    );
    loadingProcess.setAttribute("style", "color: white; font-weight: 600;");
    loadingProcess.innerText = "Đang tải danh sách videos...";
    loadingContainer.appendChild(loadingProcess);
    document.body.appendChild(loadingContainer);
  }
}

function closeLoadingView() {
  document.getElementById(CONFIG.LOADING_CONTAINER_ID)?.remove();
}

async function exportData() {
  showLoadingView();
  await scrollDownLoadAllVideos();
  const urls = getVideosUrl();
  setLoadingProcess(`Xuất file excel...`);
  const videos = await getVideosMeta(urls);
  exportToFile(videos);
  closeLoadingView();
}

async function scrollDownLoadAllVideos() {
  return new Promise((resolve) => {
    var totalHeight = 0;
    var distance = 100;
    var timer = setInterval(() => {
      var scrollHeight = document.body.scrollHeight;
      window.scrollBy(0, distance);
      totalHeight += distance;

      if (totalHeight >= scrollHeight) {
        clearInterval(timer);
        resolve(null);
      }
    }, CONFIG.TIME_INTERVAL);
  });
}

if (!document.getElementById(CONFIG.EXPORT_ID)) {
  const exportBtn = document.createElement("button");
  exportBtn.innerText = "Export data";
  exportBtn.setAttribute(
    "style",
    "background-color: #f72247a3;color: white;position: fixed;top: 150px;right: 25px;cursor: pointer;display: flex;justify-content: center;align-items: center;width: 4rem;height: 4rem;border-radius: 2rem;border: 1px solid;"
  );
  exportBtn.setAttribute("id", CONFIG.EXPORT_ID);
  exportBtn.addEventListener("click", exportData);
  document.body.appendChild(exportBtn);
}
